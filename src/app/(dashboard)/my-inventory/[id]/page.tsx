"use client";

// src/app/(dashboard)/my-inventory/[id]/page.tsx

import { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ArrowLeft,
  Package,
  History,
  Send,
  User,
  MapPin,
  Building2,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatDate, formatDateTime } from "@/lib/utils";
import { toast } from "sonner";

// ─── Schema ──────────────────────────────────────────────────────────────────
const distributeSchema = z.object({
  quantity: z
    .number({ invalid_type_error: "Enter a valid number" })
    .int()
    .min(1, "Must be at least 1"),
  type: z.enum(["DISTRIBUTED", "USED", "TRANSFERRED"], {
    required_error: "Select a type",
  }),
  recipientName: z.string().max(100).optional(),
  recipientDept: z.string().max(100).optional(),
  location: z.string().max(200).optional(),
  notes: z.string().max(500).optional(),
});

type DistributeForm = z.infer<typeof distributeSchema>;

// ─── Helpers ─────────────────────────────────────────────────────────────────
const TYPE_LABELS: Record<string, string> = {
  DISTRIBUTED: "Distributed to someone",
  USED: "Used / Consumed",
  TRANSFERRED: "Transferred to another unit",
};

const TYPE_COLORS: Record<string, string> = {
  DISTRIBUTED: "bg-blue-100 text-blue-800",
  USED: "bg-purple-100 text-purple-800",
  TRANSFERRED: "bg-orange-100 text-orange-800",
};

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function MyInventoryDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: entry, isLoading } = useQuery({
    queryKey: ["my-inventory", id],
    queryFn: async () => {
      const res = await fetch(`/api/my-inventory/${id}`);
      if (!res.ok) throw new Error("Failed to fetch item");
      return res.json();
    },
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<DistributeForm>({
    resolver: zodResolver(distributeSchema),
    defaultValues: { type: "DISTRIBUTED" },
  });

  const selectedType = watch("type");

  const onSubmit = async (data: DistributeForm) => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/my-inventory/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "Failed to record");
      }

      toast.success(
        `Recorded: ${data.quantity} ${entry?.unitType} ${data.type.toLowerCase()}. Remaining: ${result.remainingQuantity}`
      );

      reset({ type: "DISTRIBUTED" });
      queryClient.invalidateQueries({ queryKey: ["my-inventory", id] });
      queryClient.invalidateQueries({ queryKey: ["my-inventory"] });
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Loading / not found ──
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        Loading...
      </div>
    );
  }

  if (!entry) {
    return (
      <div className="text-center py-12 text-gray-500">
        Item not found.
        <Link href="/my-inventory">
          <Button variant="outline" className="mt-4 block mx-auto">
            Back to My Inventory
          </Button>
        </Link>
      </div>
    );
  }

  const isExpired =
    entry.expirationDate && new Date(entry.expirationDate) < new Date();

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/my-inventory">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Package className="h-5 w-5 text-blue-600" />
            {entry.itemName}
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {entry.category.replace(/_/g, " ")} · {entry.departmentName || "No department"}
          </p>
        </div>

        <div className="text-right">
          <p className="text-sm text-gray-500">Available</p>
          <p
            className={`text-2xl font-bold ${
              entry.quantity === 0
                ? "text-red-600"
                : entry.quantity <= 5
                ? "text-yellow-600"
                : "text-green-600"
            }`}
          >
            {entry.quantity}
          </p>
          <p className="text-xs text-gray-500">{entry.unitType}</p>
        </div>
      </div>

      {/* Expiry warning */}
      {isExpired && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <AlertTriangle className="h-5 w-5 flex-shrink-0" />
          <p className="text-sm font-medium">
            This item expired on {formatDate(entry.expirationDate)}. Please
            contact your moderator.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Left column ── */}
        <div className="lg:col-span-2 space-y-6">
          {/* Distribute / Use / Transfer form */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Send className="h-4 w-4" />
                Record Distribution / Use / Transfer
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Type + Quantity */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Type *</Label>
                    <Select
                      value={selectedType}
                      onValueChange={(v) =>
                        setValue("type", v as DistributeForm["type"])
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(TYPE_LABELS).map(([val, label]) => (
                          <SelectItem key={val} value={val}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.type && (
                      <p className="text-sm text-red-600">
                        {errors.type.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="quantity">
                      Quantity * (max {entry.quantity})
                    </Label>
                    <Input
                      id="quantity"
                      type="number"
                      min={1}
                      max={entry.quantity}
                      placeholder="e.g. 10"
                      {...register("quantity", { valueAsNumber: true })}
                    />
                    {errors.quantity && (
                      <p className="text-sm text-red-600">
                        {errors.quantity.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Recipient / Location (context-sensitive labels) */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="recipientName">
                      {selectedType === "USED"
                        ? "Used By / For"
                        : "Recipient Name"}
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="recipientName"
                        className="pl-9"
                        placeholder={
                          selectedType === "USED"
                            ? "e.g. Classroom 3B"
                            : "Full name..."
                        }
                        {...register("recipientName")}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="recipientDept">
                      {selectedType === "TRANSFERRED"
                        ? "Transferred To (Unit)"
                        : "Recipient Department"}
                    </Label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="recipientDept"
                        className="pl-9"
                        placeholder="Department or unit..."
                        {...register("recipientDept")}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location / Venue</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="location"
                      className="pl-9"
                      placeholder="Where was this used or delivered?"
                      {...register("location")}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Any additional remarks..."
                    rows={2}
                    {...register("notes")}
                  />
                </div>

                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={isSubmitting || entry.quantity === 0}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {isSubmitting ? "Recording..." : "Record Transaction"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Distribution history */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <History className="h-4 w-4" />
                Transaction History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {entry.distributions?.length === 0 ? (
                <p className="text-gray-400 text-center py-6">
                  No transactions recorded yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {entry.distributions.map((d: any) => (
                    <div
                      key={d.id}
                      className="flex items-start gap-4 p-3 bg-gray-50 rounded-lg"
                    >
                      <Badge
                        className={`${TYPE_COLORS[d.type]} mt-0.5 whitespace-nowrap`}
                      >
                        {d.type}
                      </Badge>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-sm">
                            {d.quantity} {entry.unitType}
                          </span>
                          {d.recipientName && (
                            <span className="text-sm text-gray-600">
                              → {d.recipientName}
                            </span>
                          )}
                          {d.recipientDept && (
                            <span className="text-sm text-gray-500">
                              ({d.recipientDept})
                            </span>
                          )}
                        </div>
                        {d.location && (
                          <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {d.location}
                          </p>
                        )}
                        {d.notes && (
                          <p className="text-xs text-gray-400 mt-1 italic">
                            {d.notes}
                          </p>
                        )}
                      </div>
                      <div className="text-right text-xs text-gray-400 whitespace-nowrap">
                        <p>{d.user?.name || "You"}</p>
                        <p>{formatDateTime(d.createdAt)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ── Right sidebar ── */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Item Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <p className="text-gray-500">Category</p>
                <p className="font-medium">
                  {entry.category.replace(/_/g, " ")}
                </p>
              </div>
              <Separator />
              <div>
                <p className="text-gray-500">Unit</p>
                <p className="font-medium">{entry.unitType}</p>
              </div>
              <Separator />
              <div>
                <p className="text-gray-500">Department</p>
                <p className="font-medium">{entry.departmentName || "N/A"}</p>
              </div>
              <Separator />
              <div>
                <p className="text-gray-500">Expiration</p>
                <p
                  className={`font-medium ${isExpired ? "text-red-600" : ""}`}
                >
                  {entry.expirationDate
                    ? formatDate(entry.expirationDate)
                    : "No expiry"}
                </p>
              </div>
              {entry.description && (
                <>
                  <Separator />
                  <div>
                    <p className="text-gray-500">Description</p>
                    <p className="text-gray-700">{entry.description}</p>
                  </div>
                </>
              )}
              <Separator />
              <div>
                <p className="text-gray-500">Assigned To</p>
                <p className="font-medium">{entry.userName}</p>
                <p className="text-xs text-gray-400">{entry.userEmail}</p>
              </div>
              <Separator />
              <div>
                <p className="text-gray-500">Last Updated</p>
                <p className="font-medium">{formatDate(entry.updatedAt)}</p>
              </div>
            </CardContent>
          </Card>

          {/* Quick stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Total transactions</span>
                <span className="font-medium">
                  {entry.distributions?.length ?? 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Total moved</span>
                <span className="font-medium">
                  {entry.distributions?.reduce(
                    (sum: number, d: any) => sum + d.quantity,
                    0
                  ) ?? 0}{" "}
                  {entry.unitType}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Remaining</span>
                <span
                  className={`font-bold ${
                    entry.quantity === 0
                      ? "text-red-600"
                      : entry.quantity <= 5
                      ? "text-yellow-600"
                      : "text-green-600"
                  }`}
                >
                  {entry.quantity} {entry.unitType}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}