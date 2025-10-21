import { useAuth } from '../../contexts/AuthContext';
import { Plus, LonchO, ChevronRight } from '../icons';
import Header from '../layout/Header';
import Footer from '../layout/Footer';
import RoleBadge from '../shared/RoleBadge';
import GroupBadge from '../project/GroupBadge';

export default function Home({ projects, onNewProject, onSelectProject, onLogin, onSignup, onNavigateSettings }) {
  const { currentUser } = useAuth();
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
      <Header onNavigateSettings={onNavigateSettings} />

      <div className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          {projects.length > 0 && (
            <div className="flex justify-end mb-8">
              <button
                onClick={onNewProject}
                className="bg-accent text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-accent-dark transition-colors shadow-lg"
              >
                <Plus size={20} />
                New Project
              </button>
            </div>
          )}

        {projects.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <LonchO size={64} className="mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Ready to lonch?</h2>
            <p className="text-gray-600 mb-6">Start your first client project with our template-driven approach</p>

            {/* Task 4.9: Show login/signup buttons when not authenticated */}
            {!currentUser ? (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={onLogin}
                  className="bg-white text-[#2D9B9B] border-2 border-[#2D9B9B] px-8 py-3 rounded-lg text-lg font-medium hover:bg-[#2D9B9B] hover:text-white transition-colors shadow-lg"
                >
                  Log In
                </button>
                <button
                  onClick={onSignup}
                  className="bg-[#2D9B9B] text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-[#247a7a] transition-colors shadow-lg"
                >
                  Sign Up
                </button>
              </div>
            ) : (
              <button
                onClick={onNewProject}
                className="bg-accent text-white px-8 py-3 rounded-lg hover:bg-accent-dark transition-colors"
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
                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-xl font-bold text-gray-900 flex-1">{project.name}</h3>
                  <div className="flex gap-2">
                    {project.userGroup && (
                      <GroupBadge group={project.userGroup} />
                    )}
                    {project.userRole && project.userRole !== 'owner' && (
                      <RoleBadge role={project.userRole} />
                    )}
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-4">{project.clientType}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-accent font-medium">Active</span>
                  <ChevronRight size={20} className="text-gray-400" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>

    <Footer />
    </div>
  );
}
