import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting database seed...");

  // Create departments
  const departments = await Promise.all([
    prisma.department.upsert({
      where: { code: "IT" },
      update: {},
      create: { name: "IT Department", code: "IT", description: "Information Technology" },
    }),
    prisma.department.upsert({
      where: { code: "HR" },
      update: {},
      create: { name: "HR Department", code: "HR", description: "Human Resources" },
    }),
    prisma.department.upsert({
      where: { code: "FIN" },
      update: {},
      create: { name: "Finance", code: "FIN", description: "Finance Department" },
    }),
    prisma.department.upsert({
      where: { code: "OPS" },
      update: {},
      create: { name: "Operations", code: "OPS", description: "Operations Department" },
    }),
    prisma.department.upsert({
      where: { code: "MED" },
      update: {},
      create: { name: "Medical", code: "MED", description: "Medical Department" },
    }),
  ]);

  console.log(`Created ${departments.length} departments`);

  // Create users with hashed passwords
  const adminPassword = await bcrypt.hash("admin123", 12);
  const moderatorPassword = await bcrypt.hash("moderator123", 12);
  const userPassword = await bcrypt.hash("user123", 12);

  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: "admin@example.com" },
      update: {},
      create: {
        name: "System Administrator",
        email: "admin@example.com",
        password: adminPassword,
        role: "ADMIN",
        status: "ACTIVE",
        departmentId: departments[0].id,
      },
    }),
    prisma.user.upsert({
      where: { email: "moderator@example.com" },
      update: {},
      create: {
        name: "Logistics Officer",
        email: "moderator@example.com",
        password: moderatorPassword,
        role: "MODERATOR",
        status: "ACTIVE",
        departmentId: departments[3].id,
      },
    }),
    prisma.user.upsert({
      where: { email: "user@example.com" },
      update: {},
      create: {
        name: "Field Staff",
        email: "user@example.com",
        password: userPassword,
        role: "USER",
        status: "ACTIVE",
        departmentId: departments[1].id,
      },
    }),
  ]);

  console.log(`Created ${users.length} users`);

  // Create sample inventory items
  const inventoryItems = await Promise.all([
    prisma.inventoryItem.create({
      data: {
        propertyNumber: "INV-2024-001",
        itemName: "Dell Latitude 5520",
        description: "Business laptop with Intel i7",
        category: "ELECTRONICS",
        brand: "Dell",
        model: "Latitude 5520",
        serialNumber: "SN123456789",
        departmentId: departments[0].id,
        fundCode: "FUND-001",
        fundSource: "Government",
        supplier: "Dell Philippines",
        purchaseDate: new Date("2024-01-15"),
        purchaseCost: 85000.00,
        warrantyExpiration: new Date("2027-01-15"),
        status: "AVAILABLE",
      },
    }),
    prisma.inventoryItem.create({
      data: {
        propertyNumber: "INV-2024-002",
        itemName: "HP LaserJet Pro",
        description: "Network printer",
        category: "ELECTRONICS",
        brand: "HP",
        model: "LaserJet Pro M404n",
        serialNumber: "SN987654321",
        departmentId: departments[1].id,
        fundCode: "FUND-002",
        fundSource: "Government",
        supplier: "HP Philippines",
        purchaseDate: new Date("2024-02-20"),
        purchaseCost: 25000.00,
        warrantyExpiration: new Date("2026-02-20"),
        status: "ASSIGNED",
      },
    }),
    prisma.inventoryItem.create({
      data: {
        propertyNumber: "INV-2024-003",
        itemName: "Office Chair",
        description: "Ergonomic office chair",
        category: "FURNITURE",
        brand: "Steelcase",
        model: "Series 1",
        departmentId: departments[0].id,
        fundCode: "FUND-003",
        fundSource: "Government",
        supplier: "Steelcase PH",
        purchaseDate: new Date("2024-03-10"),
        purchaseCost: 15000.00,
        status: "AVAILABLE",
      },
    }),
  ]);

  console.log(`Created ${inventoryItems.length} inventory items`);

  // Create sample consumable items
  const consumableItems = await Promise.all([
    prisma.consumableItem.create({
      data: {
        propertyNumber: "CON-2024-001",
        itemName: "Isopropyl Alcohol",
        category: "Medical",
        description: "70% Isopropyl Alcohol for disinfection",
        quantity: 50,
        unitType: "bottle",
        batchNumber: "BATCH-001",
        expirationDate: new Date("2025-12-31"),
        reorderLevel: 20,
        criticalLevel: 10,
        departmentId: departments[4].id,
        fundCode: "FUND-MED-001",
        fundSource: "Health Fund",
        supplier: "Medical Supplies Inc.",
        dateReceived: new Date("2024-01-01"),
      },
    }),
    prisma.consumableItem.create({
      data: {
        propertyNumber: "CON-2024-002",
        itemName: "Bond Paper A4",
        category: "Office Supplies",
        description: "Premium quality A4 bond paper",
        quantity: 15,
        unitType: "ream",
        reorderLevel: 20,
        criticalLevel: 5,
        departmentId: departments[1].id,
        fundCode: "FUND-OPS-001",
        fundSource: "Operations Fund",
        supplier: "Office Depot",
        dateReceived: new Date("2024-02-15"),
      },
    }),
    prisma.consumableItem.create({
      data: {
        propertyNumber: "CON-2024-003",
        itemName: "Printer Ink Cartridge",
        category: "IT Supplies",
        description: "HP 26A Black Toner Cartridge",
        quantity: 8,
        unitType: "piece",
        batchNumber: "BATCH-INK-001",
        expirationDate: new Date("2025-06-30"),
        reorderLevel: 5,
        criticalLevel: 2,
        departmentId: departments[0].id,
        fundCode: "FUND-IT-001",
        fundSource: "IT Fund",
        supplier: "HP Philippines",
        dateReceived: new Date("2024-03-01"),
      },
    }),
    prisma.consumableItem.create({
      data: {
        propertyNumber: "CON-2024-004",
        itemName: "Face Mask N95",
        category: "Medical",
        description: "N95 Respirator Face Mask",
        quantity: 200,
        unitType: "box",
        batchNumber: "BATCH-FM-001",
        expirationDate: new Date("2026-01-01"),
        reorderLevel: 50,
        criticalLevel: 20,
        departmentId: departments[4].id,
        fundCode: "FUND-MED-002",
        fundSource: "Health Fund",
        supplier: "Medical Supplies Inc.",
        dateReceived: new Date("2024-01-15"),
      },
    }),
    prisma.consumableItem.create({
      data: {
        propertyNumber: "CON-2024-005",
        itemName: "Disinfectant Spray",
        category: "Cleaning",
        description: "Multi-purpose disinfectant spray",
        quantity: 3,
        unitType: "bottle",
        reorderLevel: 10,
        criticalLevel: 5,
        departmentId: departments[3].id,
        fundCode: "FUND-OPS-002",
        fundSource: "Operations Fund",
        supplier: "Clean Solutions",
        dateReceived: new Date("2024-02-01"),
      },
    }),
  ]);

  console.log(`Created ${consumableItems.length} consumable items`);

  // Create stock movements
  await prisma.stockMovement.createMany({
    data: [
      {
        consumableItemId: consumableItems[0].id,
        type: "STOCK_IN",
        quantity: 50,
        previousQuantity: 0,
        newQuantity: 50,
        reason: "Initial stock",
        performedBy: users[1].id,
      },
      {
        consumableItemId: consumableItems[1].id,
        type: "STOCK_IN",
        quantity: 30,
        previousQuantity: 0,
        newQuantity: 30,
        reason: "Initial stock",
        performedBy: users[1].id,
      },
      {
        consumableItemId: consumableItems[1].id,
        type: "STOCK_OUT",
        quantity: 15,
        previousQuantity: 30,
        newQuantity: 15,
        reason: "Monthly consumption",
        performedBy: users[1].id,
      },
      {
        consumableItemId: consumableItems[2].id,
        type: "STOCK_IN",
        quantity: 10,
        previousQuantity: 0,
        newQuantity: 10,
        reason: "Initial stock",
        performedBy: users[1].id,
      },
      {
        consumableItemId: consumableItems[2].id,
        type: "STOCK_OUT",
        quantity: 2,
        previousQuantity: 10,
        newQuantity: 8,
        reason: "Printer maintenance",
        performedBy: users[1].id,
      },
    ],
  });

  console.log("Created stock movements");

  // Create sample requests
  await prisma.consumableRequest.createMany({
    data: [
      {
        requestNumber: "REQ-202401-ABC1",
        consumableItemId: consumableItems[0].id,
        requesterId: users[2].id,
        quantity: 5,
        purpose: "Medical team supplies for field work",
        status: "APPROVED",
        priority: "HIGH",
        approvedBy: users[1].id,
        approvedAt: new Date("2024-01-20"),
      },
      {
        requestNumber: "REQ-202402-DEF2",
        consumableItemId: consumableItems[1].id,
        requesterId: users[2].id,
        quantity: 2,
        purpose: "Monthly office supply request",
        status: "PENDING",
        priority: "NORMAL",
      },
      {
        requestNumber: "REQ-202403-GHI3",
        consumableItemId: consumableItems[3].id,
        requesterId: users[2].id,
        quantity: 10,
        purpose: "Emergency medical supplies",
        status: "APPROVED",
        priority: "URGENT",
        approvedBy: users[1].id,
        approvedAt: new Date("2024-03-15"),
      },
    ],
  });

  console.log("Created sample requests");

  // Create inventory assignment
  await prisma.inventoryAssignment.create({
    data: {
      inventoryItemId: inventoryItems[1].id,
      userId: users[2].id,
      assignedBy: users[1].id,
      notes: "Assigned for daily operations",
    },
  });

  console.log("Created inventory assignment");

  console.log("Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });