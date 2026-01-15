// Resource Management API for NayaCare Admin Dashboard
// Uses HubSpot Custom Objects for permanent storage

const HUBSPOT_ACCESS_TOKEN = process.env.HUBSPOT_ACCESS_TOKEN;
const HUBSPOT_API_BASE = 'https://api.hubapi.com/crm/v3/objects/p243074330_patient_resources';

interface Resource {
  id: string;
  properties: {
    title: string;
    category: string;
    description: string;
    icon: string;
    pdf_url?: string;
    file_name?: string;
    download_count: number;
    is_active: string; // 'true' or 'false' as string in HubSpot
  };
  createdAt?: string;
  updatedAt?: string;
}

export default async function handler(req: any, res: any) {
  const { method, query } = req;
  const { id } = query;

  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (!HUBSPOT_ACCESS_TOKEN) {
    return res.status(500).json({ error: 'HubSpot access token not configured' });
  }

  try {
    switch (method) {
      case 'GET':
        if (id) {
          // Get single resource
          const response = await fetch(`${HUBSPOT_API_BASE}/${id}`, {
            headers: {
              'Authorization': `Bearer ${HUBSPOT_ACCESS_TOKEN}`,
              'Content-Type': 'application/json'
            }
          });

          if (!response.ok) {
            return res.status(404).json({ error: 'Resource not found' });
          }

          const data = await response.json();

          // Transform HubSpot format to frontend format
          const resource = {
            id: data.id,
            title: data.properties.title,
            category: data.properties.category,
            description: data.properties.description,
            icon: data.properties.icon,
            pdfUrl: data.properties.pdf_url,
            fileName: data.properties.file_name,
            downloadCount: parseInt(data.properties.download_count) || 0,
            isActive: data.properties.is_active === 'true',
            createdAt: data.createdAt,
            updatedAt: data.updatedAt
          };

          return res.status(200).json({ resource });
        } else {
          // Get all resources with ALL properties explicitly requested
          const properties = 'title,category,description,icon,pdf_url,file_name,download_count,is_active';
          const response = await fetch(`${HUBSPOT_API_BASE}?limit=100&properties=${properties}`, {
            headers: {
              'Authorization': `Bearer ${HUBSPOT_ACCESS_TOKEN}`,
              'Content-Type': 'application/json'
            }
          });

          if (!response.ok) {
            const errorText = await response.text();
            console.error('HubSpot fetch resources failed:', {
              status: response.status,
              statusText: response.statusText,
              response: errorText.substring(0, 500)
            });
            throw new Error(`Failed to fetch resources from HubSpot (${response.status}): ${errorText.substring(0, 200)}`);
          }

          const responseText = await response.text();
          let data;
          try {
            data = JSON.parse(responseText);
          } catch (e) {
            console.error('Failed to parse HubSpot response:', responseText.substring(0, 500));
            throw new Error('HubSpot returned invalid JSON');
          }

          // Transform all resources
          console.log(`📋 HubSpot returned ${data.results.length} resources`);
          if (data.results.length > 0) {
            console.log('🔍 First resource properties:', data.results[0].properties);
          }

          let resources = data.results.map((item: any) => ({
            id: item.id,
            title: item.properties.title,
            category: item.properties.category,
            description: item.properties.description,
            icon: item.properties.icon,
            pdfUrl: item.properties.pdf_url,
            fileName: item.properties.file_name,
            downloadCount: parseInt(item.properties.download_count) || 0,
            isActive: item.properties.is_active === 'true',
            createdAt: item.createdAt,
            updatedAt: item.updatedAt
          }));

          console.log(`📤 Returning ${resources.length} resources to frontend`);
          if (resources.length > 0) {
            console.log('🔍 First resource:', resources[0]);
          }

          // Apply filters
          const { category, active } = query;

          if (category && category !== 'all') {
            resources = resources.filter((r: any) => r.category === category);
          }

          if (active !== undefined) {
            resources = resources.filter((r: any) => r.isActive === (active === 'true'));
          }

          return res.status(200).json({ resources });
        }

      case 'POST':
        // Create new resource
        console.log('📥 Creating resource with body:', req.body);

        const newResourceData = {
          properties: {
            title: req.body.title || '',
            category: req.body.category || 'General',
            description: req.body.description || '',
            icon: req.body.icon || 'FileText',
            pdf_url: req.body.pdfUrl || '',
            file_name: req.body.fileName || '',
            download_count: '0',
            is_active: req.body.isActive !== false ? 'true' : 'false'
          }
        };

        console.log('📤 Sending to HubSpot:', JSON.stringify(newResourceData, null, 2));

        // Validate required fields
        if (!newResourceData.properties.title.trim()) {
          return res.status(400).json({ error: 'Title is required' });
        }

        const createResponse = await fetch(HUBSPOT_API_BASE, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${HUBSPOT_ACCESS_TOKEN}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(newResourceData)
        });

        if (!createResponse.ok) {
          const error = await createResponse.json();
          throw new Error(error.message || 'Failed to create resource');
        }

        const createdData = await createResponse.json();

        console.log('✅ HubSpot response:', JSON.stringify(createdData, null, 2));

        const createdResource = {
          id: createdData.id,
          title: createdData.properties.title,
          category: createdData.properties.category,
          description: createdData.properties.description,
          icon: createdData.properties.icon,
          pdfUrl: createdData.properties.pdf_url,
          fileName: createdData.properties.file_name,
          downloadCount: parseInt(createdData.properties.download_count) || 0,
          isActive: createdData.properties.is_active === 'true',
          createdAt: createdData.createdAt,
          updatedAt: createdData.updatedAt
        };

        console.log('🎯 Returning to frontend:', createdResource);

        return res.status(201).json({
          message: 'Resource created successfully',
          resource: createdResource
        });

      case 'PUT':
        // Update existing resource
        const updateData = {
          properties: {} as any
        };

        // Only include fields that are being updated
        if (req.body.title !== undefined) updateData.properties.title = req.body.title;
        if (req.body.category !== undefined) updateData.properties.category = req.body.category;
        if (req.body.description !== undefined) updateData.properties.description = req.body.description;
        if (req.body.icon !== undefined) updateData.properties.icon = req.body.icon;
        if (req.body.pdfUrl !== undefined) updateData.properties.pdf_url = req.body.pdfUrl;
        if (req.body.fileName !== undefined) updateData.properties.file_name = req.body.fileName;
        if (req.body.downloadCount !== undefined) updateData.properties.download_count = req.body.downloadCount.toString();
        if (req.body.isActive !== undefined) updateData.properties.is_active = req.body.isActive ? 'true' : 'false';

        const updateResponse = await fetch(`${HUBSPOT_API_BASE}/${id}`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${HUBSPOT_ACCESS_TOKEN}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(updateData)
        });

        if (!updateResponse.ok) {
          return res.status(404).json({ error: 'Resource not found' });
        }

        const updatedData = await updateResponse.json();

        const updatedResource = {
          id: updatedData.id,
          title: updatedData.properties.title,
          category: updatedData.properties.category,
          description: updatedData.properties.description,
          icon: updatedData.properties.icon,
          pdfUrl: updatedData.properties.pdf_url,
          fileName: updatedData.properties.file_name,
          downloadCount: parseInt(updatedData.properties.download_count) || 0,
          isActive: updatedData.properties.is_active === 'true',
          createdAt: updatedData.createdAt,
          updatedAt: updatedData.updatedAt
        };

        return res.status(200).json({
          message: 'Resource updated successfully',
          resource: updatedResource
        });

      case 'DELETE':
        // Delete resource
        const deleteResponse = await fetch(`${HUBSPOT_API_BASE}/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${HUBSPOT_ACCESS_TOKEN}`
          }
        });

        if (!deleteResponse.ok) {
          return res.status(404).json({ error: 'Resource not found' });
        }

        return res.status(200).json({
          message: 'Resource deleted successfully'
        });

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(405).json({ error: `Method ${method} Not Allowed` });
    }
  } catch (error) {
    console.error('Resource API Error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
