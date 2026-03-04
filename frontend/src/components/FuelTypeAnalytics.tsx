import { useGetSales } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Fuel } from 'lucide-react';

export default function FuelTypeAnalytics() {
  const { data: sales = [] } = useGetSales();

  const petrolSales = sales.filter((s) => s.fuelType === 'petrol');
  const dieselSales = sales.filter((s) => s.fuelType === 'diesel');

  const petrolVolume = petrolSales.reduce((sum, s) => sum + s.quantity, 0);
  const dieselVolume = dieselSales.reduce((sum, s) => sum + s.quantity, 0);
  const petrolRevenue = petrolSales.reduce((sum, s) => sum + s.total, 0);
  const dieselRevenue = dieselSales.reduce((sum, s) => sum + s.total, 0);

  const totalVolume = petrolVolume + dieselVolume;
  const totalRevenue = petrolRevenue + dieselRevenue;

  const petrolVolumePercent = totalVolume > 0 ? (petrolVolume / totalVolume) * 100 : 0;
  const dieselVolumePercent = totalVolume > 0 ? (dieselVolume / totalVolume) * 100 : 0;
  const petrolRevenuePercent = totalRevenue > 0 ? (petrolRevenue / totalRevenue) * 100 : 0;
  const dieselRevenuePercent = totalRevenue > 0 ? (dieselRevenue / totalRevenue) * 100 : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Fuel Type Analytics</h1>
        <p className="text-muted-foreground mt-1">Comparative analysis of Petrol vs Diesel performance</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Fuel className="w-5 h-5 text-blue-600" />
              Petrol Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Total Volume Sold</p>
              <p className="text-3xl font-bold text-blue-600">{petrolVolume.toFixed(2)} L</p>
              <p className="text-xs text-muted-foreground mt-1">
                {petrolVolumePercent.toFixed(1)}% of total volume
              </p>
            </div>

            <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Total Revenue</p>
              <p className="text-3xl font-bold text-blue-600">₹{petrolRevenue.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {petrolRevenuePercent.toFixed(1)}% of total revenue
              </p>
            </div>

            <div className="p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Number of Transactions</p>
              <p className="text-2xl font-bold">{petrolSales.length}</p>
            </div>

            <div className="p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Average Sale</p>
              <p className="text-2xl font-bold">
                {petrolSales.length > 0 ? (petrolRevenue / petrolSales.length).toFixed(2) : '0.00'} ₹
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Fuel className="w-5 h-5 text-green-600" />
              Diesel Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Total Volume Sold</p>
              <p className="text-3xl font-bold text-green-600">{dieselVolume.toFixed(2)} L</p>
              <p className="text-xs text-muted-foreground mt-1">
                {dieselVolumePercent.toFixed(1)}% of total volume
              </p>
            </div>

            <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Total Revenue</p>
              <p className="text-3xl font-bold text-green-600">₹{dieselRevenue.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {dieselRevenuePercent.toFixed(1)}% of total revenue
              </p>
            </div>

            <div className="p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Number of Transactions</p>
              <p className="text-2xl font-bold">{dieselSales.length}</p>
            </div>

            <div className="p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Average Sale</p>
              <p className="text-2xl font-bold">
                {dieselSales.length > 0 ? (dieselRevenue / dieselSales.length).toFixed(2) : '0.00'} ₹
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Comparative Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <p className="text-sm font-semibold mb-3">Volume Distribution</p>
              <div className="flex h-8 rounded-lg overflow-hidden">
                <div
                  className="bg-blue-600 flex items-center justify-center text-white text-sm font-medium"
                  style={{ width: `${petrolVolumePercent}%` }}
                >
                  {petrolVolumePercent > 10 && `${petrolVolumePercent.toFixed(0)}%`}
                </div>
                <div
                  className="bg-green-600 flex items-center justify-center text-white text-sm font-medium"
                  style={{ width: `${dieselVolumePercent}%` }}
                >
                  {dieselVolumePercent > 10 && `${dieselVolumePercent.toFixed(0)}%`}
                </div>
              </div>
              <div className="flex justify-between mt-2 text-sm">
                <span className="text-blue-600 font-medium">Petrol: {petrolVolume.toFixed(0)}L</span>
                <span className="text-green-600 font-medium">Diesel: {dieselVolume.toFixed(0)}L</span>
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold mb-3">Revenue Distribution</p>
              <div className="flex h-8 rounded-lg overflow-hidden">
                <div
                  className="bg-blue-600 flex items-center justify-center text-white text-sm font-medium"
                  style={{ width: `${petrolRevenuePercent}%` }}
                >
                  {petrolRevenuePercent > 10 && `${petrolRevenuePercent.toFixed(0)}%`}
                </div>
                <div
                  className="bg-green-600 flex items-center justify-center text-white text-sm font-medium"
                  style={{ width: `${dieselRevenuePercent}%` }}
                >
                  {dieselRevenuePercent > 10 && `${dieselRevenuePercent.toFixed(0)}%`}
                </div>
              </div>
              <div className="flex justify-between mt-2 text-sm">
                <span className="text-blue-600 font-medium">Petrol: ₹{petrolRevenue.toFixed(0)}</span>
                <span className="text-green-600 font-medium">Diesel: ₹{dieselRevenue.toFixed(0)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
