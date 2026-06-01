"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { ArrowLeft, RotateCcw, Archive } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { formatDate } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/confirm-dialog";

export default function ArchivedConsumablesPage() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  const [restoreItem, setRestoreItem] = useState<{ id: string; name: string } | null>(null);
  const [isRestoring, setIsRestoring] = useState(false);

  const isAdmin = session?.user?.role === "ADMIN";

  const { data, isLoading } = useQuery({
    queryKey: ["consumables-archived"],
    queryFn: async () => {
      const res = await fetch("/api/consumables/archived");
      if (!res.ok) throw new Error("Failed to fetch archived items");
      return res.json();
    },
  });

  const handleRestore = async () => {
    if (!restoreItem) return;
    setIsRestoring(true);
    try {
      const res = await fetch(`/api/consumables/${restoreItem.id}/restore`, {
        method: "POST",
      });
      const text = await res.text();
      const result = text ? JSON.parse(text) : {};
      if (!res.ok) throw new Error(result.error || "Failed to restore item");

      toast.success(`"${restoreItem.name}" restored successfully`);
      queryClient.invalidateQueries({ queryKey: ["consumables-archived"] });
      queryClient.invalidateQueries({ queryKey: ["consumables"] });
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsRestoring(false);
      setRestoreItem(null);
    }
  };

  if (!isAdmin) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Access denied. Admin only.</p>
        <Link href="/consumables">
          <Button variant="outline" className="mt-4">
            Back to Consumables
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/consumables">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Archive className="h-6 w-6 text-orange-500" />
            Archived Consumables
          </h1>
          <p className="text-gray-500 mt-1">
            Items archived from consumables. Admins can restore them.
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Property #</TableHead>
                <TableHead>Item Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Last Quantity</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Archived On</TableHead>
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
                    No archived consumable items
                  </TableCell>
                </TableRow>
              ) : (
                data?.items?.map((item: any) => (
                  <TableRow key={item.id} className="bg-orange-50/30">
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
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>{item.unitType}</TableCell>
                    <TableCell>{item.departmentName || "N/A"}</TableCell>
                    <TableCell>{formatDate(item.deletedAt)}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-green-600 border-green-600 hover:bg-green-50"
                        onClick={() => setRestoreItem({ id: item.id, name: item.itemName })}
                      >
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Restore
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={!!restoreItem}
        onOpenChange={(open) => !open && setRestoreItem(null)}
        title="Restore Item"
        description={`Restore "${restoreItem?.name}" back to active consumables?`}
        onConfirm={handleRestore}
        confirmLabel={isRestoring ? "Restoring..." : "Restore"}
      />
    </div>
  );
}