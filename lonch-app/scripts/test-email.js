#!/usr/bin/env node
/* eslint-env node */

/**
 * Test Email Script
 *
 * Sends a test email using the Firebase Extension to verify email integration.
 *
 * Usage:
 *   node scripts/test-email.js your-email@example.com
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';

// Firebase configuration from environment
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

// Get email from command line argument
const recipientEmail = process.argv[2];

if (!recipientEmail) {
  console.error('❌ Error: Please provide a recipient email address');
  console.log('\nUsage: node scripts/test-email.js your-email@example.com');
  process.exit(1);
}

// Validate email format
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(recipientEmail)) {
  console.error('❌ Error: Invalid email format');
  process.exit(1);
}

console.log('🚀 Sending test email to:', recipientEmail);
console.log('📧 Using Firebase project:', firebaseConfig.projectId);
console.log('');

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Send test email by adding document to mail collection
async function sendTestEmail() {
  try {
    const mailRef = collection(db, 'mail');

    const emailData = {
      to: [recipientEmail],
      message: {
        subject: '[TEST] Email Integration Test from lonch',
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="margin: 0; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f7fafc;">
              <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; padding: 40px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <div style="background: linear-gradient(135deg, #2D9B9B 0%, #1a7373 100%); padding: 30px; text-align: center; border-radius: 8px; margin-bottom: 30px;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 32px;">✅ Success!</h1>
                </div>

                <h2 style="color: #1a202c; margin-bottom: 20px;">Email Integration is Working</h2>

                <p style="color: #4a5568; font-size: 16px; line-height: 1.6;">
                  This is a test email from your <strong>lonch</strong> application.
                  If you're seeing this, your Firebase Extension and SendGrid integration are configured correctly!
                </p>

                <div style="background-color: #f7fafc; padding: 20px; border-radius: 6px; margin: 20px 0;">
                  <p style="margin: 0; color: #718096; font-size: 14px;">
                    <strong>Test Details:</strong><br>
                    Sent: ${new Date().toLocaleString()}<br>
                    To: ${recipientEmail}<br>
                    Via: Firebase Extension + SendGrid
                  </p>
                </div>

                <p style="color: #4a5568; font-size: 14px; line-height: 1.6;">
                  🎉 Next steps:
                </p>
                <ul style="color: #4a5568; font-size: 14px; line-height: 1.8;">
                  <li>Verify email branding looks good</li>
                  <li>Check spam folder (just in case)</li>
                  <li>Test invitation emails in your app</li>
                </ul>

                <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">

                <p style="color: #a0aec0; font-size: 12px; text-align: center;">
                  © 2025 lonch. Test email from email integration setup.
                </p>
              </div>
            </body>
          </html>
        `,
        text: `
✅ SUCCESS! Email Integration is Working

This is a test email from your lonch application.

If you're seeing this, your Firebase Extension and SendGrid integration are configured correctly!

Test Details:
- Sent: ${new Date().toLocaleString()}
- To: ${recipientEmail}
- Via: Firebase Extension + SendGrid

🎉 Next steps:
- Verify email branding looks good
- Check spam folder (just in case)
- Test invitation emails in your app

© 2025 lonch. Test email from email integration setup.
        `
      }
    };

    console.log('📝 Adding email to Firestore mail collection...');
    const docRef = await addDoc(mailRef, emailData);

    console.log('');
    console.log('✅ Email queued successfully!');
    console.log('📄 Document ID:', docRef.id);
    console.log('');
    console.log('⏳ The Firebase Extension will process this in 10-30 seconds.');
    console.log('📬 Check your inbox at:', recipientEmail);
    console.log('📁 Also check your spam folder!');
    console.log('');
    console.log('🔍 To verify delivery:');
    console.log('   1. Go to Firebase Console → Firestore');
    console.log('   2. Open the mail collection');
    console.log('   3. Find document:', docRef.id);
    console.log('   4. Check for a "delivery" field (appears after sending)');
    console.log('');

    process.exit(0);
  } catch (error) {
    console.error('');
    console.error('❌ Error sending test email:', error.message);
    console.error('');
    console.error('Troubleshooting:');
    console.error('  - Verify SMTP URI is correct in Firebase Extension config');
    console.error('  - Check SendGrid API key is valid');
    console.error('  - Verify sender email is verified in SendGrid');
    console.error('  - Check Firebase Extension logs for errors');
    console.error('');
    process.exit(1);
  }
}

// Run the test
sendTestEmail();
