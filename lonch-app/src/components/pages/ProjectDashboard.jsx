import { useState } from 'react';
import { FileText, CheckSquare, Users } from '../icons';
import DocumentList from '../DocumentList';

export default function ProjectDashboard({ project, onBack }) {
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Mock handlers for document management
  const handleDownload = (doc) => {
    console.log('Download document:', doc);
    // TODO: Implement actual download from Firebase Storage
  };

  const handleDelete = (docId) => {
    console.log('Delete document:', docId);
    // TODO: Implement actual deletion from Firebase Storage
  };

  const handleUploadNew = () => {
    setShowUploadModal(true);
    // TODO: Show DocumentUpload component in a modal
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
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
            <div className="space-y-2">
              {project.intakeTemplate?.fields.slice(0, 5).map((field, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                  <div className="w-2 h-2 bg-accent rounded-full"></div>
                  {field}
                </div>
              ))}
              {project.intakeTemplate?.fields.length > 5 && (
                <p className="text-sm text-gray-500 italic">
                  +{project.intakeTemplate.fields.length - 5} more fields
                </p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <CheckSquare className="text-accent" size={24} />
              <h3 className="text-xl font-bold text-gray-900">Kickoff Checklist</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Template: {project.checklistTemplate?.name}
            </p>
            <div className="space-y-2">
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
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <Users className="text-accent" size={24} />
              <h3 className="text-xl font-bold text-gray-900">Client Stakeholders</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Template: {project.stakeholderTemplate?.name}
            </p>
            <div className="space-y-2">
              {project.stakeholderTemplate?.roles.map((role, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                  <div className="w-8 h-8 bg-accent/20 rounded-full flex items-center justify-center">
                    <Users size={16} className="text-accent" />
                  </div>
                  {role}
                </div>
              ))}
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
            />
          </div>
        </div>
      </div>
    </div>
  );
}
