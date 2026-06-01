-- Smart Inventory & Logistics System
-- Database Migration Script
-- Run this after prisma db push for additional setup

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_inventory_items_status ON "inventory_items"("status");
CREATE INDEX IF NOT EXISTS idx_inventory_items_department ON "inventory_items"("departmentId");
CREATE INDEX IF NOT EXISTS idx_inventory_items_category ON "inventory_items"("category");
CREATE INDEX IF NOT EXISTS idx_inventory_items_deleted ON "inventory_items"("deletedAt") WHERE "deletedAt" IS NULL;

CREATE INDEX IF NOT EXISTS idx_consumable_items_quantity ON "consumable_items"("quantity");
CREATE INDEX IF NOT EXISTS idx_consumable_items_expiry ON "consumable_items"("expirationDate");
CREATE INDEX IF NOT EXISTS idx_consumable_items_department ON "consumable_items"("departmentId");
CREATE INDEX IF NOT EXISTS idx_consumable_items_deleted ON "consumable_items"("deletedAt") WHERE "deletedAt" IS NULL;

CREATE INDEX IF NOT EXISTS idx_requests_status ON "consumable_requests"("status");
CREATE INDEX IF NOT EXISTS idx_requests_requester ON "consumable_requests"("requesterId");
CREATE INDEX IF NOT EXISTS idx_requests_created ON "consumable_requests"("createdAt");

CREATE INDEX IF NOT EXISTS idx_stock_movements_item ON "stock_movements"("consumableItemId");
CREATE INDEX IF NOT EXISTS idx_stock_movements_date ON "stock_movements"("createdAt");

CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON "audit_logs"("entityType", "entityId");
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON "audit_logs"("userId");
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON "audit_logs"("createdAt");

CREATE INDEX IF NOT EXISTS idx_notifications_user ON "notifications"("userId", "isRead");
CREATE INDEX IF NOT EXISTS idx_notifications_created ON "notifications"("createdAt");

-- Create views for common queries
CREATE OR REPLACE VIEW v_low_stock AS
SELECT 
  ci.id,
  ci."propertyNumber",
  ci."itemName",
  ci.category,
  ci.quantity,
  ci."reorderLevel",
  ci."criticalLevel",
  d.name as department
FROM "consumable_items" ci
LEFT JOIN "departments" d ON ci."departmentId" = d.id
WHERE ci."deletedAt" IS NULL
  AND ci.quantity <= ci."reorderLevel";

CREATE OR REPLACE VIEW v_expired_items AS
SELECT 
  ci.id,
  ci."propertyNumber",
  ci."itemName",
  ci.category,
  ci."batchNumber",
  ci."expirationDate",
  d.name as department
FROM "consumable_items" ci
LEFT JOIN "departments" d ON ci."departmentId" = d.id
WHERE ci."deletedAt" IS NULL
  AND ci."expirationDate" <= CURRENT_DATE;

CREATE OR REPLACE VIEW v_assigned_inventory AS
SELECT 
  ii.id,
  ii."propertyNumber",
  ii."itemName",
  ii.category,
  ii.status,
  u.name as "assignedTo",
  u.email as "assignedEmail",
  d.name as department,
  ia."assignedAt"
FROM "inventory_items" ii
JOIN "inventory_assignments" ia ON ii.id = ia."inventoryItemId"
JOIN "users" u ON ia."userId" = u.id
LEFT JOIN "departments" d ON ii."departmentId" = d.id
WHERE ii."deletedAt" IS NULL
  AND ia."returnedAt" IS NULL;

-- Create function for automatic audit logging
CREATE OR REPLACE FUNCTION log_inventory_change()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO "audit_logs" ("action", "entityType", "entityId", "oldValues", "newValues", "createdAt")
  VALUES (
    CASE 
      WHEN TG_OP = 'INSERT' THEN 'INVENTORY_CREATED'
      WHEN TG_OP = 'UPDATE' THEN 'INVENTORY_UPDATED'
      WHEN TG_OP = 'DELETE' THEN 'INVENTORY_DELETED'
    END,
    'INVENTORY_ITEM',
    COALESCE(NEW.id, OLD.id),
    CASE WHEN TG_OP = 'DELETE' THEN row_to_json(OLD) ELSE row_to_json(OLD) END,
    CASE WHEN TG_OP = 'DELETE' THEN NULL ELSE row_to_json(NEW) END,
    NOW()
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Add comments for documentation
COMMENT ON TABLE "users" IS 'System users with role-based access';
COMMENT ON TABLE "inventory_items" IS 'Non-consumable equipment and assets';
COMMENT ON TABLE "consumable_items" IS 'Consumable supplies with stock tracking';
COMMENT ON TABLE "consumable_requests" IS 'Item request workflow';
COMMENT ON TABLE "audit_logs" IS 'Complete activity tracking';
COMMENT ON TABLE "notifications" IS 'User notification system';