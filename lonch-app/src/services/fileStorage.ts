import { ref, uploadBytesResumable, getDownloadURL, deleteObject, listAll, StorageReference } from 'firebase/storage';
import { storage } from '../config/firebase';

/**
 * File Storage Service
 * Handles all Firebase Storage operations for document uploads
 */

export interface UploadResult {
  downloadURL: string;
  filePath: string;
  fileName: string;
  fileSize: number;
  category: string;
  uploadedAt: string;
}

export interface FileMetadata {
  name: string;
  fullPath: string;
  downloadURL: string;
}

export type ProgressCallback = (progress: number) => void;
export type ProgressPerFileCallback = (index: number, progress: number) => void;

/**
 * Generate a unique file path with naming convention
 * Format: {projectId}/{category}/{timestamp}-{filename}
 */
export const generateFilePath = (projectId: string, category: string, filename: string): string => {
  const timestamp = Date.now();
  const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
  return `${projectId}/${category}/${timestamp}-${sanitizedFilename}`;
};

/**
 * Upload a file to Firebase Storage
 */
export const uploadFile = (
  file: File,
  projectId: string,
  category: string,
  onProgress: ProgressCallback | null = null
): Promise<UploadResult> => {
  return new Promise((resolve, reject) => {
    try {
      const filePath = generateFilePath(projectId, category, file.name);
      const storageRef = ref(storage, filePath);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          // Calculate and report progress
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          if (onProgress) {
            onProgress(progress);
          }
        },
        (error) => {
          // Handle upload errors
          console.error('Upload failed:', error);
          reject(error);
        },
        async () => {
          // Upload completed successfully
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            resolve({
              downloadURL,
              filePath,
              fileName: file.name,
              fileSize: file.size,
              category,
              uploadedAt: new Date().toISOString()
            });
          } catch (error) {
            console.error('Error getting download URL:', error);
            reject(error);
          }
        }
      );
    } catch (error) {
      console.error('Error in uploadFile setup:', error);
      reject(error);
    }
  });
};

/**
 * Upload multiple files in batch
 */
export const uploadMultipleFiles = async (
  files: File[],
  projectId: string,
  category: string,
  onProgressPerFile: ProgressPerFileCallback | null = null
): Promise<UploadResult[]> => {
  const uploadPromises = files.map((file, index) => {
    const progressCallback = onProgressPerFile
      ? (progress: number) => onProgressPerFile(index, progress)
      : null;

    return uploadFile(file, projectId, category, progressCallback);
  });

  try {
    const results = await Promise.all(uploadPromises);
    return results;
  } catch (error) {
    console.error('Batch upload failed:', error);
    throw error;
  }
};

/**
 * Download a file (returns download URL)
 */
export const getFileDownloadURL = async (filePath: string): Promise<string> => {
  try {
    const storageRef = ref(storage, filePath);
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error) {
    console.error('Failed to get download URL:', error);
    throw error;
  }
};

/**
 * Delete a file from storage
 */
export const deleteFile = async (filePath: string): Promise<void> => {
  try {
    const storageRef = ref(storage, filePath);
    await deleteObject(storageRef);
  } catch (error) {
    console.error('Failed to delete file:', error);
    throw error;
  }
};

/**
 * List all files for a project
 */
export const listProjectFiles = async (projectId: string): Promise<FileMetadata[]> => {
  try {
    const projectRef = ref(storage, projectId);
    const result = await listAll(projectRef);

    const filePromises = result.items.map(async (itemRef: StorageReference) => {
      const downloadURL = await getDownloadURL(itemRef);
      return {
        name: itemRef.name,
        fullPath: itemRef.fullPath,
        downloadURL
      };
    });

    const files = await Promise.all(filePromises);
    return files;
  } catch (error) {
    console.error('Failed to list files:', error);
    throw error;
  }
};

/**
 * Retry upload with exponential backoff
 */
export const uploadFileWithRetry = async (
  file: File,
  projectId: string,
  category: string,
  maxRetries: number = 3,
  onProgress: ProgressCallback | null = null
): Promise<UploadResult> => {
  let lastError: any;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const result = await uploadFile(file, projectId, category, onProgress);
      return result;
    } catch (error) {
      lastError = error;
      console.warn(`Upload attempt ${attempt + 1} failed:`, error);

      // Wait before retrying (exponential backoff)
      if (attempt < maxRetries - 1) {
        const delay = Math.pow(2, attempt) * 1000; // 1s, 2s, 4s
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
};
