# Task List: Core Authentication Foundation

**Based on PRD:** `0002-prd-core-authentication.md`
**Feature:** Core Authentication Foundation
**Status:** 📋 In Progress

---

## Relevant Files

### New Files to Create
- `src/contexts/AuthContext.jsx` - Authentication context provider and hooks
- `src/contexts/AuthContext.test.jsx` - Unit tests for auth context
- `src/components/auth/SignupPage.jsx` - Signup page component
- `src/components/auth/SignupPage.test.jsx` - Unit tests for signup page
- `src/components/auth/LoginPage.jsx` - Login page component
- `src/components/auth/LoginPage.test.jsx` - Unit tests for login page
- `src/components/auth/ProtectedRoute.jsx` - Route protection wrapper component
- `src/components/auth/ProtectedRoute.test.jsx` - Unit tests for protected route
- `src/components/layout/UserProfileDropdown.jsx` - User profile dropdown menu
- `src/components/layout/UserProfileDropdown.test.jsx` - Unit tests for profile dropdown
- `src/services/userService.js` - User database operations (Firestore)
- `src/services/userService.test.js` - Unit tests for user service
- `src/services/projectService.js` - Project database operations (Firestore)
- `src/services/projectService.test.js` - Unit tests for project service
- `src/utils/localStorage.js` - LocalStorage helper utilities
- `src/utils/localStorage.test.js` - Unit tests for localStorage utilities

### Files to Modify
- `src/config/firebase.js` - Add Firebase Auth initialization
- `src/App.jsx` - Integrate AuthContext provider and update state management
- `src/components/layout/Header.jsx` - Add user profile dropdown
- `src/components/pages/Home.jsx` - Add login/signup buttons for unauthenticated users
- `src/main.jsx` - Wrap app with AuthContext provider
- `package.json` - May need to add Firebase Auth package (if not already included)
- `.env.example` - Add Firebase Auth environment variables

### Notes

- Unit tests should be placed alongside the code files they are testing
- Use `npm test` to run all tests with Vitest
- Firebase SDK v12.4.0 is already installed and includes Auth module

---

## Tasks

- [x] 1.0 Set up Firebase Authentication and configure auth infrastructure
  - [x] 1.1 Update `src/config/firebase.js` to import and initialize Firebase Auth (getAuth)
  - [x] 1.2 Update `.env.example` with Firebase Auth environment variable placeholders (already complete)
  - [x] 1.3 Verify Firebase project has Authentication enabled in Firebase Console (manual step, documented in firebase.js comments)
  - [x] 1.4 Configure Google OAuth provider in Firebase Console (manual step, documented in firebase.js comments)
  - [x] 1.5 Add auth initialization test in `src/config/firebase.test.js`

- [ ] 2.0 Create authentication context and React hooks for auth state management
  - [ ] 2.1 Create `src/contexts/AuthContext.jsx` with AuthProvider component
  - [ ] 2.2 Implement `useAuth()` hook to access auth context
  - [ ] 2.3 Implement `useRequireAuth()` hook that redirects to login if not authenticated
  - [ ] 2.4 Add Firebase `onAuthStateChanged` observer in AuthProvider to track auth state
  - [ ] 2.5 Implement `signup(email, password)` function in context
  - [ ] 2.6 Implement `login(email, password)` function in context
  - [ ] 2.7 Implement `loginWithGoogle()` function in context using signInWithPopup
  - [ ] 2.8 Implement `logout()` function in context
  - [ ] 2.9 Implement `updateProfile(displayName, avatarURL)` function in context
  - [ ] 2.10 Create comprehensive tests in `src/contexts/AuthContext.test.jsx`

- [ ] 3.0 Build signup and login pages with email/password and Google OAuth
  - [ ] 3.1 Create `src/components/auth/SignupPage.jsx` with email/password form
  - [ ] 3.2 Add "Sign up with Google" button to SignupPage
  - [ ] 3.3 Implement form validation (email format, password strength) in SignupPage
  - [ ] 3.4 Add loading states and error message display in SignupPage
  - [ ] 3.5 Style SignupPage with lonch branding (teal/gold, gradient background, logo)
  - [ ] 3.6 Add link to LoginPage from SignupPage ("Already have an account? Log in")
  - [ ] 3.7 Create `src/components/auth/LoginPage.jsx` with email/password form
  - [ ] 3.8 Add "Sign in with Google" button to LoginPage
  - [ ] 3.9 Add "Forgot password?" placeholder link to LoginPage
  - [ ] 3.10 Add loading states and error message display in LoginPage
  - [ ] 3.11 Style LoginPage with lonch branding
  - [ ] 3.12 Add link to SignupPage from LoginPage ("Don't have an account? Sign up")
  - [ ] 3.13 Create tests for SignupPage in `src/components/auth/SignupPage.test.jsx`
  - [ ] 3.14 Create tests for LoginPage in `src/components/auth/LoginPage.test.jsx`

- [ ] 4.0 Implement protected routes and update navigation/header with user profile
  - [ ] 4.1 Create `src/components/auth/ProtectedRoute.jsx` wrapper component
  - [ ] 4.2 Implement redirect logic to LoginPage when user is not authenticated
  - [ ] 4.3 Preserve intended destination URL for post-login redirect
  - [ ] 4.4 Update `App.jsx` to wrap wizard and project dashboard views with ProtectedRoute
  - [ ] 4.5 Update `App.jsx` to add signup/login views
  - [ ] 4.6 Create `src/components/layout/UserProfileDropdown.jsx` component
  - [ ] 4.7 Add user avatar, name display, and dropdown menu (Profile, Logout) to UserProfileDropdown
  - [ ] 4.8 Update `src/components/layout/Header.jsx` to show UserProfileDropdown when authenticated
  - [ ] 4.9 Update `src/components/pages/Home.jsx` to show "Login" and "Sign Up" buttons when not authenticated
  - [ ] 4.10 Create tests for ProtectedRoute in `src/components/auth/ProtectedRoute.test.jsx`
  - [ ] 4.11 Create tests for UserProfileDropdown in `src/components/layout/UserProfileDropdown.test.jsx`

- [ ] 5.0 Create user database schema and implement localStorage project migration
  - [ ] 5.1 Create `src/services/userService.js` with Firestore user operations
  - [ ] 5.2 Implement `createUser(uid, email, displayName, authProvider)` function
  - [ ] 5.3 Implement `getUser(uid)` function
  - [ ] 5.4 Implement `updateUser(uid, updates)` function
  - [ ] 5.5 Create `src/services/projectService.js` with Firestore project operations
  - [ ] 5.6 Implement `createProject(userId, projectData)` function
  - [ ] 5.7 Implement `getUserProjects(userId)` function
  - [ ] 5.8 Implement `updateProject(projectId, updates)` function
  - [ ] 5.9 Implement `deleteProject(projectId)` function
  - [ ] 5.10 Create `src/utils/localStorage.js` with helper functions
  - [ ] 5.11 Implement `getLocalStorageProjects()` function
  - [ ] 5.12 Implement `clearLocalStorageProjects()` function
  - [ ] 5.13 Implement migration logic in AuthContext after successful signup/login
  - [ ] 5.14 Detect localStorage projects, migrate to Firestore, and clear localStorage
  - [ ] 5.15 Display migration success message to user ("N projects imported from this device")
  - [ ] 5.16 Update `App.jsx` to fetch projects from Firestore instead of local state
  - [ ] 5.17 Create tests for userService in `src/services/userService.test.js`
  - [ ] 5.18 Create tests for projectService in `src/services/projectService.test.js`
  - [ ] 5.19 Create tests for localStorage utils in `src/utils/localStorage.test.js`

- [ ] 6.0 Add comprehensive testing for authentication flows
  - [ ] 6.1 Write integration test for signup flow (email/password)
  - [ ] 6.2 Write integration test for signup flow (Google OAuth) - mock Firebase
  - [ ] 6.3 Write integration test for login flow (email/password)
  - [ ] 6.4 Write integration test for login flow (Google OAuth) - mock Firebase
  - [ ] 6.5 Write integration test for logout flow
  - [ ] 6.6 Write integration test for protected route redirect when not authenticated
  - [ ] 6.7 Write integration test for localStorage project migration after signup
  - [ ] 6.8 Write integration test for localStorage project migration after login
  - [ ] 6.9 Test error handling (invalid credentials, network errors, duplicate email)
  - [ ] 6.10 Run full test suite and ensure all tests pass
  - [ ] 6.11 Run ESLint and fix any linting errors
  - [ ] 6.12 Run production build and verify no errors

---

## Notes

- Firebase is already configured for Storage (`src/config/firebase.js`) - will extend for Auth
- Current app uses simple view-based navigation in `App.jsx` - will need to add route protection logic
- Projects currently stored in React state only (line 9 of `App.jsx`) - will migrate to Firestore with userId
- Existing Header component is basic - will need enhancement for user profile dropdown
- Test framework (Vitest) and patterns are already established from Feature 0001
- Firebase SDK v12.4.0 already includes Auth module, no additional package needed

---

**Phase 2 Complete:** Sub-tasks generated for all parent tasks.

**Next Step:** Follow `process-task-list.md` workflow - implement one sub-task at a time, mark completed, commit after each parent task completion.
