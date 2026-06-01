import { z } from "zod";

export const emailSchema = z.string().email("Invalid email address");

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number");

export const phoneSchema = z
  .string()
  .regex(/^[+]?[\d\s\-()]+$/, "Invalid phone number format");

export const urlSchema = z.string().url("Invalid URL format");

export const uuidSchema = z.string().uuid("Invalid UUID format");

export function sanitizeString(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, "")
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}

export function isValidPropertyNumber(input: string): boolean {
  return /^[A-Z]{3}-[A-Z0-9]+-[A-Z0-9]+$/i.test(input);
}

export function isValidSerialNumber(input: string): boolean {
  return /^[A-Z0-9-]+$/i.test(input);
}