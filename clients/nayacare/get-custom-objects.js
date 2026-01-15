/**
 * Get all custom objects to find the survey object ID
 *
 * Run: node get-custom-objects.js YOUR_TOKEN
 */

const HUBSPOT_ACCESS_TOKEN = process.argv[2];

if (!HUBSPOT_ACCESS_TOKEN) {
  console.error('❌ Error: Token required');
  console.log('\nUsage: node get-custom-objects.js YOUR_TOKEN');
  process.exit(1);
}

async function getCustomObjects() {
  console.log('🔍 Fetching custom objects from HubSpot...\n');

  try {
    const response = await fetch('https://api.hubapi.com/crm/v3/schemas', {
      headers: {
        'Authorization': `Bearer ${HUBSPOT_ACCESS_TOKEN}`
      }
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ Error:', data);
      process.exit(1);
    }

    console.log('✅ Custom Objects Found:\n');

    data.results.forEach(obj => {
      console.log(`📦 ${obj.name}`);
      console.log(`   Label: ${obj.labels.singular}`);
      console.log(`   Object Type ID: ${obj.objectTypeId}`);
      console.log(`   Fully Qualified Name: ${obj.fullyQualifiedName}`);
      console.log(`   Properties: ${obj.properties?.length || 0}`);
      console.log('');
    });

    // Find our survey object
    const surveyObj = data.results.find(obj => obj.name === 'chatbot_satisfaction_surveys');

    if (surveyObj) {
      console.log('🎯 Found Survey Object!');
      console.log(`   Use this ID: ${surveyObj.objectTypeId}`);
      console.log(`   Or: ${surveyObj.fullyQualifiedName}`);
    } else {
      console.log('⚠️  Survey object not found in custom objects list');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

getCustomObjects();
