import { Role, UserStatus, InventoryStatus, ItemCategory, MovementType, RequestStatus, Priority, NotificationType } from "@prisma/client";

export type { Role, UserStatus, InventoryStatus, ItemCategory, MovementType, RequestStatus, Priority, NotificationType };

export interface DashboardStats {
  totalInventory: number;
  totalConsumables: number;
  lowStockItems: number;
  nearExpiryItems: number;
  expiredItems: number;
  pendingRequests: number;
  approvedRequests: number;
  assignedEquipment: number;
}

export interface MonthlyUsage {
  month: string;
  stockIn: number;
  stockOut: number;
}

export interface DepartmentStats {
  departmentName: string;
  inventoryCount: number;
  consumableCount: number;
  assignedCount: number;
}

export interface RecentActivity {
  id: string;
  action: string;
  entityType: string;
  entityName: string;
  userName: string;
  createdAt: Date;
}

export interface InventoryItemWithRelations {
  id: string;
  propertyNumber: string;
  itemName: string;
  description: string | null;
  category: ItemCategory;
  brand: string | null;
  model: string | null;
  serialNumber: string | null;
  departmentId: string | null;
  departmentName: string | null;
  assignedUserName: string | null;
  fundCode: string | null;
  fundSource: string | null;
  supplier: string | null;
  purchaseDate: Date | null;
  purchaseCost: number | null;
  warrantyExpiration: Date | null;
  status: InventoryStatus;
  qrCode: string | null;
  createdAt: Date;
}

export interface ConsumableItemWithRelations {
  id: string;
  propertyNumber: string;
  itemName: string;
  category: string;
  description: string | null;
  quantity: number;
  unitType: string;
  batchNumber: string | null;
  expirationDate: Date | null;
  reorderLevel: number;
  criticalLevel: number;
  departmentId: string | null;
  departmentName: string | null;
  daysUntilExpiry: number | null;
  isLowStock: boolean;
  isCritical: boolean;
  isExpired: boolean;
  isNearExpiry: boolean;
}

export interface RequestWithRelations {
  id: string;
  requestNumber: string;
  consumableItemName: string;
  requesterName: string;
  requesterDepartment: string | null;
  quantity: number;
  purpose: string | null;
  status: RequestStatus;
  priority: Priority;
  approverName: string | null;
  approvedAt: Date | null;
  rejectionReason: string | null;
  releasedAt: Date | null;
  createdAt: Date;
  attachmentCount: number;
}

export interface UserWithRelations {
  id: string;
  name: string | null;
  email: string;
  role: Role;
  status: UserStatus;
  departmentId: string | null;
  departmentName: string | null;
  createdAt: Date;
  assignedItemsCount: number;
  requestsCount: number;
}

export interface AuditLogWithUser {
  id: string;
  userName: string | null;
  action: string;
  entityType: string;
  entityId: string;
  createdAt: Date;
}

export interface NotificationWithData {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  referenceId: string | null;
  createdAt: Date;
}

export interface ReportFilters {
  startDate?: Date;
  endDate?: Date;
  departmentId?: string;
  category?: string;
  status?: string;
}

export interface ExportData {
  headers: string[];
  rows: (string | number | null)[][];
  title: string;
  generatedAt: string;
}