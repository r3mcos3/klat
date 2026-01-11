import { getMonthName } from '@/utils/dateHelpers';

interface CalendarHeaderProps {
  currentDate: Date;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
}

export function CalendarHeader({
  currentDate,
  onPreviousMonth,
  onNextMonth,
  onToday,
}: CalendarHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-8">
      <h2 className="font-display text-5xl font-bold text-primary capitalize tracking-tight">
        {getMonthName(currentDate)}
      </h2>

      <div className="flex gap-3">
        <button
          onClick={onToday}
          className="px-6 py-2.5 font-body text-sm font-medium text-primary bg-secondary border border-default rounded-lg hover:bg-accent-primary-subtle hover:text-accent-primary hover:border-accent-primary transition-all"
        >
          Vandaag
        </button>
        <button
          onClick={onPreviousMonth}
          className="px-4 py-2.5 font-body text-lg font-medium text-accent-primary bg-secondary border border-default rounded-lg hover:bg-accent-primary-subtle hover:border-accent-primary transition-all"
        >
          ←
        </button>
        <button
          onClick={onNextMonth}
          className="px-4 py-2.5 font-body text-lg font-medium text-accent-primary bg-secondary border border-default rounded-lg hover:bg-accent-primary-subtle hover:border-accent-primary transition-all"
        >
          →
        </button>
      </div>
    </div>
  );
}
