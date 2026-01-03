import { Link } from 'react-router-dom';
import type { SearchResult } from '@klat/types';
import { formatDateNL } from '@/utils/dateHelpers';

interface SearchResultsProps {
  results: SearchResult[];
  isLoading?: boolean;
}

export function SearchResults({ results, isLoading }: SearchResultsProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-4 bg-white rounded-lg border border-gray-200 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-2" />
            <div className="h-3 bg-gray-200 rounded w-full mb-1" />
            <div className="h-3 bg-gray-200 rounded w-5/6" />
          </div>
        ))}
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="text-center py-12">
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
            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No results</h3>
        <p className="mt-1 text-sm text-gray-500">
          Try a different search term
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {results.map((result) => {
        // Extract date part from ISO string (e.g., "2024-01-01T12:00:00Z" -> "2024-01-01")
        const dateStr = result.note.date.split('T')[0];

        return (
          <Link
            key={result.note.id}
            to={`/day/${dateStr}`}
            className="block p-4 bg-white rounded-lg border border-gray-200 hover:border-primary-300 hover:shadow-md transition-all"
          >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-primary-600">
              {formatDateNL(new Date(result.note.date))}
            </span>
            {result.note.tags && result.note.tags.length > 0 && (
              <div className="flex gap-1">
                {result.note.tags.map((tag) => (
                  <span
                    key={tag.id}
                    className="text-xs px-2 py-0.5 rounded"
                    style={{
                      backgroundColor: tag.color ? `${tag.color}20` : '#E5E7EB',
                      color: tag.color || '#374151',
                    }}
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
            )}
          </div>

          <p className="text-sm text-gray-700 line-clamp-3">
            {result.snippet}
          </p>

          {result.highlights.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {result.highlights.slice(0, 5).map((highlight, i) => (
                <span key={i} className="text-xs px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded">
                  {highlight}
                </span>
              ))}
            </div>
          )}
          </Link>
        );
      })}

      <div className="text-center text-sm text-gray-500 pt-4">
        {results.length} result{results.length === 1 ? '' : 's'} found
      </div>
    </div>
  );
}
