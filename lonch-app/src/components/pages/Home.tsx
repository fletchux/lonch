import { useAuth } from '../../contexts/AuthContext';
import { Plus, LonchO, ChevronRight } from '../icons';
import Header from '../layout/Header';
import Footer from '../layout/Footer';
import RoleBadge from '../shared/RoleBadge';
import GroupBadge from '../project/GroupBadge';
import { ROLES } from '../../utils/permissions';
import { GROUP } from '../../utils/groupPermissions';

interface Project {
  id: string;
  name: string;
  clientType: string;
  userRole?: typeof ROLES[keyof typeof ROLES];
  userGroup?: typeof GROUP.CONSULTING | typeof GROUP.CLIENT;
  [key: string]: any;
}

interface HomeProps {
  projects: Project[];
  projectsLoading: boolean;
  onNewProject: () => void;
  onSelectProject: (project: Project) => void;
  onLogin: () => void;
  onSignup: () => void;
  onNavigateProfile?: () => void;
  onNavigateSettings?: () => void;
}

export default function Home({
  projects,
  projectsLoading,
  onNewProject,
  onSelectProject,
  onLogin,
  onSignup,
  onNavigateProfile,
  onNavigateSettings
}: HomeProps) {
  const { currentUser } = useAuth();

  // Show animated background when there are no projects (whether logged in or not)
  const showAnimatedBackground = projects.length === 0 && !projectsLoading;

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Animated swirl background - shown when no projects */}
      {showAnimatedBackground && (
        <div className="absolute inset-0 bg-gradient-radial from-black via-[#1a5f5f] via-[#2D9B9B] via-[#1a5f5f] to-black bg-[length:400%_400%] animate-[gradient-swirl_20s_ease_infinite] opacity-90"></div>
      )}

      <div className={`relative z-10 flex flex-col min-h-screen ${showAnimatedBackground ? 'bg-transparent' : 'bg-background'}`}>
        <Header
          onNavigateProfile={onNavigateProfile}
          onNavigateSettings={onNavigateSettings}
        />

        <div className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          {projects.length > 0 && (
            <div className="flex justify-end mb-8">
              <button
                onClick={onNewProject}
                className="bg-primary text-primary-foreground px-6 py-3 rounded-lg flex items-center gap-2 hover:opacity-90 transition-opacity shadow-lg"
              >
                <Plus size={20} />
                New Project
              </button>
            </div>
          )}

        {projectsLoading ? (
          <div className="bg-card rounded-xl shadow-lg p-12 text-center border border-border">
            <div className="animate-pulse">
              <LonchO size={64} className="mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">Loading your projects...</p>
            </div>
          </div>
        ) : projects.length === 0 ? (
          <div className="bg-card rounded-xl shadow-lg p-12 text-center border border-border">
            <LonchO size={64} className="mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-2">Ready to lonch?</h2>
            <p className="text-muted-foreground mb-6">Start your first client project with our template-driven approach</p>

            {/* Task 4.9: Show login/signup buttons when not authenticated */}
            {!currentUser ? (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={onLogin}
                  className="bg-background text-primary border-2 border-primary px-8 py-3 rounded-lg text-lg font-medium hover:bg-primary hover:text-primary-foreground transition-colors shadow-lg"
                >
                  Log In
                </button>
                <button
                  onClick={onSignup}
                  className="bg-primary text-primary-foreground px-8 py-3 rounded-lg text-lg font-medium hover:opacity-90 transition-opacity shadow-lg"
                >
                  Sign Up
                </button>
              </div>
            ) : (
              <button
                onClick={onNewProject}
                className="bg-primary text-primary-foreground px-8 py-3 rounded-lg hover:opacity-90 transition-opacity"
              >
                Create Your First Project
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div
                key={project.id}
                onClick={() => onSelectProject(project)}
                className="bg-card rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer border border-border"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-xl font-bold text-foreground flex-1">{project.name}</h3>
                  <div className="flex gap-2">
                    {project.userGroup && (
                      <GroupBadge group={project.userGroup} />
                    )}
                    {project.userRole && project.userRole !== 'owner' && (
                      <RoleBadge role={project.userRole} />
                    )}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-4">{project.clientType}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-primary font-medium">Active</span>
                  <ChevronRight size={20} className="text-muted-foreground" />
                </div>
              </div>
            ))}
          </div>
        )}
        </div>
        </div>

        <Footer />
      </div>
    </div>
  );
}
