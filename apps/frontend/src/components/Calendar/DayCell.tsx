import { useNavigate } from 'react-router-dom';
import type { Note } from '@klat/types';
import { isSameMonthUtil, isTodayUtil, dateToString } from '@/utils/dateHelpers';
import { useUpdateNote, useCreateNote } from '@/hooks/useNotes';

interface DayCellProps {
  date: Date;
  currentMonth: Date;
  note?: Note;
}

export function DayCell({ date, currentMonth, note }: DayCellProps) {
  const navigate = useNavigate();
  const updateNote = useUpdateNote();
  const createNote = useCreateNote();
  const isCurrentMonth = isSameMonthUtil(date, currentMonth);
  const isToday = isTodayUtil(date);
  const hasNote = !!note && note.content.trim().length > 0;

  const handleClick = () => {
    navigate(`/day/${dateToString(date)}`);
  };

  const handleToggleDone = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (note) {
      const newCompletedAt = note.completedAt ? '' : new Date().toISOString();
      await updateNote.mutateAsync({
        id: note.id,
        data: {
          completedAt: newCompletedAt || undefined,
        },
      });
    } else {
      // Create a new empty note marked as completed
      await createNote.mutateAsync({
        date: dateToString(date),
        content: '',
        completedAt: new Date().toISOString(),
        tagIds: [],
      });
    }
  };

  // Get preview text (strip markdown and truncate)
  const getPreviewText = (content: string): string => {
    // Remove markdown formatting
    const stripped = content
      .replace(/#{1,6}\s/g, '') // Remove headers
      .replace(/\*\*(.+?)\*\*/g, '$1') // Remove bold
      .replace(/\*(.+?)\*/g, '$1') // Remove italic
      .replace(/\[(.+?)\]\(.+?\)/g, '$1') // Remove links
      .replace(/`(.+?)`/g, '$1') // Remove inline code
      .replace(/^[-*+]\s/gm, '') // Remove list markers
      .trim();

    // Truncate to first 60 characters
    if (stripped.length > 60) {
      return stripped.substring(0, 60) + '...';
    }
    return stripped;
  };

  return (
    <div
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleClick();
        }
      }}
      className={`
        min-h-24 p-2 border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer
        flex flex-col items-start justify-start relative group
        ${!isCurrentMonth ? 'bg-gray-50 text-gray-400' : 'bg-white'}
        ${note?.completedAt ? 'bg-green-50' : ''}
        ${isToday ? 'ring-2 ring-primary-500' : ''}
      `}
    >
      <div className="flex justify-between items-start w-full mb-1">
        <span
          className={`
            text-sm font-medium
            ${isToday ? 'text-primary-600 font-bold' : ''}
            ${!isCurrentMonth ? 'text-gray-300' : 'text-gray-700'}
          `}
        >
          {date.getDate()}
        </span>

        {isCurrentMonth && (
          <button
            onClick={handleToggleDone}
            className={`
              p-1 rounded-full transition-all
              ${note?.completedAt 
                ? 'text-green-600 hover:bg-red-100 hover:text-red-600 bg-green-50' 
                : 'text-gray-400 hover:bg-green-100 hover:text-green-600 bg-gray-100'}
            `}
            title={note?.completedAt ? "Mark as incomplete" : "Mark as completed"}
          >
            {note?.completedAt ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </button>
        )}
      </div>

      {hasNote && isCurrentMonth && (
        <div className="w-full flex flex-col gap-1">
          {/* Note content preview */}
          <p className="text-xs text-gray-600 line-clamp-2 text-left">
            {getPreviewText(note.content)}
          </p>

          {/* Tags preview */}
          {note.tags && note.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {note.tags.slice(0, 2).map((tag: any) => (
                <span
                  key={tag.id}
                  className="text-xs px-1.5 py-0.5 rounded"
                  style={{
                    backgroundColor: tag.color ? `${tag.color}20` : '#E5E7EB',
                    color: tag.color || '#374151',
                  }}
                >
                  {tag.name}
                </span>
              ))}
              {note.tags.length > 2 && (
                <span className="text-xs text-gray-400">+{note.tags.length - 2}</span>
              )}
            </div>
          )}

          {/* Done indicator */}
          {note?.completedAt && (
            <div className="mt-1 flex items-center gap-1 text-green-600">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-xs font-medium">Completed</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
