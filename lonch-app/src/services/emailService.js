import { db } from '../config/firebase';
import {
  collection,
  doc,
  getDoc,
  addDoc,
  setDoc
} from 'firebase/firestore';
import {
  renderTemplate,
  formatExpirationDate,
  INVITATION_HTML_TEMPLATE,
  INVITATION_TEXT_TEMPLATE,
  INVITATION_SUBJECT_TEMPLATE
} from '../utils/emailTemplates';

/**
 * Email Service
 *
 * Manages email template rendering and queuing emails via Firebase Extension.
 * Firebase Extension "Trigger Email from Firestore" monitors the `mail` collection
 * and sends emails via configured SMTP provider.
 *
 * Email document structure in `mail` collection:
 * {
 *   to: string | string[],
 *   message: {
 *     subject: string,
 *     html: string,
 *     text: string
 *   },
 *   from: string (optional, uses default if not provided)
 * }
 */

/**
 * Default templates stored in memory for immediate availability
 * These can be overridden by fetching from Firestore
 */
const DEFAULT_TEMPLATES = {
  invitation: {
    id: 'invitation',
    name: 'Project Invitation',
    subject: INVITATION_SUBJECT_TEMPLATE,
    html: INVITATION_HTML_TEMPLATE,
    text: INVITATION_TEXT_TEMPLATE,
    variables: ['inviterName', 'projectName', 'role', 'group', 'acceptUrl', 'expiresAt', 'preferencesUrl']
  }
};

/**
 * Initialize email templates in Firestore if they don't exist
 * This function should be called once during app initialization
 * @returns {Promise<void>}
 */
export async function initializeEmailTemplates() {
  try {
    for (const [templateId, templateData] of Object.entries(DEFAULT_TEMPLATES)) {
      const templateRef = doc(db, 'emailTemplates', templateId);
      const templateDoc = await getDoc(templateRef);

      if (!templateDoc.exists()) {
        await setDoc(templateRef, {
          ...templateData,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        console.log(`Email template '${templateId}' initialized in Firestore`);
      }
    }
  } catch (error) {
    console.error('Error initializing email templates:', error);
    // Don't throw - fall back to default templates
  }
}

/**
 * Get an email template from Firestore, falling back to default if not found
 * @param {string} templateId - Template ID (e.g., 'invitation')
 * @returns {Promise<Object>} Template object with subject, html, text, and variables
 */
export async function getEmailTemplate(templateId) {
  try {
    const templateRef = doc(db, 'emailTemplates', templateId);
    const templateDoc = await getDoc(templateRef);

    if (templateDoc.exists()) {
      return templateDoc.data();
    }

    // Fall back to default template
    if (DEFAULT_TEMPLATES[templateId]) {
      console.warn(`Template '${templateId}' not found in Firestore, using default`);
      return DEFAULT_TEMPLATES[templateId];
    }

    throw new Error(`Template '${templateId}' not found`);
  } catch (error) {
    console.error('Error getting email template:', error);

    // Fall back to default template even on error
    if (DEFAULT_TEMPLATES[templateId]) {
      return DEFAULT_TEMPLATES[templateId];
    }

    throw error;
  }
}

/**
 * Render an email template with provided variables
 * @param {string} templateId - Template ID to render
 * @param {Object} variables - Key-value pairs for template variables
 * @returns {Promise<Object>} Rendered email with subject, html, and text
 */
export async function renderEmailTemplate(templateId, variables) {
  try {
    const template = await getEmailTemplate(templateId);

    // Format special variables
    const processedVariables = { ...variables };
    if (processedVariables.expiresAt) {
      processedVariables.expiresAt = formatExpirationDate(processedVariables.expiresAt);
    }

    return {
      subject: renderTemplate(template.subject, processedVariables),
      html: renderTemplate(template.html, processedVariables),
      text: renderTemplate(template.text, processedVariables)
    };
  } catch (error) {
    console.error('Error rendering email template:', error);
    throw new Error(`Failed to render email template: ${error.message}`);
  }
}

/**
 * Queue an email to be sent via Firebase Extension
 * @param {string|string[]} to - Recipient email address(es)
 * @param {string} subject - Email subject
 * @param {string} html - HTML email body
 * @param {string} text - Plain text email body
 * @param {string} from - Sender email (optional, uses default if not provided)
 * @returns {Promise<string>} Document ID of queued email
 */
export async function queueEmail(to, subject, html, text, from = null) {
  try {
    const mailRef = collection(db, 'mail');

    const emailData = {
      to: Array.isArray(to) ? to : [to],
      message: {
        subject,
        html,
        text
      }
    };

    // Add custom from address if provided
    if (from) {
      emailData.from = from;
    }

    const docRef = await addDoc(mailRef, emailData);

    console.log('Email queued successfully:', {
      id: docRef.id,
      to: emailData.to,
      subject: emailData.message.subject
    });

    return docRef.id;
  } catch (error) {
    console.error('Error queueing email:', error);
    throw new Error(`Failed to queue email: ${error.message}`);
  }
}

/**
 * Send an invitation email
 * @param {Object} invitation - Invitation object with email, role, group, token, projectId, expiresAt
 * @param {string} inviterName - Name of person sending invitation
 * @param {string} projectName - Project name
 * @returns {Promise<string>} Document ID of queued email
 */
export async function sendInvitationEmail(invitation, inviterName, projectName) {
  try {
    // Get application URL from environment
    const appUrl = import.meta.env.VITE_APP_URL || window.location.origin;
    const senderEmail = import.meta.env.VITE_SENDER_EMAIL;

    // Build template variables
    const variables = {
      inviterName,
      projectName,
      role: invitation.role.charAt(0).toUpperCase() + invitation.role.slice(1), // Capitalize
      group: invitation.group === 'consulting' ? 'Consulting Group' : 'Client Group',
      acceptUrl: `${appUrl}/invite/${invitation.token}`,
      expiresAt: invitation.expiresAt,
      preferencesUrl: `${appUrl}/settings/notifications`
    };

    // Render template
    const rendered = await renderEmailTemplate('invitation', variables);

    // Queue email
    const emailId = await queueEmail(
      invitation.email,
      rendered.subject,
      rendered.html,
      rendered.text,
      senderEmail
    );

    return emailId;
  } catch (error) {
    console.error('Error sending invitation email:', error);
    throw new Error(`Failed to send invitation email: ${error.message}`);
  }
}

/**
 * Send a test email (for testing/development)
 * @param {string} recipientEmail - Email address to send test to
 * @param {string} templateId - Template ID to test
 * @returns {Promise<string>} Document ID of queued email
 */
export async function sendTestEmail(recipientEmail, templateId = 'invitation') {
  try {
    const testVariables = {
      inviterName: 'Test User',
      projectName: 'Test Project',
      role: 'Editor',
      group: 'Consulting Group',
      acceptUrl: `${window.location.origin}/invite/test_token_123`,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      preferencesUrl: `${window.location.origin}/settings/notifications`
    };

    const rendered = await renderEmailTemplate(templateId, testVariables);

    const emailId = await queueEmail(
      recipientEmail,
      `[TEST] ${rendered.subject}`,
      rendered.html,
      rendered.text
    );

    console.log('Test email sent to:', recipientEmail);

    return emailId;
  } catch (error) {
    console.error('Error sending test email:', error);
    throw new Error(`Failed to send test email: ${error.message}`);
  }
}
