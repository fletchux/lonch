# Changelog

## [Unreleased]

### Completed - 2025-10-31 - Quick-Start Session System (83% Token Reduction)

**Optimized Session Startup for Fast, Efficient Context Loading**

Added a minimal session startup system that reduces token usage from 30K to 5K tokens (83% reduction) while preserving full context availability.

#### New Quick-Start System
- **session-config.json:** Fast-loading project configuration (~300 tokens)
  - Commands, paths, git rules, quality gates in JSON format
  - Project root and dev server configuration
  - Replaces reading 11+ documentation files at startup
- **quick-start Command:** Minimal startup workflow
  - Reads only 2 files: `session-config.json` + `SESSION_STATE.md`
  - Supports project detection and multi-project navigation
  - Lazy-loads full context only when needed
- **Global Projects Registry:** `~/.claude-projects.json` for multi-project support

#### Token Analysis & Optimization
- **Original startup cost:** ~30K tokens (15% of 200K budget)
  - Reading documentation files: 18K-20K tokens
  - System reminders & tool overhead: 5K-7K tokens
  - Response output & updates: 3K-5K tokens
- **New quick-start cost:** ~5K tokens (2.5% of budget)
- **Approach:** Combination of lazy loading + condensed JSON config

#### Usage Patterns
- **Fast daily startup:** `quick start` or `start session` (5K tokens)
- **Full context loading:** `start lonch session` (30K tokens, when needed)
- **Documentation preserved:** All existing docs remain for reference

#### Benefits
- 83% reduction in session startup tokens
- Faster initialization for daily development
- Preserves full documentation for onboarding/reference
- Supports multi-project workflows
- Analysis documented in Notion for future optimization

**Commit:** ad9b498 - feat: Add quick-start session system

---

### Completed - 2025-10-30 - Claude Code Session Management System

**Implemented Complete Session Management for Seamless Development**

Built a comprehensive system for managing Claude Code development sessions with automatic context loading and state persistence.

#### Session Management Features
- **start-session Command:** Auto-detects project, loads full context
  - Reads project preferences, git state, active tasks, last session notes
  - Checks development environment status
  - Presents interactive menu with workflow options
- **lonchit Enhancement:** Now writes SESSION_STATE.md at end of session
  - Captures what was worked on, changes made, testing done
  - Documents blockers, notes, and next steps for continuity
- **State Persistence:** SESSION_STATE.md survives across sessions and token limits
- **Reusable Pattern:** Works for any project with same structure

#### Documentation Created
- `.claude/commands/start-session.md` - Session initialization workflow
- `.claude/SESSION_MANAGEMENT.md` - Complete guide with examples
- `.claude/SESSION_STATE_TEMPLATE.md` - Template for session state
- `.claude/NEW_DEVELOPER_SETUP.md` - Onboarding documentation
- `.claude/ONBOARDING_PROMPT.txt` - Ready-to-use onboarding prompt

#### Benefits
- Zero mental overhead to start/resume sessions
- Perfect continuity between sessions
- Works gracefully when sessions end abruptly
- Instant context on where you left off

#### Testing
- Demonstrated mock session workflows
- All 648 tests passing
- Linter clean, build successful

**Commit:** 1f26910 - feat: Add session management system for Claude Code

---

### Completed - 2025-10-29 - Email Integration & Test Suite Fixes

**Email Integration Fully Working + All Tests Passing**

Completed PRD #0005 (Email Integration) and resolved all test suite issues, bringing the project to 100% feature completion.

#### Email Integration (PRD #0005)
- **Firebase Extension Configured:** "Trigger Email from Firestore" installed in nam5 region
- **SendGrid Integration:** SMTP configured with API key stored as Firebase Secret
- **Authentication Method:** Username/Password auth with port 587 (not 465)
- **Sender Verified:** fletch@omahaux.com verified in SendGrid
- **Test Email Success:** Delivered with beautiful HTML branding (teal gradient header)
- **Templates Working:** HTML and plain text versions rendering correctly

**Key Technical Solution:**
- Store SendGrid API key as Firebase Secret (not in SMTP URI)
- Use `smtp://apikey@smtp.sendgrid.net:587` with password in separate secret field
- Port 587 with STARTTLS (not port 465 with SSL)

#### Test Suite Fixes
- **GoogleAuthProvider Mock:** Fixed to include `setCustomParameters` method
- **Unused Imports:** Removed from DocumentList and DocumentList.test
- **React Hooks Violation:** Fixed useEffect placement in UserProfileDropdown
- **Result:** 648/648 tests passing (100%)

#### Firestore Indexes Deployed
- **All 3 indexes enabled:** inviteLinks (2) + activityLogs (1)
- **Status:** Verified in Firebase Console with green "Enabled" status
- **Share Links Ready:** No more "query requires an index" errors

#### Code Quality
- ✅ 648 tests passing
- ✅ ESLint clean (0 errors)
- ✅ Production build successful
- ✅ All outstanding items complete

#### Files Modified
- `src/contexts/AuthContext.test.jsx` - Fixed GoogleAuthProvider mock
- `src/components/documents/DocumentList.jsx` - Removed unused imports
- `src/components/documents/DocumentList.test.jsx` - Removed unused imports
- `src/components/layout/UserProfileDropdown.jsx` - Fixed hooks order
- `firebase.json` - Created for CLI deployment
- `OUTSTANDING_ITEMS.md` - Marked email integration and indexes complete
- `specs/tasks-0005-prd-email-integration.md` - Marked all tasks complete
- `.env` - Updated sender email to fletch@omahaux.com

#### Commits
- `0c9caec` - test: Fix failing tests and ESLint errors
- `82b943c` - docs: Mark email integration as complete
- `01e388b` - feat: Add firebase.json and mark Firestore indexes as deployed

**Impact:** All 6 major features (PRDs #0001-#0005) are now 100% complete and production-ready.

---

## [Unreleased]

### Added - 2025-10-24 - Bug Fixing Workflow System
**TDD-Focused Bug Resolution Workflow**

Created a comprehensive bug fixing workflow that streamlines issue resolution from discovery to deployment with Test-Driven Development approach.

#### New Files Created
- **`.claude/fixit-workflow.md`** - Complete bug fixing workflow with conversational questions
- **`bugs/README.md`** - Bug tracking system documentation
- **`bugs/BUG-REPORT-TEMPLATE.md`** - Structured template for bug reports

#### Workflow Features
- **Conversational Information Gathering:** 6 flexible questions to understand bugs
  - What's happening?
  - Where is it happening?
  - What should happen instead?
  - Reproduction steps?
  - Technical details? (optional)
  - Urgency/severity?
- **Automated Setup:**
  - Creates bug report: `bugs/YYYY-MM-DD-short-description.md`
  - Creates GitHub issue with bug details
  - Auto-creates branch: `bug/XX-short-description`
  - Marks issue as "in-progress"
- **TDD Process:**
  - Write failing test that reproduces bug
  - Implement fix
  - Verify test passes
  - Run full test suite (no regressions)
  - Manual verification
- **Integration:** Works with existing workflows (`/lonchit` for completion)

#### Session Startup Enhancement
- Added "Fix a bug" option to session startup menu (option 3)
- Menu now has 6 options instead of 5
- Updated `.claude/session-startup.md` with fixit workflow integration

#### Documentation Updates
- Updated `.claude/lonch-preferences.md` with bug fixing workflow reference
- Added `bugs/` directory to project structure documentation
- Severity level guidelines (Critical/High/Medium/Low)

#### Benefits
- Streamlined bug reporting and fixing
- Consistent documentation for all issues
- TDD approach prevents regressions
- Links bug reports to GitHub issues
- Clear branch naming for bug fixes
- Integrated with existing quality workflows

---

### Added - 2025-10-24 - Workflow Automation Reorganization
**Claude Code Workflow System Enhancement**

Reorganized and enhanced the development workflow automation system for improved efficiency and developer experience.

#### Workflow Changes
- **Directory Structure:** Renamed `/tasks/` → `/specs/` for PRDs and task lists (better semantic clarity)
- **Session Startup:** Created intelligent session initialization with menu-driven workflow selection (`.claude/session-startup.md`)
- **Slash Commands:**
  - Moved `resume` from `.github/commands/` → `.claude/commands/resume.md` (now a slash command)
  - Created `/lonchit` slash command for wrap-up and ship workflow
  - Created comprehensive command reference (`.claude/commands/README.md`)
- **File Organization:** Moved 11 PRD and task files from `docs/prds/` → `specs/`

#### Files Modified
- Updated all workflow files to reference `/specs/` instead of `/tasks/`:
  - `.claude/workflows/create-prd.md`
  - `.claude/workflows/generate-tasks.md`
  - `.claude/commands/shazam.md`
  - `.claude/commands/generate-tasks.md`
  - `.github/WORKFLOWS.md`
- Enhanced `.claude/lonch-preferences.md` with session startup info and updated project structure

#### New Features
- **Session Menu:** Say "start lonch feature" to get intelligent workflow menu with 5 options
- **Quick Commands:** `/shazam`, `/resume`, `/lonchit` now all available as slash commands
- **Better Documentation:** Comprehensive README for all slash commands with usage examples

#### Benefits
- Faster session startup with context-aware menus
- Consistent workflow execution via slash commands
- Improved discoverability of available workflows
- Clearer separation between specs (PRDs/tasks) and code

---

### Added - 2025-10-21 - Phase 1B Complete ✅
**Collaboration & Permissions - Phase 1B (Dual-Group Architecture)**

All 8 parent tasks complete (72/72 sub-tasks)

#### Task 1.0: Dual-Group Database Schema
- Extended projectMembers schema with `group` field ('consulting' | 'client')
- Added `group` field to invitation schema
- Added `groupContext` field to activity logs
- Added `visibility` field to documents ('consulting_only' | 'client_only' | 'both')
- Migration helper for backwards compatibility (existing members → consulting group)
- Firestore security rules updated for group-based document visibility
- Comprehensive test coverage (40+ tests for group-aware functionality)

#### Task 2.0: Group-Based Permission System
- Created groupPermissions.js utility with GROUP constants and helper functions
- Implemented canViewDocument(), canSetDocumentVisibility(), canMoveUserBetweenGroups()
- Implemented getDefaultDocumentVisibility() based on user's group
- Updated useProjectPermissions hook with group-aware checks
- Added getUserGroupInProject() to projectService.js
- 27 comprehensive tests in groupPermissions.test.js

#### Task 3.0: Group Assignment in Invitations
- Updated createInvitation() to accept and store group parameter
- Added group selection dropdown in InviteUserModal (Consulting Group / Client Group)
- Group validation: only Owner/Admin can invite to Consulting Group
- Email/notification templates include target group information
- acceptInvitation() adds user with specified group
- 8 new tests for group invitation functionality

#### Task 4.0: Group Management UI Components
- GroupBadge component (Consulting=Teal, Client=Gold)
- Group badges in ProjectMembersPanel and Home page
- Move to Group functionality with confirmation dialogs
- Group filter (All / Consulting Group / Client Group)
- Activity logging for group changes (member_moved_to_group action)
- 22 ProjectMembersPanel tests, 15 Home tests with group functionality

#### Task 5.0: Document Visibility Controls
- DocumentVisibilityToggle component with three visibility levels:
  - 🔒 Consulting Only - visible to consulting group members only
  - 🔒 Client Only - visible to client group members only
  - 🌐 Both Groups - visible to all project members
- Color-coded visibility indicators (teal/gold/gray)
- Group-based document filtering (users only see documents their group can access)
- Permission-based visibility control (Owner/Admin in Consulting Group only)
- Default visibility based on uploader's group
- Activity logging for visibility changes
- 28 DocumentList tests, 13 visibility toggle tests

#### Task 6.0: Enhanced Activity Logs with Group Context
- Updated all logActivity() calls to include groupContext parameter
- GroupBadge display in activity log entries
- Group filter dropdown (All Groups / Consulting / Client)
- Client-side group filtering
- Group-aware activity descriptions (e.g., "invited to Consulting Group")
- 16 activityLogService tests, 28 ActivityLogPanel tests

#### Task 7.0: Notification System with User Preferences
- **notificationService.js** (24 tests)
  - createNotification(), getUserNotifications(), markNotificationAsRead()
  - getUserNotificationPreferences(), updateNotificationPreferences()
  - shouldNotifyUser() for preference checking
- **NotificationPreferences.jsx** (22 tests)
  - Toggle switches for in-app and email notifications
  - Individual toggles for notification types (invitations, role changes, group changes, mentions)
  - Auto-disable when all channels off
  - Success/error messaging
- **NotificationBell.jsx** (17 tests)
  - Bell icon with unread count badge (99+ for high counts)
  - Dropdown panel with recent notifications
  - Click to mark as read and navigate
  - Auto-polling every 30 seconds
- **Settings.jsx**
  - User settings page with integrated NotificationPreferences
  - Navigation from all authenticated pages
- **Notification Triggers**
  - Invitation accepted notifications
  - Role change notifications
  - Group change notifications
  - All triggers respect user preferences

#### Task 8.0: Comprehensive Testing & Validation
- ✅ All 515 tests passing (100% pass rate)
- ✅ Production build successful (934KB bundle)
- ✅ ESLint clean (0 errors, 0 warnings)
- ✅ No regressions from Phase 1A
- ✅ Group-based document visibility working correctly
- ✅ Group-based invitation flow working correctly
- ✅ Activity log group filtering working correctly
- ✅ Notification preferences working correctly

### Technical Details - 2025-10-21
- **Branch**: `feature/collaboration-phase1b`
- **Status**: Phase 1B Complete - All 8 parent tasks, 72/72 sub-tasks ✅
- **Test Coverage**: 515 tests passing (63 new notification tests)
- **Build**: Successful (934KB main bundle, +1KB from Phase 1A)
- **Code Quality**: ESLint clean, no linter warnings

**Files Added** (10 new files):
- src/components/project/DocumentVisibilityToggle.jsx + test
- src/components/project/GroupBadge.jsx + test
- src/components/settings/NotificationPreferences.jsx + test
- src/components/notifications/NotificationBell.jsx + test
- src/components/pages/Settings.jsx
- src/services/notificationService.js + test
- src/utils/groupPermissions.js + test

**Files Modified** (20+ files):
- Database schema updates: projectService.js, invitationService.js, activityLogService.js
- UI components: DocumentList.jsx, ProjectMembersPanel.jsx, ActivityLogPanel.jsx, InviteUserModal.jsx
- Pages: Home.jsx, ProjectDashboard.jsx, Wizard.jsx, App.jsx
- Core services: Header.jsx, UserProfileDropdown.jsx
- Permissions: permissions.js, useProjectPermissions.js
- Security: firestore.rules

**Commits**: 20+ commits with detailed messages
- feat: extend database schema for dual-group architecture
- feat: implement group-based permission system
- feat: update invitation system with group assignment
- feat: build group management UI components
- feat: implement document visibility controls
- feat: enhance activity logs with group context
- feat: implement notification system foundation
- feat: add notification triggers
- feat: add notification center UI
- feat: integrate notification preferences into settings
- fix: resolve all ESLint errors
- docs: mark Phase 1B complete in task list

### Breaking Changes
None - Phase 1B is fully backwards compatible with Phase 1A

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
