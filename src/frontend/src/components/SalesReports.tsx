import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQueryClient } from "@tanstack/react-query";
import { RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { useGetSales } from "../hooks/useQueries";

export default function SalesReports() {
  const queryClient = useQueryClient();
  const { data: sales = [] } = useGetSales();
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [period, setPeriod] = useState<"daily" | "weekly" | "monthly">("daily");

  useEffect(() => {
    const refresh = () => {
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      setLastUpdated(new Date());
    };
    refresh();
    const interval = setInterval(refresh, 30_000);
    return () => clearInterval(interval);
  }, [queryClient]);

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

  const filterSales = (startDate: Date) =>
    sales.filter((s) => Number(s.timestamp) / 1_000_000 >= startDate.getTime());

  const periodSales =
    period === "daily"
      ? filterSales(today)
      : period === "weekly"
        ? filterSales(weekAgo)
        : filterSales(monthAgo);

  const totalRevenue = periodSales.reduce((sum, s) => sum + s.total, 0);
  const totalLiters = periodSales.reduce(
    (sum, s) => sum + (s.endTotalizer - s.openTotalizer),
    0,
  );
  const petrolSales = periodSales.filter((s) => s.fuelType === "petrol");
  const dieselSales = periodSales.filter((s) => s.fuelType === "diesel");

  const formatTimestamp = (ts: bigint) =>
    new Date(Number(ts) / 1_000_000).toLocaleString();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1
            className="text-2xl sm:text-3xl font-bold page-header-accent"
            style={{ fontFamily: '"Bricolage Grotesque",system-ui' }}
          >
            Sales Reports
          </h1>
          <p className="text-foreground/50 mt-1 text-sm">
            Comprehensive sales analysis
          </p>
        </div>
        <div className="flex items-center gap-2">
          {lastUpdated && (
            <div className="flex items-center gap-1.5 glass-card px-3 py-2 text-xs text-foreground/50">
              <span className="live-dot" />
              <span className="hidden sm:inline">
                Updated {lastUpdated.toLocaleTimeString()}
              </span>
            </div>
          )}
          <button
            type="button"
            onClick={() => {
              queryClient.invalidateQueries({ queryKey: ["sales"] });
              setLastUpdated(new Date());
            }}
            className="glass-card p-2.5 text-foreground/50 hover:text-foreground transition-colors"
            data-ocid="reports.refresh.button"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <Tabs
        value={period}
        onValueChange={(v) => setPeriod(v as "daily" | "weekly" | "monthly")}
      >
        <TabsList
          className="bg-white/10 border border-white/15"
          data-ocid="reports.period.tab"
        >
          <TabsTrigger
            value="daily"
            className="data-[state=active]:bg-primary data-[state=active]:text-white"
          >
            Today
          </TabsTrigger>
          <TabsTrigger
            value="weekly"
            className="data-[state=active]:bg-primary data-[state=active]:text-white"
          >
            7 Days
          </TabsTrigger>
          <TabsTrigger
            value="monthly"
            className="data-[state=active]:bg-primary data-[state=active]:text-white"
          >
            30 Days
          </TabsTrigger>
        </TabsList>

        <TabsContent value={period} className="space-y-5 mt-5">
          {/* Summary cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              {
                label: "Revenue",
                value: `PKR ${totalRevenue.toFixed(2)}`,
                colorClass: "text-[oklch(0.68_0.17_160)]",
              },
              {
                label: "Liters Sold",
                value: `${totalLiters.toFixed(1)} L`,
                colorClass: "text-accent",
              },
              {
                label: "Petrol Txns",
                value: petrolSales.length.toString(),
                colorClass: "text-[oklch(0.68_0.17_160)]",
              },
              {
                label: "Diesel Txns",
                value: dieselSales.length.toString(),
                colorClass: "text-[oklch(0.65_0.19_240)]",
              },
            ].map((s) => (
              <div
                key={s.label}
                className="glass-card rounded-xl p-4 text-center"
              >
                <div
                  className={`text-xl font-bold tabular-nums ${s.colorClass}`}
                >
                  {s.value}
                </div>
                <div className="text-xs text-foreground/50 mt-1 font-medium">
                  {s.label}
                </div>
              </div>
            ))}
          </div>

          {/* Fuel breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card className="glass-card border-0">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-foreground">
                  ⛽ Petrol
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                <div className="text-2xl font-bold text-[oklch(0.68_0.17_160)] tabular-nums">
                  PKR {petrolSales.reduce((s, x) => s + x.total, 0).toFixed(2)}
                </div>
                <p className="text-xs text-foreground/50">
                  {petrolSales
                    .reduce((s, x) => s + (x.endTotalizer - x.openTotalizer), 0)
                    .toFixed(2)}{" "}
                  L &bull; {petrolSales.length} transactions
                </p>
              </CardContent>
            </Card>
            <Card className="glass-card border-0">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-foreground">
                  🔵 Diesel
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                <div className="text-2xl font-bold text-[oklch(0.65_0.19_240)] tabular-nums">
                  PKR {dieselSales.reduce((s, x) => s + x.total, 0).toFixed(2)}
                </div>
                <p className="text-xs text-foreground/50">
                  {dieselSales
                    .reduce((s, x) => s + (x.endTotalizer - x.openTotalizer), 0)
                    .toFixed(2)}{" "}
                  L &bull; {dieselSales.length} transactions
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Transactions table */}
          <Card className="glass-card border-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-foreground">
                Transactions ({periodSales.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {periodSales.length === 0 ? (
                <div
                  className="text-center py-12 text-foreground/40"
                  data-ocid="reports.empty_state"
                >
                  <p className="text-4xl mb-2">📊</p>
                  <p className="text-sm">No sales in this period</p>
                </div>
              ) : (
                <div className="overflow-x-auto" data-ocid="reports.table">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border/20 hover:bg-transparent">
                        <TableHead className="text-foreground/50">
                          Date
                        </TableHead>
                        <TableHead className="text-foreground/50">
                          Fuel
                        </TableHead>
                        <TableHead className="text-right text-foreground/50">
                          Liters
                        </TableHead>
                        <TableHead className="text-right text-foreground/50">
                          Rate
                        </TableHead>
                        <TableHead className="text-right text-foreground/50">
                          Total
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {periodSales
                        .slice()
                        .sort(
                          (a, b) => Number(b.timestamp) - Number(a.timestamp),
                        )
                        .slice(0, 50)
                        .map((sale, i) => {
                          const liters = sale.endTotalizer - sale.openTotalizer;
                          return (
                            <TableRow
                              key={sale.id.toString()}
                              data-ocid={`reports.item.${i + 1}`}
                              className="border-border/15 hover:bg-white/5 transition-colors"
                            >
                              <TableCell className="text-xs text-foreground/70 whitespace-nowrap">
                                {formatTimestamp(sale.timestamp)}
                              </TableCell>
                              <TableCell>
                                <span
                                  className={`text-sm font-medium ${sale.fuelType === "petrol" ? "text-[oklch(0.68_0.17_160)]" : "text-[oklch(0.65_0.19_240)]"}`}
                                >
                                  {sale.fuelType === "petrol" ? "⛽" : "🔵"}{" "}
                                  {sale.fuelType}
                                </span>
                              </TableCell>
                              <TableCell className="text-right text-sm font-medium text-foreground/80 tabular-nums">
                                {liters.toFixed(2)} L
                              </TableCell>
                              <TableCell className="text-right text-sm text-foreground/60 tabular-nums">
                                PKR {sale.rate.toFixed(2)}
                              </TableCell>
                              <TableCell className="text-right font-bold text-primary tabular-nums">
                                PKR {sale.total.toFixed(2)}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
