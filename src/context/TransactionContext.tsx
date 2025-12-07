import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { Transaction, EditLog, TransactionFormData } from "@/types/transaction";
import { supabase } from "@/integrations/supabase/client";
import { Category, ApproverRole } from "@/config/auth";

interface TransactionContextType {
  transactions: Transaction[];
  editLogs: EditLog[];
  lastUpdated: string;
  loading: boolean;
  addTransaction: (data: TransactionFormData) => Promise<void>;
  updateTransaction: (id: string, data: TransactionFormData) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  getTransaction: (id: string) => Transaction | undefined;
  refreshTransactions: () => Promise<void>;
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

export function TransactionProvider({ children }: { children: React.ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [editLogs, setEditLogs] = useState<EditLog[]>([]);
  const [lastUpdated, setLastUpdated] = useState<string>(new Date().toISOString());
  const [loading, setLoading] = useState(true);

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const mapped: Transaction[] = (data || []).map((row) => ({
        id: row.id,
        type: row.type as "income" | "expense",
        date: row.date,
        amount: Number(row.amount),
        category: row.category as Category,
        description: row.description,
        approvedBy: (row.approved_by || []) as ApproverRole[],
        note: row.note || undefined,
        createdBy: row.created_by,
        createdAt: row.created_at,
        lastEditedAt: row.last_edited_at,
      }));

      setTransactions(mapped);
      setLastUpdated(new Date().toISOString());
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchEditLogs = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("edit_logs")
        .select("*")
        .order("edited_at", { ascending: false });

      if (error) throw error;

      const mapped: EditLog[] = (data || []).map((row) => ({
        id: row.id,
        transactionId: row.transaction_id,
        fieldChanged: row.field_changed,
        oldValue: row.old_value || "",
        newValue: row.new_value || "",
        editedAt: row.edited_at,
        editedBy: row.edited_by,
      }));

      setEditLogs(mapped);
    } catch (error) {
      console.error("Error fetching edit logs:", error);
    }
  }, []);

  const refreshTransactions = useCallback(async () => {
    await Promise.all([fetchTransactions(), fetchEditLogs()]);
  }, [fetchTransactions, fetchEditLogs]);

  useEffect(() => {
    refreshTransactions();
  }, [refreshTransactions]);

  const addTransaction = useCallback(async (data: TransactionFormData) => {
    const { error } = await supabase.from("transactions").insert({
      type: data.type,
      date: data.date,
      amount: data.amount,
      category: data.category,
      description: data.description,
      approved_by: data.approvedBy,
      note: data.note || null,
      created_by: "admin_dblock",
    });

    if (error) {
      console.error("Error adding transaction:", error);
      throw error;
    }

    await refreshTransactions();
  }, [refreshTransactions]);

  const updateTransaction = useCallback(async (id: string, data: TransactionFormData) => {
    const oldTransaction = transactions.find((t) => t.id === id);
    if (!oldTransaction) return;

    // Create edit logs for changed fields
    const fields: (keyof TransactionFormData)[] = ["type", "date", "amount", "category", "description", "note"];
    const logsToInsert: { transaction_id: string; field_changed: string; old_value: string; new_value: string; edited_by: string }[] = [];

    fields.forEach((field) => {
      const oldValue = String(oldTransaction[field] ?? "");
      const newValue = String(data[field] ?? "");
      if (oldValue !== newValue) {
        logsToInsert.push({
          transaction_id: id,
          field_changed: field,
          old_value: oldValue,
          new_value: newValue,
          edited_by: "admin_dblock",
        });
      }
    });

    // Check approvedBy changes
    const oldApprovers = oldTransaction.approvedBy.sort().join(", ");
    const newApprovers = data.approvedBy.sort().join(", ");
    if (oldApprovers !== newApprovers) {
      logsToInsert.push({
        transaction_id: id,
        field_changed: "approvedBy",
        old_value: oldApprovers,
        new_value: newApprovers,
        edited_by: "admin_dblock",
      });
    }

    // Insert edit logs
    if (logsToInsert.length > 0) {
      const { error: logError } = await supabase.from("edit_logs").insert(logsToInsert);
      if (logError) console.error("Error inserting edit logs:", logError);
    }

    // Update transaction
    const { error } = await supabase
      .from("transactions")
      .update({
        type: data.type,
        date: data.date,
        amount: data.amount,
        category: data.category,
        description: data.description,
        approved_by: data.approvedBy,
        note: data.note || null,
      })
      .eq("id", id);

    if (error) {
      console.error("Error updating transaction:", error);
      throw error;
    }

    await refreshTransactions();
  }, [transactions, refreshTransactions]);

  const deleteTransaction = useCallback(async (id: string) => {
    const { error } = await supabase.from("transactions").delete().eq("id", id);

    if (error) {
      console.error("Error deleting transaction:", error);
      throw error;
    }

    await refreshTransactions();
  }, [refreshTransactions]);

  const getTransaction = useCallback(
    (id: string) => transactions.find((t) => t.id === id),
    [transactions]
  );

  return (
    <TransactionContext.Provider
      value={{
        transactions,
        editLogs,
        lastUpdated,
        loading,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        getTransaction,
        refreshTransactions,
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
}

export function useTransactions() {
  const context = useContext(TransactionContext);
  if (context === undefined) {
    throw new Error("useTransactions must be used within a TransactionProvider");
  }
  return context;
}