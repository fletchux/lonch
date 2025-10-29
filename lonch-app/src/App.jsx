import { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import {
  getUserProjects,
  getUserProjectsAsMember,
  getUserRoleInProject,
  createProject,
  updateProject
} from './services/projectService';
import { logActivity } from './services/activityLogService';
import Home from './components/pages/Home';
import Wizard from './components/pages/Wizard';
import ProjectDashboard from './components/pages/ProjectDashboard';
import Settings from './components/pages/Settings';
import SignupPage from './components/auth/SignupPage';
import LoginPage from './components/auth/LoginPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AcceptInviteLinkPage from './components/project/AcceptInviteLinkPage';

// Separate component for app content so we can use useAuth
function AppContent() {
  const { currentUser } = useAuth();
  const [view, setView] = useState('home');
  const [currentProject, setCurrentProject] = useState(null);
  const [projects, setProjects] = useState([]);
  const [step, setStep] = useState(1);
  const [inviteToken, setInviteToken] = useState(null);
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

  // Parse URL on mount to detect invite links
  useEffect(() => {
    const path = window.location.pathname;
    const inviteMatch = path.match(/^\/invite\/(.+)$/);
    if (inviteMatch) {
      setInviteToken(inviteMatch[1]);
      setView('acceptInvite');
    }
  }, []);

  // Task 5.13: Fetch all accessible projects from Firestore when user changes
  // Extracted as a separate function so it can be called after invite acceptance (Bug #14 fix)
  // Returns the fetched projects array to avoid race conditions with state updates (Bug #16 fix)
  const fetchProjects = useCallback(async () => {
    if (currentUser) {
      try {
        // Fetch projects where user is owner
        const ownedProjects = await getUserProjects(currentUser.uid);

        // Fetch projects where user is a member (not necessarily owner)
        const memberProjects = await getUserProjectsAsMember(currentUser.uid);

        // Combine projects, removing duplicates (in case user is both owner and member)
        const projectMap = new Map();

        // Add owned projects first (user is owner)
        for (const project of ownedProjects) {
          projectMap.set(project.id, { ...project, userRole: 'owner' });
        }

        // Add member projects, enriching with user's role
        for (const project of memberProjects) {
          if (!projectMap.has(project.id)) {
            // Get user's role in this project
            const role = await getUserRoleInProject(currentUser.uid, project.id);
            projectMap.set(project.id, { ...project, userRole: role });
          }
        }

        // Convert map to array
        const allProjects = Array.from(projectMap.values());
        setProjects(allProjects);
        return allProjects; // Return fetched projects to avoid state race conditions
      } catch (error) {
        console.error('Error fetching projects:', error);
        return []; // Return empty array on error
      }
    } else {
      // Clear projects when user logs out
      setProjects([]);
      return []; // Return empty array when no user
    }
  }, [currentUser]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

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

  const saveProject = async () => {
    if (!currentUser) {
      console.error('User must be logged in to save project');
      return;
    }

    try {
      // First, create the project to get a project ID
      const newProject = await createProject(currentUser.uid, {
        ...projectData,
        documents: [], // Don't include documents yet
        status: 'active'
      });

      // Upload documents to Firebase Storage if there are any
      let uploadedDocuments = [];
      if (projectData.documents && projectData.documents.length > 0) {
        const { uploadFile } = await import('./services/fileStorage');

        const uploadPromises = projectData.documents.map(async (fileData) => {
          // Only upload if it has a file object (not already uploaded)
          if (fileData.file) {
            try {
              const uploadResult = await uploadFile(
                fileData.file,
                newProject.id,
                fileData.category || 'other'
              );

              return {
                id: fileData.id,
                name: fileData.name,
                category: fileData.category || 'other',
                size: fileData.size,
                uploadedAt: fileData.uploadedAt,
                uploadedBy: currentUser.displayName || currentUser.email,
                visibility: fileData.visibility || 'both',
                downloadURL: uploadResult.downloadURL,
                storagePath: uploadResult.filePath,
                fileName: uploadResult.fileName
              };
            } catch (error) {
              console.error(`Failed to upload ${fileData.name}:`, error);
              // Return the file data without storage info if upload fails
              return fileData;
            }
          }
          return fileData;
        });

        uploadedDocuments = await Promise.all(uploadPromises);

        // Update the project with uploaded documents
        const { updateProject } = await import('./services/projectService');
        await updateProject(newProject.id, { documents: uploadedDocuments });
      }

      // Update local state with the complete project
      const completeProject = {
        ...newProject,
        documents: uploadedDocuments
      };

      setProjects([...projects, completeProject]);
      setCurrentProject(completeProject);
      setView('project');
    } catch (error) {
      console.error('Error saving project:', error);
      alert('Failed to save project. Please try again.');
    }
  };

  const selectProject = (project) => {
    setCurrentProject(project);
    setView('project');
  };

  const goHome = () => {
    setView('home');
    setCurrentProject(null);
  };

  const updateProjectDocuments = async (projectId, updatedDocuments) => {
    try {
      // Update in Firestore
      await updateProject(projectId, { documents: updatedDocuments });

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
    } catch (error) {
      console.error('Error updating project documents:', error);
      alert('Failed to update documents. Please try again.');
    }
  };

  const handleDeleteDocument = async (docId) => {
    if (!currentProject || !currentUser) return;

    const deletedDoc = currentProject.documents.find(doc => doc.id === docId);
    const updatedDocuments = currentProject.documents.filter(doc => doc.id !== docId);

    await updateProjectDocuments(currentProject.id, updatedDocuments);

    // Log activity (Task 6.1: include groupContext)
    try {
      await logActivity(
        currentProject.id,
        currentUser.uid,
        'document_deleted',
        'document',
        docId,
        { documentName: deletedDoc?.name || 'Unknown document' },
        null // groupContext not available at this level
      );
    } catch (error) {
      console.error('Error logging document deletion:', error);
    }
  };

  const handleUploadDocument = async (newDocuments) => {
    if (!currentProject || !currentUser) return;

    const updatedDocuments = [...(currentProject.documents || []), ...newDocuments];
    await updateProjectDocuments(currentProject.id, updatedDocuments);

    // Log activity for each uploaded document (Task 6.1: include groupContext)
    try {
      for (const doc of newDocuments) {
        await logActivity(
          currentProject.id,
          currentUser.uid,
          'document_uploaded',
          'document',
          doc.id,
          { documentName: doc.name, documentType: doc.type },
          null // groupContext not available at this level
        );
      }
    } catch (error) {
      console.error('Error logging document upload:', error);
    }
  };

  const handleUpdateDocumentCategories = (documentIds, newCategory) => {
    if (!currentProject) return;

    const updatedDocuments = currentProject.documents.map(doc =>
      documentIds.includes(doc.id) ? { ...doc, category: newCategory } : doc
    );
    updateProjectDocuments(currentProject.id, updatedDocuments);
  };

  const handleUpdateDocumentVisibility = (documentIds, newVisibility) => {
    if (!currentProject) return;

    const updatedDocuments = currentProject.documents.map(doc =>
      documentIds.includes(doc.id) ? { ...doc, visibility: newVisibility } : doc
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
          onLogin={() => setView('login')}
          onSignup={() => setView('signup')}
          onNavigateSettings={() => setView('settings')}
        />
      )}
      {/* Task 4.5: Add signup and login views */}
      {view === 'signup' && (
        <SignupPage
          onSuccess={() => setView('home')}
          onSwitchToLogin={() => setView('login')}
        />
      )}
      {view === 'login' && (
        <LoginPage
          onSuccess={() => setView('home')}
          onSwitchToSignup={() => setView('signup')}
        />
      )}
      {/* Task 4.4: Wrap wizard with ProtectedRoute */}
      {view === 'wizard' && (
        <ProtectedRoute
          onSwitchToSignup={() => setView('signup')}
          onLoginSuccess={() => setView('home')}
        >
          <Wizard
            projectData={projectData}
            setProjectData={setProjectData}
            step={step}
            setStep={setStep}
            onCancel={goHome}
            onSave={saveProject}
            onNavigateSettings={() => setView('settings')}
          />
        </ProtectedRoute>
      )}
      {/* Task 4.4: Wrap project dashboard with ProtectedRoute */}
      {view === 'project' && currentProject && (
        <ProtectedRoute
          onSwitchToSignup={() => setView('signup')}
          onLoginSuccess={() => setView('home')}
        >
          <ProjectDashboard
            project={currentProject}
            onBack={goHome}
            onDeleteDocument={handleDeleteDocument}
            onUploadDocument={handleUploadDocument}
            onUpdateDocumentCategories={handleUpdateDocumentCategories}
            onUpdateDocumentVisibility={handleUpdateDocumentVisibility}
            onNavigateSettings={() => setView('settings')}
          />
        </ProtectedRoute>
      )}
      {/* Settings page with notification preferences */}
      {view === 'settings' && (
        <ProtectedRoute
          onSwitchToSignup={() => setView('signup')}
          onLoginSuccess={() => setView('home')}
        >
          <Settings onNavigateHome={goHome} />
        </ProtectedRoute>
      )}
      {/* Task 3.1: Accept invite link page */}
      {view === 'acceptInvite' && inviteToken && (
        <AcceptInviteLinkPage
          token={inviteToken}
          onAccepted={async (projectId) => {
            // Bug #14/#16 fix: Refetch projects to include the newly joined project
            // Use the return value to avoid race condition with state updates
            const freshProjects = await fetchProjects();

            // Navigate to accepted project using the fresh data
            const project = freshProjects.find(p => p.id === projectId);
            if (project) {
              selectProject(project);
            } else {
              // If project still not found (rare), go home
              goHome();
            }
          }}
          onNavigateToLogin={() => setView('login')}
          onNavigateToHome={goHome}
        />
      )}
    </>
  );
}

// Main App component that wraps AppContent with AuthProvider
function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
