import { useState } from 'react';
import { FileText, CheckSquare, Users } from '../icons';
import DocumentList from '../documents/DocumentList';
import DocumentUpload from '../documents/DocumentUpload';
import Header from '../layout/Header';
import Footer from '../layout/Footer';
import ProjectMembersPanel from '../project/ProjectMembersPanel';
import InviteUserModal from '../project/InviteUserModal';
import ActivityLogPanel from '../project/ActivityLogPanel';
import { useProjectPermissions } from '../../hooks/useProjectPermissions';
import { updateProject } from '../../services/projectService';

export default function ProjectDashboard({ project, onBack, onDeleteDocument, onUpdateDocumentCategories, onNavigateSettings }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const permissions = useProjectPermissions(project?.id);

  // Handle document download
  const handleDownload = (doc) => {
    // Create a blob URL from the file object if it exists
    if (doc.file) {
      const url = URL.createObjectURL(doc.file);
      const link = document.createElement('a');
      link.href = url;
      link.download = doc.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } else {
      console.warn('Cannot download - file object not available');
      // TODO: In production, fetch from Firebase Storage URL
    }
  };

  // Handle document deletion
  const handleDelete = (docId) => {
    if (onDeleteDocument) {
      onDeleteDocument(docId);
    }
  };

  // Handle uploading new documents
  const handleUploadNew = () => {
    setShowUploadModal(true);
  };

  // Handle files selected in upload component
  const handleFilesSelected = (files) => {
    setUploadedFiles(files);
  };

  // Handle document upload completion
  const handleUploadComplete = async () => {
    if (uploadedFiles.length === 0) {
      alert('Please select files to upload');
      return;
    }

    setIsUploading(true);

    try {
      // For now, just add the file metadata to the project
      // In production, this would upload to Firebase Storage first
      const newDocuments = uploadedFiles.map(fileData => ({
        id: fileData.id,
        name: fileData.name,
        category: fileData.category,
        size: fileData.size,
        uploadedAt: fileData.uploadedAt,
        uploadedBy: fileData.uploadedBy,
        visibility: fileData.visibility,
        file: fileData.file // Store file object for now (in production, this would be a storage URL)
      }));

      // Update project with new documents
      const updatedDocuments = [...(project.documents || []), ...newDocuments];
      await updateProject(project.id, { documents: updatedDocuments });

      // Close modal and reset state
      setShowUploadModal(false);
      setUploadedFiles([]);

      // Show success message
      alert(`Successfully uploaded ${newDocuments.length} document(s)`);

      // Refresh the page to show new documents
      window.location.reload();
    } catch (error) {
      console.error('Error completing upload:', error);
      alert('Failed to complete upload: ' + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  // Handle closing upload modal
  const handleCloseUploadModal = () => {
    setShowUploadModal(false);
    setUploadedFiles([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
      <Header onNavigateSettings={onNavigateSettings} />

      <div className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <button
            onClick={onBack}
            className="text-accent hover:text-accent-dark mb-4 flex items-center gap-2"
          >
            ← Back to Projects
          </button>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{project.name}</h1>
              <p className="text-gray-600">{project.clientType}</p>
            </div>
            {permissions.canInvite && (
              <button
                onClick={() => setShowInviteModal(true)}
                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 flex items-center gap-2"
              >
                <Users size={20} />
                Invite User
              </button>
            )}
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'overview'
                    ? 'border-teal-500 text-teal-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('members')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'members'
                    ? 'border-teal-500 text-teal-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Members
              </button>
              <button
                onClick={() => setActiveTab('activity')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'activity'
                    ? 'border-teal-500 text-teal-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Activity
              </button>
            </nav>
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
        <>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="text-accent" size={24} />
              <h3 className="text-xl font-bold text-gray-900">Client Intake</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Template: {project.intakeTemplate?.name}
            </p>
            <div className="space-y-3">
              {/* Show extracted client data if available */}
              {project.extractedData?.clientName && (
                <div>
                  <div className="text-xs font-medium text-gray-500 mb-1">Client Name</div>
                  <div className="text-sm text-gray-900">{project.extractedData.clientName}</div>
                </div>
              )}
              {project.extractedData?.budget && (
                <div>
                  <div className="text-xs font-medium text-gray-500 mb-1">Budget</div>
                  <div className="text-sm text-gray-900">{project.extractedData.budget}</div>
                </div>
              )}
              {project.extractedData?.timeline && (
                <div>
                  <div className="text-xs font-medium text-gray-500 mb-1">Timeline</div>
                  <div className="text-sm text-gray-900">{project.extractedData.timeline}</div>
                </div>
              )}
              {project.extractedData?.scope && (
                <div>
                  <div className="text-xs font-medium text-gray-500 mb-1">Scope of Work</div>
                  <div className="text-sm text-gray-900">{project.extractedData.scope}</div>
                </div>
              )}

              {/* Fallback to template fields if no extracted data */}
              {!project.extractedData?.clientName && project.intakeTemplate?.fields.slice(0, 5).map((field, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                  <div className="w-2 h-2 bg-accent rounded-full"></div>
                  {field}
                </div>
              ))}
              {!project.extractedData?.clientName && project.intakeTemplate?.fields.length > 5 && (
                <p className="text-sm text-gray-500 italic">
                  +{project.intakeTemplate.fields.length - 5} more fields
                </p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <CheckSquare className="text-accent" size={24} />
              <h3 className="text-xl font-bold text-gray-900">Deliverables</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              {project.extractedData?.deliverables?.length > 0
                ? 'Extracted from documents'
                : `Template: ${project.checklistTemplate?.name}`}
            </p>
            <div className="space-y-2">
              {/* Show extracted deliverables if available */}
              {project.extractedData?.deliverables?.length > 0 ? (
                <>
                  {project.extractedData.deliverables.slice(0, 5).map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                      <input type="checkbox" className="w-4 h-4 text-accent" />
                      {item}
                    </div>
                  ))}
                  {project.extractedData.deliverables.length > 5 && (
                    <p className="text-sm text-gray-500 italic">
                      +{project.extractedData.deliverables.length - 5} more deliverables
                    </p>
                  )}
                </>
              ) : (
                <>
                  {project.checklistTemplate?.items.slice(0, 5).map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                      <input type="checkbox" className="w-4 h-4 text-accent" />
                      {item}
                    </div>
                  ))}
                  {project.checklistTemplate?.items.length > 5 && (
                    <p className="text-sm text-gray-500 italic">
                      +{project.checklistTemplate.items.length - 5} more tasks
                    </p>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <Users className="text-accent" size={24} />
              <h3 className="text-xl font-bold text-gray-900">Client Stakeholders</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              {project.extractedData?.stakeholders?.length > 0
                ? 'Extracted from documents'
                : `Template: ${project.stakeholderTemplate?.name}`}
            </p>
            <div className="space-y-2">
              {/* Show extracted stakeholders if available */}
              {project.extractedData?.stakeholders?.length > 0 ? (
                project.extractedData.stakeholders.map((stakeholder, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-accent/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <Users size={16} className="text-accent" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-gray-900">
                        {stakeholder.name || stakeholder}
                      </div>
                      {stakeholder.role && (
                        <div className="text-xs text-gray-500">{stakeholder.role}</div>
                      )}
                      {stakeholder.email && (
                        <div className="text-xs text-gray-500">{stakeholder.email}</div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                project.stakeholderTemplate?.roles.map((role, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                    <div className="w-8 h-8 bg-accent/20 rounded-full flex items-center justify-center">
                      <Users size={16} className="text-accent" />
                    </div>
                    {role}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <Users className="text-accent" size={24} />
              <h3 className="text-xl font-bold text-gray-900">Your Team</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Template: {project.teamTemplate?.name}
            </p>
            <div className="space-y-2">
              {project.teamTemplate?.roles.map((role, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <Users size={16} className="text-green-600" />
                  </div>
                  {role}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Documents Section */}
        <div className="mt-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <DocumentList
              documents={project.documents || []}
              onDownload={handleDownload}
              onDelete={handleDelete}
              onUploadNew={handleUploadNew}
              onUpdateCategories={onUpdateDocumentCategories}
              projectId={project.id}
            />
          </div>
        </div>
        </>
        )}

        {/* Members Tab */}
        {activeTab === 'members' && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <ProjectMembersPanel projectId={project.id} />
          </div>
        )}

        {/* Activity Tab */}
        {activeTab === 'activity' && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <ActivityLogPanel projectId={project.id} />
          </div>
        )}

        </div>
      </div>

      <Footer />

      {/* Invite User Modal */}
      <InviteUserModal
        projectId={project.id}
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        onSuccess={() => {
          // Optionally refresh members list or show success message
          setShowInviteModal(false);
        }}
      />

      {/* Document Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" data-testid="upload-modal">
          <div className="bg-white rounded-lg p-6 max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Upload Documents</h3>
              <button
                onClick={handleCloseUploadModal}
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
                aria-label="Close modal"
              >
                ×
              </button>
            </div>

            <DocumentUpload
              projectId={project.id}
              onFilesSelected={handleFilesSelected}
            />

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={handleCloseUploadModal}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={isUploading}
              >
                Cancel
              </button>
              <button
                onClick={handleUploadComplete}
                className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-dark transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                disabled={isUploading || uploadedFiles.length === 0}
              >
                {isUploading ? 'Uploading...' : `Upload ${uploadedFiles.length} File${uploadedFiles.length !== 1 ? 's' : ''}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
