/**
 * Document validation schemas using Zod
 */

import { z } from 'zod';

/**
 * Document category validation
 */
export const documentCategorySchema = z.enum(
  ['intake', 'checklist', 'stakeholder', 'team', 'other'],
  {
    errorMap: () => ({ message: 'Invalid document category' }),
  }
);

export type DocumentCategory = z.infer<typeof documentCategorySchema>;

/**
 * Document visibility validation
 */
export const documentVisibilitySchema = z.enum(['consulting', 'client', 'both'], {
  errorMap: () => ({ message: 'Invalid document visibility' }),
});

export type DocumentVisibility = z.infer<typeof documentVisibilitySchema>;

/**
 * File size validation (max 10MB)
 */
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes

/**
 * Allowed file types
 */
const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
  'application/msword', // .doc
  'text/plain', // .txt
];

/**
 * File upload validation schema
 */
export const fileUploadSchema = z.object({
  file: z
    .instanceof(File)
    .refine((file) => file.size <= MAX_FILE_SIZE, {
      message: 'File size must be less than 10MB',
    })
    .refine((file) => ALLOWED_FILE_TYPES.includes(file.type), {
      message: 'File type must be PDF, DOCX, DOC, or TXT',
    }),
  category: documentCategorySchema,
  visibility: documentVisibilitySchema.default('both'),
});

export type FileUploadData = z.infer<typeof fileUploadSchema>;

/**
 * Document metadata validation
 */
export const documentMetadataSchema = z.object({
  id: z.string().min(1, 'Document ID is required'),
  name: z
    .string()
    .min(1, 'Document name is required')
    .max(255, 'Document name must be less than 255 characters'),
  category: documentCategorySchema,
  size: z.number().int().positive('File size must be positive'),
  uploadedAt: z.union([z.string(), z.date()]),
  uploadedBy: z.string().min(1, 'Uploader information is required'),
  visibility: documentVisibilitySchema,
  downloadURL: z.string().url().optional(),
  storagePath: z.string().optional(),
  fileName: z.string().optional(),
});

export type DocumentMetadata = z.infer<typeof documentMetadataSchema>;

/**
 * Update document category schema
 */
export const updateDocumentCategorySchema = z.object({
  documentIds: z.array(z.string()).min(1, 'At least one document must be selected'),
  category: documentCategorySchema,
});

export type UpdateDocumentCategoryData = z.infer<typeof updateDocumentCategorySchema>;

/**
 * Update document visibility schema
 */
export const updateDocumentVisibilitySchema = z.object({
  documentIds: z.array(z.string()).min(1, 'At least one document must be selected'),
  visibility: documentVisibilitySchema,
});

export type UpdateDocumentVisibilityData = z.infer<
  typeof updateDocumentVisibilitySchema
>;

/**
 * Delete document schema
 */
export const deleteDocumentSchema = z.object({
  documentId: z.string().min(1, 'Document ID is required'),
});

export type DeleteDocumentData = z.infer<typeof deleteDocumentSchema>;

/**
 * Bulk document upload schema
 */
export const bulkUploadSchema = z.object({
  files: z
    .array(
      z.object({
        file: z.instanceof(File),
        category: documentCategorySchema,
        visibility: documentVisibilitySchema.default('both'),
      })
    )
    .min(1, 'At least one file must be selected')
    .max(10, 'Cannot upload more than 10 files at once'),
});

export type BulkUploadData = z.infer<typeof bulkUploadSchema>;
