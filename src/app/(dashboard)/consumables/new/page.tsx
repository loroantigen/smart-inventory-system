"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { consumableItemSchema } from "@/lib/zod-schemas";
import { Boxes, ArrowLeft, Save } from "lucide-react";
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
  "Medical",
  "Office Supplies",
  "Cleaning",
  "IT Supplies",
  "Safety Equipment",
  "Other",
];

type ConsumableForm = z.infer<typeof consumableItemSchema>;

export default function NewConsumablePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // FIX 1: Fetch real departments from DB (old code had fake hardcoded IDs)
  const { data: departments = [], isLoading: loadingDepts } = useQuery({
    queryKey: ["departments"],
    queryFn: async (): Promise<{ id: string; name: string }[]> => {
      const res = await fetch("/api/departments");
      if (!res.ok) throw new Error("Failed to fetch departments");
      const json = await res.json();
      // Handle both shapes: plain array OR { departments: [...] } wrapper
      return Array.isArray(json) ? json : (json.departments ?? json.data ?? []);
    },
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ConsumableForm>({
    resolver: zodResolver(consumableItemSchema),
    defaultValues: {
      category: "Office Supplies",
      quantity: 0,
      reorderLevel: 10,
      criticalLevel: 5,
    },
  });

  const onSubmit = async (data: ConsumableForm) => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/consumables", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const error = await res.json();
        console.error("API error:", error); // FIX 2: log full error for debugging
        throw new Error(error.error || error.message || "Failed to create item");
      }

      toast.success("Consumable item created successfully");
      router.push("/consumables");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/consumables">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Add Consumable Item</h1>
          <p className="text-gray-500 mt-1">Register new consumable supply</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Boxes className="h-5 w-5" />
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
              </div>
              <div className="space-y-2">
                <Label htmlFor="itemName">Item Name *</Label>
                <Input
                  id="itemName"
                  placeholder="e.g., Alcohol, Bond Paper"
                  {...register("itemName")}
                />
                {errors.itemName && (
                  <p className="text-sm text-red-600">{errors.itemName.message as string}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={watch("category")}
                  onValueChange={(v) => setValue("category", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Item description..."
                  {...register("description")}
                />
              </div>
            </CardContent>
          </Card>

          {/* Stock Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Stock Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quantity">Initial Quantity *</Label>
                  <Input
                    id="quantity"
                    type="number"
                    {...register("quantity", { valueAsNumber: true })}
                  />
                  {errors.quantity && (
                    <p className="text-sm text-red-600">{errors.quantity.message as string}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unitType">Unit Type *</Label>
                  <Input
                    id="unitType"
                    placeholder="e.g., pack, bottle, box"
                    {...register("unitType")}
                  />
                  {errors.unitType && (
                    <p className="text-sm text-red-600">{errors.unitType.message as string}</p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="reorderLevel">Reorder Level</Label>
                  <Input
                    id="reorderLevel"
                    type="number"
                    {...register("reorderLevel", { valueAsNumber: true })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="criticalLevel">Critical Level</Label>
                  <Input
                    id="criticalLevel"
                    type="number"
                    {...register("criticalLevel", { valueAsNumber: true })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="batchNumber">Batch Number</Label>
                <Input
                  id="batchNumber"
                  placeholder="Batch number..."
                  {...register("batchNumber")}
                />
              </div>
              {/* FIX 3: valueAsDate so Prisma receives DateTime, not a string */}
              {/* FIX 4: relative z-0 so the date picker overlay can't block the Save button */}
              <div className="space-y-2 relative z-0">
                <Label htmlFor="expirationDate">Expiration Date</Label>
                <Input
                  id="expirationDate"
                  type="date"
                  className="relative z-0"
                  {...register("expirationDate", { valueAsDate: true })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Additional Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Additional Information</CardTitle>
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

              {/* FIX 1 cont: Real department IDs from DB, not fake "dept1/dept2" */}
              <div className="space-y-2">
                <Label htmlFor="departmentId">Department</Label>
                <Select onValueChange={(v) => setValue("departmentId", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder={loadingDepts ? "Loading..." : "Select department"} />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id}>
                        {dept.name}
                      </SelectItem>
                    ))}
                    {!loadingDepts && departments.length === 0 && (
                      <SelectItem value="_none" disabled>
                        No departments found
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* FIX 3 + 4 applied to dateReceived as well */}
              <div className="space-y-2 relative z-0">
                <Label htmlFor="dateReceived">Date Received</Label>
                <Input
                  id="dateReceived"
                  type="date"
                  className="relative z-0"
                  {...register("dateReceived", { valueAsDate: true })}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* FIX 4 cont: z-10 ensures Save button is above any date picker overlays */}
        <div className="flex justify-end gap-4 relative z-10">
          <Link href="/consumables">
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