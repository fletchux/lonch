# Task List: Shareable Invite Links

**Based on PRD:** `0004-prd-shareable-invite-links.md`
**Feature:** Shareable Invite Links
**Status:** 📋 Not Started

**Extends:** PRD #0003 Collaboration & Permissions (Phase 1A & 1B)

---

## Current State Assessment

**Existing Architecture:**
- Email invitation system exists (`invitationService.js`) with token generation, expiration, and acceptance flow
- ProjectMembersPanel exists with members list and role management
- Group and role badge components exist (GroupBadge, RoleBadge)
- Activity logging exists (`activityLogService.js`)
- Notification system exists (`notificationService.js`)
- Token pattern already established: `inv_{timestamp}_{random}`

**Key Insights:**
- Can reuse much of the invitation infrastructure (token generation, expiration logic, acceptance flow)
- Need separate collection `inviteLinks` (vs `invitations`) to support different use cases
- ProjectMembersPanel already has tabs pattern - can add "Share Links" tab
- Activity logging already supports custom actions - can add link-specific actions

---

## Relevant Files

### New Files to Create
- `src/services/inviteLinkService.js` - Invite link CRUD operations (Firestore)
- `src/services/inviteLinkService.test.js` - Unit tests for invite link service
- `src/components/project/GenerateLinkModal.jsx` - Modal for generating shareable links
- `src/components/project/GenerateLinkModal.test.jsx` - Unit tests for generate link modal
- `src/components/project/ShareLinksTab.jsx` - Tab panel showing all invite links
- `src/components/project/ShareLinksTab.test.jsx` - Unit tests for share links tab
- `src/components/project/AcceptInviteLinkPage.jsx` - Page for accepting invite links
- `src/components/project/AcceptInviteLinkPage.test.jsx` - Unit tests for accept page

### Files to Modify
- `src/components/project/ProjectMembersPanel.jsx` - Add "Share Links" tab
- `src/components/project/ProjectMembersPanel.test.jsx` - Add tests for new tab
- `src/services/activityLogService.js` - Add link-related activity logging
- `src/services/activityLogService.test.js` - Add tests for link activities
- `src/App.jsx` - Add route for `/invite/:token` link acceptance
- `firestore.rules` - Add security rules for `inviteLinks` collection

### Notes
- Unit tests should be placed alongside the code files they are testing
- Use `npm test` to run all tests with Vitest
- Reuse existing patterns from `invitationService.js` for token generation and expiration
- Follow Phase 1B patterns for group/role badges and permissions

---

## Tasks

- [x] 1.0 Create invite link database schema and service layer
  - [x] 1.1 Create Firestore collection structure for `inviteLinks` (token, projectId, role, group, createdBy, createdAt, expiresAt, status, acceptedBy, acceptedAt)
  - [x] 1.2 Create `src/services/inviteLinkService.js` with Firestore operations
  - [x] 1.3 Implement `generateInviteLink(projectId, role, group, createdBy)` function with crypto-secure token generation
  - [x] 1.4 Implement `getInviteLink(token)` function to retrieve link by token
  - [x] 1.5 Implement `getProjectInviteLinks(projectId, userId, userRole)` function with permission filtering
  - [x] 1.6 Implement `acceptInviteLink(token, userId)` function with validation (not expired, not used, not revoked)
  - [x] 1.7 Implement `revokeInviteLink(linkId, revokedBy)` function to mark link as revoked
  - [x] 1.8 Add Firestore security rules for `inviteLinks` collection (read: authenticated, write: project members)
  - [x] 1.9 Create comprehensive tests in `src/services/inviteLinkService.test.js`

- [x] 2.0 Build link generation UI with role and group selection
  - [x] 2.1 Create `src/components/project/GenerateLinkModal.jsx` modal component
  - [x] 2.2 Add role selection dropdown (Owner, Admin, Editor, Viewer) with RoleBadge preview
  - [x] 2.3 Add group selection radio buttons (Consulting Group / Client Group) with GroupBadge preview
  - [x] 2.4 Add preview section showing "Recipients will join as [Role] in [Group]"
  - [x] 2.5 Implement "Generate Link" button handler calling inviteLinkService.generateInviteLink()
  - [x] 2.6 Display generated link in read-only text input after generation
  - [x] 2.7 Add "Copy Link" button with clipboard API integration
  - [x] 2.8 Show link expiration notice "This link expires in 7 days (Oct 28, 2025)"
  - [x] 2.9 Add loading states and error handling for link generation
  - [x] 2.10 Style modal with lonch branding (teal primary, gold accent)
  - [x] 2.11 Create tests for GenerateLinkModal in `src/components/project/GenerateLinkModal.test.jsx`

- [x] 3.0 Implement link acceptance flow and validation
  - [x] 3.1 Add route `/invite/:token` in `src/App.jsx` for link acceptance
  - [x] 3.2 Create `src/components/project/AcceptInviteLinkPage.jsx` page component
  - [x] 3.3 Implement authentication check (redirect to login/signup if not authenticated)
  - [x] 3.4 Fetch link details using inviteLinkService.getInviteLink(token)
  - [x] 3.5 Display project name, role badge, group badge, and creator name
  - [x] 3.6 Validate link status: check if expired, already used, or revoked
  - [x] 3.7 Show clear error messages for invalid link states
  - [x] 3.8 Implement "Accept Invitation" button handler calling inviteLinkService.acceptInviteLink()
  - [x] 3.9 Check if user is already a project member (show friendly message if so)
  - [x] 3.10 Redirect to project dashboard after successful acceptance
  - [x] 3.11 Add "Decline" link that redirects to home page
  - [x] 3.12 Style page with centered card layout and gradient background (consistent with login/signup)
  - [x] 3.13 Create tests for AcceptInviteLinkPage in `src/components/project/AcceptInviteLinkPage.test.jsx`

- [x] 4.0 Add Share Links management tab to ProjectMembersPanel
  - [x] 4.1 Create `src/components/project/ShareLinksTab.jsx` component for link management
  - [x] 4.2 Fetch active invite links using inviteLinkService.getProjectInviteLinks()
  - [x] 4.3 Display links in table format with columns: Role, Group, Created By, Created, Expires, Status, Actions
  - [x] 4.4 Show RoleBadge and GroupBadge for each link
  - [x] 4.5 Display creator avatar and name (fetch from userService)
  - [x] 4.6 Show relative timestamps ("2 days ago") for created and expiration dates
  - [x] 4.7 Add status badges: Active (green), Used (blue), Expired (gray), Revoked (red)
  - [x] 4.8 Implement "Revoke" button for active links (with confirmation dialog)
  - [x] 4.9 Add "Generate New Link" button that opens GenerateLinkModal
  - [x] 4.10 Show empty state: "No invite links yet. Generate one to get started."
  - [x] 4.11 Filter links by user permissions (users see own links, Owner/Admin see all)
  - [x] 4.12 Create tests for ShareLinksTab in `src/components/project/ShareLinksTab.test.jsx`
  - [x] 4.13 Update `src/components/project/ProjectMembersPanel.jsx` to add "Share Links" tab
  - [x] 4.14 Add tab label with count badge "Share Links"
  - [x] 4.15 Update ProjectMembersPanel.test.jsx to include Share Links tab tests (existing tests still pass)

- [x] 5.0 Add activity logging for link actions
  - [x] 5.1 Add activity log when link is created: action="invite_link_created", metadata includes role, group
  - [x] 5.2 Add activity log when link is accepted: action="invite_link_accepted", metadata includes new member email, role, group, creator
  - [x] 5.3 Add activity log when link is revoked: action="invite_link_revoked", metadata includes role, group, revoked by
  - [x] 5.4 Update `src/services/activityLogService.js` to handle link-related actions in getActionDescription()
  - [x] 5.5 Add emoji icons for link actions: created (🔗), accepted (✅), revoked (🚫)
  - [x] 5.6 Update ActivityLogPanel to display link-related activities with group badges
  - [x] 5.7 Create tests in activityLogService.test.js for link activity logging

- [x] 6.0 Comprehensive testing and validation
  - [x] 6.1 Test link generation with all role/group combinations
  - [x] 6.2 Test copy to clipboard functionality
  - [x] 6.3 Test link acceptance with valid, active link
  - [x] 6.4 Test link acceptance with expired link (show error)
  - [x] 6.5 Test link acceptance with used link (show error)
  - [x] 6.6 Test link acceptance with revoked link (show error)
  - [x] 6.7 Test link acceptance when user is already project member
  - [x] 6.8 Test link revocation flow with confirmation dialog
  - [x] 6.9 Test permission filtering in Share Links tab (users see own links, admin sees all)
  - [x] 6.10 Test activity logging for all link actions
  - [x] 6.11 Run full test suite and ensure all tests pass: `npm test`
  - [x] 6.12 Run ESLint and fix any linting errors: `npx eslint .`
  - [x] 6.13 Run production build and verify no errors: `npm run build`

---

**Phase 2 Complete:** Sub-tasks generated for all parent tasks.

**Next Step:** Follow `process-task-list.md` workflow - create feature branch, implement one sub-task at a time, mark completed, commit after each parent task completion.
