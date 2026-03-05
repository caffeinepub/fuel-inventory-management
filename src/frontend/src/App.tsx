import { Toaster } from "@/components/ui/sonner";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { ThemeProvider } from "next-themes";
import AlertsPanel from "./components/AlertsPanel";
import AnalyticsCharts from "./components/AnalyticsCharts";
import CashCollectionEntry from "./components/CashCollectionEntry";
import Dashboard from "./components/Dashboard";
import DashboardLayout from "./components/DashboardLayout";
import ExpenseLogger from "./components/ExpenseLogger";
import FuelManagement from "./components/FuelManagement";
import FuelTypeAnalytics from "./components/FuelTypeAnalytics";
import LoginButton from "./components/LoginButton";
import PaymentFailure from "./components/PaymentFailure";
import PaymentSuccess from "./components/PaymentSuccess";
import PriceUpdateModule from "./components/PriceUpdateModule";
import ProfileSetup from "./components/ProfileSetup";
import ProfitLossDashboard from "./components/ProfitLossDashboard";
import SalesForm from "./components/SalesForm";
import SalesReports from "./components/SalesReports";
import ShiftManagement from "./components/ShiftManagement";
import ShiftReport from "./components/ShiftReport";
import StaffManagement from "./components/StaffManagement";
import StockReconciliation from "./components/StockReconciliation";
import TankMonitor from "./components/TankMonitor";
import { useAutoSync } from "./hooks/useAutoSync";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import { useGetCallerUserProfile } from "./hooks/useQueries";

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { identity, isInitializing } = useInternetIdentity();
  const {
    data: userProfile,
    isLoading: profileLoading,
    isFetched,
  } = useGetCallerUserProfile();

  useAutoSync();

  if (isInitializing || profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-950 to-purple-950">
        <div className="text-center space-y-5">
          <div className="w-16 h-16 mx-auto relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-400/20 border-t-orange-400 absolute inset-0" />
            <div className="w-8 h-8 rounded-full bg-orange-500/20 absolute inset-0 m-auto flex items-center justify-center">
              <span className="text-orange-300 text-lg">⛽</span>
            </div>
          </div>
          <p className="text-white/60 text-sm font-medium tracking-wide">
            Loading your dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (!identity) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-900">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-orange-500/10 blur-3xl" />
          <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-purple-500/10 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-indigo-600/5 blur-3xl" />
        </div>
        <div className="relative z-10 text-center space-y-8 max-w-md px-4">
          {/* Logo Badge */}
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-2xl bg-orange-500/20 ring-2 ring-orange-400/30 flex items-center justify-center shadow-2xl">
              <span className="text-4xl">⛽</span>
            </div>
          </div>
          <div className="rounded-2xl bg-white/8 backdrop-blur border border-white/10 p-8 shadow-2xl space-y-6">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-white leading-tight">
                Fuel Station
                <span className="block text-orange-400">Management</span>
              </h1>
              <p className="text-white/55 text-sm leading-relaxed">
                Real-time monitoring, sales tracking, and complete fuel station
                operations in one place.
              </p>
            </div>
            <div className="flex flex-col gap-3 text-left text-sm text-white/50">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-400 shrink-0" />
                Tank levels & alerts
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-400 shrink-0" />
                Sales & billing management
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400 shrink-0" />
                Shift & staff tracking
              </div>
            </div>
            <LoginButton />
          </div>
          <p className="text-white/25 text-xs">
            Secure login powered by Internet Identity
          </p>
        </div>
      </div>
    );
  }

  const showProfileSetup =
    !!identity && !profileLoading && isFetched && userProfile === null;

  if (showProfileSetup) {
    return <ProfileSetup />;
  }

  return <>{children}</>;
}

const rootRoute = createRootRoute({
  component: () => (
    <AuthGuard>
      <DashboardLayout>
        <Outlet />
      </DashboardLayout>
    </AuthGuard>
  ),
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: Dashboard,
});

const tanksRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/tanks",
  component: TankMonitor,
});

const alertsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/alerts",
  component: AlertsPanel,
});

const stockRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/stock",
  component: StockReconciliation,
});

const salesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/sales",
  component: SalesForm,
});

const staffRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/staff",
  component: StaffManagement,
});

const shiftsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/shifts",
  component: ShiftManagement,
});

const shiftReportRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/shift-report",
  component: ShiftReport,
});

const fuelManagementRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/fuel-management",
  component: FuelManagement,
});

const cashRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/cash",
  component: CashCollectionEntry,
});

const expensesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/expenses",
  component: ExpenseLogger,
});

const profitLossRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/profit-loss",
  component: ProfitLossDashboard,
});

const reportsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/reports",
  component: SalesReports,
});

const analyticsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/analytics",
  component: FuelTypeAnalytics,
});

const chartsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/charts",
  component: AnalyticsCharts,
});

const pricesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/prices",
  component: PriceUpdateModule,
});

const paymentSuccessRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/payment-success",
  component: PaymentSuccess,
});

const paymentFailureRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/payment-failure",
  component: PaymentFailure,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  tanksRoute,
  alertsRoute,
  stockRoute,
  salesRoute,
  staffRoute,
  shiftsRoute,
  shiftReportRoute,
  fuelManagementRoute,
  cashRoute,
  expensesRoute,
  profitLossRoute,
  reportsRoute,
  analyticsRoute,
  chartsRoute,
  pricesRoute,
  paymentSuccessRoute,
  paymentFailureRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <RouterProvider router={router} />
      <Toaster />
    </ThemeProvider>
  );
}
