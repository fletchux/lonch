# Document Parsing Implementation Guide

**Status:** 🔴 Not Started (Mock Implementation Active)
**Priority:** High (Required for Production)
**Estimated Effort:** 2-3 days
**Created:** 2025-10-31

---

## Overview

The `documentParser.ts` utility currently uses **mock implementations** for PDF and DOCX parsing. This document outlines the tasks needed to implement real document parsing using industry-standard libraries.

**Current State:**
- ✅ TXT files: Real implementation (works)
- ⚠️ PDF files: Mocked (returns hardcoded SOW text)
- ⚠️ DOCX files: Mocked (returns hardcoded specs text)

**Target State:**
- ✅ All file types parsed with real content
- ✅ Browser-compatible parsing (no backend required)
- ✅ Error handling and fallbacks
- ✅ Performance optimization for large files

---

## Task Breakdown

### Task 1: Install PDF Parsing Library (pdf.js)

**Recommended Library:** [PDF.js](https://mozilla.github.io/pdf.js/) (Mozilla's official PDF parser)

#### 1.1 Install Dependencies
```bash
npm install pdfjs-dist
```

#### 1.2 Configure Vite for pdf.js Worker
Add to `vite.config.ts`:
```typescript
import { defineConfig } from 'vite'

export default defineConfig({
  // ... existing config
  optimizeDeps: {
    include: ['pdfjs-dist']
  },
  resolve: {
    alias: {
      'pdfjs-dist/build/pdf.worker.entry': 'pdfjs-dist/build/pdf.worker.mjs'
    }
  }
})
```

#### 1.3 Implement PDF Parsing
Replace the mock `extractTextFromPDF` function in `src/utils/documentParser.ts`:

```typescript
import * as pdfjsLib from 'pdfjs-dist';

// Configure worker
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.mjs',
  import.meta.url
).toString();

export const extractTextFromPDF = async (file: File): Promise<string> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    let fullText = '';

    // Extract text from each page
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');

      fullText += pageText + '\n\n';
    }

    return fullText.trim();
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('PDF parsing error:', error);
    throw new Error(`Failed to parse PDF: ${message}`);
  }
};
```

#### 1.4 Testing Checklist
- [ ] Upload a real PDF file with text content
- [ ] Verify extracted text matches PDF content
- [ ] Test with multi-page PDFs (5+ pages)
- [ ] Test with scanned PDFs (should fail gracefully - no OCR)
- [ ] Test with password-protected PDFs (should error gracefully)
- [ ] Test file size limits (recommend 10MB max)
- [ ] Verify performance (large PDFs should show loading state)

---

### Task 2: Install DOCX Parsing Library (mammoth.js)

**Recommended Library:** [Mammoth.js](https://github.com/mwilliamson/mammoth.js) (Converts DOCX to HTML/text)

#### 2.1 Install Dependencies
```bash
npm install mammoth
```

#### 2.2 Implement DOCX Parsing
Replace the mock `extractTextFromDOCX` function in `src/utils/documentParser.ts`:

```typescript
import mammoth from 'mammoth';

export const extractTextFromDOCX = async (file: File): Promise<string> => {
  try {
    const arrayBuffer = await file.arrayBuffer();

    // Extract plain text (alternative: use .convertToHtml for styled content)
    const result = await mammoth.extractRawText({ arrayBuffer });

    if (result.messages.length > 0) {
      console.warn('DOCX parsing warnings:', result.messages);
    }

    return result.value.trim();
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('DOCX parsing error:', error);
    throw new Error(`Failed to parse DOCX: ${message}`);
  }
};
```

#### 2.3 Alternative: Extract HTML (for rich text display)
If you want to preserve formatting:
```typescript
const result = await mammoth.convertToHtml({ arrayBuffer });
const htmlText = result.value; // HTML string with formatting
```

#### 2.4 Testing Checklist
- [ ] Upload a real DOCX file
- [ ] Verify extracted text matches document content
- [ ] Test with complex DOCX (tables, images, headers)
- [ ] Test with .doc files (older format - may need conversion)
- [ ] Test with large DOCX files (20+ pages)
- [ ] Verify special characters and formatting preserved
- [ ] Test file size limits (recommend 10MB max)

---

### Task 3: Performance Optimizations

#### 3.1 Add Progress Indicators
For large files, show parsing progress:

```typescript
export const extractTextFromPDF = async (
  file: File,
  onProgress?: (progress: number) => void
): Promise<string> => {
  // ... existing code

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map((item: any) => item.str).join(' ');

    fullText += pageText + '\n\n';

    // Report progress
    if (onProgress) {
      onProgress((pageNum / pdf.numPages) * 100);
    }
  }

  return fullText.trim();
};
```

#### 3.2 Implement File Size Limits
Add validation before parsing:

```typescript
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const extractTextFromDocument = async (file: File): Promise<string> => {
  // Check file size first
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File size exceeds maximum limit of ${MAX_FILE_SIZE / 1024 / 1024}MB`);
  }

  // ... rest of implementation
};
```

#### 3.3 Add Timeout Handling
Prevent hung parsing operations:

```typescript
const PARSING_TIMEOUT = 30000; // 30 seconds

export const extractTextFromPDF = async (file: File): Promise<string> => {
  return Promise.race([
    actualParsing(file),
    new Promise<string>((_, reject) =>
      setTimeout(() => reject(new Error('Parsing timeout')), PARSING_TIMEOUT)
    )
  ]);
};
```

---

### Task 4: Error Handling & User Feedback

#### 4.1 Specific Error Types
Create custom error types for better UX:

```typescript
export class ParseError extends Error {
  constructor(
    message: string,
    public fileType: string,
    public fileName: string,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'ParseError';
  }
}

export class FileSizeError extends ParseError {
  constructor(fileName: string, size: number, maxSize: number) {
    super(
      `File "${fileName}" (${(size / 1024 / 1024).toFixed(2)}MB) exceeds maximum size of ${maxSize / 1024 / 1024}MB`,
      'size-limit',
      fileName
    );
    this.name = 'FileSizeError';
  }
}

export class UnsupportedFileError extends ParseError {
  constructor(fileName: string, fileType: string) {
    super(
      `File type "${fileType}" is not supported for parsing`,
      fileType,
      fileName
    );
    this.name = 'UnsupportedFileError';
  }
}
```

#### 4.2 User-Friendly Error Messages
Map technical errors to user-friendly messages:

```typescript
export function getErrorMessage(error: Error): string {
  if (error instanceof FileSizeError) {
    return 'This file is too large to process. Please upload a smaller file.';
  }

  if (error instanceof UnsupportedFileError) {
    return 'This file type is not supported. Please upload a PDF, DOCX, or TXT file.';
  }

  if (error.message.includes('password')) {
    return 'This file is password-protected and cannot be processed.';
  }

  if (error.message.includes('timeout')) {
    return 'The file took too long to process. Please try a smaller file.';
  }

  return 'An error occurred while processing the file. Please try again.';
}
```

---

### Task 5: Testing & Validation

#### 5.1 Unit Tests
Update existing tests in `src/utils/documentParser.test.js`:

```typescript
describe('documentParser (Real Implementation)', () => {
  it('should extract text from real PDF files', async () => {
    // Create a test PDF blob
    const pdfBlob = await createTestPDF();
    const file = new File([pdfBlob], 'test.pdf', { type: 'application/pdf' });

    const text = await extractTextFromPDF(file);

    expect(text).toBeTruthy();
    expect(text.length).toBeGreaterThan(0);
  });

  it('should extract text from real DOCX files', async () => {
    const docxBlob = await createTestDOCX();
    const file = new File([docxBlob], 'test.docx', {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    });

    const text = await extractTextFromDOCX(file);

    expect(text).toBeTruthy();
    expect(text.length).toBeGreaterThan(0);
  });

  it('should handle file size limits', async () => {
    const largeFile = createLargeFile(15 * 1024 * 1024); // 15MB

    await expect(extractTextFromDocument(largeFile))
      .rejects
      .toThrow('File size exceeds maximum limit');
  });

  it('should handle parsing timeouts', async () => {
    const corruptedFile = createCorruptedPDF();

    await expect(extractTextFromPDF(corruptedFile))
      .rejects
      .toThrow('Parsing timeout');
  });
});
```

#### 5.2 Manual Testing Checklist
Create test files in `lonch-app/test-files/`:
- [ ] `sample.pdf` - Simple 1-page PDF with text
- [ ] `multi-page.pdf` - 10+ page PDF
- [ ] `complex.docx` - DOCX with tables, images, headers
- [ ] `large.pdf` - 8-9MB file (near limit)
- [ ] `scanned.pdf` - Scanned image PDF (should fail gracefully)
- [ ] `special-chars.txt` - Text with unicode, emojis, special symbols

#### 5.3 Integration Testing
Test the full flow:
1. Upload document in UI
2. Verify extraction indicator shows
3. Check extracted text appears correctly
4. Test AI processing with real extracted content
5. Verify error states show appropriate messages

---

### Task 6: Documentation & Cleanup

#### 6.1 Update Code Comments
- [ ] Remove "MOCKED" warnings from `documentParser.ts`
- [ ] Update JSDoc comments with real implementation details
- [ ] Document any library-specific quirks or limitations

#### 6.2 Update User Documentation
Add to project docs:
- Supported file types and size limits
- Expected parsing times for different file sizes
- Known limitations (e.g., no OCR for scanned PDFs)
- Troubleshooting common errors

#### 6.3 Remove Mock Data
- [ ] Delete hardcoded SOW text from `extractTextFromPDF`
- [ ] Delete hardcoded specs text from `extractTextFromDOCX`
- [ ] Update related tests to use real files

---

## Implementation Order

**Recommended sequence:**

1. **Phase 1: PDF Parsing** (Day 1)
   - Install pdf.js
   - Implement basic PDF extraction
   - Test with sample PDFs
   - Add error handling

2. **Phase 2: DOCX Parsing** (Day 1-2)
   - Install mammoth.js
   - Implement DOCX extraction
   - Test with sample DOCX files
   - Add error handling

3. **Phase 3: Optimization** (Day 2)
   - Add file size limits
   - Implement progress indicators
   - Add timeout handling
   - Performance testing

4. **Phase 4: Polish** (Day 3)
   - Comprehensive testing
   - Error message improvements
   - Documentation updates
   - Remove mock implementations

---

## Dependencies

### NPM Packages to Install
```json
{
  "dependencies": {
    "pdfjs-dist": "^4.0.0",
    "mammoth": "^1.6.0"
  },
  "devDependencies": {
    "@types/pdfjs-dist": "^2.10.0"
  }
}
```

### Vite Configuration Updates
```typescript
// vite.config.ts
export default defineConfig({
  optimizeDeps: {
    include: ['pdfjs-dist', 'mammoth']
  },
  resolve: {
    alias: {
      'pdfjs-dist/build/pdf.worker.entry': 'pdfjs-dist/build/pdf.worker.mjs'
    }
  }
})
```

---

## Known Limitations & Future Enhancements

### Current Limitations
- **No OCR:** Scanned PDFs (images) won't extract text
- **No Encryption:** Password-protected files not supported
- **Browser-Only:** Parsing happens in browser (may be slow for large files)
- **Limited Formats:** Only PDF, DOCX, TXT supported

### Future Enhancements
- [ ] Add OCR support (Tesseract.js) for scanned documents
- [ ] Support more formats (RTF, ODT, Pages)
- [ ] Add backend parsing option for very large files
- [ ] Implement caching for frequently uploaded documents
- [ ] Add document preview before extraction
- [ ] Support batch upload with parallel parsing

---

## Success Criteria

**Definition of Done:**
- ✅ Real PDF text extraction working
- ✅ Real DOCX text extraction working
- ✅ All tests passing (no mock data)
- ✅ File size limits enforced
- ✅ Error handling comprehensive
- ✅ User feedback clear and helpful
- ✅ Performance acceptable (<5s for typical docs)
- ✅ Documentation updated
- ✅ Code reviewed and merged

---

## References

- [PDF.js Documentation](https://mozilla.github.io/pdf.js/)
- [Mammoth.js Documentation](https://github.com/mwilliamson/mammoth.js)
- [Vite Configuration Guide](https://vitejs.dev/config/)
- [File API MDN Documentation](https://developer.mozilla.org/en-US/docs/Web/API/File)

---

**Last Updated:** 2025-10-31
**Next Review:** When ready to implement (after TypeScript migration complete)
