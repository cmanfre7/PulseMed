// Video Management API for NayaCare Admin Dashboard
// Uses HubSpot Custom Objects for permanent storage

const HUBSPOT_ACCESS_TOKEN = process.env.HUBSPOT_ACCESS_TOKEN;
const HUBSPOT_API_BASE = 'https://api.hubapi.com/crm/v3/objects/p243074330_educational_videos';

// Extract YouTube video ID from various URL formats
const extractYouTubeId = (url: string): string | null => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

interface Video {
  id: string;
  properties: {
    title: string;
    description: string;
    video_url: string;
    embed_url: string;
    category: string;
    thumbnail_url: string;
    duration: string;
    view_count: number;
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
          // Get single video
          const response = await fetch(`${HUBSPOT_API_BASE}/${id}`, {
            headers: {
              'Authorization': `Bearer ${HUBSPOT_ACCESS_TOKEN}`,
              'Content-Type': 'application/json'
            }
          });

          if (!response.ok) {
            return res.status(404).json({ error: 'Video not found' });
          }

          const data = await response.json();

          // Transform HubSpot format to frontend format
          const video = {
            id: data.id,
            title: data.properties.title,
            description: data.properties.description,
            videoUrl: data.properties.video_url,
            embedUrl: data.properties.embed_url,
            thumbnailUrl: data.properties.thumbnail_url,
            duration: data.properties.duration,
            viewCount: parseInt(data.properties.view_count) || 0,
            isActive: data.properties.is_active === 'true',
            createdAt: data.createdAt,
            updatedAt: data.updatedAt
          };

          return res.status(200).json({ video });
        } else {
          // Get all videos with explicit properties
          const properties = 'title,description,video_url,embed_url,thumbnail_url,duration,view_count,is_active';
          const response = await fetch(`${HUBSPOT_API_BASE}?limit=100&properties=${properties}`, {
            headers: {
              'Authorization': `Bearer ${HUBSPOT_ACCESS_TOKEN}`,
              'Content-Type': 'application/json'
            }
          });

          if (!response.ok) {
            const errorText = await response.text();
            console.error('HubSpot fetch videos failed:', {
              status: response.status,
              statusText: response.statusText,
              response: errorText.substring(0, 500)
            });
            throw new Error(`Failed to fetch videos from HubSpot (${response.status}): ${errorText.substring(0, 200)}`);
          }

          const responseText = await response.text();
          let data;
          try {
            data = JSON.parse(responseText);
          } catch (e) {
            console.error('Failed to parse HubSpot response:', responseText.substring(0, 500));
            throw new Error('HubSpot returned invalid JSON');
          }

          // Transform all videos
          let videos = data.results.map((item: any) => ({
            id: item.id,
            title: item.properties.title,
            description: item.properties.description,
            videoUrl: item.properties.video_url,
            embedUrl: item.properties.embed_url,
            thumbnailUrl: item.properties.thumbnail_url,
            duration: item.properties.duration,
            viewCount: parseInt(item.properties.view_count) || 0,
            isActive: item.properties.is_active === 'true',
            createdAt: item.createdAt,
            updatedAt: item.updatedAt
          }));

          // Apply filters
          const { category, active } = query;

          if (category && category !== 'all') {
            videos = videos.filter((v: any) => v.category === category);
          }

          if (active !== undefined) {
            videos = videos.filter((v: any) => v.isActive === (active === 'true'));
          }

          return res.status(200).json({ videos });
        }

      case 'POST':
        // Create new video
        const newVideoData = {
          properties: {
            title: req.body.title || '',
            description: req.body.description || '',
            video_url: req.body.videoUrl || '',
            embed_url: req.body.embedUrl || '',
            thumbnail_url: req.body.thumbnailUrl || '',
            duration: req.body.duration || '',
            view_count: '0',
            is_active: req.body.isActive !== false ? 'true' : 'false'
          }
        };

        // Validate required fields
        if (!newVideoData.properties.title.trim()) {
          return res.status(400).json({ error: 'Title is required' });
        }

        if (!newVideoData.properties.video_url.trim()) {
          return res.status(400).json({ error: 'Video URL is required' });
        }

        // Validate YouTube URL format
        const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
        if (!youtubeRegex.test(newVideoData.properties.video_url)) {
          return res.status(400).json({ error: 'Please provide a valid YouTube URL' });
        }

        // Extract YouTube video ID and generate metadata
        const videoId = extractYouTubeId(newVideoData.properties.video_url);
        if (videoId) {
          newVideoData.properties.embed_url = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`;
          newVideoData.properties.thumbnail_url = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
        }

        const createResponse = await fetch(HUBSPOT_API_BASE, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${HUBSPOT_ACCESS_TOKEN}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(newVideoData)
        });

        if (!createResponse.ok) {
          const error = await createResponse.json();
          throw new Error(error.message || 'Failed to create video');
        }

        const createdData = await createResponse.json();

        const createdVideo = {
          id: createdData.id,
          title: createdData.properties.title,
          description: createdData.properties.description,
          videoUrl: createdData.properties.video_url,
          embedUrl: createdData.properties.embed_url,
          thumbnailUrl: createdData.properties.thumbnail_url,
          duration: createdData.properties.duration,
          viewCount: parseInt(createdData.properties.view_count) || 0,
          isActive: createdData.properties.is_active === 'true',
          createdAt: createdData.createdAt,
          updatedAt: createdData.updatedAt
        };

        return res.status(201).json({
          message: 'Video created successfully',
          video: createdVideo
        });

      case 'PUT':
        // Update existing video
        const updateData = {
          properties: {} as any
        };

        // Only include fields that are being updated
        if (req.body.title !== undefined) updateData.properties.title = req.body.title;
        if (req.body.description !== undefined) updateData.properties.description = req.body.description;
        if (req.body.videoUrl !== undefined) updateData.properties.video_url = req.body.videoUrl;
        if (req.body.embedUrl !== undefined) updateData.properties.embed_url = req.body.embedUrl;
        if (req.body.thumbnailUrl !== undefined) updateData.properties.thumbnail_url = req.body.thumbnailUrl;
        if (req.body.duration !== undefined) updateData.properties.duration = req.body.duration;
        if (req.body.viewCount !== undefined) updateData.properties.view_count = req.body.viewCount.toString();
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
          return res.status(404).json({ error: 'Video not found' });
        }

        const updatedData = await updateResponse.json();

        const updatedVideo = {
          id: updatedData.id,
          title: updatedData.properties.title,
          description: updatedData.properties.description,
          videoUrl: updatedData.properties.video_url,
          embedUrl: updatedData.properties.embed_url,
          thumbnailUrl: updatedData.properties.thumbnail_url,
          duration: updatedData.properties.duration,
          viewCount: parseInt(updatedData.properties.view_count) || 0,
          isActive: updatedData.properties.is_active === 'true',
          createdAt: updatedData.createdAt,
          updatedAt: updatedData.updatedAt
        };

        return res.status(200).json({
          message: 'Video updated successfully',
          video: updatedVideo
        });

      case 'DELETE':
        // Delete video
        const deleteResponse = await fetch(`${HUBSPOT_API_BASE}/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${HUBSPOT_ACCESS_TOKEN}`
          }
        });

        if (!deleteResponse.ok) {
          return res.status(404).json({ error: 'Video not found' });
        }

        return res.status(200).json({
          message: 'Video deleted successfully'
        });

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(405).json({ error: `Method ${method} Not Allowed` });
    }
  } catch (error) {
    console.error('Video API Error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
