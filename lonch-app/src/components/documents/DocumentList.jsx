import { useState, useRef, useEffect } from 'react';
import { useProjectPermissions } from '../../hooks/useProjectPermissions';
import { VISIBILITY } from '../../utils/groupPermissions';
import { updateProject } from '../../services/projectService';
import { logActivity } from '../../services/activityLogService';
import { useAuth } from '../../contexts/AuthContext';

/**
 * DocumentList Component
 * Displays uploaded documents in a table/list view with management capabilities
 * Now includes group-based document visibility controls
 */
export default function DocumentList({ documents = [], onDelete, onDownload, onUploadNew, onUpdateCategories, projectId }) {
  const { currentUser } = useAuth();
  const permissions = useProjectPermissions(projectId);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [selectedDocuments, setSelectedDocuments] = useState(new Set());
  const [bulkCategory, setBulkCategory] = useState('');
  const [bulkVisibility, setBulkVisibility] = useState('');
  const headerCheckboxRef = useRef(null);

  // Filter documents by category and visibility (Task 5.6)
  const filteredDocuments = documents.filter(doc => {
    // Category filter
    if (selectedCategory !== 'all' && doc.category !== selectedCategory) {
      return false;
    }

    // Visibility filter - hide documents user can't see
    const docVisibility = doc.visibility || VISIBILITY.BOTH;
    if (!permissions.canViewDocument(docVisibility)) {
      return false;
    }

    return true;
  });

  // Format file size
  const formatFileSize = (bytes) => {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get category badge color
  const getCategoryColor = (category) => {
    switch (category) {
      case 'contract':
        return 'bg-blue-100 text-blue-800';
      case 'specifications':
        return 'bg-purple-100 text-purple-800';
      case 'other':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get category display name
  const getCategoryName = (category) => {
    switch (category) {
      case 'contract':
        return 'Contract';
      case 'specifications':
        return 'Specifications';
      case 'other':
        return 'Other';
      default:
        return category;
    }
  };

  // Get group visibility badge style and text
  const getVisibilityBadge = (visibility) => {
    switch (visibility) {
      case VISIBILITY.CONSULTING_ONLY:
        return {
          color: 'bg-teal-100 text-teal-800',
          icon: '🔒',
          text: 'Consulting'
        };
      case VISIBILITY.CLIENT_ONLY:
        return {
          color: 'bg-yellow-100 text-yellow-800',
          icon: '🔒',
          text: 'Client'
        };
      case VISIBILITY.BOTH:
        return {
          color: 'bg-gray-100 text-gray-800',
          icon: '🌐',
          text: 'Both'
        };
      default:
        return {
          color: 'bg-gray-100 text-gray-800',
          icon: '🌐',
          text: 'Both'
        };
    }
  };

  // Handle delete confirmation
  const handleDelete = (docId) => {
    if (deleteConfirmId === docId) {
      onDelete(docId);
      setDeleteConfirmId(null);
    } else {
      setDeleteConfirmId(docId);
    }
  };

  // Update header checkbox state based on selection
  useEffect(() => {
    if (headerCheckboxRef.current && filteredDocuments.length > 0) {
      const allSelected = filteredDocuments.every(doc => selectedDocuments.has(doc.id));
      const someSelected = filteredDocuments.some(doc => selectedDocuments.has(doc.id));

      headerCheckboxRef.current.checked = allSelected;
      headerCheckboxRef.current.indeterminate = someSelected && !allSelected;
    }
  }, [selectedDocuments, filteredDocuments]);

  // Toggle individual document selection
  const toggleDocumentSelection = (docId) => {
    setSelectedDocuments(prev => {
      const newSet = new Set(prev);
      if (newSet.has(docId)) {
        newSet.delete(docId);
      } else {
        newSet.add(docId);
      }
      return newSet;
    });
  };

  // Toggle all documents selection
  const toggleAllDocuments = () => {
    if (filteredDocuments.every(doc => selectedDocuments.has(doc.id))) {
      // All selected, deselect all
      setSelectedDocuments(new Set());
    } else {
      // Some or none selected, select all
      setSelectedDocuments(new Set(filteredDocuments.map(doc => doc.id)));
    }
  };

  // Handle bulk category update
  const handleBulkCategoryUpdate = () => {
    if (bulkCategory && selectedDocuments.size > 0 && onUpdateCategories) {
      onUpdateCategories(Array.from(selectedDocuments), bulkCategory);
      setSelectedDocuments(new Set());
      setBulkCategory('');
    }
  };

  // Handle bulk visibility update
  const handleBulkVisibilityUpdate = async () => {
    if (bulkVisibility && selectedDocuments.size > 0) {
      try {
        // Update all selected documents with new visibility
        const updatedDocuments = documents.map(doc =>
          selectedDocuments.has(doc.id)
            ? { ...doc, visibility: bulkVisibility }
            : doc
        );

        // Update project in Firestore
        await updateProject(projectId, { documents: updatedDocuments });

        // Log activity for each document
        if (currentUser) {
          const selectedDocs = documents.filter(d => selectedDocuments.has(d.id));
          for (const doc of selectedDocs) {
            await logActivity(
              projectId,
              currentUser.uid,
              'document_visibility_changed',
              'document',
              doc.id,
              {
                documentName: doc.name,
                oldVisibility: doc.visibility || VISIBILITY.BOTH,
                newVisibility: bulkVisibility
              },
              permissions.group
            );
          }
        }

        // Clear selection
        setSelectedDocuments(new Set());
        setBulkVisibility('');

        // Show success message
        alert(`Updated visibility for ${selectedDocuments.size} document(s)`);
      } catch (error) {
        console.error('Error updating document visibility:', error);
        alert('Failed to update document visibility: ' + error.message);
      }
    }
  };


  return (
    <div className="space-y-4">
      {/* Header with filter and upload button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h3 className="text-lg font-bold text-gray-900">Project Documents</h3>

          {/* Category filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="all">All Categories</option>
            <option value="contract">Contracts</option>
            <option value="specifications">Specifications</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* Upload new button */}
        {onUploadNew && (
          <button
            onClick={onUploadNew}
            className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-dark transition-colors text-sm font-medium flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Upload New Document</span>
          </button>
        )}
      </div>

      {/* Bulk actions toolbar */}
      {selectedDocuments.size > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex flex-col space-y-3">
            <span className="text-sm font-medium text-blue-900">
              {selectedDocuments.size} document{selectedDocuments.size > 1 ? 's' : ''} selected
            </span>

            {/* Category Update */}
            <div className="flex items-center space-x-3">
              <label className="text-sm text-blue-800 font-medium min-w-[80px]">Category:</label>
              <select
                value={bulkCategory}
                onChange={(e) => setBulkCategory(e.target.value)}
                className="w-48 px-3 py-1.5 text-sm border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="">Select category...</option>
                <option value="contract">Contract</option>
                <option value="specifications">Specifications</option>
                <option value="other">Other</option>
              </select>
              <button
                onClick={handleBulkCategoryUpdate}
                disabled={!bulkCategory}
                className="px-4 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Update Category
              </button>
            </div>

            {/* Visibility Update */}
            {permissions.canSetDocumentVisibility() && (
              <div className="flex items-center space-x-3">
                <label className="text-sm text-blue-800 font-medium min-w-[80px]">Visibility:</label>
                <select
                  value={bulkVisibility}
                  onChange={(e) => setBulkVisibility(e.target.value)}
                  className="w-48 px-3 py-1.5 text-sm border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                >
                  <option value="">Select visibility...</option>
                  <option value={VISIBILITY.BOTH}>🌐 Both Groups</option>
                  <option value={VISIBILITY.CONSULTING_ONLY}>🔒 Consulting Only</option>
                  <option value={VISIBILITY.CLIENT_ONLY}>🔒 Client Only</option>
                </select>
                <button
                  onClick={handleBulkVisibilityUpdate}
                  disabled={!bulkVisibility}
                  className="px-4 py-1.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Update Visibility
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Document table */}
      {filteredDocuments.length === 0 ? (
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h4 className="mt-4 text-lg font-medium text-gray-900">No documents found</h4>
          <p className="mt-2 text-sm text-gray-500">
            {selectedCategory === 'all'
              ? 'Upload documents to get started'
              : `No documents in the "${getCategoryName(selectedCategory)}" category`}
          </p>
          {onUploadNew && (
            <button
              onClick={onUploadNew}
              className="mt-4 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-dark transition-colors text-sm font-medium"
            >
              Upload Your First Document
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    ref={headerCheckboxRef}
                    type="checkbox"
                    onChange={toggleAllDocuments}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  File Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Group
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Size
                </th>
                <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Owner
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredDocuments.map((doc) => (
                <tr key={doc.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedDocuments.has(doc.id)}
                      onChange={() => toggleDocumentSelection(doc.id)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      {/* Download icon (functional) */}
                      {onDownload && (
                        <button
                          onClick={() => {
                            onDownload(doc);
                            // Show brief feedback to user
                            const btn = event.currentTarget;
                            const originalTitle = btn.title;
                            btn.title = 'Downloading...';
                            setTimeout(() => {
                              btn.title = originalTitle;
                            }, 2000);
                          }}
                          className="text-primary hover:text-primary-dark transition-colors flex-shrink-0"
                          title="Download file"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                        </button>
                      )}
                      <span className="text-sm font-medium text-gray-900">{doc.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(doc.category)}`}>
                      {getCategoryName(doc.category)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {(() => {
                      const badge = getVisibilityBadge(doc.visibility || VISIBILITY.BOTH);
                      return (
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${badge.color}`}>
                          {badge.icon} {badge.text}
                        </span>
                      );
                    })()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(doc.uploadedAt || doc.createdAt)}
                  </td>
                  <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatFileSize(doc.size)}
                  </td>
                  <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {doc.uploadedBy || 'You'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    {/* Delete button */}
                    {onDelete && (
                      <button
                        onClick={() => handleDelete(doc.id)}
                        className={`transition-colors ${
                          deleteConfirmId === doc.id
                            ? 'text-red-600 hover:text-red-800'
                            : 'text-gray-400 hover:text-red-600'
                        }`}
                        title={deleteConfirmId === doc.id ? 'Click again to confirm' : 'Delete'}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Document count */}
      {filteredDocuments.length > 0 && (
        <p className="text-sm text-gray-500">
          Showing {filteredDocuments.length} {filteredDocuments.length === 1 ? 'document' : 'documents'}
          {selectedCategory !== 'all' && ` in ${getCategoryName(selectedCategory)}`}
        </p>
      )}
    </div>
  );
}
