/**
 * Test Survey Submission to HubSpot
 *
 * Run: HUBSPOT_ACCESS_TOKEN=your-token node test-survey-submit.js
 */

const HUBSPOT_ACCESS_TOKEN = process.argv[2];
const HUBSPOT_API_BASE = 'https://api.hubapi.com';

if (!HUBSPOT_ACCESS_TOKEN) {
  console.error('❌ Error: Token required');
  console.log('\nUsage: node test-survey-submit.js YOUR_TOKEN');
  process.exit(1);
}

async function testSurveySubmission() {
  console.log('🧪 Testing Survey Submission to HubSpot...\n');

  const surveyId = `survey_test_${Date.now()}`;
  const submittedAt = new Date().toISOString();
  const sessionDate = new Date(Date.now() - 180000).toISOString(); // 3 minutes ago

  const properties = {
    survey_id: surveyId,
    user_email: 'test@example.com',
    baby_profile_id: 'test_baby_123',
    session_duration_seconds: 180,
    message_count: 5,
    session_date: sessionDate,
    submitted_at: submittedAt,
    platform: 'web',
    chatbot_version: '1.7.2',
    survey_version: 'v1.0',
    survey_skipped: false,

    // Ratings
    ease_of_use: 5,
    response_quality: 4,
    felt_supported: 5,
    trust_guidance: 4,
    likelihood_recommend: 5,

    // Feedback
    improvement_suggestions: 'This is a test survey submission!'
  };

  console.log('📊 Survey Data:', JSON.stringify(properties, null, 2));
  console.log('\n🔄 Sending to HubSpot...\n');

  try {
    const response = await fetch(
      `${HUBSPOT_API_BASE}/crm/v3/objects/2-174856652`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${HUBSPOT_ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ properties })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ HubSpot API Error:');
      console.error(JSON.stringify(data, null, 2));
      process.exit(1);
    }

    console.log('✅ Survey submitted successfully!');
    console.log(`   HubSpot Record ID: ${data.id}`);
    console.log(`   Survey ID: ${surveyId}`);
    console.log('\n📋 Full Response:');
    console.log(JSON.stringify(data, null, 2));

    // Now try to retrieve it
    console.log('\n🔍 Retrieving survey from HubSpot...\n');

    const getResponse = await fetch(
      `${HUBSPOT_API_BASE}/crm/v3/objects/2-174856652/${data.id}`,
      {
        headers: {
          'Authorization': `Bearer ${HUBSPOT_ACCESS_TOKEN}`
        }
      }
    );

    const retrievedData = await getResponse.json();

    if (!getResponse.ok) {
      console.error('❌ Failed to retrieve survey');
      console.error(JSON.stringify(retrievedData, null, 2));
    } else {
      console.log('✅ Survey retrieved successfully!');
      console.log('\n📋 Retrieved Properties:');
      console.log(JSON.stringify(retrievedData.properties, null, 2));
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

testSurveySubmission();
