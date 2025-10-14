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
    teamTemplate: null
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
      teamTemplate: null
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

  return (
    <>
      {view === 'home' && (
        <Home
          projects={projects}
          onNewProject={startNewProject}
          onSelectProject={selectProject}
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
        />
      )}
    </>
  );
}

export default App;
