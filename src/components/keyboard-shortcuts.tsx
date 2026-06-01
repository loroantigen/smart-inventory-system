"use client";

import { useState, useEffect } from "react";
import { Keyboard, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const shortcuts = [
  { key: "Ctrl + K", description: "Open command palette / search" },
  { key: "Ctrl + /", description: "Show keyboard shortcuts" },
  { key: "ESC", description: "Close modals and dialogs" },
  { key: "Ctrl + D", description: "Go to Dashboard" },
  { key: "Ctrl + I", description: "Go to Inventory" },
  { key: "Ctrl + U", description: "Go to Consumables" },
  { key: "Ctrl + R", description: "Go to Requests" },
];

export function KeyboardShortcuts() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "/") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            Keyboard Shortcuts
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          {shortcuts.map((shortcut) => (
            <div
              key={shortcut.key}
              className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
            >
              <span className="text-sm text-gray-600">{shortcut.description}</span>
              <kbd className="inline-flex items-center rounded border bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700">
                {shortcut.key}
              </kbd>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}