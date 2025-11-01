import { useState, useEffect } from 'react';
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
import { useAuth } from '../../contexts/AuthContext';

interface Document {
  id: string;
  name: string;
  category: string;
  size: number;
  uploadedAt: string;
  uploadedBy: string;
  visibility: string;
  downloadURL?: string;
  storagePath?: string;
  fileName?: string;
  file?: File;
  [key: string]: any;
}

interface FileData {
  id: string;
  name: string;
  category: string;
  size: number;
  uploadedAt: string;
  uploadedBy: string;
  visibility: string;
  file: File;
}

interface Template {
  name: string;
  fields?: string[];
  items?: string[];
  roles?: string[];
}

interface Stakeholder {
  name?: string;
  role?: string;
  email?: string;
}

interface ExtractedData {
  clientName?: string;
  budget?: string;
  timeline?: string;
  scope?: string;
  deliverables?: string[];
  stakeholders?: (Stakeholder | string)[];
  [key: string]: any;
}

interface Project {
  id: string;
  name: string;
  clientType: string;
  documents?: Document[];
  intakeTemplate?: Template;
  checklistTemplate?: Template;
  stakeholderTemplate?: Template;
  teamTemplate?: Template;
  extractedData?: ExtractedData;
  [key: string]: any;
}

interface ProjectDashboardProps {
  project: Project;
  onBack: () => void;
  onDeleteDocument?: (docId: string) => void;
  onUpdateDocumentCategories?: (docIds: string[], category: string) => void;
  onUpdateDocumentVisibility?: (docId: string, visibility: string) => void;
  onNavigateProfile?: () => void;
  onNavigateSettings?: () => void;
}

type TabType = 'overview' | 'members' | 'activity';

export default function ProjectDashboard({
  project,
  onBack,
  onDeleteDocument,
  onUpdateDocumentCategories,
  onUpdateDocumentVisibility,
  onNavigateProfile,
  onNavigateSettings
}: ProjectDashboardProps) {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<FileData[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [localDocuments, setLocalDocuments] = useState<Document[]>(project?.documents || []);
  const permissions = useProjectPermissions(project?.id);

  // Sync local documents with project prop when it changes
  useEffect(() => {
    setLocalDocuments(project?.documents || []);
  }, [project?.documents]);

  // Handle document download
  const handleDownload = async (doc: Document) => {
    try {
      let downloadUrl: string;

      // If we have the file object (recently uploaded), use it
      if (doc.file) {
        downloadUrl = URL.createObjectURL(doc.file);
      }
      // If we have a downloadURL from Firebase Storage, use it
      else if (doc.downloadURL) {
        downloadUrl = doc.downloadURL;
      }
      // If we have a storage path, fetch the download URL
      else if (doc.storagePath) {
        const { getFileDownloadURL } = await import('../../services/fileStorage');
        downloadUrl = await getFileDownloadURL(doc.storagePath);
      }
      else {
        console.error('Cannot download - no file source available', doc);
        alert('Unable to download file. File source not found.');
        return;
      }

      // Trigger download
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = doc.name;
      link.target = '_blank'; // Open in new tab for Firebase URLs
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up blob URL if we created one
      if (doc.file) {
        URL.revokeObjectURL(downloadUrl);
      }
    } catch (error) {
      console.error('Error downloading file:', error);
      alert('Failed to download file: ' + (error as Error).message);
    }
  };

  // Handle document deletion
  const handleDelete = (docId: string) => {
    if (onDeleteDocument) {
      onDeleteDocument(docId);
    }
  };

  // Handle uploading new documents
  const handleUploadNew = () => {
    setShowUploadModal(true);
  };

  // Handle files selected in upload component
  const handleFilesSelected = (files: FileData[]) => {
    setUploadedFiles(files);
  };

  // Handle extraction status change
  const handleExtractionStatusChange = (isExtracting: boolean) => {
    setIsExtracting(isExtracting);
  };

  // Handle document upload completion
  const handleUploadComplete = async () => {
    if (uploadedFiles.length === 0) {
      alert('Please select files to upload');
      return;
    }

    setIsUploading(true);

    try {
      // Import Firebase Storage service
      const { uploadFile } = await import('../../services/fileStorage');

      // Upload each file to Firebase Storage and get download URLs
      const uploadPromises = uploadedFiles.map(async (fileData) => {
        try {
          // Upload file to Firebase Storage under projects/{projectId}/documents/
          const uploadResult = await uploadFile(
            fileData.file,
            project.id,
            fileData.category
          );

          // Return document metadata with Firebase Storage info
          return {
            id: fileData.id,
            name: fileData.name,
            category: fileData.category,
            size: fileData.size,
            uploadedAt: fileData.uploadedAt,
            uploadedBy: fileData.uploadedBy,
            visibility: fileData.visibility,
            downloadURL: uploadResult.downloadURL,
            storagePath: uploadResult.filePath,
            fileName: uploadResult.fileName
          };
        } catch (uploadError) {
          console.error(`Failed to upload ${fileData.name}:`, uploadError);
          throw new Error(`Failed to upload ${fileData.name}: ${(uploadError as Error).message}`);
        }
      });

      // Wait for all uploads to complete
      const newDocuments = await Promise.all(uploadPromises);

      // Update project with new documents
      const updatedDocuments = [...localDocuments, ...newDocuments];
      await updateProject(project.id, { documents: updatedDocuments });

      // Log activity for document uploads
      if (currentUser) {
        const { logActivity } = await import('../../services/activityLogService');
        for (const doc of newDocuments) {
          await logActivity(
            project.id,
            currentUser.uid,
            'document_uploaded',
            'document',
            doc.id,
            {
              documentName: doc.name,
              category: doc.category,
              visibility: doc.visibility
            }
          );
        }
      }

      // Update local documents state immediately
      setLocalDocuments(updatedDocuments);

      // Close modal and reset state
      setShowUploadModal(false);
      setUploadedFiles([]);

      // Switch to Overview tab to show uploaded documents
      setActiveTab('overview');

      // Show success message
      alert(`Successfully uploaded ${newDocuments.length} document(s)`);
    } catch (error) {
      console.error('Error completing upload:', error);
      alert('Failed to complete upload: ' + (error as Error).message);
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
    <div className="min-h-screen bg-background flex flex-col">
      <Header
        onNavigateProfile={onNavigateProfile}
        onNavigateSettings={onNavigateSettings}
      />

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
              <h1 className="text-3xl font-bold text-foreground mb-2">{project.name}</h1>
              <p className="text-muted-foreground">{project.clientType}</p>
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
          <div className="border-b border-border">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'overview'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('members')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'members'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                }`}
              >
                Members
              </button>
              <button
                onClick={() => setActiveTab('activity')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'activity'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
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
          <div className="bg-card rounded-xl shadow-lg p-6 border border-border">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="text-accent" size={24} />
              <h3 className="text-xl font-bold text-card-foreground">Client Intake</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Template: {project.intakeTemplate?.name}
            </p>
            <div className="space-y-3">
              {/* Show extracted client data if available */}
              {project.extractedData?.clientName && (
                <div>
                  <div className="text-xs font-medium text-muted-foreground mb-1">Client Name</div>
                  <div className="text-sm text-card-foreground">{project.extractedData.clientName}</div>
                </div>
              )}
              {project.extractedData?.budget && (
                <div>
                  <div className="text-xs font-medium text-muted-foreground mb-1">Budget</div>
                  <div className="text-sm text-card-foreground">{project.extractedData.budget}</div>
                </div>
              )}
              {project.extractedData?.timeline && (
                <div>
                  <div className="text-xs font-medium text-muted-foreground mb-1">Timeline</div>
                  <div className="text-sm text-card-foreground">{project.extractedData.timeline}</div>
                </div>
              )}
              {project.extractedData?.scope && (
                <div>
                  <div className="text-xs font-medium text-muted-foreground mb-1">Scope of Work</div>
                  <div className="text-sm text-card-foreground">{project.extractedData.scope}</div>
                </div>
              )}

              {/* Fallback to template fields if no extracted data */}
              {!project.extractedData?.clientName && project.intakeTemplate?.fields?.slice(0, 5).map((field, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm text-card-foreground">
                  <div className="w-2 h-2 bg-accent rounded-full"></div>
                  {field}
                </div>
              ))}
              {!project.extractedData?.clientName && project.intakeTemplate?.fields && project.intakeTemplate.fields.length > 5 && (
                <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                  +{project.intakeTemplate.fields.length - 5} more fields
                </p>
              )}
            </div>
          </div>

          <div className="bg-card rounded-xl shadow-lg p-6 border border-border">
            <div className="flex items-center gap-3 mb-4">
              <CheckSquare className="text-accent" size={24} />
              <h3 className="text-xl font-bold text-card-foreground">Deliverables</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              {project.extractedData?.deliverables && project.extractedData.deliverables.length > 0
                ? 'Extracted from documents'
                : `Template: ${project.checklistTemplate?.name}`}
            </p>
            <div className="space-y-2">
              {/* Show extracted deliverables if available */}
              {project.extractedData?.deliverables && project.extractedData.deliverables.length > 0 ? (
                <>
                  {project.extractedData.deliverables.slice(0, 5).map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm text-card-foreground">
                      <input type="checkbox" className="w-4 h-4 text-accent" />
                      {item}
                    </div>
                  ))}
                  {project.extractedData.deliverables.length > 5 && (
                    <p className="text-sm text-muted-foreground italic">
                      +{project.extractedData.deliverables.length - 5} more deliverables
                    </p>
                  )}
                </>
              ) : (
                <>
                  {project.checklistTemplate?.items?.slice(0, 5).map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm text-card-foreground">
                      <input type="checkbox" className="w-4 h-4 text-accent" />
                      {item}
                    </div>
                  ))}
                  {project.checklistTemplate?.items && project.checklistTemplate.items.length > 5 && (
                    <p className="text-sm text-muted-foreground italic">
                      +{project.checklistTemplate.items.length - 5} more tasks
                    </p>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="bg-card rounded-xl shadow-lg p-6 border border-border">
            <div className="flex items-center gap-3 mb-4">
              <Users className="text-accent" size={24} />
              <h3 className="text-xl font-bold text-card-foreground">Client Stakeholders</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              {project.extractedData?.stakeholders && project.extractedData.stakeholders.length > 0
                ? 'Extracted from documents'
                : `Template: ${project.stakeholderTemplate?.name}`}
            </p>
            <div className="space-y-2">
              {/* Show extracted stakeholders if available */}
              {project.extractedData?.stakeholders && project.extractedData.stakeholders.length > 0 ? (
                project.extractedData.stakeholders.map((stakeholder, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-accent/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <Users size={16} className="text-accent" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-card-foreground">
                        {typeof stakeholder === 'object' && stakeholder.name ? stakeholder.name : String(stakeholder)}
                      </div>
                      {typeof stakeholder === 'object' && stakeholder.role && (
                        <div className="text-xs text-muted-foreground">{stakeholder.role}</div>
                      )}
                      {typeof stakeholder === 'object' && stakeholder.email && (
                        <div className="text-xs text-muted-foreground">{stakeholder.email}</div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                project.stakeholderTemplate?.roles?.map((role, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm text-card-foreground">
                    <div className="w-8 h-8 bg-accent/20 rounded-full flex items-center justify-center">
                      <Users size={16} className="text-accent" />
                    </div>
                    {role}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-card rounded-xl shadow-lg p-6 border border-border">
            <div className="flex items-center gap-3 mb-4">
              <Users className="text-accent" size={24} />
              <h3 className="text-xl font-bold text-card-foreground">Your Team</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Template: {project.teamTemplate?.name}
            </p>
            <div className="space-y-2">
              {project.teamTemplate?.roles?.map((role, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm text-card-foreground">
                  <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                    <Users size={16} className="text-green-600 dark:text-green-400" />
                  </div>
                  {role}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Documents Section */}
        <div className="mt-8">
          <div className="bg-card rounded-xl shadow-lg p-6 border border-border">
            <DocumentList
              documents={localDocuments}
              onDownload={handleDownload}
              onDelete={handleDelete}
              onUploadNew={handleUploadNew}
              onUpdateCategories={onUpdateDocumentCategories}
              onUpdateVisibility={onUpdateDocumentVisibility}
              projectId={project.id}
            />
          </div>
        </div>
        </>
        )}

        {/* Members Tab */}
        {activeTab === 'members' && (
          <div className="bg-card rounded-xl shadow-lg p-6 border border-border">
            <ProjectMembersPanel projectId={project.id} />
          </div>
        )}

        {/* Activity Tab */}
        {activeTab === 'activity' && (
          <div className="bg-card rounded-xl shadow-lg p-6 border border-border">
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
          <div className="bg-card rounded-lg p-6 max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto border border-border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-card-foreground">Upload Documents</h3>
              <button
                onClick={handleCloseUploadModal}
                className="text-muted-foreground hover:text-foreground text-2xl leading-none"
                aria-label="Close modal"
              >
                ×
              </button>
            </div>

            <DocumentUpload
              projectId={project.id}
              onFilesSelected={handleFilesSelected}
              onExtractionStatusChange={handleExtractionStatusChange}
            />

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={handleCloseUploadModal}
                className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
                disabled={isUploading}
              >
                Cancel
              </button>
              <button
                onClick={handleUploadComplete}
                className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-dark transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                disabled={isUploading || isExtracting || uploadedFiles.length === 0}
              >
                {isUploading ? 'Uploading...' : isExtracting ? 'Extracting...' : `Upload ${uploadedFiles.length} File${uploadedFiles.length !== 1 ? 's' : ''}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
