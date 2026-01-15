// PDF Upload API for Resource Manager
// Uploads PDFs to HubSpot File Manager using the same method as Knowledge Base

import multiparty from 'multiparty';
import fs from 'fs';
import FormData from 'form-data';
import https from 'https';
import { URL } from 'url';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: any, res: any) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const form = new multiparty.Form();

    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error('Form parsing error:', err);
        return res.status(400).json({ error: 'Error parsing form data' });
      }

      const file = files.file?.[0];
      const resourceId = fields.resourceId?.[0];

      if (!file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      // Validate file type
      if (file.headers['content-type'] !== 'application/pdf') {
        return res.status(400).json({ error: 'Only PDF files are allowed' });
      }

      // Validate file size (100MB limit - Railway's limit)
      const maxSize = 100 * 1024 * 1024; // 100MB in bytes
      if (file.size > maxSize) {
        return res.status(400).json({ error: 'File size must be less than 100MB' });
      }

      try {
        // Upload PDF to HubSpot File Manager using the same class as Knowledge Base
        const fileName = file.originalFilename || `resource_${Date.now()}.pdf`;

        console.log('Uploading PDF to HubSpot:', {
          originalName: file.originalFilename,
          size: file.size,
          type: file.headers['content-type'],
          resourceId: resourceId || 'new'
        });

        // Upload directly to flat HubSpot folder (no category subfolders)
        console.log('⬆️  Uploading to HubSpot File Manager: nayacare_patient_resources...');

        // Use FormData with native https module (fetch doesn't support streams properly)
        const formData = new FormData();

        // Append file as a stream (preserves binary data)
        formData.append('file', fs.createReadStream(file.path), {
          filename: fileName,
          contentType: 'application/pdf',
          knownLength: file.size
        });

        // Add folder path
        formData.append('folderPath', '/nayacare_patient_resources');

        // Add options
        formData.append('options', JSON.stringify({
          access: 'PUBLIC_INDEXABLE',
          ttl: 'P3M',
          overwrite: false,
          duplicateValidationStrategy: 'NONE',
          duplicateValidationScope: 'ENTIRE_PORTAL'
        }));

        console.log('📤 Uploading with https module (fetch incompatible with FormData streams)...');

        // Use native https module instead of fetch
        const hubspotData: any = await new Promise((resolve, reject) => {
          const url = new URL('https://api.hubapi.com/files/v3/files');

          const options = {
            hostname: url.hostname,
            path: url.pathname,
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${process.env.HUBSPOT_ACCESS_TOKEN}`,
              ...formData.getHeaders()
            }
          };

          const req = https.request(options, (res) => {
            let data = '';

            res.on('data', (chunk) => {
              data += chunk;
            });

            res.on('end', () => {
              console.log('HubSpot response status:', res.statusCode);

              if (res.statusCode !== 200 && res.statusCode !== 201) {
                console.error('HubSpot upload failed:', data);
                reject(new Error(`HubSpot upload failed: ${res.statusCode} - ${data}`));
              } else {
                try {
                  const jsonData = JSON.parse(data);
                  resolve(jsonData);
                } catch (e) {
                  reject(new Error('Failed to parse HubSpot response'));
                }
              }
            });
          });

          req.on('error', (error) => {
            console.error('Request error:', error);
            reject(error);
          });

          // Pipe the form data to the request
          formData.pipe(req);
        });
        const fileId = hubspotData.id;

        // Use the URL exactly as HubSpot returns it (DO NOT convert)
        // HubSpot returns: https://PORTALID.fs1.hubspotusercontent-na2.net/hubfs/...
        // This format WORKS - don't change it!
        const fileUrl = hubspotData.url || hubspotData.defaultHostingUrl;

        console.log('✅ PDF uploaded to HubSpot successfully:', {
          fileId,
          url: fileUrl,
          fileName
        });

        // Clean up temporary file
        try {
          fs.unlinkSync(file.path);
        } catch (cleanupError) {
          console.warn('Failed to cleanup temp file:', cleanupError);
        }

        return res.status(200).json({
          success: true,
          message: 'PDF uploaded successfully to HubSpot',
          fileName: fileName,
          pdfUrl: fileUrl, // This is the permanent HubSpot URL
          fileId: fileId,
          size: file.size,
          resourceId: resourceId || null
        });

      } catch (uploadError) {
        console.error('Upload processing error:', uploadError);

        // Clean up temporary file on error
        try {
          if (file?.path) {
            fs.unlinkSync(file.path);
          }
        } catch (cleanupError) {
          console.warn('Failed to cleanup temp file on error:', cleanupError);
        }

        return res.status(500).json({
          error: 'Error uploading file to HubSpot',
          message: uploadError instanceof Error ? uploadError.message : 'Unknown error'
        });
      }
    });

  } catch (error) {
    console.error('Upload API Error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
