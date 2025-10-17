# Task List: Collaboration & Permissions - Phase 1A (Core Permissions MVP)

**Based on PRD:** `0003-prd-collaboration-permissions.md`
**Feature:** Collaboration & Permissions - Phase 1A (Simpler MVP)
**Status:** 📋 Not Started

**Phase 1A Scope:** Basic role-based permissions (Owner/Admin/Editor/Viewer) with project invitation system and activity logging. No group distinction in this phase - all collaborators see the same project data.

---

## Relevant Files

### New Files to Create
- `src/services/invitationService.js` - Invitation management (create, send, accept/decline invitations)
- `src/services/invitationService.test.js` - Unit tests for invitation service
- `src/services/activityLogService.js` - Activity logging (track user actions on projects)
- `src/services/activityLogService.test.js` - Unit tests for activity log service
- `src/components/project/ProjectMembersPanel.jsx` - Display project members with roles
- `src/components/project/ProjectMembersPanel.test.jsx` - Unit tests for members panel
- `src/components/project/InviteUserModal.jsx` - Modal to invite users with role selection
- `src/components/project/InviteUserModal.test.jsx` - Unit tests for invite modal
- `src/components/project/ActivityLogPanel.jsx` - Display activity log timeline
- `src/components/project/ActivityLogPanel.test.jsx` - Unit tests for activity log panel
- `src/components/shared/RoleBadge.jsx` - Visual badge component for user roles
- `src/components/shared/RoleBadge.test.jsx` - Unit tests for role badge

### Files to Modify
- `src/services/projectService.js` - Add multi-user project queries, role checks
- `src/services/projectService.test.js` - Add tests for new multi-user functionality
- `src/App.jsx` - Update to fetch projects where user is member (not just owner)
- `src/components/pages/Home.jsx` - Display all accessible projects (owned + invited)
- `src/components/pages/ProjectDashboard.jsx` - Add Members and Activity tabs, enforce permissions
- `src/components/pages/Wizard.jsx` - Permission check (only Owner/Admin/Editor can create projects)

### Notes

- Unit tests should be placed alongside the code files they are testing
- Use `npm test` to run all tests with Vitest
- Firebase Firestore already integrated from PRD #0002
- AuthContext already provides currentUser from PRD #0002
- Follow existing patterns from userService.js and projectService.js

---

## Tasks

- [x] 1.0 Set up database schema and permissions for multi-user projects
  - [x] 1.1 Create Firestore collection structure for `projectMembers` (projectId, userId, role, invitedBy, joinedAt)
  - [x] 1.2 Update project document schema to include `members` array reference
  - [x] 1.3 Update `src/services/projectService.js` to add `addProjectMember(projectId, userId, role)` function
  - [x] 1.4 Update `src/services/projectService.js` to add `getProjectMembers(projectId)` function
  - [x] 1.5 Update `src/services/projectService.js` to add `updateMemberRole(projectId, userId, newRole)` function
  - [x] 1.6 Update `src/services/projectService.js` to add `removeMember(projectId, userId)` function
  - [x] 1.7 Update `src/services/projectService.js` to add `getUserProjectsAsMember(userId)` query (fetch projects where user is member, not just owner)
  - [x] 1.8 Add Firestore security rules to enforce role-based access (owners can delete, editors can write, viewers can read)
  - [x] 1.9 Create tests in `src/services/projectService.test.js` for all new multi-user functions

- [x] 2.0 Create invitation system with email and in-app invitations
  - [x] 2.1 Create `src/services/invitationService.js` with Firestore operations
  - [x] 2.2 Implement `createInvitation(projectId, email, role, invitedBy)` function (generate unique token, set expiration to 7 days)
  - [x] 2.3 Implement `getInvitation(token)` function to retrieve invitation by token
  - [x] 2.4 Implement `getUserInvitations(email)` function to get all pending invitations for a user
  - [x] 2.5 Implement `acceptInvitation(token, userId)` function (add user to projectMembers, mark invitation as accepted)
  - [x] 2.6 Implement `declineInvitation(token)` function (mark invitation as declined)
  - [x] 2.7 Implement `cancelInvitation(invitationId)` function (for owners/admins to revoke invitations)
  - [x] 2.8 Add email notification logic (integrate with Firebase Extensions or create placeholder for future email service)
  - [x] 2.9 Create comprehensive tests in `src/services/invitationService.test.js`

- [ ] 3.0 Implement role-based access control (Owner, Admin, Editor, Viewer)
  - [ ] 3.1 Create `src/utils/permissions.js` helper file with role constants (OWNER, ADMIN, EDITOR, VIEWER)
  - [ ] 3.2 Implement `canEditProject(userRole)` helper function (Owner, Admin, Editor = true; Viewer = false)
  - [ ] 3.3 Implement `canManageMembers(userRole)` helper function (Owner, Admin = true; Editor, Viewer = false)
  - [ ] 3.4 Implement `canDeleteProject(userRole)` helper function (Owner only = true)
  - [ ] 3.5 Implement `getUserRoleInProject(userId, projectId)` function in projectService to fetch user's role
  - [ ] 3.6 Create `useProjectPermissions(projectId)` custom React hook to expose role and permission checks
  - [ ] 3.7 Update `src/components/pages/ProjectDashboard.jsx` to use permission checks (hide/disable features based on role)
  - [ ] 3.8 Update document upload/edit features to check `canEditProject` permission before allowing actions
  - [ ] 3.9 Create tests for all permission helper functions in `src/utils/permissions.test.js`

- [ ] 4.0 Build project members management UI
  - [ ] 4.1 Create `src/components/shared/RoleBadge.jsx` component to display role with color coding (Owner=teal, Admin=gold, Editor=blue, Viewer=gray)
  - [ ] 4.2 Create tests for RoleBadge in `src/components/shared/RoleBadge.test.jsx`
  - [ ] 4.3 Create `src/components/project/ProjectMembersPanel.jsx` component to display list of project members
  - [ ] 4.4 Add member list with avatar, name, email, role badge, and "last active" timestamp
  - [ ] 4.5 Add role dropdown for Owner/Admin to change member roles (with confirmation dialog)
  - [ ] 4.6 Add "Remove" button for Owner/Admin to remove members (with confirmation dialog)
  - [ ] 4.7 Add search/filter functionality for projects with many members
  - [ ] 4.8 Create tests for ProjectMembersPanel in `src/components/project/ProjectMembersPanel.test.jsx`
  - [ ] 4.9 Create `src/components/project/InviteUserModal.jsx` modal component with email input and role selection dropdown
  - [ ] 4.10 Add email validation in InviteUserModal (check format, prevent duplicate invitations)
  - [ ] 4.11 Add "Invite" button handler to call invitationService.createInvitation()
  - [ ] 4.12 Display success message with shareable invite link after invitation created
  - [ ] 4.13 Create tests for InviteUserModal in `src/components/project/InviteUserModal.test.jsx`
  - [ ] 4.14 Update `src/components/pages/ProjectDashboard.jsx` to add "Members" tab with ProjectMembersPanel
  - [ ] 4.15 Add "Invite" button in ProjectDashboard that opens InviteUserModal (only visible to Owner/Admin)

- [ ] 5.0 Add activity logging and display
  - [ ] 5.1 Create `src/services/activityLogService.js` with Firestore operations
  - [ ] 5.2 Implement `logActivity(projectId, userId, action, resourceType, resourceId)` function
  - [ ] 5.3 Implement `getProjectActivityLog(projectId, limit, offset)` function with pagination
  - [ ] 5.4 Implement activity log filtering: `filterByUser(userId)`, `filterByAction(actionType)`, `filterByDateRange(startDate, endDate)`
  - [ ] 5.5 Add activity log calls to existing actions: document upload, document delete, member invited, member removed, role changed
  - [ ] 5.6 Create comprehensive tests in `src/services/activityLogService.test.js`
  - [ ] 5.7 Create `src/components/project/ActivityLogPanel.jsx` component with timeline display
  - [ ] 5.8 Add activity log entries with: user avatar, user name, action description, timestamp, resource link
  - [ ] 5.9 Add filter controls: filter by user dropdown, filter by action type dropdown, date range picker
  - [ ] 5.10 Implement pagination (load more button or infinite scroll)
  - [ ] 5.11 Create tests for ActivityLogPanel in `src/components/project/ActivityLogPanel.test.jsx`
  - [ ] 5.12 Update `src/components/pages/ProjectDashboard.jsx` to add "Activity" tab with ActivityLogPanel
  - [ ] 5.13 Update `src/App.jsx` to fetch both owned projects and projects where user is a member
  - [ ] 5.14 Update `src/components/pages/Home.jsx` to display all accessible projects with role indicator
  - [ ] 5.15 Add visual indicator on Home page for projects where user is not the owner (show role badge)

---

**Phase 2 Complete:** Sub-tasks generated for all parent tasks.

**Total Sub-Tasks:** 56

**Next Step:** Follow `process-task-list.md` workflow - create feature branch, implement one sub-task at a time, mark completed, commit after each parent task completion.
