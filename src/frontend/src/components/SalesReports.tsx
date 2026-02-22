import { useState } from 'react';
import { useGetSales } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function SalesReports() {
  const { data: sales = [] } = useGetSales();
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

  const filterSales = (startDate: Date) => {
    return sales.filter((s) => Number(s.timestamp) / 1_000_000 >= startDate.getTime());
  };

  const periodSales =
    period === 'daily' ? filterSales(today) : period === 'weekly' ? filterSales(weekAgo) : filterSales(monthAgo);

  const totalRevenue = periodSales.reduce((sum, s) => sum + s.total, 0);
  const petrolSales = periodSales.filter((s) => s.fuelType === 'petrol');
  const dieselSales = periodSales.filter((s) => s.fuelType === 'diesel');
  const petrolRevenue = petrolSales.reduce((sum, s) => sum + s.total, 0);
  const dieselRevenue = dieselSales.reduce((sum, s) => sum + s.total, 0);
  const petrolVolume = petrolSales.reduce((sum, s) => sum + s.quantity, 0);
  const dieselVolume = dieselSales.reduce((sum, s) => sum + s.quantity, 0);

  const formatTimestamp = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1_000_000);
    return date.toLocaleString();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Sales Reports</h1>
        <p className="text-muted-foreground mt-1">Comprehensive sales analysis and reporting</p>
      </div>

      <Tabs value={period} onValueChange={(v) => setPeriod(v as any)}>
        <TabsList>
          <TabsTrigger value="daily">Daily</TabsTrigger>
          <TabsTrigger value="weekly">Weekly</TabsTrigger>
          <TabsTrigger value="monthly">Monthly</TabsTrigger>
        </TabsList>

        <TabsContent value={period} className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">₹{totalRevenue.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground mt-1">{periodSales.length} transactions</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Petrol Sales</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">₹{petrolRevenue.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {petrolVolume.toFixed(2)}L ({petrolSales.length} transactions)
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Diesel Sales</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">₹{dieselRevenue.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {dieselVolume.toFixed(2)}L ({dieselSales.length} transactions)
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Fuel Type Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium">Petrol</span>
                    <span className="text-muted-foreground">
                      {totalRevenue > 0 ? ((petrolRevenue / totalRevenue) * 100).toFixed(1) : 0}% of revenue
                    </span>
                  </div>
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 transition-all"
                      style={{ width: `${totalRevenue > 0 ? (petrolRevenue / totalRevenue) * 100 : 0}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium">Diesel</span>
                    <span className="text-muted-foreground">
                      {totalRevenue > 0 ? ((dieselRevenue / totalRevenue) * 100).toFixed(1) : 0}% of revenue
                    </span>
                  </div>
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-600 transition-all"
                      style={{ width: `${totalRevenue > 0 ? (dieselRevenue / totalRevenue) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Fuel Type</TableHead>
                    <TableHead className="text-right">Quantity (L)</TableHead>
                    <TableHead className="text-right">Rate</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {periodSales.slice(0, 10).map((sale) => (
                    <TableRow key={sale.id.toString()}>
                      <TableCell>{formatTimestamp(sale.timestamp)}</TableCell>
                      <TableCell>{sale.fuelType === 'petrol' ? 'Petrol' : 'Diesel'}</TableCell>
                      <TableCell className="text-right">{sale.quantity.toFixed(2)}</TableCell>
                      <TableCell className="text-right">₹{sale.rate.toFixed(2)}</TableCell>
                      <TableCell className="text-right font-semibold">₹{sale.total.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {periodSales.length === 0 && (
                <p className="text-center text-muted-foreground py-8">No sales in this period</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
