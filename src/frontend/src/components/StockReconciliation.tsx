import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useGetSales, useGetTanks } from "../hooks/useQueries";

export default function StockReconciliation() {
  const { data: tanks = [] } = useGetTanks();
  const { data: sales = [] } = useGetSales();

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todaySales = sales.filter(
    (s) => Number(s.timestamp) / 1_000_000 >= today.getTime(),
  );

  const reconciliation = tanks.map((tank) => {
    const tankSales = todaySales.filter((s) => s.fuelType === tank.fuelType);
    const totalSold = tankSales.reduce((sum, s) => sum + s.quantity, 0);
    const calculatedClosing = tank.currentVolume + totalSold;
    const actualClosing = tank.currentVolume;
    const variance = actualClosing - calculatedClosing;

    return {
      tankId: tank.id,
      fuelType: tank.fuelType,
      openingStock: calculatedClosing,
      purchases: 0,
      sales: totalSold,
      calculatedClosing,
      actualClosing,
      variance,
    };
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Stock Reconciliation</h1>
        <p className="text-muted-foreground mt-1">
          Daily stock comparison and variance analysis
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Today's Reconciliation</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tank ID</TableHead>
                <TableHead>Fuel Type</TableHead>
                <TableHead className="text-right">Opening Stock (L)</TableHead>
                <TableHead className="text-right">Purchases (L)</TableHead>
                <TableHead className="text-right">Sales (L)</TableHead>
                <TableHead className="text-right">
                  Calculated Closing (L)
                </TableHead>
                <TableHead className="text-right">Actual Closing (L)</TableHead>
                <TableHead className="text-right">Variance (L)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reconciliation.map((row) => (
                <TableRow key={row.tankId}>
                  <TableCell className="font-medium">{row.tankId}</TableCell>
                  <TableCell>
                    {row.fuelType === "petrol" ? "Petrol" : "Diesel"}
                  </TableCell>
                  <TableCell className="text-right">
                    {row.openingStock.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right">
                    {row.purchases.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right">
                    {row.sales.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right">
                    {row.calculatedClosing.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right">
                    {row.actualClosing.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right">
                    {Math.abs(row.variance) > 0.1 ? (
                      <Badge
                        variant={row.variance < 0 ? "destructive" : "default"}
                      >
                        {row.variance > 0 ? "+" : ""}
                        {row.variance.toFixed(2)}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">
                        {row.variance.toFixed(2)}
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {reconciliation.length === 0 && (
            <p className="text-center text-muted-foreground py-8">
              No tanks to reconcile
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Variance Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {reconciliation
              .filter((r) => Math.abs(r.variance) > 0.1)
              .map((row) => (
                <div
                  key={row.tankId}
                  className={`p-3 rounded-lg border ${
                    row.variance < 0
                      ? "border-destructive/50 bg-destructive/5"
                      : "border-primary/50 bg-primary/5"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold">{row.tankId}</p>
                      <p className="text-sm text-muted-foreground">
                        {row.fuelType === "petrol" ? "Petrol" : "Diesel"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p
                        className={`text-lg font-bold ${row.variance < 0 ? "text-destructive" : "text-primary"}`}
                      >
                        {row.variance > 0 ? "+" : ""}
                        {row.variance.toFixed(2)} L
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {row.variance < 0 ? "Shortage" : "Surplus"}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            {reconciliation.filter((r) => Math.abs(r.variance) > 0.1).length ===
              0 && (
              <p className="text-center text-muted-foreground py-4">
                No significant variances detected
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
