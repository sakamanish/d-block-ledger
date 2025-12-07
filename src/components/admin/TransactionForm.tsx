import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CATEGORIES, APPROVER_ROLES, Category, ApproverRole } from "@/config/auth";
import { Transaction, TransactionFormData, TransactionType } from "@/types/transaction";
import { toast } from "@/hooks/use-toast";

interface TransactionFormProps {
  transaction?: Transaction;
  onSubmit: (data: TransactionFormData) => void;
  onCancel: () => void;
}

export function TransactionForm({
  transaction,
  onSubmit,
  onCancel,
}: TransactionFormProps) {
  const isEditing = !!transaction;

  const [formData, setFormData] = useState<TransactionFormData>({
    type: transaction?.type || "expense",
    date: transaction?.date || new Date().toISOString().split("T")[0],
    amount: transaction?.amount || 0,
    category: transaction?.category || "Maintenance",
    description: transaction?.description || "",
    approvedBy: transaction?.approvedBy || [],
    note: transaction?.note || "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.date) {
      newErrors.date = "Date is required";
    }

    if (!formData.amount || formData.amount <= 0) {
      newErrors.amount = "Amount must be greater than 0";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    if (formData.approvedBy.length === 0) {
      newErrors.approvedBy = "At least one approver is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form.",
        variant: "destructive",
      });
      return;
    }

    onSubmit(formData);
  };

  const handleApproverChange = (role: ApproverRole, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      approvedBy: checked
        ? [...prev.approvedBy, role]
        : prev.approvedBy.filter((r) => r !== role),
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="type">Transaction Type *</Label>
          <Select
            value={formData.type}
            onValueChange={(value) =>
              setFormData((prev) => ({ ...prev, type: value as TransactionType }))
            }
          >
            <SelectTrigger id="type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="income">Income</SelectItem>
              <SelectItem value="expense">Expense</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="date">Date *</Label>
          <Input
            id="date"
            type="date"
            value={formData.date}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, date: e.target.value }))
            }
          />
          {errors.date && (
            <p className="text-sm text-destructive">{errors.date}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="amount">Amount (₹) *</Label>
          <Input
            id="amount"
            type="number"
            min="0"
            step="0.01"
            value={formData.amount || ""}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                amount: parseFloat(e.target.value) || 0,
              }))
            }
            placeholder="Enter amount"
          />
          {errors.amount && (
            <p className="text-sm text-destructive">{errors.amount}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Category *</Label>
          <Select
            value={formData.category}
            onValueChange={(value) =>
              setFormData((prev) => ({ ...prev, category: value as Category }))
            }
          >
            <SelectTrigger id="category">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description / Reason *</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, description: e.target.value }))
          }
          placeholder="Enter the reason for this income or expense"
          rows={3}
        />
        <p className="text-xs text-muted-foreground">
          Provide a clear description of the transaction.
        </p>
        {errors.description && (
          <p className="text-sm text-destructive">{errors.description}</p>
        )}
      </div>

      <div className="space-y-3">
        <Label>Approved By *</Label>
        <p className="text-xs text-muted-foreground">
          Select at least one committee member who approved this transaction.
        </p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {APPROVER_ROLES.map((role) => (
            <div key={role} className="flex items-center space-x-2">
              <Checkbox
                id={`approver-${role}`}
                checked={formData.approvedBy.includes(role)}
                onCheckedChange={(checked) =>
                  handleApproverChange(role, checked as boolean)
                }
              />
              <Label
                htmlFor={`approver-${role}`}
                className="text-sm font-normal cursor-pointer"
              >
                {role}
              </Label>
            </div>
          ))}
        </div>
        {errors.approvedBy && (
          <p className="text-sm text-destructive">{errors.approvedBy}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="note">Additional Notes (Optional)</Label>
        <Textarea
          id="note"
          value={formData.note || ""}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, note: e.target.value }))
          }
          placeholder="Any additional notes or comments"
          rows={2}
        />
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {isEditing ? "Save Changes" : "Add Transaction"}
        </Button>
      </div>
    </form>
  );
}
