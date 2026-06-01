"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Boxes,
  Search,
  Plus,
  Filter,
  AlertTriangle,
  Clock,
  Eye,
  Edit,
  Archive,
  ArrowUpDown,
  PackagePlus,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDate, getStatusColor } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/confirm-dialog";

export default function ConsumablesPage() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("ALL");
  const [activeTab, setActiveTab] = useState("all");
  const [limit] = useState(10);

  // Archive dialog state
  const [archiveItem, setArchiveItem] = useState<{ id: string; name: string } | null>(null);
  const [isArchiving, setIsArchiving] = useState(false);

  const isModerator = session?.user?.role === "ADMIN" || session?.user?.role === "MODERATOR";
  const isAdmin = session?.user?.role === "ADMIN";

  const { data, isLoading } = useQuery({
    queryKey: ["consumables", page, search, category, activeTab],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set("page", page.toString());
      params.set("limit", limit.toString());
      if (search) params.set("search", search);
      if (category !== "ALL") params.set("category", category);
      if (activeTab === "low-stock") params.set("lowStock", "true");
      if (activeTab === "near-expiry") params.set("nearExpiry", "true");
      if (activeTab === "expired") params.set("expired", "true");

      const res = await fetch(`/api/consumables?${params}`);
      if (!res.ok) throw new Error("Failed to fetch consumables");
      return res.json();
    },
  });

  const handleArchive = async () => {
    if (!archiveItem) return;
    setIsArchiving(true);
    try {
      const res = await fetch(`/api/consumables/${archiveItem.id}`, {
        method: "DELETE",
      });
      const text = await res.text();
      const result = text ? JSON.parse(text) : {};
      if (!res.ok) throw new Error(result.error || "Failed to archive item");
      toast.success(`"${archiveItem.name}" archived successfully`);
      queryClient.invalidateQueries({ queryKey: ["consumables"] });
      router.refresh();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsArchiving(false);
      setArchiveItem(null);
    }
  };

  const getStockBadge = (item: any) => {
    if (item.isCritical) {
      return <Badge className="bg-red-100 text-red-800">Critical ({item.quantity})</Badge>;
    }
    if (item.isLowStock) {
      return <Badge className="bg-yellow-100 text-yellow-800">Low ({item.quantity})</Badge>;
    }
    return <Badge className="bg-green-100 text-green-800">OK ({item.quantity})</Badge>;
  };

  const getExpiryBadge = (item: any) => {
    if (item.isExpired) {
      return <Badge className="bg-red-100 text-red-800">Expired</Badge>;
    }
    if (item.isNearExpiry) {
      return <Badge className="bg-orange-100 text-orange-800">{item.daysUntilExpiry}d left</Badge>;
    }
    if (item.daysUntilExpiry) {
      return <Badge className="bg-green-100 text-green-800">{item.daysUntilExpiry}d left</Badge>;
    }
    return <Badge variant="outline">N/A</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Consumables</h1>
          <p className="text-gray-500 mt-1">Track consumable supplies and stock levels</p>
        </div>
        <div className="flex gap-2">
          {isAdmin && (
            <Link href="/consumables/archived">
              <Button variant="outline" className="text-orange-600 border-orange-600 hover:bg-orange-50">
                <Archive className="h-4 w-4 mr-2" />
                Archived
              </Button>
            </Link>
          )}
          {isModerator && (
            <Link href="/consumables/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Alert Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm font-medium text-red-900">Critical Stock</p>
                <p className="text-2xl font-bold text-red-700">
                  {data?.items?.filter((i: any) => i.isCritical).length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-sm font-medium text-yellow-900">Near Expiry</p>
                <p className="text-2xl font-bold text-yellow-700">
                  {data?.items?.filter((i: any) => i.isNearExpiry).length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm font-medium text-orange-900">Expired</p>
                <p className="text-2xl font-bold text-orange-700">
                  {data?.items?.filter((i: any) => i.isExpired).length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs & Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4">
            <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); setPage(1); }}>
              <TabsList>
                <TabsTrigger value="all">All Items</TabsTrigger>
                <TabsTrigger value="low-stock">Low Stock</TabsTrigger>
                <TabsTrigger value="near-expiry">Near Expiry</TabsTrigger>
                <TabsTrigger value="expired">Expired</TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search items..."
                  className="pl-10"
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                />
              </div>
              <Select value={category} onValueChange={(v) => { setCategory(v); setPage(1); }}>
                <SelectTrigger className="w-[160px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Categories</SelectItem>
                  <SelectItem value="Medical">Medical</SelectItem>
                  <SelectItem value="Office">Office Supplies</SelectItem>
                  <SelectItem value="Cleaning">Cleaning</SelectItem>
                  <SelectItem value="IT">IT Supplies</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Property #</TableHead>
                <TableHead>Item Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Stock Level</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead>Expiry</TableHead>
                <TableHead>Department</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : data?.items?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                    No consumable items found
                  </TableCell>
                </TableRow>
              ) : (
                data?.items?.map((item: any) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.propertyNumber}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{item.itemName}</p>
                        {item.batchNumber && (
                          <p className="text-xs text-gray-500">Batch: {item.batchNumber}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{item.category}</Badge>
                    </TableCell>
                    <TableCell>{getStockBadge(item)}</TableCell>
                    <TableCell>{item.unitType}</TableCell>
                    <TableCell>{getExpiryBadge(item)}</TableCell>
                    <TableCell>{item.departmentName || "N/A"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* View */}
                        <Link href={`/consumables/${item.id}`}>
                          <Button variant="ghost" size="icon" title="View">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>

                        {isModerator && (
                          <>
                            {/* Stock Movement — goes to detail page */}
                            <Link href={`/consumables/${item.id}`}>
                              <Button variant="ghost" size="icon" title="Stock Movement">
                                <PackagePlus className="h-4 w-4" />
                              </Button>
                            </Link>

                            {/* Edit */}
                            <Link href={`/consumables/${item.id}/edit`}>
                              <Button variant="ghost" size="icon" title="Edit">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </Link>

                            {/* Archive — admin only */}
                            {isAdmin && (
                              <Button
                                variant="ghost"
                                size="icon"
                                title="Archive"
                                className="text-orange-600 hover:text-orange-700"
                                onClick={() => setArchiveItem({ id: item.id, name: item.itemName })}
                              >
                                <Archive className="h-4 w-4" />
                              </Button>
                            )}
                          </>
                        )}
                      </div>
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
            Showing {(page - 1) * limit + 1} to {Math.min(page * limit, data.pagination.total)} of{" "}
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

      {/* Archive Confirmation Dialog */}
      <ConfirmDialog
        open={!!archiveItem}
        onOpenChange={(open) => !open && setArchiveItem(null)}
        title="Archive Item"
        description={`Archive "${archiveItem?.name}"? It will be hidden from consumables but can be restored by an admin.`}
        onConfirm={handleArchive}
        confirmLabel={isArchiving ? "Archiving..." : "Archive"}
      />
    </div>
  );
}