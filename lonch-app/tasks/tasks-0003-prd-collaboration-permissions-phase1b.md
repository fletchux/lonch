# Task List: Collaboration & Permissions - Phase 1B (Dual-Group Architecture)

**Based on PRD:** `0003-prd-collaboration-permissions.md`
**Feature:** Collaboration & Permissions - Phase 1B (Full Dual-Group System)
**Status:** 📋 Not Started

**Phase 1B Scope:** Add Consulting Group vs Client Group distinction with group-based data visibility, enhanced activity logs with group context, notification preferences, and share links with group/role embedded.

**Builds on:** Phase 1A (Basic role-based permissions) - COMPLETED

---

## Relevant Files

### Files to Create
- `src/components/shared/GroupBadge.jsx` - Visual badge component for group indicators (Consulting/Client)
- `src/components/shared/GroupBadge.test.jsx` - Unit tests for group badge
- `src/components/project/DocumentVisibilityControl.jsx` - Component to set document visibility (Consulting Only/Client Only/Both)
- `src/components/project/DocumentVisibilityControl.test.jsx` - Unit tests for visibility control
- `src/components/user/NotificationPreferences.jsx` - User settings for notification preferences
- `src/components/user/NotificationPreferences.test.jsx` - Unit tests for notification preferences
- `src/services/notificationService.js` - Notification management (in-app + email)
- `src/services/notificationService.test.js` - Unit tests for notification service
- `src/services/shareLinkService.js` - Generate and validate share links with embedded group/role
- `src/services/shareLinkService.test.js` - Unit tests for share link service
- `src/hooks/useGroupVisibility.js` - Custom hook to filter data by user's group
- `src/hooks/useGroupVisibility.test.js` - Unit tests for group visibility hook

### Files to Modify
- `src/services/projectService.js` - Add group field to projectMembers, visibility filtering
- `src/services/projectService.test.js` - Add tests for group-based queries
- `src/services/invitationService.js` - Add group assignment to invitations
- `src/services/invitationService.test.js` - Add tests for group-based invitations
- `src/services/activityLogService.js` - Add group context to activity logs
- `src/services/activityLogService.test.js` - Add tests for group-filtered logs
- `src/utils/permissions.js` - Add group-aware permission helpers
- `src/utils/permissions.test.js` - Add tests for group permissions
- `src/components/project/ProjectMembersPanel.jsx` - Display group badges, filter by group
- `src/components/project/InviteUserModal.jsx` - Add group selection dropdown
- `src/components/project/ActivityLogPanel.jsx` - Show group context in activities
- `src/components/pages/ProjectDashboard.jsx` - Update to filter content by user's group
- `src/components/shared/RoleBadge.jsx` - May need updates to work alongside GroupBadge
- `firestore.rules` - Update security rules to enforce group-based visibility

### Notes
- Phase 1A must be complete before starting Phase 1B
- Firebase Firestore and Auth already integrated
- Follow existing service and component patterns from Phase 1A
- Use `npm test` to run all tests with Vitest

---

## Tasks

- [ ] 1.0 Add group field to database schema and update core services
  - [ ] 1.1 Update Firestore `projectMembers` schema to include `group` field ('consulting' | 'client')
  - [ ] 1.2 Create group constants in `src/utils/permissions.js` (GROUP_CONSULTING, GROUP_CLIENT)
  - [ ] 1.3 Update `src/services/projectService.js` - modify `addProjectMember()` to accept group parameter
  - [ ] 1.4 Update `src/services/projectService.js` - add `getProjectMembersByGroup(projectId, group)` function
  - [ ] 1.5 Update `src/services/projectService.js` - add `updateMemberGroup(projectId, userId, newGroup)` function
  - [ ] 1.6 Update `src/services/activityLogService.js` - add `groupContext` field to activity log schema
  - [ ] 1.7 Update `src/services/activityLogService.js` - modify `logActivity()` to accept optional groupContext parameter
  - [ ] 1.8 Update `src/services/activityLogService.js` - add `getActivityLogByGroup(projectId, group)` filter function
  - [ ] 1.9 Update Firestore security rules to enforce group-based read access on documents
  - [ ] 1.10 Add migration logic to assign existing Phase 1A members to 'consulting' group by default
  - [ ] 1.11 Create tests in `src/services/projectService.test.js` for all group-related functions
  - [ ] 1.12 Create tests in `src/services/activityLogService.test.js` for group context logging

- [ ] 2.0 Implement document visibility system with group-based filtering
  - [ ] 2.1 Update project document schema to add `visibility` field ('consulting_only' | 'client_only' | 'both')
  - [ ] 2.2 Create `src/utils/documentVisibility.js` with visibility constants and helper functions
  - [ ] 2.3 Implement `canUserViewDocument(userGroup, documentVisibility)` helper function
  - [ ] 2.4 Implement `getDefaultVisibility(userGroup)` helper (consulting → 'consulting_only', client → 'both')
  - [ ] 2.5 Update `src/services/projectService.js` - add `filterDocumentsByVisibility(documents, userGroup)` function
  - [ ] 2.6 Create `src/components/project/DocumentVisibilityControl.jsx` - dropdown/radio component for visibility selection
  - [ ] 2.7 Add visibility icons/badges in DocumentVisibilityControl (lock icon for restricted, globe for both)
  - [ ] 2.8 Create tests for DocumentVisibilityControl in `src/components/project/DocumentVisibilityControl.test.jsx`
  - [ ] 2.9 Create tests in `src/utils/documentVisibility.test.js` for all helper functions
  - [ ] 2.10 Update document upload flows to set visibility based on user's group (default values)
  - [ ] 2.11 Update document display lists to filter by user's group visibility

- [ ] 3.0 Enhance invitation system with group assignment
  - [ ] 3.1 Update `invitations` Firestore schema to include `group` field ('consulting' | 'client')
  - [ ] 3.2 Update `src/services/invitationService.js` - modify `createInvitation()` to accept group parameter (required)
  - [ ] 3.3 Update `src/services/invitationService.js` - modify `acceptInvitation()` to assign user to specified group
  - [ ] 3.4 Add validation in `createInvitation()` to ensure group is either 'consulting' or 'client'
  - [ ] 3.5 Update invitation email template to mention which group user is being invited to
  - [ ] 3.6 Create tests in `src/services/invitationService.test.js` for group-based invitation flows
  - [ ] 3.7 Add test cases for invalid group values (should reject)
  - [ ] 3.8 Add test case for user accepting invitation and being assigned to correct group

- [ ] 4.0 Build group-aware UI components and update existing components
  - [ ] 4.1 Create `src/components/shared/GroupBadge.jsx` - display group with color coding (Consulting=teal, Client=gold)
  - [ ] 4.2 Add icon support to GroupBadge (briefcase for consulting, user for client)
  - [ ] 4.3 Create tests for GroupBadge in `src/components/shared/GroupBadge.test.jsx`
  - [ ] 4.4 Create `src/hooks/useGroupVisibility.js` - custom hook to get user's group and filter data
  - [ ] 4.5 Implement `useGroupVisibility()` to fetch current user's group for a project
  - [ ] 4.6 Implement filtering functions in useGroupVisibility for documents and activity logs
  - [ ] 4.7 Create tests for useGroupVisibility in `src/hooks/useGroupVisibility.test.js`
  - [ ] 4.8 Update `src/components/project/ProjectMembersPanel.jsx` - add GroupBadge next to each member's RoleBadge
  - [ ] 4.9 Update ProjectMembersPanel - add group filter dropdown (All/Consulting/Client)
  - [ ] 4.10 Update ProjectMembersPanel - add "Change Group" option for Owner/Admin (with confirmation)
  - [ ] 4.11 Update `src/components/project/InviteUserModal.jsx` - add group selection dropdown (required field)
  - [ ] 4.12 Add group selection validation in InviteUserModal (cannot submit without selecting group)
  - [ ] 4.13 Update InviteUserModal to show group color preview next to selection
  - [ ] 4.14 Update `src/components/project/ActivityLogPanel.jsx` - display group context badge on each activity
  - [ ] 4.15 Update ActivityLogPanel - add group filter (show only activities from user's group or visible to them)
  - [ ] 4.16 Update `src/components/pages/ProjectDashboard.jsx` - use useGroupVisibility to filter visible documents
  - [ ] 4.17 Update ProjectDashboard - add group indicator showing current user's group in the project
  - [ ] 4.18 Update all modified component tests to include group-related scenarios

- [ ] 5.0 Implement notification preferences and in-app notification center
  - [ ] 5.1 Create `userNotifications` Firestore collection with schema (userId, notificationId, type, message, link, read, createdAt)
  - [ ] 5.2 Create `notificationPreferences` subcollection under users (email, inApp, preferences object)
  - [ ] 5.3 Create `src/services/notificationService.js` with Firestore operations
  - [ ] 5.4 Implement `createNotification(userId, type, message, link)` function
  - [ ] 5.5 Implement `getUserNotifications(userId, limit)` function with pagination
  - [ ] 5.6 Implement `markNotificationAsRead(notificationId)` function
  - [ ] 5.7 Implement `markAllAsRead(userId)` function
  - [ ] 5.8 Implement `getNotificationPreferences(userId)` function
  - [ ] 5.9 Implement `updateNotificationPreferences(userId, preferences)` function
  - [ ] 5.10 Create `src/components/user/NotificationPreferences.jsx` - settings page for notification preferences
  - [ ] 5.11 Add preference toggles: email notifications, in-app notifications, notification types (invites, mentions, updates)
  - [ ] 5.12 Create tests for NotificationPreferences in `src/components/user/NotificationPreferences.test.jsx`
  - [ ] 5.13 Create `src/components/shared/NotificationCenter.jsx` - bell icon with badge showing unread count
  - [ ] 5.14 Implement notification dropdown panel with list of recent notifications
  - [ ] 5.15 Add "Mark all as read" button in NotificationCenter
  - [ ] 5.16 Add real-time listener for new notifications (Firestore onSnapshot)
  - [ ] 5.17 Integrate NotificationCenter into App.jsx header/navbar
  - [ ] 5.18 Add notification triggers: send notification on invitation, role change, group change, @mention
  - [ ] 5.19 Add email notification integration placeholder (Firebase Extensions or SendGrid)
  - [ ] 5.20 Create comprehensive tests in `src/services/notificationService.test.js`

- [ ] 6.0 Create share link system with embedded group and role information
  - [ ] 6.1 Create `shareLinks` Firestore collection with schema (linkId, projectId, group, role, token, createdBy, expiresAt, maxUses, usedCount)
  - [ ] 6.2 Create `src/services/shareLinkService.js` with Firestore operations
  - [ ] 6.3 Implement `createShareLink(projectId, group, role, expiresInDays, maxUses)` function - generate unique token
  - [ ] 6.4 Implement `getShareLink(token)` function to retrieve link details
  - [ ] 6.5 Implement `validateShareLink(token)` function - check expiration and usage limits
  - [ ] 6.6 Implement `acceptShareLink(token, userId)` function - add user to project with specified group/role
  - [ ] 6.7 Implement `revokeShareLink(linkId)` function - mark link as revoked
  - [ ] 6.8 Implement `getProjectShareLinks(projectId)` function - list all active share links
  - [ ] 6.9 Create share link acceptance page/route to handle `/invite/:token` URLs
  - [ ] 6.10 Add share link UI to InviteUserModal - toggle between email invite and share link
  - [ ] 6.11 Display generated share link in modal with copy-to-clipboard button
  - [ ] 6.12 Add share link management section in ProjectMembersPanel (Owner/Admin only)
  - [ ] 6.13 Show list of active share links with group, role, expiration, usage count
  - [ ] 6.14 Add "Revoke" button for each share link
  - [ ] 6.15 Create comprehensive tests in `src/services/shareLinkService.test.js`
  - [ ] 6.16 Create tests for share link acceptance flow

---

**Phase 2 Complete:** Sub-tasks generated for all parent tasks.

**Total Sub-Tasks:** 73

**Next Step:** Follow `process-task-list.md` workflow - create feature branch, implement one sub-task at a time, mark completed, commit after each parent task completion.
