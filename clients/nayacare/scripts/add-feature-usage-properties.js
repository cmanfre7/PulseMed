/**
 * Add feature usage tracking properties to HubSpot Survey Custom Object
 * Run this script to add new properties for tracking which features users engaged with
 */

const HUBSPOT_ACCESS_TOKEN = process.env.HUBSPOT_ACCESS_TOKEN;
const SURVEY_OBJECT_TYPE_ID = '2-174856652'; // Survey responses custom object

if (!HUBSPOT_ACCESS_TOKEN) {
  console.error('❌ HUBSPOT_ACCESS_TOKEN environment variable is not set');
  process.exit(1);
}

const newProperties = [
  {
    name: 'used_chat',
    label: 'Used Chat Feature',
    type: 'bool',
    fieldType: 'booleancheckbox',
    groupName: 'chatbot_satisfaction_surveys_information',
    description: 'Whether the user sent any chat messages during the session',
    options: [
      { label: 'Yes', value: 'true' },
      { label: 'No', value: 'false' }
    ]
  },
  {
    name: 'used_feeding_log',
    label: 'Used Feeding Log',
    type: 'bool',
    fieldType: 'booleancheckbox',
    groupName: 'chatbot_satisfaction_surveys_information',
    description: 'Whether the user logged any feedings during the session',
    options: [
      { label: 'Yes', value: 'true' },
      { label: 'No', value: 'false' }
    ]
  },
  {
    name: 'used_sleep_log',
    label: 'Used Sleep Log',
    type: 'bool',
    fieldType: 'booleancheckbox',
    groupName: 'chatbot_satisfaction_surveys_information',
    description: 'Whether the user logged any sleep sessions during the session',
    options: [
      { label: 'Yes', value: 'true' },
      { label: 'No', value: 'false' }
    ]
  },
  {
    name: 'used_diaper_log',
    label: 'Used Diaper Log',
    type: 'bool',
    fieldType: 'booleancheckbox',
    groupName: 'chatbot_satisfaction_surveys_information',
    description: 'Whether the user logged any diaper changes during the session',
    options: [
      { label: 'Yes', value: 'true' },
      { label: 'No', value: 'false' }
    ]
  },
  {
    name: 'used_growth_charts',
    label: 'Used Growth Charts',
    type: 'bool',
    fieldType: 'booleancheckbox',
    groupName: 'chatbot_satisfaction_surveys_information',
    description: 'Whether the user entered growth measurements or viewed growth charts',
    options: [
      { label: 'Yes', value: 'true' },
      { label: 'No', value: 'false' }
    ]
  },
  {
    name: 'downloaded_resource',
    label: 'Downloaded Resource',
    type: 'bool',
    fieldType: 'booleancheckbox',
    groupName: 'chatbot_satisfaction_surveys_information',
    description: 'Whether the user downloaded any PDF resources during the session',
    options: [
      { label: 'Yes', value: 'true' },
      { label: 'No', value: 'false' }
    ]
  },
  {
    name: 'visited_youtube',
    label: 'Visited YouTube Channel',
    type: 'bool',
    fieldType: 'booleancheckbox',
    groupName: 'chatbot_satisfaction_surveys_information',
    description: 'Whether the user clicked to visit the YouTube channel or watch videos',
    options: [
      { label: 'Yes', value: 'true' },
      { label: 'No', value: 'false' }
    ]
  },
  {
    name: 'resources_viewed_list',
    label: 'Resources Viewed (List)',
    type: 'string',
    fieldType: 'text',
    groupName: 'chatbot_satisfaction_surveys_information',
    description: 'Comma-separated list of specific resources downloaded/viewed during session'
  }
];

async function addProperty(property) {
  try {
    const url = `https://api.hubapi.com/crm/v3/properties/${SURVEY_OBJECT_TYPE_ID}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${HUBSPOT_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(property)
    });

    if (!response.ok) {
      const error = await response.json();

      // If property already exists, skip
      if (error.message && error.message.includes('already exists')) {
        console.log(`⚠️  Property "${property.name}" already exists - skipping`);
        return { success: true, existed: true };
      }

      throw new Error(`HTTP ${response.status}: ${error.message || response.statusText}`);
    }

    const data = await response.json();
    console.log(`✅ Created property: ${property.name}`);
    return { success: true, existed: false };

  } catch (error) {
    console.error(`❌ Failed to create property "${property.name}":`, error.message);
    return { success: false, error: error.message };
  }
}

async function main() {
  console.log('🚀 Adding feature usage tracking properties to HubSpot Survey object...\n');
  console.log(`Object ID: ${SURVEY_OBJECT_TYPE_ID}\n`);

  let created = 0;
  let existed = 0;
  let failed = 0;

  for (const property of newProperties) {
    const result = await addProperty(property);

    if (result.success) {
      if (result.existed) {
        existed++;
      } else {
        created++;
      }
    } else {
      failed++;
    }

    // Rate limit: wait 200ms between requests
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  console.log('\n📊 Summary:');
  console.log(`   ✅ Created: ${created}`);
  console.log(`   ⚠️  Already existed: ${existed}`);
  console.log(`   ❌ Failed: ${failed}`);

  if (failed === 0) {
    console.log('\n🎉 All properties added successfully!');
    console.log('\n📝 Next steps:');
    console.log('   1. Feature usage tracking is now ready');
    console.log('   2. Survey responses will now include feature usage data');
    console.log('   3. View feature usage in Survey Analytics dashboard CSV export');
  } else {
    console.log('\n⚠️  Some properties failed to create. Check errors above.');
    process.exit(1);
  }
}

main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
