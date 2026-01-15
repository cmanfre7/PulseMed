import type { VercelRequest, VercelResponse } from '@vercel/node';

const HUBSPOT_ACCESS_TOKEN = process.env.HUBSPOT_ACCESS_TOKEN;
const HUBSPOT_API_BASE = 'https://api.hubapi.com';
const VIDEO_OBJECT_TYPE_ID = '2-174859497'; // From create-youtube-schema.js

/**
 * Extract YouTube video ID from various URL formats
 */
function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
    /youtube\.com\/embed\/([^&\n?#]+)/,
    /youtube\.com\/v\/([^&\n?#]+)/
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

/**
 * Convert seconds to MM:SS or HH:MM:SS format
 */
function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Admin API: Manage Educational YouTube Videos
 *
 * GET    /api/admin/youtube-videos          - List all videos
 * POST   /api/admin/youtube-videos          - Add new video
 * PUT    /api/admin/youtube-videos/:id      - Update video
 * DELETE /api/admin/youtube-videos/:id      - Delete video
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (!HUBSPOT_ACCESS_TOKEN) {
    return res.status(500).json({ error: 'HubSpot access token not configured' });
  }

  try {
    // GET: List all videos
    if (req.method === 'GET') {
      const hubspotResponse = await fetch(
        `${HUBSPOT_API_BASE}/crm/v3/objects/${VIDEO_OBJECT_TYPE_ID}?limit=100&properties=video_id,video_url,title,description,category,tags,duration_seconds,duration_display,thumbnail_url,view_count,published_at,display_order,is_active`,
        {
          headers: {
            'Authorization': `Bearer ${HUBSPOT_ACCESS_TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const data = await hubspotResponse.json();

      if (!hubspotResponse.ok) {
        console.error('HubSpot API Error:', data);
        return res.status(500).json({ error: 'Failed to fetch videos from HubSpot', details: data });
      }

      const videos = data.results.map((video: any) => ({
        id: video.id,
        videoId: video.properties.video_id,
        videoUrl: video.properties.video_url,
        title: video.properties.title,
        description: video.properties.description,
        category: video.properties.category,
        tags: video.properties.tags,
        durationSeconds: parseInt(video.properties.duration_seconds) || 0,
        durationDisplay: video.properties.duration_display,
        thumbnailUrl: video.properties.thumbnail_url,
        viewCount: parseInt(video.properties.view_count) || 0,
        publishedAt: video.properties.published_at,
        displayOrder: parseInt(video.properties.display_order) || 999,
        isActive: video.properties.is_active === 'true'
      }));

      // Sort by display order
      videos.sort((a, b) => a.displayOrder - b.displayOrder);

      return res.status(200).json({ videos });
    }

    // POST: Add new video
    if (req.method === 'POST') {
      const { videoUrl, title, description, category, tags, durationSeconds, displayOrder } = req.body;

      if (!videoUrl || !title) {
        return res.status(400).json({ error: 'videoUrl and title are required' });
      }

      const videoId = extractVideoId(videoUrl);
      if (!videoId) {
        return res.status(400).json({ error: 'Invalid YouTube URL' });
      }

      // Generate thumbnail URL from video ID
      const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
      const durationDisplay = formatDuration(durationSeconds || 0);

      const properties = {
        video_id: videoId,
        video_url: videoUrl,
        title: title,
        description: description || '',
        category: category || 'general',
        tags: tags || '',
        duration_seconds: durationSeconds || 0,
        duration_display: durationDisplay,
        thumbnail_url: thumbnailUrl,
        view_count: 0,
        published_at: new Date().toISOString(),
        display_order: displayOrder || 999,
        is_active: true
      };

      const hubspotResponse = await fetch(
        `${HUBSPOT_API_BASE}/crm/v3/objects/${VIDEO_OBJECT_TYPE_ID}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${HUBSPOT_ACCESS_TOKEN}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ properties })
        }
      );

      const data = await hubspotResponse.json();

      if (!hubspotResponse.ok) {
        console.error('HubSpot API Error:', data);
        return res.status(500).json({ error: 'Failed to create video in HubSpot', details: data });
      }

      return res.status(201).json({
        message: 'Video added successfully',
        video: {
          id: data.id,
          videoId,
          videoUrl,
          title,
          thumbnailUrl
        }
      });
    }

    // PUT: Update video
    if (req.method === 'PUT') {
      const videoId = req.query.id || req.body.id;

      if (!videoId) {
        return res.status(400).json({ error: 'Video ID is required' });
      }

      const { title, description, category, tags, durationSeconds, displayOrder, isActive } = req.body;

      const properties: any = {};
      if (title !== undefined) properties.title = title;
      if (description !== undefined) properties.description = description;
      if (category !== undefined) properties.category = category;
      if (tags !== undefined) properties.tags = tags;
      if (durationSeconds !== undefined) {
        properties.duration_seconds = durationSeconds;
        properties.duration_display = formatDuration(durationSeconds);
      }
      if (displayOrder !== undefined) properties.display_order = displayOrder;
      if (isActive !== undefined) properties.is_active = isActive;

      const hubspotResponse = await fetch(
        `${HUBSPOT_API_BASE}/crm/v3/objects/${VIDEO_OBJECT_TYPE_ID}/${videoId}`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${HUBSPOT_ACCESS_TOKEN}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ properties })
        }
      );

      const data = await hubspotResponse.json();

      if (!hubspotResponse.ok) {
        console.error('HubSpot API Error:', data);
        return res.status(500).json({ error: 'Failed to update video in HubSpot', details: data });
      }

      return res.status(200).json({ message: 'Video updated successfully', video: data });
    }

    // DELETE: Remove video
    if (req.method === 'DELETE') {
      const videoId = req.query.id;

      if (!videoId) {
        return res.status(400).json({ error: 'Video ID is required' });
      }

      const hubspotResponse = await fetch(
        `${HUBSPOT_API_BASE}/crm/v3/objects/${VIDEO_OBJECT_TYPE_ID}/${videoId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${HUBSPOT_ACCESS_TOKEN}`
          }
        }
      );

      if (!hubspotResponse.ok) {
        const data = await hubspotResponse.json();
        console.error('HubSpot API Error:', data);
        return res.status(500).json({ error: 'Failed to delete video from HubSpot', details: data });
      }

      return res.status(200).json({ message: 'Video deleted successfully' });
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error: any) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}
