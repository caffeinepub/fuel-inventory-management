import { useState } from 'react';
import { useGetCashCollections, useRecordCashCollection, useGetSales } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DollarSign } from 'lucide-react';
import { toast } from 'sonner';

export default function CashCollectionEntry() {
  const { data: collections = [] } = useGetCashCollections();
  const { data: sales = [] } = useGetSales();
  const recordCashCollection = useRecordCashCollection();

  const [amount, setAmount] = useState('');
  const [breakdown, setBreakdown] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    try {
      await recordCashCollection.mutateAsync({
        amount: parseFloat(amount),
        breakdown: breakdown || 'No breakdown provided',
      });
      toast.success('Cash collection recorded successfully');
      setAmount('');
      setBreakdown('');
    } catch (error) {
      toast.error('Failed to record cash collection');
    }
  };

  const formatTimestamp = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1_000_000);
    return date.toLocaleString();
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todaySales = sales.filter((s) => Number(s.timestamp) / 1_000_000 >= today.getTime());
  const todayRevenue = todaySales.reduce((sum, s) => sum + s.total, 0);
  const todayCollections = collections.filter((c) => Number(c.timestamp) / 1_000_000 >= today.getTime());
  const todayCash = todayCollections.reduce((sum, c) => sum + c.amount, 0);
  const discrepancy = todayCash - todayRevenue;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Cash Collection</h1>
        <p className="text-muted-foreground mt-1">Record daily cash collections and reconcile with sales</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Today's Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">₹{todayRevenue.toFixed(2)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Cash Collected</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">₹{todayCash.toFixed(2)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Discrepancy</CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-2xl font-bold ${Math.abs(discrepancy) > 0.1 ? 'text-destructive' : 'text-green-600'}`}>
              {discrepancy > 0 ? '+' : ''}₹{discrepancy.toFixed(2)}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Record Cash Collection</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
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
                <Label htmlFor="breakdown">Denomination Breakdown (Optional)</Label>
                <Textarea
                  id="breakdown"
                  value={breakdown}
                  onChange={(e) => setBreakdown(e.target.value)}
                  placeholder="e.g., 500x10, 200x5, 100x20"
                  rows={3}
                />
              </div>

              <Button type="submit" className="w-full" disabled={recordCashCollection.isPending}>
                {recordCashCollection.isPending ? 'Recording...' : 'Record Collection'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Reconciliation Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 border rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-muted-foreground">Expected (Sales)</span>
                  <span className="font-semibold">₹{todayRevenue.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-muted-foreground">Actual (Cash)</span>
                  <span className="font-semibold">₹{todayCash.toFixed(2)}</span>
                </div>
                <div className="pt-2 border-t">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Difference</span>
                    <Badge variant={Math.abs(discrepancy) > 0.1 ? 'destructive' : 'default'}>
                      {discrepancy > 0 ? '+' : ''}₹{discrepancy.toFixed(2)}
                    </Badge>
                  </div>
                </div>
              </div>

              {Math.abs(discrepancy) > 0.1 && (
                <div className={`p-3 rounded-lg ${discrepancy < 0 ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'}`}>
                  <p className="text-sm font-medium">
                    {discrepancy < 0 ? '⚠️ Cash shortage detected' : 'ℹ️ Cash surplus detected'}
                  </p>
                  <p className="text-xs mt-1">
                    {discrepancy < 0 ? 'Please verify all transactions' : 'Please verify all collections'}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Collection History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date & Time</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Breakdown</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {collections.slice(0, 20).map((collection) => (
                <TableRow key={collection.id.toString()}>
                  <TableCell>{formatTimestamp(collection.timestamp)}</TableCell>
                  <TableCell className="text-right font-semibold">₹{collection.amount.toFixed(2)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{collection.breakdown}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {collections.length === 0 && (
            <p className="text-center text-muted-foreground py-8">No collections recorded yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
