/**
 * Add diaper_logs property to HubSpot chatbot_users custom object
 * Run this once to enable diaper log persistence
 */

const HUBSPOT_ACCESS_TOKEN = process.env.HUBSPOT_ACCESS_TOKEN;
const CHATBOT_USERS_OBJECT_ID = '2-174718108';

if (!HUBSPOT_ACCESS_TOKEN) {
  console.error('❌ HUBSPOT_ACCESS_TOKEN environment variable is required');
  console.error('Usage: HUBSPOT_ACCESS_TOKEN=your_token node scripts/add-diaper-logs-property.js');
  process.exit(1);
}

async function addDiaperLogsProperty() {
  try {
    console.log('🔍 Checking if diaper_logs property exists...');

    // First check if property exists
    const checkUrl = `https://api.hubapi.com/crm/v3/properties/${CHATBOT_USERS_OBJECT_ID}/diaper_logs`;

    const checkResponse = await fetch(checkUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${HUBSPOT_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    if (checkResponse.ok) {
      console.log('✅ diaper_logs property already exists!');
      const existingProp = await checkResponse.json();
      console.log('Property details:', JSON.stringify(existingProp, null, 2));
      return;
    }

    console.log('📝 Creating diaper_logs property...');

    // Create the property
    const createUrl = `https://api.hubapi.com/crm/v3/properties/${CHATBOT_USERS_OBJECT_ID}`;

    const propertyDefinition = {
      name: 'diaper_logs',
      label: 'Diaper Logs',
      type: 'string',
      fieldType: 'textarea',
      groupName: 'chatbot_users_information',
      description: 'JSON array of diaper change logs (wet, dirty, both) with timestamps',
      formField: true,
      hidden: false,
      modificationMetadata: {
        readOnlyValue: false,
        readOnlyDefinition: false
      }
    };

    const createResponse = await fetch(createUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${HUBSPOT_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(propertyDefinition)
    });

    if (!createResponse.ok) {
      const errorText = await createResponse.text();
      console.error('❌ Failed to create property:', createResponse.status);
      console.error('Error details:', errorText);
      process.exit(1);
    }

    const createdProperty = await createResponse.json();
    console.log('✅ Successfully created diaper_logs property!');
    console.log('Property details:', JSON.stringify(createdProperty, null, 2));

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

addDiaperLogsProperty();
