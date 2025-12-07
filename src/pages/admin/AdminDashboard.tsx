import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useTransactions } from "@/context/TransactionContext";
import { Header } from "@/components/layout/Header";
import { PageContainer } from "@/components/layout/PageContainer";
import { SummaryCard } from "@/components/shared/SummaryCard";
import { TransactionTable } from "@/components/shared/TransactionTable";
import { TransactionFilters, FilterState } from "@/components/shared/TransactionFilters";
import { TransactionForm } from "@/components/admin/TransactionForm";
import { MonthlyChart } from "@/components/admin/MonthlyChart";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Transaction, TransactionFormData } from "@/types/transaction";
import { toast } from "@/hooks/use-toast";
import {
  Plus,
  TrendingUp,
  TrendingDown,
  Wallet,
  Receipt,
} from "lucide-react";
import {
  startOfMonth,
  endOfMonth,
  isWithinInterval,
} from "date-fns";
import { useEffect } from "react";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { isAuthenticated, role } = useAuth();
  const {
    transactions,
    lastUpdated,
    addTransaction,
    updateTransaction,
    deleteTransaction,
  } = useTransactions();

  const [filters, setFilters] = useState<FilterState>({
    search: "",
    type: "all",
    category: "",
    approvedBy: "",
    dateFrom: "",
    dateTo: "",
  });

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [deletingTransaction, setDeletingTransaction] = useState<Transaction | null>(null);

  // Redirect if not admin
  useEffect(() => {
    if (!isAuthenticated || role !== "admin") {
      navigate("/admin/login");
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

    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);

    const thisMonthTransactions = transactions.filter((t) => {
      const date = new Date(t.date);
      return isWithinInterval(date, { start: monthStart, end: monthEnd });
    });

    const thisMonthIncome = thisMonthTransactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);

    const thisMonthExpenses = thisMonthTransactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      totalIncome,
      totalExpenses,
      balance: totalIncome - totalExpenses,
      thisMonthIncome,
      thisMonthExpenses,
      thisMonthCount: thisMonthTransactions.length,
    };
  }, [transactions]);

  // Filter transactions
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

  const handleAddTransaction = (data: TransactionFormData) => {
    addTransaction(data);
    setIsFormOpen(false);
    toast({
      title: "Transaction Added",
      description: `${data.type === "income" ? "Income" : "Expense"} of ₹${data.amount.toLocaleString("en-IN")} has been added.`,
    });
  };

  const handleEditTransaction = (data: TransactionFormData) => {
    if (editingTransaction) {
      updateTransaction(editingTransaction.id, data);
      setEditingTransaction(null);
      toast({
        title: "Transaction Updated",
        description: "The transaction has been updated successfully.",
      });
    }
  };

  const handleDeleteConfirm = () => {
    if (deletingTransaction) {
      deleteTransaction(deletingTransaction.id);
      setDeletingTransaction(null);
      toast({
        title: "Transaction Deleted",
        description: "The transaction has been deleted.",
      });
    }
  };

  if (!isAuthenticated || role !== "admin") {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <PageContainer
        title="Admin Panel"
        description="Manage D Block's income and expenses"
        actions={
          <Button onClick={() => setIsFormOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Transaction
          </Button>
        }
      >
        {/* Summary Cards */}
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <SummaryCard
            title="Total Balance"
            value={totals.balance}
            subtitle="All time"
            icon={Wallet}
            variant={totals.balance >= 0 ? "default" : "expense"}
          />
          <SummaryCard
            title="Total Income"
            value={totals.totalIncome}
            subtitle="All time"
            icon={TrendingUp}
            variant="income"
          />
          <SummaryCard
            title="Total Expenses"
            value={totals.totalExpenses}
            subtitle="All time"
            icon={TrendingDown}
            variant="expense"
          />
          <SummaryCard
            title="This Month"
            value={totals.thisMonthCount}
            subtitle={`Income: ₹${(totals.thisMonthIncome / 1000).toFixed(0)}K | Expenses: ₹${(totals.thisMonthExpenses / 1000).toFixed(0)}K`}
            icon={Receipt}
            variant="neutral"
          />
        </div>

        {/* Chart */}
        <div className="mb-6">
          <MonthlyChart transactions={transactions} />
        </div>

        {/* Filters */}
        <div className="mb-4">
          <TransactionFilters filters={filters} onFiltersChange={setFilters} />
        </div>

        {/* Transactions Table */}
        <div className="mb-4">
          <h2 className="mb-3 text-lg font-semibold">
            All Transactions ({filteredTransactions.length})
          </h2>
          <TransactionTable
            transactions={filteredTransactions}
            showActions
            onEdit={(t) => setEditingTransaction(t)}
            onDelete={(t) => setDeletingTransaction(t)}
          />
        </div>

        {/* Add Transaction Dialog */}
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Transaction</DialogTitle>
              <DialogDescription>
                Enter the details of the income or expense.
              </DialogDescription>
            </DialogHeader>
            <TransactionForm
              onSubmit={handleAddTransaction}
              onCancel={() => setIsFormOpen(false)}
            />
          </DialogContent>
        </Dialog>

        {/* Edit Transaction Dialog */}
        <Dialog
          open={!!editingTransaction}
          onOpenChange={(open) => !open && setEditingTransaction(null)}
        >
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Transaction</DialogTitle>
              <DialogDescription>
                Update the transaction details below.
              </DialogDescription>
            </DialogHeader>
            {editingTransaction && (
              <TransactionForm
                transaction={editingTransaction}
                onSubmit={handleEditTransaction}
                onCancel={() => setEditingTransaction(null)}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <AlertDialog
          open={!!deletingTransaction}
          onOpenChange={(open) => !open && setDeletingTransaction(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete this transaction. This action cannot be
                undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteConfirm}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </PageContainer>
    </div>
  );
}
