import { Category, ApproverRole } from "@/config/auth";

export type TransactionType = "income" | "expense";

export interface Transaction {
  id: string;
  type: TransactionType;
  date: string;
  amount: number;
  category: Category;
  description: string;
  approvedBy: ApproverRole[];
  note?: string;
  createdBy: string;
  createdAt: string;
  lastEditedAt: string;
}

export interface EditLog {
  id: string;
  transactionId: string;
  fieldChanged: string;
  oldValue: string;
  newValue: string;
  editedAt: string;
  editedBy: string;
}

export interface TransactionFormData {
  type: TransactionType;
  date: string;
  amount: number;
  category: Category;
  description: string;
  approvedBy: ApproverRole[];
  note?: string;
}
