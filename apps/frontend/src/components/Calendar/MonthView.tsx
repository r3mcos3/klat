import { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { DayCell } from './DayCell';
import { CalendarHeader } from './CalendarHeader';
import { useNotesByMonth } from '@/hooks/useNotes';
import { getMonthDays, getWeekDays, nextMonth, previousMonth } from '@/utils/dateHelpers';

export function MonthView() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const yearMonth = format(currentDate, 'yyyy-MM');

  const { data: notes = [], isLoading, error } = useNotesByMonth(yearMonth);

  const monthDays = useMemo(() => getMonthDays(currentDate), [currentDate]);
  const weekDays = getWeekDays();

  // Create a map for quick note lookup by date
  const notesByDate = useMemo(() => {
    const map = new Map();
    notes.forEach((note) => {
      // Normalize the date to yyyy-MM-dd format
      const dateKey = note.date.split('T')[0]; // Extract date part from ISO string
      map.set(dateKey, note);
    });
    return map;
  }, [notes]);

  const handlePreviousMonth = () => {
    setCurrentDate(previousMonth(currentDate));
  };

  const handleNextMonth = () => {
    setCurrentDate(nextMonth(currentDate));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-600">Error loading notes</p>
        <p className="text-sm text-gray-500 mt-2">
          {error instanceof Error ? error.message : 'Unknown error'}
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <CalendarHeader
        currentDate={currentDate}
        onPreviousMonth={handlePreviousMonth}
        onNextMonth={handleNextMonth}
        onToday={handleToday}
      />

      {/* Week days header */}
      <div className="grid grid-cols-7 gap-0 mb-3">
        {weekDays.map((day) => (
          <div
            key={day}
            className="text-center font-body text-sm font-semibold text-secondary py-3 uppercase tracking-widest"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      {isLoading ? (
        <div className="grid grid-cols-7 gap-0 border border-default rounded-lg overflow-hidden shadow-dark">
          {Array.from({ length: 35 }).map((_, i) => (
            <div
              key={i}
              className="min-h-[120px] p-4 border border-default bg-tertiary animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-7 gap-0 border border-default rounded-lg overflow-hidden shadow-dark">
          {monthDays.map((date) => {
            const dateStr = format(date, 'yyyy-MM-dd');
            const note = notesByDate.get(dateStr);

            return (
              <DayCell
                key={dateStr}
                date={date}
                currentMonth={currentDate}
                note={note}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
