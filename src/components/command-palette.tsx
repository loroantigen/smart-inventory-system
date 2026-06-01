"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Package,
  Boxes,
  ClipboardList,
  Users,
  Building,
  FileBarChart,
  LayoutDashboard,
  ArrowRight,
  X,
} from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/use-debounce";

const quickLinks = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard, category: "Navigation" },
  { title: "Inventory", href: "/inventory", icon: Package, category: "Navigation" },
  { title: "Consumables", href: "/consumables", icon: Boxes, category: "Navigation" },
  { title: "Requests", href: "/requests", icon: ClipboardList, category: "Navigation" },
  { title: "Users", href: "/users", icon: Users, category: "Navigation" },
  { title: "Departments", href: "/departments", icon: Building, category: "Navigation" },
  { title: "Reports", href: "/reports", icon: FileBarChart, category: "Navigation" },
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const debouncedQuery = useDebounce(query, 300);
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.length < 2) {
      setResults(null);
      return;
    }

    setLoading(true);
    fetch(`/api/search?q=${encodeURIComponent(debouncedQuery)}`)
      .then((res) => res.json())
      .then((data) => {
        setResults(data.results);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [debouncedQuery]);

  const handleSelect = (href: string) => {
    setOpen(false);
    setQuery("");
    router.push(href);
  };

  const filteredQuickLinks = query
    ? quickLinks.filter((link) =>
        link.title.toLowerCase().includes(query.toLowerCase())
      )
    : quickLinks;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="p-0 gap-0 max-w-2xl">
        <div className="flex items-center px-4 py-3 border-b">
          <Search className="h-5 w-5 text-gray-400 mr-3" />
          <Input
            placeholder="Search inventory, consumables, users..."
            className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 px-0"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          <kbd className="hidden sm:inline-flex h-6 items-center gap-1 rounded border bg-gray-100 px-2 text-xs font-medium text-gray-500">
            ESC
          </kbd>
        </div>

        <div className="max-h-[400px] overflow-y-auto py-2">
          {/* Quick Links */}
          {filteredQuickLinks.length > 0 && (
            <div className="px-2 py-1">
              <p className="px-2 py-1.5 text-xs font-semibold text-gray-500">Quick Links</p>
              {filteredQuickLinks.map((link) => (
                <button
                  key={link.href}
                  onClick={() => handleSelect(link.href)}
                  className="flex items-center gap-3 w-full px-2 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                >
                  <link.icon className="h-4 w-4 text-gray-400" />
                  <span className="flex-1 text-left">{link.title}</span>
                  <ArrowRight className="h-3 w-3 text-gray-300" />
                </button>
              ))}
            </div>
          )}

          {/* Search Results */}
          {results && (
            <>
              {results.inventory?.length > 0 && (
                <div className="px-2 py-1">
                  <p className="px-2 py-1.5 text-xs font-semibold text-gray-500">Inventory</p>
                  {results.inventory.map((item: any) => (
                    <button
                      key={item.id}
                      onClick={() => handleSelect(`/inventory/${item.id}`)}
                      className="flex items-center gap-3 w-full px-2 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                    >
                      <Package className="h-4 w-4 text-blue-400" />
                      <div className="flex-1 text-left">
                        <p className="font-medium">{item.itemName}</p>
                        <p className="text-xs text-gray-500">{item.propertyNumber}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {results.consumables?.length > 0 && (
                <div className="px-2 py-1">
                  <p className="px-2 py-1.5 text-xs font-semibold text-gray-500">Consumables</p>
                  {results.consumables.map((item: any) => (
                    <button
                      key={item.id}
                      onClick={() => handleSelect(`/consumables/${item.id}`)}
                      className="flex items-center gap-3 w-full px-2 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                    >
                      <Boxes className="h-4 w-4 text-green-400" />
                      <div className="flex-1 text-left">
                        <p className="font-medium">{item.itemName}</p>
                        <p className="text-xs text-gray-500">{item.propertyNumber} • {item.quantity} in stock</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {results.users?.length > 0 && (
                <div className="px-2 py-1">
                  <p className="px-2 py-1.5 text-xs font-semibold text-gray-500">Users</p>
                  {results.users.map((user: any) => (
                    <button
                      key={user.id}
                      onClick={() => handleSelect(`/users`)}
                      className="flex items-center gap-3 w-full px-2 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                    >
                      <Users className="h-4 w-4 text-purple-400" />
                      <div className="flex-1 text-left">
                        <p className="font-medium">{user.name || user.email}</p>
                        <p className="text-xs text-gray-500">{user.role}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {results.requests?.length > 0 && (
                <div className="px-2 py-1">
                  <p className="px-2 py-1.5 text-xs font-semibold text-gray-500">Requests</p>
                  {results.requests.map((req: any) => (
                    <button
                      key={req.id}
                      onClick={() => handleSelect(`/requests/${req.id}`)}
                      className="flex items-center gap-3 w-full px-2 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                    >
                      <ClipboardList className="h-4 w-4 text-orange-400" />
                      <div className="flex-1 text-left">
                        <p className="font-medium">{req.requestNumber}</p>
                        <p className="text-xs text-gray-500">{req.status} • {req.priority}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}

          {loading && (
            <div className="px-4 py-3 text-sm text-gray-500">Searching...</div>
          )}

          {query && !loading && results &&
            results.inventory?.length === 0 &&
            results.consumables?.length === 0 &&
            results.users?.length === 0 &&
            results.requests?.length === 0 &&
            filteredQuickLinks.length === 0 && (
              <div className="px-4 py-3 text-sm text-gray-500">
  {`No results found for "${query}"`}
</div>
            )}
        </div>

        <div className="flex items-center gap-4 px-4 py-2 border-t text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <kbd className="rounded border bg-gray-100 px-1.5 py-0.5">↑↓</kbd>
            <span>Navigate</span>
          </div>
          <div className="flex items-center gap-1">
            <kbd className="rounded border bg-gray-100 px-1.5 py-0.5">↵</kbd>
            <span>Select</span>
          </div>
          <div className="flex items-center gap-1">
            <kbd className="rounded border bg-gray-100 px-1.5 py-0.5">ESC</kbd>
            <span>Close</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}