# PRD: Upload Contracts & Specs

## Introduction/Overview

This feature enables users (both consultants and clients) to upload project documents (contracts, specifications, and other relevant files) into the lonch platform. The uploaded documents serve multiple purposes: storing important project files for reference, and intelligently extracting key project data to auto-populate wizard fields, making project setup faster and more accurate. This addresses the problem of manual data entry during project kickoff by leveraging existing documentation.

## Goals

1. Allow users to upload contracts, specifications, and other document files in common formats (PDF, DOCX, TXT)
2. Implement AI-powered data extraction to automatically populate project setup fields from uploaded documents
3. Provide a seamless upload experience as the first step in the project wizard
4. Enable document management (upload, view, delete, replace) from both the wizard and project dashboard
5. Organize uploaded files by predefined categories (Contracts, Specifications, Other Documents)
6. Reduce manual data entry time by 50%+ through intelligent auto-population

## User Stories

1. **As a consultant**, I want to upload a client contract at the start of project setup, so that key project details (budget, timeline, deliverables) are automatically extracted and I don't have to manually type them.

2. **As a client**, I want to upload my technical specifications document during onboarding, so that my requirements are captured and pre-filled in the project wizard for me to review.

3. **As a project stakeholder**, I want to upload multiple documents at once (contract + specs + other files), so that I can quickly get all project documentation into the system.

4. **As a user**, I want to see which wizard fields were auto-populated from my uploads with the ability to accept or correct the data, so that I maintain control over the accuracy of my project information.

5. **As a consultant**, I want to access and manage uploaded documents from the project dashboard after setup, so that I can add additional files or update existing ones as the project evolves.

6. **As a user**, I want my uploaded files organized by category (Contracts, Specifications, Other), so that I can quickly find the document I need.

## Functional Requirements

### Upload Functionality

1. The system must provide a document upload interface as the **first step** in the project setup wizard
2. The system must support uploading multiple files simultaneously (batch upload)
3. The system must accept the following file formats: PDF, DOCX, TXT
4. The system must allow users to categorize uploads as "Contract", "Specifications", or "Other Documents" during upload
5. The system must display upload progress indicators for each file
6. The system must validate file types and reject unsupported formats with clear error messages
7. The system must provide a document upload/management interface on the project dashboard (post-wizard)

### AI Data Extraction

8. The system must use AI/LLM-based extraction to parse uploaded documents for relevant project data
9. The system must extract data from both contracts AND specifications documents
10. The system must identify and extract the following fields when present:
    - Project name
    - Client name/company
    - Project budget/cost
    - Timeline/deadlines/milestones
    - Deliverables
    - Scope of work
    - Key stakeholders/contacts
    - Payment terms
    - Project objectives/goals
11. The system must process extraction in the background and notify when complete
12. The system must handle extraction failures gracefully (e.g., if document format is unclear or data not found)

### Wizard Integration

13. After document upload and extraction, the system must pre-populate wizard fields with extracted data as users progress through the wizard steps
14. The system must visually indicate which fields were auto-populated from document extraction (e.g., subtle highlight, icon, or label)
15. The system must allow users to accept pre-populated data as-is or edit/correct it at each wizard step
16. If extraction finds conflicting data between multiple documents, the system must prompt the user to select which value to use or enter their own
17. The system must preserve manually entered data if a user chooses to override auto-populated values

### Document Management

18. The system must display all uploaded documents in a list view showing:
    - File name
    - Category
    - Upload date
    - File size
    - Uploaded by (user name)
19. The system must allow users to download any uploaded document
20. The system must allow users to delete uploaded documents (with confirmation)
21. The system must allow users to replace/update existing documents
22. The system must support uploading additional documents from the project dashboard at any time

### Access & Security

23. The system must make uploaded documents visible to all project stakeholders (consultant and client)
24. The system must restrict document access to only users associated with the specific project
25. The system must implement basic security measures (authentication required, HTTPS)

## Non-Goals (Out of Scope)

1. Document versioning/revision history (future consideration)
2. Real-time collaborative document editing
3. Document preview/rendering within the application (initial MVP will offer download only)
4. Advanced security features (encryption at rest, DLP, etc.) beyond basic project-level access control
5. Email notifications when documents are uploaded
6. Custom user-created categories (locked to predefined: Contract, Specifications, Other)
7. OCR for scanned/image-based documents (assumes text-based PDFs/docs)
8. Integration with external document storage (Google Drive, Dropbox, etc.)
9. File size limits (to be determined based on hosting/storage constraints)

## Design Considerations

### Upload UI (Wizard - Step 1)
- Drag-and-drop upload area with prominent visual design
- "Choose Files" button as alternative to drag-and-drop
- Category selection dropdown for each file
- Clear file format requirements displayed
- Upload progress bars for each file
- Success/error states clearly communicated

### Wizard Field Population
- Auto-populated fields should have a subtle visual indicator (e.g., small icon or light background tint in brand teal `#2D9B9B`)
- Tooltip on indicator explaining "This data was extracted from your uploaded documents"
- Fields remain fully editable
- If conflicting data exists, show a modal/inline choice selector

### Document Management (Dashboard)
- Simple table/list view with columns: File Name, Category, Date, Size, Uploaded By, Actions (Download, Delete)
- Filter by category
- "Upload New Document" button consistent with brand gold accent `#DBA507`
- Delete confirmation modal

## Technical Considerations

1. **File Storage**: Implement cloud storage solution (e.g., AWS S3, Firebase Storage) for uploaded documents
2. **AI Integration**: Use LLM API (e.g., OpenAI GPT-4, Claude) for document parsing and data extraction
3. **Extraction Pipeline**:
   - Convert documents to text (PDF parsing library for PDFs, docx parser for Word docs)
   - Send text to LLM with structured prompt requesting specific fields
   - Parse LLM response (JSON format) and map to wizard fields
4. **Performance**: Document extraction should run asynchronously (background job) to avoid blocking wizard UI
5. **Data Validation**: Implement validation on extracted data (e.g., date format validation, budget as number)
6. **Error Handling**: Graceful fallback if extraction fails - wizard continues with empty fields for manual entry
7. **State Management**: Store extracted data in project state/context to persist across wizard steps

## Success Metrics

1. **Time Savings**: Reduce average project setup time by 50% (measured by wizard completion time)
2. **Adoption Rate**: 70%+ of users upload at least one document during project setup
3. **Data Accuracy**: 80%+ of auto-populated fields are accepted without modification (indicating good extraction quality)
4. **User Satisfaction**: Positive feedback in post-setup survey regarding upload and auto-population feature
5. **Document Usage**: Average of 2+ documents uploaded per project within first week

## Decisions Made on Open Questions

1. **Maximum file size per upload**: TBD - will be determined based on hosting constraints during implementation
2. **Total storage limit per project**: TBD - will be determined based on cost analysis during implementation
3. **Retry mechanism for failed extraction**: YES - provide a "Retry Extraction" button/option for users to manually trigger re-extraction if initial attempt fails
4. **Document deletion policy**: Documents will be deleted immediately when a project is deleted (no retention period)
5. **Admin extraction logs**: YES - admins must have ability to view extraction results/logs for troubleshooting and quality assurance
6. **Partial extraction handling**: Allow partial extractions - any successfully extracted fields should be populated; users can fill in the rest manually
7. **MVP extraction accuracy threshold**: 50% field extraction accuracy is acceptable for launch
