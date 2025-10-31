import { useState } from 'react';

interface ExtractedFields {
  [key: string]: string | string[] | number | null | undefined;
}

interface ExtractionLog {
  id: string;
  documentName?: string;
  projectId?: string;
  projectName?: string;
  timestamp?: string | number | Date;
  status?: 'success' | 'failed' | 'partial';
  extractedFields?: ExtractedFields;
  rawResponse?: string | object;
  error?: string;
}

interface ExtractionLogsProps {
  logs?: ExtractionLog[];
  isAdmin?: boolean;
}

/**
 * ExtractionLogs Component
 * Admin interface for viewing and monitoring document extraction logs
 */
export default function ExtractionLogs({ logs = [], isAdmin = false }: ExtractionLogsProps) {
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterProject, setFilterProject] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLog, setSelectedLog] = useState<ExtractionLog | null>(null);

  // Don't render if user is not admin
  if (!isAdmin) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <svg
          className="mx-auto h-12 w-12 text-red-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        <h3 className="mt-4 text-lg font-medium text-red-900">Access Denied</h3>
        <p className="mt-2 text-sm text-red-700">
          You must be an administrator to view extraction logs.
        </p>
      </div>
    );
  }

  // Filter logs based on status, project, and search query
  const filteredLogs = logs.filter(log => {
    const matchesStatus = filterStatus === 'all' || log.status === filterStatus;
    const matchesProject = filterProject === 'all' || log.projectId === filterProject;
    const matchesSearch = !searchQuery ||
      log.documentName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.projectName?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesProject && matchesSearch;
  });

  // Get unique project IDs for filter
  const projectIds = [...new Set(logs.map(log => log.projectId).filter(Boolean))];

  // Format timestamp
  const formatTimestamp = (timestamp?: string | number | Date): string => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get status badge color
  const getStatusColor = (status?: string): string => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'partial':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Count extracted fields
  const countExtractedFields = (extractedData?: ExtractedFields): number => {
    if (!extractedData) return 0;
    return Object.values(extractedData).filter(value =>
      value !== null && value !== undefined && value !== ''
    ).length;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Extraction Logs</h2>
        <p className="text-gray-600 mt-1">
          Monitor and troubleshoot document extraction processes
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by document or project name..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <svg
                className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="success">Success</option>
              <option value="partial">Partial</option>
              <option value="failed">Failed</option>
            </select>
          </div>

          {/* Project Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Project
            </label>
            <select
              value={filterProject}
              onChange={(e) => setFilterProject(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="all">All Projects</option>
              {projectIds.map(projectId => (
                <option key={projectId} value={projectId}>
                  Project {projectId}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      {filteredLogs.length === 0 ? (
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h4 className="mt-4 text-lg font-medium text-gray-900">No logs found</h4>
          <p className="mt-2 text-sm text-gray-500">
            {logs.length === 0
              ? 'No extraction logs available yet'
              : 'No logs match your current filters'}
          </p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Document
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Project
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Timestamp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fields Extracted
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {log.documentName || 'Unknown Document'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {log.projectName || `Project ${log.projectId || 'N/A'}`}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {formatTimestamp(log.timestamp)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(log.status)}`}>
                      {log.status || 'unknown'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {countExtractedFields(log.extractedFields)} fields
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => setSelectedLog(log)}
                      className="text-primary hover:text-primary-dark transition-colors"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Log count */}
      {filteredLogs.length > 0 && (
        <p className="text-sm text-gray-500">
          Showing {filteredLogs.length} of {logs.length} {logs.length === 1 ? 'log' : 'logs'}
        </p>
      )}

      {/* Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Extraction Log Details</h3>
                <button
                  onClick={() => setSelectedLog(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Document Info */}
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Document Information</h4>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Document Name:</span>
                      <span className="text-sm font-medium text-gray-900">{selectedLog.documentName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Project:</span>
                      <span className="text-sm font-medium text-gray-900">
                        {selectedLog.projectName || `Project ${selectedLog.projectId}`}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Timestamp:</span>
                      <span className="text-sm font-medium text-gray-900">
                        {formatTimestamp(selectedLog.timestamp)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Status:</span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedLog.status)}`}>
                        {selectedLog.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Extracted Fields */}
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Extracted Fields</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    {selectedLog.extractedFields && Object.keys(selectedLog.extractedFields).length > 0 ? (
                      <div className="space-y-2">
                        {Object.entries(selectedLog.extractedFields).map(([key, value]) => (
                          <div key={key} className="flex justify-between items-start">
                            <span className="text-sm text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                            <span className="text-sm font-medium text-gray-900 text-right ml-4">
                              {value ? (Array.isArray(value) ? value.join(', ') : String(value)) : 'N/A'}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 italic">No fields extracted</p>
                    )}
                  </div>
                </div>

                {/* Raw LLM Response */}
                {selectedLog.rawResponse && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Raw LLM Response</h4>
                    <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                      <pre className="text-xs text-green-400 font-mono">
                        {typeof selectedLog.rawResponse === 'string'
                          ? selectedLog.rawResponse
                          : JSON.stringify(selectedLog.rawResponse, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}

                {/* Error Details */}
                {selectedLog.error && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Error Details</h4>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <p className="text-sm text-red-800">{selectedLog.error}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Close Button */}
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setSelectedLog(null)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
