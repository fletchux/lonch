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
- [ ] 2.0 Implement document visibility system with group-based filtering
- [ ] 3.0 Enhance invitation system with group assignment
- [ ] 4.0 Build group-aware UI components and update existing components
- [ ] 5.0 Implement notification preferences and in-app notification center
- [ ] 6.0 Create share link system with embedded group and role information

---

**Phase 1:** Parent tasks generated.

**Ready to generate sub-tasks? Respond with 'Go' to proceed.**
