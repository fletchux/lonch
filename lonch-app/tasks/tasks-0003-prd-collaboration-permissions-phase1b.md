# Task List: Collaboration & Permissions - Phase 1B (Dual-Group Architecture)

**Based on PRD:** `0003-prd-collaboration-permissions.md`
**Feature:** Collaboration & Permissions - Phase 1B (Dual-Group Architecture)
**Status:** 📋 Not Started

**Phase 1B Scope:** Add Consulting Group vs Client Group distinction with group-based data visibility, group assignment in invitations, enhanced activity logs with group context, and notification preferences.

**Builds Upon:** Phase 1A (Core Permissions MVP) - completed and merged

---

## Relevant Files

### New Files to Create
- `src/components/project/DocumentVisibilityToggle.jsx` - Toggle component for document visibility settings (Consulting Only/Client Only/Both Groups)
- `src/components/project/DocumentVisibilityToggle.test.jsx` - Unit tests for visibility toggle
- `src/components/project/GroupBadge.jsx` - Visual badge component for user group (Consulting/Client)
- `src/components/project/GroupBadge.test.jsx` - Unit tests for group badge
- `src/components/settings/NotificationPreferences.jsx` - User notification preferences UI
- `src/components/settings/NotificationPreferences.test.jsx` - Unit tests for notification preferences
- `src/services/notificationService.js` - Notification management (in-app and email)
- `src/services/notificationService.test.js` - Unit tests for notification service
- `src/utils/groupPermissions.js` - Group-based permission helpers
- `src/utils/groupPermissions.test.js` - Unit tests for group permissions

### Files to Modify
- `src/services/projectService.js` - Add group field to projectMember schema, group-aware queries
- `src/services/projectService.test.js` - Add tests for group-aware functionality
- `src/services/invitationService.js` - Add group field to invitations
- `src/services/invitationService.test.js` - Add tests for group invitations
- `src/services/activityLogService.js` - Add groupContext field to activity logs
- `src/services/activityLogService.test.js` - Add tests for group-aware logging
- `src/components/project/InviteUserModal.jsx` - Add group selection dropdown
- `src/components/project/InviteUserModal.test.jsx` - Add tests for group selection
- `src/components/project/ProjectMembersPanel.jsx` - Display group badges, add group change functionality
- `src/components/project/ProjectMembersPanel.test.jsx` - Add tests for group management
- `src/components/project/ActivityLogPanel.jsx` - Add group context to activity entries, group filtering
- `src/components/project/ActivityLogPanel.test.jsx` - Add tests for group filtering
- `src/components/pages/ProjectDashboard.jsx` - Implement group-based document visibility
- `src/components/pages/Home.jsx` - Show group badges for member projects
- `src/utils/permissions.js` - Add group-aware permission checks
- `src/utils/permissions.test.js` - Add tests for group permissions
- `firestore.rules` - Add group-based security rules for document visibility

### Notes

- Unit tests should be placed alongside the code files they are testing
- Use `npm test` to run all tests with Vitest
- Phase 1A foundation provides: roles (Owner/Admin/Editor/Viewer), invitation system, activity logs, members UI
- Phase 1B adds the group layer on top of existing role-based permissions
- Groups are hardcoded: "consulting" and "client" (no dynamic group creation)

---

## Tasks

- [x] 1.0 Extend database schema for dual-group architecture
  - [x] 1.1 Add `group` field ('consulting' | 'client') to projectMembers collection schema
  - [x] 1.2 Update `addProjectMember()` function in projectService.js to accept group parameter
  - [x] 1.3 Add `group` field to invitation schema in invitationService.js
  - [x] 1.4 Add `groupContext` field to activityLog schema in activityLogService.js
  - [x] 1.5 Add `visibility` field ('consulting_only' | 'client_only' | 'both') to document schema
  - [x] 1.6 Create migration helper to add group='consulting' to existing project members (backwards compatibility)
  - [x] 1.7 Update Firestore security rules to enforce group-based document visibility
  - [x] 1.8 Create comprehensive tests in projectService.test.js for group-aware functions
  - [x] 1.9 Create comprehensive tests in invitationService.test.js for group invitations

- [x] 2.0 Implement group-based permission system
  - [x] 2.1 Create `src/utils/groupPermissions.js` with GROUP constants ('consulting', 'client')
  - [x] 2.2 Implement `canViewDocument(userGroup, documentVisibility)` helper function
  - [x] 2.3 Implement `canSetDocumentVisibility(userRole, userGroup)` helper function (Owner/Admin in Consulting group only)
  - [x] 2.4 Implement `canMoveUserBetweenGroups(userRole)` helper function (Owner/Admin only)
  - [x] 2.5 Implement `getDefaultDocumentVisibility(userGroup)` helper (Consulting → 'consulting_only', Client → 'both')
  - [x] 2.6 Update `useProjectPermissions` hook to include user's group and group-based checks
  - [x] 2.7 Add `getUserGroupInProject(userId, projectId)` function to projectService.js
  - [x] 2.8 Create comprehensive tests in groupPermissions.test.js
  - [x] 2.9 Update existing permissions.test.js to work with group-aware permissions

- [x] 3.0 Update invitation system with group assignment
  - [x] 3.1 Update `createInvitation()` in invitationService.js to accept and store group parameter
  - [x] 3.2 Update InviteUserModal.jsx to add group selection dropdown (Consulting Group / Client Group)
  - [x] 3.3 Add group validation: only Owner/Admin can invite to Consulting Group
  - [x] 3.4 Update email/notification templates to mention which group user is being invited to
  - [x] 3.5 Update `acceptInvitation()` to add user with specified group
  - [x] 3.6 Add group badge display in InviteUserModal showing target group
  - [x] 3.7 Update InviteUserModal.test.jsx with group selection tests
  - [x] 3.8 Update invitationService.test.js with group invitation tests

- [x] 4.0 Build group management UI components
  - [x] 4.1 Create `src/components/project/GroupBadge.jsx` component (Consulting=Teal, Client=Gold)
  - [x] 4.2 Create tests for GroupBadge in GroupBadge.test.jsx
  - [x] 4.3 Update ProjectMembersPanel.jsx to display GroupBadge next to each member
  - [x] 4.4 Add "Move to Group" dropdown for Owner/Admin to change member groups
  - [x] 4.5 Add confirmation dialog when moving users between groups
  - [x] 4.6 Update activityLogService calls when group is changed (log "member_moved_to_group" action)
  - [x] 4.7 Add group filter in ProjectMembersPanel (show All / Consulting Group / Client Group)
  - [x] 4.8 Update ProjectMembersPanel.test.jsx with group management tests
  - [x] 4.9 Update Home.jsx to show GroupBadge for projects where user is a member
  - [x] 4.10 Create tests for Home.jsx group badge display

- [x] 5.0 Implement document visibility controls
  - [x] 5.1 Create DocumentVisibilityToggle.jsx component with three options (Consulting Only, Client Only, Both Groups)
  - [x] 5.2 Add visual indicators: lock icon for restricted visibility, globe for both groups
  - [x] 5.3 Create tests for DocumentVisibilityToggle in DocumentVisibilityToggle.test.jsx
  - [x] 5.4 Update ProjectDashboard.jsx to show DocumentVisibilityToggle for each document
  - [x] 5.5 Restrict visibility toggle to Owner/Admin in Consulting Group only
  - [x] 5.6 Filter document list based on user's group (hide documents user cannot see)
  - [x] 5.7 Set default visibility when uploading documents based on uploader's group
  - [x] 5.8 Add activity log when document visibility is changed
  - [x] 5.9 Update document upload handlers to include visibility field
  - [x] 5.10 Create tests for document visibility filtering in DocumentList.test.jsx

- [ ] 6.0 Enhance activity logs with group context
  - [ ] 6.1 Update all `logActivity()` calls to include groupContext parameter
  - [ ] 6.2 Add groupContext to activity log display in ActivityLogPanel.jsx
  - [ ] 6.3 Add group filter dropdown in ActivityLogPanel (All Groups / Consulting / Client)
  - [ ] 6.4 Filter activity log entries based on user's group visibility
  - [ ] 6.5 Show group badge in activity log entries where relevant
  - [ ] 6.6 Update activity descriptions to mention group context (e.g., "invited to Consulting Group")
  - [ ] 6.7 Create tests for group-aware activity logging in activityLogService.test.js
  - [ ] 6.8 Update ActivityLogPanel.test.jsx with group filtering tests

- [ ] 7.0 Build notification system with user preferences
  - [ ] 7.1 Create `src/services/notificationService.js` with Firestore operations
  - [ ] 7.2 Implement `createNotification(userId, type, message, link)` function
  - [ ] 7.3 Implement `getUserNotifications(userId, unreadOnly)` function with pagination
  - [ ] 7.4 Implement `markNotificationAsRead(notificationId)` function
  - [ ] 7.5 Implement `getUserNotificationPreferences(userId)` function
  - [ ] 7.6 Implement `updateNotificationPreferences(userId, preferences)` function (email-only, in-app-only, both, none)
  - [ ] 7.7 Create comprehensive tests in notificationService.test.js
  - [ ] 7.8 Create NotificationPreferences.jsx component with preference toggles
  - [ ] 7.9 Add notification triggers for: invitations, role changes, group changes, @mentions (future)
  - [ ] 7.10 Create tests for NotificationPreferences in NotificationPreferences.test.jsx
  - [ ] 7.11 Add notification center UI (bell icon with unread count badge)
  - [ ] 7.12 Integrate notification preferences into user settings page

- [ ] 8.0 Comprehensive testing and validation
  - [ ] 8.1 Test group-based document visibility (Consulting member cannot see Client Only docs)
  - [ ] 8.2 Test group-based invitation flow (invite to Consulting vs Client group)
  - [ ] 8.3 Test moving members between groups and verify permission changes
  - [ ] 8.4 Test activity log group filtering and visibility
  - [ ] 8.5 Test notification preferences (email vs in-app)
  - [ ] 8.6 Verify Firestore security rules enforce group-based access
  - [ ] 8.7 Test edge case: Owner can see all documents regardless of group visibility
  - [ ] 8.8 Test default visibility settings when uploading documents
  - [ ] 8.9 Verify all tests pass (target: 100% pass rate)
  - [ ] 8.10 Run build and verify no errors
  - [ ] 8.11 Run ESLint and fix any issues
  - [ ] 8.12 Update CHANGELOG.md with Phase 1B changes

---

**Phase 1B Breakdown:**
- 8 parent tasks
- 72 sub-tasks total
- Builds directly on Phase 1A foundation
- Adds dual-group architecture with document visibility controls

**Next Step:** Follow `process-task-list.md` workflow - create feature branch, implement one sub-task at a time, mark completed, commit after each parent task completion.
