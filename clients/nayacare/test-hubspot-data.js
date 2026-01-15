/**
 * Quick script to check what's actually stored in HubSpot
 */

const HUBSPOT_ACCESS_TOKEN = process.env.HUBSPOT_ACCESS_TOKEN;
const CUSTOM_OBJECTS_URL = 'https://api.hubapi.com/crm/v3/objects/2-174458678';

async function checkHubSpotData() {
  try {
    const properties = [
      'title',
      'file_name',
      'category',
      'file_url',
      'hubspot_file_id',
      'pages',
      'size_kb',
      'uploaded_at',
      'description',
      'chunks',
      'text_content'
    ].join(',');

    const response = await fetch(
      `${CUSTOM_OBJECTS_URL}?limit=10&properties=${properties}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${HUBSPOT_ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ HubSpot error:', response.status, errorText);
      return;
    }

    const data = await response.json();

    console.log('\n📊 HubSpot Knowledge Base Documents:\n');
    console.log(`Total documents: ${data.results.length}\n`);

    data.results.forEach((doc, index) => {
      console.log(`\n--- Document ${index + 1} ---`);
      console.log(`Title: ${doc.properties.title}`);
      console.log(`File: ${doc.properties.file_name}`);
      console.log(`Category: ${doc.properties.category}`);
      console.log(`Pages: ${doc.properties.pages} (type: ${typeof doc.properties.pages})`);
      console.log(`Chunks: ${doc.properties.chunks} (type: ${typeof doc.properties.chunks})`);
      console.log(`Size: ${doc.properties.size_kb} KB`);
      console.log(`Text content length: ${doc.properties.text_content?.length || 0} chars`);
      console.log(`Uploaded: ${doc.properties.uploaded_at}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkHubSpotData();
