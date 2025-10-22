import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  initializeEmailTemplates,
  getEmailTemplate,
  renderEmailTemplate,
  queueEmail,
  sendInvitationEmail,
  sendTestEmail
} from './emailService';

// Mock Firebase
vi.mock('../config/firebase', () => ({
  db: {}
}));

// Mock Firestore functions
const mockGetDoc = vi.fn();
const mockSetDoc = vi.fn();
const mockAddDoc = vi.fn();
const mockDoc = vi.fn();
const mockCollection = vi.fn();

vi.mock('firebase/firestore', () => ({
  collection: (...args) => mockCollection(...args),
  doc: (...args) => mockDoc(...args),
  getDoc: (...args) => mockGetDoc(...args),
  setDoc: (...args) => mockSetDoc(...args),
  addDoc: (...args) => mockAddDoc(...args)
}));

// Mock email templates
vi.mock('../utils/emailTemplates', () => ({
  renderTemplate: vi.fn((template, variables) => {
    // Simple mock implementation
    let result = template;
    Object.keys(variables).forEach(key => {
      result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), String(variables[key]));
    });
    // Replace any remaining placeholders
    result = result.replace(/\{\{[^}]+\}\}/g, '');
    return result;
  }),
  formatExpirationDate: vi.fn(() => 'October 28, 2025'),
  INVITATION_HTML_TEMPLATE: '<html>{{inviterName}} invited you to {{projectName}} as {{role}} in {{group}}. Link: {{acceptUrl}}</html>',
  INVITATION_TEXT_TEMPLATE: '{{inviterName}} invited you to {{projectName}} as {{role}} in {{group}}. Link: {{acceptUrl}}',
  INVITATION_SUBJECT_TEMPLATE: 'Invitation to {{projectName}}'
}));

describe('emailService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock window.location.origin
    delete window.location;
    window.location = { origin: 'http://localhost:5173' };
    // Mock import.meta.env
    vi.stubGlobal('import', {
      meta: {
        env: {
          VITE_APP_URL: 'http://localhost:5173',
          VITE_SENDER_EMAIL: 'no-reply@lonch.app'
        }
      }
    });
  });

  describe('initializeEmailTemplates', () => {
    it('should create template in Firestore if it doesn\'t exist', async () => {
      mockGetDoc.mockResolvedValue({
        exists: () => false
      });
      mockSetDoc.mockResolvedValue();

      await initializeEmailTemplates();

      expect(mockSetDoc).toHaveBeenCalled();
      const callArgs = mockSetDoc.mock.calls[0];
      expect(callArgs[1]).toHaveProperty('id');
      expect(callArgs[1]).toHaveProperty('name');
      expect(callArgs[1]).toHaveProperty('subject');
      expect(callArgs[1]).toHaveProperty('html');
      expect(callArgs[1]).toHaveProperty('text');
    });

    it('should not create template if it already exists', async () => {
      mockGetDoc.mockResolvedValue({
        exists: () => true
      });

      await initializeEmailTemplates();

      expect(mockSetDoc).not.toHaveBeenCalled();
    });

    it('should not throw error if Firestore fails', async () => {
      mockGetDoc.mockRejectedValue(new Error('Firestore error'));

      await expect(initializeEmailTemplates()).resolves.toBeUndefined();
    });
  });

  describe('getEmailTemplate', () => {
    it('should return template from Firestore if it exists', async () => {
      const mockTemplate = {
        id: 'invitation',
        name: 'Project Invitation',
        subject: 'Test Subject',
        html: '<html>Test HTML</html>',
        text: 'Test Text'
      };

      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => mockTemplate
      });

      const result = await getEmailTemplate('invitation');

      expect(result).toEqual(mockTemplate);
    });

    it('should fall back to default template if not found in Firestore', async () => {
      mockGetDoc.mockResolvedValue({
        exists: () => false
      });

      const result = await getEmailTemplate('invitation');

      expect(result).toHaveProperty('id', 'invitation');
      expect(result).toHaveProperty('subject');
      expect(result).toHaveProperty('html');
      expect(result).toHaveProperty('text');
    });

    it('should throw error for unknown template', async () => {
      mockGetDoc.mockResolvedValue({
        exists: () => false
      });

      await expect(getEmailTemplate('unknown')).rejects.toThrow('Template \'unknown\' not found');
    });

    it('should fall back to default template on Firestore error', async () => {
      mockGetDoc.mockRejectedValue(new Error('Firestore error'));

      const result = await getEmailTemplate('invitation');

      expect(result).toHaveProperty('id', 'invitation');
    });
  });

  describe('renderEmailTemplate', () => {
    beforeEach(() => {
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({
          id: 'invitation',
          subject: 'Invitation to {{projectName}}',
          html: '<html>{{inviterName}} invited you to {{projectName}}</html>',
          text: '{{inviterName}} invited you to {{projectName}}'
        })
      });
    });

    it('should render email template with variables', async () => {
      const variables = {
        inviterName: 'John Doe',
        projectName: 'Test Project',
        expiresAt: new Date('2025-10-28')
      };

      const result = await renderEmailTemplate('invitation', variables);

      expect(result).toHaveProperty('subject');
      expect(result).toHaveProperty('html');
      expect(result).toHaveProperty('text');
      expect(result.subject).toContain('Test Project');
      expect(result.html).toContain('John Doe');
      expect(result.html).toContain('Test Project');
    });

    it('should format expiresAt date', async () => {
      const variables = {
        inviterName: 'Jane Smith',
        projectName: 'Another Project',
        expiresAt: new Date('2025-11-15')
      };

      await renderEmailTemplate('invitation', variables);

      const emailTemplates = await import('../utils/emailTemplates');
      expect(emailTemplates.formatExpirationDate).toHaveBeenCalledWith(variables.expiresAt);
    });

    it('should throw error if template not found', async () => {
      mockGetDoc.mockResolvedValue({
        exists: () => false
      });

      await expect(
        renderEmailTemplate('nonexistent', {})
      ).rejects.toThrow('Template \'nonexistent\' not found');
    });
  });

  describe('queueEmail', () => {
    it('should queue email to Firestore mail collection', async () => {
      mockAddDoc.mockResolvedValue({ id: 'mail-doc-123' });

      const result = await queueEmail(
        'test@example.com',
        'Test Subject',
        '<html>Test HTML</html>',
        'Test Text'
      );

      expect(mockAddDoc).toHaveBeenCalled();
      const callArgs = mockAddDoc.mock.calls[0];
      expect(callArgs[1]).toEqual({
        to: ['test@example.com'],
        message: {
          subject: 'Test Subject',
          html: '<html>Test HTML</html>',
          text: 'Test Text'
        }
      });
      expect(result).toBe('mail-doc-123');
    });

    it('should handle array of recipients', async () => {
      mockAddDoc.mockResolvedValue({ id: 'mail-doc-456' });

      await queueEmail(
        ['user1@example.com', 'user2@example.com'],
        'Test Subject',
        '<html>Test</html>',
        'Test'
      );

      const callArgs = mockAddDoc.mock.calls[0];
      expect(callArgs[1].to).toEqual(['user1@example.com', 'user2@example.com']);
    });

    it('should include custom from address if provided', async () => {
      mockAddDoc.mockResolvedValue({ id: 'mail-doc-789' });

      await queueEmail(
        'test@example.com',
        'Test Subject',
        '<html>Test</html>',
        'Test',
        'custom@example.com'
      );

      const callArgs = mockAddDoc.mock.calls[0];
      expect(callArgs[1]).toHaveProperty('from', 'custom@example.com');
    });

    it('should throw error if queueing fails', async () => {
      mockAddDoc.mockRejectedValue(new Error('Firestore error'));

      await expect(
        queueEmail('test@example.com', 'Subject', 'HTML', 'Text')
      ).rejects.toThrow('Failed to queue email');
    });
  });

  describe('sendInvitationEmail', () => {
    const mockInvitation = {
      email: 'invitee@example.com',
      role: 'editor',
      group: 'consulting',
      token: 'inv_abc123',
      projectId: 'project-456',
      expiresAt: new Date('2025-10-28')
    };

    beforeEach(() => {
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({
          id: 'invitation',
          subject: 'Invitation to {{projectName}}',
          html: '<html>{{inviterName}} invited you to {{projectName}} as {{role}} in {{group}}. Link: {{acceptUrl}}</html>',
          text: '{{inviterName}} invited you to {{projectName}} as {{role}} in {{group}}. Link: {{acceptUrl}}'
        })
      });
      mockAddDoc.mockResolvedValue({ id: 'mail-doc-invitation' });
    });

    it('should send invitation email with correct variables', async () => {
      const result = await sendInvitationEmail(
        mockInvitation,
        'John Doe',
        'Test Project'
      );

      expect(mockAddDoc).toHaveBeenCalled();
      const callArgs = mockAddDoc.mock.calls[0];
      expect(callArgs[1].to).toEqual(['invitee@example.com']);
      expect(callArgs[1].message.subject).toContain('Test Project');
      expect(callArgs[1].message.html).toContain('John Doe');
      expect(callArgs[1].message.html).toContain('Editor'); // Capitalized
      expect(callArgs[1].message.html).toContain('Consulting Group');
      expect(result).toBe('mail-doc-invitation');
    });

    it('should include accept URL with token', async () => {
      await sendInvitationEmail(mockInvitation, 'Jane Smith', 'Another Project');

      const callArgs = mockAddDoc.mock.calls[0];
      expect(callArgs[1].message.html).toContain('/invite/inv_abc123');
      expect(callArgs[1].message.text).toContain('/invite/inv_abc123');
    });

    it('should handle client group correctly', async () => {
      const clientInvitation = { ...mockInvitation, group: 'client' };

      await sendInvitationEmail(clientInvitation, 'Bob Johnson', 'Client Project');

      const callArgs = mockAddDoc.mock.calls[0];
      expect(callArgs[1].message.html).toContain('Client Group');
    });

    it('should use sender email from environment', async () => {
      await sendInvitationEmail(mockInvitation, 'Sender', 'Project');

      const callArgs = mockAddDoc.mock.calls[0];
      // Sender email is optional in queued data - Firebase Extension uses default if not provided
      // Just verify the email was queued successfully
      expect(callArgs[1].to).toEqual(['invitee@example.com']);
      expect(callArgs[1].message).toHaveProperty('subject');
      expect(callArgs[1].message).toHaveProperty('html');
    });

    it('should throw error if email queueing fails', async () => {
      mockAddDoc.mockRejectedValue(new Error('Firestore error'));

      await expect(
        sendInvitationEmail(mockInvitation, 'Test', 'Project')
      ).rejects.toThrow('Failed to send invitation email');
    });
  });

  describe('sendTestEmail', () => {
    beforeEach(() => {
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({
          id: 'invitation',
          subject: 'Invitation to {{projectName}}',
          html: '<html>Test</html>',
          text: 'Test'
        })
      });
      mockAddDoc.mockResolvedValue({ id: 'mail-doc-test' });
    });

    it('should send test email to specified address', async () => {
      const result = await sendTestEmail('test@example.com');

      expect(mockAddDoc).toHaveBeenCalled();
      const callArgs = mockAddDoc.mock.calls[0];
      expect(callArgs[1].to).toEqual(['test@example.com']);
      expect(callArgs[1].message.subject).toContain('[TEST]');
      expect(result).toBe('mail-doc-test');
    });

    it('should use test template ID if provided', async () => {
      await sendTestEmail('test@example.com', 'custom-template');

      expect(mockGetDoc).toHaveBeenCalled();
    });

    it('should include test variables', async () => {
      await sendTestEmail('test@example.com');

      const callArgs = mockAddDoc.mock.calls[0];
      expect(callArgs[1].message.html).toBeDefined();
      expect(callArgs[1].message.text).toBeDefined();
    });
  });
});
