"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Package,
  ArrowLeft,
  QrCode,
  Calendar,
  DollarSign,
  Building,
  User,
  FileText,
  History,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatDate, formatCurrency, getStatusColor } from "@/lib/utils";

export default function InventoryDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const { data: item, isLoading } = useQuery({
    queryKey: ["inventory", id],
    queryFn: async () => {
      const res = await fetch(`/api/inventory/${id}`);
      if (!res.ok) throw new Error("Failed to fetch item");
      return res.json();
    },
  });

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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/inventory">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{item.itemName}</h1>
          <p className="text-gray-500">{item.propertyNumber}</p>
        </div>
        <Badge className={getStatusColor(item.status)}>{item.status}</Badge>
      </div>

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
                  <p className="font-medium">{item.category.replace(/_/g, " ")}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Brand / Model</p>
                  <p className="font-medium">{item.brand || "N/A"} / {item.model || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Serial Number</p>
                  <p className="font-medium">{item.serialNumber || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Department</p>
                  <p className="font-medium">{item.departmentName || "N/A"}</p>
                </div>
              </div>
              <Separator />
              <div>
                <p className="text-sm text-gray-500">Description</p>
                <p className="mt-1">{item.description || "No description provided"}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <History className="h-5 w-5" />
                Assignment History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {item.assignments?.length > 0 ? (
                <div className="space-y-3">
                  {item.assignments.map((assignment: any) => (
                    <div key={assignment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <User className="h-4 w-4 text-gray-400" />
                        <div>
                          <p className="font-medium">{assignment.user.name}</p>
                          <p className="text-sm text-gray-500">{assignment.user.email}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm">{formatDate(assignment.assignedAt)}</p>
                        {assignment.returnedAt && (
                          <p className="text-sm text-gray-500">Returned: {formatDate(assignment.returnedAt)}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No assignment history</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Purchase Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <DollarSign className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Purchase Cost</p>
                  <p className="font-medium">{formatCurrency(item.purchaseCost)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Purchase Date</p>
                  <p className="font-medium">{formatDate(item.purchaseDate)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Warranty Expires</p>
                  <p className="font-medium">{formatDate(item.warrantyExpiration)}</p>
                </div>
              </div>
              <Separator />
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
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <QrCode className="h-5 w-5" />
                QR Code
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center p-4 bg-gray-50 rounded-lg">
                <div className="w-32 h-32 bg-gray-200 rounded-lg flex items-center justify-center">
                  <QrCode className="h-16 w-16 text-gray-400" />
                </div>
              </div>
              <p className="text-center text-sm text-gray-500 mt-2">
                Property: {item.propertyNumber}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}