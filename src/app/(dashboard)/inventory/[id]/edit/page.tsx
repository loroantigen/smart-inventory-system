"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  Loader2,
  Package,
  UserCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const editSchema = z.object({
  itemName: z.string().min(1, "Item name is required"),
  category: z.string(),
  status: z.string(),
  brand: z.string().optional().nullable(),
  model: z.string().optional().nullable(),
  serialNumber: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  departmentId: z.string().optional().nullable(),
  assignedTo: z.string().optional().nullable(),
  purchaseDate: z.string().optional().nullable(),
  purchaseCost: z.coerce.number().optional().nullable(),
  fundCode: z.string().optional().nullable(),
  fundSource: z.string().optional().nullable(),
  supplier: z.string().optional().nullable(),
});

export default function EditInventoryPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const id = params.id as string;

  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: item, isLoading: itemLoading } = useQuery({
    queryKey: ["inventory", id],
    queryFn: async () => {
      const res = await fetch(`/api/inventory/${id}`);
      if (!res.ok) throw new Error("Failed to fetch item");
      return res.json();
    },
  });

  const { data: usersData } = useQuery({
    queryKey: ["users-list"],
    queryFn: async () => {
      const res = await fetch("/api/users?limit=100");
      if (!res.ok) throw new Error("Failed to fetch users");
      return res.json();
    },
  });

  const { data: deptsData } = useQuery({
    queryKey: ["departments"],
    queryFn: async () => {
      const res = await fetch("/api/departments");
      if (!res.ok) throw new Error("Failed to fetch departments");
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
} = useForm({
  resolver: zodResolver(editSchema),
  defaultValues: {
    itemName: "",
    category: "ELECTRONICS",
    status: "AVAILABLE",
    brand: "",
    model: "",
    serialNumber: "",
    description: "",
    departmentId: "none",
    assignedTo: "none",
    purchaseDate: "",
    purchaseCost: 0,
    fundCode: "",
    fundSource: "",
    supplier: "",
  },
});

  useEffect(() => {
    if (item) {
      reset({
        itemName: item.itemName,
        category: item.category,
        status: item.status,
        brand: item.brand || "",
        model: item.model || "",
        serialNumber: item.serialNumber || "",
        description: item.description || "",
        departmentId: item.departmentId || "none",
        assignedTo:
          item.assignedTo || item.assignments?.[0]?.user?.id || "none",
        purchaseDate: item.purchaseDate
          ? new Date(item.purchaseDate).toISOString().split("T")[0]
          : "",
        purchaseCost: item.purchaseCost || 0,
        fundCode: item.fundCode || "",
        fundSource: item.fundSource || "",
        supplier: item.supplier || "",
      });
    }
  }, [item, reset]);

  const onSubmit = async (data: any) => {
    // Convert "none" sentinel back to null before sending to API
    const payload = {
      ...data,
      departmentId: data.departmentId === "none" ? null : data.departmentId,
      assignedTo: data.assignedTo === "none" ? null : data.assignedTo,
    };

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/inventory/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to update item");
      }

      toast.success("Item updated successfully");

      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      queryClient.invalidateQueries({ queryKey: ["inventory", id] });

      router.push("/inventory");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (itemLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Item not found</p>
        <Link href="/inventory">
          <Button variant="outline" className="mt-4">
            Back to Inventory
          </Button>
        </Link>
      </div>
    );
  }

  const users = usersData?.users || usersData?.items || [];
  const departments = deptsData?.departments || deptsData || [];

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <Link href="/inventory">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Edit Inventory Item
          </h1>
          <p className="text-gray-500 mt-1">
            {item.propertyNumber} — {item.itemName}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Package className="h-5 w-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="itemName">Item Name *</Label>
                <Input id="itemName" {...register("itemName")} />
                {errors.itemName && (
                  <p className="text-sm text-red-600">
                    {errors.itemName.message as string}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <input
                    type="hidden"
                    id="category"
                    {...register("category")}
                  />
                  <Select
                    value={watch("category")}
                    onValueChange={(v) => setValue("category", v)}
                  >
                    <SelectTrigger id="category-trigger">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[
                        "ELECTRONICS",
                        "FURNITURE",
                        "VEHICLE",
                        "EQUIPMENT",
                        "TOOLS",
                        "OFFICE_SUPPLIES",
                        "MEDICAL",
                        "OTHER",
                      ].map((c) => (
                        <SelectItem key={c} value={c}>
                          {c.replace(/_/g, " ")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <input type="hidden" id="status" {...register("status")} />
                  <Select
                    value={watch("status")}
                    onValueChange={(v) => setValue("status", v)}
                  >
                    <SelectTrigger id="status-trigger">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[
                        "AVAILABLE",
                        "ASSIGNED",
                        "REPAIR",
                        "LOST",
                        "CONDEMNED",
                        "ARCHIVED",
                      ].map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="brand">Brand</Label>
                  <Input id="brand" {...register("brand")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="model">Model</Label>
                  <Input id="model" {...register("model")} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="serialNumber">Serial Number</Label>
                <Input id="serialNumber" {...register("serialNumber")} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" {...register("description")} />
              </div>
            </CardContent>
          </Card>

          {/* Assignment & Department */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <UserCheck className="h-5 w-5" />
                Assignment & Location
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="departmentId">Department</Label>
                <input
                  type="hidden"
                  id="departmentId"
                  {...register("departmentId")}
                />
                <Select
                  value={watch("departmentId") || "none"}
                  onValueChange={(v) => setValue("departmentId", v)
                  }
                >
                  <SelectTrigger id="departmentId-trigger">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {departments.map((dept: any) => (
                      <SelectItem key={dept.id} value={dept.id}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="assignedTo">
                  Assigned To (Responsible User)
                </Label>
                <input
                  type="hidden"
                  id="assignedTo"
                  {...register("assignedTo")}
                />
                <Select
                  value={watch("assignedTo") || "none"}
                  onValueChange={(v) => setValue("assignedTo", v)
                  }
                >
                  <SelectTrigger id="assignedTo-trigger">
                    <SelectValue placeholder="Select user..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Unassigned</SelectItem>
                    {users.map((user: any) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name || user.email} ({user.role})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">
                  Select the user responsible for this item
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Purchase Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Purchase Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="purchaseDate">Purchase Date</Label>
                <Input
                  id="purchaseDate"
                  type="date"
                  {...register("purchaseDate")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="purchaseCost">Purchase Cost</Label>
                <Input
                  id="purchaseCost"
                  type="number"
                  step="0.01"
                  {...register("purchaseCost")}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fundCode">Fund Code</Label>
                  <Input id="fundCode" {...register("fundCode")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fundSource">Fund Source</Label>
                  <Input id="fundSource" {...register("fundSource")} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="supplier">Supplier</Label>
                <Input id="supplier" {...register("supplier")} />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end gap-4">
          <Link href="/inventory">
            <Button variant="outline" type="button">
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={isSubmitting}>
            <Save className="h-4 w-4 mr-2" />
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}