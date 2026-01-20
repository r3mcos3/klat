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
        min-h-[120px] p-4 border transition-all duration-200 cursor-pointer
        flex flex-col items-start justify-start relative group
        ${!isCurrentMonth ? 'bg-tertiary text-tertiary border-default' : 'bg-secondary border-default'}
        ${note?.completedAt ? 'bg-success-bg' : ''}
        ${isToday ? 'bg-accent-primary-subtle' : ''}
        hover:shadow-dark hover:-translate-y-1
      `}
    >
      <div className="flex justify-between items-start w-full mb-3">
        <span
          className={`
            font-display text-[28px] font-bold leading-none
            ${isToday ? 'text-accent-primary' : ''}
            ${!isCurrentMonth ? 'text-tertiary' : 'text-primary'}
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
                ? 'text-success hover:bg-priority-high/10 hover:text-priority-high bg-success-bg'
                : 'text-tertiary hover:bg-success-bg hover:text-success bg-tertiary'}
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
        <div className="w-full flex flex-col gap-2">
          {/* Note content preview */}
          <p className="text-[11px] font-body text-secondary line-clamp-3 leading-relaxed text-left">
            {getPreviewText(note.content)}
          </p>

          {/* Tags preview */}
          {note.tags && note.tags.length > 0 && (
            <div className="mt-auto pt-2 flex flex-wrap gap-1">
              {note.tags.slice(0, 2).map((tag) => (
                <span
                  key={tag.id}
                  className="text-[10px] font-body font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full"
                  style={{
                    backgroundColor: tag.color ? `${tag.color}40` : 'rgba(100, 116, 139, 0.1)',
                    border: `1px solid ${tag.color ? `${tag.color}80` : 'rgb(100, 116, 139)'}`,
                    color: tag.color || 'rgb(100, 116, 139)',
                  }}
                >
                  {tag.name}
                </span>
              ))}
              {note.tags.length > 2 && (
                <span className="text-[10px] text-tertiary">+{note.tags.length - 2}</span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
