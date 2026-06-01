"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Bell, Check, CheckCheck, Clock, AlertTriangle, Package, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { formatRelativeDate } from "@/lib/date-utils";
import Link from "next/link";

const notificationIcons: Record<string, any> = {
  LOW_STOCK: AlertTriangle,
  EXPIRATION: Clock,
  REQUEST_APPROVED: Check,
  REQUEST_REJECTED: AlertTriangle,
  ITEM_ASSIGNED: Package,
  SYSTEM: Bell,
};

export function NotificationDropdown() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const { data } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const res = await fetch("/api/notifications");
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
    refetchInterval: 30000,
  });

  const markAsRead = useMutation({
    mutationFn: async (id: string) => {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const markAllAsRead = useMutation({
    mutationFn: async () => {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAll: true }),
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const notifications = data?.notifications || [];
  const unreadCount = data?.unreadCount || 0;

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5 text-gray-600" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 h-4 w-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center font-medium">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between px-3 py-2">
          <span className="font-semibold">Notifications</span>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={() => markAllAsRead.mutate()}
            >
              <CheckCheck className="h-3 w-3 mr-1" />
              Mark all read
            </Button>
          )}
        </div>
        <DropdownMenuSeparator />
        <div className="max-h-80 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="px-3 py-8 text-center text-sm text-gray-500">
              <Bell className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              No notifications
            </div>
          ) : (
            notifications.map((notification: any) => {
              const Icon = notificationIcons[notification.type] || Bell;
              return (
                <DropdownMenuItem
                  key={notification.id}
                  className="flex items-start gap-3 px-3 py-2.5 cursor-pointer"
                  onClick={() => {
                    if (!notification.isRead) {
                      markAsRead.mutate(notification.id);
                    }
                    setOpen(false);
                  }}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    notification.isRead ? "bg-gray-100" : "bg-blue-100"
                  }`}>
                    <Icon className={`h-4 w-4 ${notification.isRead ? "text-gray-400" : "text-blue-600"}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${notification.isRead ? "text-gray-600" : "font-medium text-gray-900"}`}>
                      {notification.title}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{notification.message}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {formatRelativeDate(notification.createdAt)}
                    </p>
                  </div>
                  {!notification.isRead && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full shrink-0 mt-1.5" />
                  )}
                </DropdownMenuItem>
              );
            })
          )}
        </div>
        <DropdownMenuSeparator />
        <Link href="/notifications">
          <DropdownMenuItem className="justify-center text-sm text-blue-600 cursor-pointer">
            View all notifications
          </DropdownMenuItem>
        </Link>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}