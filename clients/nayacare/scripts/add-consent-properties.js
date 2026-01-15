/**
 * NAY-9: Add consent tracking properties to HubSpot Contacts
 * Run this script to add consent acceptance tracking properties for HIPAA compliance
 */

const HUBSPOT_ACCESS_TOKEN = process.env.HUBSPOT_ACCESS_TOKEN;

if (!HUBSPOT_ACCESS_TOKEN) {
  console.error('❌ HUBSPOT_ACCESS_TOKEN environment variable is not set');
  console.error('💡 Set it in Railway dashboard or run: export HUBSPOT_ACCESS_TOKEN="your_token"');
  process.exit(1);
}

// Properties to add to HubSpot Contacts object
const newProperties = [
  {
    name: 'consent_accepted',
    label: 'Consent Accepted',
    type: 'bool',
    fieldType: 'booleancheckbox',
    groupName: 'contactinformation',
    description: 'Whether the user has accepted the current Terms of Service and Privacy Policy',
    options: [
      { label: 'Yes', value: 'true' },
      { label: 'No', value: 'false' }
    ]
  },
  {
    name: 'consent_accepted_date',
    label: 'Consent Accepted Date',
    type: 'datetime',
    fieldType: 'date',
    groupName: 'contactinformation',
    description: 'Timestamp when the user accepted consent (ISO 8601 format)'
  },
  {
    name: 'consent_version_accepted',
    label: 'Consent Version Accepted',
    type: 'string',
    fieldType: 'text',
    groupName: 'contactinformation',
    description: 'Composite version of consent accepted (e.g., "1.0.0")'
  },
  {
    name: 'tos_version_accepted',
    label: 'Terms of Service Version Accepted',
    type: 'string',
    fieldType: 'text',
    groupName: 'contactinformation',
    description: 'Version of Terms of Service accepted (e.g., "1.0.0")'
  },
  {
    name: 'privacy_policy_version_accepted',
    label: 'Privacy Policy Version Accepted',
    type: 'string',
    fieldType: 'text',
    groupName: 'contactinformation',
    description: 'Version of Privacy Policy accepted (e.g., "1.0.0")'
  }
];

async function addProperty(property) {
  try {
    // HubSpot Contacts properties API endpoint
    const url = 'https://api.hubapi.com/crm/v3/properties/contacts';

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
  console.log('🚀 NAY-9: Adding consent tracking properties to HubSpot Contacts...\n');
  console.log('📝 This enables HIPAA-compliant consent acceptance tracking\n');

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
    console.log('\n🎉 All consent properties added successfully!');
    console.log('\n📝 Next steps:');
    console.log('   1. Deploy api/consent/accept.ts and api/consent/status.ts endpoints');
    console.log('   2. Update src/App.jsx to move consent modal after authentication');
    console.log('   3. Test consent flow with test patient account');
    console.log('   4. Verify consent data appears in HubSpot contact records');
  } else {
    console.log('\n⚠️  Some properties failed to create. Check errors above.');
    process.exit(1);
  }
}

main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
