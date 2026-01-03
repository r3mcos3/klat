import { useState, useEffect } from 'react';
import { formatDateNL } from '@/utils/dateHelpers';

export function LiveDateTime() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const timeString = formatDateNL(currentTime, 'HH:mm:ss');
  const dateString = formatDateNL(currentTime, 'EEEE d MMMM yyyy');

  return (
    <div className="text-center">
      <div className="text-3xl font-bold text-gray-800 tabular-nums">
        {timeString}
      </div>
      <div className="text-sm text-gray-600 mt-1">
        {dateString}
      </div>
    </div>
  );
}
