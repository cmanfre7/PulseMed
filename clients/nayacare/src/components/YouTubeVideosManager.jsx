import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, ExternalLink, Play, Check, AlertCircle } from 'lucide-react';

const YouTubeVideosManager = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingVideo, setEditingVideo] = useState(null);
  const [statusMessage, setStatusMessage] = useState(null);

  const [formData, setFormData] = useState({
    videoUrl: '',
    title: '',
    description: '',
    category: 'general',
    tags: '',
    durationSeconds: 0,
    displayOrder: 999
  });

  const categories = [
    { value: 'breastfeeding', label: 'Breastfeeding Support', emoji: '🤱' },
    { value: 'sleep', label: 'Sleep Guidance', emoji: '😴' },
    { value: 'postpartum', label: 'Postpartum Recovery', emoji: '💝' },
    { value: 'development', label: 'Development Milestones', emoji: '📈' },
    { value: 'feeding', label: 'Feeding Schedules', emoji: '🍼' },
    { value: 'newborn', label: 'Newborn Care', emoji: '👶' },
    { value: 'general', label: 'General Guidance', emoji: '📚' }
  ];

  useEffect(() => {
    loadVideos();
  }, []);

  const loadVideos = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/videos');
      if (res.ok) {
        const data = await res.json();
        setVideos(data.videos || []);
      } else {
        showStatus('Failed to load videos', 'error');
      }
    } catch (err) {
      console.error('Error loading videos:', err);
      showStatus('Error loading videos', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showStatus = (message, type = 'success') => {
    setStatusMessage({ message, type });
    setTimeout(() => setStatusMessage(null), 5000);
  };

  const handleAddVideo = async (e) => {
    e.preventDefault();

    if (!formData.videoUrl || !formData.title) {
      showStatus('Please provide YouTube URL and title', 'error');
      return;
    }

    try {
      const res = await fetch('/api/admin/videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        showStatus('Video added successfully!', 'success');
        setShowAddModal(false);
        resetForm();
        loadVideos();
      } else {
        const data = await res.json();
        showStatus(data.error || 'Failed to add video', 'error');
      }
    } catch (err) {
      console.error('Error adding video:', err);
      showStatus('Error adding video', 'error');
    }
  };

  const handleUpdateVideo = async (e) => {
    e.preventDefault();

    if (!editingVideo) return;

    try {
      const res = await fetch(`/api/admin/videos?id=${editingVideo.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        showStatus('Video updated successfully!', 'success');
        setEditingVideo(null);
        resetForm();
        loadVideos();
      } else {
        const data = await res.json();
        showStatus(data.error || 'Failed to update video', 'error');
      }
    } catch (err) {
      console.error('Error updating video:', err);
      showStatus('Error updating video', 'error');
    }
  };

  const handleDeleteVideo = async (videoId) => {
    if (!confirm('Are you sure you want to delete this video? This cannot be undone.')) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/videos?id=${videoId}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        showStatus('Video deleted successfully', 'success');
        loadVideos();
      } else {
        showStatus('Failed to delete video', 'error');
      }
    } catch (err) {
      console.error('Error deleting video:', err);
      showStatus('Error deleting video', 'error');
    }
  };

  const startEdit = (video) => {
    setEditingVideo(video);
    setFormData({
      videoUrl: video.videoUrl,
      title: video.title,
      description: video.description,
      category: video.category,
      tags: video.tags,
      durationSeconds: video.durationSeconds,
      displayOrder: video.displayOrder
    });
  };

  const resetForm = () => {
    setFormData({
      videoUrl: '',
      title: '',
      description: '',
      category: 'general',
      tags: '',
      durationSeconds: 0,
      displayOrder: 999
    });
  };

  const cancelEdit = () => {
    setEditingVideo(null);
    resetForm();
  };

  const parseDuration = (input) => {
    // Parse "5:32" or "1:23:45" format
    const parts = input.split(':').map(Number);
    if (parts.length === 2) {
      return parts[0] * 60 + parts[1];
    } else if (parts.length === 3) {
      return parts[0] * 3600 + parts[1] * 60 + parts[2];
    }
    return 0;
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Educational Videos</h3>
          <p className="text-sm text-gray-500">Curated YouTube videos for patient education</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-gradient-to-r from-purple-400 to-purple-500 text-white px-4 py-2 rounded-lg hover:from-purple-500 hover:to-purple-600 transition-all duration-200 flex items-center gap-2 shadow-md"
        >
          <Plus className="w-4 h-4" />
          Add Video
        </button>
      </div>

      {/* Status Message */}
      {statusMessage && (
        <div className={`p-4 rounded-lg flex items-center ${
          statusMessage.type === 'success'
            ? 'bg-green-50 text-green-800 border border-green-200'
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {statusMessage.type === 'success' ? (
            <Check className="w-5 h-5 mr-2 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
          )}
          {statusMessage.message}
        </div>
      )}

      {/* Add/Edit Modal */}
      {(showAddModal || editingVideo) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-t-2xl flex items-center justify-between">
              <h3 className="text-xl font-bold">
                {editingVideo ? 'Edit Video' : 'Add New Video'}
              </h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  cancelEdit();
                }}
                className="text-white hover:bg-purple-700 rounded-full p-2 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={editingVideo ? handleUpdateVideo : handleAddVideo} className="p-6 space-y-4">
              {/* YouTube URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  YouTube URL *
                </label>
                <input
                  type="url"
                  value={formData.videoUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, videoUrl: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="https://www.youtube.com/watch?v=..."
                  required
                  disabled={!!editingVideo}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Supports: youtube.com/watch?v=..., youtu.be/..., youtube.com/embed/...
                </p>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Video Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="e.g., Breastfeeding Latch Techniques"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                  rows={3}
                  placeholder="Brief description of what the video covers..."
                />
              </div>

              {/* Category & Duration */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    {categories.map(cat => (
                      <key={cat.value} value={cat.value}>
                        {cat.emoji} {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Duration
                  </label>
                  <input
                    type="text"
                    value={formData.durationSeconds > 0
                      ? Math.floor(formData.durationSeconds / 60) + ':' + (formData.durationSeconds % 60).toString().padStart(2, '0')
                      : ''
                    }
                    onChange={(e) => {
                      const seconds = parseDuration(e.target.value);
                      setFormData(prev => ({ ...prev, durationSeconds: seconds }));
                    }}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="8:15"
                  />
                  <p className="text-xs text-gray-500 mt-1">Format: MM:SS or H:MM:SS</p>
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Search Tags
                </label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="latch, breastfeeding, blueprint (comma-separated)"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Keywords for AI to match user questions with this video
                </p>
              </div>

              {/* Display Order */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Display Order
                </label>
                <input
                  type="number"
                  value={formData.displayOrder}
                  onChange={(e) => setFormData(prev => ({ ...prev, displayOrder: parseInt(e.target.value) }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="1"
                  min="1"
                />
                <p className="text-xs text-gray-500 mt-1">Lower numbers appear first (1 = top)</p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    cancelEdit();
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white font-semibold rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all shadow-md"
                >
                  {editingVideo ? 'Update Video' : 'Add Video'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Videos Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent mx-auto"></div>
          <p className="text-gray-500 mt-4">Loading videos...</p>
        </div>
      ) : videos.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
          <Play className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-500 mb-2">No videos yet</h3>
          <p className="text-gray-400 mb-4">Add your first educational video to get started</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-gradient-to-r from-purple-400 to-purple-500 text-white px-6 py-2 rounded-lg hover:from-purple-500 hover:to-purple-600 transition-all"
          >
            Add Video
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {videos.map((video) => {
            const categoryData = categories.find(c => c.value === video.category) || categories[6];

            return (
              <div key={video.id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 overflow-hidden border border-gray-200">
                {/* Thumbnail */}
                <div className="relative">
                  <img
                    src={video.thumbnailUrl}
                    alt={video.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                    {video.durationDisplay || '0:00'}
                  </div>
                  <div className="absolute top-2 left-2">
                    <span className="bg-purple-500 text-white text-xs px-2 py-1 rounded">
                      {categoryData.emoji} {categoryData.label}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h4 className="font-semibold text-gray-800 mb-2 line-clamp-2">{video.title}</h4>
                  {video.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{video.description}</p>
                  )}

                  {video.tags && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {video.tags.split(',').slice(0, 3).map((tag, idx) => (
                        <span key={idx} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                          {tag.trim()}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-3 border-t">
                    <a
                      href={video.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                    >
                      <Play className="w-4 h-4" />
                      Watch
                    </a>
                    <button
                      onClick={() => startEdit(video)}
                      className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                      title="Edit video"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteVideo(video.id)}
                      className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete video"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default YouTubeVideosManager;
