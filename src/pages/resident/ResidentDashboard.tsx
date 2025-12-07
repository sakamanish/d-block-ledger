import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useTransactions } from "@/context/TransactionContext";
import { Header } from "@/components/layout/Header";
import { PageContainer } from "@/components/layout/PageContainer";
import { SummaryCard } from "@/components/shared/SummaryCard";
import { TransactionTable } from "@/components/shared/TransactionTable";
import { TransactionFilters, FilterState } from "@/components/shared/TransactionFilters";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CATEGORIES } from "@/config/auth";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Calendar,
  Download,
  Clock,
} from "lucide-react";
import {
  format,
  startOfMonth,
  endOfMonth,
  isWithinInterval,
  subMonths,
} from "date-fns";
import { useEffect } from "react";

export default function ResidentDashboard() {
  const navigate = useNavigate();
  const { isAuthenticated, role, flatNumber } = useAuth();
  const { transactions, lastUpdated } = useTransactions();

  const [filters, setFilters] = useState<FilterState>({
    search: "",
    type: "all",
    category: "",
    approvedBy: "",
    dateFrom: "",
    dateTo: "",
  });

  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });

  // Redirect if not resident
  useEffect(() => {
    if (!isAuthenticated || role !== "resident") {
      navigate("/resident");
    }
  }, [isAuthenticated, role, navigate]);

  // Calculate totals
  const totals = useMemo(() => {
    const totalIncome = transactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = transactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      totalIncome,
      totalExpenses,
      balance: totalIncome - totalExpenses,
    };
  }, [transactions]);

  // Filter transactions for all view
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      if (filters.search && !t.description.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }
      if (filters.type !== "all" && t.type !== filters.type) {
        return false;
      }
      if (filters.category && t.category !== filters.category) {
        return false;
      }
      if (filters.dateFrom && t.date < filters.dateFrom) {
        return false;
      }
      if (filters.dateTo && t.date > filters.dateTo) {
        return false;
      }
      return true;
    });
  }, [transactions, filters]);

  // Monthly summary data
  const monthlySummary = useMemo(() => {
    const [year, month] = selectedMonth.split("-").map(Number);
    const monthStart = startOfMonth(new Date(year, month - 1));
    const monthEnd = endOfMonth(new Date(year, month - 1));

    const monthTransactions = transactions.filter((t) => {
      const date = new Date(t.date);
      return isWithinInterval(date, { start: monthStart, end: monthEnd });
    });

    const income = monthTransactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);

    const expenses = monthTransactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    // Category breakdown
    const categoryBreakdown: Record<string, number> = {};
    monthTransactions
      .filter((t) => t.type === "expense")
      .forEach((t) => {
        categoryBreakdown[t.category] = (categoryBreakdown[t.category] || 0) + t.amount;
      });

    return {
      income,
      expenses,
      balance: income - expenses,
      categoryBreakdown,
      transactionCount: monthTransactions.length,
    };
  }, [transactions, selectedMonth]);

  // Generate month options (last 12 months)
  const monthOptions = useMemo(() => {
    const options = [];
    const now = new Date();
    for (let i = 0; i < 12; i++) {
      const date = subMonths(now, i);
      const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      const label = format(date, "MMMM yyyy");
      options.push({ value, label });
    }
    return options;
  }, []);

  const handleDownload = () => {
    const [year, month] = selectedMonth.split("-").map(Number);
    const monthStart = startOfMonth(new Date(year, month - 1));
    const monthEnd = endOfMonth(new Date(year, month - 1));

    const monthTransactions = transactions.filter((t) => {
      const date = new Date(t.date);
      return isWithinInterval(date, { start: monthStart, end: monthEnd });
    });

    // Create CSV content
    const headers = ["Date", "Type", "Amount", "Category", "Description", "Approved By"];
    const rows = monthTransactions.map((t) => [
      t.date,
      t.type,
      t.amount.toString(),
      t.category,
      `"${t.description.replace(/"/g, '""')}"`,
      t.approvedBy.join("; "),
    ]);

    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    // Download
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `dblock_transactions_${selectedMonth}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isAuthenticated || role !== "resident") {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <PageContainer
        title={`Welcome, Flat ${flatNumber}`}
        description="View D Block's income and expenses"
      >
        {/* Last Updated */}
        <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>Last updated: {format(new Date(lastUpdated), "dd MMM yyyy, h:mm a")}</span>
        </div>

        {/* Summary Cards */}
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <SummaryCard
            title="Total Balance"
            value={totals.balance}
            icon={Wallet}
            variant={totals.balance >= 0 ? "default" : "expense"}
          />
          <SummaryCard
            title="Total Income"
            value={totals.totalIncome}
            icon={TrendingUp}
            variant="income"
          />
          <SummaryCard
            title="Total Expenses"
            value={totals.totalExpenses}
            icon={TrendingDown}
            variant="expense"
          />
        </div>

        {/* Tabs for different views */}
        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">All Transactions</TabsTrigger>
            <TabsTrigger value="monthly">Monthly Summary</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            <TransactionFilters filters={filters} onFiltersChange={setFilters} />
            <h2 className="text-lg font-semibold">
              Transactions ({filteredTransactions.length})
            </h2>
            <TransactionTable transactions={filteredTransactions} />
          </TabsContent>

          <TabsContent value="monthly" className="space-y-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {monthOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button variant="outline" onClick={handleDownload} className="gap-2">
                <Download className="h-4 w-4" />
                Download CSV
              </Button>
            </div>

            {/* Monthly Summary Cards */}
            <div className="grid gap-4 sm:grid-cols-3">
              <SummaryCard
                title="Monthly Income"
                value={monthlySummary.income}
                icon={TrendingUp}
                variant="income"
              />
              <SummaryCard
                title="Monthly Expenses"
                value={monthlySummary.expenses}
                icon={TrendingDown}
                variant="expense"
              />
              <SummaryCard
                title="Closing Balance"
                value={monthlySummary.balance}
                subtitle={`${monthlySummary.transactionCount} transactions`}
                icon={Wallet}
                variant={monthlySummary.balance >= 0 ? "default" : "expense"}
              />
            </div>

            {/* Category Breakdown */}
            {Object.keys(monthlySummary.categoryBreakdown).length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-medium">
                    Expense Breakdown by Category
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(monthlySummary.categoryBreakdown)
                      .sort(([, a], [, b]) => b - a)
                      .map(([category, amount]) => {
                        const percentage = (amount / monthlySummary.expenses) * 100;
                        return (
                          <div key={category} className="space-y-1">
                            <div className="flex items-center justify-between text-sm">
                              <span>{category}</span>
                              <span className="font-medium">
                                ₹{amount.toLocaleString("en-IN")} ({percentage.toFixed(1)}%)
                              </span>
                            </div>
                            <div className="h-2 rounded-full bg-muted overflow-hidden">
                              <div
                                className="h-full rounded-full bg-primary transition-all"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </PageContainer>
    </div>
  );
}
