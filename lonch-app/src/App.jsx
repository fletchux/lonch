import { useState } from 'react';
import Home from './components/pages/Home';
import Wizard from './components/pages/Wizard';
import ProjectDashboard from './components/pages/ProjectDashboard';

function App() {
  const [view, setView] = useState('home');
  const [currentProject, setCurrentProject] = useState(null);
  const [projects, setProjects] = useState([]);
  const [step, setStep] = useState(1);
  const [projectData, setProjectData] = useState({
    name: '',
    clientType: '',
    intakeTemplate: null,
    checklistTemplate: null,
    stakeholderTemplate: null,
    teamTemplate: null,
    documents: [], // Uploaded documents with metadata
    extractedData: null, // AI-extracted data from documents
    extractionConflicts: null, // Conflicts from multiple documents
    manuallyEditedFields: [] // Track which fields user has manually edited
  });

  const startNewProject = () => {
    setView('wizard');
    setStep(1);
    setProjectData({
      name: '',
      clientType: '',
      intakeTemplate: null,
      checklistTemplate: null,
      stakeholderTemplate: null,
      teamTemplate: null,
      documents: [],
      extractedData: null,
      extractionConflicts: null,
      manuallyEditedFields: []
    });
  };

  const saveProject = () => {
    const newProject = {
      id: Date.now(),
      ...projectData,
      createdAt: new Date().toISOString(),
      status: 'active'
    };
    setProjects([...projects, newProject]);
    setCurrentProject(newProject);
    setView('project');
  };

  const selectProject = (project) => {
    setCurrentProject(project);
    setView('project');
  };

  const goHome = () => {
    setView('home');
    setCurrentProject(null);
  };

  const handleLogin = () => {
    // TODO: Implement authentication
    console.log('Login clicked - implement authentication');
  };

  const updateProjectDocuments = (projectId, updatedDocuments) => {
    // Update the project in the projects array
    const updatedProjects = projects.map(project =>
      project.id === projectId
        ? { ...project, documents: updatedDocuments }
        : project
    );
    setProjects(updatedProjects);

    // Update currentProject if it's the one being modified
    if (currentProject?.id === projectId) {
      setCurrentProject({ ...currentProject, documents: updatedDocuments });
    }
  };

  const handleDeleteDocument = (docId) => {
    if (!currentProject) return;

    const updatedDocuments = currentProject.documents.filter(doc => doc.id !== docId);
    updateProjectDocuments(currentProject.id, updatedDocuments);
  };

  const handleUploadDocument = (newDocuments) => {
    if (!currentProject) return;

    const updatedDocuments = [...(currentProject.documents || []), ...newDocuments];
    updateProjectDocuments(currentProject.id, updatedDocuments);
  };

  const handleUpdateDocumentCategories = (documentIds, newCategory) => {
    if (!currentProject) return;

    const updatedDocuments = currentProject.documents.map(doc =>
      documentIds.includes(doc.id) ? { ...doc, category: newCategory } : doc
    );
    updateProjectDocuments(currentProject.id, updatedDocuments);
  };

  return (
    <>
      {view === 'home' && (
        <Home
          projects={projects}
          onNewProject={startNewProject}
          onSelectProject={selectProject}
          onLogin={handleLogin}
        />
      )}
      {view === 'wizard' && (
        <Wizard
          projectData={projectData}
          setProjectData={setProjectData}
          step={step}
          setStep={setStep}
          onCancel={goHome}
          onSave={saveProject}
        />
      )}
      {view === 'project' && currentProject && (
        <ProjectDashboard
          project={currentProject}
          onBack={goHome}
          onDeleteDocument={handleDeleteDocument}
          onUploadDocument={handleUploadDocument}
          onUpdateDocumentCategories={handleUpdateDocumentCategories}
        />
      )}
    </>
  );
}

export default App;
