import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useState } from "react";
import { toast } from "sonner";
import {
  useGetSales,
  useGetTanks,
  useUpdateTankLevel,
} from "../hooks/useQueries";

export default function StockReconciliation() {
  const { data: tanks = [] } = useGetTanks();
  const { data: sales = [] } = useGetSales();
  const updateTankLevel = useUpdateTankLevel();

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

  // Per-row volume input state
  const [volumeInputs, setVolumeInputs] = useState<Record<string, string>>({});

  const handleVolumeUpdate = async (tankId: string, defaultVal: number) => {
    const raw = volumeInputs[tankId] ?? String(defaultVal);
    const newVolume = Number.parseFloat(raw);
    if (Number.isNaN(newVolume) || newVolume < 0) {
      toast.error("Please enter a valid volume");
      return;
    }
    try {
      await updateTankLevel.mutateAsync({ id: tankId, volume: newVolume });
      toast.success(`Tank ${tankId} updated to ${newVolume.toFixed(0)} L`);
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to update tank level");
    }
  };

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
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tank ID</TableHead>
                  <TableHead>Fuel Type</TableHead>
                  <TableHead className="text-right">
                    Opening Stock (L)
                  </TableHead>
                  <TableHead className="text-right">Purchases (L)</TableHead>
                  <TableHead className="text-right">Sales (L)</TableHead>
                  <TableHead className="text-right">
                    Calculated Closing (L)
                  </TableHead>
                  <TableHead className="text-right">
                    Actual Closing (L)
                  </TableHead>
                  <TableHead className="text-right">Variance (L)</TableHead>
                  <TableHead className="text-center">
                    Update Volume (L)
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reconciliation.map((row) => {
                  const inputVal =
                    volumeInputs[row.tankId] ?? row.actualClosing.toFixed(2);
                  return (
                    <TableRow key={row.tankId}>
                      <TableCell className="font-medium">
                        {row.tankId}
                      </TableCell>
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
                            variant={
                              row.variance < 0 ? "destructive" : "default"
                            }
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
                      <TableCell>
                        <div
                          className="flex items-center justify-center gap-2"
                          data-ocid={`stock.tank_update.${row.tankId}`}
                        >
                          <Input
                            type="number"
                            min="0"
                            value={inputVal}
                            onChange={(e) =>
                              setVolumeInputs((prev) => ({
                                ...prev,
                                [row.tankId]: e.target.value,
                              }))
                            }
                            className="h-7 text-xs w-24"
                            data-ocid={`stock.tank_input.${row.tankId}`}
                          />
                          <Button
                            type="button"
                            size="sm"
                            onClick={() =>
                              handleVolumeUpdate(row.tankId, row.actualClosing)
                            }
                            disabled={updateTankLevel.isPending}
                            className="h-7 text-xs px-2 font-semibold shrink-0"
                            data-ocid={`stock.tank_update_button.${row.tankId}`}
                          >
                            Update
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

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
                        className={`text-lg font-bold ${
                          row.variance < 0 ? "text-destructive" : "text-primary"
                        }`}
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
