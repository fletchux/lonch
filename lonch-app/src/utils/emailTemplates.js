/**
 * Email Templates
 *
 * HTML and plain text email templates with variable replacement.
 * Templates are designed to work across all email clients.
 *
 * Supported variables:
 * - {{inviterName}} - Name of person sending invitation
 * - {{projectName}} - Project name
 * - {{role}} - Role being assigned (Owner, Admin, Editor, Viewer)
 * - {{group}} - Group being joined (Consulting Group, Client Group)
 * - {{acceptUrl}} - URL to accept invitation
 * - {{expiresAt}} - Human-readable expiration date
 * - {{preferencesUrl}} - URL to notification preferences page
 */

/**
 * Format a date as human-readable string
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted date (e.g., "October 28, 2025")
 */
export function formatExpirationDate(date) {
  const dateObj = date instanceof Date ? date : new Date(date);
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * Replace template variables with actual values
 * @param {string} template - Template string with {{variable}} placeholders
 * @param {Object} variables - Key-value pairs for replacement
 * @returns {string} Template with variables replaced
 */
export function renderTemplate(template, variables) {
  let result = template;

  // First, replace all known variables
  Object.keys(variables).forEach(key => {
    const placeholder = `{{${key}}}`;
    const value = variables[key] !== undefined && variables[key] !== null ? variables[key] : '';
    result = result.split(placeholder).join(value);
  });

  // Then, replace any remaining placeholders with empty string
  result = result.replace(/\{\{[^}]+\}\}/g, '');

  return result;
}

/**
 * HTML email template for project invitations
 * Uses inline styles for maximum email client compatibility
 */
export const INVITATION_HTML_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Project Invitation</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f7fafc;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <!-- Header with teal background -->
          <tr>
            <td style="background: linear-gradient(135deg, #2D9B9B 0%, #1a7373 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
                lonch
              </h1>
              <p style="margin: 10px 0 0 0; color: #e0f2f2; font-size: 14px;">
                Project Collaboration Platform
              </p>
            </td>
          </tr>

          <!-- Main content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="margin: 0 0 20px 0; color: #1a202c; font-size: 22px; font-weight: 600;">
                You've been invited!
              </h2>

              <p style="margin: 0 0 16px 0; color: #4a5568; font-size: 16px; line-height: 1.6;">
                <strong>{{inviterName}}</strong> has invited you to collaborate on <strong>{{projectName}}</strong>.
              </p>

              <p style="margin: 0 0 24px 0; color: #4a5568; font-size: 16px; line-height: 1.6;">
                You've been invited to join as <strong style="color: #2D9B9B;">{{role}}</strong> in the <strong style="color: #DBA507;">{{group}}</strong>.
              </p>

              <!-- CTA Button -->
              <table role="presentation" style="margin: 0 0 24px 0;">
                <tr>
                  <td style="text-align: center;">
                    <a href="{{acceptUrl}}" style="display: inline-block; padding: 14px 32px; background-color: #2D9B9B; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 6px; box-shadow: 0 2px 4px rgba(45, 155, 155, 0.3);">
                      Accept Invitation
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 16px 0; color: #718096; font-size: 14px; line-height: 1.6;">
                Or copy and paste this link into your browser:
              </p>
              <p style="margin: 0 0 24px 0; padding: 12px; background-color: #f7fafc; border-radius: 4px; color: #2D9B9B; font-size: 13px; word-break: break-all; font-family: 'Courier New', monospace;">
                {{acceptUrl}}
              </p>

              <p style="margin: 0; color: #a0aec0; font-size: 13px; line-height: 1.5;">
                This invitation expires on <strong>{{expiresAt}}</strong>.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 30px; background-color: #f7fafc; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0 0 10px 0; color: #718096; font-size: 13px; line-height: 1.5; text-align: center;">
                If you didn't expect this invitation, you can safely ignore this email.
              </p>
              <p style="margin: 0; color: #a0aec0; font-size: 12px; text-align: center;">
                <a href="{{preferencesUrl}}" style="color: #2D9B9B; text-decoration: none;">
                  Manage notification preferences
                </a>
              </p>
            </td>
          </tr>
        </table>

        <!-- Footer note -->
        <p style="margin: 20px 0 0 0; color: #a0aec0; font-size: 12px; text-align: center; line-height: 1.5;">
          © 2025 lonch. All rights reserved.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
`;

/**
 * Plain text email template for project invitations
 * Fallback for email clients that don't support HTML
 */
export const INVITATION_TEXT_TEMPLATE = `
LONCH - Project Collaboration Platform

You've been invited!

{{inviterName}} has invited you to collaborate on {{projectName}}.

You've been invited to join as {{role}} in the {{group}}.

ACCEPT INVITATION:
{{acceptUrl}}

This invitation expires on {{expiresAt}}.

---

If you didn't expect this invitation, you can safely ignore this email.

Manage notification preferences: {{preferencesUrl}}

© 2025 lonch. All rights reserved.
`;

/**
 * Email subject template for invitations
 */
export const INVITATION_SUBJECT_TEMPLATE = `You've been invited to collaborate on {{projectName}}`;
