import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date, locale: string = 'en'): string {
  return new Date(date).toLocaleDateString(locale === 'he' ? 'he-IL' : 'en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export function getDayName(dayOfWeek: number, locale: string = 'en'): string {
  const date = new Date(2024, 0, dayOfWeek); // Jan 2024, Sun=0
  const shifted = new Date(date);
  shifted.setDate(shifted.getDate() + (dayOfWeek - shifted.getDay()));
  return shifted.toLocaleDateString(locale === 'he' ? 'he-IL' : 'en-US', { weekday: 'long' });
}

export function getWeekStart(date: Date = new Date(), weekStartsOn: number = 0): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = (day - weekStartsOn + 7) % 7;
  d.setDate(d.getDate() - diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function getWeekDates(weekStart: Date): Date[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d;
  });
}
