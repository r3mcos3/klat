import { Link, useNavigate } from 'react-router-dom';
import { useAllNotes, useUpdateNote } from '@/hooks/useNotes';
import { formatDateNL } from '@/utils/dateHelpers';
import type { Note } from '@klat/types';

export function CardStackView() {
  const { data: notes = [], isLoading, error } = useAllNotes();
  const updateNote = useUpdateNote();
  const navigate = useNavigate();

  // Sort notes by date (newest first)
  const sortedNotes = [...notes].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const handleToggleDone = async (e: React.MouseEvent, note: Note) => {
    e.stopPropagation();
    const newCompletedAt = note.completedAt ? '' : new Date().toISOString();

    await updateNote.mutateAsync({
      id: note.id,
      data: {
        completedAt: newCompletedAt || undefined,
      },
    });
  };

  // Get preview text (strip markdown and truncate)
  const getPreviewText = (content: string, maxLength: number = 150): string => {
    // Remove markdown formatting
    const stripped = content
      .replace(/#{1,6}\s/g, '') // Remove headers
      .replace(/\*\*(.+?)\*\*/g, '$1') // Remove bold
      .replace(/\*(.+?)\*/g, '$1') // Remove italic
      .replace(/\[(.+?)\]\(.+?\)/g, '$1') // Remove links
      .replace(/`(.+?)`/g, '$1') // Remove inline code
      .replace(/^[-*+]\s/gm, '') // Remove list markers
      .trim();

    // Truncate
    if (stripped.length > maxLength) {
      return stripped.substring(0, maxLength) + '...';
    }
    return stripped;
  };

  const handleCardClick = (note: Note) => {
    navigate(`/note/${note.id}`);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Error loading notes</p>
          <p className="text-sm text-gray-500 mt-2">
            {error instanceof Error ? error.message : 'Unknown error'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">klat</h1>
            <p className="text-gray-600 mt-1">Your personal diary</p>
          </div>

          <div className="flex gap-3">
            <Link
              to="/note/new"
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 flex items-center gap-2 shadow-sm transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              New note
            </Link>
            <Link
              to="/search"
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-2 shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              Search
            </Link>
            <Link
              to="/tags"
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-2 shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                />
              </svg>
              Tags
            </Link>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto" />
              <p className="mt-4 text-gray-600">Loading...</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && sortedNotes.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg mb-4">You don't have any notes yet</p>
            <Link
              to="/note/new"
              className="inline-block px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Write your first note
            </Link>
          </div>
        )}

        {/* Card Stack */}
        {!isLoading && sortedNotes.length > 0 && (
          <div className="relative">
            <div className="flex flex-col space-y-6">
              {sortedNotes.map((note, index) => {
                const dateStr = note.date.split('T')[0];
                const dateObj = new Date(dateStr + 'T12:00:00');
                const hasContent = note.content.trim().length > 0;

                return (
                  <div
                    key={note.id}
                    className="relative"
                  >
                    <button
                      onClick={() => handleCardClick(note)}
                      className={`
                        w-full rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border hover:scale-[1.02] text-left
                        ${note.completedAt 
                          ? 'bg-green-50 border-green-200 shadow-green-100/50' 
                          : 'bg-white border-gray-200'}
                      `}
                    >
                      {/* Date & Done Toggle */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {formatDateNL(dateObj, 'EEEE d MMMM yyyy')}
                          </h3>
                          {note.completedAt && (
                            <div className="flex items-center gap-1 text-green-600 bg-green-100/50 px-2 py-0.5 rounded-full text-xs font-bold">
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              DONE
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <span className="text-sm text-gray-500">
                            {formatDateNL(dateObj, 'd MMM')}
                          </span>
                          <button
                            onClick={(e) => handleToggleDone(e, note)}
                            className={`
                              p-2 rounded-full transition-all border
                              ${note.completedAt 
                                ? 'text-green-600 bg-green-100 border-green-300 hover:bg-red-100 hover:text-red-600 hover:border-red-300' 
                                : 'text-gray-400 bg-gray-50 border-gray-200 hover:bg-green-100 hover:text-green-600 hover:border-green-300'}
                            `}
                            title={note.completedAt ? "Mark as incomplete" : "Mark as completed"}
                          >
                            {note.completedAt ? (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            ) : (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Content Preview */}
                      {hasContent && (
                        <p className="text-gray-700 mb-4 line-clamp-3">
                          {getPreviewText(note.content)}
                        </p>
                      )}

                      {/* Deadline */}
                      {note.deadline && (
                        <div className="mb-4">
                          {(() => {
                            const deadlineDate = new Date(note.deadline);
                            const now = new Date();
                            const isExpired = deadlineDate < now;
                            const deadlineStr = formatDateNL(deadlineDate, 'd MMM yyyy HH:mm');

                            return (
                              <div
                                className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                                  isExpired
                                    ? 'bg-red-100 text-red-700 border border-red-300'
                                    : 'bg-amber-100 text-amber-700 border border-amber-300'
                                }`}
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                  />
                                </svg>
                                {isExpired ? 'Expired: ' : 'Deadline: '}
                                {deadlineStr}
                              </div>
                            );
                          })()}
                        </div>
                      )}

                      {/* Tags */}
                      {note.tags && note.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {note.tags.map((tag) => (
                            <span
                              key={tag.id}
                              className="text-sm px-3 py-1 rounded-full font-medium"
                              style={{
                                backgroundColor: tag.color ? `${tag.color}20` : '#E5E7EB',
                                color: tag.color || '#374151',
                                border: `1px solid ${tag.color ? `${tag.color}40` : '#D1D5DB'}`,
                              }}
                            >
                              {tag.name}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Empty note indicator */}
                      {!hasContent && (
                        <p className="text-gray-400 italic">No content</p>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 text-center text-sm text-gray-500">
          <p>Click a card to edit the note</p>
        </div>
      </div>
    </div>
  );
}
