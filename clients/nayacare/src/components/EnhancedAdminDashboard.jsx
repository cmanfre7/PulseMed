import React, { useState, useCallback, useEffect } from 'react';
import { Upload, File, Trash2, CheckCircle, AlertCircle, Loader, FolderOpen, X, Video, Link, Edit, Plus, Save, FileText, Youtube, Play } from 'lucide-react';

const EnhancedAdminDashboard = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState('knowledge');
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [knowledgeBase, setKnowledgeBase] = useState([]);
  const [resources, setResources] = useState([]);
  const [videos, setVideos] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [uploadStatus, setUploadStatus] = useState(null);
  const [editingVideo, setEditingVideo] = useState(null);
  const [editingResource, setEditingResource] = useState(null);

  const categories = [
    { id: 'all', name: 'All Documents', icon: FolderOpen },
    { id: 'breastfeeding', name: 'Breastfeeding', icon: '🤱' },
    { id: 'newborn-care', name: 'Newborn Care', icon: '👶' },
    { id: 'postpartum', name: 'Postpartum Recovery', icon: '💝' },
    { id: 'sleep', name: 'Sleep Guidance', icon: '😴' },
    { id: 'feeding', name: 'Feeding & Nutrition', icon: '🍼' },
    { id: 'development', name: 'Development', icon: '📈' },
    { id: 'safety', name: 'Safety & Emergency', icon: '🚨' },
    { id: 'wellness', name: 'Wellness', icon: '💚' },
    { id: 'skin-care', name: 'Skin Care', icon: '🧴' }
  ];

  const videoCategories = [
    { id: 'newborn-care', name: 'Newborn Care', color: 'bg-pink-100 text-pink-700' },
    { id: 'feeding', name: 'Feeding', color: 'bg-orange-100 text-orange-700' },
    { id: 'sleep', name: 'Sleep', color: 'bg-purple-100 text-purple-700' },
    { id: 'recovery', name: 'Recovery', color: 'bg-red-100 text-red-700' },
    { id: 'development', name: 'Development', color: 'bg-blue-100 text-blue-700' },
    { id: 'mental-health', name: 'Mental Health', color: 'bg-green-100 text-green-700' }
  ];

  // Load all data on mount
  useEffect(() => {
    loadKnowledgeBase();
    loadResources();
    loadVideos();
  }, []);

  const loadKnowledgeBase = async () => {
    try {
      const res = await fetch('/api/admin/knowledge-base');
      if (res.ok) {
        const data = await res.json();
        setKnowledgeBase(data.documents || []);
      }
    } catch (err) {
      console.error('Failed to load knowledge base:', err);
    }
  };

  const loadResources = async () => {
    try {
      const res = await fetch('/api/admin/resources');
      if (res.ok) {
        const data = await res.json();
        setResources(data.resources || [
          // Default resources including your Safe Sleep PDF
          {
            id: 'res_1',
            title: 'Safe Sleep for Your Baby',
            category: 'sleep',
            description: 'AAP-aligned safe sleep practices',
            fileName: 'Safe Sleep for Your Baby.pdf',
            path: 'AI Intellect Pool/Sleep Resources/Safe Sleep for Your Baby.pdf',
            downloads: 234,
            active: true
          },
          {
            id: 'res_2',
            title: '30 Day Breastfeeding BluePrint',
            category: 'feeding',
            description: 'Comprehensive breastfeeding guide',
            fileName: '30 Day Breastfeeding BluePrint.pdf',
            path: 'AI Intellect Pool/Breastfeeding Resources/30 Day Breastfeeding BluePrint.pdf',
            downloads: 312,
            active: true
          },
          {
            id: 'res_3',
            title: 'Postpartum Recovery Timeline',
            category: 'recovery',
            description: 'Week-by-week healing guide',
            downloads: 187,
            active: true
          },
          {
            id: 'res_4',
            title: 'When to Call the Doctor',
            category: 'emergency',
            description: 'Red flag symptoms guide',
            downloads: 423,
            active: true
          }
        ]);
      }
    } catch (err) {
      // Use default resources
      setResources([
        {
          id: 'res_1',
          title: 'Safe Sleep for Your Baby',
          category: 'sleep',
          description: 'AAP-aligned safe sleep practices',
          fileName: 'Safe Sleep for Your Baby.pdf',
          path: 'AI Intellect Pool/Sleep Resources/Safe Sleep for Your Baby.pdf',
          downloads: 234,
          active: true
        }
      ]);
    }
  };

  const loadVideos = async () => {
    try {
      const res = await fetch('/api/admin/videos');
      if (res.ok) {
        const data = await res.json();
        setVideos(data.videos || []);
      }
    } catch (err) {
      // Default videos for demo
      setVideos([
        {
          id: 'vid_1',
          title: 'Newborn Care Basics',
          category: 'newborn-care',
          duration: '12:34',
          description: 'Essential tips for caring for your newborn in the first few weeks',
          url: 'https://youtube.com/watch?v=example1',
          thumbnail: '👶',
          views: 1523,
          active: true
        },
        {
          id: 'vid_2',
          title: 'Breastfeeding Fundamentals',
          category: 'feeding',
          duration: '18:45',
          description: 'Step-by-step guide to successful breastfeeding',
          url: 'https://youtube.com/watch?v=example2',
          thumbnail: '🍼',
          views: 2341,
          active: true
        }
      ]);
    }
  };

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(async (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files).filter(
      file => file.type === 'application/pdf'
    );
    
    if (files.length > 0) {
      await uploadFiles(files);
    }
  }, [activeTab]);

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      await uploadFiles(files);
    }
  };

  const uploadFiles = async (files) => {
    setUploading(true);
    setUploadStatus({ type: 'loading', message: `Uploading ${files.length} file(s)...` });

    try {
      const formData = new FormData();
      files.forEach(file => formData.append('pdfs', file));
      formData.append('category', 'other');
      formData.append('target', activeTab === 'resources' ? 'resources' : 'knowledge');

      const res = await fetch('/api/admin/upload-pdf', {
        method: 'POST',
        body: formData
      });

      if (res.ok) {
        const result = await res.json();
        setUploadStatus({ 
          type: 'success', 
          message: `Successfully uploaded ${result.processed} file(s)!` 
        });
        
        if (activeTab === 'resources') {
          await loadResources();
        } else {
          await loadKnowledgeBase();
        }
      } else {
        throw new Error('Upload failed');
      }
    } catch (err) {
      setUploadStatus({ 
        type: 'error', 
        message: 'Upload failed. Please try again.' 
      });
    } finally {
      setUploading(false);
      setTimeout(() => setUploadStatus(null), 5000);
    }
  };

  const handleAddVideo = () => {
    setEditingVideo({
      id: `vid_new_${Date.now()}`,
      title: '',
      category: 'newborn-care',
      duration: '',
      description: '',
      url: '',
      thumbnail: '📹',
      active: true,
      isNew: true
    });
  };

  const handleSaveVideo = async (video) => {
    try {
      const res = await fetch('/api/admin/videos', {
        method: video.isNew ? 'POST' : 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(video)
      });

      if (res.ok) {
        await loadVideos();
        setEditingVideo(null);
        setUploadStatus({ 
          type: 'success', 
          message: `Video ${video.isNew ? 'added' : 'updated'} successfully!` 
        });
        setTimeout(() => setUploadStatus(null), 3000);
      }
    } catch (err) {
      console.error('Failed to save video:', err);
    }
  };

  const handleToggleResourceActive = async (resourceId) => {
    const resource = resources.find(r => r.id === resourceId);
    if (resource) {
      resource.active = !resource.active;
      setResources([...resources]);
      // In production, save to API
    }
  };

  const handleToggleVideoActive = async (videoId) => {
    const video = videos.find(v => v.id === videoId);
    if (video) {
      video.active = !video.active;
      setVideos([...videos]);
      // In production, save to API
    }
  };

  const renderKnowledgeBaseTab = () => (
    <div>
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Upload Knowledge Base Documents</h2>
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-3 border-dashed rounded-xl p-12 text-center transition-all ${
            isDragging 
              ? 'border-pink-500 bg-pink-50' 
              : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
          }`}
        >
          <Upload className={`w-16 h-16 mx-auto mb-4 ${
            isDragging ? 'text-pink-500' : 'text-gray-400'
          }`} />
          <p className="text-lg font-medium text-gray-700 mb-2">
            {isDragging ? 'Drop PDFs here!' : 'Drag & drop PDF files here'}
          </p>
          <p className="text-sm text-gray-500 mb-4">or</p>
          <label className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-400 to-pink-500 text-white px-6 py-3 rounded-lg font-medium cursor-pointer hover:from-pink-500 hover:to-pink-600 transition-all">
            <Upload className="w-5 h-5" />
            Choose Files
            <input
              type="file"
              multiple
              accept=".pdf"
              onChange={handleFileSelect}
              className="hidden"
              disabled={uploading}
            />
          </label>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Current Knowledge Base</h2>
        <div className="flex flex-wrap gap-2">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                selectedCategory === cat.id
                  ? 'bg-gradient-to-r from-pink-400 to-pink-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {typeof cat.icon === 'string' ? cat.icon : <cat.icon className="w-4 h-4 inline mr-1" />}
              {' '}{cat.name}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {knowledgeBase
          .filter(doc => selectedCategory === 'all' || doc.category === selectedCategory)
          .map(doc => (
            <div
              key={doc.id}
              className="bg-white border-2 border-gray-200 rounded-xl p-4 hover:border-pink-300 transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <File className="w-5 h-5 text-pink-500" />
                    <h3 className="font-semibold text-gray-800">{doc.title}</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{doc.description}</p>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-pink-100 text-pink-700">
                    {doc.pages} pages • {doc.chunks} chunks
                  </span>
                </div>
                <button className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
      </div>
    </div>
  );

  const renderResourcesTab = () => (
    <div>
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Public Resources Management</h2>
        <p className="text-sm text-gray-600 mb-4">
          These PDFs appear on the Resources page for patients to download
        </p>
      </div>

      <div className="space-y-3">
        {resources.map(resource => (
          <div
            key={resource.id}
            className={`bg-white border-2 ${resource.active ? 'border-gray-200' : 'border-gray-100 opacity-60'} rounded-xl p-4 hover:border-pink-300 transition-all`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <FileText className="w-5 h-5 text-pink-500" />
                  <h3 className="font-semibold text-gray-800">{resource.title}</h3>
                  {!resource.active && (
                    <span className="px-2 py-1 text-xs bg-gray-200 text-gray-600 rounded">Hidden</span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-2">{resource.description}</p>
                <div className="flex gap-4 text-xs text-gray-500">
                  <span>📥 {resource.downloads || 0} downloads</span>
                  <span>📁 {resource.category}</span>
                  {resource.fileName && <span>📄 {resource.fileName}</span>}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggleResourceActive(resource.id)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    resource.active
                      ? 'bg-green-100 text-green-700 hover:bg-green-200'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {resource.active ? 'Active' : 'Hidden'}
                </button>
                <button className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
                  <Edit className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => setActiveTab('knowledge')}
        className="mt-6 text-sm text-pink-600 hover:text-pink-700 underline"
      >
        ← Upload more PDFs to Knowledge Base first, then activate them here
      </button>
    </div>
  );

  const renderVideosTab = () => (
    <div>
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Educational Videos</h2>
          <p className="text-sm text-gray-600">
            Manage Dr. Patel's educational video links
          </p>
        </div>
        <button
          onClick={handleAddVideo}
          className="flex items-center gap-2 bg-gradient-to-r from-pink-400 to-pink-500 text-white px-4 py-2 rounded-lg font-medium hover:from-pink-500 hover:to-pink-600 transition-all"
        >
          <Plus className="w-5 h-5" />
          Add Video
        </button>
      </div>

      {editingVideo && (
        <div className="mb-6 p-6 bg-pink-50 rounded-xl border-2 border-pink-200">
          <h3 className="font-semibold text-gray-800 mb-4">
            {editingVideo.isNew ? 'Add New Video' : 'Edit Video'}
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Video Title"
              value={editingVideo.title}
              onChange={(e) => setEditingVideo({...editingVideo, title: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-pink-400"
            />
            <input
              type="text"
              placeholder="YouTube/Vimeo URL"
              value={editingVideo.url}
              onChange={(e) => setEditingVideo({...editingVideo, url: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-pink-400"
            />
            <input
              type="text"
              placeholder="Duration (e.g., 12:34)"
              value={editingVideo.duration}
              onChange={(e) => setEditingVideo({...editingVideo, duration: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-pink-400"
            />
            <select
              value={editingVideo.category}
              onChange={(e) => setEditingVideo({...editingVideo, category: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-pink-400"
            >
              {videoCategories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          <textarea
            placeholder="Video description"
            value={editingVideo.description}
            onChange={(e) => setEditingVideo({...editingVideo, description: e.target.value})}
            className="w-full mt-4 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-pink-400"
            rows={3}
          />
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => handleSaveVideo(editingVideo)}
              className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-600"
            >
              <Save className="w-4 h-4" />
              Save
            </button>
            <button
              onClick={() => setEditingVideo(null)}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        {videos.map(video => (
          <div
            key={video.id}
            className={`bg-white border-2 ${video.active ? 'border-gray-200' : 'border-gray-100 opacity-60'} rounded-xl p-4 hover:border-pink-300 transition-all`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="text-2xl">{video.thumbnail}</div>
                <div>
                  <h3 className="font-semibold text-gray-800">{video.title}</h3>
                  <span className={`inline-block mt-1 px-2 py-1 rounded-full text-xs font-medium ${
                    videoCategories.find(c => c.id === video.category)?.color || 'bg-gray-100 text-gray-700'
                  }`}>
                    {videoCategories.find(c => c.id === video.category)?.name || video.category}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleToggleVideoActive(video.id)}
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    video.active
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {video.active ? '✓' : '×'}
                </button>
                <button
                  onClick={() => setEditingVideo(video)}
                  className="p-1 text-blue-500 hover:bg-blue-50 rounded"
                >
                  <Edit className="w-4 h-4" />
                </button>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-2">{video.description}</p>
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Play className="w-3 h-3" />
                {video.duration}
              </span>
              <span>👁 {video.views || 0} views</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-400 to-pink-500 p-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white">Content Management System</h1>
            <p className="text-pink-100 text-sm mt-1">Manage knowledge base, resources, and educational videos</p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-pink-600 p-2 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Status Message */}
        {uploadStatus && (
          <div className={`p-4 flex items-center gap-3 ${
            uploadStatus.type === 'success' ? 'bg-green-50 text-green-700' :
            uploadStatus.type === 'error' ? 'bg-red-50 text-red-700' :
            'bg-blue-50 text-blue-700'
          }`}>
            {uploadStatus.type === 'success' && <CheckCircle className="w-5 h-5" />}
            {uploadStatus.type === 'error' && <AlertCircle className="w-5 h-5" />}
            {uploadStatus.type === 'loading' && <Loader className="w-5 h-5 animate-spin" />}
            <span className="font-medium">{uploadStatus.message}</span>
          </div>
        )}

        {/* Tabs */}
        <div className="border-b border-gray-200 bg-gray-50">
          <div className="flex">
            <button
              onClick={() => setActiveTab('knowledge')}
              className={`px-6 py-3 font-medium transition-all ${
                activeTab === 'knowledge'
                  ? 'bg-white text-pink-600 border-b-2 border-pink-500'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              📚 Knowledge Base
            </button>
            <button
              onClick={() => setActiveTab('resources')}
              className={`px-6 py-3 font-medium transition-all ${
                activeTab === 'resources'
                  ? 'bg-white text-pink-600 border-b-2 border-pink-500'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              📄 Public Resources
            </button>
            <button
              onClick={() => setActiveTab('videos')}
              className={`px-6 py-3 font-medium transition-all ${
                activeTab === 'videos'
                  ? 'bg-white text-pink-600 border-b-2 border-pink-500'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              🎥 Educational Videos
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'knowledge' && renderKnowledgeBaseTab()}
          {activeTab === 'resources' && renderResourcesTab()}
          {activeTab === 'videos' && renderVideosTab()}
        </div>

        {/* Footer Stats */}
        <div className="border-t border-gray-200 bg-gray-50 p-4">
          <div className="flex justify-between items-center text-sm text-gray-600">
            <span>
              Knowledge Base: <strong className="text-pink-600">{knowledgeBase.length}</strong> documents
            </span>
            <span>
              Resources: <strong className="text-pink-600">{resources.filter(r => r.active).length}</strong> active
            </span>
            <span>
              Videos: <strong className="text-pink-600">{videos.filter(v => v.active).length}</strong> active
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedAdminDashboard;
