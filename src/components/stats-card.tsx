import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  href?: string;
  trend?: {
    value: number;
    label: string;
  };
}

export function StatsCard({ title, value, icon: Icon, color, href, trend }: StatsCardProps) {
  const content = (
    <Card className={cn("hover:shadow-md transition-shadow", href && "cursor-pointer")}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
            {trend && (
              <p className={cn(
                "text-xs mt-1 font-medium",
                trend.value >= 0 ? "text-green-600" : "text-red-600"
              )}>
                {trend.value >= 0 ? "+" : ""}{trend.value}% {trend.label}
              </p>
            )}
          </div>
          <div className={`p-3 rounded-lg ${color}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}