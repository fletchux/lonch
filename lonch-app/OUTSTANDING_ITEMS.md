# Outstanding Items & Action Items

**Date:** 2025-10-24

---

## 1. CRITICAL: Deploy Firestore Indexes (Bug #12)

**Status:** Configuration committed, needs manual deployment

**What's Done:**
- ✅ Index definitions added to `firestore.indexes.json`
- ✅ Bug report created: `bugs/2025-10-24-missing-firestore-indexes-invite-links.md`
- ✅ GitHub issue #12 created

**What's Needed:**
Since there's no `firebase.json` file in the project, indexes must be deployed manually via Firebase Console.

**Steps to Deploy:**

1. **Option A: Via Firebase Console (Easiest)**
   - Go to the Firebase Console error link that appeared when you tested Share Links
   - OR go to: https://console.firebase.google.com/project/lonch-cb672/firestore/indexes
   - Click the link from the error message to auto-create the index
   - Wait for index to build (usually 2-5 minutes)
   - Repeat for any other missing indexes

2. **Option B: Via Firebase CLI (If you have firebase.json)**
   ```bash
   firebase deploy --only firestore:indexes
   ```
   - Wait for indexes to build
   - Check status: Firebase Console → Firestore → Indexes

**Verification:**
- Navigate to Share Links tab in the app
- Should load without "query requires an index" error
- Links should be sorted by creation date (newest first)

---

## 2. ✅ COMPLETE: Email Integration

**Status:** ✅ FULLY WORKING! Emails sending successfully via SendGrid

**What's Done:**
- ✅ Email service implemented (`src/services/emailService.js`)
- ✅ Email templates created (stored in Firestore `emailTemplates` collection)
- ✅ All tests passing (648 tests)
- ✅ Security rules configured in `firestore.rules`
- ✅ Test script created: `npm run test-email`
- ✅ Firebase Extension "Trigger Email from Firestore" installed and configured
- ✅ SendGrid SMTP configured with API key stored as Firebase Secret
- ✅ Sender email verified: fletch@omahaux.com
- ✅ Test email delivered successfully on October 29, 2025

**Configuration Details:**
- SMTP URI: `smtp://apikey@smtp.sendgrid.net:587`
- SMTP Password: Stored as Firebase Secret
- FROM address: `fletch@omahaux.com`
- Region: nam5 (Multi-region United States)

### Email Setup Steps (Detailed)

#### Step 1: Choose Email Provider

**Recommended: SendGrid (Free tier: 100 emails/day)**
- Good for production
- Easy verification process
- Reliable delivery

**Alternative: Gmail (Testing only)**
- Free
- Easy to set up
- NOT recommended for production (strict limits)

---

#### Step 2: Configure SendGrid (Recommended)

1. **Sign up for SendGrid**
   - Go to: https://signup.sendgrid.com/
   - Create free account

2. **Create API Key**
   - Dashboard → Settings → API Keys
   - Click "Create API Key"
   - Choose "Full Access"
   - Copy the API key (save it somewhere safe - you won't see it again!)

3. **Verify Sender Identity**
   - Dashboard → Settings → Sender Authentication
   - Click "Verify a Single Sender"
   - Add email: no-reply@lonch.app (or your domain)
   - Check your email and click verification link

---

#### Step 3: Install Firebase Extension

1. **Go to Firebase Console**
   - https://console.firebase.google.com/project/lonch-cb672/extensions

2. **Install Extension**
   - Click "Install Extension"
   - Search: "Trigger Email from Firestore"
   - Click on the official Firebase extension
   - Click "Install in console"

3. **Configure Extension Settings**

   When prompted, enter:

   **SMTP connection URI:**
   ```
   smtps://apikey:YOUR_SENDGRID_API_KEY@smtp.sendgrid.net:465
   ```
   (Replace YOUR_SENDGRID_API_KEY with the key from Step 2)

   **Email documents collection:**
   ```
   mail
   ```

   **Default FROM address:**
   ```
   no-reply@lonch.app
   ```
   (Must match the verified sender from Step 2.3)

   **Default REPLY-TO address:**
   ```
   (leave blank)
   ```

4. **Enable Required APIs**
   - Extension will prompt to enable Cloud Functions API
   - Click "Enable" on any required APIs
   - Wait for installation (2-3 minutes)

---

#### Step 4: Test Email Extension

1. **Manual Test via Firestore Console**
   - Go to: https://console.firebase.google.com/project/lonch-cb672/firestore/databases/-default-/data/~2Fmail
   - Click "Add Document"
   - Document ID: (auto-generated)
   - Add fields:
     ```
     to: "your-email@example.com"  (string)
     message: (map)
       └─ subject: "Test from Firebase"  (string)
       └─ text: "This is a test email"  (string)
       └─ html: "<p>This is a <strong>test</strong> email</p>"  (string)
     ```
   - Click "Save"
   - Wait 30 seconds
   - Check your email inbox (and spam folder)

2. **Check Extension Logs**
   - Go to: https://console.firebase.google.com/project/lonch-cb672/extensions/instances/firestore-send-email?tab=logs
   - Should see "SUCCESS" or "COMPLETED" status
   - If errors, check SMTP credentials

3. **Test via Application**
   ```bash
   npm run test-email
   ```
   - Should send test invitation email
   - Check console for success message
   - Check email inbox

---

#### Step 5: Update Environment Variables

1. **Edit `.env` file** (create if it doesn't exist)
   ```bash
   # Email Configuration
   VITE_SENDER_EMAIL=no-reply@lonch.app
   VITE_APP_URL=http://localhost:5173
   ```

2. **For Production** (when deployed)
   ```bash
   VITE_SENDER_EMAIL=no-reply@lonch.app
   VITE_APP_URL=https://your-production-domain.com
   ```

---

#### Step 6: Deploy Security Rules

```bash
firebase deploy --only firestore:rules
```

Verify at: https://console.firebase.google.com/project/lonch-cb672/firestore/rules

---

#### Troubleshooting Email Issues

**Emails not sending?**

1. Check Extension logs:
   - https://console.firebase.google.com/project/lonch-cb672/extensions/instances/firestore-send-email?tab=logs

2. Check Firestore `mail` collection:
   - https://console.firebase.google.com/project/lonch-cb672/firestore/databases/-default-/data/~2Fmail
   - Look for `delivery` field - should show success/error

3. Verify SMTP credentials:
   - Extension config: https://console.firebase.google.com/project/lonch-cb672/extensions/instances/firestore-send-email?tab=config
   - Make sure API key is correct
   - Make sure sender email is verified

4. Check spam folder

**Common Issues:**

- **"Sender not verified"** → Go to SendGrid and complete sender verification
- **"Invalid credentials"** → Check SMTP URI format and API key
- **"Rate limit exceeded"** → SendGrid free tier is 100/day, upgrade if needed
- **Extension status "Error"** → Check that all required APIs are enabled

---

## 3. OPTIONAL: Merge Bug Fix Branches

**Current Open Branches:**
- `bug/11-share-links-loading-forever` - ✅ Fixed and pushed
- `bug/12-missing-firestore-indexes-invite-links` - ✅ Config pushed, needs deployment
- `bug/13-generate-link-modal-closes-immediately` - ✅ Fixed and pushed
- `bug/14-invited-project-not-in-dashboard` - ✅ Fixed and verified

**Action Items:**
1. Create pull requests for each branch
2. Review and merge to `main`
3. Delete merged branches

**Commands:**
```bash
# Create PRs via GitHub CLI
gh pr create --base main --head bug/11-share-links-loading-forever
gh pr create --base main --head bug/12-missing-firestore-indexes-invite-links
gh pr create --base main --head bug/13-generate-link-modal-closes-immediately
gh pr create --base main --head bug/14-invited-project-not-in-dashboard

# Or create via GitHub web interface
```

---

## 4. Share Links Feature - Complete Status

**Feature:** Shareable Invite Links (PRD-0004)

**Status:** ✅ Fully implemented and tested

**Fixed Bugs:**
1. ✅ Bug #11 - Loading state stuck → Fixed (wait for permissions check)
2. ✅ Bug #12 - Missing Firestore indexes → Fixed (needs deployment)
3. ✅ Bug #13 - Modal closes immediately → Fixed (callback timing)
4. ✅ Bug #14 - Project not in dashboard → Fixed (refetch projects)

**What Works:**
- ✅ Generate invite links with role and group selection
- ✅ Link preview before generation
- ✅ Copy link to clipboard
- ✅ View all generated links in table
- ✅ Revoke links
- ✅ Accept invite links
- ✅ Projects appear in dashboard after acceptance
- ✅ Activity log tracking
- ✅ All 648 tests passing
- ✅ ESLint clean

**Ready for:** Production use (after Firestore indexes deployed)

---

## 5. Quick Reference: File Locations

**Bug Reports:**
- `bugs/2025-10-24-share-links-loading-forever.md`
- `bugs/2025-10-24-missing-firestore-indexes-invite-links.md`
- `bugs/2025-10-24-generate-link-modal-closes-immediately.md`
- `bugs/2025-10-24-invited-project-not-in-dashboard.md`

**Email Documentation:**
- `docs/FIREBASE_EMAIL_SETUP.md` - Complete setup guide
- `src/services/emailService.js` - Email service implementation
- `src/services/emailService.test.js` - Email tests

**Configuration Files:**
- `firestore.indexes.json` - Firestore index definitions
- `firestore.rules` - Security rules (includes email collections)
- `.env.example` - Environment variable template

---

## 6. Priority Order

**Do First:**
1. **Deploy Firestore indexes** (needed for Share Links to work)
2. **Set up email integration** (needed for invite notifications)

**Do Soon:**
3. Merge bug fix branches
4. Test complete invite flow with emails

**Do Later:**
5. Production deployment
6. Monitor email delivery

---

## Summary

**Completed This Session:**
- ✅ Fixed 4 bugs in Share Links feature
- ✅ All tests passing (648 tests)
- ✅ Feature fully functional
- ✅ Email code implemented and tested

**Needs Manual Steps:**
1. Deploy Firestore indexes (5 minutes)
2. Configure Firebase email extension (15 minutes)

**Total Manual Setup Time:** ~20 minutes

Both items have detailed step-by-step guides above.
