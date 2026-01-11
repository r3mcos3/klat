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
      <h2 className="font-display text-5xl font-bold text-charcoal-900 dark:text-charcoal-900 capitalize tracking-tight">
        {getMonthName(currentDate)}
      </h2>

      <div className="flex gap-3">
        <button
          onClick={onToday}
          className="px-6 py-2.5 font-body text-sm font-medium text-charcoal-900 dark:text-charcoal-900 bg-white dark:bg-cream-100 border border-cream-100 dark:border-charcoal-700 rounded-lg hover:bg-terracotta-100 dark:hover:bg-terracotta-100/10 hover:text-terracotta-600 hover:border-terracotta-500 transition-all"
        >
          Vandaag
        </button>
        <button
          onClick={onPreviousMonth}
          className="px-4 py-2.5 font-body text-lg font-medium text-terracotta-500 bg-white dark:bg-cream-100 border border-cream-100 dark:border-charcoal-700 rounded-lg hover:bg-terracotta-100 dark:hover:bg-terracotta-100/10 hover:border-terracotta-500 transition-all"
        >
          ←
        </button>
        <button
          onClick={onNextMonth}
          className="px-4 py-2.5 font-body text-lg font-medium text-terracotta-500 bg-white dark:bg-cream-100 border border-cream-100 dark:border-charcoal-700 rounded-lg hover:bg-terracotta-100 dark:hover:bg-terracotta-100/10 hover:border-terracotta-500 transition-all"
        >
          →
        </button>
      </div>
    </div>
  );
}
