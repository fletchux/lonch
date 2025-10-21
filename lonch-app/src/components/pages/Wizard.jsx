import { FileText, CheckSquare, Users } from '../icons';
import { templates } from '../../data/templates';
import DocumentUpload from '../DocumentUpload';
import ExtractionIndicator from '../ExtractionIndicator';
import Header from '../layout/Header';
import Footer from '../layout/Footer';
import { mergeExtractedData, mapToProjectData } from '../../services/documentExtraction';

export default function Wizard({ projectData, setProjectData, step, setStep, onCancel, onSave, onNavigateSettings }) {
  const handleNext = () => {
    if (step < 6) {
      setStep(step + 1);
    } else {
      onSave();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      onCancel();
    }
  };

  const isStepValid = () => {
    switch (step) {
      case 1:
        return true; // Document upload is optional
      case 2:
        return projectData.name && projectData.clientType;
      case 3:
        return projectData.intakeTemplate;
      case 4:
        return projectData.checklistTemplate;
      case 5:
        return projectData.stakeholderTemplate;
      case 6:
        return projectData.teamTemplate;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
      <Header onNavigateSettings={onNavigateSettings} />

      <div className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">New Project Setup</h2>
              <span className="text-sm text-gray-600">Step {step} of 6</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-accent h-2 rounded-full transition-all"
                style={{ width: `${(step / 6) * 100}%` }}
              ></div>
            </div>
          </div>

          {step === 1 && (
            <DocumentUpload
              projectId={projectData.id || 'temp'}
              onFilesSelected={(files) => {
                setProjectData({ ...projectData, documents: files });
              }}
              onExtractionComplete={(result) => {
                // Use functional update to get the latest projectData
                setProjectData((currentData) => {
                  // Store extraction results for all documents
                  const allResults = [...(currentData.documents || []), result];
                  const { mergedData, conflicts, hasConflicts } = mergeExtractedData(allResults);
                  const mappedData = mapToProjectData(mergedData);

                  // Auto-populate project name if not manually edited
                  const updatedData = {
                    ...currentData,
                    extractedData: mappedData,
                    extractionConflicts: hasConflicts ? conflicts : null
                  };

                  // If project name hasn't been manually set, use extracted name
                  if (!currentData.name && mappedData.name) {
                    updatedData.name = mappedData.name;
                  }

                  // Auto-select a reasonable client type if budget indicates size
                  if (!currentData.clientType && mappedData.budget) {
                    const budgetStr = String(mappedData.budget);
                    // Extract number from budget string (handles both "$50,000" and "50000")
                    const amount = parseInt(budgetStr.replace(/[^0-9]/g, ''));

                    if (!isNaN(amount)) {
                      if (amount >= 100000) {
                        updatedData.clientType = 'enterprise';
                      } else if (amount >= 50000) {
                        updatedData.clientType = 'growth';
                      } else if (amount >= 20000) {
                        updatedData.clientType = 'smb';
                      } else {
                        updatedData.clientType = 'startup';
                      }
                    }
                  }

                  return updatedData;
                });
              }}
            />
          )}

          {step === 2 && (
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Project Basics</h3>
              <div className="space-y-4">
                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                    Project Name
                    {projectData.extractedData?.name && !projectData.manuallyEditedFields?.includes('name') && (
                      <ExtractionIndicator
                        source={projectData.extractedData.source}
                        hasConflict={projectData.extractionConflicts?.name}
                      />
                    )}
                  </label>
                  <input
                    type="text"
                    value={
                      projectData.name ||
                      (projectData.extractedData?.name && !projectData.manuallyEditedFields?.includes('name')
                        ? projectData.extractedData.name
                        : '')
                    }
                    onChange={(e) => {
                      setProjectData({
                        ...projectData,
                        name: e.target.value,
                        manuallyEditedFields: [...(projectData.manuallyEditedFields || []), 'name'].filter(
                          (v, i, a) => a.indexOf(v) === i
                        )
                      });
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                    placeholder="e.g., Acme Corp - Product Redesign"
                  />
                </div>
                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                    Client Type
                    {projectData.extractedData?.clientName && !projectData.manuallyEditedFields?.includes('clientType') && (
                      <ExtractionIndicator
                        source={projectData.extractedData.source}
                        hasConflict={projectData.extractionConflicts?.clientName}
                      />
                    )}
                  </label>
                  <select
                    value={projectData.clientType}
                    onChange={(e) => {
                      setProjectData({
                        ...projectData,
                        clientType: e.target.value,
                        manuallyEditedFields: [...(projectData.manuallyEditedFields || []), 'clientType'].filter(
                          (v, i, a) => a.indexOf(v) === i
                        )
                      });
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                  >
                    <option value="">Select client type</option>
                    <option value="startup">Startup (Seed-Series A)</option>
                    <option value="growth">Growth Stage (Series B+)</option>
                    <option value="enterprise">Enterprise</option>
                    <option value="smb">Small-Medium Business</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Client Intake Template</h3>
              <p className="text-gray-600 mb-6">Choose a template to structure your client discovery</p>
              <div className="space-y-3">
                {templates.intake.map((template) => (
                  <div
                    key={template.id}
                    onClick={() => setProjectData({ ...projectData, intakeTemplate: template })}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      projectData.intakeTemplate?.id === template.id
                        ? 'border-accent bg-accent/10'
                        : 'border-gray-200 hover:border-accent/30'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-gray-900">{template.name}</h4>
                        <p className="text-sm text-gray-600">{template.fields.length} fields</p>
                      </div>
                      <FileText size={24} className="text-accent" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Kickoff Checklist Template</h3>
              <p className="text-gray-600 mb-6">Select a checklist to track your setup tasks</p>
              <div className="space-y-3">
                {templates.checklist.map((template) => (
                  <div
                    key={template.id}
                    onClick={() => setProjectData({ ...projectData, checklistTemplate: template })}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      projectData.checklistTemplate?.id === template.id
                        ? 'border-accent bg-accent/10'
                        : 'border-gray-200 hover:border-accent/30'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-gray-900">{template.name}</h4>
                        <p className="text-sm text-gray-600">{template.items.length} tasks</p>
                      </div>
                      <CheckSquare size={24} className="text-accent" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 5 && (
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Stakeholder Map Template</h3>
              <p className="text-gray-600 mb-6">Choose a template for mapping client stakeholders</p>
              <div className="space-y-3">
                {templates.stakeholder.map((template) => (
                  <div
                    key={template.id}
                    onClick={() => setProjectData({ ...projectData, stakeholderTemplate: template })}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      projectData.stakeholderTemplate?.id === template.id
                        ? 'border-accent bg-accent/10'
                        : 'border-gray-200 hover:border-accent/30'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-gray-900">{template.name}</h4>
                        <p className="text-sm text-gray-600">{template.roles.length} roles</p>
                      </div>
                      <Users size={24} className="text-accent" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 6 && (
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Consulting Team Template</h3>
              <p className="text-gray-600 mb-6">Select your team structure template</p>
              <div className="space-y-3">
                {templates.team.map((template) => (
                  <div
                    key={template.id}
                    onClick={() => setProjectData({ ...projectData, teamTemplate: template })}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      projectData.teamTemplate?.id === template.id
                        ? 'border-accent bg-accent/10'
                        : 'border-gray-200 hover:border-accent/30'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-gray-900">{template.name}</h4>
                        <p className="text-sm text-gray-600">{template.roles.length} roles</p>
                      </div>
                      <Users size={24} className="text-accent" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-between mt-8">
            <button
              onClick={handleBack}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {step === 1 ? 'Cancel' : 'Back'}
            </button>
            <button
              onClick={handleNext}
              disabled={!isStepValid()}
              className="px-6 py-2 bg-accent text-white rounded-lg hover:bg-accent-dark transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {step === 6 ? 'Create Project' : 'Next'}
            </button>
          </div>
        </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
