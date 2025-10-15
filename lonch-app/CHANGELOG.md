# Changelog

## [Unreleased]

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
