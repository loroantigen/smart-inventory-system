"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Activity,
  Database,
  Server,
  Clock,
  CheckCircle,
  AlertTriangle,
  Users,
  HardDrive,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function SystemStatusPage() {
  const { data: health } = useQuery({
    queryKey: ["health"],
    queryFn: async () => {
      const res = await fetch("/api/health");
      return res.json();
    },
    refetchInterval: 30000,
  });

  const { data: stats } = useQuery({
    queryKey: ["stats"],
    queryFn: async () => {
      const res = await fetch("/api/stats");
      return res.json();
    },
    refetchInterval: 30000,
  });

  const isHealthy = health?.status === "healthy";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">System Status</h1>
        <p className="text-gray-500 mt-1">Monitor system health and performance</p>
      </div>

      {/* Health Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className={isHealthy ? "border-green-200" : "border-red-200"}>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                isHealthy ? "bg-green-100" : "bg-red-100"
              }`}>
                <Activity className={`h-5 w-5 ${isHealthy ? "text-green-600" : "text-red-600"}`} />
              </div>
              <div>
                <p className="text-sm text-gray-500">System Status</p>
                <p className={`font-bold ${isHealthy ? "text-green-700" : "text-red-700"}`}>
                  {isHealthy ? "Operational" : "Issues Detected"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={isHealthy ? "border-green-200" : "border-red-200"}>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                isHealthy ? "bg-green-100" : "bg-red-100"
              }`}>
                <Database className={`h-5 w-5 ${isHealthy ? "text-green-600" : "text-red-600"}`} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Database</p>
                <p className={`font-bold ${isHealthy ? "text-green-700" : "text-red-700"}`}>
                  {health?.services?.database === "connected" ? "Connected" : "Disconnected"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Last Checked</p>
                <p className="font-bold text-gray-900">
                  {health?.timestamp ? new Date(health.timestamp).toLocaleTimeString() : "N/A"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Statistics */}
      {stats && (
        <>
          <h2 className="text-lg font-semibold text-gray-900">Database Statistics</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Total Users</p>
                    <p className="text-2xl font-bold">{stats.users?.total || 0}</p>
                  </div>
                  <Users className="h-8 w-8 text-gray-300" />
                </div>
                <div className="flex gap-2 mt-2">
                  <Badge variant="outline" className="text-green-600">
                    {stats.users?.active || 0} Active
                  </Badge>
                  <Badge variant="outline" className="text-yellow-600">
                    {stats.users?.pending || 0} Pending
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Inventory Items</p>
                    <p className="text-2xl font-bold">{stats.inventory?.total || 0}</p>
                  </div>
                  <HardDrive className="h-8 w-8 text-gray-300" />
                </div>
                <div className="flex gap-2 mt-2">
                  <Badge variant="outline" className="text-blue-600">
                    {stats.inventory?.assigned || 0} Assigned
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Consumables</p>
                    <p className="text-2xl font-bold">{stats.consumables?.total || 0}</p>
                  </div>
                  <Server className="h-8 w-8 text-gray-300" />
                </div>
                <div className="flex gap-2 mt-2">
                  <Badge variant="outline" className="text-red-600">
                    {stats.consumables?.lowStock || 0} Low Stock
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Total Requests</p>
                    <p className="text-2xl font-bold">{stats.requests?.total || 0}</p>
                  </div>
                  <Activity className="h-8 w-8 text-gray-300" />
                </div>
                <div className="flex gap-2 mt-2">
                  <Badge variant="outline" className="text-yellow-600">
                    {stats.requests?.pending || 0} Pending
                  </Badge>
                  <Badge variant="outline" className="text-green-600">
                    {stats.requests?.approved || 0} Approved
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Alerts */}
          <h2 className="text-lg font-semibold text-gray-900 mt-6">System Alerts</h2>
          <div className="space-y-3">
            {(stats.consumables?.expired || 0) > 0 && (
              <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <div>
                  <p className="font-medium text-red-900">Expired Items</p>
                  <p className="text-sm text-red-700">
                    {stats.consumables.expired} consumable items have expired
                  </p>
                </div>
              </div>
            )}

            {(stats.consumables?.nearExpiry || 0) > 0 && (
              <div className="flex items-center gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="font-medium text-yellow-900">Near Expiry</p>
                  <p className="text-sm text-yellow-700">
                    {stats.consumables.nearExpiry} items are nearing expiry
                  </p>
                </div>
              </div>
            )}

            {(stats.consumables?.lowStock || 0) > 0 && (
              <div className="flex items-center gap-3 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="font-medium text-orange-900">Low Stock</p>
                  <p className="text-sm text-orange-700">
                    {stats.consumables.lowStock} items are running low
                  </p>
                </div>
              </div>
            )}

            {(stats.consumables?.expired || 0) === 0 &&
             (stats.consumables?.nearExpiry || 0) === 0 &&
             (stats.consumables?.lowStock || 0) === 0 && (
              <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium text-green-900">All Clear</p>
                  <p className="text-sm text-green-700">No alerts at this time</p>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}