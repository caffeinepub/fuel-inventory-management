import { RouterProvider, createRouter, createRoute, createRootRoute, Outlet } from '@tanstack/react-router';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile } from './hooks/useQueries';
import DashboardLayout from './components/DashboardLayout';
import Dashboard from './components/Dashboard';
import TankMonitor from './components/TankMonitor';
import AlertsPanel from './components/AlertsPanel';
import StockReconciliation from './components/StockReconciliation';
import SalesForm from './components/SalesForm';
import StaffManagement from './components/StaffManagement';
import ShiftManagement from './components/ShiftManagement';
import ShiftReport from './components/ShiftReport';
import CommissionCalculator from './components/CommissionCalculator';
import CashCollectionEntry from './components/CashCollectionEntry';
import ExpenseLogger from './components/ExpenseLogger';
import ProfitLossDashboard from './components/ProfitLossDashboard';
import SalesReports from './components/SalesReports';
import FuelTypeAnalytics from './components/FuelTypeAnalytics';
import AnalyticsCharts from './components/AnalyticsCharts';
import PriceUpdateModule from './components/PriceUpdateModule';
import PaymentSuccess from './components/PaymentSuccess';
import PaymentFailure from './components/PaymentFailure';
import ProfileSetup from './components/ProfileSetup';
import LoginButton from './components/LoginButton';

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { identity, isInitializing } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();

  if (isInitializing || profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!identity) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center space-y-6 max-w-md px-4">
          <h1 className="text-4xl font-bold">Fuel Station Management</h1>
          <p className="text-muted-foreground">Please login to access the dashboard</p>
          <LoginButton />
        </div>
      </div>
    );
  }

  const showProfileSetup = !!identity && !profileLoading && isFetched && userProfile === null;

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
  path: '/',
  component: Dashboard,
});

const tanksRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/tanks',
  component: TankMonitor,
});

const alertsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/alerts',
  component: AlertsPanel,
});

const stockRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/stock',
  component: StockReconciliation,
});

const salesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/sales',
  component: SalesForm,
});

const staffRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/staff',
  component: StaffManagement,
});

const shiftsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/shifts',
  component: ShiftManagement,
});

const shiftReportRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/shift-report',
  component: ShiftReport,
});

const commissionRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/commission',
  component: CommissionCalculator,
});

const cashRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/cash',
  component: CashCollectionEntry,
});

const expensesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/expenses',
  component: ExpenseLogger,
});

const profitLossRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/profit-loss',
  component: ProfitLossDashboard,
});

const reportsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/reports',
  component: SalesReports,
});

const analyticsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/analytics',
  component: FuelTypeAnalytics,
});

const chartsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/charts',
  component: AnalyticsCharts,
});

const pricesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/prices',
  component: PriceUpdateModule,
});

const paymentSuccessRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/payment-success',
  component: PaymentSuccess,
});

const paymentFailureRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/payment-failure',
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
  commissionRoute,
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

declare module '@tanstack/react-router' {
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
