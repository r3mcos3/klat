import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
} from 'date-fns';
import { enGB } from 'date-fns/locale';

export const formatDate = (date: Date, formatStr: string = 'yyyy-MM-dd'): string => {
  return format(date, formatStr);
};

export const formatDateNL = (date: Date, formatStr: string = 'd MMMM yyyy'): string => {
  return format(date, formatStr, { locale: enGB });
};

export const formatCompletedAt = (dateString: string): string => {
  const date = new Date(dateString);
  return format(date, 'dd-MM-yy HH:mm', { locale: enGB });
};

// Format timestamp with explicit local time conversion
export const formatTimestamp = (dateString: string, formatStr: string = 'd MMMM yyyy, HH:mm'): string => {
  // Parse the ISO string to a Date object (automatically converts to local time)
  const date = new Date(dateString);
  // Format using local time
  return format(date, formatStr, { locale: enGB });
};

export const getMonthDays = (date: Date): Date[] => {
  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(date);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 }); // Monday
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
};

export const getMonthName = (date: Date): string => {
  return format(date, 'MMMM yyyy', { locale: enGB });
};

export const getWeekDays = (): string[] => {
  return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
};

export const isSameDayUtil = (date1: Date, date2: Date): boolean => {
  return isSameDay(date1, date2);
};

export const isSameMonthUtil = (date1: Date, date2: Date): boolean => {
  return isSameMonth(date1, date2);
};

export const isTodayUtil = (date: Date): boolean => {
  return isToday(date);
};

export const nextMonth = (date: Date): Date => {
  return addMonths(date, 1);
};

export const previousMonth = (date: Date): Date => {
  return subMonths(date, 1);
};

export const dateToString = (date: Date): string => {
  return format(date, 'yyyy-MM-dd');
};

export const stringToDate = (dateStr: string): Date => {
  return new Date(dateStr);
};
