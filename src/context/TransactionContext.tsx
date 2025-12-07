import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { Transaction, EditLog, TransactionFormData } from "@/types/transaction";

interface TransactionContextType {
  transactions: Transaction[];
  editLogs: EditLog[];
  lastUpdated: string;
  addTransaction: (data: TransactionFormData) => void;
  updateTransaction: (id: string, data: TransactionFormData) => void;
  deleteTransaction: (id: string) => void;
  getTransaction: (id: string) => Transaction | undefined;
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

const STORAGE_KEY = "dblock_transactions";
const LOGS_KEY = "dblock_edit_logs";
const INITIALIZED_KEY = "dblock_initialized";

// Generate sample data
function generateSampleData(): Transaction[] {
  const now = new Date();
  const samples: Transaction[] = [];
  
  const sampleTransactions = [
    { type: "income" as const, category: "Maintenance" as const, amount: 150000, description: "Monthly maintenance collection - May 2025", approvedBy: ["President", "Treasurer"] as const },
    { type: "expense" as const, category: "Electricity" as const, amount: 28500, description: "Common area electricity bill - May 2025", approvedBy: ["Secretary", "Treasurer"] as const },
    { type: "expense" as const, category: "Security" as const, amount: 35000, description: "Security guard salary - May 2025", approvedBy: ["President", "Secretary"] as const },
    { type: "expense" as const, category: "Cleaning" as const, amount: 12000, description: "Housekeeping staff salary - May 2025", approvedBy: ["Vice President"] as const },
    { type: "income" as const, category: "Maintenance" as const, amount: 148000, description: "Monthly maintenance collection - April 2025", approvedBy: ["President", "Treasurer"] as const },
    { type: "expense" as const, category: "Repair" as const, amount: 8500, description: "Water tank cleaning and repair", approvedBy: ["President", "Secretary", "Treasurer"] as const },
    { type: "expense" as const, category: "Water" as const, amount: 15000, description: "Water tanker charges - April 2025", approvedBy: ["Secretary"] as const },
    { type: "expense" as const, category: "Lift Maintenance" as const, amount: 5000, description: "Quarterly lift maintenance", approvedBy: ["President", "Treasurer"] as const },
    { type: "income" as const, category: "Festival" as const, amount: 25000, description: "Holi celebration fund collection", approvedBy: ["Vice President", "Secretary"] as const },
    { type: "expense" as const, category: "Festival" as const, amount: 22000, description: "Holi celebration expenses", approvedBy: ["President", "Vice President", "Treasurer"] as const },
    { type: "expense" as const, category: "Gardening" as const, amount: 3500, description: "Garden maintenance - plants and tools", approvedBy: ["Secretary"] as const },
    { type: "income" as const, category: "Maintenance" as const, amount: 152000, description: "Monthly maintenance collection - March 2025", approvedBy: ["President", "Treasurer"] as const },
  ];

  sampleTransactions.forEach((t, index) => {
    const date = new Date(now);
    date.setDate(date.getDate() - (index * 5));
    
    samples.push({
      id: `txn_${Date.now()}_${index}`,
      type: t.type,
      date: date.toISOString().split("T")[0],
      amount: t.amount,
      category: t.category,
      description: t.description,
      approvedBy: [...t.approvedBy],
      createdBy: "admin_dblock",
      createdAt: date.toISOString(),
      lastEditedAt: date.toISOString(),
    });
  });

  return samples;
}

export function TransactionProvider({ children }: { children: React.ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [editLogs, setEditLogs] = useState<EditLog[]>([]);
  const [lastUpdated, setLastUpdated] = useState<string>(new Date().toISOString());

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    const storedLogs = localStorage.getItem(LOGS_KEY);
    const isInitialized = localStorage.getItem(INITIALIZED_KEY);
    
    if (stored) {
      setTransactions(JSON.parse(stored));
    } else if (!isInitialized) {
      // Initialize with sample data only if never initialized before
      const sampleData = generateSampleData();
      setTransactions(sampleData);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sampleData));
      localStorage.setItem(INITIALIZED_KEY, "true");
    }
    
    if (storedLogs) {
      setEditLogs(JSON.parse(storedLogs));
    }
  }, []);

  // Save to localStorage whenever transactions change
  useEffect(() => {
    if (transactions.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
      setLastUpdated(new Date().toISOString());
    }
  }, [transactions]);

  useEffect(() => {
    if (editLogs.length > 0) {
      localStorage.setItem(LOGS_KEY, JSON.stringify(editLogs));
    }
  }, [editLogs]);

  const addTransaction = useCallback((data: TransactionFormData) => {
    const now = new Date().toISOString();
    const newTransaction: Transaction = {
      id: `txn_${Date.now()}`,
      ...data,
      createdBy: "admin_dblock",
      createdAt: now,
      lastEditedAt: now,
    };
    setTransactions((prev) => [newTransaction, ...prev]);
  }, []);

  const updateTransaction = useCallback((id: string, data: TransactionFormData) => {
    const now = new Date().toISOString();
    
    setTransactions((prev) => {
      const oldTransaction = prev.find((t) => t.id === id);
      if (!oldTransaction) return prev;

      // Create edit logs for changed fields
      const newLogs: EditLog[] = [];
      const fields: (keyof TransactionFormData)[] = ["type", "date", "amount", "category", "description", "note"];
      
      fields.forEach((field) => {
        const oldValue = String(oldTransaction[field] ?? "");
        const newValue = String(data[field] ?? "");
        if (oldValue !== newValue) {
          newLogs.push({
            id: `log_${Date.now()}_${field}`,
            transactionId: id,
            fieldChanged: field,
            oldValue,
            newValue,
            editedAt: now,
            editedBy: "admin_dblock",
          });
        }
      });

      // Check approvedBy changes
      const oldApprovers = oldTransaction.approvedBy.sort().join(", ");
      const newApprovers = data.approvedBy.sort().join(", ");
      if (oldApprovers !== newApprovers) {
        newLogs.push({
          id: `log_${Date.now()}_approvedBy`,
          transactionId: id,
          fieldChanged: "approvedBy",
          oldValue: oldApprovers,
          newValue: newApprovers,
          editedAt: now,
          editedBy: "admin_dblock",
        });
      }

      if (newLogs.length > 0) {
        setEditLogs((prevLogs) => [...newLogs, ...prevLogs]);
      }

      return prev.map((t) =>
        t.id === id
          ? {
              ...t,
              ...data,
              lastEditedAt: now,
            }
          : t
      );
    });
  }, []);

  const deleteTransaction = useCallback((id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  }, []);

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
        addTransaction,
        updateTransaction,
        deleteTransaction,
        getTransaction,
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
