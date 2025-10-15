/**
 * Document Parser Utility
 * Converts PDF and DOCX files to plain text for AI processing
 *
 * NOTE: This is a browser-compatible mock version.
 * For production, use server-side PDF/DOCX parsing or browser-compatible libraries like:
 * - pdf.js (https://mozilla.github.io/pdf.js/)
 * - docx.js or docx-preview
 */

/**
 * Extract text from a PDF file
 * @param {File} file - PDF file to parse
 * @returns {Promise<string>} - Extracted text content
 */
export const extractTextFromPDF = async (file) => {
  try {
    // TODO: Replace with actual PDF parsing library (pdf.js)
    // For now, return mock data for UI testing
    console.warn('PDF parsing is mocked. Replace with pdf.js for production.');

    return `[Mock PDF Content from ${file.name}]

PROJECT AGREEMENT

Client: Acme Corporation
Project Name: Website Redesign Project
Budget: $50,000
Timeline: 3 months
Start Date: January 15, 2024

Project Scope:
- Design new website homepage
- Implement responsive layout
- Integrate content management system

Deliverables:
- Homepage design mockups
- Responsive HTML/CSS templates
- CMS integration and training

Contact: John Smith (john@acme.com)
Phone: (555) 123-4567`;
  } catch (error) {
    console.error('PDF parsing error:', error);
    throw new Error(`Failed to parse PDF: ${error.message}`);
  }
};

/**
 * Extract text from a DOCX file
 * @param {File} file - DOCX file to parse
 * @returns {Promise<string>} - Extracted text content
 */
export const extractTextFromDOCX = async (file) => {
  try {
    // TODO: Replace with actual DOCX parsing library (mammoth.js works in browser)
    // For now, return mock data for UI testing
    console.warn('DOCX parsing is mocked. Replace with mammoth.js for production.');

    return `[Mock DOCX Content from ${file.name}]

TECHNICAL SPECIFICATIONS

Project: Website Redesign
Client: Acme Corporation

Technical Requirements:
- React 18 frontend
- Node.js backend
- PostgreSQL database
- AWS hosting

Performance Requirements:
- Page load time < 2 seconds
- Mobile responsive
- Cross-browser compatible

Security Requirements:
- HTTPS encryption
- User authentication
- Data backup daily`;
  } catch (error) {
    console.error('DOCX parsing error:', error);
    throw new Error(`Failed to parse DOCX: ${error.message}`);
  }
};

/**
 * Extract text from a TXT file
 * @param {File} file - TXT file to parse
 * @returns {Promise<string>} - File content as text
 */
export const extractTextFromTXT = async (file) => {
  try {
    const text = await file.text();
    return text;
  } catch (error) {
    console.error('TXT reading error:', error);
    throw new Error(`Failed to read TXT file: ${error.message}`);
  }
};

/**
 * Auto-detect file type and extract text accordingly
 * @param {File} file - Document file (PDF, DOCX, or TXT)
 * @returns {Promise<string>} - Extracted text content
 */
export const extractTextFromDocument = async (file) => {
  const fileType = file.type;
  const fileName = file.name.toLowerCase();

  try {
    // Determine file type by MIME type or extension
    if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
      return await extractTextFromPDF(file);
    } else if (
      fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      fileType === 'application/msword' ||
      fileName.endsWith('.docx') ||
      fileName.endsWith('.doc')
    ) {
      return await extractTextFromDOCX(file);
    } else if (fileType === 'text/plain' || fileName.endsWith('.txt')) {
      return await extractTextFromTXT(file);
    } else {
      throw new Error(`Unsupported file type: ${fileType || fileName}`);
    }
  } catch (error) {
    console.error('Document parsing error:', error);
    throw error;
  }
};

/**
 * Extract text from multiple documents
 * @param {File[]} files - Array of document files
 * @returns {Promise<Object[]>} - Array of objects with filename and extracted text
 */
export const extractTextFromMultipleDocuments = async (files) => {
  const results = [];

  for (const file of files) {
    try {
      const text = await extractTextFromDocument(file);
      results.push({
        fileName: file.name,
        fileType: file.type,
        text,
        success: true
      });
    } catch (error) {
      results.push({
        fileName: file.name,
        fileType: file.type,
        text: '',
        success: false,
        error: error.message
      });
    }
  }

  return results;
};

/**
 * Clean and normalize extracted text
 * @param {string} text - Raw extracted text
 * @returns {string} - Cleaned text
 */
export const cleanExtractedText = (text) => {
  if (!text) return '';

  return text
    // Remove excessive whitespace
    .replace(/\s+/g, ' ')
    // Remove multiple newlines
    .replace(/\n{3,}/g, '\n\n')
    // Trim
    .trim();
};
