"use client";

import Link from "next/link";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Edit, Trash2 } from "lucide-react";
import { formatDate, getStatusColor } from "@/lib/utils";

export interface InventoryItem {
  id: string;
  propertyNumber: string;
  itemName: string;
  category: string;
  status: string;
  departmentName: string | null;
  assignedUserName: string | null;
  purchaseDate: string | null;
}

export const inventoryColumns: ColumnDef<InventoryItem>[] = [
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
    cell: ({ row }) => (
      <div>
        <p className="font-medium">{row.getValue("itemName")}</p>
      </div>
    ),
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => (
      <Badge variant="outline">
        {(row.getValue("category") as string).replace(/_/g, " ")}
      </Badge>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge className={getStatusColor(row.getValue("status"))}>
        {row.getValue("status")}
      </Badge>
    ),
  },
  {
    accessorKey: "departmentName",
    header: "Department",
    cell: ({ row }) => row.getValue("departmentName") || "N/A",
  },
  {
    accessorKey: "assignedUserName",
    header: "Assigned To",
    cell: ({ row }) => row.getValue("assignedUserName") || "Unassigned",
  },
  {
    accessorKey: "purchaseDate",
    header: "Purchase Date",
    cell: ({ row }) => formatDate(row.getValue("purchaseDate")),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Link href={`/inventory/${row.original.id}`}>
          <Button variant="ghost" size="icon">
            <Eye className="h-4 w-4" />
          </Button>
        </Link>
        <Button variant="ghost" size="icon">
          <Edit className="h-4 w-4" />
        </Button>
      </div>
    ),
  },
];