import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Home from './Home';
import * as AuthContext from '../../contexts/AuthContext';

vi.mock('../../contexts/AuthContext');
vi.mock('../layout/Header', () => ({
  default: () => <div data-testid="header">Header</div>
}));
vi.mock('../layout/Footer', () => ({
  default: () => <div data-testid="footer">Footer</div>
}));

describe('Home', () => {
  const mockOnNewProject = vi.fn();
  const mockOnSelectProject = vi.fn();
  const mockOnLogin = vi.fn();
  const mockOnSignup = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('When authenticated', () => {
    beforeEach(() => {
      vi.mocked(AuthContext.useAuth).mockReturnValue({
        currentUser: { uid: 'user123', email: 'test@example.com' },
        loading: false,
        error: null
      });
    });

    it('should render empty state with create button when no projects', () => {
      render(
        <Home
          projects={[]}
          onNewProject={mockOnNewProject}
          onSelectProject={mockOnSelectProject}
          onLogin={mockOnLogin}
          onSignup={mockOnSignup}
        />
      );

      expect(screen.getByText('Ready to lonch?')).toBeInTheDocument();
      expect(screen.getByText('Create Your First Project')).toBeInTheDocument();
      expect(screen.queryByText('Log In')).not.toBeInTheDocument();
      expect(screen.queryByText('Sign Up')).not.toBeInTheDocument();
    });

    it('should call onNewProject when create button is clicked', () => {
      render(
        <Home
          projects={[]}
          onNewProject={mockOnNewProject}
          onSelectProject={mockOnSelectProject}
          onLogin={mockOnLogin}
          onSignup={mockOnSignup}
        />
      );

      const createButton = screen.getByText('Create Your First Project');
      fireEvent.click(createButton);
      expect(mockOnNewProject).toHaveBeenCalledTimes(1);
    });

    it('should render project cards when projects exist', () => {
      const mockProjects = [
        {
          id: 'project1',
          name: 'Project Alpha',
          clientType: 'Enterprise',
          userRole: 'owner',
          userGroup: 'consulting'
        },
        {
          id: 'project2',
          name: 'Project Beta',
          clientType: 'Startup',
          userRole: 'editor',
          userGroup: 'client'
        }
      ];

      render(
        <Home
          projects={mockProjects}
          onNewProject={mockOnNewProject}
          onSelectProject={mockOnSelectProject}
          onLogin={mockOnLogin}
          onSignup={mockOnSignup}
        />
      );

      expect(screen.getByText('Project Alpha')).toBeInTheDocument();
      expect(screen.getByText('Project Beta')).toBeInTheDocument();
      expect(screen.getByText('Enterprise')).toBeInTheDocument();
      expect(screen.getByText('Startup')).toBeInTheDocument();
    });

    it('should show New Project button when projects exist', () => {
      const mockProjects = [
        {
          id: 'project1',
          name: 'Project Alpha',
          clientType: 'Enterprise',
          userRole: 'owner',
          userGroup: 'consulting'
        }
      ];

      render(
        <Home
          projects={mockProjects}
          onNewProject={mockOnNewProject}
          onSelectProject={mockOnSelectProject}
          onLogin={mockOnLogin}
          onSignup={mockOnSignup}
        />
      );

      expect(screen.getByText('New Project')).toBeInTheDocument();
    });

    it('should call onSelectProject when a project card is clicked', () => {
      const mockProjects = [
        {
          id: 'project1',
          name: 'Project Alpha',
          clientType: 'Enterprise',
          userRole: 'owner',
          userGroup: 'consulting'
        }
      ];

      render(
        <Home
          projects={mockProjects}
          onNewProject={mockOnNewProject}
          onSelectProject={mockOnSelectProject}
          onLogin={mockOnLogin}
          onSignup={mockOnSignup}
        />
      );

      const projectCard = screen.getByText('Project Alpha').closest('div').closest('div');
      fireEvent.click(projectCard);
      expect(mockOnSelectProject).toHaveBeenCalledWith(mockProjects[0]);
    });
  });

  describe('When not authenticated', () => {
    beforeEach(() => {
      vi.mocked(AuthContext.useAuth).mockReturnValue({
        currentUser: null,
        loading: false,
        error: null
      });
    });

    it('should show login and signup buttons when no projects and not authenticated', () => {
      render(
        <Home
          projects={[]}
          onNewProject={mockOnNewProject}
          onSelectProject={mockOnSelectProject}
          onLogin={mockOnLogin}
          onSignup={mockOnSignup}
        />
      );

      expect(screen.getByText('Log In')).toBeInTheDocument();
      expect(screen.getByText('Sign Up')).toBeInTheDocument();
      expect(screen.queryByText('Create Your First Project')).not.toBeInTheDocument();
    });

    it('should call onLogin when Log In button is clicked', () => {
      render(
        <Home
          projects={[]}
          onNewProject={mockOnNewProject}
          onSelectProject={mockOnSelectProject}
          onLogin={mockOnLogin}
          onSignup={mockOnSignup}
        />
      );

      const loginButton = screen.getByText('Log In');
      fireEvent.click(loginButton);
      expect(mockOnLogin).toHaveBeenCalledTimes(1);
    });

    it('should call onSignup when Sign Up button is clicked', () => {
      render(
        <Home
          projects={[]}
          onNewProject={mockOnNewProject}
          onSelectProject={mockOnSelectProject}
          onLogin={mockOnLogin}
          onSignup={mockOnSignup}
        />
      );

      const signupButton = screen.getByText('Sign Up');
      fireEvent.click(signupButton);
      expect(mockOnSignup).toHaveBeenCalledTimes(1);
    });
  });

  // Group Badge Display Tests (Task 4.10)
  describe('Group Badge Display', () => {
    beforeEach(() => {
      vi.mocked(AuthContext.useAuth).mockReturnValue({
        currentUser: { uid: 'user123', email: 'test@example.com' },
        loading: false,
        error: null
      });
    });

    it('should display group badge for projects with userGroup property', () => {
      const mockProjects = [
        {
          id: 'project1',
          name: 'Consulting Project',
          clientType: 'Enterprise',
          userRole: 'editor',
          userGroup: 'consulting'
        },
        {
          id: 'project2',
          name: 'Client Project',
          clientType: 'Startup',
          userRole: 'viewer',
          userGroup: 'client'
        }
      ];

      render(
        <Home
          projects={mockProjects}
          onNewProject={mockOnNewProject}
          onSelectProject={mockOnSelectProject}
          onLogin={mockOnLogin}
          onSignup={mockOnSignup}
        />
      );

      // Should have GroupBadge components rendered
      const groupBadges = screen.getAllByTestId('group-badge');
      expect(groupBadges.length).toBe(2);
    });

    it('should display group badge for consulting group members', () => {
      const mockProjects = [
        {
          id: 'project1',
          name: 'Consulting Project',
          clientType: 'Enterprise',
          userRole: 'admin',
          userGroup: 'consulting'
        }
      ];

      render(
        <Home
          projects={mockProjects}
          onNewProject={mockOnNewProject}
          onSelectProject={mockOnSelectProject}
          onLogin={mockOnLogin}
          onSignup={mockOnSignup}
        />
      );

      const groupBadge = screen.getByTestId('group-badge');
      expect(groupBadge).toBeInTheDocument();
      // GroupBadge component internally renders the correct text/styling
    });

    it('should display group badge for client group members', () => {
      const mockProjects = [
        {
          id: 'project1',
          name: 'Client Project',
          clientType: 'Startup',
          userRole: 'viewer',
          userGroup: 'client'
        }
      ];

      render(
        <Home
          projects={mockProjects}
          onNewProject={mockOnNewProject}
          onSelectProject={mockOnSelectProject}
          onLogin={mockOnLogin}
          onSignup={mockOnSignup}
        />
      );

      const groupBadge = screen.getByTestId('group-badge');
      expect(groupBadge).toBeInTheDocument();
    });

    it('should not display group badge when userGroup is not provided', () => {
      const mockProjects = [
        {
          id: 'project1',
          name: 'Project Without Group',
          clientType: 'Enterprise',
          userRole: 'owner'
          // No userGroup property
        }
      ];

      render(
        <Home
          projects={mockProjects}
          onNewProject={mockOnNewProject}
          onSelectProject={mockOnSelectProject}
          onLogin={mockOnLogin}
          onSignup={mockOnSignup}
        />
      );

      const groupBadges = screen.queryAllByTestId('group-badge');
      expect(groupBadges.length).toBe(0);
    });

    it('should display both group badge and role badge for non-owner members', () => {
      const mockProjects = [
        {
          id: 'project1',
          name: 'Collaborative Project',
          clientType: 'Enterprise',
          userRole: 'editor',
          userGroup: 'consulting'
        }
      ];

      render(
        <Home
          projects={mockProjects}
          onNewProject={mockOnNewProject}
          onSelectProject={mockOnSelectProject}
          onLogin={mockOnLogin}
          onSignup={mockOnSignup}
        />
      );

      expect(screen.getByTestId('group-badge')).toBeInTheDocument();
      expect(screen.getByTestId('role-badge')).toBeInTheDocument();
    });

    it('should display only group badge for owner role (role badge hidden)', () => {
      const mockProjects = [
        {
          id: 'project1',
          name: 'Owner Project',
          clientType: 'Enterprise',
          userRole: 'owner',
          userGroup: 'consulting'
        }
      ];

      render(
        <Home
          projects={mockProjects}
          onNewProject={mockOnNewProject}
          onSelectProject={mockOnSelectProject}
          onLogin={mockOnLogin}
          onSignup={mockOnSignup}
        />
      );

      expect(screen.getByTestId('group-badge')).toBeInTheDocument();
      // Role badge should not be shown for owner (line 73 condition)
      expect(screen.queryByTestId('role-badge')).not.toBeInTheDocument();
    });

    it('should handle mixed projects with and without groups', () => {
      const mockProjects = [
        {
          id: 'project1',
          name: 'Project With Group',
          clientType: 'Enterprise',
          userRole: 'editor',
          userGroup: 'consulting'
        },
        {
          id: 'project2',
          name: 'Project Without Group',
          clientType: 'Startup',
          userRole: 'admin'
          // No userGroup
        },
        {
          id: 'project3',
          name: 'Another Group Project',
          clientType: 'SMB',
          userRole: 'viewer',
          userGroup: 'client'
        }
      ];

      render(
        <Home
          projects={mockProjects}
          onNewProject={mockOnNewProject}
          onSelectProject={mockOnSelectProject}
          onLogin={mockOnLogin}
          onSignup={mockOnSignup}
        />
      );

      const groupBadges = screen.getAllByTestId('group-badge');
      // Only 2 projects have userGroup defined
      expect(groupBadges.length).toBe(2);
    });
  });
});
