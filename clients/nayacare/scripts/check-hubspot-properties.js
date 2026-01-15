// Quick script to check HubSpot property names
// Run with: node scripts/check-hubspot-properties.js

const HUBSPOT_ACCESS_TOKEN = process.env.HUBSPOT_ACCESS_TOKEN || 'YOUR_TOKEN_HERE';
const CHATBOT_USERS_OBJECT_ID = '2-174718108';

async function checkProperties() {
  const url = `https://api.hubapi.com/crm/v3/schemas/objects/${CHATBOT_USERS_OBJECT_ID}`;

  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${HUBSPOT_ACCESS_TOKEN}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    console.error('Failed to fetch schema:', response.status);
    return;
  }

  const data = await response.json();

  console.log('\n=== Chatbot Users Object Properties ===\n');

  data.properties.forEach(prop => {
    if (prop.name.includes('log') || prop.name.includes('feed') || prop.name.includes('sleep')) {
      console.log(`Label: "${prop.label}"`);
      console.log(`Internal Name: "${prop.name}"`);
      console.log(`Type: ${prop.type}`);
      console.log('---');
    }
  });
}

checkProperties().catch(console.error);
