import { Plus, LonchO, ChevronRight } from '../icons';
import lonchLogo from '../../assets/lonch_logo.svg';

const TAGLINE = 'Consultant project kickoff made simple';

export default function Home({ projects, onNewProject, onSelectProject }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-start mb-8">
          <div className="flex flex-col gap-3 items-start">
            <img src={lonchLogo} alt="Lonch" className="h-16" />
            <p className="text-gray-600 text-sm font-medium">{TAGLINE}</p>
          </div>
          <button
            onClick={onNewProject}
            className="bg-accent text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-accent-dark transition-colors shadow-lg"
          >
            <Plus size={20} />
            New Project
          </button>
        </div>

        {projects.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <LonchO size={64} className="mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Ready to lonch?</h2>
            <p className="text-gray-600 mb-6">Start your first client project with our template-driven approach</p>
            <button
              onClick={onNewProject}
              className="bg-accent text-white px-8 py-3 rounded-lg hover:bg-accent-dark transition-colors"
            >
              Create Your First Project
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div
                key={project.id}
                onClick={() => onSelectProject(project)}
                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer"
              >
                <h3 className="text-xl font-bold text-gray-900 mb-2">{project.name}</h3>
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
  );
}
