import { useGetTanks } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import { Link } from '@tanstack/react-router';

export default function AlertsPanel() {
  const { data: tanks = [], isLoading } = useGetTanks();

  const alerts = tanks.filter((tank) => tank.currentVolume < tank.threshold);
  const resolved = tanks.filter((tank) => tank.currentVolume >= tank.threshold);

  if (isLoading) {
    return <div>Loading alerts...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Alerts</h1>
        <p className="text-muted-foreground mt-1">Monitor tank refill alerts and thresholds</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              Active Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            {alerts.length === 0 ? (
              <p className="text-muted-foreground text-sm">No active alerts</p>
            ) : (
              <div className="space-y-3">
                {alerts.map((tank) => {
                  const percentage = (tank.currentVolume / tank.capacity) * 100;
                  return (
                    <div
                      key={tank.id}
                      className="p-3 border border-destructive/50 bg-destructive/5 rounded-lg"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-semibold">{tank.id}</p>
                          <p className="text-sm text-muted-foreground">
                            {tank.fuelType === 'petrol' ? 'Petrol' : 'Diesel'}
                          </p>
                        </div>
                        <Badge variant="destructive">Low</Badge>
                      </div>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Current Level:</span>
                          <span className="font-medium">{tank.currentVolume.toFixed(0)} L ({percentage.toFixed(1)}%)</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Threshold:</span>
                          <span className="font-medium">{tank.threshold.toFixed(0)} L</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Refill Needed:</span>
                          <span className="font-medium text-destructive">
                            {(tank.threshold - tank.currentVolume).toFixed(0)} L
                          </span>
                        </div>
                      </div>
                      <Link to="/tanks">
                        <button className="mt-3 w-full text-sm py-2 px-3 bg-destructive text-destructive-foreground rounded hover:bg-destructive/90 transition-colors">
                          Update Tank Level
                        </button>
                      </Link>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Normal Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            {resolved.length === 0 ? (
              <p className="text-muted-foreground text-sm">No tanks at normal levels</p>
            ) : (
              <div className="space-y-3">
                {resolved.map((tank) => {
                  const percentage = (tank.currentVolume / tank.capacity) * 100;
                  return (
                    <div key={tank.id} className="p-3 border border-border rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-semibold">{tank.id}</p>
                          <p className="text-sm text-muted-foreground">
                            {tank.fuelType === 'petrol' ? 'Petrol' : 'Diesel'}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          OK
                        </Badge>
                      </div>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Current Level:</span>
                          <span className="font-medium">{tank.currentVolume.toFixed(0)} L ({percentage.toFixed(1)}%)</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Threshold:</span>
                          <span className="font-medium">{tank.threshold.toFixed(0)} L</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
