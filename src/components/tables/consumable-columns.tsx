"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import Link from "next/link";

export interface ConsumableItem {
  id: string;
  propertyNumber: string;
  itemName: string;
  category: string;
  quantity: number;
  unitType: string;
  reorderLevel: number;
  criticalLevel: number;
  departmentName: string | null;
  isLowStock: boolean;
  isCritical: boolean;
}

export const consumableColumns: ColumnDef<ConsumableItem>[] = [
  {
    accessorKey: "propertyNumber",
    header: "Property #",
    cell: ({ row }) => (
      <span className="font-medium">{row.getValue("propertyNumber")}</span>
    ),
  },
  {
    accessorKey: "itemName",
    header: "Item Name",
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => (
      <Badge variant="outline">{row.getValue("category")}</Badge>
    ),
  },
  {
    accessorKey: "quantity",
    header: "Stock",
    cell: ({ row }) => {
      const item = row.original;
      if (item.isCritical) {
        return <Badge className="bg-red-100 text-red-800">{item.quantity}</Badge>;
      }
      if (item.isLowStock) {
        return <Badge className="bg-yellow-100 text-yellow-800">{item.quantity}</Badge>;
      }
      return <Badge className="bg-green-100 text-green-800">{item.quantity}</Badge>;
    },
  },
  {
    accessorKey: "unitType",
    header: "Unit",
  },
  {
    accessorKey: "departmentName",
    header: "Department",
    cell: ({ row }) => row.getValue("departmentName") || "N/A",
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <Link href={`/consumables/${row.original.id}`}>
        <Button variant="ghost" size="icon">
          <Eye className="h-4 w-4" />
        </Button>
      </Link>
    ),
  },
];