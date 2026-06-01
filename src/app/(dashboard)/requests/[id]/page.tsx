"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ClipboardList,
  ArrowLeft,
  User,
  Package,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatDateTime, getStatusColor } from "@/lib/utils";

export default function RequestDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const { data: request, isLoading } = useQuery({
    queryKey: ["request", id],
    queryFn: async () => {
      const res = await fetch(`/api/requests/${id}`);
      if (!res.ok) throw new Error("Failed to fetch request");
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

  if (!request) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Request not found</p>
      </div>
    );
  }

  const getPriorityBadge = (priority: string) => {
    const colors: Record<string, string> = {
      LOW: "bg-green-100 text-green-800",
      NORMAL: "bg-blue-100 text-blue-800",
      HIGH: "bg-yellow-100 text-yellow-800",
      URGENT: "bg-red-100 text-red-800",
    };
    return <Badge className={colors[priority] || "bg-gray-100"}>{priority}</Badge>;
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
          <h1 className="text-2xl font-bold text-gray-900">Request {request.requestNumber}</h1>
          <p className="text-gray-500">Submitted on {formatDateTime(request.createdAt)}</p>
        </div>
        <Badge className={getStatusColor(request.status)}>{request.status}</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Request Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Item Requested</p>
                  <p className="font-medium">{request.consumableItemName}</p>
                  <p className="text-sm text-gray-500">{request.unitType}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Quantity</p>
                  <p className="font-medium">{request.quantity}</p>
                </div>
              </div>
              <Separator />
              <div>
                <p className="text-sm text-gray-500">Purpose</p>
                <p className="mt-1">{request.purpose || "No purpose provided"}</p>
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Priority</p>
                  <div className="mt-1">{getPriorityBadge(request.priority)}</div>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Available Stock</p>
                  <p className="font-medium">{request.availableQuantity} {request.unitType}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Attachments */}
          {request.attachments && request.attachments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Attachments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {request.attachments.map((attachment: any) => (
                    <div key={attachment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{attachment.fileName}</span>
                      </div>
                      <Button variant="ghost" size="sm">
                        Download
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Requester Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="font-medium">{request.requesterName}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Package className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Department</p>
                  <p className="font-medium">{request.requesterDepartment || "N/A"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{request.requesterEmail}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Approval Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <Badge className={getStatusColor(request.status)}>{request.status}</Badge>
                </div>
              </div>

              {request.approverName && (
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  <div>
                    <p className="text-sm text-gray-500">Approved By</p>
                    <p className="font-medium">{request.approverName}</p>
                  </div>
                </div>
              )}

              {request.approvedAt && (
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Approved On</p>
                    <p className="font-medium">{formatDateTime(request.approvedAt)}</p>
                  </div>
                </div>
              )}

              {request.rejectionReason && (
                <div className="flex items-center gap-3">
                  <XCircle className="h-4 w-4 text-red-400" />
                  <div>
                    <p className="text-sm text-gray-500">Rejection Reason</p>
                    <p className="font-medium text-red-600">{request.rejectionReason}</p>
                  </div>
                </div>
              )}

              {request.releasedAt && (
                <div className="flex items-center gap-3">
                  <Package className="h-4 w-4 text-blue-400" />
                  <div>
                    <p className="text-sm text-gray-500">Released On</p>
                    <p className="font-medium">{formatDateTime(request.releasedAt)}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}