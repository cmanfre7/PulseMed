#!/usr/bin/env node

/**
 * HubSpot Custom Object Schema Creator
 *
 * Creates the "Knowledge Base Documents" custom object in HubSpot
 * Run: node scripts/create-hubspot-schema.js
 */

const HUBSPOT_ACCESS_TOKEN = process.env.HUBSPOT_ACCESS_TOKEN;

if (!HUBSPOT_ACCESS_TOKEN) {
  console.error('❌ Error: HUBSPOT_ACCESS_TOKEN environment variable is required');
  console.error('Set it with: export HUBSPOT_ACCESS_TOKEN=your_token_here');
  process.exit(1);
}

const schema = {
  name: 'knowledge_base_documents',
  labels: {
    singular: 'Knowledge Base Document',
    plural: 'Knowledge Base Documents'
  },
  primaryDisplayProperty: 'title',
  requiredProperties: ['title', 'file_name'],
  searchableProperties: ['title', 'file_name', 'category', 'description', 'text_content'],
  properties: [
    {
      name: 'title',
      label: 'Title',
      type: 'string',
      fieldType: 'text',
      description: 'Document title'
    },
    {
      name: 'file_name',
      label: 'File Name',
      type: 'string',
      fieldType: 'text',
      description: 'Original PDF filename'
    },
    {
      name: 'category',
      label: 'Category',
      type: 'string',
      fieldType: 'text',
      description: 'Document category (breastfeeding, newborn-care, etc.)'
    },
    {
      name: 'file_url',
      label: 'File URL',
      type: 'string',
      fieldType: 'text',
      description: 'HubSpot File Manager URL'
    },
    {
      name: 'hubspot_file_id',
      label: 'HubSpot File ID',
      type: 'string',
      fieldType: 'text',
      description: 'File Manager file ID for deletion'
    },
    {
      name: 'pages',
      label: 'Pages',
      type: 'number',
      fieldType: 'number',
      description: 'Number of PDF pages'
    },
    {
      name: 'size_kb',
      label: 'Size (KB)',
      type: 'number',
      fieldType: 'number',
      description: 'File size in kilobytes'
    },
    {
      name: 'uploaded_at',
      label: 'Uploaded At',
      type: 'datetime',
      fieldType: 'date',
      description: 'Upload timestamp'
    },
    {
      name: 'description',
      label: 'Description',
      type: 'string',
      fieldType: 'textarea',
      description: 'Auto-generated description from PDF content'
    },
    {
      name: 'chunks',
      label: 'Chunks',
      type: 'number',
      fieldType: 'number',
      description: 'Number of text chunks for AI processing'
    },
    {
      name: 'text_content',
      label: 'Text Content',
      type: 'string',
      fieldType: 'textarea',
      description: 'Extracted PDF text (max 65KB due to HubSpot limits)'
    }
  ],
  associatedObjects: ['CONTACT']
};

console.log('🚀 Creating HubSpot Custom Object: Knowledge Base Documents\n');

fetch('https://api.hubapi.com/crm/v3/schemas', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${HUBSPOT_ACCESS_TOKEN}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(schema)
})
  .then(async (response) => {
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    return response.json();
  })
  .then((data) => {
    console.log('✅ Success! Custom Object created:');
    console.log(`   Object ID: ${data.objectTypeId}`);
    console.log(`   Name: ${data.labels.plural}`);
    console.log(`   Primary Property: ${data.primaryDisplayProperty}`);
    console.log(`   Properties: ${data.properties.length} total\n`);
    console.log('📝 Next steps:');
    console.log('   1. Deploy your code to Vercel');
    console.log('   2. Go to admin dashboard: https://nayacare.vercel.app/?admin=true');
    console.log('   3. Upload a PDF to test the integration\n');
  })
  .catch((error) => {
    if (error.message.includes('409')) {
      console.log('⚠️  Custom Object already exists!');
      console.log('   You can view it in HubSpot: Settings → Data Management → Objects\n');
      console.log('   If you need to update it, delete it first via the HubSpot UI or API.');
    } else {
      console.error('❌ Error creating custom object:');
      console.error(error.message);
      console.error('\nTroubleshooting:');
      console.error('  - Verify HUBSPOT_ACCESS_TOKEN is valid');
      console.error('  - Ensure your Private App has "crm.schemas.custom.write" scope');
      console.error('  - Check that your HubSpot account has Custom Objects enabled (Professional/Enterprise)');
    }
    process.exit(1);
  });
