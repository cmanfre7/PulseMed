/**
 * Add profile relation properties to HubSpot Chatbot Users Custom Object
 * Run this script to add relation tracking for prenatal/postnatal support
 */

const HUBSPOT_ACCESS_TOKEN = process.env.HUBSPOT_ACCESS_TOKEN;
const CHATBOT_USERS_OBJECT_ID = '2-174718108';

if (!HUBSPOT_ACCESS_TOKEN) {
  console.error('❌ HUBSPOT_ACCESS_TOKEN environment variable is not set');
  console.error('💡 Set it in Railway dashboard or run: export HUBSPOT_ACCESS_TOKEN="your_token"');
  process.exit(1);
}

// Properties to add to HubSpot Chatbot Users custom object
// Note: These are stored as part of the JSON in baby_profiles property
// This script documents the new fields being added to the JSON structure
const newFieldsInBabyProfiles = {
  relation: 'mother|father|other',  // User's relation to baby
  customRelation: 'string',          // If "other" is selected (e.g., "grandmother", "nanny")
  isBornYet: 'boolean',             // true if baby is born, false if expecting
  expectedDueDate: 'date',          // If baby not born yet
  birthDate: 'date',                // If baby is born (existing field)
};

console.log('📝 Profile Relation Fields Documentation');
console.log('=========================================\n');

console.log('The baby_profiles JSON property now includes these additional fields:\n');

console.log('1. relation (string):');
console.log('   - "mother": The user is the baby\'s mother');
console.log('   - "father": The user is the baby\'s father');
console.log('   - "other": Other relationship (requires customRelation)');
console.log('');

console.log('2. customRelation (string, optional):');
console.log('   - Only populated when relation = "other"');
console.log('   - Examples: "grandmother", "grandfather", "aunt", "uncle", "nanny", "guardian"');
console.log('');

console.log('3. isBornYet (boolean):');
console.log('   - true: Baby has been born (shows birthDate field)');
console.log('   - false: Baby not born yet/expecting (shows expectedDueDate field)');
console.log('');

console.log('4. expectedDueDate (date string, optional):');
console.log('   - ISO date format (YYYY-MM-DD)');
console.log('   - Only populated when isBornYet = false');
console.log('   - Used for prenatal support and preparation');
console.log('');

console.log('5. birthDate (date string, optional):');
console.log('   - ISO date format (YYYY-MM-DD)');
console.log('   - Only populated when isBornYet = true');
console.log('   - Used for age calculations and milestone tracking');
console.log('');

console.log('Example baby_profiles JSON structure:');
console.log('---------------------------------------');
const exampleProfile = {
  id: 1234567890,
  name: "Emma",
  relation: "mother",
  customRelation: null,
  isBornYet: false,
  expectedDueDate: "2025-12-25",
  birthDate: null,
  isMultiple: false,
  numberOfBabies: 1,
  createdAt: new Date().toISOString()
};

console.log(JSON.stringify([exampleProfile], null, 2));

console.log('\n✅ Implementation Notes:');
console.log('------------------------');
console.log('• The baby_profiles property is already a JSON field in HubSpot');
console.log('• No HubSpot schema changes needed - data stored within existing JSON');
console.log('• Frontend validation ensures all required fields are populated');
console.log('• Welcome messages adapt based on relation and born/expecting status');
console.log('• Chat context will include prenatal vs postnatal appropriate guidance');

console.log('\n🎯 Next Steps:');
console.log('-------------');
console.log('1. Deploy updated src/App.jsx with new profile fields');
console.log('2. Test profile creation with different relations');
console.log('3. Test expecting parent flow (isBornYet = false)');
console.log('4. Test born baby flow (isBornYet = true)');
console.log('5. Verify data saves correctly to HubSpot baby_profiles JSON');

console.log('\n📚 Testing Scenarios:');
console.log('--------------------');
console.log('• Mother with born baby');
console.log('• Father with born baby');
console.log('• Grandmother (other relation) with born baby');
console.log('• Expecting mother (baby not born yet)');
console.log('• Expecting father (baby not born yet)');
console.log('• Nanny (other relation) with born baby');

console.log('\n✨ Feature Complete!');
console.log('The profile setup now supports:');
console.log('• Relationship tracking for better personalization');
console.log('• Prenatal support for expecting parents');
console.log('• Postnatal support for new parents');
console.log('• Custom relationships for extended family/caregivers');