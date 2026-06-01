import { cn } from "@/lib/utils";
import { Package, Boxes, ClipboardList, Users, Search, FileBarChart } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: "inventory" | "consumables" | "requests" | "users" | "search" | "reports";
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

const iconMap = {
  inventory: Package,
  consumables: Boxes,
  requests: ClipboardList,
  users: Users,
  search: Search,
  reports: FileBarChart,
};

export function EmptyState({
  title,
  description,
  icon = "search",
  action,
  className,
}: EmptyStateProps) {
  const Icon = iconMap[icon];

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-12 text-center",
        className
      )}
    >
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <Icon className="h-8 w-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-500 max-w-sm mb-4">{description}</p>
      {action && (
        <Button onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}