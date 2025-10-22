/**
 * Document Parser Utility
 * Converts PDF and DOCX files to plain text for AI processing
 */

/**
 * Extract text from a PDF file (MOCKED for development)
 * @param {File} _file - PDF file to parse (currently unused in mock)
 * @returns {Promise<string>} - Extracted text content
 */
// eslint-disable-next-line no-unused-vars
export const extractTextFromPDF = async (_file) => {
  try {
    // TODO: Replace with actual PDF parsing library (pdf.js works in browser)
    // For now, return mock data for UI testing
    console.warn('PDF parsing is mocked. Replace with pdf.js for production.');

    // Simulate async processing
    await new Promise(resolve => setTimeout(resolve, 100));

    return `# STATEMENT OF WORK

## IT Server Infrastructure Analysis Services

**Between:**

**TechConsult Solutions, LLC** ("Consultant")
123 Technology Drive
San Francisco, CA 94105

**And:**

**Academy Corp** ("Client")
456 Business Plaza
New York, NY 10001

**Effective Date:** November 1, 2025
**Project Duration:** Two (2) months
**Total Project Value:** $100,000.00

---

## 1. PROJECT OVERVIEW

Consultant agrees to provide comprehensive IT server infrastructure analysis services to Academy Corp.
The engagement will focus on identifying, documenting, and analyzing current issues affecting
the Client's server infrastructure, including performance bottlenecks, security vulnerabilities,
capacity constraints, and operational inefficiencies.

## 2. SCOPE OF SERVICES

### 2.1 Server Infrastructure Assessment
- Conduct complete inventory of all physical and virtual servers
- Document server configurations, specifications, and current utilization
- Assess server hardware age, warranty status, and end-of-life considerations
- Review virtualization environment and resource allocation

### 2.2 Performance Analysis
- Monitor and analyze server performance metrics including CPU, memory, disk I/O, and network utilization
- Identify performance bottlenecks and resource constraints
- Evaluate application response times and server load patterns
- Review backup and disaster recovery performance

### 2.3 Security Assessment
- Review server security configurations and patch management status
- Identify security vulnerabilities and compliance gaps
- Assess access controls and authentication mechanisms
- Evaluate firewall rules and network segmentation

### 2.4 Capacity Planning Review
- Analyze current capacity utilization and growth trends
- Project future capacity requirements based on business needs
- Identify opportunities for consolidation or expansion
- Review storage capacity and data growth patterns

### 2.5 Operational Analysis
- Review current IT operations procedures and documentation
- Assess monitoring and alerting systems
- Evaluate incident management and response processes
- Identify automation opportunities

### 2.6 Deliverables
- **Week 2:** Initial Assessment Report with preliminary findings
- **Week 4:** Interim Progress Report with detailed technical analysis
- **Week 6:** Draft Final Report for Client review
- **Week 8:** Final Comprehensive Report including:
  - Executive Summary
  - Detailed findings and analysis
  - Risk assessment matrix
  - Prioritized recommendations
  - Implementation roadmap
  - Cost-benefit analysis
- **Week 8:** Final presentation to Client stakeholders

## 3. CLIENT RESPONSIBILITIES

Client agrees to:
- Provide Consultant with necessary access to server infrastructure, documentation, and monitoring tools
- Assign a primary point of contact for project coordination
- Make key IT personnel available for interviews and discussions
- Provide workspace and network access as needed
- Review and provide feedback on interim deliverables within five (5) business days

## 4. PROJECT TIMELINE

**Start Date:** November 1, 2025
**End Date:** December 31, 2025
**Total Duration:** 8 weeks

## 5. COMPENSATION AND PAYMENT TERMS

**Total Project Fee:** $100,000.00

**Payment Schedule:**
- **Payment 1:** $40,000.00 upon execution of this SOW
- **Payment 2:** $30,000.00 upon delivery of Interim Progress Report (Week 4)
- **Payment 3:** $30,000.00 upon delivery of Final Report (Week 8)

Payments are due within fifteen (15) days of invoice date. Late payments will incur interest at 1.5% per month.

## 6. ASSUMPTIONS AND CONSTRAINTS

- Client maintains fewer than 200 physical and virtual servers
- Consultant will have full administrative access to necessary systems
- Analysis will be conducted during normal business hours unless otherwise agreed
- Client IT staff will be available for scheduled interviews and meetings
- No hands-on remediation work is included in this scope

## 7. OUT OF SCOPE

The following items are explicitly excluded from this engagement:
- Implementation of recommendations
- Hardware or software procurement
- Server migrations or upgrades
- Ongoing managed services
- Training services
- Third-party vendor management

## 8. CONFIDENTIALITY

Both parties agree to maintain confidentiality of all proprietary and sensitive information exchanged during this engagement in accordance with the Master Services Agreement dated October 15, 2025.

## 9. ACCEPTANCE

This Statement of Work is governed by the terms and conditions of the Master Services Agreement between the parties dated October 15, 2025.

---

**ACCEPTED AND AGREED:**

**TechConsult Solutions, LLC**

Signature: ________________________

Name: Sarah Mitchell
Title: Managing Partner
Date: ___________________

**Academy Corp**

Signature: ________________________

Name: Robert Chen
Title: Chief Information Officer
Date: ___________________`;
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

    // Test if file.arrayBuffer throws an error (for testing error handling)
    if (file.arrayBuffer) {
      await file.arrayBuffer();
    }

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
