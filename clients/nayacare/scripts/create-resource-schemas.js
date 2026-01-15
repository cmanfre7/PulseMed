/**
 * Script to create HubSpot Custom Objects for Resources and Videos
 * Run with: node scripts/create-resource-schemas.js
 */

const HUBSPOT_ACCESS_TOKEN = process.env.HUBSPOT_ACCESS_TOKEN;

if (!HUBSPOT_ACCESS_TOKEN) {
  console.error('❌ Error: HUBSPOT_ACCESS_TOKEN environment variable not set');
  console.log('Usage: export HUBSPOT_ACCESS_TOKEN=your_token && node scripts/create-resource-schemas.js');
  process.exit(1);
}

// Custom Object Schema for Patient Resources
const patientResourcesSchema = {
  name: 'patient_resources',
  labels: {
    singular: 'Patient Resource',
    plural: 'Patient Resources'
  },
  primaryDisplayProperty: 'title',
  requiredProperties: ['title'],
  searchableProperties: ['title', 'category', 'description'],
  properties: [
    {
      name: 'title',
      label: 'Title',
      type: 'string',
      fieldType: 'text',
      description: 'Resource title',
      hasUniqueValue: false,
      formField: true
    },
    {
      name: 'category',
      label: 'Category',
      type: 'string',
      fieldType: 'text',
      description: 'Resource category (Sleep, Feeding, Recovery, Emergency)',
      hasUniqueValue: false,
      formField: true
    },
    {
      name: 'description',
      label: 'Description',
      type: 'string',
      fieldType: 'textarea',
      description: 'Resource description',
      hasUniqueValue: false,
      formField: true
    },
    {
      name: 'icon',
      label: 'Icon',
      type: 'string',
      fieldType: 'text',
      description: 'Lucide icon name (Moon, Baby, Heart, AlertTriangle)',
      hasUniqueValue: false,
      formField: true
    },
    {
      name: 'pdf_url',
      label: 'PDF URL',
      type: 'string',
      fieldType: 'text',
      description: 'HubSpot File Manager URL for the PDF',
      hasUniqueValue: false,
      formField: true
    },
    {
      name: 'file_name',
      label: 'File Name',
      type: 'string',
      fieldType: 'text',
      description: 'Original PDF file name',
      hasUniqueValue: false,
      formField: true
    },
    {
      name: 'download_count',
      label: 'Download Count',
      type: 'number',
      fieldType: 'number',
      description: 'Number of times downloaded',
      hasUniqueValue: false,
      formField: true
    },
    {
      name: 'is_active',
      label: 'Is Active',
      type: 'enumeration',
      fieldType: 'booleancheckbox',
      description: 'Whether the resource is visible to users',
      hasUniqueValue: false,
      formField: true,
      options: [
        { label: 'True', value: 'true' },
        { label: 'False', value: 'false' }
      ]
    }
  ]
};

// Custom Object Schema for Educational Videos
const educationalVideosSchema = {
  name: 'educational_videos',
  labels: {
    singular: 'Educational Video',
    plural: 'Educational Videos'
  },
  primaryDisplayProperty: 'title',
  requiredProperties: ['title', 'video_url'],
  searchableProperties: ['title', 'category', 'description'],
  properties: [
    {
      name: 'title',
      label: 'Title',
      type: 'string',
      fieldType: 'text',
      description: 'Video title',
      hasUniqueValue: false,
      formField: true
    },
    {
      name: 'description',
      label: 'Description',
      type: 'string',
      fieldType: 'textarea',
      description: 'Video description',
      hasUniqueValue: false,
      formField: true
    },
    {
      name: 'video_url',
      label: 'Video URL',
      type: 'string',
      fieldType: 'text',
      description: 'YouTube video URL',
      hasUniqueValue: false,
      formField: true
    },
    {
      name: 'embed_url',
      label: 'Embed URL',
      type: 'string',
      fieldType: 'text',
      description: 'YouTube embed URL',
      hasUniqueValue: false,
      formField: true
    },
    {
      name: 'category',
      label: 'Category',
      type: 'string',
      fieldType: 'text',
      description: 'Video category',
      hasUniqueValue: false,
      formField: true
    },
    {
      name: 'thumbnail_url',
      label: 'Thumbnail URL',
      type: 'string',
      fieldType: 'text',
      description: 'Video thumbnail image URL',
      hasUniqueValue: false,
      formField: true
    },
    {
      name: 'duration',
      label: 'Duration',
      type: 'string',
      fieldType: 'text',
      description: 'Video duration (e.g., "5:32")',
      hasUniqueValue: false,
      formField: true
    },
    {
      name: 'view_count',
      label: 'View Count',
      type: 'number',
      fieldType: 'number',
      description: 'Number of times viewed',
      hasUniqueValue: false,
      formField: true
    },
    {
      name: 'is_active',
      label: 'Is Active',
      type: 'enumeration',
      fieldType: 'booleancheckbox',
      description: 'Whether the video is visible to users',
      hasUniqueValue: false,
      formField: true,
      options: [
        { label: 'True', value: 'true' },
        { label: 'False', value: 'false' }
      ]
    }
  ]
};

async function createSchema(schema) {
  console.log(`\n📦 Creating custom object: ${schema.name}...`);

  try {
    const response = await fetch('https://api.hubapi.com/crm/v3/schemas', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${HUBSPOT_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(schema)
    });

    const data = await response.json();

    if (response.ok) {
      console.log(`✅ Successfully created custom object: ${schema.name}`);
      console.log(`   Object ID: ${data.id}`);
      console.log(`   Name: ${data.name}`);
      return data;
    } else {
      if (data.category === 'CONFLICT') {
        console.log(`⚠️  Custom object ${schema.name} already exists - skipping`);
        return null;
      } else {
        console.error(`❌ Failed to create ${schema.name}:`, data.message);
        console.error('Details:', JSON.stringify(data, null, 2));
        throw new Error(data.message);
      }
    }
  } catch (error) {
    console.error(`❌ Error creating ${schema.name}:`, error.message);
    throw error;
  }
}

async function main() {
  console.log('🚀 Starting HubSpot Custom Object creation for Resources and Videos...\n');
  console.log('Using HubSpot Access Token:', HUBSPOT_ACCESS_TOKEN.substring(0, 10) + '...');

  try {
    // Create Patient Resources custom object
    await createSchema(patientResourcesSchema);

    // Create Educational Videos custom object
    await createSchema(educationalVideosSchema);

    console.log('\n✅ HubSpot Custom Objects setup complete!');
    console.log('\n📋 Next steps:');
    console.log('1. Go to HubSpot → Settings → Data Management → Objects');
    console.log('2. Verify "Patient Resources" and "Educational Videos" objects exist');
    console.log('3. Update the NayaCare API endpoints to use these custom objects');
    console.log('4. Test adding/editing/deleting resources in the admin dashboard');

  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);
    process.exit(1);
  }
}

main();
