"use client";

// src/app/(dashboard)/my-inventory/page.tsx

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  Package,
  Search,
  Eye,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/lib/utils";

function getStockBadge(qty: number) {
  if (qty === 0)
    return (
      <Badge className="bg-red-100 text-red-800 flex items-center gap-1 w-fit">
        <AlertTriangle className="h-3 w-3" />
        Empty
      </Badge>
    );
  if (qty <= 5)
    return (
      <Badge className="bg-yellow-100 text-yellow-800 flex items-center gap-1 w-fit">
        <AlertTriangle className="h-3 w-3" />
        Low ({qty})
      </Badge>
    );
  return (
    <Badge className="bg-green-100 text-green-800 flex items-center gap-1 w-fit">
      <CheckCircle2 className="h-3 w-3" />
      {qty}
    </Badge>
  );
}

export default function MyInventoryPage() {
  const { data: session } = useSession();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const limit = 10;

  const { data, isLoading } = useQuery({
    queryKey: ["my-inventory", page, search],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set("page", page.toString());
      params.set("limit", limit.toString());
      if (search) params.set("search", search);

      const res = await fetch(`/api/my-inventory?${params}`);
      if (!res.ok) throw new Error("Failed to fetch inventory");
      return res.json();
    },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Package className="h-6 w-6 text-blue-600" />
          My Inventory
        </h1>
        <p className="text-gray-500 mt-1">
          Consumable items assigned to you. Record distributions, usage, and
          transfers here.
        </p>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search items..."
              className="pl-10"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Expiration</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-gray-400">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : data?.items?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12 text-gray-400">
                    <Package className="h-10 w-10 mx-auto mb-2 opacity-30" />
                    <p className="font-medium">No items in your inventory</p>
                    <p className="text-sm mt-1">
                      Submit a{" "}
                      <Link href="/requests/new" className="text-blue-600 underline">
                        consumable request
                      </Link>{" "}
                      to receive items.
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                data?.items?.map((item: any) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{item.itemName}</p>
                        {item.description && (
                          <p className="text-xs text-gray-500 truncate max-w-[180px]">
                            {item.description}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {item.category.replace(/_/g, " ")}
                      </Badge>
                    </TableCell>
                    <TableCell>{getStockBadge(item.quantity)}</TableCell>
                    <TableCell className="text-gray-600">{item.unitType}</TableCell>
                    <TableCell>{item.departmentName || "N/A"}</TableCell>
                    <TableCell>
                      {item.expirationDate ? (
                        <span
                          className={
                            new Date(item.expirationDate) < new Date()
                              ? "text-red-600 font-medium"
                              : "text-gray-700"
                          }
                        >
                          {formatDate(item.expirationDate)}
                        </span>
                      ) : (
                        <span className="text-gray-400">N/A</span>
                      )}
                    </TableCell>
                    <TableCell className="text-gray-500 text-sm">
                      {formatDate(item.updatedAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/my-inventory/${item.id}`}>
                        <Button variant="ghost" size="icon">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      {data?.pagination && data.pagination.pages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Showing {(page - 1) * limit + 1} –{" "}
            {Math.min(page * limit, data.pagination.total)} of{" "}
            {data.pagination.total} items
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              onClick={() => setPage(page + 1)}
              disabled={page === data.pagination.pages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}