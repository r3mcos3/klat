import { useNavigate } from 'react-router-dom';
import type { Note } from '@klat/types';
import { isSameMonthUtil, isTodayUtil, dateToString } from '@/utils/dateHelpers';

interface DayCellProps {
  date: Date;
  currentMonth: Date;
  note?: Note;
}

export function DayCell({ date, currentMonth, note }: DayCellProps) {
  const navigate = useNavigate();
  const isCurrentMonth = isSameMonthUtil(date, currentMonth);
  const isToday = isTodayUtil(date);
  const hasNote = !!note && note.content.trim().length > 0;

  const handleClick = () => {
    navigate(`/day/${dateToString(date)}`);
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
    <button
      onClick={handleClick}
      className={`
        min-h-24 p-2 border border-gray-200 hover:bg-gray-50 transition-colors
        flex flex-col items-start justify-start
        ${!isCurrentMonth ? 'bg-gray-50 text-gray-400' : 'bg-white'}
        ${isToday ? 'ring-2 ring-primary-500' : ''}
      `}
    >
      <span
        className={`
          text-sm font-medium mb-1
          ${isToday ? 'text-primary-600 font-bold' : ''}
          ${!isCurrentMonth ? 'text-gray-300' : 'text-gray-700'}
        `}
      >
        {date.getDate()}
      </span>

      {hasNote && isCurrentMonth && (
        <div className="w-full flex flex-col gap-1">
          {/* Note content preview */}
          <p className="text-xs text-gray-600 line-clamp-2 text-left">
            {getPreviewText(note.content)}
          </p>

          {/* Tags preview */}
          {note.tags && note.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {note.tags.slice(0, 2).map((tag) => (
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
        </div>
      )}
    </button>
  );
}
