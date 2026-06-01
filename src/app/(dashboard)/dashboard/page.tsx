"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Package,
  Boxes,
  AlertTriangle,
  Clock,
  CheckCircle,
  TrendingUp,
  Users,
  Calendar,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { formatDateTime } from "@/lib/utils";
import Link from "next/link";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

export default function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const res = await fetch("/api/dashboard");
      if (!res.ok) throw new Error("Failed to fetch dashboard data");
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4" />
                <div className="h-8 bg-gray-200 rounded w-1/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const stats = data?.stats || {};
  const monthlyUsage = data?.monthlyUsage || [];
  const departmentStats = data?.departmentStats || [];
  const recentActivities = data?.recentActivities || [];
  const requestTrends = data?.requestTrends || [];

  const statCards = [
    {
      title: "Total Inventory",
      value: stats.totalInventory || 0,
      icon: Package,
      color: "bg-blue-50 text-blue-600",
      href: "/inventory",
    },
    {
      title: "Total Consumables",
      value: stats.totalConsumables || 0,
      icon: Boxes,
      color: "bg-green-50 text-green-600",
      href: "/consumables",
    },
    {
      title: "Low Stock Items",
      value: stats.lowStockItems || 0,
      icon: AlertTriangle,
      color: "bg-yellow-50 text-yellow-600",
      href: "/consumables?lowStock=true",
    },
    {
      title: "Near Expiry",
      value: stats.nearExpiryItems || 0,
      icon: Clock,
      color: "bg-orange-50 text-orange-600",
      href: "/consumables?nearExpiry=true",
    },
    {
      title: "Expired Items",
      value: stats.expiredItems || 0,
      icon: AlertTriangle,
      color: "bg-red-50 text-red-600",
      href: "/consumables?expired=true",
    },
    {
      title: "Pending Requests",
      value: stats.pendingRequests || 0,
      icon: TrendingUp,
      color: "bg-purple-50 text-purple-600",
      href: "/requests",
    },
    {
      title: "Approved Requests",
      value: stats.approvedRequests || 0,
      icon: CheckCircle,
      color: "bg-teal-50 text-teal-600",
      href: "/requests",
    },
    {
      title: "Assigned Equipment",
      value: stats.assignedEquipment || 0,
      icon: Users,
      color: "bg-indigo-50 text-indigo-600",
      href: "/inventory",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Overview of your inventory and logistics system</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Link key={stat.title} href={stat.href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.color}`}>
                    <stat.icon className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Usage Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Monthly Stock Movement</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyUsage}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="stockIn" fill="#3b82f6" name="Stock In" />
                <Bar dataKey="stockOut" fill="#10b981" name="Stock Out" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Request Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Request Trends (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={requestTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="requests"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  dot={{ fill: "#8b5cf6" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Department Stats & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Inventory by Department</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={departmentStats}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="inventoryCount"
                  nameKey="departmentName"
                >
                  {departmentStats.map((_: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {departmentStats.map((dept: any, index: number) => (
                <div key={dept.departmentName} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-sm text-gray-600">{dept.departmentName}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No recent activity</p>
              ) : (
                recentActivities.map((activity: any) => (
                  <div key={activity.id} className="flex items-start gap-3 pb-3 border-b border-gray-100 last:border-0">
                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                      <Calendar className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.action.replace(/_/g, " ")}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {activity.entityType} • {activity.userName}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {formatDateTime(activity.createdAt)}
                      </p>
                    </div>
                    <Badge variant="outline" className="shrink-0 text-xs">
                      {activity.entityType}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}