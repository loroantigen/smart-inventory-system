"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { consumableRequestSchema } from "@/lib/zod-schemas";
import {
  ClipboardList,
  ArrowLeft,
  Send,
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
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";

// Fixed: Removed duplicate '<'
type RequestForm = z.infer<typeof consumableRequestSchema>;

export default function NewRequestPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: consumables } = useQuery({
    queryKey: ["consumables-list"],
    queryFn: async () => {
      const res = await fetch("/api/consumables?limit=100");
      if (!res.ok) throw new Error("Failed to fetch consumables");
      return res.json();
    },
  });

  // Fixed: Removed duplicate '<'
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RequestForm>({
    resolver: zodResolver(consumableRequestSchema),
    defaultValues: {
      priority: "NORMAL",
    },
  });

  const selectedItemId = watch("consumableItemId");
  const selectedItem = consumables?.items?.find((item: any) => item.id === selectedItemId);

  const onSubmit = async (data: RequestForm) => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to create request");
      }

      toast.success("Request submitted successfully");
      router.push("/requests");
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
        <Link href="/requests">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">New Request</h1>
          <p className="text-gray-500 mt-1">Submit a consumable item request</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <ClipboardList className="h-5 w-5" />
              Request Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="consumableItemId">Select Item *</Label>
              <Select
                value={selectedItemId}
                onValueChange={(v) => setValue("consumableItemId", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose an item" />
                </SelectTrigger>
                <SelectContent>
                  {consumables?.items?.map((item: any) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.itemName} ({item.quantity} {item.unitType} available)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.consumableItemId && (
                <p className="text-sm text-red-600">{errors.consumableItemId.message as string}</p>
              )}
            </div>

            {selectedItem && (
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-900">
                  Available: <strong>{selectedItem.quantity} {selectedItem.unitType}</strong>
                </p>
                <p className="text-sm text-blue-700">
                  Department: {selectedItem.departmentName || "N/A"}
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity *</Label>
                <Input
                  id="quantity"
                  type="number"
                  min={1}
                  {...register("quantity", { valueAsNumber: true })}
                />
                {errors.quantity && (
                  <p className="text-sm text-red-600">{errors.quantity.message as string}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={watch("priority")}
                  onValueChange={(v) => setValue("priority", v as RequestForm["priority"])}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW">Low</SelectItem>
                    <SelectItem value="NORMAL">Normal</SelectItem>
                    <SelectItem value="HIGH">High</SelectItem>
                    <SelectItem value="URGENT">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="purpose">Purpose *</Label>
              <Textarea
                id="purpose"
                placeholder="Describe the purpose of this request..."
                {...register("purpose")}
              />
              {errors.purpose && (
                <p className="text-sm text-red-600">{errors.purpose.message as string}</p>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Link href="/requests">
            <Button variant="outline" type="button">Cancel</Button>
          </Link>
          <Button type="submit" disabled={isSubmitting}>
            <Send className="h-4 w-4 mr-2" />
            {isSubmitting ? "Submitting..." : "Submit Request"}
          </Button>
        </div>
      </form>
    </div>
  );
}