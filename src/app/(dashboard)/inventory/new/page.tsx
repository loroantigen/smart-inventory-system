"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { inventoryItemSchema } from "@/lib/zod-schemas";
import { Package, ArrowLeft, Save } from "lucide-react";
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
import Link from "next/link";

const categories = [
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
  "AVAILABLE",
  "ASSIGNED",
  "REPAIR",
  "LOST",
  "CONDEMNED",
  "ARCHIVED",
];

const departments = [
  { id: "dept1", name: "IT Department" },
  { id: "dept2", name: "HR Department" },
  { id: "dept3", name: "Finance" },
  { id: "dept4", name: "Operations" },
];

export default function NewInventoryPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(inventoryItemSchema),
    defaultValues: {
      status: "AVAILABLE",
      category: "ELECTRONICS",
      // Ensure all fields have defaults to avoid undefined
      propertyNumber: "",
      itemName: "",
      description: "",
      brand: "",
      model: "",
      serialNumber: "",
      departmentId: "",
      fundCode: "",
      fundSource: "",
      supplier: "",
      purchaseDate: "",
      purchaseCost: undefined,
      warrantyExpiration: "",
    },
  });

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      // Transform data before sending to match API expectations
      const payload = {
        ...data,
        // Convert purchaseCost to number if it's a string
        purchaseCost: data.purchaseCost ? Number(data.purchaseCost) : undefined,
        // Convert empty strings to undefined for optional fields
        description: data.description || undefined,
        brand: data.brand || undefined,
        model: data.model || undefined,
        serialNumber: data.serialNumber || undefined,
        fundCode: data.fundCode || undefined,
        fundSource: data.fundSource || undefined,
        supplier: data.supplier || undefined,
        purchaseDate: data.purchaseDate || undefined,
        warrantyExpiration: data.warrantyExpiration || undefined,
        propertyNumber: data.propertyNumber || undefined,
      };

      const res = await fetch("/api/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        // Handle both JSON and non-JSON error responses
        const contentType = res.headers.get("content-type");
        let errorMessage = `Failed to create item (${res.status})`;
        
        if (contentType?.includes("application/json")) {
          const errorData = await res.json();
          errorMessage = errorData.error || errorData.message || JSON.stringify(errorData);
        } else {
          const text = await res.text();
          errorMessage = text || errorMessage;
        }
        throw new Error(errorMessage);
      }

      toast.success("Inventory item created successfully");
      router.push("/inventory");
      router.refresh();
    } catch (error: any) {
      console.error("Inventory creation error:", error);
      toast.error(error.message || "Failed to create inventory item");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/inventory">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Add Inventory Item</h1>
          <p className="text-gray-500 mt-1">Register new non-consumable equipment</p>
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
                <Label htmlFor="propertyNumber">Property Number</Label>
                <Input
                  id="propertyNumber"
                  placeholder="Auto-generated if empty"
                  {...register("propertyNumber")}
                />
                {errors.propertyNumber && (
                  <p className="text-sm text-red-600">{errors.propertyNumber.message as string}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="itemName">Item Name *</Label>
                <Input
                  id="itemName"
                  placeholder="e.g., Dell Laptop"
                  {...register("itemName")}
                />
                {errors.itemName && (
                  <p className="text-sm text-red-600">{errors.itemName.message as string}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Item description..."
                  {...register("description")}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Controller
                    name="category"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((c) => (
                            <SelectItem key={c} value={c}>
                              {c.replace(/_/g, " ")}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.category && (
                    <p className="text-sm text-red-600">{errors.category.message as string}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Controller
                    name="status"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {statuses.map((s) => (
                            <SelectItem key={s} value={s}>
                              {s}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Specifications */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Specifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="brand">Brand</Label>
                  <Input id="brand" placeholder="e.g., Dell" {...register("brand")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="model">Model</Label>
                  <Input id="model" placeholder="e.g., Latitude 5520" {...register("model")} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="serialNumber">Serial Number</Label>
                <Input id="serialNumber" placeholder="Serial number..." {...register("serialNumber")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="departmentId">Department</Label>
                <Controller
                  name="departmentId"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map((d) => (
                          <SelectItem key={d.id} value={d.id}>
                            {d.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.departmentId && (
                  <p className="text-sm text-red-600">{errors.departmentId.message as string}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Purchase Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Purchase Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fundCode">Fund Code</Label>
                  <Input id="fundCode" placeholder="Fund code..." {...register("fundCode")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fundSource">Fund Source</Label>
                  <Input id="fundSource" placeholder="Fund source..." {...register("fundSource")} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="supplier">Supplier</Label>
                <Input id="supplier" placeholder="Supplier name..." {...register("supplier")} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="purchaseDate">Purchase Date</Label>
                  <Input id="purchaseDate" type="date" {...register("purchaseDate")} />
                  {errors.purchaseDate && (
                    <p className="text-sm text-red-600">{errors.purchaseDate.message as string}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="purchaseCost">Purchase Cost</Label>
                  <Input
                    id="purchaseCost"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    {...register("purchaseCost", { valueAsNumber: true })}
                  />
                  {errors.purchaseCost && (
                    <p className="text-sm text-red-600">{errors.purchaseCost.message as string}</p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="warrantyExpiration">Warranty Expiration</Label>
                <Input id="warrantyExpiration" type="date" {...register("warrantyExpiration")} />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end gap-4">
          <Link href="/inventory">
            <Button variant="outline" type="button">Cancel</Button>
          </Link>
          <Button type="submit" disabled={isSubmitting}>
            <Save className="h-4 w-4 mr-2" />
            {isSubmitting ? "Saving..." : "Save Item"}
          </Button>
        </div>
      </form>
    </div>
  );
}