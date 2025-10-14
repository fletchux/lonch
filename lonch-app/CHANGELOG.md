# Changelog

## [Unreleased]

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
