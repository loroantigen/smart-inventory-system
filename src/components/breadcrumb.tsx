"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

const routeNames: Record<string, string> = {
  dashboard: "Dashboard",
  inventory: "Inventory",
  consumables: "Consumables",
  requests: "Requests",
  users: "Users",
  departments: "Departments",
  reports: "Reports",
  "audit-logs": "Audit Logs",
  settings: "Settings",
  notifications: "Notifications",
  profile: "Profile",
};

export function Breadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0) return null;

  return (
    <nav className="flex items-center gap-2 text-sm text-gray-500 mb-4">
      <Link href="/dashboard" className="hover:text-gray-900 transition-colors">
        <Home className="h-4 w-4" />
      </Link>
      {segments.map((segment, index) => {
        const href = "/" + segments.slice(0, index + 1).join("/");
        const isLast = index === segments.length - 1;
        const name = routeNames[segment] || segment;

        return (
          <div key={segment} className="flex items-center gap-2">
            <ChevronRight className="h-4 w-4" />
            {isLast ? (
              <span className="font-medium text-gray-900">{name}</span>
            ) : (
              <Link href={href} className="hover:text-gray-900 transition-colors">
                {name}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}