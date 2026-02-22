import { useState } from 'react';
import { useGetExpenses, useRecordExpense } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Receipt } from 'lucide-react';
import { toast } from 'sonner';
import { ExpenseCategory } from '../backend';

export default function ExpenseLogger() {
  const { data: expenses = [] } = useGetExpenses();
  const recordExpense = useRecordExpense();

  const [category, setCategory] = useState<ExpenseCategory>(ExpenseCategory.maintenance);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (!description.trim()) {
      toast.error('Please enter a description');
      return;
    }

    try {
      await recordExpense.mutateAsync({
        category,
        amount: parseFloat(amount),
        description,
      });
      toast.success('Expense recorded successfully');
      setAmount('');
      setDescription('');
    } catch (error) {
      toast.error('Failed to record expense');
    }
  };

  const formatTimestamp = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1_000_000);
    return date.toLocaleString();
  };

  const getCategoryColor = (cat: ExpenseCategory) => {
    switch (cat) {
      case ExpenseCategory.maintenance:
        return 'bg-blue-100 text-blue-800';
      case ExpenseCategory.electricity:
        return 'bg-yellow-100 text-yellow-800';
      case ExpenseCategory.salaries:
        return 'bg-green-100 text-green-800';
      case ExpenseCategory.supplies:
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const categoryTotals = {
    maintenance: expenses.filter((e) => e.category === ExpenseCategory.maintenance).reduce((sum, e) => sum + e.amount, 0),
    electricity: expenses.filter((e) => e.category === ExpenseCategory.electricity).reduce((sum, e) => sum + e.amount, 0),
    salaries: expenses.filter((e) => e.category === ExpenseCategory.salaries).reduce((sum, e) => sum + e.amount, 0),
    supplies: expenses.filter((e) => e.category === ExpenseCategory.supplies).reduce((sum, e) => sum + e.amount, 0),
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Expense Logger</h1>
        <p className="text-muted-foreground mt-1">Track and manage operational expenses</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">₹{totalExpenses.toFixed(2)}</p>
          </CardContent>
        </Card>

        {Object.entries(categoryTotals).map(([cat, total]) => (
          <Card key={cat}>
            <CardHeader>
              <CardTitle className="text-sm font-medium capitalize">{cat}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xl font-bold">₹{total.toFixed(2)}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Log New Expense</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={category} onValueChange={(v) => setCategory(v as ExpenseCategory)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ExpenseCategory.maintenance}>Maintenance</SelectItem>
                    <SelectItem value={ExpenseCategory.electricity}>Electricity</SelectItem>
                    <SelectItem value={ExpenseCategory.salaries}>Salaries</SelectItem>
                    <SelectItem value={ExpenseCategory.supplies}>Supplies</SelectItem>
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

              <Button type="submit" className="w-full" disabled={recordExpense.isPending}>
                {recordExpense.isPending ? 'Recording...' : 'Record Expense'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Category Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(categoryTotals).map(([cat, total]) => {
                const percentage = totalExpenses > 0 ? (total / totalExpenses) * 100 : 0;
                return (
                  <div key={cat}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium capitalize">{cat}</span>
                      <span className="text-muted-foreground">
                        ₹{total.toFixed(2)} ({percentage.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Expense History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date & Time</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses.slice(0, 20).map((expense) => (
                <TableRow key={expense.id.toString()}>
                  <TableCell>{formatTimestamp(expense.timestamp)}</TableCell>
                  <TableCell>
                    <Badge className={getCategoryColor(expense.category)}>
                      {String(expense.category).charAt(0).toUpperCase() + String(expense.category).slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">{expense.description}</TableCell>
                  <TableCell className="text-right font-semibold">₹{expense.amount.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {expenses.length === 0 && (
            <p className="text-center text-muted-foreground py-8">No expenses recorded yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
