import { Toaster } from "@/components/ui/sonner";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
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
  const { data: userProfile, isFetched } = useGetCallerUserProfile();

  useAutoSync();

  if (isInitializing) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center space-y-5">
          <div className="w-16 h-16 mx-auto relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary/20 border-t-primary absolute inset-0" />
            <div className="w-8 h-8 rounded-xl bg-primary/20 absolute inset-0 m-auto flex items-center justify-center">
              <span className="text-xl">⛽</span>
            </div>
          </div>
          <p className="text-foreground/50 text-sm font-medium tracking-wide">
            Starting up...
          </p>
        </div>
      </div>
    );
  }

  if (!identity) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background relative overflow-hidden">
        {/* Animated gradient blobs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div
            className="animate-blob-1 absolute -top-48 -left-48 w-[500px] h-[500px] rounded-full blur-[80px] opacity-30"
            style={{ background: "oklch(0.55 0.18 45)" }}
          />
          <div
            className="animate-blob-2 absolute -bottom-48 -right-48 w-[600px] h-[600px] rounded-full blur-[100px] opacity-20"
            style={{ background: "oklch(0.55 0.20 290)" }}
          />
          <div
            className="animate-blob-3 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full blur-[120px] opacity-15"
            style={{ background: "oklch(0.55 0.15 185)" }}
          />
        </div>

        <div className="relative z-10 w-full max-w-sm px-5">
          {/* Fuel icon */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div
                className="absolute inset-0 rounded-2xl blur-xl opacity-60"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.65 0.20 45), oklch(0.55 0.18 35))",
                }}
              />
              <div
                className="relative w-20 h-20 rounded-2xl flex items-center justify-center"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.65 0.20 45), oklch(0.55 0.18 35))",
                  boxShadow: "0 0 40px oklch(0.65 0.20 45 / 0.4)",
                }}
              >
                <span className="text-4xl">⛽</span>
              </div>
            </div>
          </div>

          {/* Main card */}
          <div
            className="glass-card-bright p-8 space-y-6"
            style={{
              boxShadow:
                "0 24px 64px oklch(0 0 0 / 0.5), 0 0 0 1px oklch(0.28 0.06 260 / 0.3)",
            }}
            data-ocid="auth.card"
          >
            <div className="text-center space-y-1.5">
              <h1
                className="text-3xl font-extrabold leading-tight"
                style={{ fontFamily: '"Bricolage Grotesque",system-ui' }}
              >
                Fuel Station
              </h1>
              <p
                className="text-2xl font-bold gradient-text"
                style={{ fontFamily: '"Bricolage Grotesque",system-ui' }}
              >
                Management System
              </p>
              <p className="text-foreground/50 text-sm leading-relaxed pt-1">
                Real-time monitoring, sales tracking, and complete operations.
              </p>
            </div>

            {/* Feature list */}
            <div className="space-y-2.5">
              {[
                {
                  color: "oklch(0.65 0.20 45)",
                  label: "Tank levels & real-time alerts",
                },
                {
                  color: "oklch(0.65 0.15 185)",
                  label: "Sales & billing management",
                },
                {
                  color: "oklch(0.60 0.18 145)",
                  label: "Shift & staff tracking",
                },
                {
                  color: "oklch(0.60 0.18 240)",
                  label: "Analytics & profit reports",
                },
              ].map(({ color, label }) => (
                <div key={label} className="flex items-center gap-2.5">
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ background: color, boxShadow: `0 0 6px ${color}` }}
                  />
                  <span className="text-sm text-foreground/60">{label}</span>
                </div>
              ))}
            </div>

            <LoginButton />
          </div>

          <p className="text-center text-foreground/25 text-xs mt-5">
            Secure login powered by Internet Identity
          </p>

          {/* Footer */}
          <p className="text-center text-foreground/20 text-xs mt-3">
            &copy; {new Date().getFullYear()}. Built with{" "}
            <span style={{ color: "oklch(0.62 0.22 15 / 0.7)" }}>♥</span> using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground/40 transition-colors"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>
    );
  }

  if (isFetched && userProfile === null) {
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
    <>
      <RouterProvider router={router} />
      <Toaster theme="dark" />
    </>
  );
}
