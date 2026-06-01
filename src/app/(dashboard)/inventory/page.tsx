"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Package,
  Search,
  Plus,
  Filter,
  Eye,
  Edit,
  Archive,
  ArrowUpDown,
  Loader2,
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
import { formatDate, getStatusColor } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/confirm-dialog";



const categories = [
  "ALL",
  "ELECTRONICS",
  "FURNITURE",
  "VEHICLE",
  "EQUIPMENT",
  "TOOLS",
  "OFFICE_SUPPLIES",
  "MEDICAL",
  "OTHER",
];

const statuses = [
  "ALL",
  "AVAILABLE",
  "ASSIGNED",
  "REPAIR",
  "LOST",
  "CONDEMNED",
  "ARCHIVED",
];

export default function InventoryPage() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const initialSearch = searchParams.get("search") || "";

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState(initialSearch);
  const [category, setCategory] = useState("ALL");
  const [status, setStatus] = useState("ALL");
  const [limit] = useState(10);

  // Delete dialog state
  const [deleteItem, setDeleteItem] = useState<{ id: string; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["inventory", page, search, category, status],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set("page", page.toString());
      params.set("limit", limit.toString());
      if (search) params.set("search", search);
      if (category !== "ALL") params.set("category", category);
      if (status !== "ALL") params.set("status", status);

      const res = await fetch(`/api/inventory?${params}`);
      if (!res.ok) throw new Error("Failed to fetch inventory");
      const json = await res.json();



      return json;
    },
  });

  const isModerator = session?.user?.role === "ADMIN" || session?.user?.role === "MODERATOR";

  const handleDelete = async () => {
    if (!deleteItem) return;
    setIsDeleting(true);

    try {
      const res = await fetch(`/api/inventory/${deleteItem.id}`, {
        method: "DELETE",
      });

      // TO
      if (!res.ok) {
        const text = await res.text();
        const error = text ? JSON.parse(text) : {};
        throw new Error(error.error || "Failed to delete item");
      }

      toast.success(`"${deleteItem.name}" deleted successfully`);
      // Refresh table data
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      router.refresh();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsDeleting(false);
      setDeleteItem(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory</h1>
          <p className="text-gray-500 mt-1">Manage non-consumable equipment and assets</p>
        </div>
          <div className="flex gap-2">
            {session?.user?.role === "ADMIN" && (
              <Link href="/inventory/archived">
                <Button variant="outline" className="text-orange-600 border-orange-600 hover:bg-orange-50">
                  <Archive className="h-4 w-4 mr-2" />
                  Archived
                </Button>
              </Link>
            )}
            {isModerator && (
              <Link href="/inventory/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </Link>
            )}
          </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by property number, name, serial..."
                className="pl-10"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              />
            </div>
            <div className="flex gap-2">
              <Select value={category} onValueChange={(v) => { setCategory(v); setPage(1); }}>
                <SelectTrigger className="w-[160px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c === "ALL" ? "All Categories" : c.replace(/_/g, " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}>
                <SelectTrigger className="w-[140px]">
                  <ArrowUpDown className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s === "ALL" ? "All Statuses" : s}
                    </SelectItem>
                  ))}
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
                <TableHead>Status</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead>Purchase Date</TableHead>
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
                    No inventory items found
                  </TableCell>
                </TableRow>
              ) : (
                data?.items?.map((item: any) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.propertyNumber}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{item.itemName}</p>
                        {item.brand && (
                          <p className="text-xs text-gray-500">
                            {item.brand} {item.model}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{item.category.replace(/_/g, " ")}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(item.status)}>
                        {item.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{item.departmentName || "N/A"}</TableCell>
                    <TableCell>
                      {item.assignedUserName ? (
                        <div>
                          <p className="text-sm">{item.assignedUserName}</p>
                          <p className="text-xs text-gray-500">{item.assignedUserEmail}</p>
                        </div>
                      ) : (
                        <span className="text-gray-400">Unassigned</span>
                      )}
                    </TableCell>
                    <TableCell>{formatDate(item.purchaseDate)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* View */}
                        <Link href={`/inventory/${item.id}`}>
                          <Button variant="ghost" size="icon">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>

                        {isModerator && (
                          <>
                            {/* Edit */}
                            <Link href={`/inventory/${item.id}/edit`}>
                              <Button variant="ghost" size="icon">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </Link>

                            {/* Delete */}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-orange-600 hover:text-orange-700"
                              onClick={() => setDeleteItem({ id: item.id, name: item.itemName })}
                            >
                              <Archive className="h-4 w-4" />
                            </Button>
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

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={!!deleteItem}
        onOpenChange={(open) => !open && setDeleteItem(null)}
        title="Archive Item"
        description={`Archive "${deleteItem?.name}"? It will be hidden from inventory but can be restored by an admin.`}
        onConfirm={handleDelete}
        variant="destructive"
        confirmLabel={isDeleting ? "Archiving..." : "Archive"}
      />
    </div>
  );
}