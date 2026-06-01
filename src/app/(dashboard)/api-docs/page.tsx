"use client";

import { useState } from "react";
import {
  Code,
  Copy,
  Check,
  Globe,
  Lock,
  Database,
  Users,
  Package,
  Boxes,
  ClipboardList,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const endpoints = [
  {
    category: "Auth",
    icon: Lock,
    routes: [
      { method: "POST", path: "/api/auth/[...nextauth]", description: "NextAuth.js handlers", auth: false },
      { method: "POST", path: "/api/register", description: "User registration", auth: false },
    ],
  },
  {
    category: "Dashboard",
    icon: Globe,
    routes: [
      { method: "GET", path: "/api/dashboard", description: "Dashboard statistics", auth: true },
      { method: "GET", path: "/api/stats", description: "System statistics", auth: true },
      { method: "GET", path: "/api/health", description: "Health check", auth: true },
      { method: "GET", path: "/api/search", description: "Global search", auth: true },
    ],
  },
  {
    category: "Inventory",
    icon: Package,
    routes: [
      { method: "GET", path: "/api/inventory", description: "List inventory items", auth: true },
      { method: "POST", path: "/api/inventory", description: "Create inventory item", auth: true },
      { method: "GET", path: "/api/inventory/:id", description: "Get item details", auth: true },
      { method: "PATCH", path: "/api/inventory/:id", description: "Update item", auth: true },
      { method: "DELETE", path: "/api/inventory/:id", description: "Delete item", auth: true },
    ],
  },
  {
    category: "Consumables",
    icon: Boxes,
    routes: [
      { method: "GET", path: "/api/consumables", description: "List consumables", auth: true },
      { method: "POST", path: "/api/consumables", description: "Create consumable", auth: true },
      { method: "GET", path: "/api/consumables/:id", description: "Get consumable details", auth: true },
      { method: "PATCH", path: "/api/consumables/:id", description: "Update consumable", auth: true },
      { method: "DELETE", path: "/api/consumables/:id", description: "Delete consumable", auth: true },
    ],
  },
  {
    category: "Requests",
    icon: ClipboardList,
    routes: [
      { method: "GET", path: "/api/requests", description: "List requests", auth: true },
      { method: "POST", path: "/api/requests", description: "Create request", auth: true },
      { method: "PATCH", path: "/api/requests", description: "Approve/Reject request", auth: true },
      { method: "GET", path: "/api/requests/:id", description: "Get request details", auth: true },
    ],
  },
  {
    category: "Users",
    icon: Users,
    routes: [
      { method: "GET", path: "/api/users", description: "List users", auth: true },
      { method: "POST", path: "/api/users", description: "Create user", auth: true },
      { method: "PATCH", path: "/api/users", description: "Update user", auth: true },
    ],
  },
];

const methodColors: Record<string, string> = {
  GET: "bg-green-100 text-green-800",
  POST: "bg-blue-100 text-blue-800",
  PATCH: "bg-yellow-100 text-yellow-800",
  DELETE: "bg-red-100 text-red-800",
};

export default function ApiDocsPage() {
  const [copiedPath, setCopiedPath] = useState<string | null>(null);

  const copyToClipboard = (path: string) => {
    navigator.clipboard.writeText(path);
    setCopiedPath(path);
    setTimeout(() => setCopiedPath(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">API Documentation</h1>
        <p className="text-gray-500 mt-1">Internal API reference for developers</p>
      </div>

      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold mb-2">Base URL</h3>
          <code className="bg-gray-100 px-3 py-2 rounded-lg text-sm block">
            {typeof window !== "undefined" ? window.location.origin : ""}/api
          </code>
          <p className="text-sm text-gray-500 mt-2">
            All API routes require authentication except registration and auth handlers.
          </p>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {endpoints.map((group) => (
          <Card key={group.category}>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <group.icon className="h-5 w-5 text-gray-400" />
                {group.category}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {group.routes.map((route) => (
                  <div
                    key={route.path}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Badge className={methodColors[route.method] || "bg-gray-100"}>
                      {route.method}
                    </Badge>
                    <code className="text-sm font-mono flex-1">{route.path}</code>
                    <span className="text-sm text-gray-500 hidden sm:block">{route.description}</span>
                    {route.auth ? (
                      <Lock className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Globe className="h-4 w-4 text-green-400" />
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => copyToClipboard(route.path)}
                    >
                      {copiedPath === route.path ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}