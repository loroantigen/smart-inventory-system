"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  History,
  PackagePlus,
  PackageMinus,
  ArrowLeftRight,
  Search,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDateTime } from "@/lib/utils";
import { Pagination } from "@/components/pagination";

export default function StockMovementsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [limit] = useState(20);

  const { data, isLoading } = useQuery({
    queryKey: ["stock-movements", page, search, activeTab],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set("page", page.toString());
      params.set("limit", limit.toString());
      if (search) params.set("search", search);
      if (activeTab !== "all") params.set("type", activeTab);

      const res = await fetch(`/api/stock-movements?${params}`);
      if (!res.ok) throw new Error("Failed to fetch movements");
      return res.json();
    },
  });

  const getMovementIcon = (type: string) => {
    switch (type) {
      case "STOCK_IN":
        return <PackagePlus className="h-4 w-4 text-green-600" />;
      case "STOCK_OUT":
        return <PackageMinus className="h-4 w-4 text-red-600" />;
      case "ADJUSTMENT":
        return <ArrowLeftRight className="h-4 w-4 text-blue-600" />;
      default:
        return <History className="h-4 w-4 text-gray-400" />;
    }
  };

  const getMovementBadge = (type: string) => {
    const colors: Record<string, string> = {
      STOCK_IN: "bg-green-100 text-green-800",
      STOCK_OUT: "bg-red-100 text-red-800",
      ADJUSTMENT: "bg-blue-100 text-blue-800",
      RETURN: "bg-purple-100 text-purple-800",
    };
    return <Badge className={colors[type] || "bg-gray-100"}>{type.replace(/_/g, " ")}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Stock Movements</h1>
        <p className="text-gray-500 mt-1">Track all stock-in, stock-out, and adjustment transactions</p>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4">
            <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); setPage(1); }}>
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="STOCK_IN">Stock In</TabsTrigger>
                <TabsTrigger value="STOCK_OUT">Stock Out</TabsTrigger>
                <TabsTrigger value="ADJUSTMENT">Adjustment</TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search movements..."
                className="pl-10"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Item</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Previous</TableHead>
                <TableHead>New</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Reference</TableHead>
                <TableHead>By</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8">Loading...</TableCell>
                </TableRow>
              ) : data?.movements?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                    No stock movements found
                  </TableCell>
                </TableRow>
              ) : (
                data?.movements?.map((movement: any) => (
                  <TableRow key={movement.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getMovementIcon(movement.type)}
                        {getMovementBadge(movement.type)}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {movement.consumableItem?.itemName || "N/A"}
                    </TableCell>
                    <TableCell className={
                      movement.type === "STOCK_IN" ? "text-green-600" : "text-red-600"
                    }>
                      {movement.type === "STOCK_IN" ? "+" : "-"}{movement.quantity}
                    </TableCell>
                    <TableCell>{movement.previousQuantity}</TableCell>
                    <TableCell>{movement.newQuantity}</TableCell>
                    <TableCell>{movement.reason || "N/A"}</TableCell>
                    <TableCell>{movement.referenceNumber || "N/A"}</TableCell>
                    <TableCell>{movement.user?.name || "System"}</TableCell>
                    <TableCell>{formatDateTime(movement.createdAt)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {data?.pagination && (
        <Pagination
          page={page}
          totalPages={data.pagination.pages}
          total={data.pagination.total}
          limit={limit}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}