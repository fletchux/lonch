import { FileText, CheckSquare, Users } from '../icons';
import DocumentList from '../DocumentList';
import Header from '../layout/Header';
import Footer from '../layout/Footer';

export default function ProjectDashboard({ project, onBack, onDeleteDocument, onUpdateDocumentCategories }) {

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
    // TODO: Show DocumentUpload component in a modal
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
      <Header />

      <div className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <button
            onClick={onBack}
            className="text-accent hover:text-accent-dark mb-4 flex items-center gap-2"
          >
            ← Back to Projects
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{project.name}</h1>
          <p className="text-gray-600">{project.clientType}</p>
        </div>

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
            />
          </div>
        </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
