# Firebase Email Integration Setup Guide

This guide covers the manual steps required to set up email integration using Firebase Extensions.

## Prerequisites

- Firebase project created and configured (see main README)
- Firebase CLI installed (`npm install -g firebase-tools`)
- Access to Firebase Console with project owner permissions

## Step 1: Install Firebase Extension "Trigger Email from Firestore"

### Via Firebase Console (Recommended)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Extensions** in the left sidebar
4. Click **Install Extension**
5. Search for "Trigger Email from Firestore" (official Firebase extension)
6. Click **Install** and follow the prompts

### Via Firebase CLI (Alternative)

```bash
firebase ext:install firebase/firestore-send-email --project=your-project-id
```

## Step 2: Configure SMTP Settings

During installation, you'll be prompted to configure:

### Required Configuration

- **SMTP Connection URI**: Your email service provider's SMTP connection string
  - Format: `smtps://username:password@smtp.example.com:465`
  - Example providers:
    - **SendGrid**: `smtps://apikey:YOUR_SENDGRID_API_KEY@smtp.sendgrid.net:465`
    - **Mailgun**: `smtps://postmaster@yourdomain.com:API_KEY@smtp.mailgun.org:465`
    - **Gmail** (for testing only): `smtps://your-email@gmail.com:app-password@smtp.gmail.com:465`

- **Email documents collection**: `mail` (default)

- **Default FROM address**: `no-reply@lonch.app` (or your domain)

- **Default REPLY-TO address**: (optional, leave blank)

### SMTP Provider Setup

#### Option 1: SendGrid (Recommended for Production)

1. Sign up at [SendGrid](https://sendgrid.com/)
2. Create an API key: Settings → API Keys → Create API Key
3. Verify your sender domain: Settings → Sender Authentication
4. Use SMTP URI: `smtps://apikey:YOUR_API_KEY@smtp.sendgrid.net:465`

#### Option 2: Mailgun

1. Sign up at [Mailgun](https://www.mailgun.com/)
2. Add and verify your domain
3. Get SMTP credentials from: Sending → Domain Settings → SMTP credentials
4. Use SMTP URI format provided in their dashboard

#### Option 3: Gmail (Development/Testing Only)

1. Enable 2-factor authentication on your Google account
2. Generate an app password: Google Account → Security → App passwords
3. Use SMTP URI: `smtps://your-email@gmail.com:app-password@smtp.gmail.com:465`

**Note:** Gmail has strict sending limits and is not recommended for production.

## Step 3: Verify Extension Installation

### Check Extension Status

1. Go to Firebase Console → Extensions
2. Verify "Trigger Email from Firestore" shows status: **Active**
3. Note the collection name (should be `mail`)

### Test Extension Manually

You can test the extension by manually adding a document to the `mail` collection:

1. Go to Firestore Database in Firebase Console
2. Create a new document in the `mail` collection:

```javascript
{
  to: "your-test-email@example.com",
  message: {
    subject: "Test Email from Firebase",
    text: "This is a test email sent via Firebase Extensions.",
    html: "<p>This is a <strong>test email</strong> sent via Firebase Extensions.</p>"
  }
}
```

3. Wait 10-30 seconds
4. Check your email inbox (including spam folder)
5. The extension will add a `delivery` field to the document once processed

### Troubleshooting

If emails aren't sending:

- Check Extension logs: Firebase Console → Extensions → Trigger Email → View in Logger
- Verify SMTP credentials are correct
- Check sender domain is verified (for SendGrid/Mailgun)
- Ensure Firestore security rules allow writes to `mail` collection
- Check email provider's sending limits and quotas

## Step 4: Update Environment Variables

Add the following to your `.env` file (see `.env.example` for reference):

```bash
# Email Configuration
VITE_SENDER_EMAIL=no-reply@lonch.app
VITE_APP_URL=http://localhost:5173  # Change to your production URL in production
```

For production, update `VITE_APP_URL` to your actual domain:

```bash
VITE_APP_URL=https://lonch.app
```

## Step 5: Deploy Firestore Security Rules

The security rules for the `mail` and `emailTemplates` collections are already included in `firestore.rules`.

Deploy them to Firebase:

```bash
firebase deploy --only firestore:rules
```

Verify rules are deployed:
- Firebase Console → Firestore Database → Rules tab

## Email Template System

The application stores email templates in the `emailTemplates` Firestore collection for easy editing without code deployments.

### Template Structure

```javascript
{
  id: "invitation",
  name: "Project Invitation",
  subject: "You've been invited to collaborate on {{projectName}}",
  html: "<!DOCTYPE html>...",  // HTML version
  text: "...",                   // Plain text version
  variables: ["inviterName", "projectName", "role", "group", "acceptUrl", "expiresAt"]
}
```

Templates are automatically created when you first run the application. See `src/services/emailService.js` for template management.

## Testing Email Integration

### During Development

Use the test email function:

```bash
npm run test-email
```

This will send a test email using the invitation template.

### Automated Tests

Run the full test suite to verify email queueing:

```bash
npm test
```

Tests verify that emails are queued to the `mail` collection correctly but do not actually send emails.

## Production Checklist

Before deploying to production:

- [ ] SMTP provider configured with verified domain
- [ ] `VITE_SENDER_EMAIL` set to verified sender address
- [ ] `VITE_APP_URL` set to production domain
- [ ] Firestore security rules deployed
- [ ] Test email sent and received successfully
- [ ] Email templates reviewed and approved
- [ ] Sender domain SPF/DKIM records configured (for deliverability)
- [ ] Monitor Extension logs for any delivery issues

## Monitoring and Maintenance

### Monitor Email Delivery

- Check Extension logs regularly: Firebase Console → Extensions → View in Logger
- Monitor Firestore `mail` collection for failed deliveries
- Set up alerts for repeated delivery failures

### Email Deliverability

To improve deliverability:

1. Configure SPF record for your domain
2. Configure DKIM signing (usually handled by email provider)
3. Monitor sender reputation
4. Implement proper unsubscribe handling (in notification preferences)
5. Keep bounce rates low (<5%)

## Support and Resources

- [Firebase Extensions Documentation](https://firebase.google.com/products/extensions)
- [Trigger Email Extension](https://extensions.dev/extensions/firebase/firestore-send-email)
- [SendGrid Documentation](https://docs.sendgrid.com/)
- [Mailgun Documentation](https://documentation.mailgun.com/)

## Cost Considerations

- **Firebase Extension**: Free (included in Spark/Blaze plans)
- **SendGrid**: Free tier includes 100 emails/day
- **Mailgun**: Free tier includes 5,000 emails/month (first 3 months)
- **Firestore operations**: Minimal cost for writing to `mail` collection

For production workloads, review your email provider's pricing and choose a plan that fits your sending volume.
