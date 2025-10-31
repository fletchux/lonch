import { useState } from 'react';

interface ExtractionIndicatorProps {
  source?: string;
  hasConflict?: boolean;
}

/**
 * ExtractionIndicator Component
 * Shows an indicator icon next to fields that were auto-populated from document extraction
 */
export default function ExtractionIndicator({ source, hasConflict = false }: ExtractionIndicatorProps) {
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
            ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400'
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
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        )}
      </div>

      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-10 pointer-events-none">
          <div className="bg-popover border border-border text-popover-foreground text-xs rounded-lg py-2 px-3 shadow-lg whitespace-nowrap">
            {hasConflict ? (
              <>
                <div className="font-semibold">Multiple values found</div>
                <div className="mt-1 text-muted-foreground">
                  Extracted from multiple documents with conflicting data
                </div>
              </>
            ) : (
              <>
                <div className="font-semibold">Auto-populated from documents</div>
                {source && (
                  <div className="mt-1 text-muted-foreground">
                    Source: {source}
                  </div>
                )}
              </>
            )}
          </div>
          {/* Tooltip arrow */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-px">
            <div className="border-4 border-transparent border-t-border"></div>
          </div>
        </div>
      )}
    </div>
  );
}
