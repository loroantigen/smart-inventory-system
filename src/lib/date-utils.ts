import { format, formatDistanceToNow, isPast, isFuture, differenceInDays } from "date-fns";

export function formatRelativeDate(date: Date | string | null): string {
  if (!date) return "N/A";
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function formatShortDate(date: Date | string | null): string {
  if (!date) return "N/A";
  return format(new Date(date), "MMM d, yyyy");
}

export function formatFullDateTime(date: Date | string | null): string {
  if (!date) return "N/A";
  return format(new Date(date), "EEEE, MMMM do, yyyy 'at' h:mm a");
}

export function isExpired(date: Date | string | null): boolean {
  if (!date) return false;
  return isPast(new Date(date));
}

export function isUpcoming(date: Date | string | null, days: number = 7): boolean {
  if (!date) return false;
  const targetDate = new Date(date);
  const now = new Date();
  const diff = differenceInDays(targetDate, now);
  return diff >= 0 && diff <= days;
}

export function getDaysRemaining(date: Date | string | null): number | null {
  if (!date) return null;
  const diff = differenceInDays(new Date(date), new Date());
  return diff;
}

export function formatDuration(start: Date | string, end: Date | string): string {
  const days = differenceInDays(new Date(end), new Date(start));
  if (days === 0) return "Same day";
  if (days === 1) return "1 day";
  return `${days} days`;
}

export function getQuarter(date: Date = new Date()): number {
  return Math.floor(date.getMonth() / 3) + 1;
}

export function getFiscalYear(date: Date = new Date(), startMonth: number = 0): number {
  const month = date.getMonth();
  const year = date.getFullYear();
  return month < startMonth ? year : year + 1;
}