import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQueryClient } from "@tanstack/react-query";
import { DollarSign, RefreshCw, TrendingDown, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { useGetSalesAndExpenses } from "../hooks/useQueries";

export default function ProfitLossDashboard() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useGetSalesAndExpenses();
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [sales = [], expenses = []] = data ?? [];

  useEffect(() => {
    const refresh = () => {
      queryClient.invalidateQueries({ queryKey: ["salesAndExpenses"] });
      setLastUpdated(new Date());
    };
    refresh();
    const interval = setInterval(refresh, 30_000);
    return () => clearInterval(interval);
  }, [queryClient]);

  const totalRevenue = sales.reduce((sum, s) => sum + s.total, 0);
  const totalLiters = sales.reduce(
    (sum, s) => sum + (s.endTotalizer - s.openTotalizer),
    0,
  );
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const netProfit = totalRevenue - totalExpenses;
  const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

  const petrolSales = sales.filter((s) => s.fuelType === "petrol");
  const dieselSales = sales.filter((s) => s.fuelType === "diesel");
  const petrolRevenue = petrolSales.reduce((sum, s) => sum + s.total, 0);
  const dieselRevenue = dieselSales.reduce((sum, s) => sum + s.total, 0);

  const expenseCategories = [
    "maintenance",
    "electricity",
    "salaries",
    "supplies",
    "other",
  ];

  if (isLoading) {
    return (
      <div className="space-y-6" data-ocid="pl.loading_state">
        <div className="h-8 w-56 bg-white/10 rounded-lg animate-pulse" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-28 bg-white/5 rounded-2xl animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1
            className="text-2xl sm:text-3xl font-bold page-header-accent"
            style={{ fontFamily: '"Bricolage Grotesque",system-ui' }}
          >
            Profit &amp; Loss
          </h1>
          <p className="text-foreground/50 mt-1 text-sm">
            Financial overview and performance metrics
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
              queryClient.invalidateQueries({ queryKey: ["salesAndExpenses"] });
              setLastUpdated(new Date());
            }}
            className="glass-card p-2.5 text-foreground/50 hover:text-foreground transition-colors"
            data-ocid="pl.refresh.button"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          {
            label: "Total Revenue",
            value: `PKR ${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            sub: `${sales.length} transactions`,
            cardClass: "stat-card-green",
            icon: DollarSign,
            ocid: "pl.revenue.card",
          },
          {
            label: "Total Liters",
            value: `${totalLiters.toFixed(1)} L`,
            sub: "Volume sold",
            cardClass: "stat-card-teal",
            icon: TrendingUp,
            ocid: "pl.liters.card",
          },
          {
            label: "Total Expenses",
            value: `PKR ${totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            sub: `${expenses.length} entries`,
            cardClass: "stat-card-rose",
            icon: TrendingDown,
            ocid: "pl.expenses.card",
          },
          {
            label: netProfit >= 0 ? "Net Profit" : "Net Loss",
            value: `PKR ${Math.abs(netProfit).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            sub: `${profitMargin.toFixed(1)}% margin`,
            cardClass: netProfit >= 0 ? "stat-card-purple" : "stat-card-rose",
            icon: netProfit >= 0 ? TrendingUp : TrendingDown,
            ocid: "pl.profit.card",
          },
        ].map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.ocid}
              data-ocid={card.ocid}
              className={`${card.cardClass} rounded-2xl p-4 sm:p-5 h-full flex flex-col`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <Icon className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="mt-auto">
                <div className="text-lg sm:text-xl font-bold text-white leading-tight tabular-nums">
                  {card.value}
                </div>
                <p className="text-xs sm:text-sm font-semibold text-white/90 mt-1">
                  {card.label}
                </p>
                <p className="text-[11px] text-white/60 mt-0.5 hidden sm:block">
                  {card.sub}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Revenue Breakdown */}
        <Card className="glass-card border-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-foreground text-base">
              Revenue Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-4 rounded-xl bg-[oklch(0.68_0.17_160)]/10 border border-[oklch(0.68_0.17_160)]/20">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-foreground/80 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[oklch(0.68_0.17_160)]" />
                  ⛽ Petrol
                </span>
                <span className="text-lg font-bold text-[oklch(0.68_0.17_160)] tabular-nums">
                  PKR {petrolRevenue.toFixed(2)}
                </span>
              </div>
              <p className="text-xs text-foreground/40">
                {petrolSales.length} transactions
              </p>
            </div>
            <div className="p-4 rounded-xl bg-[oklch(0.65_0.19_240)]/10 border border-[oklch(0.65_0.19_240)]/20">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-foreground/80 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[oklch(0.65_0.19_240)]" />
                  🔵 Diesel
                </span>
                <span className="text-lg font-bold text-[oklch(0.65_0.19_240)] tabular-nums">
                  PKR {dieselRevenue.toFixed(2)}
                </span>
              </div>
              <p className="text-xs text-foreground/40">
                {dieselSales.length} transactions
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Expense Breakdown */}
        <Card className="glass-card border-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-foreground text-base">
              Expense Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {expenseCategories.map((cat) => {
              const catExp = expenses.filter((e) => e.category === cat);
              const total = catExp.reduce((sum, e) => sum + e.amount, 0);
              const pct = totalExpenses > 0 ? (total / totalExpenses) * 100 : 0;
              return (
                <div key={cat}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-foreground/70 capitalize">
                      {cat}
                    </span>
                    <span className="text-foreground/50 tabular-nums">
                      PKR {total.toFixed(2)} ({pct.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full tank-bar-low/30 bg-destructive/50 transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Financial Summary */}
      <Card className="glass-card border-0">
        <CardHeader className="pb-3">
          <CardTitle className="text-foreground text-base">
            Financial Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between items-center p-4 rounded-xl bg-white/5 border border-white/10">
            <span className="font-medium text-foreground/80">
              Gross Revenue
            </span>
            <span className="text-lg font-bold text-foreground tabular-nums">
              PKR {totalRevenue.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between items-center p-4 rounded-xl bg-white/5 border border-white/10">
            <span className="font-medium text-foreground/80">
              Total Operating Expenses
            </span>
            <span className="text-lg font-bold text-destructive tabular-nums">
              −PKR {totalExpenses.toFixed(2)}
            </span>
          </div>
          <div
            className={`flex justify-between items-center p-4 rounded-xl border ${netProfit >= 0 ? "bg-[oklch(0.68_0.17_160)]/10 border-[oklch(0.68_0.17_160)]/25" : "bg-destructive/10 border-destructive/25"}`}
          >
            <span className="font-bold text-foreground">
              Net {netProfit >= 0 ? "Profit" : "Loss"}
            </span>
            <span
              className={`text-2xl font-bold tabular-nums ${netProfit >= 0 ? "text-[oklch(0.68_0.17_160)]" : "text-destructive"}`}
            >
              PKR {Math.abs(netProfit).toFixed(2)}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
