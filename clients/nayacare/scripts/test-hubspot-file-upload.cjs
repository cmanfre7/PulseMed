/**
 * Test HubSpot File Upload API
 * Tests if access token has correct permissions for file uploads
 */

const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const HUBSPOT_ACCESS_TOKEN = process.env.HUBSPOT_ACCESS_TOKEN;

async function testFileUpload() {
  console.log('🧪 Testing HubSpot File Upload API...\n');

  // First, check if token has files scope
  console.log('1️⃣ Checking access token scopes...');
  try {
    const tokenResponse = await fetch('https://api.hubapi.com/oauth/v1/access-tokens/' + HUBSPOT_ACCESS_TOKEN);
    if (tokenResponse.ok) {
      const tokenData = await tokenResponse.json();
      console.log('✅ Token scopes:', tokenData.scopes || tokenData);

      if (!tokenData.scopes || !tokenData.scopes.includes('files')) {
        console.log('⚠️  WARNING: Token may not have "files" scope!');
        console.log('   You need to regenerate the token with "files" permission in HubSpot.\n');
      }
    } else {
      console.log('❌ Could not verify token scopes');
      console.log('   Response:', tokenResponse.status, tokenResponse.statusText);
    }
  } catch (err) {
    console.log('⚠️  Could not check token scopes:', err.message);
  }

  console.log('\n2️⃣ Testing file upload to HubSpot...');

  // Create a small test PDF
  const testPdfPath = path.join(__dirname, 'test-upload.pdf');
  const testPdfContent = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj
2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj
3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
/Resources <<
/Font <<
/F1 <<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
>>
>>
>>
endobj
4 0 obj
<<
/Length 44
>>
stream
BT
/F1 12 Tf
100 700 Td
(NayaCare Test PDF) Tj
ET
endstream
endobj
xref
0 5
0000000000 65535 f
0000000009 00000 n
0000000058 00000 n
0000000115 00000 n
0000000317 00000 n
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
409
%%EOF`;

  fs.writeFileSync(testPdfPath, testPdfContent);
  console.log('✅ Created test PDF:', testPdfPath);

  try {
    const formData = new FormData();
    formData.append('file', fs.createReadStream(testPdfPath), {
      filename: 'nayacare-test.pdf',
      contentType: 'application/pdf'
    });

    const options = {
      access: 'PUBLIC_INDEXABLE',
      overwrite: false,
      duplicateValidationStrategy: 'NONE',
      duplicateValidationScope: 'ENTIRE_PORTAL'
    };
    formData.append('options', JSON.stringify(options));
    formData.append('folderPath', '/nayacare-test');

    console.log('📤 Uploading to HubSpot Files API...');
    console.log('   Options:', options);

    const uploadResponse = await fetch('https://api.hubapi.com/files/v3/files', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${HUBSPOT_ACCESS_TOKEN}`,
        ...formData.getHeaders()
      },
      body: formData
    });

    console.log('\n📥 Response:', uploadResponse.status, uploadResponse.statusText);

    if (uploadResponse.ok) {
      const result = await uploadResponse.json();
      console.log('\n✅ SUCCESS! File uploaded to HubSpot:');
      console.log('   File ID:', result.id);
      console.log('   URL:', result.url);
      console.log('   File name:', result.name);
    } else {
      const errorText = await uploadResponse.text();
      console.log('\n❌ FAILED! Error response:');

      try {
        const errorData = JSON.parse(errorText);
        console.log(JSON.stringify(errorData, null, 2));
      } catch (e) {
        console.log(errorText.substring(0, 500));
      }
    }

  } catch (error) {
    console.error('\n❌ Error during upload:', error.message);
  } finally {
    // Clean up test file
    try {
      fs.unlinkSync(testPdfPath);
      console.log('\n🧹 Cleaned up test file');
    } catch (e) {
      // Ignore cleanup errors
    }
  }
}

testFileUpload();
