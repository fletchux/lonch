# Task List: Upload Contracts & Specs

_Generated from: 0001-prd-upload-contracts-and-specs.md_

## Current State Assessment

**Existing Architecture:**
- React app with state management in App.jsx
- Multi-step wizard (Wizard.jsx) with 5 steps currently
- Project data stored in state with templates
- Component structure: pages/, icons/, data/
- Tailwind CSS for styling
- Vitest + React Testing Library for testing

**Key Insights:**
- Wizard currently has 5 steps (Project Basics → 4 template selections)
- Need to insert document upload as new Step 1, shifting existing steps
- projectData state needs extension for documents and extracted data
- No existing file upload or API integration infrastructure

## Relevant Files

### New Files to Create
- `src/components/DocumentUpload.jsx` - Main document upload component with drag-and-drop UI
- `src/components/DocumentUpload.test.jsx` - Unit tests for DocumentUpload component
- `src/components/DocumentList.jsx` - Document list/management component for dashboard
- `src/components/DocumentList.test.jsx` - Unit tests for DocumentList component
- `src/components/ExtractionIndicator.jsx` - Visual indicator for auto-populated fields
- `src/components/ExtractionIndicator.test.jsx` - Unit tests for ExtractionIndicator component
- `src/services/fileStorage.js` - File upload/download service (cloud storage integration)
- `src/services/fileStorage.test.js` - Unit tests for file storage service
- `src/services/documentExtraction.js` - AI/LLM-based data extraction service
- `src/services/documentExtraction.test.js` - Unit tests for document extraction service
- `src/utils/fileValidation.js` - File type and size validation utilities
- `src/utils/fileValidation.test.js` - Unit tests for file validation utilities
- `src/utils/documentParser.js` - PDF/DOCX to text conversion utilities
- `src/utils/documentParser.test.js` - Unit tests for document parser
- `src/components/admin/ExtractionLogs.jsx` - Admin interface for viewing extraction logs
- `src/components/admin/ExtractionLogs.test.jsx` - Unit tests for ExtractionLogs component

### Existing Files to Modify
- `src/App.jsx` - Extend projectData state to include documents and extracted data
- `src/App.test.jsx` - Update tests for new state structure
- `src/components/pages/Wizard.jsx` - Insert new Step 1 for document upload, shift existing steps 2-6
- `src/components/pages/ProjectDashboard.jsx` - Add document management section
- `package.json` - Add dependencies for file upload, PDF parsing, AI SDK

### Notes
- Tests should be placed alongside their corresponding source files
- Use `npm test` to run all tests, or `npm test [filename]` for specific test files
- Follow existing Tailwind CSS patterns for styling consistency
- Use brand colors: Teal `#2D9B9B` for accents, Gold `#DBA507` for highlights

## Tasks

- [x] 1.0 Set up file upload infrastructure and document storage
  - [x] 1.1 Research and select cloud storage solution (Firebase Storage, AWS S3, or Supabase Storage)
  - [x] 1.2 Install required dependencies (storage SDK, file upload library)
  - [x] 1.3 Configure storage service credentials and initialization
  - [x] 1.4 Create `src/services/fileStorage.js` with upload, download, delete, and list functions
  - [x] 1.5 Implement file naming convention (project-id/category/filename-timestamp)
  - [x] 1.6 Add error handling and retry logic for upload failures
  - [x] 1.7 Write unit tests for fileStorage service

- [ ] 2.0 Create document upload UI component for wizard Step 1
  - [x] 2.1 Create `src/components/DocumentUpload.jsx` with drag-and-drop zone
  - [x] 2.2 Implement "Choose Files" button as alternative to drag-and-drop
  - [x] 2.3 Add category selection dropdown (Contract, Specifications, Other Documents)
  - [x] 2.4 Create `src/utils/fileValidation.js` to validate file types (PDF, DOCX, TXT)
  - [x] 2.5 Display upload progress indicators for each file
  - [x] 2.6 Show file list with name, size, category, and remove option before upload
  - [x] 2.7 Implement batch upload functionality (multiple files simultaneously)
  - [x] 2.8 Add clear error messages for invalid file types
  - [x] 2.9 Style component with Tailwind CSS matching brand guidelines
  - [x] 2.10 Update `src/components/pages/Wizard.jsx` to insert DocumentUpload as new Step 1
  - [x] 2.11 Shift existing wizard steps from 1-5 to 2-6 (update step validation logic)
  - [x] 2.12 Update progress indicator to show "Step X of 6" instead of "Step X of 5"
  - [x] 2.13 Write unit tests for DocumentUpload component

- [ ] 3.0 Implement AI-powered data extraction system
  - [ ] 3.1 Research and select LLM provider (OpenAI GPT-4, Claude API, or other)
  - [ ] 3.2 Install required dependencies (AI SDK, PDF parser, DOCX parser)
  - [ ] 3.3 Create `src/utils/documentParser.js` to convert PDF/DOCX files to text
  - [ ] 3.4 Implement PDF text extraction using library like `pdf-parse` or `pdfjs-dist`
  - [ ] 3.5 Implement DOCX text extraction using library like `mammoth` or `docx`
  - [ ] 3.6 Create `src/services/documentExtraction.js` with extraction function
  - [ ] 3.7 Design structured LLM prompt to extract specific fields (project name, client, budget, timeline, deliverables, scope, contacts, payment terms, objectives)
  - [ ] 3.8 Implement LLM API call with prompt and document text
  - [ ] 3.9 Parse LLM response (JSON format) and map to projectData fields
  - [ ] 3.10 Handle extraction for multiple documents and merge results
  - [ ] 3.11 Implement conflict resolution logic when multiple docs have different values for same field
  - [ ] 3.12 Add graceful error handling for extraction failures (return partial results or empty)
  - [ ] 3.13 Implement background/async processing so extraction doesn't block UI
  - [ ] 3.14 Add extraction status tracking (pending, processing, completed, failed)
  - [ ] 3.15 Store extraction results in projectData state with metadata (source document, confidence)
  - [ ] 3.16 Write unit tests for documentParser and documentExtraction services

- [ ] 4.0 Integrate extracted data with wizard field pre-population
  - [ ] 4.1 Extend `projectData` state in `src/App.jsx` to include `extractedData` and `documents` arrays
  - [ ] 4.2 Create `src/components/ExtractionIndicator.jsx` component (icon/badge for auto-filled fields)
  - [ ] 4.3 Update Wizard Step 2 (Project Basics) to check for extracted data and pre-populate fields
  - [ ] 4.4 Add ExtractionIndicator to fields that were auto-populated
  - [ ] 4.5 Implement tooltip on indicator: "This data was extracted from your uploaded documents"
  - [ ] 4.6 Ensure fields remain editable even when pre-populated
  - [ ] 4.7 Preserve manually edited data (don't override user changes)
  - [ ] 4.8 Implement conflict resolution UI (modal or inline) when multiple docs have conflicting data
  - [ ] 4.9 Add "Retry Extraction" button in DocumentUpload component for failed extractions
  - [ ] 4.10 Show extraction status indicators (processing spinner, success checkmark, error icon)
  - [ ] 4.11 Handle partially successful extractions gracefully (populate found fields, leave others empty)
  - [ ] 4.12 Update `src/App.test.jsx` to test new state structure
  - [ ] 4.13 Write unit tests for ExtractionIndicator component

- [ ] 5.0 Build document management interface for project dashboard
  - [ ] 5.1 Create `src/components/DocumentList.jsx` for displaying uploaded documents
  - [ ] 5.2 Implement table/list view with columns: File Name, Category, Date, Size, Uploaded By
  - [ ] 5.3 Add download button/link for each document
  - [ ] 5.4 Implement delete functionality with confirmation modal
  - [ ] 5.5 Add "Upload New Document" button (reuses DocumentUpload component)
  - [ ] 5.6 Implement category filter dropdown (All, Contracts, Specifications, Other)
  - [ ] 5.7 Display empty state message when no documents exist
  - [ ] 5.8 Style component with Tailwind CSS and brand colors (gold accent for upload button)
  - [ ] 5.9 Update `src/components/pages/ProjectDashboard.jsx` to include DocumentList section
  - [ ] 5.10 Ensure document access is restricted to project stakeholders only
  - [ ] 5.11 Write unit tests for DocumentList component

- [ ] 6.0 Add admin extraction logs and monitoring capabilities
  - [ ] 6.1 Create `src/components/admin/ExtractionLogs.jsx` admin component
  - [ ] 6.2 Design data structure for extraction logs (document name, timestamp, extracted fields, raw LLM response, success/failure status)
  - [ ] 6.3 Store extraction logs in projectData or separate admin data store
  - [ ] 6.4 Display log entries in table format with filters (date range, status, project)
  - [ ] 6.5 Show extracted fields and values for each log entry
  - [ ] 6.6 Include raw LLM response for troubleshooting
  - [ ] 6.7 Add search functionality to find specific extractions
  - [ ] 6.8 Implement admin access control (only show to admin users)
  - [ ] 6.9 Write unit tests for ExtractionLogs component

- [ ] 7.0 Implement comprehensive testing and validation
  - [ ] 7.1 Write integration tests for end-to-end upload flow (upload → extract → populate)
  - [ ] 7.2 Test file validation (reject unsupported formats, show errors)
  - [ ] 7.3 Test batch upload with multiple files
  - [ ] 7.4 Test extraction with various document formats and structures
  - [ ] 7.5 Test conflict resolution when multiple documents have different data
  - [ ] 7.6 Test wizard navigation with new Step 1 (6 steps total)
  - [ ] 7.7 Test document management (download, delete, filter)
  - [ ] 7.8 Test admin extraction logs interface
  - [ ] 7.9 Test retry extraction functionality
  - [ ] 7.10 Test partial extraction scenarios (some fields found, others missing)
  - [ ] 7.11 Perform accessibility testing (keyboard navigation, screen readers)
  - [ ] 7.12 Run full test suite and ensure all tests pass: `npm test`
  - [ ] 7.13 Manually test with real contract and specification documents
  - [ ] 7.14 Verify 50% extraction accuracy threshold is met
