import { z } from "zod";
import { Role, UserStatus, InventoryStatus, ItemCategory, RequestStatus, Priority, MovementType } from "@prisma/client";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  departmentId: z.string().optional(),
});

export const inventoryItemSchema = z.object({
  // FIX: Made optional since frontend says "Auto-generated if empty"
  // If your API auto-generates this, keep it optional. If not, remove optional and make it required in frontend too.
  propertyNumber: z.string().min(1, "Property number is required").optional(),
  
  itemName: z.string().min(1, "Item name is required"),
  description: z.string().optional(),
  category: z.nativeEnum(ItemCategory),
  brand: z.string().optional(),
  model: z.string().optional(),
  serialNumber: z.string().optional(),
  departmentId: z.string().optional(),
  fundCode: z.string().optional(),
  fundSource: z.string().optional(),
  supplier: z.string().optional(),
  purchaseDate: z.string().optional(),
  
  // FIX: Changed from z.string() to z.number() to match form input
  purchaseCost: z.number().min(0, "Purchase cost cannot be negative").optional(),
  
  warrantyExpiration: z.string().optional(),
  status: z.nativeEnum(InventoryStatus).default(InventoryStatus.AVAILABLE),
});

export const consumableItemSchema = z.object({
  propertyNumber: z.string().min(1, "Property number is required"),
  itemName: z.string().min(1, "Item name is required"),
  category: z.string().min(1, "Category is required"),
  description: z.string().optional(),
  quantity: z.number().min(0, "Quantity cannot be negative"),
  unitType: z.string().min(1, "Unit type is required"),
  batchNumber: z.string().optional(),
  expirationDate: z.string().optional(),
  reorderLevel: z.number().min(0).default(10),
  criticalLevel: z.number().min(0).default(5),
  departmentId: z.string().optional(),
  fundCode: z.string().optional(),
  fundSource: z.string().optional(),
  supplier: z.string().optional(),
  dateReceived: z.string().optional(),
});

export const stockMovementSchema = z.object({
  consumableItemId: z.string().min(1),
  type: z.nativeEnum(MovementType),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  reason: z.string().optional(),
  referenceNumber: z.string().optional(),
});

export const consumableRequestSchema = z.object({
  consumableItemId: z.string().min(1, "Item is required"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  purpose: z.string().min(1, "Purpose is required"),
  priority: z.nativeEnum(Priority).default(Priority.NORMAL),
});

export const requestApprovalSchema = z.object({
  requestId: z.string().min(1),
  action: z.enum(["approve", "reject"]),
  rejectionReason: z.string().optional(),
});

export const userSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  role: z.nativeEnum(Role).default(Role.USER),
  departmentId: z.string().optional(),
  status: z.nativeEnum(UserStatus).default(UserStatus.PENDING),
});

export const departmentSchema = z.object({
  name: z.string().min(1, "Name is required"),
  code: z.string().min(1, "Code is required"),
  description: z.string().optional(),
});

export const inventoryAssignmentSchema = z.object({
  inventoryItemId: z.string().min(1),
  userId: z.string().min(1),
  notes: z.string().optional(),
});

export const settingsSchema = z.object({
  appName: z.string().min(1),
  lowStockThreshold: z.number().min(1),
  expiryAlertDays: z.number().min(1),
  enableEmailNotifications: z.boolean().default(false),
});