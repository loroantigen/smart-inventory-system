"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import {
  ClipboardList,
  Search,
  Plus,
  CheckCircle,
  XCircle,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { formatDateTime, getStatusColor } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

export default function RequestsPage() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [limit] = useState(10);

  const isModerator = session?.user?.role === "ADMIN" || session?.user?.role === "MODERATOR";

  const { data, isLoading } = useQuery({
    queryKey: ["requests", page, search, activeTab],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set("page", page.toString());
      params.set("limit", limit.toString());
      if (search) params.set("search", search);
      if (activeTab !== "all") params.set("status", activeTab.toUpperCase());

      const res = await fetch(`/api/requests?${params}`);
      if (!res.ok) throw new Error("Failed to fetch requests");
      return res.json();
    },
  });

  const approveMutation = useMutation({
    mutationFn: async (requestId: string) => {
      const res = await fetch("/api/requests", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId, action: "approve" }),
      });
      if (!res.ok) throw new Error("Failed to approve request");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["requests"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Request approved successfully");
      setSelectedRequest(null);
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to approve request");
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ requestId, reason }: { requestId: string; reason: string }) => {
      const res = await fetch("/api/requests", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId, action: "reject", rejectionReason: reason }),
      });
      if (!res.ok) throw new Error("Failed to reject request");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["requests"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Request rejected");
      setRejectDialogOpen(false);
      setRejectReason("");
      setSelectedRequest(null);
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to reject request");
    },
  });

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Requests</h1>
          <p className="text-gray-500 mt-1">Manage consumable item requests and approvals</p>
        </div>
        <Link href="/requests/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Request
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4">
            <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); setPage(1); }}>
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="approved">Approved</TabsTrigger>
                <TabsTrigger value="rejected">Rejected</TabsTrigger>
                <TabsTrigger value="released">Released</TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search requests..."
                className="pl-10"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              />
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
                <TableHead>Request #</TableHead>
                <TableHead>Item</TableHead>
                <TableHead>Requester</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Date</TableHead>
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
              ) : data?.requests?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                    No requests found
                  </TableCell>
                </TableRow>
              ) : (
                data?.requests?.map((req: any) => (
                  <TableRow key={req.id}>
                    <TableCell className="font-medium">{req.requestNumber}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{req.consumableItemName}</p>
                        <p className="text-xs text-gray-500">{req.unitType}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm">{req.requesterName}</p>
                        <p className="text-xs text-gray-500">{req.requesterDepartment}</p>
                      </div>
                    </TableCell>
                    <TableCell>{req.quantity}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(req.status)}>
                        {req.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{getPriorityBadge(req.priority)}</TableCell>
                    <TableCell>{formatDateTime(req.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/requests/${req.id}`}>
                          <Button variant="ghost" size="icon">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        {isModerator && req.status === "PENDING" && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-green-600"
                              onClick={() => approveMutation.mutate(req.id)}
                              disabled={approveMutation.isPending}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-red-600"
                              onClick={() => {
                                setSelectedRequest(req);
                                setRejectDialogOpen(true);
                              }}
                            >
                              <XCircle className="h-4 w-4" />
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
            {data.pagination.total} requests
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

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Request</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-500">
              Are you sure you want to reject request {selectedRequest?.requestNumber}?
            </p>
            <Textarea
              placeholder="Enter rejection reason (optional)"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() =>
                rejectMutation.mutate({
                  requestId: selectedRequest?.id,
                  reason: rejectReason,
                })
              }
              disabled={rejectMutation.isPending}
            >
              Reject Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}