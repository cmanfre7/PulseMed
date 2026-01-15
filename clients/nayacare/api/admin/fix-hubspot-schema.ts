import type { VercelRequest, VercelResponse } from '@vercel/node';

const HUBSPOT_ACCESS_TOKEN = process.env.HUBSPOT_ACCESS_TOKEN;
const OBJECT_TYPE_ID = '2-174458678';

/**
 * Fix HubSpot text_content Property
 * GET /api/admin/fix-hubspot-schema
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const logs: string[] = [];

    // Check if property exists
    logs.push('🔍 Checking if text_content property exists...');

    const getResponse = await fetch(
      `https://api.hubapi.com/crm/v3/properties/${OBJECT_TYPE_ID}/text_content`,
      {
        headers: {
          'Authorization': `Bearer ${HUBSPOT_ACCESS_TOKEN}`
        }
      }
    );

    if (getResponse.status === 404) {
      logs.push('❌ text_content property does NOT exist!');
      logs.push('📝 Creating it now...');

      // Create the property
      const createResponse = await fetch(
        `https://api.hubapi.com/crm/v3/properties/${OBJECT_TYPE_ID}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${HUBSPOT_ACCESS_TOKEN}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: 'text_content',
            label: 'Text Content',
            type: 'string',
            fieldType: 'textarea',
            groupName: 'knowledge_base_documentsinformation',
            description: 'Extracted PDF text content (OCR or text-based extraction)',
            formField: true,
            hasUniqueValue: false
          })
        }
      );

      if (!createResponse.ok) {
        const errorText = await createResponse.text();
        logs.push(`❌ Failed to create property: ${createResponse.status}`);
        logs.push(errorText);
        return res.status(500).json({ success: false, logs, error: errorText });
      }

      const created = await createResponse.json();
      logs.push('✅ text_content property created successfully!');
      logs.push(`   Name: ${created.name}`);
      logs.push(`   Type: ${created.type}`);
      logs.push(`   Field Type: ${created.fieldType}`);

      return res.status(200).json({
        success: true,
        action: 'created',
        property: created,
        logs,
        message: 'text_content property created! Now re-upload your PDFs to save the extracted text.'
      });

    } else if (getResponse.ok) {
      const currentProp = await getResponse.json();
      logs.push('✅ Property already exists:');
      logs.push(`   Name: ${currentProp.name}`);
      logs.push(`   Type: ${currentProp.type}`);
      logs.push(`   Field Type: ${currentProp.fieldType}`);
      logs.push(`   Form Field: ${currentProp.formField}`);
      logs.push(`   Hidden: ${currentProp.hidden}`);

      // If formField is false or property is hidden, update it
      if (!currentProp.formField || currentProp.hidden) {
        logs.push('⚠️ Property is NOT writable (formField=false)! Fixing...');

        const updateResponse = await fetch(
          `https://api.hubapi.com/crm/v3/properties/${OBJECT_TYPE_ID}/text_content`,
          {
            method: 'PATCH',
            headers: {
              'Authorization': `Bearer ${HUBSPOT_ACCESS_TOKEN}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              label: 'Text Content',
              hidden: false,
              formField: true,
              modificationMetadata: {
                readOnlyValue: false,
                readOnlyDefinition: false
              }
            })
          }
        );

        if (!updateResponse.ok) {
          const errorText = await updateResponse.text();
          logs.push(`❌ Failed to update property: ${updateResponse.status}`);
          logs.push(errorText);
          return res.status(500).json({ success: false, logs, error: errorText });
        }

        const updated = await updateResponse.json();
        logs.push('✅ Property updated to be writable!');
        logs.push(`   Form Field: ${updated.formField}`);

        return res.status(200).json({
          success: true,
          action: 'updated',
          property: updated,
          logs,
          message: '✅ Property is now writable! Delete and re-upload your PDFs to save the text.'
        });
      }

      return res.status(200).json({
        success: true,
        action: 'ok',
        property: currentProp,
        logs,
        message: 'Property exists and is writable. The issue must be elsewhere - check logs for API errors.'
      });

    } else {
      const errorText = await getResponse.text();
      logs.push(`❌ Unexpected error: ${getResponse.status}`);
      logs.push(errorText);
      return res.status(500).json({ success: false, logs, error: errorText });
    }

  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}

export const config = {
  api: {
    bodyParser: true,
  },
  maxDuration: 30,
};
