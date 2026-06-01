-- CreateEnum
CREATE TYPE "UserDistributionType" AS ENUM ('DISTRIBUTED', 'USED', 'TRANSFERRED');

-- CreateTable
CREATE TABLE "UserConsumableInventory" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "consumableItemId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserConsumableInventory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserDistribution" (
    "id" TEXT NOT NULL,
    "inventoryId" TEXT NOT NULL,
    "performedBy" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "type" "UserDistributionType" NOT NULL,
    "recipientName" TEXT,
    "recipientDept" TEXT,
    "location" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserDistribution_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserConsumableInventory_userId_idx" ON "UserConsumableInventory"("userId");

-- CreateIndex
CREATE INDEX "UserConsumableInventory_consumableItemId_idx" ON "UserConsumableInventory"("consumableItemId");

-- CreateIndex
CREATE UNIQUE INDEX "UserConsumableInventory_userId_consumableItemId_key" ON "UserConsumableInventory"("userId", "consumableItemId");

-- CreateIndex
CREATE INDEX "UserDistribution_inventoryId_idx" ON "UserDistribution"("inventoryId");

-- CreateIndex
CREATE INDEX "UserDistribution_performedBy_idx" ON "UserDistribution"("performedBy");

-- CreateIndex
CREATE INDEX "UserDistribution_createdAt_idx" ON "UserDistribution"("createdAt");

-- AddForeignKey
ALTER TABLE "UserConsumableInventory" ADD CONSTRAINT "UserConsumableInventory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserConsumableInventory" ADD CONSTRAINT "UserConsumableInventory_consumableItemId_fkey" FOREIGN KEY ("consumableItemId") REFERENCES "ConsumableItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserDistribution" ADD CONSTRAINT "UserDistribution_inventoryId_fkey" FOREIGN KEY ("inventoryId") REFERENCES "UserConsumableInventory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserDistribution" ADD CONSTRAINT "UserDistribution_performedBy_fkey" FOREIGN KEY ("performedBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
