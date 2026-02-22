import { useGetTanks, useGetShifts, useGetSales } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Fuel, AlertTriangle, DollarSign, Clock } from 'lucide-react';
import { Link } from '@tanstack/react-router';

export default function Dashboard() {
  const { data: tanks = [] } = useGetTanks();
  const { data: shifts = [] } = useGetShifts();
  const { data: sales = [] } = useGetSales();

  const activeShift = shifts.find((s) => !s.endTime);
  const alertCount = tanks.filter((t) => t.currentVolume < t.threshold).length;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todaySales = sales.filter((s) => Number(s.timestamp) / 1_000_000 >= today.getTime());
  const todayRevenue = todaySales.reduce((sum, s) => sum + s.total, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome to your fuel station management system</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link to="/alerts">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
              <AlertTriangle className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{alertCount}</div>
              <p className="text-xs text-muted-foreground mt-1">Tanks below threshold</p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/shifts">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Current Shift</CardTitle>
              <Clock className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeShift ? 'Active' : 'None'}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {activeShift ? `Shift #${activeShift.id}` : 'No active shift'}
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/reports">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Today's Sales</CardTitle>
              <DollarSign className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{todayRevenue.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground mt-1">{todaySales.length} transactions</p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/tanks">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Tank Status</CardTitle>
              <Fuel className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{tanks.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Total tanks</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link
              to="/sales"
              className="block p-3 rounded-lg border border-border hover:bg-accent transition-colors"
            >
              <p className="font-medium">Record New Sale</p>
              <p className="text-sm text-muted-foreground">Add a new fuel sale transaction</p>
            </Link>
            <Link
              to="/cash"
              className="block p-3 rounded-lg border border-border hover:bg-accent transition-colors"
            >
              <p className="font-medium">Cash Collection</p>
              <p className="text-sm text-muted-foreground">Record daily cash collection</p>
            </Link>
            <Link
              to="/expenses"
              className="block p-3 rounded-lg border border-border hover:bg-accent transition-colors"
            >
              <p className="font-medium">Log Expense</p>
              <p className="text-sm text-muted-foreground">Add maintenance or operational expense</p>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tank Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {tanks.slice(0, 3).map((tank) => {
                const percentage = (tank.currentVolume / tank.capacity) * 100;
                const isLow = tank.currentVolume < tank.threshold;
                return (
                  <div key={tank.id}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium">
                        {tank.fuelType === 'petrol' ? 'Petrol' : 'Diesel'} - {tank.id}
                      </span>
                      <span className={isLow ? 'text-destructive' : 'text-muted-foreground'}>
                        {percentage.toFixed(0)}%
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          isLow ? 'bg-destructive' : 'bg-primary'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
              {tanks.length === 0 && (
                <p className="text-sm text-muted-foreground">No tanks configured yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
