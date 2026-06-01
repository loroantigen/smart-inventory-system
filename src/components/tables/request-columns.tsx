"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";
import { formatDateTime, getStatusColor } from "@/lib/utils";

export interface RequestItem {
  id: string;
  requestNumber: string;
  consumableItemName: string;
  requesterName: string;
  quantity: number;
  status: string;
  priority: string;
  createdAt: string;
}

export const requestColumns: ColumnDef<RequestItem>[] = [
  {
    accessorKey: "requestNumber",
    header: "Request #",
    cell: ({ row }) => (
      <span className="font-medium">{row.getValue("requestNumber")}</span>
    ),
  },
  {
    accessorKey: "consumableItemName",
    header: "Item",
  },
  {
    accessorKey: "requesterName",
    header: "Requester",
  },
  {
    accessorKey: "quantity",
    header: "Qty",
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
    accessorKey: "priority",
    header: "Priority",
    cell: ({ row }) => {
      const priority = row.getValue("priority") as string;
      const colors: Record<string, string> = {
        LOW: "bg-green-100 text-green-800",
        NORMAL: "bg-blue-100 text-blue-800",
        HIGH: "bg-yellow-100 text-yellow-800",
        URGENT: "bg-red-100 text-red-800",
      };
      return <Badge className={colors[priority] || "bg-gray-100"}>{priority}</Badge>;
    },
  },
  {
    accessorKey: "createdAt",
    header: "Date",
    cell: ({ row }) => formatDateTime(row.getValue("createdAt")),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Link href={`/requests/${row.original.id}`}>
          <Button variant="ghost" size="icon">
            <Eye className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    ),
  },
];