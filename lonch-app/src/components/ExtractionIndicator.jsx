import { useState } from 'react';

/**
 * ExtractionIndicator Component
 * Shows an indicator icon next to fields that were auto-populated from document extraction
 */
export default function ExtractionIndicator({ source, hasConflict = false }) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div
      className="relative inline-flex items-center ml-2"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {/* Icon */}
      <div
        className={`flex items-center justify-center w-5 h-5 rounded-full cursor-help ${
          hasConflict
            ? 'bg-amber-100 text-amber-700'
            : 'bg-primary/10 text-primary'
        }`}
      >
        {hasConflict ? (
          <svg
            className="w-3 h-3"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        ) : (
          <svg
            className="w-3 h-3"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
          </svg>
        )}
      </div>

      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-10 pointer-events-none">
          <div className="bg-gray-900 text-white text-xs rounded-lg py-2 px-3 shadow-lg whitespace-nowrap">
            {hasConflict ? (
              <>
                <div className="font-semibold">Multiple values found</div>
                <div className="mt-1">
                  Extracted from multiple documents with conflicting data
                </div>
              </>
            ) : (
              <>
                <div className="font-semibold">Auto-populated from documents</div>
                {source && (
                  <div className="mt-1 text-gray-300">
                    Source: {source}
                  </div>
                )}
              </>
            )}
          </div>
          {/* Tooltip arrow */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-px">
            <div className="border-4 border-transparent border-t-gray-900"></div>
          </div>
        </div>
      )}
    </div>
  );
}
