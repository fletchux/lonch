import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  extractDataFromDocument,
  extractDataFromMultipleDocuments,
  mergeExtractedData,
  mapToProjectData
} from './documentExtraction';

// Mock documentParser
vi.mock('../utils/documentParser', () => ({
  extractTextFromDocument: vi.fn(),
  cleanExtractedText: vi.fn((text) => text)
}));

// Mock create function that we'll reference in tests
let mockCreate = vi.fn();

// Mock the Anthropic SDK
vi.mock('@anthropic-ai/sdk', () => ({
  default: vi.fn().mockImplementation(() => ({
    messages: {
      get create() {
        return mockCreate;
      }
    }
  }))
}));

describe('documentExtraction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('extractDataFromDocument', () => {
    it('should extract data from a document successfully', async () => {
      const { extractTextFromDocument } = await import('../utils/documentParser');

      extractTextFromDocument.mockResolvedValue('Sample contract text with project details and sufficient length for processing');

      mockCreate.mockResolvedValue({
        content: [{
          text: JSON.stringify({
            projectName: 'Website Redesign',
            clientName: 'Acme Corp',
            budget: '$50,000',
            timeline: '3 months',
            deliverables: ['Homepage', 'About Page', 'Contact Form'],
            scopeOfWork: 'Complete website redesign',
            objectives: ['Improve UX', 'Modernize design'],
            keyStakeholders: [{ name: 'John Doe', role: 'Project Manager', email: 'john@acme.com' }],
            paymentTerms: '50% upfront, 50% on completion',
            milestones: [{ name: 'Design approval', date: '2024-02-01' }]
          })
        }]
      });

      const mockFile = new File(['contract content'], 'contract.pdf', { type: 'application/pdf' });
      const result = await extractDataFromDocument(mockFile);

      expect(result.success).toBe(true);
      expect(result.fileName).toBe('contract.pdf');
      expect(result.extractedData.projectName).toBe('Website Redesign');
      expect(result.extractedData.clientName).toBe('Acme Corp');
      expect(result.extractedData.budget).toBe('$50,000');
      expect(result.extractedData.deliverables).toEqual(['Homepage', 'About Page', 'Contact Form']);
      expect(result.metadata.model).toBe('claude-3-5-sonnet');
    });

    it('should call progress callback during extraction', async () => {
      const { extractTextFromDocument } = await import('../utils/documentParser');

      extractTextFromDocument.mockResolvedValue('Sample text with sufficient length for extraction processing');

      mockCreate.mockResolvedValue({
        content: [{
          text: JSON.stringify({ projectName: 'Test Project' })
        }]
      });

      const progressCallback = vi.fn();
      const mockFile = new File(['content'], 'test.pdf', { type: 'application/pdf' });

      await extractDataFromDocument(mockFile, progressCallback);

      expect(progressCallback).toHaveBeenCalledWith({ status: 'parsing', progress: 25 });
      expect(progressCallback).toHaveBeenCalledWith({ status: 'extracting', progress: 50 });
      expect(progressCallback).toHaveBeenCalledWith({ status: 'processing', progress: 75 });
      expect(progressCallback).toHaveBeenCalledWith({ status: 'complete', progress: 100 });
    });

    it('should handle insufficient text error', async () => {
      const { extractTextFromDocument } = await import('../utils/documentParser');

      extractTextFromDocument.mockResolvedValue('Short');

      const mockFile = new File(['content'], 'test.pdf', { type: 'application/pdf' });
      const result = await extractDataFromDocument(mockFile);

      expect(result.success).toBe(false);
      expect(result.error).toContain('insufficient text');
    });

    it('should handle AI response without valid JSON', async () => {
      const { extractTextFromDocument } = await import('../utils/documentParser');

      extractTextFromDocument.mockResolvedValue('Sample document text with enough content to pass the length check and continue processing');

      mockCreate.mockResolvedValue({
        content: [{
          text: 'This is not JSON at all'
        }]
      });

      const mockFile = new File(['content'], 'test.pdf', { type: 'application/pdf' });
      const result = await extractDataFromDocument(mockFile);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Failed to extract JSON');
    });

    it('should handle document parsing errors', async () => {
      const { extractTextFromDocument } = await import('../utils/documentParser');

      extractTextFromDocument.mockRejectedValue(new Error('PDF parsing failed'));

      const mockFile = new File(['content'], 'test.pdf', { type: 'application/pdf' });
      const result = await extractDataFromDocument(mockFile);

      expect(result.success).toBe(false);
      expect(result.error).toBe('PDF parsing failed');
    });

    it('should extract JSON even when AI adds surrounding text', async () => {
      const { extractTextFromDocument } = await import('../utils/documentParser');

      extractTextFromDocument.mockResolvedValue('Sample document text with enough content for processing and extraction');

      mockCreate.mockResolvedValue({
        content: [{
          text: 'Here is the extracted data:\n{"projectName": "Test Project"}\nHope this helps!'
        }]
      });

      const mockFile = new File(['content'], 'test.pdf', { type: 'application/pdf' });
      const result = await extractDataFromDocument(mockFile);

      expect(result.success).toBe(true);
      expect(result.extractedData.projectName).toBe('Test Project');
    });
  });

  describe('extractDataFromMultipleDocuments', () => {
    it('should extract data from multiple documents', async () => {
      const { extractTextFromDocument } = await import('../utils/documentParser');

      extractTextFromDocument.mockResolvedValue('Sample document text with enough content for processing and extraction');

      mockCreate
        .mockResolvedValueOnce({
          content: [{ text: JSON.stringify({ projectName: 'Project 1' }) }]
        })
        .mockResolvedValueOnce({
          content: [{ text: JSON.stringify({ projectName: 'Project 2' }) }]
        });

      const files = [
        new File(['content1'], 'file1.pdf', { type: 'application/pdf' }),
        new File(['content2'], 'file2.pdf', { type: 'application/pdf' })
      ];

      const results = await extractDataFromMultipleDocuments(files);

      expect(results).toHaveLength(2);
      expect(results[0].extractedData.projectName).toBe('Project 1');
      expect(results[1].extractedData.projectName).toBe('Project 2');
    });

    it('should call progress callback for each file', async () => {
      const { extractTextFromDocument } = await import('../utils/documentParser');

      extractTextFromDocument.mockResolvedValue('Sample document text with enough content for extraction processing');

      mockCreate.mockResolvedValue({
        content: [{ text: JSON.stringify({ projectName: 'Test' }) }]
      });

      const progressCallback = vi.fn();
      const files = [
        new File(['content1'], 'file1.pdf', { type: 'application/pdf' }),
        new File(['content2'], 'file2.pdf', { type: 'application/pdf' })
      ];

      await extractDataFromMultipleDocuments(files, progressCallback);

      expect(progressCallback).toHaveBeenCalledWith(0, expect.any(Object));
      expect(progressCallback).toHaveBeenCalledWith(1, expect.any(Object));
    });

    it('should handle empty file array', async () => {
      const results = await extractDataFromMultipleDocuments([]);

      expect(results).toEqual([]);
    });
  });

  describe('mergeExtractedData', () => {
    it('should merge data from multiple successful extractions', () => {
      const extractionResults = [
        {
          success: true,
          fileName: 'contract.pdf',
          extractedData: {
            projectName: 'Website Redesign',
            clientName: 'Acme Corp',
            budget: '$50,000',
            deliverables: ['Homepage', 'About Page']
          }
        },
        {
          success: true,
          fileName: 'specs.pdf',
          extractedData: {
            timeline: '3 months',
            deliverables: ['Contact Form'],
            objectives: ['Improve UX']
          }
        }
      ];

      const result = mergeExtractedData(extractionResults);

      expect(result.mergedData.projectName).toBe('Website Redesign');
      expect(result.mergedData.clientName).toBe('Acme Corp');
      expect(result.mergedData.budget).toBe('$50,000');
      expect(result.mergedData.timeline).toBe('3 months');
      expect(result.mergedData.deliverables).toEqual(['Homepage', 'About Page', 'Contact Form']);
      expect(result.mergedData.objectives).toEqual(['Improve UX']);
    });

    it('should detect conflicts in simple fields', () => {
      const extractionResults = [
        {
          success: true,
          fileName: 'contract1.pdf',
          extractedData: {
            projectName: 'Project A',
            budget: '$50,000'
          }
        },
        {
          success: true,
          fileName: 'contract2.pdf',
          extractedData: {
            projectName: 'Project B',
            budget: '$60,000'
          }
        }
      ];

      const result = mergeExtractedData(extractionResults);

      expect(result.hasConflicts).toBe(true);
      expect(result.conflicts.projectName).toBeDefined();
      expect(result.conflicts.projectName).toHaveLength(2);
      expect(result.conflicts.budget).toBeDefined();
    });

    it('should prefer non-null values', () => {
      const extractionResults = [
        {
          success: true,
          fileName: 'file1.pdf',
          extractedData: {
            projectName: null,
            budget: '$50,000'
          }
        },
        {
          success: true,
          fileName: 'file2.pdf',
          extractedData: {
            projectName: 'Website Project',
            budget: null
          }
        }
      ];

      const result = mergeExtractedData(extractionResults);

      expect(result.mergedData.projectName).toBe('Website Project');
      expect(result.mergedData.budget).toBe('$50,000');
      expect(result.hasConflicts).toBe(false);
    });

    it('should deduplicate array values', () => {
      const extractionResults = [
        {
          success: true,
          fileName: 'file1.pdf',
          extractedData: {
            deliverables: ['Homepage', 'About Page']
          }
        },
        {
          success: true,
          fileName: 'file2.pdf',
          extractedData: {
            deliverables: ['Homepage', 'Contact Form']
          }
        }
      ];

      const result = mergeExtractedData(extractionResults);

      expect(result.mergedData.deliverables).toEqual(['Homepage', 'About Page', 'Contact Form']);
    });

    it('should skip failed extractions', () => {
      const extractionResults = [
        {
          success: false,
          fileName: 'failed.pdf',
          extractedData: null
        },
        {
          success: true,
          fileName: 'success.pdf',
          extractedData: {
            projectName: 'Valid Project'
          }
        }
      ];

      const result = mergeExtractedData(extractionResults);

      expect(result.mergedData.projectName).toBe('Valid Project');
    });

    it('should handle empty results array', () => {
      const result = mergeExtractedData([]);

      expect(result.mergedData.projectName).toBe(null);
      expect(result.mergedData.deliverables).toEqual([]);
      expect(result.hasConflicts).toBe(false);
    });
  });

  describe('mapToProjectData', () => {
    it('should map extracted data to project data structure', () => {
      const extractedData = {
        projectName: 'Website Redesign',
        clientName: 'John Doe',
        clientCompany: 'Acme Corp',
        budget: '$50,000',
        timeline: '3 months',
        startDate: '2024-01-01',
        endDate: '2024-04-01',
        deliverables: ['Homepage', 'About Page'],
        scopeOfWork: 'Complete redesign',
        objectives: ['Improve UX', 'Modernize'],
        keyStakeholders: [{ name: 'Jane', role: 'PM' }],
        paymentTerms: '50/50',
        milestones: [{ name: 'Design', date: '2024-02-01' }]
      };

      const projectData = mapToProjectData(extractedData);

      expect(projectData.name).toBe('Website Redesign');
      expect(projectData.clientName).toBe('John Doe');
      expect(projectData.budget).toBe('$50,000');
      expect(projectData.timeline).toBe('3 months');
      expect(projectData.startDate).toBe('2024-01-01');
      expect(projectData.endDate).toBe('2024-04-01');
      expect(projectData.deliverables).toEqual(['Homepage', 'About Page']);
      expect(projectData.scope).toBe('Complete redesign');
      expect(projectData.objectives).toEqual(['Improve UX', 'Modernize']);
      expect(projectData.stakeholders).toEqual([{ name: 'Jane', role: 'PM' }]);
      expect(projectData.paymentTerms).toBe('50/50');
      expect(projectData.milestones).toEqual([{ name: 'Design', date: '2024-02-01' }]);
    });

    it('should use clientCompany when clientName is missing', () => {
      const extractedData = {
        clientName: null,
        clientCompany: 'Acme Corp'
      };

      const projectData = mapToProjectData(extractedData);

      expect(projectData.clientName).toBe('Acme Corp');
    });

    it('should handle missing fields with empty defaults', () => {
      const extractedData = {};

      const projectData = mapToProjectData(extractedData);

      expect(projectData.name).toBe('');
      expect(projectData.clientName).toBe('');
      expect(projectData.budget).toBe('');
      expect(projectData.deliverables).toEqual([]);
      expect(projectData.objectives).toEqual([]);
      expect(projectData.stakeholders).toEqual([]);
      expect(projectData.milestones).toEqual([]);
    });

    it('should prefer clientName over clientCompany when both exist', () => {
      const extractedData = {
        clientName: 'John Doe',
        clientCompany: 'Acme Corp'
      };

      const projectData = mapToProjectData(extractedData);

      expect(projectData.clientName).toBe('John Doe');
    });
  });
});
