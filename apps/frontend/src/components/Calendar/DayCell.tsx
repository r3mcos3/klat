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
        <div className="w-full">
          {/* Note indicator */}
          <div className="w-2 h-2 rounded-full bg-primary-500 mb-1" />

          {/* Tags preview */}
          {note.tags && note.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
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
