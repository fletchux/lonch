# Task List: Email Integration for Invitations

**Based on PRD:** `0005-prd-email-integration.md`
**Feature:** Email Integration for Invitations
**Status:** 📋 Not Started

**Extends:** PRD #0003 Collaboration & Permissions

---

## Current State Assessment

**Existing Architecture:**
- Invitation system exists with placeholder email logic (`invitationService.js` line 66-92)
- Notification preferences system exists from Phase 1B (`notificationService.js`)
- User preferences support `emailNotifications` and `notificationTypes` flags
- Firebase already configured (`src/config/firebase.js`)
- Firestore collections: `invitations`, `userNotificationPreferences`, `notifications`

**Key Insights:**
- Firebase Extensions "Trigger Email" uses `mail` collection to queue outbound emails
- Can reuse existing token and expiration logic from invitationService
- Email templates should be stored in Firestore `emailTemplates` collection for easy editing
- Need to check user preferences before sending emails (respect opt-out)
- Only sending emails for invitations (all other notifications stay in-app only)

---

## Relevant Files

### New Files to Create
- `src/services/emailService.js` - Email template rendering and mail queue operations
- `src/services/emailService.test.js` - Unit tests for email service
- `src/utils/emailTemplates.js` - HTML and plain text email template constants
- `src/utils/emailTemplates.test.js` - Unit tests for template rendering

### Files to Modify
- `src/services/invitationService.js` - Replace placeholder email logic with real emailService calls
- `src/services/invitationService.test.js` - Add tests for email integration
- `firestore.rules` - Add security rules for `mail` and `emailTemplates` collections
- `package.json` - May need to add email-related dependencies

### Notes
- Unit tests should be placed alongside the code files they are testing
- Use `npm test` to run all tests with Vitest
- Firebase Extension "Trigger Email" must be installed in Firebase Console (manual step)
- SMTP configuration required (SendGrid, Mailgun, or similar)
- Email templates stored in Firestore for easy editing without code deployments

---

## Tasks

- [ ] 1.0 Set up Firebase Extensions and email infrastructure
- [ ] 2.0 Create email template system with HTML and plain text versions
- [ ] 3.0 Integrate email sending with invitation flow
- [ ] 4.0 Comprehensive testing and validation

---

**Phase 1 Complete:** High-level tasks generated based on PRD analysis.

**Proceeding with sub-task generation...**

---

## Tasks (Detailed)

- [ ] 1.0 Set up Firebase Extensions and email infrastructure
  - [ ] 1.1 Install Firebase Extension "Trigger Email from Firestore" via Firebase Console (manual step - document in README)
  - [ ] 1.2 Configure SMTP settings in Firebase Extension (provider: SendGrid/Mailgun, sender: no-reply@lonch.app)
  - [ ] 1.3 Verify Firestore `mail` collection is created and Extension is watching it
  - [ ] 1.4 Add environment variables VITE_SENDER_EMAIL and VITE_APP_URL to `.env` and `.env.example`
  - [ ] 1.5 Add Firestore security rules for `mail` collection (write: authenticated users, read: none - Extension handles)
  - [ ] 1.6 Add Firestore security rules for `emailTemplates` collection (read: authenticated, write: admin only)
  - [ ] 1.7 Test Extension by manually adding document to `mail` collection and verifying email delivery

- [ ] 2.0 Create email template system with HTML and plain text versions
  - [ ] 2.1 Create Firestore collection `emailTemplates` with initial template documents
  - [ ] 2.2 Create `src/utils/emailTemplates.js` with template constants for HTML and plain text
  - [ ] 2.3 Design HTML email template for invitations with lonch branding (teal header, logo, CTA button)
  - [ ] 2.4 Create plain text version of invitation email template
  - [ ] 2.5 Implement template variable replacement function `renderTemplate(template, variables)`
  - [ ] 2.6 Support variables: {{inviterName}}, {{projectName}}, {{role}}, {{group}}, {{acceptUrl}}, {{expiresAt}}, {{preferencesUrl}}
  - [ ] 2.7 Create `src/services/emailService.js` with email operations
  - [ ] 2.8 Implement `getEmailTemplate(templateId)` function to fetch template from Firestore
  - [ ] 2.9 Implement `renderEmailTemplate(templateId, variables)` function
  - [ ] 2.10 Create helper function `formatExpirationDate(date)` for human-readable dates
  - [ ] 2.11 Create tests for template rendering in `src/utils/emailTemplates.test.js`
  - [ ] 2.12 Create tests for emailService in `src/services/emailService.test.js`

- [ ] 3.0 Integrate email sending with invitation flow
  - [ ] 3.1 Implement `sendInvitationEmail(invitation, inviterName, projectName)` function in emailService
  - [ ] 3.2 Check user notification preferences before sending (respect emailNotifications: false and notificationTypes.invitations: false)
  - [ ] 3.3 Render email template with invitation variables (inviterName, projectName, role, group, acceptUrl, expiresAt)
  - [ ] 3.4 Queue email to Firestore `mail` collection with structure: {to, message: {subject, html, text}}
  - [ ] 3.5 Handle email queueing failures gracefully (log error, don't fail invitation creation)
  - [ ] 3.6 Update `src/services/invitationService.js` to replace placeholder sendInvitationEmail() with real implementation
  - [ ] 3.7 Add logging for email delivery attempts (use console.log for now, can add to activity log later)
  - [ ] 3.8 Implement `sendTestEmail(recipientEmail, templateId)` function for testing purposes
  - [ ] 3.9 Add npm script `npm run test-email` to send test emails during development
  - [ ] 3.10 Update invitationService.test.js to verify email is queued when invitation is created

- [ ] 4.0 Comprehensive testing and validation
  - [ ] 4.1 Test email template rendering with all variable replacements
  - [ ] 4.2 Test HTML and plain text versions render correctly
  - [ ] 4.3 Test email sending when user has emailNotifications: true
  - [ ] 4.4 Test email NOT sent when user has emailNotifications: false
  - [ ] 4.5 Test email NOT sent when user has notificationTypes.invitations: false
  - [ ] 4.6 Test default behavior (send email) for new users without preferences
  - [ ] 4.7 Test email queueing to `mail` collection (verify document structure)
  - [ ] 4.8 Send test email to real email address and verify delivery
  - [ ] 4.9 Verify email branding (logo, colors, formatting) in Gmail, Outlook, and mobile clients
  - [ ] 4.10 Test unsubscribe link redirects to notification preferences page
  - [ ] 4.11 Run full test suite and ensure all tests pass: `npm test`
  - [ ] 4.12 Run ESLint and fix any linting errors: `npx eslint .`
  - [ ] 4.13 Run production build and verify no errors: `npm run build`

---

**Phase 2 Complete:** Sub-tasks generated for all parent tasks.

**Next Step:** Follow `process-task-list.md` workflow - create feature branch, implement one sub-task at a time, mark completed, commit after each parent task completion.
