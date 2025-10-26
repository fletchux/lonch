import { ref, uploadBytesResumable, getDownloadURL, deleteObject, listAll } from 'firebase/storage';
import { storage } from '../config/firebase';

/**
 * File Storage Service
 * Handles all Firebase Storage operations for document uploads
 */

/**
 * Generate a unique file path with naming convention
 * Format: {projectId}/{category}/{timestamp}-{filename}
 * @param {string} projectId - The project ID
 * @param {string} category - Document category (contract, specifications, other)
 * @param {string} filename - Original filename
 * @returns {string} - Formatted file path
 */
export const generateFilePath = (projectId, category, filename) => {
  const timestamp = Date.now();
  const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
  return `${projectId}/${category}/${timestamp}-${sanitizedFilename}`;
};

/**
 * Upload a file to Firebase Storage
 * @param {File} file - The file to upload
 * @param {string} projectId - The project ID
 * @param {string} category - Document category
 * @param {Function} onProgress - Callback for upload progress (0-100)
 * @returns {Promise<Object>} - Upload result with download URL and metadata
 */
export const uploadFile = (file, projectId, category, onProgress = null) => {
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
 * @param {File[]} files - Array of files to upload
 * @param {string} projectId - The project ID
 * @param {string} category - Document category
 * @param {Function} onProgressPerFile - Callback for individual file progress
 * @returns {Promise<Object[]>} - Array of upload results
 */
export const uploadMultipleFiles = async (files, projectId, category, onProgressPerFile = null) => {
  const uploadPromises = files.map((file, index) => {
    const progressCallback = onProgressPerFile
      ? (progress) => onProgressPerFile(index, progress)
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
 * @param {string} filePath - The file path in storage
 * @returns {Promise<string>} - Download URL
 */
export const getFileDownloadURL = async (filePath) => {
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
 * @param {string} filePath - The file path in storage
 * @returns {Promise<void>}
 */
export const deleteFile = async (filePath) => {
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
 * @param {string} projectId - The project ID
 * @returns {Promise<Object[]>} - Array of file metadata
 */
export const listProjectFiles = async (projectId) => {
  try {
    const projectRef = ref(storage, projectId);
    const result = await listAll(projectRef);

    const filePromises = result.items.map(async (itemRef) => {
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
 * @param {File} file - The file to upload
 * @param {string} projectId - The project ID
 * @param {string} category - Document category
 * @param {number} maxRetries - Maximum retry attempts
 * @param {Function} onProgress - Callback for upload progress
 * @returns {Promise<Object>} - Upload result
 */
export const uploadFileWithRetry = async (
  file,
  projectId,
  category,
  maxRetries = 3,
  onProgress = null
) => {
  let lastError;

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
