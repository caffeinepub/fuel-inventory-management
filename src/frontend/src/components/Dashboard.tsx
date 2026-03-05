import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  Clock,
  DollarSign,
  ExternalLink,
  Fuel,
  Smartphone,
  TrendingUp,
  Zap,
} from "lucide-react";
import { useGetSales, useGetShifts, useGetTanks } from "../hooks/useQueries";

export default function Dashboard() {
  const { data: tanks = [] } = useGetTanks();
  const { data: shifts = [] } = useGetShifts();
  const { data: sales = [] } = useGetSales();

  const activeShift = shifts.find((s) => !s.endTime);
  const alertCount = tanks.filter((t) => t.currentVolume < t.threshold).length;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todaySales = sales.filter(
    (s) => Number(s.timestamp) / 1_000_000 >= today.getTime(),
  );
  const todayRevenue = todaySales.reduce((sum, s) => sum + s.total, 0);

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold page-header-accent">
            Dashboard
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Welcome to your fuel station management system
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground bg-muted/60 px-3 py-1.5 rounded-full w-fit border border-border/60">
          <Zap className="w-3 h-3 text-amber-500 shrink-0" />
          <span>Live monitoring</span>
        </div>
      </div>

      {/* APK Information Banner */}
      <Alert className="border-blue-200 bg-blue-50/60 dark:bg-blue-950/30 dark:border-blue-800/60">
        <Smartphone className="h-4 w-4 text-blue-600 shrink-0" />
        <AlertTitle className="text-blue-800 dark:text-blue-300 font-semibold">
          Mobile App (APK) Generation
        </AlertTitle>
        <AlertDescription className="mt-1.5 text-blue-700 dark:text-blue-400">
          <p className="text-sm">
            To create an Android APK, wrap this web app using{" "}
            <a
              href="https://capacitorjs.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold underline underline-offset-2 inline-flex items-center gap-0.5 hover:text-blue-900"
            >
              Capacitor
              <ExternalLink className="h-3 w-3" />
            </a>{" "}
            or{" "}
            <a
              href="https://cordova.apache.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold underline underline-offset-2 inline-flex items-center gap-0.5 hover:text-blue-900"
            >
              Cordova
              <ExternalLink className="h-3 w-3" />
            </a>
            .
          </p>
        </AlertDescription>
      </Alert>

      {/* Colorful Stat Cards — fixed layout for mobile through desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Active Alerts */}
        <Link to="/alerts" data-ocid="dashboard.alerts.card">
          <div className="stat-card-orange rounded-2xl p-4 sm:p-5 cursor-pointer hover:scale-[1.03] active:scale-[0.98] transition-transform duration-200 shadow-lg group h-full flex flex-col">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="w-10 h-10 sm:w-11 sm:h-11 bg-white/20 group-hover:bg-white/30 transition-colors rounded-xl flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 sm:w-5 sm:h-5 text-white" />
              </div>
              {alertCount > 0 && (
                <span className="bg-white/25 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse leading-tight">
                  ⚠
                </span>
              )}
            </div>
            <div className="mt-auto">
              <div className="text-3xl sm:text-4xl font-bold text-white tabular-nums leading-none">
                {alertCount}
              </div>
              <p className="text-xs sm:text-sm font-semibold text-white/90 mt-1.5 leading-tight">
                Active Alerts
              </p>
              <p className="text-[11px] text-white/60 mt-0.5 leading-tight hidden sm:block">
                Tanks below threshold
              </p>
            </div>
          </div>
        </Link>

        {/* Current Shift */}
        <Link to="/shifts" data-ocid="dashboard.shifts.card">
          <div className="stat-card-teal rounded-2xl p-4 sm:p-5 cursor-pointer hover:scale-[1.03] active:scale-[0.98] transition-transform duration-200 shadow-lg group h-full flex flex-col">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="w-10 h-10 sm:w-11 sm:h-11 bg-white/20 group-hover:bg-white/30 transition-colors rounded-xl flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5 text-white" />
              </div>
              {activeShift && (
                <span className="bg-white/25 text-white text-[10px] font-bold px-2 py-0.5 rounded-full leading-tight">
                  LIVE
                </span>
              )}
            </div>
            <div className="mt-auto">
              <div className="text-3xl sm:text-4xl font-bold text-white leading-none">
                {activeShift ? "On" : "Off"}
              </div>
              <p className="text-xs sm:text-sm font-semibold text-white/90 mt-1.5 leading-tight">
                Current Shift
              </p>
              <p className="text-[11px] text-white/60 mt-0.5 leading-tight hidden sm:block">
                {activeShift ? `Shift #${activeShift.id}` : "No active shift"}
              </p>
            </div>
          </div>
        </Link>

        {/* Today's Sales */}
        <Link to="/reports" data-ocid="dashboard.sales.card">
          <div className="stat-card-green rounded-2xl p-4 sm:p-5 cursor-pointer hover:scale-[1.03] active:scale-[0.98] transition-transform duration-200 shadow-lg group h-full flex flex-col">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="w-10 h-10 sm:w-11 sm:h-11 bg-white/20 group-hover:bg-white/30 transition-colors rounded-xl flex items-center justify-center shrink-0">
                <DollarSign className="w-5 h-5 text-white" />
              </div>
              <div className="w-7 h-7 bg-white/15 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-3.5 h-3.5 text-white" />
              </div>
            </div>
            <div className="mt-auto">
              <div className="text-2xl sm:text-4xl font-bold text-white leading-none tabular-nums">
                ₹
                {todayRevenue >= 1000
                  ? `${(todayRevenue / 1000).toFixed(1)}k`
                  : todayRevenue.toFixed(0)}
              </div>
              <p className="text-xs sm:text-sm font-semibold text-white/90 mt-1.5 leading-tight">
                Today's Sales
              </p>
              <p className="text-[11px] text-white/60 mt-0.5 leading-tight hidden sm:block">
                {todaySales.length} transactions
              </p>
            </div>
          </div>
        </Link>

        {/* Tank Status */}
        <Link to="/tanks" data-ocid="dashboard.tanks.card">
          <div className="stat-card-purple rounded-2xl p-4 sm:p-5 cursor-pointer hover:scale-[1.03] active:scale-[0.98] transition-transform duration-200 shadow-lg group h-full flex flex-col">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="w-10 h-10 sm:w-11 sm:h-11 bg-white/20 group-hover:bg-white/30 transition-colors rounded-xl flex items-center justify-center shrink-0">
                <Fuel className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="mt-auto">
              <div className="text-3xl sm:text-4xl font-bold text-white leading-none tabular-nums">
                {tanks.length}
              </div>
              <p className="text-xs sm:text-sm font-semibold text-white/90 mt-1.5 leading-tight">
                Tank Status
              </p>
              <p className="text-[11px] text-white/60 mt-0.5 leading-tight hidden sm:block">
                {tanks.length === 0
                  ? "No tanks yet"
                  : `${tanks.filter((t) => t.currentVolume >= t.threshold).length} healthy`}
              </p>
            </div>
          </div>
        </Link>
      </div>

      {/* Quick Actions + Tank Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Quick Actions */}
        <Card className="glass-card border-0 shadow-md">
          <CardHeader className="pb-2 pt-4 px-4 sm:px-5">
            <CardTitle className="text-sm sm:text-base font-bold flex items-center gap-2">
              <span className="w-1.5 h-4 rounded-full bg-orange-400 inline-block shrink-0" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 px-4 sm:px-5 pb-4">
            <Link
              to="/sales"
              data-ocid="dashboard.new_sale.link"
              className="flex items-center gap-3 p-3 rounded-xl border border-orange-200/70 dark:border-orange-900/40 hover:bg-orange-50 dark:hover:bg-orange-950/20 hover:border-orange-300 transition-all duration-150 border-l-[3px] border-l-orange-400 group"
            >
              <div className="w-9 h-9 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform text-base">
                ⛽
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-sm leading-tight">
                  Record New Sale
                </p>
                <p className="text-xs text-muted-foreground mt-0.5 truncate">
                  Add a new fuel sale transaction
                </p>
              </div>
            </Link>
            <Link
              to="/cash"
              data-ocid="dashboard.cash.link"
              className="flex items-center gap-3 p-3 rounded-xl border border-green-200/70 dark:border-green-900/40 hover:bg-green-50 dark:hover:bg-green-950/20 hover:border-green-300 transition-all duration-150 border-l-[3px] border-l-green-400 group"
            >
              <div className="w-9 h-9 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform text-base">
                💰
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-sm leading-tight">
                  Cash Collection
                </p>
                <p className="text-xs text-muted-foreground mt-0.5 truncate">
                  Record daily cash collection
                </p>
              </div>
            </Link>
            <Link
              to="/expenses"
              data-ocid="dashboard.expenses.link"
              className="flex items-center gap-3 p-3 rounded-xl border border-purple-200/70 dark:border-purple-900/40 hover:bg-purple-50 dark:hover:bg-purple-950/20 hover:border-purple-300 transition-all duration-150 border-l-[3px] border-l-purple-400 group"
            >
              <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform text-base">
                📋
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-sm leading-tight">
                  Log Expense
                </p>
                <p className="text-xs text-muted-foreground mt-0.5 truncate">
                  Add maintenance or operational expense
                </p>
              </div>
            </Link>
          </CardContent>
        </Card>

        {/* Tank Overview */}
        <Card className="glass-card border-0 shadow-md">
          <CardHeader className="pb-2 pt-4 px-4 sm:px-5">
            <CardTitle className="text-sm sm:text-base font-bold flex items-center gap-2">
              <span className="w-1.5 h-4 rounded-full bg-blue-400 inline-block shrink-0" />
              Tank Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-5 pb-4">
            <div className="space-y-3.5">
              {tanks.slice(0, 4).map((tank) => {
                const percentage = Math.min(
                  (tank.currentVolume / tank.capacity) * 100,
                  100,
                );
                const isLow = tank.currentVolume < tank.threshold;
                const isPetrol = tank.fuelType === "petrol";
                return (
                  <div key={tank.id}>
                    {/* Label row: mobile = stacked, desktop = inline */}
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="text-sm leading-none shrink-0">
                          {isPetrol ? "⛽" : "🔵"}
                        </span>
                        <span className="font-semibold text-xs truncate">
                          {isPetrol ? "Petrol" : "Diesel"} — {tank.id}
                        </span>
                        {isLow && (
                          <span className="text-[9px] font-bold text-red-600 bg-red-100 dark:bg-red-900/30 px-1 py-0.5 rounded-full leading-tight shrink-0">
                            LOW
                          </span>
                        )}
                      </div>
                      <span
                        className={`text-xs font-bold tabular-nums shrink-0 ml-2 ${
                          isLow
                            ? "text-red-500"
                            : isPetrol
                              ? "text-emerald-600"
                              : "text-blue-600"
                        }`}
                      >
                        {percentage.toFixed(0)}%
                      </span>
                    </div>
                    {/* Bar track with inner label on fill when ≥ 30% */}
                    <div className="relative h-4 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden shadow-inner">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ease-out flex items-center justify-end pr-1.5 ${
                          isLow
                            ? "tank-bar-low animate-pulse"
                            : isPetrol
                              ? "tank-bar-petrol"
                              : "tank-bar-diesel"
                        }`}
                        style={{ width: `${percentage}%` }}
                      >
                        {percentage >= 28 && (
                          <span className="text-[9px] font-bold text-white/90 leading-none">
                            {percentage.toFixed(0)}%
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex justify-between text-[10px] text-muted-foreground mt-0.5">
                      <span className="tabular-nums">
                        {tank.currentVolume.toFixed(0)} L
                      </span>
                      <span className="tabular-nums">
                        {tank.capacity.toFixed(0)} L
                      </span>
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
                  <p className="text-sm text-muted-foreground">
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
                  className="block text-xs text-center text-primary font-semibold pt-0.5 hover:underline underline-offset-2"
                >
                  View all tanks →
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
