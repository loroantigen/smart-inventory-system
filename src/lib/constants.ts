export const APP_NAME = "Smart Inventory & Logistics System";
export const APP_VERSION = "1.0.0";
export const APP_URL = process.env.NEXTAUTH_URL || "http://localhost:3000";

export const ROLES = {
  ADMIN: "ADMIN",
  MODERATOR: "MODERATOR",
  USER: "USER",
} as const;

export const USER_STATUSES = {
  ACTIVE: "ACTIVE",
  PENDING: "PENDING",
  SUSPENDED: "SUSPENDED",
} as const;

export const INVENTORY_CATEGORIES = [
  "ELECTRONICS",
  "FURNITURE",
  "VEHICLE",
  "EQUIPMENT",
  "TOOLS",
  "OFFICE_SUPPLIES",
  "MEDICAL",
  "OTHER",
] as const;

export const INVENTORY_STATUSES = [
  "AVAILABLE",
  "ASSIGNED",
  "REPAIR",
  "LOST",
  "CONDEMNED",
  "ARCHIVED",
] as const;

export const REQUEST_STATUSES = [
  "PENDING",
  "APPROVED",
  "REJECTED",
  "RELEASED",
  "CANCELLED",
] as const;

export const PRIORITIES = [
  "LOW",
  "NORMAL",
  "HIGH",
  "URGENT",
] as const;

export const MOVEMENT_TYPES = [
  "STOCK_IN",
  "STOCK_OUT",
  "ADJUSTMENT",
  "RETURN",
] as const;

export const NOTIFICATION_TYPES = [
  "LOW_STOCK",
  "EXPIRATION",
  "REQUEST_APPROVED",
  "REQUEST_REJECTED",
  "ITEM_ASSIGNED",
  "SYSTEM",
] as const;

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_FILE_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/jpg",
  "image/png",
];

export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 100;

export const SESSION_MAX_AGE = 30 * 24 * 60 * 60; // 30 days
export const TOKEN_MAX_AGE = 30 * 24 * 60 * 60; // 30 days