import React, { useState, useEffect } from 'react';
import { 
  X, 
  Download, 
  Edit, 
  Save, 
  Trash2, 
  Plus, 
  FileText, 
  Upload,
  Eye,
  EyeOff,
  Link,
  Moon,
  Baby,
  Heart,
  AlertTriangle,
  Coffee,
  Thermometer,
  Activity,
  Settings
} from 'lucide-react';

const ResourceManager = ({ onClose }) => {
  const [resources, setResources] = useState([]);
  const [editingResource, setEditingResource] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newResource, setNewResource] = useState({
    title: '',
    category: 'Sleep',
    description: '',
    pdfUrl: '',
    icon: 'Moon',
    isActive: true
  });
  const [loading, setLoading] = useState(true);

  // Icon mapping
  const iconMap = {
    Moon,
    Baby,
    Heart,
    AlertTriangle,
    Coffee,
    Thermometer,
    Activity,
    FileText
  };

  // Categories for resources
  const categories = [
    { value: 'Sleep', label: 'Sleep & Safety' },
    { value: 'Feeding', label: 'Feeding & Nutrition' },
    { value: 'Recovery', label: 'Postpartum Recovery' },
    { value: 'Emergency', label: 'Emergency Guidelines' },
    { value: 'Development', label: 'Baby Development' },
    { value: 'General', label: 'General Care' }
  ];

  // Load resources from API
  useEffect(() => {
    loadResources();
  }, []);

  const loadResources = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/resources');
      if (response.ok) {
        const data = await response.json();
        setResources(data.resources || []);
      } else {
        // Fallback to mock data
        setResources(getMockResources());
      }
    } catch (error) {
      console.error('Error loading resources:', error);
      setResources(getMockResources());
    } finally {
      setLoading(false);
    }
  };

  const getMockResources = () => [
    { 
      id: 1, 
      title: "Safe Sleep for Your Baby", 
      category: "Sleep", 
      description: "Complete guide to safe sleep practices and SIDS prevention",
      icon: "Moon",
      pdfUrl: "https://example.com/safe-sleep.pdf",
      downloadCount: 2340,
      isActive: true,
      fileName: "safe-sleep-guide.pdf"
    },
    { 
      id: 2, 
      title: "30-Day Breastfeeding BluePrint", 
      category: "Feeding", 
      description: "Dr. Patel's comprehensive 30-day breastfeeding guide",
      icon: "Baby",
      pdfUrl: "https://example.com/breastfeeding-blueprint.pdf",
      downloadCount: 3100,
      isActive: true,
      fileName: "30-day-breastfeeding-blueprint.pdf"
    },
    { 
      id: 3, 
      title: "Postpartum Recovery Timeline", 
      category: "Recovery", 
      description: "Week-by-week healing and recovery guide",
      icon: "Heart",
      pdfUrl: "https://example.com/recovery-timeline.pdf",
      downloadCount: 1800,
      isActive: true,
      fileName: "postpartum-recovery.pdf"
    },
    { 
      id: 4, 
      title: "When to Call the Doctor", 
      category: "Emergency", 
      description: "Red flag symptoms and emergency guidelines",
      icon: "AlertTriangle",
      pdfUrl: "https://example.com/emergency-guide.pdf",
      downloadCount: 1200,
      isActive: true,
      fileName: "emergency-guidelines.pdf"
    }
  ];

  const handleSaveResource = async (resourceData) => {
    try {
      const response = await fetch('/api/admin/resources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(resourceData)
      });

      if (response.ok) {
        await loadResources();
        setEditingResource(null);
        setShowAddForm(false);
        setNewResource({
          title: '',
          category: 'Sleep',
          description: '',
          pdfUrl: '',
          icon: 'Moon',
          isActive: true
        });
      } else {
        alert('Error saving resource');
      }
    } catch (error) {
      console.error('Error saving resource:', error);
      alert('Error saving resource');
    }
  };

  const handleDeleteResource = async (resourceId) => {
    if (!confirm('Are you sure you want to delete this resource?')) return;

    try {
      const response = await fetch(`/api/admin/resources/${resourceId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await loadResources();
      } else {
        alert('Error deleting resource');
      }
    } catch (error) {
      console.error('Error deleting resource:', error);
      alert('Error deleting resource');
    }
  };

  const handleToggleActive = async (resourceId, isActive) => {
    try {
      const response = await fetch(`/api/admin/resources/${resourceId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive })
      });

      if (response.ok) {
        await loadResources();
      } else {
        alert('Error updating resource');
      }
    } catch (error) {
      console.error('Error updating resource:', error);
      alert('Error updating resource');
    }
  };

  const handleFileUpload = async (event, resourceId = null) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      alert('Please upload a PDF file');
      return;
    }

    if (file.size > 25 * 1024 * 1024) { // 25MB limit
      alert('File size must be less than 25MB');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('resourceId', resourceId || '');

      const response = await fetch('/api/admin/upload-resource-pdf', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        // Update the resource with the new PDF URL
        if (resourceId) {
          const updatedResource = resources.find(r => r.id === resourceId);
          if (updatedResource) {
            updatedResource.pdfUrl = data.pdfUrl;
            updatedResource.fileName = data.fileName;
            setResources([...resources]);
          }
        } else {
          setNewResource(prev => ({
            ...prev,
            pdfUrl: data.pdfUrl,
            fileName: data.fileName
          }));
        }
        alert('PDF uploaded successfully!');
      } else {
        alert('Error uploading PDF');
      }
    } catch (error) {
      console.error('Error uploading PDF:', error);
      alert('Error uploading PDF');
    }
  };

  const formatDownloadCount = (count) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k downloads`;
    }
    return `${count} downloads`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-400 to-pink-500 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Resource Manager</h2>
              <p className="text-pink-100 mt-1">Manage PDF resources for the chatbot</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-pink-200 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-gray-500">Loading resources...</div>
            </div>
          ) : (
            <>
              {/* Add New Resource Button */}
              <div className="mb-6">
                <button
                  onClick={() => setShowAddForm(true)}
                  className="bg-gradient-to-r from-green-400 to-green-500 text-white px-4 py-2 rounded-lg hover:from-green-500 hover:to-green-600 transition-all duration-200 flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add New Resource
                </button>
              </div>

              {/* Add New Resource Form */}
              {showAddForm && (
                <div className="bg-gray-50 rounded-lg p-6 mb-6 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Add New Resource</h3>
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
                      <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                      <select
                        value={newResource.category}
                        onChange={(e) => setNewResource(prev => ({ ...prev, category: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
                      >
                        {categories.map(cat => (
                          <option key={cat.value} value={cat.value}>{cat.label}</option>
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
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">PDF Upload</label>
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={(e) => handleFileUpload(e)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
                      />
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
                        setShowAddForm(false);
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
                            onClick={() => handleToggleActive(resource.id, resource.isActive)}
                            className={`p-1 rounded ${resource.isActive ? 'text-green-500' : 'text-gray-400'}`}
                            title={resource.isActive ? 'Hide from users' : 'Show to users'}
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
                          onSave={(updatedResource) => {
                            handleSaveResource({ ...resource, ...updatedResource });
                            setEditingResource(null);
                          }}
                          onCancel={() => setEditingResource(null)}
                          onFileUpload={(e) => handleFileUpload(e, resource.id)}
                          categories={categories}
                          iconMap={iconMap}
                        />
                      ) : (
                        <>
                          <span className="text-xs font-semibold text-pink-400 uppercase tracking-wide">
                            {categories.find(c => c.value === resource.category)?.label || resource.category}
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

                          {/* Download Button */}
                          <button 
                            className="w-full flex items-center justify-center text-sm text-white bg-gradient-to-r from-pink-300 to-pink-400 hover:from-pink-400 hover:to-pink-500 px-4 py-2 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={!resource.pdfUrl}
                            onClick={() => {
                              if (resource.pdfUrl) {
                                window.open(resource.pdfUrl, '_blank');
                              }
                            }}
                          >
                            <Download className="w-4 h-4 mr-2" />
                            {resource.pdfUrl ? 'Download PDF' : 'Upload PDF First'}
                          </button>

                          {/* Stats */}
                          <div className="mt-3 text-xs text-gray-500 text-center">
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
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// Edit Resource Form Component
const EditResourceForm = ({ resource, onSave, onCancel, onFileUpload, categories, iconMap }) => {
  const [formData, setFormData] = useState({
    title: resource.title,
    category: resource.category,
    description: resource.description,
    icon: resource.icon,
    isActive: resource.isActive
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
        <select
          value={formData.category}
          onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
        >
          {categories.map(cat => (
            <option key={cat.value} value={cat.value}>{cat.label}</option>
          ))}
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
          rows="2"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Icon</label>
        <select
          value={formData.icon}
          onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
        >
          {Object.keys(iconMap).map(iconName => (
            <option key={iconName} value={iconName}>{iconName}</option>
          ))}
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Replace PDF</label>
        <input
          type="file"
          accept=".pdf"
          onChange={onFileUpload}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
        />
      </div>
      
      <div className="flex items-center gap-2">
        <button
          type="submit"
          className="bg-gradient-to-r from-pink-400 to-pink-500 text-white px-3 py-1 rounded text-sm hover:from-pink-500 hover:to-pink-600 transition-all duration-200"
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

export default ResourceManager;
