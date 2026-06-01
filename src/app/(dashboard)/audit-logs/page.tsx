"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  History,
  Search,
  Filter,
  User,
  Package,
  Boxes,
  ClipboardList,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatDateTime } from "@/lib/utils";

const entityIcons: Record<string, any> = {
  USER: User,
  INVENTORY_ITEM: Package,
  CONSUMABLE_ITEM: Boxes,
  CONSUMABLE_REQUEST: ClipboardList,
  SYSTEM: Settings,
};

export default function AuditLogsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [entityType, setEntityType] = useState("ALL");
  const [limit] = useState(20);

  const { data, isLoading } = useQuery({
    queryKey: ["audit-logs", page, search, entityType],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set("page", page.toString());
      params.set("limit", limit.toString());
      if (search) params.set("search", search);
      if (entityType !== "ALL") params.set("entityType", entityType);

      const res = await fetch(`/api/audit-logs?${params}`);
      if (!res.ok) throw new Error("Failed to fetch audit logs");
      return res.json();
    },
  });

  const getActionColor = (action: string) => {
    if (action.includes("CREATE") || action.includes("ADD")) return "bg-green-100 text-green-800";
    if (action.includes("UPDATE") || action.includes("EDIT")) return "bg-blue-100 text-blue-800";
    if (action.includes("DELETE") || action.includes("REMOVE")) return "bg-red-100 text-red-800";
    if (action.includes("APPROVE")) return "bg-green-100 text-green-800";
    if (action.includes("REJECT")) return "bg-red-100 text-red-800";
    return "bg-gray-100 text-gray-800";
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
        <p className="text-gray-500 mt-1">Track all system activities and changes</p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by action, user, or entity..."
                className="pl-10"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              />
            </div>
            <Select value={entityType} onValueChange={(v) => { setEntityType(v); setPage(1); }}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Entity Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Entities</SelectItem>
                <SelectItem value="USER">Users</SelectItem>
                <SelectItem value="INVENTORY_ITEM">Inventory</SelectItem>
                <SelectItem value="CONSUMABLE_ITEM">Consumables</SelectItem>
                <SelectItem value="CONSUMABLE_REQUEST">Requests</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Entity</TableHead>
                <TableHead>Entity ID</TableHead>
                <TableHead>IP Address</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : data?.logs?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    No audit logs found
                  </TableCell>
                </TableRow>
              ) : (
                data?.logs?.map((log: any) => {
                  const Icon = entityIcons[log.entityType] || Settings;
                  return (
                    <TableRow key={log.id}>
                      <TableCell className="text-sm">
                        {formatDateTime(log.createdAt)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
                            <User className="h-3 w-3 text-gray-600" />
                          </div>
                          <span className="text-sm">{log.userName || "System"}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getActionColor(log.action)}>
                          {log.action.replace(/_/g, " ")}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">{log.entityType.replace(/_/g, " ")}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-xs">{log.entityId}</TableCell>
                      <TableCell className="text-sm text-gray-500">{log.ipAddress || "N/A"}</TableCell>
                    </TableRow>
                  );
                })
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
            {data.pagination.total} logs
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
    </div>
  );
}