import { useState, useRef, useEffect } from 'react';
import { useProjectPermissions } from '../../hooks/useProjectPermissions';
import { VISIBILITY } from '../../utils/groupPermissions';

interface Document {
  id: string;
  name: string;
  category: 'contract' | 'specifications' | 'other';
  visibility?: string;
  uploadedAt?: string;
  createdAt?: string;
  size?: number;
  uploadedBy?: string;
}

interface DocumentListProps {
  documents?: Document[];
  onDelete?: (id: string) => void;
  onDownload?: (doc: Document) => void;
  onUploadNew?: () => void;
  onUpdateCategories?: (ids: string[], category: string) => void;
  onUpdateVisibility?: (ids: string[], visibility: string) => void;
  projectId: string;
}

/**
 * DocumentList Component
 * Displays uploaded documents in a table/list view with management capabilities
 * Now includes group-based document visibility controls
 */
export default function DocumentList({
  documents = [],
  onDelete,
  onDownload,
  onUploadNew,
  onUpdateCategories,
  onUpdateVisibility,
  projectId
}: DocumentListProps) {
  const permissions = useProjectPermissions(projectId);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDocuments, setSelectedDocuments] = useState(new Set<string>());
  const [bulkCategory, setBulkCategory] = useState('');
  const [bulkVisibility, setBulkVisibility] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmed, setDeleteConfirmed] = useState(false);
  const headerCheckboxRef = useRef<HTMLInputElement>(null);

  // Filter documents by category only - show all documents regardless of visibility
  const filteredDocuments = documents.filter(doc => {
    // Category filter
    if (selectedCategory !== 'all' && doc.category !== selectedCategory) {
      return false;
    }

    return true;
  });

  // Format file size
  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  // Format date
  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get category badge color
  const getCategoryColor = (category: string): string => {
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
  const getCategoryName = (category: string): string => {
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
  const getVisibilityBadge = (visibility?: string) => {
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
          text: 'All'
        };
      default:
        return {
          color: 'bg-gray-100 text-gray-800',
          icon: '🌐',
          text: 'All'
        };
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
  const toggleDocumentSelection = (docId: string) => {
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
  const handleBulkVisibilityUpdate = () => {
    if (bulkVisibility && selectedDocuments.size > 0 && onUpdateVisibility) {
      onUpdateVisibility(Array.from(selectedDocuments), bulkVisibility);
      setSelectedDocuments(new Set());
      setBulkVisibility('');
    }
  };

  return (
    <div className="space-y-4">
      {/* Header with filter and upload button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h3 className="text-lg font-bold text-foreground">Project Documents</h3>

          {/* Category filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-1.5 text-sm border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background"
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
            className="px-4 py-2 bg-accent text-accent-foreground rounded-lg hover:bg-accent/90 transition-colors text-sm font-medium flex items-center space-x-2"
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
        <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
          <div className="flex flex-col space-y-3">
            <span className="text-sm font-medium text-foreground">
              {selectedDocuments.size} document{selectedDocuments.size > 1 ? 's' : ''} selected
            </span>

            {/* Category Update */}
            <div className="flex items-center space-x-3">
              <label className="text-sm text-foreground font-medium min-w-[80px]">Category:</label>
              <select
                value={bulkCategory}
                onChange={(e) => setBulkCategory(e.target.value)}
                className="w-48 px-3 py-1.5 text-sm border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
              >
                <option value="">Select category...</option>
                <option value="contract">Contract</option>
                <option value="specifications">Specifications</option>
                <option value="other">Other</option>
              </select>
              <button
                onClick={handleBulkCategoryUpdate}
                disabled={!bulkCategory}
                className="px-4 py-1.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Update Category
              </button>
            </div>

            {/* Visibility Update */}
            {permissions.canSetDocumentVisibility() && (
              <div className="flex items-center space-x-3">
                <label className="text-sm text-foreground font-medium min-w-[80px]">Visibility:</label>
                <select
                  value={bulkVisibility}
                  onChange={(e) => setBulkVisibility(e.target.value)}
                  className="w-48 px-3 py-1.5 text-sm border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                >
                  <option value="">Select visibility...</option>
                  <option value={VISIBILITY.BOTH}>🌐 All Groups</option>
                  <option value={VISIBILITY.CONSULTING_ONLY}>🔒 Consulting Only</option>
                  <option value={VISIBILITY.CLIENT_ONLY}>🔒 Client Only</option>
                </select>
                <button
                  onClick={handleBulkVisibilityUpdate}
                  disabled={!bulkVisibility}
                  className="px-4 py-1.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Update Visibility
                </button>
              </div>
            )}

            {/* Delete Button */}
            {onDelete && (
              <button
                onClick={() => setShowDeleteModal(true)}
                className="self-start px-4 py-1.5 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition-colors text-sm font-medium flex items-center gap-2"
                title="Delete selected documents"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                Delete ({selectedDocuments.size})
              </button>
            )}
          </div>
        </div>
      )}

      {/* Document table */}
      {filteredDocuments.length === 0 ? (
        <div className="bg-muted/50 border-2 border-dashed border-border rounded-lg p-12 text-center">
          <svg
            className="mx-auto h-12 w-12 text-muted-foreground"
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
          <h4 className="mt-4 text-lg font-medium text-foreground">No documents found</h4>
          <p className="mt-2 text-sm text-muted-foreground">
            {selectedCategory === 'all'
              ? 'Upload documents to get started'
              : `No documents in the "${getCategoryName(selectedCategory)}" category`}
          </p>
          {onUploadNew && (
            <button
              onClick={onUploadNew}
              className="mt-4 px-4 py-2 bg-accent text-accent-foreground rounded-lg hover:bg-accent/90 transition-colors text-sm font-medium"
            >
              Upload Your First Document
            </button>
          )}
        </div>
      ) : (
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    ref={headerCheckboxRef}
                    type="checkbox"
                    onChange={toggleAllDocuments}
                    className="w-4 h-4 text-primary border-input rounded focus:ring-ring"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  File Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Group
                </th>
                <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Date
                </th>
                <th className="hidden lg:table-cell px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Size
                </th>
                <th className="hidden xl:table-cell px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Owner
                </th>
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-border">
              {filteredDocuments.map((doc) => (
                <tr key={doc.id} className="hover:bg-muted/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedDocuments.has(doc.id)}
                      onChange={() => toggleDocumentSelection(doc.id)}
                      className="w-4 h-4 text-primary border-input rounded focus:ring-ring"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {/* Download icon (functional) - only show if user has permission to view this document */}
                      {onDownload && permissions.canViewDocument(doc.visibility || VISIBILITY.BOTH) && (
                        <button
                          onClick={(event) => {
                            onDownload(doc);
                            // Show brief feedback to user
                            const btn = event.currentTarget;
                            const originalTitle = btn.title;
                            btn.title = 'Downloading...';
                            setTimeout(() => {
                              btn.title = originalTitle;
                            }, 2000);
                          }}
                          className="text-primary hover:text-primary/80 transition-colors flex-shrink-0"
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
                      <span className="text-sm font-medium text-foreground break-words min-w-0">{doc.name}</span>
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
                  <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    {formatDate(doc.uploadedAt || doc.createdAt)}
                  </td>
                  <td className="hidden lg:table-cell px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    {formatFileSize(doc.size)}
                  </td>
                  <td className="hidden xl:table-cell px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    {doc.uploadedBy || 'You'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Document count */}
      {filteredDocuments.length > 0 && (
        <p className="text-sm text-muted-foreground">
          Showing {filteredDocuments.length} {filteredDocuments.length === 1 ? 'document' : 'documents'}
          {selectedCategory !== 'all' && ` in ${getCategoryName(selectedCategory)}`}
        </p>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg shadow-xl max-w-md w-full">
            {/* Header */}
            <div className="px-6 py-4 border-b border-border">
              <h2 className="text-xl font-semibold text-foreground">Confirm Deletion</h2>
            </div>

            {/* Body */}
            <div className="px-6 py-4 space-y-4">
              <p className="text-muted-foreground">
                Are you sure you want to delete {selectedDocuments.size} {selectedDocuments.size === 1 ? 'document' : 'documents'}?
                This action cannot be undone.
              </p>

              {/* Confirmation Checkbox */}
              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={deleteConfirmed}
                  onChange={(e) => setDeleteConfirmed(e.target.checked)}
                  className="w-4 h-4 text-destructive border-input rounded focus:ring-ring mt-1"
                />
                <span className="text-sm text-foreground">
                  I confirm I want to delete {selectedDocuments.size} {selectedDocuments.size === 1 ? 'document' : 'documents'}
                </span>
              </label>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-muted/50 flex justify-end gap-3 rounded-b-lg">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmed(false);
                }}
                className="px-4 py-2 border border-input rounded-lg hover:bg-accent transition-colors text-foreground font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (onDelete) {
                    const selectedIds = Array.from(selectedDocuments);
                    selectedIds.forEach(id => onDelete(id));
                    setSelectedDocuments(new Set());
                    setShowDeleteModal(false);
                    setDeleteConfirmed(false);
                  }
                }}
                disabled={!deleteConfirmed}
                className="px-4 py-2 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition-colors font-medium disabled:bg-muted disabled:cursor-not-allowed"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
