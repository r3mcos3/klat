import { useState, useEffect } from 'react';
import { formatDateNL } from '@/utils/dateHelpers';

export function LiveDateTime() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute instead of every second

    return () => clearInterval(timer);
  }, []);

  const timeString = formatDateNL(currentTime, 'HH:mm');
  const dateString = formatDateNL(currentTime, 'EEEE d MMMM yyyy');

  return (
    <div className="text-center">
      <div className="text-3xl font-bold text-gray-800 dark:text-gray-100 tabular-nums">
        {timeString}
      </div>
      <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
        {dateString}
      </div>
    </div>
  );
}
