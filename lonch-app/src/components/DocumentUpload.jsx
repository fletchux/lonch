import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { extractDataFromDocument } from '../services/documentExtraction';

export default function DocumentUpload({ onFilesSelected, onUploadComplete, onExtractionComplete, projectId }) {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({});
  const [extractionStatus, setExtractionStatus] = useState({});
  const [errors, setErrors] = useState([]);

  // Handle file drop or selection
  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    // Clear previous errors
    setErrors([]);

    // Handle rejected files (invalid types)
    if (rejectedFiles.length > 0) {
      const errorMessages = rejectedFiles.map(({ file, errors }) => {
        const errorTypes = errors.map(e => e.code);
        if (errorTypes.includes('file-invalid-type')) {
          return `${file.name}: Invalid file type. Only PDF, DOCX, and TXT files are allowed.`;
        }
        return `${file.name}: Upload error`;
      });
      setErrors(errorMessages);
    }

    // Add accepted files to selected files list
    if (acceptedFiles.length > 0) {
      const filesWithMetadata = acceptedFiles.map(file => ({
        file,
        id: `${file.name}-${Date.now()}`,
        category: 'other', // Default category
        name: file.name,
        size: file.size,
        uploadedAt: new Date().toISOString(),
        uploadedBy: 'You'
      }));

      setSelectedFiles(prev => {
        const updated = [...prev, ...filesWithMetadata];
        // Auto-trigger extraction for newly added files
        setTimeout(() => extractFiles(filesWithMetadata), 100);
        return updated;
      });

      // Notify parent component
      if (onFilesSelected) {
        onFilesSelected(filesWithMetadata);
      }
    }
  }, [onFilesSelected]);

  // Configure dropzone
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/msword': ['.doc'],
      'text/plain': ['.txt']
    },
    multiple: true
  });

  // Extract specific files (used for auto-extraction)
  const extractFiles = useCallback(async (filesToProcess) => {
    for (const fileData of filesToProcess) {
      const { id, file } = fileData;

      // Set extraction status to processing
      setExtractionStatus(prev => ({
        ...prev,
        [id]: { status: 'processing', progress: 0 }
      }));

      try {
        // Extract data using Claude AI
        const result = await extractDataFromDocument(file, (progress) => {
          setExtractionStatus(prev => ({
            ...prev,
            [id]: { status: progress.status, progress: progress.progress }
          }));
        });

        // Update status based on result
        if (result.success) {
          setExtractionStatus(prev => ({
            ...prev,
            [id]: { status: 'completed', progress: 100, data: result.extractedData }
          }));

          // Notify parent component
          if (onExtractionComplete) {
            onExtractionComplete(result);
          }
        } else {
          setExtractionStatus(prev => ({
            ...prev,
            [id]: { status: 'failed', progress: 0, error: result.error }
          }));
        }
      } catch (error) {
        setExtractionStatus(prev => ({
            ...prev,
            [id]: { status: 'failed', progress: 0, error: error.message }
          }));
      }
    }
  }, [onExtractionComplete]);

  // Trigger AI extraction for uploaded files
  const startExtraction = useCallback(async () => {
    const filesToExtract = selectedFiles.filter(f => f.file);
    await extractFiles(filesToExtract);
  }, [selectedFiles, extractFiles]);

  // Remove file from selection
  const removeFile = (fileId) => {
    setSelectedFiles(prev => prev.filter(f => f.id !== fileId));
    setUploadProgress(prev => {
      const newProgress = { ...prev };
      delete newProgress[fileId];
      return newProgress;
    });
    setExtractionStatus(prev => {
      const newStatus = { ...prev };
      delete newStatus[fileId];
      return newStatus;
    });
  };

  // Update category for a file
  const updateFileCategory = (fileId, category) => {
    setSelectedFiles(prev => {
      const updated = prev.map(f => f.id === fileId ? { ...f, category } : f);

      // Notify parent component of the change
      if (onFilesSelected) {
        onFilesSelected(updated);
      }

      return updated;
    });
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-4">Upload Documents</h3>
        <p className="text-gray-600 mb-6">
          Upload your project contracts, specifications, and related documents.
          We'll extract key information to help pre-fill your project details.
        </p>
      </div>

      {/* Drag and Drop Zone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive
            ? 'border-primary bg-primary/10'
            : 'border-gray-300 hover:border-primary/50 hover:bg-gray-50'
        }`}
      >
        <input {...getInputProps()} />

        <div className="flex flex-col items-center space-y-3">
          {/* Upload Icon */}
          <svg
            className="w-12 h-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>

          {isDragActive ? (
            <p className="text-lg font-medium text-primary">Drop files here...</p>
          ) : (
            <>
              <p className="text-lg font-medium text-gray-900">
                Drag and drop files here
              </p>
              <p className="text-sm text-gray-500">or</p>
              <button
                type="button"
                className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-dark transition-colors"
              >
                Choose Files
              </button>
            </>
          )}

          <p className="text-xs text-gray-500 mt-2">
            Supported formats: PDF, DOCX, TXT
          </p>
        </div>
      </div>

      {/* Error Messages */}
      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-red-800 mb-2">Upload Errors:</h4>
          <ul className="list-disc list-inside space-y-1">
            {errors.map((error, index) => (
              <li key={index} className="text-sm text-red-700">{error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Selected Files List */}
      {selectedFiles.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-gray-900">Selected Files ({selectedFiles.length})</h4>
            <button
              onClick={startExtraction}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
            >
              Extract Data with AI
            </button>
          </div>

          {selectedFiles.map((fileData) => (
            <div
              key={fileData.id}
              className="border border-gray-200 rounded-lg p-4 bg-white"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-3">
                    {/* File Icon */}
                    <svg
                      className="w-8 h-8 text-gray-400 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                        clipRule="evenodd"
                      />
                    </svg>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {fileData.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(fileData.size)}
                      </p>
                    </div>
                  </div>

                  {/* Category Selection */}
                  <div className="mt-3">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Category
                    </label>
                    <select
                      value={fileData.category}
                      onChange={(e) => updateFileCategory(fileData.id, e.target.value)}
                      className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="contract">Contract</option>
                      <option value="specifications">Specifications</option>
                      <option value="other">Other Documents</option>
                    </select>
                  </div>

                  {/* Upload Progress */}
                  {uploadProgress[fileData.id] !== undefined && (
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                        <span>Uploading...</span>
                        <span>{Math.round(uploadProgress[fileData.id])}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{ width: `${uploadProgress[fileData.id]}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Extraction Status */}
                  {extractionStatus[fileData.id] && (
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className={`font-medium ${
                          extractionStatus[fileData.id].status === 'completed' ? 'text-green-600' :
                          extractionStatus[fileData.id].status === 'failed' ? 'text-red-600' :
                          'text-blue-600'
                        }`}>
                          {extractionStatus[fileData.id].status === 'completed' && '✓ Extraction Complete'}
                          {extractionStatus[fileData.id].status === 'failed' && '✗ Extraction Failed'}
                          {extractionStatus[fileData.id].status === 'processing' && '⟳ Extracting data...'}
                          {extractionStatus[fileData.id].status === 'parsing' && '⟳ Parsing document...'}
                        </span>
                        {extractionStatus[fileData.id].status !== 'completed' && extractionStatus[fileData.id].status !== 'failed' && (
                          <span className="text-gray-600">{Math.round(extractionStatus[fileData.id].progress)}%</span>
                        )}
                      </div>
                      {extractionStatus[fileData.id].status !== 'completed' && extractionStatus[fileData.id].status !== 'failed' && (
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full transition-all"
                            style={{ width: `${extractionStatus[fileData.id].progress}%` }}
                          />
                        </div>
                      )}
                      {extractionStatus[fileData.id].error && (
                        <p className="text-xs text-red-600 mt-1">{extractionStatus[fileData.id].error}</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Remove Button */}
                <button
                  onClick={() => removeFile(fileData.id)}
                  className="ml-4 p-1 text-gray-400 hover:text-red-600 transition-colors"
                  aria-label="Remove file"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
