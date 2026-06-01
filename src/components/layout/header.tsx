"use client";

import { useState } from "react";
import { Search, Command } from "lucide-react";
import { Input } from "@/components/ui/input";
import { CommandPalette } from "@/components/command-palette";
import { KeyboardShortcuts } from "@/components/keyboard-shortcuts";
import { ThemeToggle } from "@/components/theme-toggle";
import { NotificationDropdown } from "@/components/notification-dropdown";
import { UserMenu } from "@/components/user-menu";

export function Header() {
  const [commandOpen, setCommandOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-30 bg-white border-b border-gray-200 h-16 dark:bg-gray-900 dark:border-gray-800">
        <div className="flex items-center justify-between h-full px-4 lg:px-8 ml-0 lg:ml-64">
          <button
            onClick={() => setCommandOpen(true)}
            className="flex-1 max-w-md"
          >
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="search"
                placeholder="Search inventory, consumables... (Ctrl+K)"
                className="pl-10 cursor-pointer"
                readOnly
              />
              <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:inline-flex h-5 items-center gap-1 rounded border bg-gray-100 px-1.5 text-[10px] font-medium text-gray-500">
                <Command className="h-3 w-3" />K
              </kbd>
            </div>
          </button>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <NotificationDropdown />
            <UserMenu />
          </div>
        </div>
      </header>

      <CommandPalette />
      <KeyboardShortcuts />
    </>
  );
}