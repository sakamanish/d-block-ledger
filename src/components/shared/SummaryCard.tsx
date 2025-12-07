import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface SummaryCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  variant?: "default" | "income" | "expense" | "neutral";
}

export function SummaryCard({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = "default",
}: SummaryCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p
              className={cn(
                "text-2xl font-semibold tabular-nums",
                variant === "income" && "text-income",
                variant === "expense" && "text-expense"
              )}
            >
              {typeof value === "number"
                ? `₹${value.toLocaleString("en-IN")}`
                : value}
            </p>
            {subtitle && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>
          {Icon && (
            <div
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-lg",
                variant === "income" && "bg-income-bg text-income",
                variant === "expense" && "bg-expense-bg text-expense",
                variant === "default" && "bg-primary/10 text-primary",
                variant === "neutral" && "bg-muted text-muted-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
