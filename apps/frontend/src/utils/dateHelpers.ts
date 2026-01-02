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
import { nl } from 'date-fns/locale';

export const formatDate = (date: Date, formatStr: string = 'yyyy-MM-dd'): string => {
  return format(date, formatStr);
};

export const formatDateNL = (date: Date, formatStr: string = 'd MMMM yyyy'): string => {
  return format(date, formatStr, { locale: nl });
};

export const getMonthDays = (date: Date): Date[] => {
  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(date);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 }); // Monday
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
};

export const getMonthName = (date: Date): string => {
  return format(date, 'MMMM yyyy', { locale: nl });
};

export const getWeekDays = (): string[] => {
  return ['Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za', 'Zo'];
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
