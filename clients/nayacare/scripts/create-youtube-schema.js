/**
 * Creates HubSpot Custom Object for Educational YouTube Videos
 * Run once: node scripts/create-youtube-schema.js
 */

const HUBSPOT_ACCESS_TOKEN = process.env.HUBSPOT_ACCESS_TOKEN;
const HUBSPOT_API_BASE = 'https://api.hubapi.com';

async function createYouTubeVideoSchema() {
  console.log('🎬 Creating YouTube Videos Custom Object Schema...\n');

  const customObjectSchema = {
    name: 'educational_videos',
    labels: {
      singular: 'Educational Video',
      plural: 'Educational Videos'
    },
    primaryDisplayProperty: 'title',
    requiredProperties: ['title', 'video_url'],
    searchableProperties: ['title', 'description', 'category', 'tags'],
    properties: [
      {
        name: 'video_id',
        label: 'YouTube Video ID',
        type: 'string',
        fieldType: 'text',
        description: 'Extracted from YouTube URL (e.g., dQw4w9WgXcQ)'
      },
      {
        name: 'video_url',
        label: 'YouTube URL',
        type: 'string',
        fieldType: 'text',
        description: 'Full YouTube video URL'
      },
      {
        name: 'title',
        label: 'Video Title',
        type: 'string',
        fieldType: 'text',
        description: 'Title of the video'
      },
      {
        name: 'description',
        label: 'Description',
        type: 'string',
        fieldType: 'textarea',
        description: 'Brief description of what the video covers'
      },
      {
        name: 'category',
        label: 'Category',
        type: 'enumeration',
        fieldType: 'select',
        options: [
          { label: 'Breastfeeding Support', value: 'breastfeeding' },
          { label: 'Sleep Guidance', value: 'sleep' },
          { label: 'Postpartum Recovery', value: 'postpartum' },
          { label: 'Development Milestones', value: 'development' },
          { label: 'Feeding Schedules', value: 'feeding' },
          { label: 'Newborn Care', value: 'newborn' },
          { label: 'General Guidance', value: 'general' }
        ],
        description: 'Video category for organization'
      },
      {
        name: 'tags',
        label: 'Search Tags',
        type: 'string',
        fieldType: 'text',
        description: 'Comma-separated keywords for AI search (e.g., "latch, breastfeeding, blueprint")'
      },
      {
        name: 'duration_seconds',
        label: 'Duration (seconds)',
        type: 'number',
        fieldType: 'number',
        description: 'Video length in seconds'
      },
      {
        name: 'duration_display',
        label: 'Duration Display',
        type: 'string',
        fieldType: 'text',
        description: 'Formatted duration (e.g., "8:15")'
      },
      {
        name: 'thumbnail_url',
        label: 'Thumbnail URL',
        type: 'string',
        fieldType: 'text',
        description: 'YouTube thumbnail image URL'
      },
      {
        name: 'view_count',
        label: 'View Count',
        type: 'number',
        fieldType: 'number',
        description: 'Number of times watched (internal tracking)'
      },
      {
        name: 'published_at',
        label: 'Published Date',
        type: 'datetime',
        fieldType: 'date',
        description: 'When the video was added to knowledge base'
      },
      {
        name: 'display_order',
        label: 'Display Order',
        type: 'number',
        fieldType: 'number',
        description: 'Order to display in patient education tab (1 = first)'
      },
      {
        name: 'is_active',
        label: 'Active',
        type: 'bool',
        fieldType: 'booleancheckbox',
        options: [
          { label: 'Yes', value: true },
          { label: 'No', value: false }
        ],
        description: 'Whether video is shown to patients'
      }
    ],
    associatedObjects: ['CONTACT']
  };

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

    if (response.ok) {
      console.log('✅ Custom Object Created Successfully!\n');
      console.log('📋 Object Details:');
      console.log(`   Name: ${data.name}`);
      console.log(`   Object Type ID: ${data.objectTypeId}`);
      console.log(`   Fully Qualified Name: ${data.fullyQualifiedName}`);
      console.log(`   Properties: ${data.properties.length}`);
      console.log('\n🎯 Next Steps:');
      console.log('1. Update api/admin/youtube endpoints with objectTypeId');
      console.log('2. Build admin UI for adding videos');
      console.log('3. Integrate video search in chat API\n');
    } else {
      console.error('❌ Failed to create custom object:');
      console.error(`   Status: ${response.status}`);
      console.error(`   Error: ${data.message || JSON.stringify(data, null, 2)}`);

      if (data.message && data.message.includes('already exists')) {
        console.log('\n💡 Custom object already exists! Fetching existing schema...\n');

        const fetchResponse = await fetch(`${HUBSPOT_API_BASE}/crm/v3/schemas`, {
          headers: {
            'Authorization': `Bearer ${HUBSPOT_ACCESS_TOKEN}`
          }
        });

        const schemas = await fetchResponse.json();
        const existingSchema = schemas.results.find(s => s.name === 'educational_videos');

        if (existingSchema) {
          console.log('📋 Existing Object Details:');
          console.log(`   Name: ${existingSchema.name}`);
          console.log(`   Object Type ID: ${existingSchema.objectTypeId}`);
          console.log(`   Fully Qualified Name: ${existingSchema.fullyQualifiedName}\n`);
        }
      }
    }
  } catch (error) {
    console.error('❌ Error creating custom object:', error.message);
  }
}

// Run the schema creation
createYouTubeVideoSchema();
