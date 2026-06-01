import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string | null): string {
  if (!date) return "N/A";
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(date));
}

export function formatDateTime(date: Date | string | null): string {
  if (!date) return "N/A";
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export function formatCurrency(amount: number | null): string {
  if (amount === null || amount === undefined) return "N/A";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

export function generatePropertyNumber(prefix: string = "INV"): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

export function generateRequestNumber(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `REQ-${year}${month}-${random}`;
}

export function getDaysUntilExpiration(date: Date | string | null): number | null {
  if (!date) return null;
  const expDate = new Date(date);
  const today = new Date();
  const diffTime = expDate.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    AVAILABLE: "bg-green-100 text-green-800",
    ASSIGNED: "bg-blue-100 text-blue-800",
    REPAIR: "bg-yellow-100 text-yellow-800",
    LOST: "bg-red-100 text-red-800",
    CONDEMNED: "bg-gray-100 text-gray-800",
    ARCHIVED: "bg-purple-100 text-purple-800",
    PENDING: "bg-yellow-100 text-yellow-800",
    APPROVED: "bg-green-100 text-green-800",
    REJECTED: "bg-red-100 text-red-800",
    RELEASED: "bg-blue-100 text-blue-800",
    CANCELLED: "bg-gray-100 text-gray-800",
    ACTIVE: "bg-green-100 text-green-800",
    SUSPENDED: "bg-red-100 text-red-800",
    LOW: "bg-green-100 text-green-800",
    NORMAL: "bg-blue-100 text-blue-800",
    HIGH: "bg-yellow-100 text-yellow-800",
    URGENT: "bg-red-100 text-red-800",
  };
  return colors[status] || "bg-gray-100 text-gray-800";
}

export function truncateText(text: string, maxLength: number = 50): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
}