import { cn } from "@/lib/utils";
import { TransactionType } from "@/types/transaction";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";

interface TransactionBadgeProps {
  type: TransactionType;
  showIcon?: boolean;
  className?: string;
}

export function TransactionBadge({
  type,
  showIcon = true,
  className,
}: TransactionBadgeProps) {
  const isIncome = type === "income";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        isIncome ? "bg-income-bg text-income" : "bg-expense-bg text-expense",
        className
      )}
    >
      {showIcon &&
        (isIncome ? (
          <ArrowDownLeft className="h-3 w-3" />
        ) : (
          <ArrowUpRight className="h-3 w-3" />
        ))}
      {isIncome ? "Income" : "Expense"}
    </span>
  );
}
