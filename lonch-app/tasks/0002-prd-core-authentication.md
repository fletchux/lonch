# PRD: Core Authentication Foundation

**Feature ID:** 0002
**Feature Name:** Core Authentication Foundation
**Status:** 📝 Planning
**Created:** 2025-10-16

---

## Introduction/Overview

The Core Authentication Foundation feature adds user authentication to lonch, enabling consultants and their clients to securely create accounts, log in, and access their personalized project data. This feature is the foundation for future collaboration capabilities, ensuring that sensitive project and client information is protected and associated with specific users.

**Problem Statement:** Currently, lonch stores all project data in browser localStorage, which means data is device-specific, not portable, cannot be shared, and has no access control. Users need a secure way to create accounts, log in from any device, and have their project data persisted in a cloud database.

**Goal:** Implement a secure, user-friendly authentication system that allows users to sign up, log in (via email/password or Google OAuth), and seamlessly migrate existing localStorage projects to their new user account.

---

## Goals

1. Enable users to create accounts with email/password or Google OAuth
2. Provide secure login and session management
3. Protect project data with user-specific access control
4. Migrate existing localStorage projects to authenticated user accounts
5. Implement protected routes that require authentication
6. Create a foundational user profile system
7. Follow lonch branding and design standards
8. Ensure a smooth, intuitive authentication experience

---

## User Stories

### As a new consultant user:
- I want to sign up with my email and password so that I can create an account quickly
- I want to sign up with my Google account so that I don't have to remember another password
- I want my existing localStorage projects automatically migrated to my new account so that I don't lose any work
- I want to see a welcome message after signup that explains what happens next

### As a returning user:
- I want to log in with my email/password or Google account so that I can access my projects from any device
- I want my session to persist so that I don't have to log in every time I visit
- I want to log out securely when I'm done working
- I want to see a clear error message if my credentials are incorrect

### As a client invited by a consultant:
- I want to sign up using the same methods (email/password or Google) so that I can access shared projects
- I want a simple, professional signup experience that reflects the lonch brand

### As any authenticated user:
- I want to access my basic profile information (name, email, avatar)
- I want my project data to be private and secure
- I want all wizard and dashboard pages to require authentication
- I want to be redirected to login if I try to access protected pages while logged out

---

## Functional Requirements

### Authentication Backend

1. **User Account Creation**
   - The system must allow users to create accounts with email and password
   - The system must validate email format and enforce minimum password requirements (8+ characters, at least one number, one special character)
   - The system must check for duplicate email addresses and prevent multiple accounts with the same email
   - The system must store user credentials securely (hashed passwords using bcrypt or equivalent)

2. **Google OAuth Integration**
   - The system must allow users to sign up and log in using Google OAuth 2.0
   - The system must create a user record on first-time Google login
   - The system must link Google accounts to existing email accounts if emails match (with user confirmation)

3. **Login & Session Management**
   - The system must authenticate users via email/password credentials
   - The system must authenticate users via Google OAuth
   - The system must create secure session tokens (JWT or equivalent) upon successful login
   - The system must persist sessions across browser sessions (refresh tokens or long-lived tokens)
   - The system must validate session tokens on all protected API requests
   - The system must provide a logout endpoint that invalidates session tokens

4. **User Profile**
   - The system must store basic user profile data: userID, email, displayName, avatarURL, authProvider (email or google), createdAt, lastLoginAt
   - The system must auto-populate displayName from Google profile if using OAuth
   - The system must allow users to update their displayName and avatarURL
   - The system must display user profile information in the app header/navigation

### Authentication Frontend

5. **Signup Page**
   - The system must provide a signup page with email and password fields
   - The system must display a "Sign up with Google" button
   - The system must show inline validation errors for email and password fields
   - The system must follow lonch branding (teal/gold colors, logo, tagline)
   - The system must display loading indicators during signup submission
   - The system must redirect to the home page or wizard after successful signup

6. **Login Page**
   - The system must provide a login page with email and password fields
   - The system must display a "Sign in with Google" button
   - The system must show error messages for invalid credentials
   - The system must include a "Forgot password?" link (even if not functional yet)
   - The system must follow lonch branding
   - The system must redirect to the previous page or home after successful login

7. **Protected Routes**
   - The system must protect all wizard routes (require authentication)
   - The system must protect all dashboard routes (require authentication)
   - The system must redirect unauthenticated users to the login page
   - The system must preserve the intended destination URL and redirect after login

8. **Navigation & Profile UI**
   - The system must display user avatar and name in the app header when logged in
   - The system must show a dropdown menu with "Profile" and "Logout" options
   - The system must hide authenticated UI elements when user is logged out
   - The system must display a "Login" or "Sign Up" button on the home page for unauthenticated users

### Data Migration

9. **LocalStorage Project Migration**
   - The system must detect existing projects in localStorage when a user signs up or logs in for the first time
   - The system must automatically migrate all localStorage projects to the user's account in the database
   - The system must preserve all project data during migration (name, client, budget, timeline, deliverables, documents, etc.)
   - The system must clear localStorage projects after successful migration
   - The system must notify the user how many projects were migrated (e.g., "3 projects imported from this device")
   - The system must handle the case where no localStorage projects exist (skip migration, no error)

### Database & API

10. **User Database Schema**
    - The system must store users in a database with fields: id, email, passwordHash (nullable for OAuth users), displayName, avatarURL, authProvider, createdAt, lastLoginAt
    - The system must establish a one-to-many relationship between users and projects (user owns multiple projects)
    - The system must add a `userId` field to the projects table/collection

11. **API Endpoints**
    - POST `/api/auth/signup` - Create new user account
    - POST `/api/auth/login` - Authenticate user
    - POST `/api/auth/logout` - Invalidate session
    - GET `/api/auth/me` - Get current user profile
    - PUT `/api/auth/me` - Update user profile
    - GET `/api/auth/google` - Initiate Google OAuth flow
    - GET `/api/auth/google/callback` - Handle Google OAuth callback
    - POST `/api/projects/migrate` - Migrate localStorage projects to user account

---

## Non-Goals (Out of Scope)

This feature will **not** include:

1. Password reset/recovery functionality (future PRD)
2. Two-factor authentication (2FA) (future PRD)
3. Project sharing or collaboration features (covered in PRD #0003)
4. Team member invitations (covered in PRD #0003)
5. Project-level permissions (owner/collaborator/viewer) (covered in PRD #0003)
6. Microsoft OAuth or other OAuth providers (can be added later if needed)
7. Email verification on signup (optional future enhancement)
8. Account deletion or data export (future compliance feature)
9. Admin user management interface (future feature)

---

## Design Considerations

### UI/UX Requirements

1. **Branding Consistency**
   - Use lonch brand colors: Teal `#2D9B9B` (primary), Gold `#DBA507` (accent)
   - Display lonch logo on signup/login pages
   - Use existing typography and spacing patterns from the app

2. **Page Layouts**
   - Centered login/signup forms with max-width constraint
   - Gradient background: `from-blue-50 to-indigo-100` (consistent with home page)
   - Clean, minimal form design with clear labels and placeholders
   - OAuth buttons styled distinctly from primary actions (outlined style)

3. **User Feedback**
   - Loading spinners during async operations (signup, login, migration)
   - Success toast notifications for successful actions
   - Error messages displayed inline near relevant form fields
   - Migration success message: "Welcome! We imported [N] projects from this device."

4. **Navigation Flow**
   - Unauthenticated users see: Home → Login/Signup → (authenticated) → Wizard/Dashboard
   - Authenticated users see: Home → Wizard/Dashboard directly
   - Profile dropdown in header (top-right) for logged-in users
   - Logout returns user to home page

### Responsive Design

- Forms must be mobile-friendly (stack fields vertically on small screens)
- OAuth buttons must be touch-friendly (min height 44px)
- Profile dropdown must work on mobile (consider hamburger menu)

---

## Technical Considerations

### Authentication Provider/Service

**Recommended:** Firebase Authentication or Supabase Auth
- Both support email/password and Google OAuth out of the box
- Built-in session management and JWT handling
- Easy integration with React
- Firebase already used in existing codebase for storage (see `src/services/fileStorage.js`)

**Alternative:** Custom backend with Passport.js (Node/Express) or auth library
- More control but significantly more implementation work
- Would require building backend API, database schema, and session management

**Decision:** Use Firebase Authentication (or confirm if another service is preferred)

### Database Schema (Firestore)

```
users (collection)
  └─ {userId} (document)
      ├─ email: string
      ├─ passwordHash: string? (null for OAuth users)
      ├─ displayName: string
      ├─ avatarURL: string?
      ├─ authProvider: "email" | "google"
      ├─ createdAt: timestamp
      └─ lastLoginAt: timestamp

projects (collection)
  └─ {projectId} (document)
      ├─ userId: string (owner)
      ├─ name: string
      ├─ client: object
      ├─ budget: object
      ├─ timeline: object
      ├─ deliverables: array
      ├─ documents: array
      └─ createdAt: timestamp
```

### Frontend State Management

- Use React Context API for authentication state (AuthContext)
- Store current user object and authentication status in context
- Provide helper hooks: `useAuth()`, `useRequireAuth()` (redirect if not logged in)
- Persist auth state with Firebase's `onAuthStateChanged` observer

### Security Considerations

- Use HTTPS for all authentication requests (enforced in production)
- Store session tokens in httpOnly cookies (if using custom backend) or rely on Firebase SDK
- Implement CSRF protection for custom backend
- Validate all inputs on both frontend and backend
- Rate-limit authentication endpoints to prevent brute-force attacks

---

## Success Metrics

1. **User Adoption**: 80%+ of new users successfully create an account within first session
2. **Authentication Success Rate**: 95%+ of login attempts succeed (excluding wrong credentials)
3. **Migration Success**: 100% of localStorage projects successfully migrate to user accounts
4. **OAuth Adoption**: Track % of users choosing Google OAuth vs. email/password
5. **Session Persistence**: Users remain logged in across sessions (low re-login rate)
6. **Error Rate**: <1% of authentication requests result in unexpected errors

---

## Open Questions

1. **Authentication Service**: Confirm Firebase Authentication is the preferred solution (or Supabase, Auth0, etc.)
2. **Email Verification**: Should we require email verification on signup? (Deferred to future PRD but good to decide now)
3. **Password Reset**: Should we include password reset in this PRD or defer it? (Currently deferred)
4. **Avatar Upload**: Should users be able to upload custom avatars, or only use OAuth avatars? (Can start with OAuth only, add upload later)
5. **Session Duration**: How long should sessions last? (Recommend 30 days with refresh token)
6. **Migration Edge Cases**: What happens if a user logs in on Device A (migrates projects), then logs in on Device B (which has different localStorage projects)? Should we merge or prompt? (Recommend: merge all, notify user)

---

## Next Steps

1. Confirm authentication service choice (Firebase Auth recommended)
2. Review and approve this PRD
3. Generate task list from this PRD using `generate-tasks.md` process
4. Begin implementation with task-by-task approach
5. Set up Firebase Authentication project and credentials
6. Configure environment variables for auth keys

---

*This PRD is ready for task generation. Once approved, proceed to `generate-tasks.md` to create the implementation task list.*
