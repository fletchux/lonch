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
import Profile from './components/pages/Profile';
import Settings from './components/pages/Settings';
import SignupPage from './components/auth/SignupPage';
import LoginPage from './components/auth/LoginPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AcceptInviteLinkPage from './components/project/AcceptInviteLinkPage';

interface Document {
  id: string;
  name: string;
  category: 'contract' | 'specifications' | 'other';
  size: number;
  uploadedAt: string;
  uploadedBy?: string;
  visibility?: string;
  downloadURL?: string;
  storagePath?: string;
  fileName?: string;
  file?: File;
  [key: string]: any;
}

interface Template {
  name: string;
  fields?: string[];
  items?: string[];
  roles?: string[];
}

interface ProjectData {
  name: string;
  clientType: string;
  intakeTemplate: Template | null;
  checklistTemplate: Template | null;
  stakeholderTemplate: Template | null;
  teamTemplate: Template | null;
  documents: Document[];
  extractedData: any;
  extractionConflicts: any;
  manuallyEditedFields: string[];
}

interface Project {
  id: string;
  name: string;
  clientType: string;
  userRole?: string;
  documents?: Document[];
  [key: string]: any;
}

type View = 'home' | 'wizard' | 'project' | 'profile' | 'settings' | 'signup' | 'login' | 'acceptInvite';

// Separate component for app content so we can use useAuth
function AppContent() {
  const { currentUser } = useAuth();
  const [view, setView] = useState<View>('home');
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [step, setStep] = useState(1);
  const [inviteToken, setInviteToken] = useState<string | null>(null);
  const [projectData, setProjectData] = useState<ProjectData>({
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
  const fetchProjects = useCallback(async (): Promise<Project[]> => {
    if (currentUser) {
      try {
        // Fetch projects where user is owner
        const ownedProjects = await getUserProjects(currentUser.uid);

        // Fetch projects where user is a member (not necessarily owner)
        const memberProjects = await getUserProjectsAsMember(currentUser.uid);

        // Combine projects, removing duplicates (in case user is both owner and member)
        const projectMap = new Map<string, Project>();

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
        return allProjects;
      } catch (error) {
        console.error('Error fetching projects:', error);
        return [];
      }
    } else {
      // Clear projects when user logs out
      setProjects([]);
      return [];
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
        documents: [],
        status: 'active'
      });

      // Upload documents to Firebase Storage if there are any
      let uploadedDocuments: Document[] = [];
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
                uploadedBy: currentUser.displayName || currentUser.email || 'Unknown',
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
        await updateProject(newProject.id, { documents: uploadedDocuments });
      }

      // Update local state with the complete project
      const completeProject: Project = {
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

  const selectProject = (project: Project) => {
    setCurrentProject(project);
    setView('project');
  };

  const goHome = () => {
    setView('home');
    setCurrentProject(null);
  };

  const updateProjectDocuments = async (projectId: string, updatedDocuments: Document[]) => {
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

  const handleDeleteDocument = async (docId: string) => {
    if (!currentProject || !currentUser) return;

    const deletedDoc = currentProject.documents?.find(doc => doc.id === docId);
    const updatedDocuments = currentProject.documents?.filter(doc => doc.id !== docId) || [];

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

  const handleUploadDocument = async (newDocuments: Document[]) => {
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
          { documentName: doc.name, documentType: doc.category },
          null // groupContext not available at this level
        );
      }
    } catch (error) {
      console.error('Error logging document upload:', error);
    }
  };

  const handleUpdateDocumentCategories = (documentIds: string[], newCategory: string) => {
    if (!currentProject) return;

    const updatedDocuments = (currentProject.documents || []).map(doc =>
      documentIds.includes(doc.id) ? { ...doc, category: newCategory } : doc
    );
    updateProjectDocuments(currentProject.id, updatedDocuments);
  };

  const handleUpdateDocumentVisibility = (documentIds: string[], newVisibility: string) => {
    if (!currentProject) return;

    const updatedDocuments = (currentProject.documents || []).map(doc =>
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
          onNavigateProfile={() => setView('profile')}
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
            onNavigateProfile={() => setView('profile')}
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
            onNavigateProfile={() => setView('profile')}
            onNavigateSettings={() => setView('settings')}
          />
        </ProtectedRoute>
      )}
      {/* Profile page */}
      {view === 'profile' && (
        <ProtectedRoute
          onSwitchToSignup={() => setView('signup')}
          onLoginSuccess={() => setView('home')}
        >
          <Profile onNavigateHome={goHome} />
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
          onAccepted={async (projectId: string) => {
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
