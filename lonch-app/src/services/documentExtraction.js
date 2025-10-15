import Anthropic from '@anthropic-ai/sdk';
import { extractTextFromDocument, cleanExtractedText } from '../utils/documentParser';

/**
 * Document Extraction Service
 * Uses Claude AI to extract structured data from project documents
 */

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY,
  dangerouslyAllowBrowser: true // Note: In production, this should be done server-side
});

/**
 * Generate extraction prompt for Claude
 * @param {string} documentText - The text extracted from the document
 * @param {string} documentName - Name of the document
 * @returns {string} - Structured prompt for Claude
 */
const generateExtractionPrompt = (documentText, documentName) => {
  return `You are a precise data extraction assistant. Extract the following information from this project document if present. Return ONLY valid JSON with no additional text.

Document: ${documentName}

Extract these fields (use null for missing values):
- projectName: The name or title of the project
- clientName: The client or company name
- clientCompany: The client's company/organization
- budget: Project budget or cost (as a number if possible, or string with currency)
- timeline: Project timeline, deadline, or duration
- startDate: Project start date
- endDate: Project end date or deadline
- deliverables: List of project deliverables (array of strings)
- scopeOfWork: Description of the project scope
- objectives: Project goals or objectives (array of strings)
- keyStakeholders: List of stakeholders or contacts (array of objects with name, role, email if available)
- paymentTerms: Payment schedule or terms
- milestones: Project milestones (array of objects with name and date if available)

Document text:
"""
${documentText}
"""

Return JSON only:`;
};

/**
 * Extract data from a single document using Claude AI
 * @param {File} file - Document file to extract from
 * @param {Function} onProgress - Optional callback for progress updates
 * @returns {Promise<Object>} - Extracted data object
 */
export const extractDataFromDocument = async (file, onProgress = null) => {
  try {
    // Step 1: Extract text from document
    if (onProgress) onProgress({ status: 'parsing', progress: 25 });

    const rawText = await extractTextFromDocument(file);
    const cleanedText = cleanExtractedText(rawText);

    if (!cleanedText || cleanedText.length < 50) {
      throw new Error('Document contains insufficient text for extraction');
    }

    // Step 2: Call Claude AI for data extraction
    if (onProgress) onProgress({ status: 'extracting', progress: 50 });

    const prompt = generateExtractionPrompt(cleanedText, file.name);

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2048,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    // Step 3: Parse Claude's response
    if (onProgress) onProgress({ status: 'processing', progress: 75 });

    const responseText = message.content[0].text;

    // Extract JSON from response (handle cases where Claude adds text before/after JSON)
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to extract JSON from AI response');
    }

    const extractedData = JSON.parse(jsonMatch[0]);

    // Step 4: Return structured result
    if (onProgress) onProgress({ status: 'complete', progress: 100 });

    return {
      success: true,
      fileName: file.name,
      extractedData,
      metadata: {
        documentLength: cleanedText.length,
        extractedAt: new Date().toISOString(),
        model: 'claude-3-5-sonnet'
      }
    };

  } catch (error) {
    console.error('Document extraction error:', error);

    return {
      success: false,
      fileName: file.name,
      extractedData: null,
      error: error.message,
      metadata: {
        extractedAt: new Date().toISOString()
      }
    };
  }
};

/**
 * Extract data from multiple documents
 * @param {File[]} files - Array of document files
 * @param {Function} onProgressPerFile - Optional callback for per-file progress
 * @returns {Promise<Object[]>} - Array of extraction results
 */
export const extractDataFromMultipleDocuments = async (files, onProgressPerFile = null) => {
  const results = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];

    const progressCallback = onProgressPerFile
      ? (progress) => onProgressPerFile(i, progress)
      : null;

    const result = await extractDataFromDocument(file, progressCallback);
    results.push(result);
  }

  return results;
};

/**
 * Merge extracted data from multiple documents
 * Handles conflicts by preferring non-null values and combining arrays
 * @param {Object[]} extractionResults - Array of extraction results
 * @returns {Object} - Merged extracted data
 */
export const mergeExtractedData = (extractionResults) => {
  const merged = {
    projectName: null,
    clientName: null,
    clientCompany: null,
    budget: null,
    timeline: null,
    startDate: null,
    endDate: null,
    deliverables: [],
    scopeOfWork: null,
    objectives: [],
    keyStakeholders: [],
    paymentTerms: null,
    milestones: [],
    sources: [] // Track which document each field came from
  };

  const conflicts = {}; // Track conflicting values

  extractionResults.forEach(result => {
    if (!result.success || !result.extractedData) return;

    const data = result.extractedData;
    const source = result.fileName;

    // Merge simple fields (prefer non-null values)
    Object.keys(merged).forEach(key => {
      if (key === 'sources') return;

      const value = data[key];

      // Skip if value is null/undefined
      if (value === null || value === undefined) return;

      // Handle arrays (combine and deduplicate)
      if (Array.isArray(merged[key])) {
        if (Array.isArray(value)) {
          merged[key] = [...merged[key], ...value];
          // Deduplicate objects by stringifying
          merged[key] = merged[key].filter((item, index, self) =>
            index === self.findIndex(t => JSON.stringify(t) === JSON.stringify(item))
          );
        }
      }
      // Handle simple values
      else {
        if (merged[key] === null) {
          merged[key] = value;
          merged.sources.push({ field: key, source });
        } else if (merged[key] !== value) {
          // Track conflict
          if (!conflicts[key]) {
            conflicts[key] = [{ value: merged[key], source: merged.sources.find(s => s.field === key)?.source }];
          }
          conflicts[key].push({ value, source });
        }
      }
    });
  });

  return {
    mergedData: merged,
    conflicts,
    hasConflicts: Object.keys(conflicts).length > 0
  };
};

/**
 * Map extracted data to projectData structure
 * @param {Object} extractedData - Raw extracted data from AI
 * @returns {Object} - Formatted project data
 */
export const mapToProjectData = (extractedData) => {
  return {
    name: extractedData.projectName || '',
    clientName: extractedData.clientName || extractedData.clientCompany || '',
    budget: extractedData.budget || '',
    timeline: extractedData.timeline || '',
    startDate: extractedData.startDate || '',
    endDate: extractedData.endDate || '',
    deliverables: extractedData.deliverables || [],
    scope: extractedData.scopeOfWork || '',
    objectives: extractedData.objectives || [],
    stakeholders: extractedData.keyStakeholders || [],
    paymentTerms: extractedData.paymentTerms || '',
    milestones: extractedData.milestones || []
  };
};
