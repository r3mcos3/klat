import { Link, useNavigate } from 'react-router-dom';
import { useAllNotes } from '@/hooks/useNotes';
import { formatDateNL } from '@/utils/dateHelpers';
import type { Note } from '@klat/types';

export function CardStackView() {
  const { data: notes = [], isLoading, error } = useAllNotes();
  const navigate = useNavigate();

  // Sort notes by date (newest first)
  const sortedNotes = [...notes].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

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
    const dateStr = note.date.split('T')[0];
    navigate(`/day/${dateStr}`);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Fout bij het laden van notities</p>
          <p className="text-sm text-gray-500 mt-2">
            {error instanceof Error ? error.message : 'Onbekende fout'}
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
            <p className="text-gray-600 mt-1">Je persoonlijke dagboek</p>
          </div>

          <div className="flex gap-3">
            <Link
              to={`/day/${new Date().toISOString().split('T')[0]}`}
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
              Nieuwe notitie
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
              Zoeken
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
              <p className="mt-4 text-gray-600">Laden...</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && sortedNotes.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg mb-4">Je hebt nog geen notities</p>
            <Link
              to={`/day/${new Date().toISOString().split('T')[0]}`}
              className="inline-block px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Schrijf je eerste notitie
            </Link>
          </div>
        )}

        {/* Card Stack */}
        {!isLoading && sortedNotes.length > 0 && (
          <div className="relative">
            <div className="flex flex-col">
              {sortedNotes.map((note, index) => {
                const dateStr = note.date.split('T')[0];
                const dateObj = new Date(dateStr + 'T12:00:00');
                const hasContent = note.content.trim().length > 0;

                return (
                  <div
                    key={note.id}
                    className="relative"
                    style={{
                      marginTop: index === 0 ? '0' : '-120px',
                      zIndex: sortedNotes.length - index,
                    }}
                  >
                    <button
                      onClick={() => handleCardClick(note)}
                      className="w-full bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-200 hover:scale-[1.02] hover:-translate-y-1 text-left"
                    >
                      {/* Date */}
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {formatDateNL(dateObj, 'EEEE d MMMM yyyy')}
                        </h3>
                        <span className="text-sm text-gray-500">
                          {formatDateNL(dateObj, 'd MMM')}
                        </span>
                      </div>

                      {/* Content Preview */}
                      {hasContent && (
                        <p className="text-gray-700 mb-4 line-clamp-3">
                          {getPreviewText(note.content)}
                        </p>
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
                        <p className="text-gray-400 italic">Geen inhoud</p>
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
          <p>Klik op een kaart om de notitie te bewerken</p>
        </div>
      </div>
    </div>
  );
}
