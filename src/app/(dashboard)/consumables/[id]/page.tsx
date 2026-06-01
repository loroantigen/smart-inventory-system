"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  PackagePlus,
  PackageMinus,
  History,
  AlertTriangle,
  Calendar,
  Building,
  FileText,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatDate, getDaysUntilExpiration } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { toast } from "sonner";

export default function ConsumableDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [stockDialogOpen, setStockDialogOpen] = useState(false);
  const [stockType, setStockType] = useState<"in" | "out">("in");

  // Stock In fields
  const [stockQuantity, setStockQuantity] = useState(1);
  const [stockReason, setStockReason] = useState("");
  const [batchNumber, setBatchNumber] = useState("");
  const [expirationDate, setExpirationDate] = useState("");

  const { data: item, isLoading, refetch } = useQuery({
    queryKey: ["consumable", id],
    queryFn: async () => {
      const res = await fetch(`/api/consumables/${id}`);
      if (!res.ok) throw new Error("Failed to fetch item");
      return res.json();
    },
  });

  const { data: movements } = useQuery({
    queryKey: ["stock-movements", id],
    queryFn: async () => {
      const res = await fetch(`/api/stock-movements?consumableItemId=${id}`);
      if (!res.ok) throw new Error("Failed to fetch movements");
      return res.json();
    },
  });

  const openDialog = (type: "in" | "out") => {
    setStockType(type);
    setStockQuantity(1);
    setStockReason("");
    setBatchNumber("");
    setExpirationDate("");
    setStockDialogOpen(true);
  };

  const handleStockMovement = async () => {
    try {
      const body: any = {
        consumableItemId: id,
        type: stockType === "in" ? "STOCK_IN" : "STOCK_OUT",
        quantity: stockQuantity,
        reason: stockReason,
      };

      // Only send batch fields on Stock In
      if (stockType === "in") {
        if (batchNumber.trim()) body.batchNumber = batchNumber.trim();
        if (expirationDate) body.expirationDate = expirationDate;
      }

      const res = await fetch("/api/stock-movements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const text = await res.text();
      const result = text ? JSON.parse(text) : {};

      if (!res.ok) throw new Error(result.error || "Failed to record movement");

      toast.success(`Stock ${stockType === "in" ? "In" : "Out"} recorded successfully`);
      setStockDialogOpen(false);
      refetch();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Item not found</p>
      </div>
    );
  }

  const daysUntilExpiry = getDaysUntilExpiration(item.expirationDate);
  const isLowStock = item.quantity <= item.reorderLevel;
  const isCritical = item.quantity <= item.criticalLevel;
  const isExpired = daysUntilExpiry !== null && daysUntilExpiry < 0;
  const isNearExpiry =
    daysUntilExpiry !== null && daysUntilExpiry >= 0 && daysUntilExpiry <= 30;

  // Active batches for FEFO preview
  const activeBatches = item.batches?.filter((b: any) => b.status === "ACTIVE") ?? [];

  const getBatchExpiryBadge = (batch: any) => {
    if (!batch.expirationDate) return <Badge variant="outline">No Expiry</Badge>;
    const days = getDaysUntilExpiration(batch.expirationDate);
    if (days === null) return <Badge variant="outline">N/A</Badge>;
    if (days < 0) return <Badge className="bg-red-100 text-red-800">Expired</Badge>;
    if (days <= 30) return <Badge className="bg-orange-100 text-orange-800">{days}d left</Badge>;
    return <Badge className="bg-green-100 text-green-800">{days}d left</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/consumables">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{item.itemName}</h1>
            <p className="text-gray-500">{item.propertyNumber}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => openDialog("in")}>
            <PackagePlus className="h-4 w-4 mr-2" />
            Stock In
          </Button>
          <Button variant="outline" onClick={() => openDialog("out")}>
            <PackageMinus className="h-4 w-4 mr-2" />
            Stock Out
          </Button>
        </div>
      </div>

      {/* Alert Banner */}
      {(isCritical || isExpired || isNearExpiry) && (
        <div
          className={`p-4 rounded-lg flex items-center gap-3 ${
            isExpired || isCritical
              ? "bg-red-50 border border-red-200"
              : "bg-yellow-50 border border-yellow-200"
          }`}
        >
          <AlertTriangle
            className={`h-5 w-5 ${
              isExpired || isCritical ? "text-red-600" : "text-yellow-600"
            }`}
          />
          <div>
            <p
              className={`font-medium ${
                isExpired || isCritical ? "text-red-900" : "text-yellow-900"
              }`}
            >
              {isExpired
                ? "Nearest batch has expired!"
                : isCritical
                ? "Critical stock level!"
                : "Nearest batch nearing expiry"}
            </p>
            <p
              className={`text-sm ${
                isExpired || isCritical ? "text-red-700" : "text-yellow-700"
              }`}
            >
              {isExpired
                ? `Expired ${Math.abs(daysUntilExpiry!)} days ago`
                : isCritical
                ? `Only ${item.quantity} units remaining (Critical: ${item.criticalLevel})`
                : `${daysUntilExpiry} days until nearest batch expires`}
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Item Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Category</p>
                  <p className="font-medium">{item.category}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Unit Type</p>
                  <p className="font-medium">{item.unitType}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Department</p>
                  <p className="font-medium">{item.departmentName || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Stock</p>
                  <p className="font-medium">{item.quantity} {item.unitType}</p>
                </div>
              </div>
              <Separator />
              <div>
                <p className="text-sm text-gray-500">Description</p>
                <p className="mt-1">{item.description || "No description provided"}</p>
              </div>
            </CardContent>
          </Card>

          {/* Batch List */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Layers className="h-5 w-5" />
                Active Batches
                <span className="text-sm font-normal text-gray-500 ml-1">
                  (FEFO order — oldest expiry deducted first)
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {activeBatches.length > 0 ? (
                <div className="space-y-2">
                  {activeBatches.map((batch: any, index: number) => (
                    <div
                      key={batch.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{batch.batchNumber}</p>
                          <p className="text-xs text-gray-500">
                            Received: {formatDate(batch.receivedAt)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-medium">{batch.quantity} {item.unitType}</p>
                        </div>
                        {getBatchExpiryBadge(batch)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No active batches</p>
              )}

              {/* Show depleted batches count */}
              {item.batches?.filter((b: any) => b.status === "DEPLETED").length > 0 && (
                <p className="text-xs text-gray-400 mt-3 text-center">
                  +{item.batches.filter((b: any) => b.status === "DEPLETED").length} depleted batch(es) not shown
                </p>
              )}
            </CardContent>
          </Card>

          {/* Stock Movement History */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <History className="h-5 w-5" />
                Stock Movement History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {movements?.movements?.length > 0 ? (
                <div className="space-y-3">
                  {movements.movements.map((movement: any) => (
                    <div
                      key={movement.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            movement.type === "STOCK_IN"
                              ? "bg-green-100"
                              : "bg-red-100"
                          }`}
                        >
                          {movement.type === "STOCK_IN" ? (
                            <PackagePlus className="h-4 w-4 text-green-600" />
                          ) : (
                            <PackageMinus className="h-4 w-4 text-red-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-sm">
                            {movement.type.replace(/_/g, " ")}
                          </p>
                          {movement.batch && (
                            <p className="text-xs text-blue-600">
                              Batch: {movement.batch.batchNumber}
                              {movement.batch.expirationDate &&
                                ` · Exp: ${formatDate(movement.batch.expirationDate)}`}
                            </p>
                          )}
                          <p className="text-xs text-gray-500">
                            {movement.reason || "No reason"} · {movement.user?.name}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p
                          className={`font-medium ${
                            movement.type === "STOCK_IN"
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {movement.type === "STOCK_IN" ? "+" : "-"}
                          {movement.quantity}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDate(movement.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">
                  No stock movements recorded
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Stock Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <p className="text-4xl font-bold text-gray-900">{item.quantity}</p>
                <p className="text-sm text-gray-500">{item.unitType} total in stock</p>
              </div>
              <Separator />
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Active Batches</span>
                  <span className="font-medium">{activeBatches.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Reorder Level</span>
                  <span className="font-medium">{item.reorderLevel}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Critical Level</span>
                  <span className="font-medium">{item.criticalLevel}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div
                    className={`h-2 rounded-full ${
                      isCritical
                        ? "bg-red-500"
                        : isLowStock
                        ? "bg-yellow-500"
                        : "bg-green-500"
                    }`}
                    style={{
                      width: `${Math.min(
                        (item.quantity / (item.reorderLevel * 2)) * 100,
                        100
                      )}%`,
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Nearest Expiry</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Soonest Expiration</p>
                  <p className="font-medium">{formatDate(item.expirationDate)}</p>
                </div>
              </div>
              {daysUntilExpiry !== null && (
                <div className="flex items-center gap-3">
                  <AlertTriangle
                    className={`h-4 w-4 ${
                      isExpired
                        ? "text-red-400"
                        : isNearExpiry
                        ? "text-yellow-400"
                        : "text-green-400"
                    }`}
                  />
                  <div>
                    <p className="text-sm text-gray-500">Days Remaining</p>
                    <p
                      className={`font-medium ${
                        isExpired
                          ? "text-red-600"
                          : isNearExpiry
                          ? "text-yellow-600"
                          : "text-green-600"
                      }`}
                    >
                      {isExpired
                        ? `${Math.abs(daysUntilExpiry)} days expired`
                        : `${daysUntilExpiry} days left`}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Additional Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Building className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Supplier</p>
                  <p className="font-medium">{item.supplier || "N/A"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <FileText className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Fund Source</p>
                  <p className="font-medium">{item.fundSource || "N/A"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Date Received</p>
                  <p className="font-medium">{formatDate(item.dateReceived)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Stock Movement Dialog */}
      <Dialog open={stockDialogOpen} onOpenChange={setStockDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {stockType === "in" ? "Stock In — New Batch" : "Stock Out (FEFO)"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Quantity *</Label>
              <Input
                type="number"
                min={1}
                max={stockType === "out" ? item.quantity : undefined}
                value={stockQuantity}
                onChange={(e) => setStockQuantity(parseInt(e.target.value) || 1)}
              />
              {stockType === "out" && (
                <p className="text-xs text-gray-500">
                  Available: {item.quantity} {item.unitType}. Will deduct from oldest batch first.
                </p>
              )}
            </div>

            {/* Stock In only: batch details */}
            {stockType === "in" && (
              <>
                <div className="space-y-2">
                  <Label>Batch Number</Label>
                  <Input
                    placeholder="Leave empty to auto-generate"
                    value={batchNumber}
                    onChange={(e) => setBatchNumber(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Expiration Date</Label>
                  <Input
                    type="date"
                    value={expirationDate}
                    onChange={(e) => setExpirationDate(e.target.value)}
                  />
                  <p className="text-xs text-gray-500">
                    Leave empty if this batch has no expiration date.
                  </p>
                </div>
              </>
            )}

            {/* Stock Out only: FEFO preview */}
            {stockType === "out" && activeBatches.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-1">
                <p className="text-xs font-medium text-blue-800">
                  Batches to be deducted (FEFO order):
                </p>
                {(() => {
                  let remaining = stockQuantity;
                  return activeBatches.map((batch: any) => {
                    if (remaining <= 0) return null;
                    const deduct = Math.min(batch.quantity, remaining);
                    remaining -= deduct;
                    return (
                      <p key={batch.id} className="text-xs text-blue-700">
                        • {batch.batchNumber} — deduct {deduct} of {batch.quantity}
                        {batch.expirationDate ? ` (exp: ${formatDate(batch.expirationDate)})` : " (no expiry)"}
                      </p>
                    );
                  });
                })()}
              </div>
            )}

            <div className="space-y-2">
              <Label>Reason</Label>
              <Textarea
                placeholder="Enter reason for stock movement..."
                value={stockReason}
                onChange={(e) => setStockReason(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setStockDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleStockMovement}
              disabled={
                stockType === "out" && stockQuantity > item.quantity
              }
            >
              {stockType === "in" ? "Record Stock In" : "Record Stock Out"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}