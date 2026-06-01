"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  LayoutDashboard,
  Package,
  PackageCheck,
  Boxes,
  ClipboardList,
  Users,
  Building,
  FileBarChart,
  History,
  Settings,
  Bell,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  UserCircle,
  Download,
  Activity,
  ArrowLeftRight,
  Code,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import { signOut } from "next-auth/react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ["ADMIN", "MODERATOR", "USER"] },
  { name: "Inventory", href: "/inventory", icon: Package, roles: ["ADMIN", "MODERATOR", "USER"] },
  { name: "Consumables", href: "/consumables", icon: Boxes, roles: ["ADMIN", "MODERATOR", "USER"] },
  { name: "My Inventory", href: "/my-inventory", icon: PackageCheck,  roles: ["USER"] },
  { name: "Requests", href: "/requests", icon: ClipboardList, roles: ["ADMIN", "MODERATOR", "USER"] },
  { name: "Stock Movements", href: "/stock-movements", icon: ArrowLeftRight, roles: ["ADMIN", "MODERATOR"] },
  { name: "Users", href: "/users", icon: Users, roles: ["ADMIN"] },
  { name: "Departments", href: "/departments", icon: Building, roles: ["ADMIN"] },
  { name: "Reports", href: "/reports", icon: FileBarChart, roles: ["ADMIN", "MODERATOR"] },
  { name: "Export", href: "/export", icon: Download, roles: ["ADMIN", "MODERATOR"] },
  { name: "System Status", href: "/system-status", icon: Activity, roles: ["ADMIN"] },
  { name: "Audit Logs", href: "/audit-logs", icon: History, roles: ["ADMIN"] },
  { name: "API Docs", href: "/api-docs", icon: Code, roles: ["ADMIN"] },
  { name: "Settings", href: "/settings", icon: Settings, roles: ["ADMIN"] },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const userRole = session?.user?.role as string;
  const userName = session?.user?.name || "User";
  const userEmail = session?.user?.email || "";
  const userImage = session?.user?.image;

  const filteredNav = navigation.filter((item) =>
    item.roles.includes(userRole)
  );

  return (
    <>
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed top-4 left-4 z-50 p-2 bg-white rounded-md shadow-md lg:hidden"
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      <aside className={cn(
        "fixed top-0 left-0 z-40 h-screen bg-white border-r border-gray-200 transition-all duration-300 flex flex-col dark:bg-gray-900 dark:border-gray-800",
        collapsed ? "w-20" : "w-64",
        mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-800">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Package className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-lg text-gray-900 dark:text-white">SmartInv</span>
            </div>
          )}
          {collapsed && (
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mx-auto">
              <Package className="h-5 w-5 text-white" />
            </div>
          )}
          <button onClick={() => setCollapsed(!collapsed)} className="hidden lg:flex p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800">
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {filteredNav.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200",
                  collapsed && "justify-center"
                )}
              >
                <item.icon className={cn("h-5 w-5 shrink-0", isActive ? "text-blue-700 dark:text-blue-400" : "text-gray-400")} />
                {!collapsed && <span>{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        <Separator className="dark:border-gray-800" />

        <div className="px-3 py-2 space-y-1">
          <Link href="/notifications" className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
            pathname === "/notifications" ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20" : "text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800",
            collapsed && "justify-center"
          )}>
            <Bell className="h-5 w-5 shrink-0 text-gray-400" />
            {!collapsed && <span>Notifications</span>}
          </Link>
          <Link href="/profile" className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
            pathname === "/profile" ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20" : "text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800",
            collapsed && "justify-center"
          )}>
            <UserCircle className="h-5 w-5 shrink-0 text-gray-400" />
            {!collapsed && <span>Profile</span>}
          </Link>
        </div>

        <Separator className="dark:border-gray-800" />

        <div className="p-4">
          <div className={cn("flex items-center gap-3", collapsed && "flex-col")}>
            <Avatar className="h-9 w-9">
              <AvatarImage src={userImage || ""} />
              <AvatarFallback className="bg-blue-100 text-blue-700 text-sm font-medium">
                {userName?.charAt(0)?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{userName}</p>
                <p className="text-xs text-gray-500 truncate">{userEmail}</p>
                <p className="text-xs text-blue-600 font-medium mt-0.5">{userRole}</p>
              </div>
            )}
          </div>
          {!collapsed && (
            <Button variant="ghost" className="w-full mt-3 justify-start text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => signOut({ callbackUrl: "/login" })}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          )}
          {collapsed && (
            <button onClick={() => signOut({ callbackUrl: "/login" })} className="flex items-center justify-center w-full mt-3 p-2 rounded-lg text-red-600 hover:bg-red-50">
              <LogOut className="h-4 w-4" />
            </button>
          )}
        </div>
      </aside>
    </>
  );
}