import React, { useState, useCallback, useEffect } from 'react';
import { Upload, File, Trash2, CheckCircle, AlertCircle, Loader, FolderOpen, X } from 'lucide-react';

const AdminDashboard = ({ onClose }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [knowledgeBase, setKnowledgeBase] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [uploadStatus, setUploadStatus] = useState(null);

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

  // Load knowledge base on mount
  useEffect(() => {
    loadKnowledgeBase();
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
  }, []);

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
      
      // Default to 'other' category - user can recategorize later
      formData.append('category', 'other');

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
        await loadKnowledgeBase();
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

  const handleDelete = async (docId) => {
    if (!confirm('Are you sure you want to delete this document?')) return;

    try {
      const res = await fetch(`/api/admin/knowledge-base/${docId}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        await loadKnowledgeBase();
        setUploadStatus({ 
          type: 'success', 
          message: 'Document deleted successfully!' 
        });
        setTimeout(() => setUploadStatus(null), 3000);
      }
    } catch (err) {
      setUploadStatus({ 
        type: 'error', 
        message: 'Failed to delete document.' 
      });
      setTimeout(() => setUploadStatus(null), 3000);
    }
  };

  const handleRecategorize = async (docId, newCategory) => {
    try {
      const res = await fetch(`/api/admin/knowledge-base/${docId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: newCategory })
      });

      if (res.ok) {
        await loadKnowledgeBase();
      }
    } catch (err) {
      console.error('Failed to recategorize:', err);
    }
  };

  const filteredDocs = selectedCategory === 'all' 
    ? knowledgeBase 
    : knowledgeBase.filter(doc => doc.category === selectedCategory);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-400 to-pink-500 p-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white">Knowledge Base Manager</h1>
            <p className="text-pink-100 text-sm mt-1">Upload and manage Dr. Patel's medical resources</p>
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

        <div className="flex-1 overflow-y-auto p-6">
          {/* Upload Area */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Upload New Documents</h2>
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
              <p className="text-xs text-gray-500 mt-4">
                Supported formats: PDF only • Max 25MB per file
              </p>
            </div>
          </div>

          {/* Category Filter */}
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

          {/* Documents List */}
          <div className="space-y-3">
            {filteredDocs.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-xl">
                <File className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No documents in this category yet</p>
                <p className="text-sm text-gray-400 mt-1">Upload PDFs to get started</p>
              </div>
            ) : (
              filteredDocs.map(doc => (
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
                      <div className="flex flex-wrap gap-2 mb-2">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-pink-100 text-pink-700">
                          {categories.find(c => c.id === doc.category)?.name || 'Other'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {doc.pages} pages • {doc.chunks} chunks • Added {new Date(doc.uploadedAt).toLocaleDateString()}
                        </span>
                      </div>
                      {doc.description && (
                        <p className="text-sm text-gray-600 mb-2">{doc.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <select
                        value={doc.category}
                        onChange={(e) => handleRecategorize(doc.id, e.target.value)}
                        className="text-sm border border-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:border-pink-400"
                      >
                        {categories.filter(c => c.id !== 'all').map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                      <button
                        onClick={() => handleDelete(doc.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete document"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer Stats */}
        <div className="border-t border-gray-200 bg-gray-50 p-4">
          <div className="flex justify-between items-center text-sm text-gray-600">
            <span>
              Total Documents: <strong className="text-pink-600">{knowledgeBase.length}</strong>
            </span>
            <span>
              Total Chunks: <strong className="text-pink-600">
                {knowledgeBase.reduce((sum, doc) => sum + (doc.chunks || 0), 0)}
              </strong>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
