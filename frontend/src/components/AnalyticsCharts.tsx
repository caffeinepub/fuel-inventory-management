import { useGetSales } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function AnalyticsCharts() {
  const { data: sales = [] } = useGetSales();

  // Prepare data for line chart (sales over time)
  const salesByDate = sales.reduce((acc, sale) => {
    const date = new Date(Number(sale.timestamp) / 1_000_000);
    const dateKey = date.toLocaleDateString();
    
    if (!acc[dateKey]) {
      acc[dateKey] = { date: dateKey, revenue: 0, count: 0 };
    }
    acc[dateKey].revenue += sale.total;
    acc[dateKey].count += 1;
    return acc;
  }, {} as Record<string, { date: string; revenue: number; count: number }>);

  const lineChartData = Object.values(salesByDate).slice(-30);

  // Prepare data for bar chart (fuel type comparison)
  const petrolSales = sales.filter((s) => s.fuelType === 'petrol');
  const dieselSales = sales.filter((s) => s.fuelType === 'diesel');

  const barChartData = [
    {
      name: 'Petrol',
      volume: petrolSales.reduce((sum, s) => sum + s.quantity, 0),
      revenue: petrolSales.reduce((sum, s) => sum + s.total, 0),
      transactions: petrolSales.length,
    },
    {
      name: 'Diesel',
      volume: dieselSales.reduce((sum, s) => sum + s.quantity, 0),
      revenue: dieselSales.reduce((sum, s) => sum + s.total, 0),
      transactions: dieselSales.length,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Analytics Charts</h1>
        <p className="text-muted-foreground mt-1">Visual representation of sales trends and patterns</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sales Trend Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={lineChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#3b82f6" name="Revenue (₹)" strokeWidth={2} />
              <Line type="monotone" dataKey="count" stroke="#10b981" name="Transactions" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Fuel Type Revenue Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="revenue" fill="#3b82f6" name="Revenue (₹)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Fuel Type Volume Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="volume" fill="#10b981" name="Volume (L)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transaction Count by Fuel Type</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="transactions" fill="#f59e0b" name="Transactions" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
