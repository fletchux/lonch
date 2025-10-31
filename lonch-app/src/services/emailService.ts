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
  INVITATION_SUBJECT_TEMPLATE,
  TemplateVariables
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

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  html: string;
  text: string;
  variables: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface RenderedEmail {
  subject: string;
  html: string;
  text: string;
}

export interface EmailData {
  to: string[];
  message: {
    subject: string;
    html: string;
    text: string;
  };
  from?: string;
}

export interface Invitation {
  email: string;
  role: string;
  group: string;
  token: string;
  projectId: string;
  expiresAt: Date | string;
}

/**
 * Default templates stored in memory for immediate availability
 * These can be overridden by fetching from Firestore
 */
const DEFAULT_TEMPLATES: Record<string, EmailTemplate> = {
  invitation: {
    id: 'invitation',
    name: 'Project Invitation',
    subject: INVITATION_SUBJECT_TEMPLATE,
    html: INVITATION_HTML_TEMPLATE,
    text: INVITATION_TEXT_TEMPLATE,
    variables: ['email', 'inviterName', 'projectName', 'role', 'group', 'acceptUrl', 'expiresAt', 'preferencesUrl']
  }
};

/**
 * Initialize email templates in Firestore if they don't exist
 * This function should be called once during app initialization
 */
export async function initializeEmailTemplates(): Promise<void> {
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
 */
export async function getEmailTemplate(templateId: string): Promise<EmailTemplate> {
  try {
    const templateRef = doc(db, 'emailTemplates', templateId);
    const templateDoc = await getDoc(templateRef);

    if (templateDoc.exists()) {
      return templateDoc.data() as EmailTemplate;
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
 */
export async function renderEmailTemplate(templateId: string, variables: TemplateVariables): Promise<RenderedEmail> {
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
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error rendering email template:', error);
    throw new Error(`Failed to render email template: ${message}`);
  }
}

/**
 * Queue an email to be sent via Firebase Extension
 */
export async function queueEmail(
  to: string | string[],
  subject: string,
  html: string,
  text: string,
  from: string | null = null
): Promise<string> {
  try {
    const mailRef = collection(db, 'mail');

    const emailData: EmailData = {
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
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error queueing email:', error);
    throw new Error(`Failed to queue email: ${message}`);
  }
}

/**
 * Send an invitation email
 */
export async function sendInvitationEmail(
  invitation: Invitation,
  inviterName: string,
  projectName: string
): Promise<string> {
  try {
    // Get application URL from environment
    const appUrl = import.meta.env.VITE_APP_URL || window.location.origin;
    const senderEmail = import.meta.env.VITE_SENDER_EMAIL;

    // Build template variables
    const variables: TemplateVariables = {
      email: invitation.email,
      inviterName,
      projectName,
      role: invitation.role.charAt(0).toUpperCase() + invitation.role.slice(1), // Capitalize
      group: invitation.group === 'consulting' ? 'Consulting Group' : 'Client Group',
      acceptUrl: `${appUrl}/invite/${invitation.token}`,
      expiresAt: invitation.expiresAt.toString(),
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
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error sending invitation email:', error);
    throw new Error(`Failed to send invitation email: ${message}`);
  }
}

/**
 * Send a test email (for testing/development)
 */
export async function sendTestEmail(recipientEmail: string, templateId: string = 'invitation'): Promise<string> {
  try {
    const testVariables: TemplateVariables = {
      email: recipientEmail,
      inviterName: 'Test User',
      projectName: 'Test Project',
      role: 'Editor',
      group: 'Consulting Group',
      acceptUrl: `${window.location.origin}/invite/test_token_123`,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
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
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error sending test email:', error);
    throw new Error(`Failed to send test email: ${message}`);
  }
}
