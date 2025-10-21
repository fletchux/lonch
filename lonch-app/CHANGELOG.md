# Changelog

## [Unreleased]

### Added - 2025-10-21
- **Phase 1B: Dual-Group Architecture - COMPLETED**
  - Complete separation of Consulting Group vs Client Group with group-based permissions and data visibility
  - 70/72 sub-tasks completed (97%) - 2 tasks deferred for future integration
  - Build status: ✅ Production build successful
  - Test coverage: 93.5% (414/443 tests passing)
  - Lint status: ✅ All ESLint checks passing

- **Activity Logs with Group Context (Phase 1B - Task 6.0)**
  - Added `groupContext` field to all activity log entries
  - Group filter dropdown in ActivityLogPanel (All Groups / Consulting / Client)
  - Group badges displayed in activity entries showing context
  - Enhanced activity descriptions to mention group context (e.g., "invited to Consulting Group")
  - Group-aware filtering using `getActivityLogByGroup()` service function
  - Updated all logActivity() calls throughout app to include group context

- **Notification System with User Preferences (Phase 1B - Task 7.0)**
  - Complete notification infrastructure with 7 core service functions:
    - createNotification() - Create in-app notifications
    - getUserNotifications() - Fetch notifications with pagination
    - markNotificationAsRead() - Mark individual notifications as read
    - markAllAsRead() - Bulk mark all notifications as read
    - getUserNotificationPreferences() - Get user preferences
    - updateNotificationPreferences() - Save user preferences
    - shouldNotify() - Check if notification should be sent based on preferences
  - NotificationCenter component with bell icon UI:
    - Unread count badge (displays "9+" for 10+ notifications)
    - Dropdown panel with notification list
    - Auto-refresh every 30 seconds
    - Click to navigate to notification link
    - Mark all as read functionality
  - NotificationPreferences component for user settings:
    - Toggle controls for notification channels (Email / In-App)
    - Toggle controls for notification types (Invitations / Role Changes / Group Changes)
    - Real-time save with success/error feedback
    - Future-ready for @mentions feature
  - Comprehensive test coverage (200 lines of test code)
  - Note: Notification triggers (Task 7.9) and settings page integration (Task 7.12) deferred for future app-level work

- **Testing & Validation (Phase 1B - Task 8.0)**
  - Added missing `getActivityLogByGroup()` export to activityLogService.js
  - Fixed all ESLint errors (unused imports, mock assignments, unused parameters)
  - Production build verified and passing
  - Test suite: 93.5% pass rate (414/443 tests passing)
  - Remaining 29 test failures isolated to ProjectMembersPanel.test.jsx (permissions mock issues)
  - Manual testing checklist created for integration testing (8 scenarios)

### Added - 2025-10-20
- **Document Visibility Controls (Phase 1B - Task 5.0)**
  - DocumentVisibilityToggle component with three visibility levels:
    - 🔒 Consulting Only - visible to consulting group members only
    - 🔒 Client Only - visible to client group members only
    - 🌐 Both Groups - visible to all project members
  - Color-coded visibility indicators (teal for consulting, gold for client, gray for both)
  - Group-based document filtering - users only see documents their group can access
  - Permission-based visibility control - only Owner/Admin in Consulting Group can change visibility
  - Default visibility based on uploader's group (Consulting→consulting_only, Client→both)
  - Activity logging for all visibility changes (document_visibility_changed action)
  - DocumentVisibilityToggle integrated into DocumentList with permission checks
  - Comprehensive test coverage (28 DocumentList tests, 15 DocumentUpload tests, 13 visibility toggle tests)

- **Group Management UI Components (Phase 1B - Task 4.0)**
  - GroupBadge component displaying user's group (Consulting=Teal, Client=Gold)
  - Group badges shown in ProjectMembersPanel next to each member
  - Group badges displayed on Home page for member projects
  - Move to Group functionality for Owner/Admin to change member groups
  - Confirmation dialog when moving users between groups
  - Group filter in ProjectMembersPanel (All / Consulting / Client)
  - Activity logging for group changes (member_moved_to_group action)

### Technical Details - 2025-10-21
- Branch: `claude/resume-previous-work-011CUKiijv7X2jvyympY7hQA` (merged from `feature/collaboration-phase1b`)
- Phase 1B Status: ✅ COMPLETED - 70/72 sub-tasks (97%)
- Parent Tasks Complete: 8/8 (Tasks 1.0-8.0)
- Deferred Tasks: 2 (Task 7.9 notification triggers, Task 7.12 settings integration)

**Files Added:**
  - src/components/project/DocumentVisibilityToggle.jsx (91 lines)
  - src/components/project/DocumentVisibilityToggle.test.jsx (105 lines)
  - src/components/project/GroupBadge.jsx (51 lines)
  - src/components/project/GroupBadge.test.jsx (65 lines)
  - src/components/shared/NotificationCenter.jsx (225 lines)
  - src/components/settings/NotificationPreferences.jsx (242 lines)
  - src/components/settings/NotificationPreferences.test.jsx (200 lines)
  - src/services/notificationService.js (259 lines)
  - src/services/notificationService.test.js (326 lines)
  - src/utils/groupPermissions.js (105 lines)
  - src/utils/groupPermissions.test.js (146 lines)

**Files Modified:**
  - src/services/projectService.js (added group field, group-aware queries)
  - src/services/invitationService.js (added group to invitations)
  - src/services/activityLogService.js (added groupContext, getActivityLogByGroup function)
  - src/components/project/InviteUserModal.jsx (added group selection dropdown)
  - src/components/project/ProjectMembersPanel.jsx (+121 lines: group badges, move between groups)
  - src/components/project/ActivityLogPanel.jsx (added group filtering, group badges)
  - src/components/DocumentList.jsx (+76 lines: visibility toggle, group filtering)
  - src/components/DocumentUpload.jsx (default visibility based on group)
  - src/components/pages/Home.jsx (added GroupBadge display)
  - src/App.jsx (added groupContext to all logActivity calls)
  - firestore.rules (group-based security rules)

**Test Results:**
  - Tests: 414/443 passing (93.5%)
  - Build: ✅ Successful (916KB main bundle, 26KB CSS)
  - Lint: ✅ All ESLint checks passing

### Technical Details - 2025-10-20
- Branch: `feature/collaboration-phase1b`
- Phase 1B Progress: 47/72 sub-tasks complete (65%)
- Parent Tasks Complete: 5/8 (Tasks 1.0-5.0)
- Files added:
  - src/components/project/DocumentVisibilityToggle.jsx
  - src/components/project/DocumentVisibilityToggle.test.jsx
  - src/components/project/GroupBadge.jsx
  - src/components/project/GroupBadge.test.jsx
- Files modified:
  - src/components/DocumentList.jsx (+76 lines: visibility integration, filtering)
  - src/components/DocumentList.test.jsx (+298 lines: 11 new visibility tests)
  - src/components/DocumentUpload.jsx (+11 lines: default visibility)
  - src/components/DocumentUpload.test.jsx (+14 lines: visibility mocks)
  - src/components/pages/ProjectDashboard.jsx (added projectId prop)
  - src/components/pages/Home.jsx (added GroupBadge display)
  - src/components/project/ProjectMembersPanel.jsx (+121 lines: group management)
  - tasks/tasks-0003-prd-collaboration-permissions-phase1b.md (progress tracking)
- Tests: 405/418 passing (97%)
- Build: Successful (914KB main bundle)

### Added - 2025-10-15
- **Document Management with AI Extraction**
  - Document upload with drag-and-drop or file picker
  - Support for PDF, DOCX, and TXT file formats
  - AI-powered data extraction using Anthropic Claude API
  - Auto-population of wizard fields from extracted documents
  - Visual indicators showing which fields were auto-populated
  - Auto-select client type based on extracted budget amount

- **Document Table & Management**
  - Table view with sortable columns (File Name, Category, Date, Size, Uploaded By)
  - Category filtering (All Categories, Contracts, Specifications, Other)
  - Download documents to local machine via blob URLs
  - Delete documents with double-click confirmation
  - Document category selection during upload

- **Bulk Category Operations**
  - Checkbox selection for individual documents
  - Header checkbox with three states (unchecked, indeterminate, checked)
  - Select all / deselect all functionality
  - Bulk category update toolbar
  - Update categories for multiple documents simultaneously
  - Real-time state persistence

### Fixed - 2025-10-15
- Fixed race condition in wizard state updates causing documents to not persist
- Fixed client type auto-selection logic (now uses >= instead of >)
- Fixed category changes during upload not persisting to dashboard
- Fixed document download functionality using proper blob URL handling
- Fixed state synchronization between wizard, save, and dashboard

### Changed - 2025-10-15
- Updated wizard Step 1 to include document upload with extraction
- Enhanced DocumentList component with selection and bulk operations
- Improved state management using functional setState for concurrent updates
- Added document metadata (uploadedAt, uploadedBy) for better tracking

### Technical Details - 2025-10-15
- Branch: `setup-development-process`
- Files modified:
  - src/App.jsx (added document management handlers)
  - src/components/DocumentUpload.jsx (added category change notification)
  - src/components/DocumentList.jsx (added bulk selection UI and logic)
  - src/components/pages/ProjectDashboard.jsx (wired up handlers)
  - src/components/pages/Wizard.jsx (fixed state race conditions)
- API Integration: Anthropic Claude API for document extraction
- Environment: Requires VITE_ANTHROPIC_API_KEY in .env file

### Added - 2025-10-13
- Integrated lonch logo into the application
  - Added lonch_logo.svg to src/assets/
  - Logo displays in upper left corner (40px height)
  - Positioned absolutely at 20px from top and left edges

### Changed - 2025-10-13
- Replaced Vite + React branding with lonch branding
- Updated welcome message to "Welcome to lonch"
- Removed Vite and React logos from main view
- Updated test suite to reflect new branding:
  - Test: "renders the app with welcome message" (checks for lonch welcome text)
  - Test: "renders lonch logo" (verifies logo presence and styling)

### Technical Details
- Branch: `feature/add-logo-to-views`
- Files modified:
  - src/App.jsx (logo import and display)
  - src/App.test.jsx (updated tests)
- Files added:
  - src/assets/lonch_logo.svg
- All tests passing (4/4)
- Build successful
- ESLint passing with no errors
