import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Receipt, WifiOff } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { ExpenseCategory } from "../backend";
import type { Expense } from "../backend";
import { useConnectionMonitor } from "../hooks/useConnectionMonitor";
import { useOfflineStorage } from "../hooks/useOfflineStorage";
import { useGetExpenses, useRecordExpense } from "../hooks/useQueries";

export default function ExpenseLogger() {
  const { data: expenses = [] } = useGetExpenses();
  const recordExpense = useRecordExpense();
  const { isConnected } = useConnectionMonitor();
  const { addExpense } = useOfflineStorage();

  const [category, setCategory] = useState<ExpenseCategory>(
    ExpenseCategory.maintenance,
  );
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");

  // Local state for inline description editing
  const [editingDescriptions, setEditingDescriptions] = useState<
    Record<string, string>
  >({});

  const getDescription = (expense: Expense): string => {
    return editingDescriptions[expense.id.toString()] ?? expense.description;
  };

  const handleDescriptionChange = (expenseId: string, value: string) => {
    setEditingDescriptions((prev) => ({ ...prev, [expenseId]: value }));
  };

  const handleDescriptionBlur = (expense: Expense) => {
    const newDesc = editingDescriptions[expense.id.toString()];
    if (newDesc !== undefined && newDesc !== expense.description) {
      toast.success("Description updated");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount || Number.parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (!description.trim()) {
      toast.error("Please enter a description");
      return;
    }

    if (!isConnected) {
      try {
        const offlineExpense: Expense = {
          id: BigInt(Date.now()),
          category,
          amount: Number.parseFloat(amount),
          description: description.trim(),
          timestamp: BigInt(Date.now() * 1_000_000),
        };
        addExpense(offlineExpense);
        toast.success("Expense saved offline - will sync when online");
        setAmount("");
        setDescription("");
      } catch (_error) {
        toast.error("Failed to save expense offline");
      }
      return;
    }

    try {
      await recordExpense.mutateAsync({
        category,
        amount: Number.parseFloat(amount),
        description: description.trim(),
      });
      toast.success("Expense recorded successfully");
      setAmount("");
      setDescription("");
    } catch (_error) {
      toast.error("Failed to record expense");
    }
  };

  const formatTimestamp = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1_000_000);
    return date.toLocaleString();
  };

  const getCategoryColor = (cat: ExpenseCategory) => {
    switch (cat) {
      case ExpenseCategory.maintenance:
        return "bg-blue-100 text-blue-800";
      case ExpenseCategory.electricity:
        return "bg-yellow-100 text-yellow-800";
      case ExpenseCategory.salaries:
        return "bg-green-100 text-green-800";
      case ExpenseCategory.supplies:
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const categoryBreakdown = expenses.reduce(
    (acc, exp) => {
      const cat = exp.category;
      acc[cat] = (acc[cat] || 0) + exp.amount;
      return acc;
    },
    {} as Record<ExpenseCategory, number>,
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Expense Logger</h1>
        <p className="text-muted-foreground mt-1">
          Track and manage station expenses
        </p>
      </div>

      {!isConnected && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 flex items-center gap-3">
          <WifiOff className="w-5 h-5 text-destructive" />
          <div>
            <p className="font-medium text-destructive">Offline Mode</p>
            <p className="text-sm text-muted-foreground">
              Expenses will be saved locally and synced when connection is
              restored
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Log Expense</span>
              {!isConnected && <Badge variant="destructive">Offline</Badge>}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="category">Category</Label>
                <Select
                  value={category}
                  onValueChange={(v) => setCategory(v as ExpenseCategory)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ExpenseCategory.maintenance}>
                      Maintenance
                    </SelectItem>
                    <SelectItem value={ExpenseCategory.electricity}>
                      Electricity
                    </SelectItem>
                    <SelectItem value={ExpenseCategory.salaries}>
                      Salaries
                    </SelectItem>
                    <SelectItem value={ExpenseCategory.supplies}>
                      Supplies
                    </SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="amount">Amount (₹)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter expense details..."
                  rows={3}
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={recordExpense.isPending}
              >
                {recordExpense.isPending
                  ? "Recording..."
                  : isConnected
                    ? "Record Expense"
                    : "Save Offline"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Expense Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(categoryBreakdown).map(([cat, total]) => (
                <div
                  key={cat}
                  className="flex justify-between items-center p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <Receipt className="w-4 h-4" />
                    <span className="font-medium capitalize">{cat}</span>
                  </div>
                  <span className="text-lg font-bold">
                    ₹{(total as number).toFixed(2)}
                  </span>
                </div>
              ))}
              {Object.keys(categoryBreakdown).length === 0 && (
                <p className="text-center text-muted-foreground py-4">
                  No expenses recorded yet
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date &amp; Time</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses.slice(0, 20).map((expense, index) => (
                <TableRow
                  key={expense.id.toString()}
                  data-ocid={`expenses.item.${index + 1}`}
                >
                  <TableCell className="whitespace-nowrap">
                    {formatTimestamp(expense.timestamp)}
                  </TableCell>
                  <TableCell>
                    <Badge className={getCategoryColor(expense.category)}>
                      {String(expense.category).charAt(0).toUpperCase() +
                        String(expense.category).slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <Input
                      value={getDescription(expense)}
                      onChange={(e) =>
                        handleDescriptionChange(
                          expense.id.toString(),
                          e.target.value,
                        )
                      }
                      onBlur={() => handleDescriptionBlur(expense)}
                      className="h-8 text-sm border-transparent hover:border-input focus:border-input transition-colors bg-transparent"
                      data-ocid={`expenses.description.input.${index + 1}`}
                    />
                  </TableCell>
                  <TableCell className="text-right font-semibold whitespace-nowrap">
                    ₹{expense.amount.toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {expenses.length === 0 && (
            <p className="text-center text-muted-foreground py-8">
              No expenses recorded yet
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
