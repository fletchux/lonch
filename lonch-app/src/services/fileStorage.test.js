import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  generateFilePath,
  uploadFile,
  uploadMultipleFiles,
  getFileDownloadURL,
  deleteFile,
  listProjectFiles,
  uploadFileWithRetry
} from './fileStorage';

// Mock Firebase Storage
vi.mock('../config/firebase', () => ({
  storage: {}
}));

vi.mock('firebase/storage', () => ({
  ref: vi.fn((storage, path) => ({ fullPath: path })),
  uploadBytesResumable: vi.fn(),
  getDownloadURL: vi.fn(),
  deleteObject: vi.fn(),
  listAll: vi.fn()
}));

describe('fileStorage Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('generateFilePath', () => {
    it('should generate correct file path with project ID, category, and filename', () => {
      const projectId = 'project-123';
      const category = 'contract';
      const filename = 'test-document.pdf';

      const result = generateFilePath(projectId, category, filename);

      expect(result).toMatch(/^project-123\/contract\/\d+-test-document\.pdf$/);
    });

    it('should sanitize filenames with special characters', () => {
      const projectId = 'project-123';
      const category = 'specifications';
      const filename = 'test document (v2) [final].pdf';

      const result = generateFilePath(projectId, category, filename);

      expect(result).toMatch(/^project-123\/specifications\/\d+-test_document__v2___final_\.pdf$/);
    });

    it('should include timestamp in file path', () => {
      const beforeTimestamp = Date.now();
      const result = generateFilePath('proj-1', 'other', 'file.txt');
      const afterTimestamp = Date.now();

      const timestampMatch = result.match(/\/(\d+)-/);
      expect(timestampMatch).toBeTruthy();

      const timestamp = parseInt(timestampMatch[1]);
      expect(timestamp).toBeGreaterThanOrEqual(beforeTimestamp);
      expect(timestamp).toBeLessThanOrEqual(afterTimestamp);
    });
  });

  describe('uploadFile', () => {
    it('should upload file and return metadata', async () => {
      const { uploadBytesResumable, getDownloadURL } = await import('firebase/storage');

      const mockFile = new File(['content'], 'test.pdf', { type: 'application/pdf' });
      const mockDownloadURL = 'https://storage.example.com/test.pdf';
      const mockSnapshot = {
        ref: { fullPath: 'project-1/contract/123-test.pdf' },
        bytesTransferred: 100,
        totalBytes: 100
      };

      const mockUploadTask = {
        on: vi.fn((event, progress, error, complete) => {
          // Simulate successful upload
          progress({ bytesTransferred: 50, totalBytes: 100 });
          progress({ bytesTransferred: 100, totalBytes: 100 });
          complete();
        }),
        snapshot: mockSnapshot
      };

      uploadBytesResumable.mockReturnValue(mockUploadTask);
      getDownloadURL.mockResolvedValue(mockDownloadURL);

      const onProgress = vi.fn();
      const result = await uploadFile(mockFile, 'project-1', 'contract', onProgress);

      expect(result).toMatchObject({
        downloadURL: mockDownloadURL,
        fileName: 'test.pdf',
        fileSize: mockFile.size,
        category: 'contract'
      });
      expect(result.filePath).toMatch(/^project-1\/contract\/\d+-test\.pdf$/);
      expect(result.uploadedAt).toBeDefined();
      expect(onProgress).toHaveBeenCalledWith(50);
      expect(onProgress).toHaveBeenCalledWith(100);
    });

    it('should handle upload errors', async () => {
      const { uploadBytesResumable } = await import('firebase/storage');

      const mockFile = new File(['content'], 'test.pdf', { type: 'application/pdf' });
      const mockError = new Error('Upload failed');

      const mockUploadTask = {
        on: vi.fn((event, progress, error) => {
          error(mockError);
        })
      };

      uploadBytesResumable.mockReturnValue(mockUploadTask);

      await expect(uploadFile(mockFile, 'project-1', 'contract')).rejects.toThrow('Upload failed');
    });
  });

  describe('uploadMultipleFiles', () => {
    it('should upload multiple files successfully', async () => {
      const { uploadBytesResumable, getDownloadURL } = await import('firebase/storage');

      const mockFiles = [
        new File(['content1'], 'file1.pdf', { type: 'application/pdf' }),
        new File(['content2'], 'file2.pdf', { type: 'application/pdf' })
      ];

      const mockSnapshot = {
        ref: { fullPath: 'test-path' },
        bytesTransferred: 100,
        totalBytes: 100
      };

      const mockUploadTask = {
        on: vi.fn((event, progress, error, complete) => {
          complete();
        }),
        snapshot: mockSnapshot
      };

      uploadBytesResumable.mockReturnValue(mockUploadTask);
      getDownloadURL.mockResolvedValue('https://example.com/file.pdf');

      const results = await uploadMultipleFiles(mockFiles, 'project-1', 'contract');

      expect(results).toHaveLength(2);
      expect(results[0].fileName).toBe('file1.pdf');
      expect(results[1].fileName).toBe('file2.pdf');
    });
  });

  describe('getFileDownloadURL', () => {
    it('should return download URL for file', async () => {
      const { getDownloadURL } = await import('firebase/storage');
      const mockURL = 'https://storage.example.com/file.pdf';

      getDownloadURL.mockResolvedValue(mockURL);

      const result = await getFileDownloadURL('project-1/contract/test.pdf');

      expect(result).toBe(mockURL);
    });

    it('should handle errors when getting download URL', async () => {
      const { getDownloadURL } = await import('firebase/storage');

      getDownloadURL.mockRejectedValue(new Error('File not found'));

      await expect(getFileDownloadURL('invalid-path')).rejects.toThrow('File not found');
    });
  });

  describe('deleteFile', () => {
    it('should delete file successfully', async () => {
      const { deleteObject } = await import('firebase/storage');

      deleteObject.mockResolvedValue();

      await expect(deleteFile('project-1/contract/test.pdf')).resolves.toBeUndefined();
      expect(deleteObject).toHaveBeenCalled();
    });

    it('should handle deletion errors', async () => {
      const { deleteObject } = await import('firebase/storage');

      deleteObject.mockRejectedValue(new Error('Delete failed'));

      await expect(deleteFile('invalid-path')).rejects.toThrow('Delete failed');
    });
  });

  describe('listProjectFiles', () => {
    it('should list all files for a project', async () => {
      const { listAll, getDownloadURL } = await import('firebase/storage');

      const mockItems = [
        { name: 'file1.pdf', fullPath: 'project-1/contract/file1.pdf' },
        { name: 'file2.pdf', fullPath: 'project-1/contract/file2.pdf' }
      ];

      listAll.mockResolvedValue({ items: mockItems });
      getDownloadURL.mockResolvedValue('https://example.com/file.pdf');

      const result = await listProjectFiles('project-1');

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('file1.pdf');
      expect(result[1].name).toBe('file2.pdf');
    });
  });

  describe('uploadFileWithRetry', () => {
    it('should succeed on first attempt', async () => {
      const { uploadBytesResumable, getDownloadURL } = await import('firebase/storage');

      const mockFile = new File(['content'], 'test.pdf', { type: 'application/pdf' });
      const mockSnapshot = {
        ref: { fullPath: 'test-path' },
        bytesTransferred: 100,
        totalBytes: 100
      };

      const mockUploadTask = {
        on: vi.fn((event, progress, error, complete) => {
          complete();
        }),
        snapshot: mockSnapshot
      };

      uploadBytesResumable.mockReturnValue(mockUploadTask);
      getDownloadURL.mockResolvedValue('https://example.com/file.pdf');

      const result = await uploadFileWithRetry(mockFile, 'project-1', 'contract', 3);

      expect(result).toBeDefined();
      expect(result.fileName).toBe('test.pdf');
    });

    it('should retry on failure and eventually succeed', async () => {
      const { uploadBytesResumable, getDownloadURL } = await import('firebase/storage');

      const mockFile = new File(['content'], 'test.pdf', { type: 'application/pdf' });
      let attemptCount = 0;

      uploadBytesResumable.mockImplementation(() => {
        attemptCount++;
        const mockSnapshot = {
          ref: { fullPath: 'test-path' },
          bytesTransferred: 100,
          totalBytes: 100
        };

        return {
          on: vi.fn((event, progress, error, complete) => {
            if (attemptCount < 2) {
              error(new Error('Network error'));
            } else {
              complete();
            }
          }),
          snapshot: mockSnapshot
        };
      });

      getDownloadURL.mockResolvedValue('https://example.com/file.pdf');

      const result = await uploadFileWithRetry(mockFile, 'project-1', 'contract', 3);

      expect(result).toBeDefined();
      expect(attemptCount).toBe(2);
    });

    it('should throw error after max retries', async () => {
      const { uploadBytesResumable } = await import('firebase/storage');

      const mockFile = new File(['content'], 'test.pdf', { type: 'application/pdf' });
      const mockError = new Error('Persistent failure');

      uploadBytesResumable.mockReturnValue({
        on: vi.fn((event, progress, error) => {
          error(mockError);
        })
      });

      await expect(uploadFileWithRetry(mockFile, 'project-1', 'contract', 3)).rejects.toThrow('Persistent failure');
    });
  });
});
