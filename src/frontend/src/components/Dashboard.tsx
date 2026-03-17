import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  Clock,
  DollarSign,
  Droplets,
  Fuel,
  RefreshCw,
  Timer,
  TrendingDown,
  TrendingUp,
  Zap,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  useGetExpenses,
  useGetSales,
  useGetShifts,
  useGetTanks,
} from "../hooks/useQueries";

function useLiveClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return time;
}

function fmt(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return n.toFixed(2);
}

const REFRESH_OPTIONS = [
  { label: "Off", value: 0 },
  { label: "15s", value: 15_000 },
  { label: "30s", value: 30_000 },
  { label: "1m", value: 60_000 },
  { label: "5m", value: 300_000 },
  { label: "10m", value: 600_000 },
];

export default function Dashboard() {
  const queryClient = useQueryClient();
  const clock = useLiveClock();
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [refreshInterval, setRefreshInterval] = useState(30_000);
  const [showIntervalMenu, setShowIntervalMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const { data: tanks = [], isLoading: tanksLoading } = useGetTanks();
  const { data: sales = [], isLoading: salesLoading } = useGetSales();
  const { data: expenses = [], isLoading: expensesLoading } = useGetExpenses();
  const { data: shifts = [] } = useGetShifts();

  const isLoading = tanksLoading || salesLoading || expensesLoading;

  const doRefresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["tanks"] });
    queryClient.invalidateQueries({ queryKey: ["sales"] });
    queryClient.invalidateQueries({ queryKey: ["expenses"] });
    queryClient.invalidateQueries({ queryKey: ["shifts"] });
    setLastUpdated(new Date());
  }, [queryClient]);

  // Auto-refresh with configurable interval
  useEffect(() => {
    doRefresh();
    if (!refreshInterval) return;
    const interval = setInterval(doRefresh, refreshInterval);
    return () => clearInterval(interval);
  }, [doRefresh, refreshInterval]);

  // Close dropdown on outside click
  useEffect(() => {
    if (!showIntervalMenu) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowIntervalMenu(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showIntervalMenu]);

  // Core KPI calculations
  const totalRevenue = sales.reduce((sum, s) => sum + s.total, 0);
  const totalLiters = sales.reduce(
    (sum, s) => sum + (s.endTotalizer - s.openTotalizer),
    0,
  );
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const netProfit = totalRevenue - totalExpenses;

  const activeShift = shifts.find((s) => !s.endTime);
  const alertCount = tanks.filter((t) => t.currentVolume < t.threshold).length;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todaySales = sales.filter(
    (s) => Number(s.timestamp) / 1_000_000 >= today.getTime(),
  );
  const todayRevenue = todaySales.reduce((sum, s) => sum + s.total, 0);

  const selectedOption =
    REFRESH_OPTIONS.find((o) => o.value === refreshInterval) ??
    REFRESH_OPTIONS[2];

  const statCards = [
    {
      label: "Total Revenue",
      value: `PKR ${fmt(totalRevenue)}`,
      sub: `${sales.length} transactions`,
      icon: DollarSign,
      cardClass: "stat-card-green",
      link: "/reports",
      ocid: "dashboard.revenue.card",
    },
    {
      label: "Total Liters Sold",
      value: `${fmt(totalLiters)} L`,
      sub: "All time",
      icon: Droplets,
      cardClass: "stat-card-teal",
      link: "/reports",
      ocid: "dashboard.liters.card",
    },
    {
      label: "Total Expenses",
      value: `PKR ${fmt(totalExpenses)}`,
      sub: `${expenses.length} entries`,
      icon: TrendingDown,
      cardClass: "stat-card-rose",
      link: "/expenses",
      ocid: "dashboard.expenses.card",
    },
    {
      label: "Net Profit",
      value: `PKR ${fmt(Math.abs(netProfit))}`,
      sub: netProfit >= 0 ? "Profit" : "Loss",
      icon: netProfit >= 0 ? TrendingUp : TrendingDown,
      cardClass: netProfit >= 0 ? "stat-card-purple" : "stat-card-rose",
      link: "/profit-loss",
      ocid: "dashboard.profit.card",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header with live clock */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1
            className="text-2xl sm:text-3xl font-bold page-header-accent"
            style={{ fontFamily: '"Bricolage Grotesque",system-ui' }}
          >
            Dashboard
          </h1>
          <p className="text-foreground/50 mt-1 text-sm">
            Real-time fuel station overview
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {/* Live clock */}
          <div className="flex items-center gap-2 glass-card px-3 py-2 text-sm font-mono text-foreground/80">
            <Clock className="w-3.5 h-3.5 text-primary shrink-0" />
            <span>{clock.toLocaleTimeString()}</span>
          </div>
          {/* Live indicator */}
          <div className="flex items-center gap-2 glass-card px-3 py-2">
            <span className="live-dot" />
            <span className="text-xs text-foreground/60 font-medium">Live</span>
            {lastUpdated && (
              <span className="text-[10px] text-foreground/40 ml-1 hidden sm:inline">
                {lastUpdated.toLocaleTimeString()}
              </span>
            )}
          </div>

          {/* Auto-refresh interval selector */}
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setShowIntervalMenu((v) => !v)}
              className="flex items-center gap-1.5 glass-card px-3 py-2 text-xs text-foreground/60 hover:text-foreground transition-colors"
              title="Auto-refresh interval"
              data-ocid="dashboard.refresh_interval.toggle"
            >
              <Timer className="w-3.5 h-3.5 shrink-0" />
              <span className="font-medium">{selectedOption.label}</span>
              <svg
                aria-hidden="true"
                className="w-3 h-3 opacity-50"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {showIntervalMenu && (
              <div className="absolute right-0 top-full mt-1.5 z-50 glass-card rounded-xl overflow-hidden min-w-[110px] border border-white/10 shadow-xl">
                <div className="px-3 py-2 border-b border-white/10">
                  <p className="text-[10px] font-semibold text-foreground/40 uppercase tracking-wider">
                    Auto Refresh
                  </p>
                </div>
                {REFRESH_OPTIONS.map((opt, idx) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      setRefreshInterval(opt.value);
                      setShowIntervalMenu(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs font-medium transition-colors hover:bg-white/10 flex items-center justify-between gap-2 ${
                      opt.value === refreshInterval
                        ? "text-primary bg-primary/10"
                        : "text-foreground/70"
                    }`}
                    data-ocid={`dashboard.refresh_interval.item.${idx + 1}`}
                  >
                    <span>{opt.label}</span>
                    {opt.value === refreshInterval && (
                      <svg
                        aria-hidden="true"
                        className="w-3 h-3 text-primary"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Manual refresh button */}
          <button
            type="button"
            onClick={doRefresh}
            className="glass-card p-2 text-foreground/50 hover:text-foreground transition-colors"
            title="Refresh data now"
            data-ocid="dashboard.refresh.button"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Alerts banner */}
      {alertCount > 0 && (
        <Link to="/alerts" data-ocid="dashboard.alerts.link">
          <div className="flex items-center gap-3 p-4 rounded-xl bg-destructive/15 border border-destructive/30 hover:bg-destructive/20 transition-colors cursor-pointer">
            <AlertTriangle className="w-5 h-5 text-destructive shrink-0 animate-pulse" />
            <p className="text-sm font-medium text-destructive">
              {alertCount} tank{alertCount > 1 ? "s" : ""} below threshold —
              immediate refill required
            </p>
          </div>
        </Link>
      )}

      {/* Stat cards grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link key={card.ocid} to={card.link as any} data-ocid={card.ocid}>
              <div
                className={`${card.cardClass} rounded-2xl p-4 sm:p-5 cursor-pointer hover:scale-[1.03] active:scale-[0.98] transition-transform duration-200 h-full flex flex-col`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  {isLoading && <Skeleton className="w-6 h-3 bg-white/20" />}
                </div>
                <div className="mt-auto">
                  <div className="text-xl sm:text-2xl font-bold text-white leading-tight tabular-nums">
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
            </Link>
          );
        })}
      </div>

      {/* Today summary + active shift */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="glass-card p-4 rounded-xl text-center">
          <div className="text-2xl font-bold text-primary tabular-nums">
            PKR {fmt(todayRevenue)}
          </div>
          <div className="text-xs text-foreground/55 mt-1 font-medium">
            Today's Revenue
          </div>
        </div>
        <div className="glass-card p-4 rounded-xl text-center">
          <div className="text-2xl font-bold text-accent tabular-nums">
            {todaySales.length}
          </div>
          <div className="text-xs text-foreground/55 mt-1 font-medium">
            Today's Sales
          </div>
        </div>
        <div className="glass-card p-4 rounded-xl text-center">
          <div
            className="text-2xl font-bold tabular-nums"
            style={{
              color: activeShift
                ? "oklch(0.68 0.17 160)"
                : "oklch(0.58 0.04 260)",
            }}
          >
            {activeShift ? "Active" : "Idle"}
          </div>
          <div className="text-xs text-foreground/55 mt-1 font-medium">
            Shift Status
          </div>
        </div>
        <div className="glass-card p-4 rounded-xl text-center">
          <div
            className={`text-2xl font-bold tabular-nums ${alertCount > 0 ? "text-destructive" : "text-foreground/70"}`}
          >
            {alertCount}
          </div>
          <div className="text-xs text-foreground/55 mt-1 font-medium">
            Tank Alerts
          </div>
        </div>
      </div>

      {/* Quick Actions + Tank Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
        {/* Quick Actions */}
        <Card className="glass-card border-0">
          <CardHeader className="pb-2 pt-4 px-5">
            <CardTitle className="text-sm font-bold flex items-center gap-2 text-foreground">
              <Zap className="w-4 h-4 text-primary" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 px-5 pb-5">
            {[
              {
                to: "/sales",
                icon: "⛽",
                label: "Record New Sale",
                desc: "Add a fuel sale transaction",
                border:
                  "border-primary/30 hover:border-primary/60 hover:bg-primary/10",
                ocid: "dashboard.new_sale.link",
              },
              {
                to: "/cash",
                icon: "💰",
                label: "Cash Collection",
                desc: "Record daily cash",
                border:
                  "border-accent/30 hover:border-accent/60 hover:bg-accent/10",
                ocid: "dashboard.cash.link",
              },
              {
                to: "/expenses",
                icon: "📋",
                label: "Log Expense",
                desc: "Add operational expense",
                border:
                  "border-[oklch(0.55_0.20_290)]/30 hover:border-[oklch(0.55_0.20_290)]/60 hover:bg-[oklch(0.55_0.20_290)]/10",
                ocid: "dashboard.expenses.link",
              },
              {
                to: "/shifts",
                icon: "🕐",
                label: "Manage Shifts",
                desc: "Start or end a shift",
                border:
                  "border-[oklch(0.68_0.17_160)]/30 hover:border-[oklch(0.68_0.17_160)]/60 hover:bg-[oklch(0.68_0.17_160)]/10",
                ocid: "dashboard.shifts.link",
              },
            ].map((item) => (
              <Link
                key={item.ocid}
                to={item.to as any}
                data-ocid={item.ocid}
                className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-150 ${item.border}`}
              >
                <div className="w-9 h-9 rounded-xl glass-card flex items-center justify-center shrink-0 text-base">
                  {item.icon}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-sm text-foreground">
                    {item.label}
                  </p>
                  <p className="text-xs text-foreground/50 mt-0.5">
                    {item.desc}
                  </p>
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>

        {/* Tank Overview */}
        <Card className="glass-card border-0">
          <CardHeader className="pb-2 pt-4 px-5">
            <CardTitle className="text-sm font-bold flex items-center gap-2 text-foreground">
              <Fuel className="w-4 h-4 text-accent" />
              Tank Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <div className="space-y-4">
              {tanks.slice(0, 4).map((tank) => {
                const pct = Math.min(
                  (tank.currentVolume / tank.capacity) * 100,
                  100,
                );
                const isLow = tank.currentVolume < tank.threshold;
                const isWarn = !isLow && pct < 60;
                const isPetrol = tank.fuelType === "petrol";
                const barClass = isLow
                  ? "tank-bar-low animate-pulse"
                  : isWarn
                    ? "tank-bar-warning"
                    : isPetrol
                      ? "tank-bar-petrol"
                      : "tank-bar-diesel";
                const pctColor = isLow
                  ? "text-destructive"
                  : isWarn
                    ? "text-yellow-400"
                    : isPetrol
                      ? "text-[oklch(0.68_0.17_160)]"
                      : "text-[oklch(0.65_0.19_240)]";
                return (
                  <div key={tank.id}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="text-sm shrink-0">
                          {isPetrol ? "⛽" : "🔵"}
                        </span>
                        <span className="font-semibold text-xs text-foreground/80 truncate">
                          {tank.id}
                        </span>
                        {isLow && (
                          <span className="text-[9px] font-bold text-destructive bg-destructive/15 px-1 py-0.5 rounded-full shrink-0">
                            LOW
                          </span>
                        )}
                      </div>
                      <span
                        className={`text-xs font-bold tabular-nums shrink-0 ml-2 ${pctColor}`}
                      >
                        {pct.toFixed(0)}%
                      </span>
                    </div>
                    <div className="relative h-4 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ease-out ${barClass}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-foreground/40 mt-0.5 tabular-nums">
                      <span>{tank.currentVolume.toFixed(0)} L</span>
                      <span>{tank.capacity.toFixed(0)} L</span>
                    </div>
                  </div>
                );
              })}
              {tanks.length === 0 && (
                <div
                  className="text-center py-8"
                  data-ocid="dashboard.tanks.empty_state"
                >
                  <div className="text-4xl mb-2">⛽</div>
                  <p className="text-sm text-foreground/50">
                    No tanks configured yet
                  </p>
                  <Link
                    to="/tanks"
                    className="text-xs text-primary font-semibold underline underline-offset-2 mt-1.5 inline-block"
                  >
                    Add your first tank →
                  </Link>
                </div>
              )}
              {tanks.length > 0 && (
                <Link
                  to="/tanks"
                  data-ocid="dashboard.tanks.link"
                  className="block text-xs text-center text-primary font-semibold pt-1 hover:underline underline-offset-2"
                >
                  View all tanks →
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <footer className="text-center text-xs text-foreground/25 pt-4 pb-2">
        © {new Date().getFullYear()}. Built with love using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2 hover:text-foreground/50 transition-colors"
        >
          caffeine.ai
        </a>
      </footer>
    </div>
  );
}
