#!/usr/bin/env node

/**
 * Fix HubSpot text_content Property
 * Ensures the text_content property can accept large text values
 */

const HUBSPOT_ACCESS_TOKEN = process.env.HUBSPOT_ACCESS_TOKEN;
const OBJECT_TYPE_ID = '2-174458678'; // Your custom object ID

if (!HUBSPOT_ACCESS_TOKEN) {
  console.error('❌ Error: HUBSPOT_ACCESS_TOKEN environment variable is required');
  process.exit(1);
}

async function checkAndFixProperty() {
  try {
    // Get current property details
    console.log('🔍 Checking text_content property...\n');

    const getResponse = await fetch(
      `https://api.hubapi.com/crm/v3/properties/${OBJECT_TYPE_ID}/text_content`,
      {
        headers: {
          'Authorization': `Bearer ${HUBSPOT_ACCESS_TOKEN}`
        }
      }
    );

    if (!getResponse.ok) {
      if (getResponse.status === 404) {
        console.log('❌ text_content property does NOT exist!');
        console.log('   Creating it now...\n');
        await createProperty();
        return;
      }
      throw new Error(`Failed to get property: ${getResponse.status}`);
    }

    const currentProp = await getResponse.json();
    console.log('✅ Property exists:');
    console.log(`   Name: ${currentProp.name}`);
    console.log(`   Type: ${currentProp.type}`);
    console.log(`   Field Type: ${currentProp.fieldType}`);
    console.log(`   Description: ${currentProp.description}\n`);

    // Update to ensure it can handle large text
    console.log('🔧 Updating property to support large text...\n');

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
          type: 'string',
          fieldType: 'textarea',
          description: 'Extracted PDF text content (OCR or text-based)',
          formField: true
        })
      }
    );

    if (!updateResponse.ok) {
      const errorText = await updateResponse.text();
      throw new Error(`Update failed: ${updateResponse.status} - ${errorText}`);
    }

    console.log('✅ Property updated successfully!\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

async function createProperty() {
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
        groupName: 'knowledge_base_documents',
        description: 'Extracted PDF text content (OCR or text-based)',
        formField: true
      })
    }
  );

  if (!createResponse.ok) {
    const errorText = await createResponse.text();
    throw new Error(`Create failed: ${createResponse.status} - ${errorText}`);
  }

  console.log('✅ text_content property created successfully!\n');
}

checkAndFixProperty();
