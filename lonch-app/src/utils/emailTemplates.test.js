import { describe, it, expect } from 'vitest';
import {
  formatExpirationDate,
  renderTemplate,
  INVITATION_HTML_TEMPLATE,
  INVITATION_TEXT_TEMPLATE,
  INVITATION_SUBJECT_TEMPLATE
} from './emailTemplates';

describe('emailTemplates', () => {
  describe('formatExpirationDate', () => {
    it('should format Date object as human-readable string', () => {
      const date = new Date('2025-10-28T12:00:00Z');
      const result = formatExpirationDate(date);
      expect(result).toBe('October 28, 2025');
    });

    it('should format date string as human-readable string', () => {
      const dateString = '2025-12-25T12:00:00Z';
      const result = formatExpirationDate(dateString);
      expect(result).toBe('December 25, 2025');
    });

    it('should handle different months correctly', () => {
      const dates = [
        { input: new Date(2025, 0, 15), expected: 'January 15, 2025' },  // Month is 0-indexed
        { input: new Date(2025, 5, 30), expected: 'June 30, 2025' },
        { input: new Date(2025, 10, 11), expected: 'November 11, 2025' }
      ];

      dates.forEach(({ input, expected }) => {
        const result = formatExpirationDate(input);
        expect(result).toBe(expected);
      });
    });
  });

  describe('renderTemplate', () => {
    it('should replace single variable in template', () => {
      const template = 'Hello {{name}}!';
      const variables = { name: 'Alice' };
      const result = renderTemplate(template, variables);
      expect(result).toBe('Hello Alice!');
    });

    it('should replace multiple variables in template', () => {
      const template = '{{greeting}} {{name}}, welcome to {{place}}!';
      const variables = {
        greeting: 'Hello',
        name: 'Bob',
        place: 'lonch'
      };
      const result = renderTemplate(template, variables);
      expect(result).toBe('Hello Bob, welcome to lonch!');
    });

    it('should replace same variable multiple times', () => {
      const template = '{{name}} loves {{name}}\'s work at {{name}}!';
      const variables = { name: 'Carol' };
      const result = renderTemplate(template, variables);
      expect(result).toBe('Carol loves Carol\'s work at Carol!');
    });

    it('should handle missing variables with empty string', () => {
      const template = 'Hello {{name}}, your role is {{role}}.';
      const variables = { name: 'Dave' };
      const result = renderTemplate(template, variables);
      expect(result).toBe('Hello Dave, your role is .');
    });

    it('should handle undefined and null values', () => {
      const template = 'Value 1: {{val1}}, Value 2: {{val2}}, Value 3: {{val3}}';
      const variables = {
        val1: undefined,
        val2: null,
        val3: 'exists'
      };
      const result = renderTemplate(template, variables);
      expect(result).toBe('Value 1: , Value 2: , Value 3: exists');
    });

    it('should not replace variables without braces', () => {
      const template = 'Hello name, your {{name}} is here!';
      const variables = { name: 'Eve' };
      const result = renderTemplate(template, variables);
      expect(result).toBe('Hello name, your Eve is here!');
    });

    it('should handle empty template', () => {
      const template = '';
      const variables = { name: 'Frank' };
      const result = renderTemplate(template, variables);
      expect(result).toBe('');
    });

    it('should handle empty variables object', () => {
      const template = 'Hello {{name}}!';
      const variables = {};
      const result = renderTemplate(template, variables);
      expect(result).toBe('Hello !');
    });

    it('should render invitation template with all variables', () => {
      const variables = {
        inviterName: 'John Doe',
        projectName: 'Website Redesign',
        role: 'Editor',
        group: 'Consulting Group',
        acceptUrl: 'https://lonch.app/invite/abc123',
        expiresAt: 'October 28, 2025',
        preferencesUrl: 'https://lonch.app/settings/notifications'
      };

      const htmlResult = renderTemplate(INVITATION_HTML_TEMPLATE, variables);
      expect(htmlResult).toContain('John Doe');
      expect(htmlResult).toContain('Website Redesign');
      expect(htmlResult).toContain('Editor');
      expect(htmlResult).toContain('Consulting Group');
      expect(htmlResult).toContain('https://lonch.app/invite/abc123');
      expect(htmlResult).toContain('October 28, 2025');
      expect(htmlResult).toContain('https://lonch.app/settings/notifications');

      // Verify no placeholders remain
      expect(htmlResult).not.toContain('{{');
      expect(htmlResult).not.toContain('}}');
    });

    it('should render plain text template with all variables', () => {
      const variables = {
        inviterName: 'Jane Smith',
        projectName: 'Mobile App Launch',
        role: 'Viewer',
        group: 'Client Group',
        acceptUrl: 'https://lonch.app/invite/xyz789',
        expiresAt: 'November 15, 2025',
        preferencesUrl: 'https://lonch.app/settings/notifications'
      };

      const textResult = renderTemplate(INVITATION_TEXT_TEMPLATE, variables);
      expect(textResult).toContain('Jane Smith');
      expect(textResult).toContain('Mobile App Launch');
      expect(textResult).toContain('Viewer');
      expect(textResult).toContain('Client Group');
      expect(textResult).toContain('https://lonch.app/invite/xyz789');
      expect(textResult).toContain('November 15, 2025');

      // Verify no placeholders remain
      expect(textResult).not.toContain('{{');
      expect(textResult).not.toContain('}}');
    });

    it('should render subject template with variables', () => {
      const variables = {
        projectName: 'E-commerce Platform'
      };

      const subjectResult = renderTemplate(INVITATION_SUBJECT_TEMPLATE, variables);
      expect(subjectResult).toBe('You\'ve been invited to collaborate on E-commerce Platform');
      expect(subjectResult).not.toContain('{{');
    });
  });

  describe('template constants', () => {
    it('INVITATION_HTML_TEMPLATE should contain all required placeholders', () => {
      expect(INVITATION_HTML_TEMPLATE).toContain('{{inviterName}}');
      expect(INVITATION_HTML_TEMPLATE).toContain('{{projectName}}');
      expect(INVITATION_HTML_TEMPLATE).toContain('{{role}}');
      expect(INVITATION_HTML_TEMPLATE).toContain('{{group}}');
      expect(INVITATION_HTML_TEMPLATE).toContain('{{acceptUrl}}');
      expect(INVITATION_HTML_TEMPLATE).toContain('{{expiresAt}}');
      expect(INVITATION_HTML_TEMPLATE).toContain('{{preferencesUrl}}');
    });

    it('INVITATION_TEXT_TEMPLATE should contain all required placeholders', () => {
      expect(INVITATION_TEXT_TEMPLATE).toContain('{{inviterName}}');
      expect(INVITATION_TEXT_TEMPLATE).toContain('{{projectName}}');
      expect(INVITATION_TEXT_TEMPLATE).toContain('{{role}}');
      expect(INVITATION_TEXT_TEMPLATE).toContain('{{group}}');
      expect(INVITATION_TEXT_TEMPLATE).toContain('{{acceptUrl}}');
      expect(INVITATION_TEXT_TEMPLATE).toContain('{{expiresAt}}');
      expect(INVITATION_TEXT_TEMPLATE).toContain('{{preferencesUrl}}');
    });

    it('INVITATION_SUBJECT_TEMPLATE should contain projectName placeholder', () => {
      expect(INVITATION_SUBJECT_TEMPLATE).toContain('{{projectName}}');
    });

    it('INVITATION_HTML_TEMPLATE should be valid HTML', () => {
      expect(INVITATION_HTML_TEMPLATE).toContain('<!DOCTYPE html>');
      expect(INVITATION_HTML_TEMPLATE).toContain('<html');
      expect(INVITATION_HTML_TEMPLATE).toContain('</html>');
      expect(INVITATION_HTML_TEMPLATE).toContain('<body');
      expect(INVITATION_HTML_TEMPLATE).toContain('</body>');
    });

    it('INVITATION_HTML_TEMPLATE should have lonch branding colors', () => {
      // Check for teal color (#2D9B9B)
      expect(INVITATION_HTML_TEMPLATE).toContain('#2D9B9B');
      // Check for gold color (#DBA507)
      expect(INVITATION_HTML_TEMPLATE).toContain('#DBA507');
    });
  });
});
