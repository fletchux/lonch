# PRD #0005: Email Integration for Invitations

**Feature Name:** Email Integration for Invitations
**PRD Number:** 0005
**Created:** 2025-10-21
**Status:** Draft
**Extends:** PRD #0003 (Collaboration & Permissions)

---

## 1. Introduction/Overview

This feature adds production-ready email delivery to the lonch invitation system. Currently, invitations exist in the database but no actual emails are sent to recipients. This PRD focuses on implementing email delivery specifically for project invitations (both email invitations and shareable link notifications), using Firebase Extensions for seamless integration.

**Problem Statement:** Users can create invitations in lonch, but invited users never receive email notifications. This creates a broken experience where:
- Invited users don't know they've been invited unless they manually check the app
- The invitation system relies entirely on out-of-band communication (text, Slack, etc.)
- Users miss time-sensitive invitations that expire in 7 days
- The app appears unprofessional without automated email notifications

**Goal:** Implement production-ready email delivery for project invitations using Firebase Extensions (Trigger Email), with professional HTML templates, plain text fallbacks, and respect for user notification preferences. Keep other notifications (role changes, group changes, etc.) as in-app only.

---

## 2. Goals

1. **Email Delivery:** Send automated emails when users are invited to projects via email or shareable links
2. **Professional Presentation:** Use branded HTML email templates with lonch logo and color scheme
3. **Reliable Delivery:** Implement both HTML and plain text versions for maximum email client compatibility
4. **User Control:** Respect user preferences (don't send emails if user has opted out)
5. **Content Management:** Allow easy editing of email content without code deployments
6. **Testing & Validation:** Provide clear testing process for email delivery
7. **Incremental Approach:** Start with invitations only, create foundation for future email types

---

## 3. User Stories

### As an invited user:
- I want to receive an email when someone invites me to a project so that I know about the invitation immediately
- I want the email to include a direct link to accept the invitation so that I can join with one click
- I want the email to show who invited me and what role/group I'll have so that I can make an informed decision
- I want the email to look professional and branded so that I trust it's legitimate

### As a project owner/admin (inviter):
- I want invited users to automatically receive emails so that I don't have to separately notify them via Slack/text
- I want to trust that emails are being delivered reliably so that I know my invitations are reaching people
- I want email content to be clear and actionable so that recipients understand what to do

### As a user who doesn't want emails:
- I want to opt out of invitation emails (while keeping in-app notifications) so that I'm not spammed
- I want my preferences to be respected across all email types

### As a developer/admin:
- I want to test email delivery without sending real emails to users so that I can verify functionality
- I want to update email content easily without code changes so that I can iterate on messaging
- I want to see email delivery logs so that I can troubleshoot issues

---

## 4. Functional Requirements

### 4.1 Email Service Integration

1. The system MUST integrate Firebase Extensions "Trigger Email from Firestore" extension
2. The system MUST configure SMTP settings for no-reply@lonch.app sender address
3. The system MUST create a Firestore collection `mail` for queuing outbound emails (Firebase Extension requirement)
4. The system MUST support both HTML and plain text email formats
5. The system MUST handle email delivery failures gracefully (retry logic handled by Firebase Extension)

### 4.2 Email Templates

6. The system MUST create an HTML email template for project invitations
7. The system MUST create a plain text email template for project invitations (fallback)
8. HTML template MUST include:
   - lonch logo
   - Brand colors (teal #2D9B9B, gold #DBA507)
   - Inviter's name
   - Project name
   - Role and group being assigned
   - "Accept Invitation" call-to-action button (teal background)
   - Link expiration notice (7 days)
   - Footer with unsubscribe link
9. Plain text template MUST include same information in readable format
10. The system MUST store email template content in Firestore collection `emailTemplates` for easy editing
11. The system MUST support template variables: `{{inviterName}}`, `{{projectName}}`, `{{role}}`, `{{group}}`, `{{acceptUrl}}`, `{{expiresAt}}`

### 4.3 Invitation Email Triggers

12. The system MUST send email when a new email invitation is created (via `invitationService.createInvitation()`)
13. The system MUST NOT send email if the invited user has email notifications disabled
14. The system MUST check user notification preferences before queuing email
15. The system MUST include direct link to accept invitation: `/invite/accept/{token}`
16. The system MUST include invitation expiration date in human-readable format (e.g., "October 28, 2025")
17. The system MUST send email from `no-reply@lonch.app` with display name "lonch"

### 4.4 Shareable Link Notification (Optional Welcome Email)

18. The system MAY send a welcome email after user accepts a shareable link (out of scope for Phase 1, but foundation should support)
19. If implemented, email should thank user for joining and provide project access link

### 4.5 User Preferences Integration

20. The system MUST respect existing notification preferences from Phase 1B
21. If user has `emailNotifications: false` in preferences, the system MUST NOT send invitation emails
22. If user has `notificationTypes.invitations: false`, the system MUST NOT send invitation emails
23. The system MUST provide default behavior: send emails to new users who haven't set preferences yet
24. The system MUST allow users to unsubscribe via link in email footer (update preferences to `emailNotifications: false`)

### 4.6 Email Content Management

25. The system MUST store email templates in Firestore collection `emailTemplates` with structure:
    - `templateId` (e.g., "invitation")
    - `subject` (editable string with variable support)
    - `htmlBody` (editable HTML with variable support)
    - `textBody` (editable plain text with variable support)
    - `lastUpdated` (timestamp)
    - `updatedBy` (userId)
26. The system MUST provide function `getEmailTemplate(templateId)` that fetches template and replaces variables
27. The system SHOULD provide admin UI to edit email templates (can be deferred to future enhancement)

### 4.7 Email Delivery & Logging

28. The system MUST log email delivery attempts in activity log (action="email_sent", metadata includes recipient, template, delivery status)
29. The system MUST NOT expose email delivery failures to end users (handle silently, log for admins)
30. The system SHOULD provide admin interface to view email delivery logs (can use Firebase Extension dashboard)

### 4.8 Testing & Validation

31. The system MUST provide npm script or function to send test emails: `npm run test-email`
32. Test emails MUST be sent to developer email addresses (not production users)
33. The system MUST support development/staging environment email testing without affecting production
34. The system SHOULD provide admin "Send Test Email" button in production (restricted to admin users)

---

## 5. Non-Goals (Out of Scope)

This feature will **not** include:

1. ❌ Emails for role changes, group changes, or other notification types (in-app only for now)
2. ❌ Digest emails or batch notifications (future enhancement)
3. ❌ Rich HTML email builder UI (templates are code/Firestore based)
4. ❌ Email analytics (open rates, click tracking) - can use Firebase Extension dashboard
5. ❌ Custom sender domains beyond lonch.app (no white-labeling)
6. ❌ Email authentication (SPF, DKIM, DMARC) - handled by SMTP provider
7. ❌ Transactional emails for password reset (covered in separate PRD)
8. ❌ Marketing emails or newsletters
9. ❌ SMS notifications
10. ❌ Advanced email personalization (dynamic content beyond template variables)

---

## 6. Design Considerations

### HTML Email Template Design

**Header:**
- lonch logo (40px height)
- Teal background bar (#2D9B9B)

**Body:**
- White background with centered content (max-width 600px)
- Friendly greeting: "Hi there!"
- Invitation message: "[Inviter Name] has invited you to collaborate on the project **[Project Name]**"
- Role/Group assignment: "You've been invited as [RoleBadge] in [GroupBadge]"
- Call-to-action button: "Accept Invitation" (teal background, white text, rounded corners)
- Secondary info: "This invitation expires on [Date]"

**Footer:**
- Gray background (#F3F4F6)
- "You're receiving this email because [Inviter Name] invited you to lonch."
- "Don't want invitation emails? [Manage notification preferences](#)"
- "© 2025 lonch. All rights reserved."

**Plain Text Template:**
```
Hi there!

[Inviter Name] has invited you to collaborate on the project "[Project Name]".

You've been invited as: [Role] in [Group]

Accept the invitation here:
[Accept URL]

This invitation expires on [Date].

---
You're receiving this email because [Inviter Name] invited you to lonch.
Don't want invitation emails? Manage your notification preferences: [Preferences URL]

© 2025 lonch. All rights reserved.
```

### Branding
- Use lonch color palette: Teal (#2D9B9B), Gold (#DBA507), neutral grays
- Include lonch logo (hosted on lonch.app or CDN)
- Maintain professional, friendly tone
- Keep emails concise (avoid walls of text)

---

## 7. Technical Considerations

### Firebase Extensions Setup

**Extension:** Trigger Email from Firestore
- **Installation:** Firebase Console → Extensions → Install "Trigger Email"
- **SMTP Configuration:**
  - Provider: Recommended SendGrid, Mailgun, or SMTP.com
  - SMTP Host: Provided by email service
  - SMTP Port: 587 (TLS) or 465 (SSL)
  - Username/Password: From email service provider
  - Sender: no-reply@lonch.app

**Firestore Collection:** `mail`
- Extension watches this collection for new documents
- Document structure:
  ```json
  {
    "to": "user@example.com",
    "message": {
      "subject": "You've been invited to lonch",
      "html": "<html>...",
      "text": "Plain text version..."
    }
  }
  ```
- Extension automatically adds `delivery` field with status

### Email Template Storage (Firestore)

**Collection:** `emailTemplates`
```
emailTemplates (collection)
  └─ invitation (document)
      ├─ subject: "You've been invited to {{projectName}}"
      ├─ htmlBody: "<html>...</html>"
      ├─ textBody: "Hi there!..."
      ├─ lastUpdated: timestamp
      └─ updatedBy: userId
```

### Template Variable Replacement

Function: `renderEmailTemplate(templateId, variables)`
```javascript
// Fetch template from Firestore
const template = await getEmailTemplate('invitation');

// Replace variables
const html = template.htmlBody
  .replace(/{{inviterName}}/g, variables.inviterName)
  .replace(/{{projectName}}/g, variables.projectName)
  .replace(/{{role}}/g, variables.role)
  .replace(/{{group}}/g, variables.group)
  .replace(/{{acceptUrl}}/g, variables.acceptUrl)
  .replace(/{{expiresAt}}/g, variables.expiresAt);

const text = template.textBody.replace(/* same */);

return { subject: template.subject, html, text };
```

### Integration Points

**invitationService.js:**
- Update `createInvitation()` to call new `sendInvitationEmail()` function
- Check user preferences before sending

**emailService.js (new):**
- `sendInvitationEmail(invitation, inviterName, projectName)`
- `sendTestEmail(recipientEmail, templateId)`
- `getEmailTemplate(templateId)`
- `renderEmailTemplate(templateId, variables)`

### Environment Variables

**.env:**
```
VITE_SENDER_EMAIL=no-reply@lonch.app
VITE_APP_URL=https://lonch.app
```

### Performance Considerations

- Email queuing is async (Firestore write → Firebase Extension processes in background)
- No blocking on email delivery (UI responds immediately after invitation created)
- Failed email deliveries don't block user workflows
- Firebase Extension handles retry logic automatically

---

## 8. Success Metrics

1. **Delivery Rate:** 95%+ of invitation emails successfully delivered (check Firebase Extension logs)
2. **Acceptance Rate:** 70%+ of emailed invitations are accepted within 7 days
3. **Bounce Rate:** <5% email bounce rate (indicates good email quality)
4. **User Complaints:** <1% users report not receiving invitation emails
5. **Unsubscribe Rate:** <2% of users unsubscribe from invitation emails
6. **Time to Accept:** Average time from email sent to invitation accepted <24 hours
7. **Template Quality:** <5% of users click "Report spam" or similar

---

## 9. Open Questions

1. **SMTP Provider Choice:** Do you have an existing SMTP provider account (SendGrid, Mailgun, etc.) or should we set up a new one?
   - **Recommendation:** SendGrid free tier (100 emails/day) for development, upgrade for production

2. **Domain Verification:** Do you own lonch.app domain and can configure DNS for email authentication (SPF/DKIM)?
   - **Recommendation:** Yes, required for professional email delivery

3. **Email Rate Limits:** What volume of invitation emails do we expect? (helps size SMTP plan)
   - **Recommendation:** Start with SendGrid free tier (100/day), monitor usage

4. **Template Editing UI:** Should we build admin UI to edit email templates in Phase 1, or defer?
   - **Recommendation:** Defer to future enhancement, use Firestore directly for now

5. **Notification Preferences Migration:** Existing users from Phase 1B have preferences. Should we default emailNotifications to true or false?
   - **Recommendation:** Default to true (opt-out model), users can disable if needed

6. **Test Email Access:** Should all authenticated users be able to send test emails, or admin-only?
   - **Recommendation:** Admin-only for production, anyone in development

7. **Email Localization:** Should we support multiple languages for email templates?
   - **Recommendation:** English-only for Phase 1, add i18n in future

---

## 10. Implementation Phases

### Phase 1: Invitation Emails Only (This PRD)
- Set up Firebase Extension (Trigger Email)
- Configure SMTP with no-reply@lonch.app
- Create HTML + plain text invitation email templates
- Store templates in Firestore
- Integrate with existing invitation system
- Respect user notification preferences
- Add testing capabilities
- **Estimated:** 3 parent tasks, ~25-30 sub-tasks

### Future Enhancements (Out of Scope)
- Emails for role changes, group changes, @mentions
- Digest emails (daily/weekly summaries)
- Email template editor UI
- Welcome emails for new signups
- Password reset emails (separate PRD)
- Email analytics dashboard
- Multiple language support

---

## Appendix: Email Template Examples

### Subject Line
```
You've been invited to {{projectName}} on lonch
```

### HTML Template (Simplified)
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invitation to {{projectName}}</title>
</head>
<body style="margin:0; padding:0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <!-- Header -->
  <div style="background-color: #2D9B9B; padding: 20px; text-align: center;">
    <img src="https://lonch.app/logo.png" alt="lonch" style="height: 40px;">
  </div>

  <!-- Body -->
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <p style="font-size: 16px; color: #374151;">Hi there!</p>

    <p style="font-size: 16px; color: #374151;">
      <strong>{{inviterName}}</strong> has invited you to collaborate on the project
      <strong style="color: #2D9B9B;">{{projectName}}</strong>.
    </p>

    <p style="font-size: 14px; color: #6B7280;">
      You've been invited as <strong>{{role}}</strong> in <strong>{{group}}</strong>.
    </p>

    <!-- CTA Button -->
    <div style="text-align: center; margin: 30px 0;">
      <a href="{{acceptUrl}}" style="background-color: #2D9B9B; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">
        Accept Invitation
      </a>
    </div>

    <p style="font-size: 14px; color: #9CA3AF; text-align: center;">
      This invitation expires on {{expiresAt}}
    </p>
  </div>

  <!-- Footer -->
  <div style="background-color: #F3F4F6; padding: 30px 20px; text-align: center;">
    <p style="font-size: 12px; color: #6B7280; margin: 5px 0;">
      You're receiving this email because {{inviterName}} invited you to lonch.
    </p>
    <p style="font-size: 12px; color: #6B7280; margin: 5px 0;">
      <a href="{{preferencesUrl}}" style="color: #2D9B9B;">Manage notification preferences</a>
    </p>
    <p style="font-size: 12px; color: #9CA3AF; margin: 15px 0 0 0;">
      © 2025 lonch. All rights reserved.
    </p>
  </div>
</body>
</html>
```

### Plain Text Template
```
Hi there!

{{inviterName}} has invited you to collaborate on the project "{{projectName}}".

You've been invited as: {{role}} in {{group}}

Accept the invitation here:
{{acceptUrl}}

This invitation expires on {{expiresAt}}.

---
You're receiving this email because {{inviterName}} invited you to lonch.
Don't want invitation emails? Manage your notification preferences: {{preferencesUrl}}

© 2025 lonch. All rights reserved.
```

---

*This PRD is ready for task generation. Once approved, proceed to `generate-tasks.md` to create the implementation task list.*
