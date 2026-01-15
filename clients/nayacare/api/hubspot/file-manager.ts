/**
 * HubSpot File Manager API
 * Handles PDF uploads to HubSpot File Manager and Custom Object storage
 */

import FormData from 'form-data';

const HUBSPOT_ACCESS_TOKEN = process.env.HUBSPOT_ACCESS_TOKEN;
const HUBSPOT_PORTAL_ID = process.env.HUBSPOT_PORTAL_ID;

export interface KnowledgeBaseDocument {
  id: string;
  title: string;
  fileName: string;
  category: string;
  fileUrl: string;
  hubspotFileId: string;
  pages: number;
  sizeKB: number;
  uploadedAt: string;
  description?: string;
  chunks: number;
  textContent?: string;
}

export class HubSpotFileManager {
  private filesBaseUrl = 'https://api.hubapi.com/files/v3/files';
  private customObjectsBaseUrl = 'https://api.hubapi.com/crm/v3/objects/2-174458678';

  /**
   * Upload PDF file to HubSpot File Manager
   */
  async uploadFile(
    fileBuffer: Buffer,
    fileName: string,
    category: string
  ): Promise<{ fileId: string; fileUrl: string }> {
    try {
      console.log('📤 Uploading to HubSpot File Manager:', fileName);
      console.log('   File size:', fileBuffer.length, 'bytes');
      console.log('   API endpoint:', this.filesBaseUrl);
      console.log('   Has token:', !!HUBSPOT_ACCESS_TOKEN);

      // Convert buffer to base64 for better compatibility
      const base64Content = fileBuffer.toString('base64');

      // Use HubSpot's file upload endpoint with proper multipart/form-data
      const boundary = `----WebKitFormBoundary${Math.random().toString(36).substring(2)}`;

      let body = '';
      body += `--${boundary}\r\n`;
      body += `Content-Disposition: form-data; name="file"; filename="${fileName}"\r\n`;
      body += `Content-Type: application/pdf\r\n\r\n`;
      body += fileBuffer.toString('binary');
      body += `\r\n`;

      // Add folderPath (required by HubSpot)
      body += `--${boundary}\r\n`;
      body += `Content-Disposition: form-data; name="folderPath"\r\n\r\n`;
      body += `/nayacare-pdfs/${category}`;
      body += `\r\n`;

      body += `--${boundary}\r\n`;
      body += `Content-Disposition: form-data; name="options"\r\n\r\n`;
      body += JSON.stringify({
        access: 'PUBLIC_INDEXABLE',
        ttl: 'P3M',
        overwrite: false,
        duplicateValidationStrategy: 'NONE',
        duplicateValidationScope: 'ENTIRE_PORTAL'
      });
      body += `\r\n`;
      body += `--${boundary}--\r\n`;

      const response = await fetch(this.filesBaseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${HUBSPOT_ACCESS_TOKEN}`,
          'Content-Type': `multipart/form-data; boundary=${boundary}`
        },
        body: body
      });

      console.log('   Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('   HubSpot upload error:', errorText);

        // Try to parse JSON error for better debugging
        try {
          const errorJson = JSON.parse(errorText);
          console.error('   Parsed error:', errorJson);
          throw new Error(`HubSpot file upload failed: ${response.status} - ${errorJson.message || errorText}`);
        } catch (parseErr) {
          throw new Error(`HubSpot file upload failed: ${response.status} - ${errorText}`);
        }
      }

      const data = await response.json();
      console.log('   ✅ Upload successful:', data.id);
      console.log('   📋 Full response data:', JSON.stringify(data, null, 2));

      // IMPORTANT: HubSpot returns URLs in the format:
      // https://PORTALID.fs1.hubspotusercontent-na2.net/hubfs/PORTALID/path/file.pdf
      //
      // But these URLs often fail to load PDFs. The reliable public CDN URL is:
      // https://fs.hubspotusercontent00.net/hubfs/PORTALID/path/file.pdf
      //
      // We need to convert the URL format for reliable downloads

      let publicUrl = data.url || data.defaultHostingUrl;

      // Convert portal-specific domain to public CDN domain
      if (publicUrl && publicUrl.includes('.hubspotusercontent-')) {
        // Extract the path after /hubfs/
        const match = publicUrl.match(/\/hubfs\/(.*)/);
        if (match) {
          publicUrl = `https://fs.hubspotusercontent00.net/hubfs/${match[1]}`;
          console.log('   🔄 Converted to public CDN URL:', publicUrl);
        }
      }

      console.log('   🌐 Final public URL:', publicUrl);

      return {
        fileId: data.id,
        fileUrl: publicUrl
      };
    } catch (error) {
      console.error('Error uploading to HubSpot File Manager:', error);
      throw error;
    }
  }

  /**
   * Get or create folder for category
   */
  private async getCategoryFolderId(category: string): Promise<string> {
    // For now, return root folder. In production, create category-specific folders
    // You can implement folder creation via: POST /files/v3/folders
    return 'root';
  }

  /**
   * Create knowledge base document record in HubSpot Custom Object
   */
  async createKnowledgeBaseRecord(document: Omit<KnowledgeBaseDocument, 'id'>): Promise<string> {
    try {
      const textContentToSave = document.textContent || '';

      console.log(`🔧 [HubSpot API] Creating record for: ${document.fileName}`);
      console.log(`   text_content length: ${textContentToSave.length} chars`);
      console.log(`   text_content preview: "${textContentToSave.substring(0, 50)}..."`);

      const payload = {
        properties: {
          title: document.title,
          file_name: document.fileName,
          category: document.category,
          file_url: document.fileUrl,
          hubspot_file_id: document.hubspotFileId,
          pages: document.pages,
          size_kb: document.sizeKB,
          uploaded_at: document.uploadedAt,
          description: document.description || '',
          chunks: document.chunks,
          text_content: textContentToSave
        }
      };

      console.log(`   📤 Sending to HubSpot: ${this.customObjectsBaseUrl}`);

      const response = await fetch(this.customObjectsBaseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${HUBSPOT_ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      console.log(`   📥 HubSpot response: ${response.status}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`   ❌ HubSpot error response: ${errorText}`);
        throw new Error(`Failed to create knowledge base record: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log(`   ✅ Record created with ID: ${data.id}`);

      // Verify what was saved
      if (data.properties && data.properties.text_content) {
        console.log(`   ✅ text_content WAS saved (${data.properties.text_content.length} chars)`);
      } else {
        console.warn(`   ⚠️ text_content NOT in response - may not have been saved!`);
      }

      return data.id;
    } catch (error) {
      console.error('Error creating knowledge base record:', error);
      throw error;
    }
  }

  /**
   * Get all knowledge base documents
   */
  async getAllDocuments(): Promise<KnowledgeBaseDocument[]> {
    try {
      // Specify all properties to retrieve (INCLUDING text_content!)
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
        'text_content'  // CRITICAL: This contains the actual PDF text!
      ].join(',');

      const response = await fetch(
        `${this.customObjectsBaseUrl}?limit=100&properties=${properties}`,
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
        console.error('HubSpot getAllDocuments error:', response.status, errorText);
        throw new Error(`Failed to get documents: ${response.status} - ${errorText}`);
      }

      const data = await response.json();

      return data.results.map((item: any) => ({
        id: item.id,
        title: item.properties.title,
        fileName: item.properties.file_name,
        category: item.properties.category,
        fileUrl: item.properties.file_url,
        hubspotFileId: item.properties.hubspot_file_id,
        pages: parseInt(item.properties.pages) || 0,
        sizeKB: parseInt(item.properties.size_kb) || 0,
        uploadedAt: item.properties.uploaded_at,
        description: item.properties.description,
        chunks: parseInt(item.properties.chunks) || 0,
        textContent: item.properties.text_content  // CRITICAL: Include the PDF text content!
      }));
    } catch (error) {
      console.error('Error getting documents from HubSpot:', error);
      return [];
    }
  }

  /**
   * Search knowledge base documents by query
   */
  async searchDocuments(query: string, category?: string): Promise<KnowledgeBaseDocument[]> {
    try {
      const filters: any[] = [];

      if (category) {
        filters.push({
          propertyName: 'category',
          operator: 'EQ',
          value: category
        });
      }

      const response = await fetch(
        `${this.customObjectsBaseUrl}/search`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${HUBSPOT_ACCESS_TOKEN}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            filterGroups: filters.length > 0 ? [{ filters }] : [],
            query: query,
            properties: ['title', 'file_name', 'category', 'file_url', 'hubspot_file_id', 'pages', 'size_kb', 'uploaded_at', 'description', 'chunks', 'text_content'],
            limit: 100
          })
        }
      );

      if (!response.ok) {
        throw new Error(`Search failed: ${response.status}`);
      }

      const data = await response.json();

      return data.results.map((item: any) => ({
        id: item.id,
        title: item.properties.title,
        fileName: item.properties.file_name,
        category: item.properties.category,
        fileUrl: item.properties.file_url,
        hubspotFileId: item.properties.hubspot_file_id,
        pages: parseInt(item.properties.pages) || 0,
        sizeKB: parseInt(item.properties.size_kb) || 0,
        uploadedAt: item.properties.uploaded_at,
        description: item.properties.description,
        chunks: parseInt(item.properties.chunks) || 0,
        textContent: item.properties.text_content
      }));
    } catch (error) {
      console.error('Error searching documents:', error);
      return [];
    }
  }

  /**
   * Delete document (both file and record)
   */
  async deleteDocument(documentId: string, hubspotFileId: string): Promise<void> {
    try {
      // Delete custom object record
      await fetch(`${this.customObjectsBaseUrl}/${documentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${HUBSPOT_ACCESS_TOKEN}`
        }
      });

      // Delete file from File Manager
      await fetch(`${this.filesBaseUrl}/${hubspotFileId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${HUBSPOT_ACCESS_TOKEN}`
        }
      });
    } catch (error) {
      console.error('Error deleting document:', error);
      throw error;
    }
  }

  /**
   * Update document metadata
   */
  async updateDocument(documentId: string, updates: Partial<KnowledgeBaseDocument>): Promise<void> {
    try {
      const properties: any = {};

      if (updates.title) properties.title = updates.title;
      if (updates.category) properties.category = updates.category;
      if (updates.description !== undefined) properties.description = updates.description;

      await fetch(`${this.customObjectsBaseUrl}/${documentId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${HUBSPOT_ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ properties })
      });
    } catch (error) {
      console.error('Error updating document:', error);
      throw error;
    }
  }
}

export default HubSpotFileManager;
