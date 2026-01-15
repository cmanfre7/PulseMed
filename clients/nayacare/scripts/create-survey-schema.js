/**
 * Create HubSpot Custom Object Schema for Satisfaction Surveys
 *
 * Run this script ONCE to set up the HubSpot schema:
 * node scripts/create-survey-schema.js YOUR_TOKEN_HERE
 * OR
 * HUBSPOT_ACCESS_TOKEN=your_token node scripts/create-survey-schema.js
 */

const HUBSPOT_ACCESS_TOKEN = process.argv[2] || process.env.HUBSPOT_ACCESS_TOKEN;

if (!HUBSPOT_ACCESS_TOKEN) {
  console.error('❌ Error: HUBSPOT_ACCESS_TOKEN is required');
  console.log('\nUsage:');
  console.log('  node scripts/create-survey-schema.js YOUR_TOKEN_HERE');
  console.log('  OR');
  console.log('  HUBSPOT_ACCESS_TOKEN=your_token node scripts/create-survey-schema.js\n');
  process.exit(1);
}

const HUBSPOT_API_BASE = 'https://api.hubapi.com';

// Define the custom object schema
const customObjectSchema = {
  name: 'chatbot_satisfaction_surveys',
  labels: {
    singular: 'Chatbot Satisfaction Survey',
    plural: 'Chatbot Satisfaction Surveys'
  },
  primaryDisplayProperty: 'survey_id',
  requiredProperties: ['survey_id'],
  searchableProperties: ['survey_id', 'user_email'],
  properties: [
    // Identifiers
    {
      name: 'survey_id',
      label: 'Survey ID',
      type: 'string',
      fieldType: 'text',
      description: 'Unique identifier for this survey response'
    },
    {
      name: 'user_email',
      label: 'User Email',
      type: 'string',
      fieldType: 'text',
      description: 'Email of user (or "anonymous")'
    },
    {
      name: 'baby_profile_id',
      label: 'Baby Profile ID',
      type: 'string',
      fieldType: 'text',
      description: 'Associated baby profile ID'
    },

    // Session Context
    {
      name: 'session_duration_seconds',
      label: 'Session Duration (seconds)',
      type: 'number',
      fieldType: 'number',
      description: 'How long the user spent in the chatbot'
    },
    {
      name: 'message_count',
      label: 'Message Count',
      type: 'number',
      fieldType: 'number',
      description: 'Number of messages sent in this session'
    },
    {
      name: 'session_date',
      label: 'Session Date',
      type: 'datetime',
      fieldType: 'date',
      description: 'When the session occurred'
    },

    // Survey Responses (1-5 ratings)
    {
      name: 'ease_of_use',
      label: 'Ease of Use Rating',
      type: 'number',
      fieldType: 'number',
      description: 'Rating 1-5: How easy was it to use the chatbot?'
    },
    {
      name: 'response_quality',
      label: 'Response Quality Rating',
      type: 'number',
      fieldType: 'number',
      description: 'Rating 1-5: Quality of responses and resources'
    },
    {
      name: 'felt_supported',
      label: 'Felt Supported Rating',
      type: 'number',
      fieldType: 'number',
      description: 'Rating 1-5: Chatbot helped me feel supported'
    },
    {
      name: 'trust_guidance',
      label: 'Trust Guidance Rating',
      type: 'number',
      fieldType: 'number',
      description: 'Rating 1-5: Would trust guidance for future questions'
    },
    {
      name: 'likelihood_recommend',
      label: 'Likelihood to Recommend Rating',
      type: 'number',
      fieldType: 'number',
      description: 'Rating 1-5: How likely to recommend to other parents'
    },

    // Open Feedback
    {
      name: 'improvement_suggestions',
      label: 'Improvement Suggestions',
      type: 'string',
      fieldType: 'textarea',
      description: 'Open-ended feedback on how to improve'
    },

    // Metadata
    {
      name: 'survey_version',
      label: 'Survey Version',
      type: 'string',
      fieldType: 'text',
      description: 'Version of the survey (e.g., v1.0)'
    },
    {
      name: 'chatbot_version',
      label: 'Chatbot Version',
      type: 'string',
      fieldType: 'text',
      description: 'Version of the chatbot when survey was taken'
    },
    {
      name: 'submitted_at',
      label: 'Submitted At',
      type: 'datetime',
      fieldType: 'date',
      description: 'When the survey was submitted'
    },
    {
      name: 'platform',
      label: 'Platform',
      type: 'enumeration',
      fieldType: 'select',
      description: 'Platform where survey was taken',
      options: [
        { label: 'Web', value: 'web' },
        { label: 'Embed', value: 'embed' }
      ]
    },
    {
      name: 'survey_skipped',
      label: 'Survey Skipped',
      type: 'bool',
      fieldType: 'booleancheckbox',
      description: 'Whether user skipped the survey',
      options: [
        { label: 'Yes', value: true },
        { label: 'No', value: false }
      ]
    }
  ]
};

async function createCustomObject() {
  console.log('🚀 Creating HubSpot Custom Object: chatbot_satisfaction_surveys\n');

  try {
    const response = await fetch(`${HUBSPOT_API_BASE}/crm/v3/schemas`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${HUBSPOT_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(customObjectSchema)
    });

    const data = await response.json();

    if (!response.ok) {
      if (data.category === 'OBJECT_ALREADY_EXISTS') {
        console.log('⚠️  Custom object "chatbot_satisfaction_surveys" already exists.');
        console.log('✅ Schema is ready to use!\n');
        return;
      }

      throw new Error(`HubSpot API Error: ${data.message || response.statusText}`);
    }

    console.log('✅ Custom object created successfully!');
    console.log(`   Object ID: ${data.id}`);
    console.log(`   Name: ${data.name}`);
    console.log(`   Properties: ${data.properties.length} properties created\n`);

    console.log('📋 Created Properties:');
    data.properties.forEach(prop => {
      console.log(`   - ${prop.name} (${prop.type})`);
    });

    console.log('\n✅ HubSpot schema setup complete!');
    console.log('   You can now start collecting survey responses.\n');

  } catch (error) {
    console.error('❌ Error creating custom object:', error.message);
    process.exit(1);
  }
}

// Run the setup
createCustomObject();
