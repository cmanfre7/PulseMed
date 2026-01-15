import React, { useState, useCallback, useEffect } from 'react';
import {
  Upload, File, Trash2, CheckCircle, AlertCircle, Loader, FolderOpen, X,
  Download, Edit, Save, Plus, FileText, Eye, EyeOff, Link, Settings,
  Moon, Baby, Heart, Coffee, Thermometer, Activity, BookOpen, Database, BarChart3, MessageSquare
} from 'lucide-react';
import SurveyAnalyticsDashboard from './SurveyAnalyticsDashboard';

const ConsolidatedAdminDashboard = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState('knowledge');
  const [chatUsers, setChatUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedUserChatHistory, setSelectedUserChatHistory] = useState([]);
  const [loadingChatData, setLoadingChatData] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [knowledgeBase, setKnowledgeBase] = useState([]);
  const [resources, setResources] = useState([]);
  const [videos, setVideos] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [uploadCategory, setUploadCategory] = useState('breastfeeding'); // Category for new uploads
  const [uploadStatus, setUploadStatus] = useState(null);
  const [editingResource, setEditingResource] = useState(null);
  const [editingVideo, setEditingVideo] = useState(null);
  const [showAddResource, setShowAddResource] = useState(false);
  const [showAddVideo, setShowAddVideo] = useState(false);
  const [newResource, setNewResource] = useState({
    title: '',
    category: 'Sleep',
    description: '',
    pdfUrl: '',
    icon: 'Moon',
    isActive: true
  });
  const [newVideo, setNewVideo] = useState({
    title: '',
    description: '',
    videoUrl: '',
    thumbnailUrl: '',
    duration: '',
    isActive: true
  });

  const categories = [
    { id: 'all', name: 'All Documents', icon: FolderOpen },
    { id: 'breastfeeding', name: 'Breastfeeding', icon: '🤱' },
    { id: 'newborn-care', name: 'Newborn Care', icon: '👶' },
    { id: 'postpartum', name: 'Postpartum Recovery', icon: '💝' },
    { id: 'sleep', name: 'Sleep Guidance', icon: '😴' },
    { id: 'feeding', name: 'Feeding & Nutrition', icon: '🍼' },
    { id: 'development', name: 'Development', icon: '📈' },
    { id: 'safety', name: 'Safety & Emergency', icon: '🚨' },
    { id: 'other', name: 'Other Resources', icon: '📚' }
  ];

  const resourceCategories = [
    { value: 'Sleep', label: 'Sleep & Safety' },
    { value: 'Feeding', label: 'Feeding & Nutrition' },
    { value: 'Recovery', label: 'Postpartum Recovery' },
    { value: 'Emergency', label: 'Emergency Guidelines' },
    { value: 'Development', label: 'Baby Development' },
    { value: 'General', label: 'General Care' }
  ];

  const videoCategories = [
    { value: 'Education', label: 'Educational Videos' },
    { value: 'Breastfeeding', label: 'Breastfeeding Support' },
    { value: 'Newborn Care', label: 'Newborn Care' },
    { value: 'Sleep', label: 'Sleep Guidance' },
    { value: 'Recovery', label: 'Postpartum Recovery' },
    { value: 'Safety', label: 'Safety Tips' },
    { value: 'Development', label: 'Baby Development' }
  ];

  const iconMap = {
    Moon, Baby, Heart, AlertCircle: AlertCircle,
    Coffee, Thermometer, Activity, FileText
  };

  // Load data on mount
  useEffect(() => {
    loadKnowledgeBase();
    loadResources();
    loadVideos();
    loadChatUsers();
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
        setResources(data.resources || []);
      }
    } catch (err) {
      console.error('Failed to load resources:', err);
    }
  };

  const loadVideos = async () => {
    try {
      const res = await fetch('/api/admin/videos');
      if (res.ok) {
        const data = await res.json();
        setVideos(data.videos || []);
      } else {
        // Fallback to mock data
        setVideos(getMockVideos());
      }
    } catch (err) {
      console.error('Failed to load videos:', err);
      setVideos(getMockVideos());
    }
  };

  const loadChatUsers = async () => {
    try {
      setLoadingChatData(true);
      console.log('🔍 Loading chat users...');
      const res = await fetch('/api/admin/chat-analytics');
      console.log('Chat analytics response status:', res.status);

      if (res.ok) {
        const data = await res.json();
        console.log('Chat analytics data:', data);
        console.log('Users array length:', data.users?.length || 0);
        setChatUsers(data.users || []);
      } else {
        const errorText = await res.text();
        console.error('Failed to load chat users - HTTP', res.status, errorText);
      }
    } catch (err) {
      console.error('Failed to load chat users:', err);
    } finally {
      setLoadingChatData(false);
    }
  };

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    setSelectedUserChatHistory(user.chatHistory || []);
  };

  const handleBackToUserList = () => {
    setSelectedUser(null);
    setSelectedUserChatHistory([]);
  };

  const getMockVideos = () => [
    {
      id: 1,
      title: "Newborn Sleep Basics",
      description: "Dr. Patel explains safe sleep practices for newborns",
      videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      embedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      category: "Sleep",
      thumbnailUrl: "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
      duration: "5:32",
      viewCount: 1250,
      isActive: true,
      createdAt: "2024-10-01T10:00:00Z"
    },
    {
      id: 2,
      title: "Breastfeeding Latch Techniques",
      description: "Step-by-step guide to proper latching",
      videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      embedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      category: "Breastfeeding",
      thumbnailUrl: "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
      duration: "8:15",
      viewCount: 2100,
      isActive: true,
      createdAt: "2024-10-01T10:00:00Z"
    }
  ];

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
    
    const files = Array.from(e.dataTransfer.files);
    const pdfFiles = files.filter(file => file.type === 'application/pdf');
    
    if (pdfFiles.length > 0) {
      await handleFileUpload(pdfFiles);
    } else {
      setUploadStatus({
        type: 'error',
        message: 'Please upload PDF files only'
      });
    }
  }, []);

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      await handleFileUpload(files);
    }
  };

  const handleFileUpload = async (files) => {
    // Validate file sizes BEFORE uploading
    // Railway supports much larger files (no hard body size limit)
    const MAX_FILE_SIZE_MB = 100; // Railway has no Vercel-style restrictions
    const oversizedFiles = files.filter(file => file.size > MAX_FILE_SIZE_MB * 1024 * 1024);

    if (oversizedFiles.length > 0) {
      const fileList = oversizedFiles.map(f =>
        `${f.name} (${(f.size / 1024 / 1024).toFixed(2)}MB)`
      ).join(', ');
      setUploadStatus({
        type: 'error',
        message: `File(s) too large: ${fileList}. Maximum size is ${MAX_FILE_SIZE_MB}MB per file.`
      });
      return;
    }

    setUploading(true);
    setUploadStatus({
      type: 'info',
      message: `Uploading ${files.length} file(s)... This may take a moment for large files.`
    });

    console.log(`📤 Starting upload of ${files.length} file(s)`);
    files.forEach(f => console.log(`  - ${f.name} (${(f.size / 1024 / 1024).toFixed(2)}MB)`));

    try {
      // Use standard FormData upload for all tabs
      const formData = new FormData();
      files.forEach(file => {
        formData.append('files', file);
      });

      // Add category for knowledge base uploads
      if (activeTab === 'knowledge') {
        formData.append('category', uploadCategory);
      }

      const endpoint = activeTab === 'knowledge'
        ? '/api/admin/upload-pdf'
        : '/api/admin/upload-resource-pdf';

      console.log(`📤 Uploading to ${endpoint}`);

      const res = await fetch(endpoint, {
        method: 'POST',
        body: formData
      });

      if (res.ok) {
        const data = await res.json();
        setUploadStatus({
          type: 'success',
          message: `Successfully processed ${data.processed || files.length} document(s)`
        });

        if (activeTab === 'knowledge') {
          await loadKnowledgeBase();
        } else {
          await loadResources();
        }
      } else {
        const errorData = await res.json().catch(() => null);
        const errorMessage = errorData?.message || errorData?.error || `Upload failed (${res.status})`;

        // Special handling for 413 errors
        if (res.status === 413) {
          throw new Error(`File too large. Unfortunately, files over 4.5MB cannot be uploaded due to Vercel limitations. Please try a smaller file or contact support.`);
        }

        throw new Error(errorMessage);
      }
    } catch (err) {
      console.error('Upload error:', err);
      setUploadStatus({
        type: 'error',
        message: err.message || 'Failed to upload files. Please try again.'
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteDocument = async (docId) => {
    if (!confirm('Are you sure you want to delete this document?')) return;

    try {
      const res = await fetch(`/api/admin/knowledge-base?id=${docId}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        await loadKnowledgeBase();
        setUploadStatus({
          type: 'success',
          message: 'Document deleted successfully'
        });
      }
    } catch (err) {
      setUploadStatus({
        type: 'error',
        message: 'Failed to delete document'
      });
    }
  };

  const handleSaveResource = async (resourceData) => {
    try {
      // Validate required fields
      if (!resourceData.title || !resourceData.title.trim()) {
        setUploadStatus({
          type: 'error',
          message: 'Title is required'
        });
        return;
      }

      if (!resourceData.pdfUrl || !resourceData.pdfUrl.trim()) {
        setUploadStatus({
          type: 'error',
          message: 'Please upload a PDF file first'
        });
        return;
      }

      console.log('Saving resource:', resourceData);

      setUploadStatus({
        type: 'info',
        message: 'Saving resource...'
      });

      const res = await fetch('/api/admin/resources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(resourceData)
      });

      const responseData = await res.json();
      console.log('Save response:', responseData);

      if (res.ok) {
        await loadResources();
        setEditingResource(null);
        setShowAddResource(false);
        setNewResource({
          title: '',
          category: 'Sleep',
          description: '',
          pdfUrl: '',
          icon: 'Moon',
          isActive: true
        });
        setUploadStatus({
          type: 'success',
          message: 'Resource saved successfully!'
        });
      } else {
        setUploadStatus({
          type: 'error',
          message: `Failed to save: ${responseData.error || 'Unknown error'}`
        });
      }
    } catch (err) {
      console.error('Save resource error:', err);
      setUploadStatus({
        type: 'error',
        message: `Failed to save resource: ${err.message}`
      });
    }
  };

  const handleUpdateResource = async (resourceId, updates) => {
    try {
      const res = await fetch(`/api/admin/resources?id=${resourceId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      if (res.ok) {
        await loadResources();
        setEditingResource(null);
      }
    } catch (err) {
      console.error('Failed to update resource:', err);
    }
  };

  const handleDeleteResource = async (resourceId) => {
    if (!confirm('Are you sure you want to delete this resource?')) return;

    try {
      const res = await fetch(`/api/admin/resources?id=${resourceId}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        await loadResources();
        setUploadStatus({
          type: 'success',
          message: 'Resource deleted successfully'
        });
      }
    } catch (err) {
      setUploadStatus({
        type: 'error',
        message: 'Failed to delete resource'
      });
    }
  };

  const handleSaveVideo = async (videoData) => {
    try {
      const res = await fetch('/api/admin/videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(videoData)
      });

      if (res.ok) {
        await loadVideos();
        setEditingVideo(null);
        setShowAddVideo(false);
        setNewVideo({
          title: '',
          description: '',
          videoUrl: '',
          thumbnailUrl: '',
          duration: '',
          isActive: true
        });
        setUploadStatus({
          type: 'success',
          message: 'Video saved successfully'
        });
      }
    } catch (err) {
      setUploadStatus({
        type: 'error',
        message: 'Failed to save video'
      });
    }
  };

  const handleUpdateVideo = async (videoId, updates) => {
    try {
      const res = await fetch(`/api/admin/videos?id=${videoId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      if (res.ok) {
        await loadVideos();
        setEditingVideo(null);
      }
    } catch (err) {
      console.error('Failed to update video:', err);
    }
  };

  const handleDeleteVideo = async (videoId) => {
    if (!confirm('Are you sure you want to delete this video?')) return;

    try {
      const res = await fetch(`/api/admin/videos?id=${videoId}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        await loadVideos();
        setUploadStatus({
          type: 'success',
          message: 'Video deleted successfully'
        });
      }
    } catch (err) {
      setUploadStatus({
        type: 'error',
        message: 'Failed to delete video'
      });
    }
  };

  const extractYouTubeVideoId = (url) => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const generateEmbedUrl = (videoUrl) => {
    const videoId = extractYouTubeVideoId(videoUrl);
    return videoId ? `https://www.youtube.com/embed/${videoId}` : '';
  };

  const generateThumbnailUrl = (videoUrl) => {
    const videoId = extractYouTubeVideoId(videoUrl);
    return videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : '';
  };

  const formatDownloadCount = (count) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k downloads`;
    }
    return `${count} downloads`;
  };

  const filteredKnowledgeBase = selectedCategory === 'all' 
    ? knowledgeBase 
    : knowledgeBase.filter(doc => doc.category === selectedCategory);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 py-8 px-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[calc(100vh-4rem)] overflow-hidden my-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-400 to-pink-500 text-white p-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">Admin Dashboard</h2>
              <p className="text-pink-100 text-sm mt-1">Manage your chatbot's knowledge and resources</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-pink-200 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => setActiveTab('knowledge')}
              className={`px-4 py-2 rounded-t-lg font-medium transition-all ${
                activeTab === 'knowledge'
                  ? 'bg-white text-pink-500'
                  : 'bg-pink-300 bg-opacity-30 text-white hover:bg-opacity-50'
              }`}
            >
              <Database className="w-4 h-4 inline mr-2" />
              Knowledge Base
            </button>
            <button
              onClick={() => setActiveTab('resources')}
              className={`px-4 py-2 rounded-t-lg font-medium transition-all ${
                activeTab === 'resources'
                  ? 'bg-white text-pink-500'
                  : 'bg-pink-300 bg-opacity-30 text-white hover:bg-opacity-50'
              }`}
            >
              <FileText className="w-4 h-4 inline mr-2" />
              Patient Resources
            </button>
            <button
              onClick={() => setActiveTab('videos')}
              className={`px-4 py-2 rounded-t-lg font-medium transition-all ${
                activeTab === 'videos'
                  ? 'bg-white text-pink-500'
                  : 'bg-pink-300 bg-opacity-30 text-white hover:bg-opacity-50'
              }`}
            >
              <Activity className="w-4 h-4 inline mr-2" />
              Educational Videos
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-4 py-2 rounded-t-lg font-medium transition-all ${
                activeTab === 'analytics'
                  ? 'bg-white text-pink-500'
                  : 'bg-pink-300 bg-opacity-30 text-white hover:bg-opacity-50'
              }`}
            >
              <BarChart3 className="w-4 h-4 inline mr-2" />
              Survey Analytics
            </button>
            <button
              onClick={() => setActiveTab('chat-analytics')}
              className={`px-4 py-2 rounded-t-lg font-medium transition-all ${
                activeTab === 'chat-analytics'
                  ? 'bg-white text-pink-500'
                  : 'bg-pink-300 bg-opacity-30 text-white hover:bg-opacity-50'
              }`}
            >
              <MessageSquare className="w-4 h-4 inline mr-2" />
              Chat Analytics
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 14rem)' }}>
          {/* Status Messages */}
          {uploadStatus && (
            <div className={`mb-4 p-4 rounded-lg flex items-center ${
              uploadStatus.type === 'success'
                ? 'bg-green-50 text-green-800 border border-green-200'
                : uploadStatus.type === 'info'
                ? 'bg-blue-50 text-blue-800 border border-blue-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {uploadStatus.type === 'success' ? (
                <CheckCircle className="w-5 h-5 mr-2 flex-shrink-0" />
              ) : uploadStatus.type === 'info' ? (
                <Loader className="w-5 h-5 mr-2 flex-shrink-0 animate-spin" />
              ) : (
                <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
              )}
              <span>{uploadStatus.message}</span>
            </div>
          )}

          {activeTab === 'knowledge' && (
            <>
              {/* Knowledge Base Tab */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Upload PDFs to Knowledge Base
                  </h3>
                  <div className="flex items-center gap-3">
                    <label className="text-sm font-medium text-gray-700">Upload to:</label>
                    <select
                      value={uploadCategory}
                      onChange={(e) => setUploadCategory(e.target.value)}
                      className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                    >
                      <option value="breastfeeding">🤱 Breastfeeding</option>
                      <option value="newborn-care">👶 Newborn Care</option>
                      <option value="postpartum">💝 Postpartum Recovery</option>
                      <option value="sleep">😴 Sleep Guidance</option>
                      <option value="feeding">🍼 Feeding & Nutrition</option>
                      <option value="development">📈 Development</option>
                      <option value="safety">🚨 Safety & Emergency</option>
                      <option value="other">📚 Other Resources</option>
                    </select>
                  </div>
                </div>

                {/* Upload Area */}
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
                    isDragging 
                      ? 'border-pink-400 bg-pink-50' 
                      : 'border-gray-300 hover:border-pink-300'
                  } ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
                >
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">
                    {uploading ? 'Processing...' : 'Drag & drop PDF files here'}
                  </p>
                  <p className="text-gray-500 text-sm mb-4">or</p>
                  <label className="inline-block">
                    <span className="bg-pink-400 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-pink-500 transition-colors">
                      Browse Files
                    </span>
                    <input
                      type="file"
                      multiple
                      accept=".pdf"
                      onChange={handleFileSelect}
                      className="hidden"
                      disabled={uploading}
                    />
                  </label>
                  <p className="text-xs text-gray-500 mt-4">
                    Supported formats: PDF only • Max 100MB per file • Processing time depends on file size
                  </p>
                </div>
              </div>

              {/* Category Filter */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Current Knowledge Base</h3>
                <div className="flex flex-wrap gap-2 mb-4">
                  {categories.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                        selectedCategory === cat.id
                          ? 'bg-pink-400 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {typeof cat.icon === 'string' ? cat.icon : <cat.icon className="w-4 h-4 inline" />} {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Documents Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredKnowledgeBase.length > 0 ? (
                  filteredKnowledgeBase.map((doc) => {
                    const categoryInfo = categories.find(c => c.id === doc.category);
                    const uploadDate = doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    }) : 'Unknown date';

                    return (
                      <div key={doc.id} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-lg transition-all duration-200 hover:border-pink-300">
                        {/* Header with Icon and Delete Button */}
                        <div className="flex items-start justify-between mb-3">
                          <div className="bg-gradient-to-br from-pink-100 to-pink-50 p-3 rounded-lg">
                            <File className="w-7 h-7 text-pink-500" />
                          </div>
                          <button
                            onClick={() => handleDeleteDocument(doc.id)}
                            className="text-red-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-all"
                            title="Delete document"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Document Title */}
                        <h4 className="font-bold text-gray-800 mb-2 text-base leading-tight line-clamp-2">
                          {doc.title}
                        </h4>

                        {/* File Name */}
                        <p className="text-xs text-gray-500 mb-3 truncate" title={doc.fileName}>
                          📄 {doc.fileName || 'Unknown file'}
                        </p>

                        {/* Description (if available) */}
                        {doc.description && (
                          <p className="text-xs text-gray-600 mb-3 line-clamp-2 leading-relaxed">
                            {doc.description}
                          </p>
                        )}

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 gap-2 mb-3">
                          <div className="bg-gray-50 rounded-lg p-2">
                            <div className="text-xs text-gray-500">Pages</div>
                            <div className="text-sm font-semibold text-gray-800">{doc.pages || 0}</div>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-2">
                            <div className="text-xs text-gray-500">Chunks</div>
                            <div className="text-sm font-semibold text-gray-800">{doc.chunks || 0}</div>
                          </div>
                        </div>

                        {/* File Size (if available) */}
                        {doc.sizeKB && (
                          <div className="text-xs text-gray-500 mb-3">
                            💾 {doc.sizeKB < 1024 ? `${doc.sizeKB} KB` : `${(doc.sizeKB / 1024).toFixed(1)} MB`}
                          </div>
                        )}

                        {/* Upload Date */}
                        <div className="text-xs text-gray-500 mb-3">
                          📅 Uploaded: {uploadDate}
                        </div>

                        {/* Category Badge */}
                        <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100">
                          <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 bg-gradient-to-r from-pink-100 to-pink-50 text-pink-700 rounded-full font-medium">
                            {typeof categoryInfo?.icon === 'string' ? categoryInfo.icon : '📚'} {categoryInfo?.name || doc.category}
                          </span>

                          {/* Status Indicator */}
                          <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="text-xs text-green-600 font-medium">Active</span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="col-span-full text-center py-12">
                    <div className="bg-gray-50 rounded-xl p-8">
                      <FolderOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h4 className="text-lg font-semibold text-gray-600 mb-2">
                        No documents in this category yet
                      </h4>
                      <p className="text-sm text-gray-500">
                        Upload PDFs to build your knowledge base
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Summary Stats */}
              {knowledgeBase.length > 0 && (
                <div className="mt-6 bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl p-4 border border-pink-100">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-3">
                      <Database className="w-5 h-5 text-pink-500" />
                      <span className="font-semibold text-gray-800">Knowledge Base Summary</span>
                    </div>
                    <div className="flex items-center gap-6 text-sm">
                      <div className="text-center">
                        <div className="font-bold text-lg text-gray-800">{knowledgeBase.length}</div>
                        <div className="text-xs text-gray-600">Total Documents</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-lg text-gray-800">
                          {knowledgeBase.reduce((sum, doc) => sum + (doc.pages || 0), 0)}
                        </div>
                        <div className="text-xs text-gray-600">Total Pages</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-lg text-gray-800">
                          {knowledgeBase.reduce((sum, doc) => sum + (doc.chunks || 0), 0)}
                        </div>
                        <div className="text-xs text-gray-600">Total Chunks</div>
                      </div>
                      {selectedCategory !== 'all' && (
                        <div className="text-center">
                          <div className="font-bold text-lg text-pink-600">{filteredKnowledgeBase.length}</div>
                          <div className="text-xs text-gray-600">In This Category</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {activeTab === 'resources' && (
            <>
              {/* Resources Tab */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Patient Resources
                  </h3>
                  <button
                    onClick={() => setShowAddResource(true)}
                    className="bg-gradient-to-r from-green-400 to-green-500 text-white px-4 py-2 rounded-lg hover:from-green-500 hover:to-green-600 transition-all duration-200 flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Resource
                  </button>
                </div>

                {/* Add Resource Form */}
                {showAddResource && (
                  <div className="bg-gray-50 rounded-lg p-6 mb-6 border border-gray-200">
                    <h4 className="text-md font-semibold text-gray-800 mb-4">Add New Resource</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                        <input
                          type="text"
                          value={newResource.title}
                          onChange={(e) => setNewResource(prev => ({ ...prev, title: e.target.value }))}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
                          placeholder="e.g., Safe Sleep Guide"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Icon</label>
                        <select
                          value={newResource.icon}
                          onChange={(e) => setNewResource(prev => ({ ...prev, icon: e.target.value }))}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
                        >
                          {Object.keys(iconMap).map(iconName => (
                            <option key={iconName} value={iconName}>{iconName}</option>
                          ))}
                        </select>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                          value={newResource.description}
                          onChange={(e) => setNewResource(prev => ({ ...prev, description: e.target.value }))}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
                          rows="3"
                          placeholder="Brief description of the resource..."
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          PDF File
                        </label>
                        <div className="flex items-center gap-3">
                          <label className="flex-1">
                            <div className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-all ${
                              newResource.pdfUrl
                                ? 'border-green-300 bg-green-50'
                                : 'border-gray-300 hover:border-pink-300 hover:bg-pink-50'
                            }`}>
                              {newResource.pdfUrl ? (
                                <div className="flex items-center justify-center gap-2">
                                  <CheckCircle className="w-5 h-5 text-green-600" />
                                  <span className="text-sm text-green-700 font-medium">
                                    PDF uploaded successfully!
                                  </span>
                                </div>
                              ) : (
                                <>
                                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                  <p className="text-sm text-gray-600">Click to upload PDF</p>
                                  <p className="text-xs text-gray-500 mt-1">Max 100MB</p>
                                </>
                              )}
                            </div>
                            <input
                              type="file"
                              accept=".pdf"
                              onChange={async (e) => {
                                const file = e.target.files[0];
                                if (!file) return;

                                // Validate file type
                                if (file.type !== 'application/pdf') {
                                  setUploadStatus({
                                    type: 'error',
                                    message: 'Only PDF files are allowed'
                                  });
                                  return;
                                }

                                // Validate file size (100MB limit)
                                const maxSize = 100 * 1024 * 1024;
                                if (file.size > maxSize) {
                                  setUploadStatus({
                                    type: 'error',
                                    message: `File too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Maximum size is 100MB`
                                  });
                                  return;
                                }

                                // Upload to HubSpot
                                setUploadStatus({
                                  type: 'info',
                                  message: 'Uploading PDF to HubSpot...'
                                });

                                try {
                                  const formData = new FormData();
                                  formData.append('file', file);

                                  const res = await fetch('/api/admin/upload-resource-pdf', {
                                    method: 'POST',
                                    body: formData
                                  });

                                  const data = await res.json();
                                  console.log('PDF upload response:', data);

                                  if (res.ok && data.pdfUrl) {
                                    setNewResource(prev => ({
                                      ...prev,
                                      pdfUrl: data.pdfUrl,
                                      fileName: data.fileName
                                    }));
                                    setUploadStatus({
                                      type: 'success',
                                      message: 'PDF uploaded to HubSpot successfully!'
                                    });
                                  } else {
                                    throw new Error(data.message || data.error || 'Upload failed');
                                  }
                                } catch (err) {
                                  console.error('PDF upload error:', err);
                                  setUploadStatus({
                                    type: 'error',
                                    message: `Upload failed: ${err.message}`
                                  });
                                }
                              }}
                              className="hidden"
                            />
                          </label>
                          {newResource.pdfUrl && (
                            <a
                              href={newResource.pdfUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-pink-500 hover:text-pink-600 p-2"
                              title="Preview PDF"
                            >
                              <Link className="w-5 h-5" />
                            </a>
                          )}
                        </div>
                        {newResource.fileName && (
                          <p className="text-xs text-gray-600 mt-2">
                            📄 {newResource.fileName}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 mt-4">
                      <button
                        onClick={() => handleSaveResource(newResource)}
                        className="bg-gradient-to-r from-pink-400 to-pink-500 text-white px-4 py-2 rounded-lg hover:from-pink-500 hover:to-pink-600 transition-all duration-200 flex items-center gap-2"
                      >
                        <Save className="w-4 h-4" />
                        Save Resource
                      </button>
                      <button
                        onClick={() => {
                          setShowAddResource(false);
                          setNewResource({
                            title: '',
                            category: 'Sleep',
                            description: '',
                            pdfUrl: '',
                            icon: 'Moon',
                            isActive: true
                          });
                        }}
                        className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-all duration-200"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* Resources Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {resources.map((resource) => {
                    const IconComponent = iconMap[resource.icon] || FileText;
                    const isEditing = editingResource === resource.id;
                    
                    return (
                      <div key={resource.id} className={`bg-white rounded-xl border transition-all duration-200 p-6 shadow-sm hover:shadow-md ${
                        resource.isActive ? 'border-pink-100' : 'border-gray-200 opacity-60'
                      }`}>
                        {/* Header */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="bg-pink-100 p-3 rounded-lg">
                            <IconComponent className="w-6 h-6 text-pink-400" />
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleUpdateResource(resource.id, { isActive: !resource.isActive })}
                              className={`p-1 rounded ${resource.isActive ? 'text-green-500' : 'text-gray-400'}`}
                              title={resource.isActive ? 'Hide from patients' : 'Show to patients'}
                            >
                              {resource.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                            </button>
                            <button
                              onClick={() => setEditingResource(isEditing ? null : resource.id)}
                              className="p-1 rounded text-blue-500 hover:bg-blue-50"
                              title="Edit resource"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteResource(resource.id)}
                              className="p-1 rounded text-red-500 hover:bg-red-50"
                              title="Delete resource"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Content */}
                        {isEditing ? (
                          <EditResourceForm 
                            resource={resource}
                            onSave={(updates) => {
                              handleUpdateResource(resource.id, updates);
                              setEditingResource(null);
                            }}
                            onCancel={() => setEditingResource(null)}
                            categories={resourceCategories}
                            iconMap={iconMap}
                          />
                        ) : (
                          <>
                            <span className="text-xs font-semibold text-pink-400 uppercase tracking-wide">
                              {resourceCategories.find(c => c.value === resource.category)?.label || resource.category}
                            </span>
                            <h3 className="text-lg font-bold text-gray-800 mt-2 mb-2">{resource.title}</h3>
                            <p className="text-sm text-gray-600 mb-4">{resource.description}</p>
                            
                            {/* PDF Status */}
                            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <FileText className="w-4 h-4 text-gray-500" />
                                  <span className="text-sm text-gray-600">
                                    {resource.fileName || 'No PDF attached'}
                                  </span>
                                </div>
                                {resource.pdfUrl && (
                                  <a
                                    href={resource.pdfUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-pink-500 hover:text-pink-600"
                                    title="Preview PDF"
                                  >
                                    <Link className="w-4 h-4" />
                                  </a>
                                )}
                              </div>
                            </div>

                            {/* Stats */}
                            <div className="text-xs text-gray-500">
                              {formatDownloadCount(resource.downloadCount || 0)}
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>

                {resources.length === 0 && (
                  <div className="text-center py-12">
                    <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-500 mb-2">No resources yet</h3>
                    <p className="text-gray-400">Add your first resource to get started</p>
                  </div>
                )}
              </div>
            </>
          )}

          {activeTab === 'videos' && (
            <>
              {/* Videos Tab */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Educational Videos
                  </h3>
                  <button
                    onClick={() => setShowAddVideo(true)}
                    className="bg-gradient-to-r from-purple-400 to-purple-500 text-white px-4 py-2 rounded-lg hover:from-purple-500 hover:to-purple-600 transition-all duration-200 flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Video
                  </button>
                </div>

                {/* Add Video Form */}
                {showAddVideo && (
                  <div className="bg-gray-50 rounded-lg p-6 mb-6 border border-gray-200">
                    <h4 className="text-md font-semibold text-gray-800 mb-4">Add New Video</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                        <input
                          type="text"
                          value={newVideo.title}
                          onChange={(e) => setNewVideo(prev => ({ ...prev, title: e.target.value }))}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
                          placeholder="e.g., Newborn Sleep Basics"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                          value={newVideo.description}
                          onChange={(e) => setNewVideo(prev => ({ ...prev, description: e.target.value }))}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
                          rows="3"
                          placeholder="Brief description of the video..."
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">YouTube URL</label>
                        <input
                          type="url"
                          value={newVideo.videoUrl}
                          onChange={(e) => {
                            const url = e.target.value;
                            const embedUrl = generateEmbedUrl(url);
                            const thumbnailUrl = generateThumbnailUrl(url);
                            setNewVideo(prev => ({
                              ...prev,
                              videoUrl: url,
                              embedUrl,
                              thumbnailUrl
                            }));
                          }}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
                          placeholder="https://www.youtube.com/watch?v=..."
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Duration (optional)</label>
                        <input
                          type="text"
                          value={newVideo.duration}
                          onChange={(e) => setNewVideo(prev => ({ ...prev, duration: e.target.value }))}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
                          placeholder="e.g., 5:32"
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-4 mt-4">
                      <button
                        onClick={() => handleSaveVideo(newVideo)}
                        className="bg-gradient-to-r from-purple-400 to-purple-500 text-white px-4 py-2 rounded-lg hover:from-purple-500 hover:to-purple-600 transition-all duration-200 flex items-center gap-2"
                      >
                        <Save className="w-4 h-4" />
                        Save Video
                      </button>
                      <button
                        onClick={() => {
                          setShowAddVideo(false);
                          setNewVideo({
                            title: '',
                            description: '',
                            videoUrl: '',
                            thumbnailUrl: '',
                            duration: '',
                            isActive: true
                          });
                        }}
                        className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-all duration-200"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* Videos Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {videos.map((video) => {
                    const isEditing = editingVideo === video.id;
                    
                    return (
                      <div key={video.id} className={`bg-white rounded-xl border transition-all duration-200 p-6 shadow-sm hover:shadow-md ${
                        video.isActive ? 'border-pink-100' : 'border-gray-200 opacity-60'
                      }`}>
                        {/* Video Thumbnail */}
                        <div className="relative mb-4">
                          {video.thumbnailUrl && (
                            <img
                              src={video.thumbnailUrl}
                              alt={video.title}
                              className="w-full h-40 object-cover rounded-lg"
                              onError={(e) => {
                                e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjE4MCIgdmlld0JveD0iMCAwIDMyMCAxODAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMjAiIGhlaWdodD0iMTgwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMzYgNzJMMTY4IDEwOEwxMzYgMTQ0VjcyWiIgZmlsbD0iI0VDNDg5OSIvPgo8L3N2Zz4K';
                              }}
                            />
                          )}
                          <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                            {video.duration}
                          </div>
                        </div>

                        {/* Header */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2">{video.title}</h3>
                          </div>
                          <div className="flex items-center gap-2 ml-2">
                            <button
                              onClick={() => handleUpdateVideo(video.id, { isActive: !video.isActive })}
                              className={`p-1 rounded ${video.isActive ? 'text-green-500' : 'text-gray-400'}`}
                              title={video.isActive ? 'Hide from patients' : 'Show to patients'}
                            >
                              {video.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                            </button>
                            <button
                              onClick={() => setEditingVideo(isEditing ? null : video.id)}
                              className="p-1 rounded text-blue-500 hover:bg-blue-50"
                              title="Edit video"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteVideo(video.id)}
                              className="p-1 rounded text-red-500 hover:bg-red-50"
                              title="Delete video"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Content */}
                        {isEditing ? (
                          <EditVideoForm 
                            video={video}
                            onSave={(updates) => {
                              handleUpdateVideo(video.id, updates);
                              setEditingVideo(null);
                            }}
                            onCancel={() => setEditingVideo(null)}
                            categories={videoCategories}
                            generateEmbedUrl={generateEmbedUrl}
                            generateThumbnailUrl={generateThumbnailUrl}
                          />
                        ) : (
                          <>
                            <p className="text-sm text-gray-600 mb-4 line-clamp-3">{video.description}</p>
                            
                            {/* Video Stats */}
                            <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                              <span>{video.viewCount ? `${video.viewCount} views` : 'No views yet'}</span>
                              <span>{video.duration}</span>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  if (video.videoUrl) {
                                    window.open(video.videoUrl, '_blank');
                                  }
                                }}
                                className="flex-1 bg-gradient-to-r from-red-400 to-red-500 text-white px-3 py-2 rounded-lg hover:from-red-500 hover:to-red-600 transition-all duration-200 flex items-center justify-center gap-2 text-sm"
                              >
                                <Activity className="w-4 h-4" />
                                Watch
                              </button>
                              <button
                                onClick={() => {
                                  if (video.embedUrl) {
                                    // Copy embed code to clipboard
                                    const embedCode = `<iframe width="560" height="315" src="${video.embedUrl}" frameborder="0" allowfullscreen></iframe>`;
                                    navigator.clipboard.writeText(embedCode);
                                    setUploadStatus({
                                      type: 'success',
                                      message: 'Embed code copied to clipboard!'
                                    });
                                  }
                                }}
                                className="bg-gray-300 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-400 transition-all duration-200 flex items-center justify-center"
                                title="Copy embed code"
                              >
                                <Link className="w-4 h-4" />
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>

                {videos.length === 0 && (
                  <div className="text-center py-12">
                    <Activity className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-500 mb-2">No videos yet</h3>
                    <p className="text-gray-400">Add your first educational video to get started</p>
                  </div>
                )}
              </div>
            </>
          )}

          {activeTab === 'analytics' && (
            <SurveyAnalyticsDashboard />
          )}

          {activeTab === 'chat-analytics' && (
            <>
              {loadingChatData ? (
                <div className="flex items-center justify-center py-12">
                  <Loader className="w-8 h-8 text-pink-500 animate-spin" />
                </div>
              ) : !selectedUser ? (
                // User List View
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-gray-800">
                      Patient Chat History
                    </h3>
                    <div className="text-sm text-gray-600">
                      {chatUsers.length} {chatUsers.length === 1 ? 'user' : 'users'}
                    </div>
                  </div>

                  {chatUsers.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-xl">
                      <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-500 mb-2">No chat users yet</h3>
                      <p className="text-gray-400">Patient conversations will appear here</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[calc(100vh-20rem)] overflow-y-auto pr-2">
                      {chatUsers.map((user) => (
                        <button
                          key={user.id}
                          onClick={() => handleSelectUser(user)}
                          className="w-full bg-white border border-gray-200 rounded-lg p-4 hover:border-pink-300 hover:bg-pink-50 transition-all text-left"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="font-medium text-gray-800 mb-1">
                                {user.email}
                              </div>
                              <div className="text-sm text-gray-500 space-y-1">
                                <div className="flex items-center space-x-4">
                                  <span>💬 {user.messageCount} messages</span>
                                  {user.babyProfiles && user.babyProfiles.length > 0 && (
                                    <span>👶 {user.babyProfiles[0].name}</span>
                                  )}
                                </div>
                                {user.lastMessageDate && (
                                  <div className="text-xs text-gray-400">
                                    Last active: {new Date(user.lastMessageDate).toLocaleString()}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="ml-4">
                              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                // Chat History View
                <div className="space-y-4">
                  {/* Header with Back Button */}
                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={handleBackToUserList}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-800">
                          {selectedUser.email}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {selectedUserChatHistory.length} messages
                        </p>
                      </div>
                    </div>
                    {selectedUser.babyProfiles && selectedUser.babyProfiles.length > 0 && (
                      <div className="text-sm bg-pink-50 px-3 py-2 rounded-lg border border-pink-200">
                        <span className="font-medium text-pink-700">
                          👶 {selectedUser.babyProfiles[0].name}
                        </span>
                        {selectedUser.babyProfiles[0].birthday && (
                          <span className="text-pink-600 ml-2">
                            • Born {new Date(selectedUser.babyProfiles[0].birthday).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Chat Messages */}
                  {selectedUserChatHistory.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-xl">
                      <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-500 mb-2">No messages</h3>
                      <p className="text-gray-400">This user hasn't sent any messages yet</p>
                    </div>
                  ) : (
                    <div className="space-y-4 max-h-[calc(100vh-22rem)] overflow-y-auto pr-2">
                      {selectedUserChatHistory.map((message, index) => (
                        <div
                          key={index}
                          className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                              message.sender === 'user'
                                ? 'bg-pink-500 text-white'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {/* Display image if present */}
                            {message.image && (
                              <div className="mb-3">
                                <img
                                  src={message.image}
                                  alt={message.imageName || 'Shared photo'}
                                  className="rounded-lg max-w-full h-auto max-h-64 object-contain"
                                />
                                {message.imageName && (
                                  <div
                                    className={`text-xs mt-1 ${
                                      message.sender === 'user' ? 'text-pink-100' : 'text-gray-500'
                                    }`}
                                  >
                                    {message.imageName}
                                  </div>
                                )}
                              </div>
                            )}
                            <div className="text-sm mb-1">
                              {message.text}
                            </div>
                            {message.timestamp && (
                              <div
                                className={`text-xs mt-2 ${
                                  message.sender === 'user' ? 'text-pink-100' : 'text-gray-500'
                                }`}
                              >
                                {new Date(message.timestamp).toLocaleString()}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// Edit Resource Form Component
const EditResourceForm = ({ resource, onSave, onCancel, categories, iconMap }) => {
  const [formData, setFormData] = useState({
    title: resource.title,
    category: resource.category,
    description: resource.description,
    icon: resource.icon
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          className="w-full border border-gray-300 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
          placeholder="Title"
        />
      </div>
      
      <div>
        <select
          value={formData.category}
          onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
          className="w-full border border-gray-300 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
        >
          {categories.map(cat => (
            <option key={cat.value} value={cat.value}>{cat.label}</option>
          ))}
        </select>
      </div>
      
      <div>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          className="w-full border border-gray-300 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
          rows="2"
          placeholder="Description"
        />
      </div>
      
      <div className="flex items-center gap-2">
        <button
          type="submit"
          className="bg-gradient-to-r from-pink-400 to-pink-500 text-white px-3 py-1 rounded text-sm hover:from-pink-500 hover:to-pink-600 transition-all duration-200"
        >
          Save
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="bg-gray-300 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-400 transition-all duration-200"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

// Edit Video Form Component
const EditVideoForm = ({ video, onSave, onCancel, categories, generateEmbedUrl, generateThumbnailUrl }) => {
  const [formData, setFormData] = useState({
    title: video.title,
    description: video.description,
    videoUrl: video.videoUrl,
    duration: video.duration
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const updates = {
      ...formData,
      embedUrl: generateEmbedUrl(formData.videoUrl),
      thumbnailUrl: generateThumbnailUrl(formData.videoUrl)
    };
    onSave(updates);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          className="w-full border border-gray-300 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
          placeholder="Title"
        />
      </div>

      <div>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          className="w-full border border-gray-300 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
          rows="2"
          placeholder="Description"
        />
      </div>

      <div>
        <input
          type="url"
          value={formData.videoUrl}
          onChange={(e) => setFormData(prev => ({ ...prev, videoUrl: e.target.value }))}
          className="w-full border border-gray-300 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
          placeholder="YouTube URL"
        />
      </div>

      <div>
        <input
          type="text"
          value={formData.duration}
          onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
          className="w-full border border-gray-300 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
          placeholder="Duration (e.g., 5:32)"
        />
      </div>

      <div className="flex items-center gap-2">
        <button
          type="submit"
          className="bg-gradient-to-r from-purple-400 to-purple-500 text-white px-3 py-1 rounded text-sm hover:from-purple-500 hover:to-purple-600 transition-all duration-200"
        >
          <Save className="w-3 h-3 mr-1" />
          Save
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="bg-gray-300 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-400 transition-all duration-200"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default ConsolidatedAdminDashboard;
