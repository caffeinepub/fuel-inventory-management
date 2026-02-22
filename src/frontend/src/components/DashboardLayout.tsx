import { Link, useLocation } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile, useIsCallerAdmin } from '../hooks/useQueries';
import { useQueryClient } from '@tanstack/react-query';
import {
  LayoutDashboard,
  Fuel,
  AlertTriangle,
  Package,
  ShoppingCart,
  Users,
  Clock,
  FileText,
  DollarSign,
  Receipt,
  TrendingUp,
  BarChart3,
  PieChart,
  Settings,
  LogOut,
} from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { clear, identity } = useInternetIdentity();
  const { data: userProfile } = useGetCallerUserProfile();
  const { data: isAdmin } = useIsCallerAdmin();
  const queryClient = useQueryClient();
  const location = useLocation();

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
  };

  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/tanks', label: 'Tank Monitor', icon: Fuel },
    { path: '/alerts', label: 'Alerts', icon: AlertTriangle },
    { path: '/stock', label: 'Stock Reconciliation', icon: Package },
    { path: '/sales', label: 'New Sale', icon: ShoppingCart },
    { path: '/shifts', label: 'Shifts', icon: Clock },
    { path: '/shift-report', label: 'Shift Reports', icon: FileText },
    { path: '/cash', label: 'Cash Collection', icon: DollarSign },
    { path: '/expenses', label: 'Expenses', icon: Receipt },
    { path: '/profit-loss', label: 'Profit & Loss', icon: TrendingUp },
    { path: '/reports', label: 'Sales Reports', icon: BarChart3 },
    { path: '/analytics', label: 'Fuel Analytics', icon: PieChart },
    { path: '/charts', label: 'Charts', icon: BarChart3 },
  ];

  const adminItems = [
    { path: '/staff', label: 'Staff Management', icon: Users },
    { path: '/commission', label: 'Commission', icon: DollarSign },
    { path: '/prices', label: 'Price Updates', icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r border-border flex flex-col">
        <div className="p-6 border-b border-border">
          <h1 className="text-xl font-bold">Fuel Station</h1>
          <p className="text-sm text-muted-foreground mt-1">Management System</p>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-foreground hover:bg-accent hover:text-accent-foreground'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            );
          })}

          {isAdmin && (
            <>
              <div className="pt-4 pb-2">
                <p className="px-3 text-xs font-semibold text-muted-foreground uppercase">Admin</p>
              </div>
              {adminItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-foreground hover:bg-accent hover:text-accent-foreground'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </>
          )}
        </nav>

        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-sm font-semibold text-primary">
                {userProfile?.name?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{userProfile?.name || 'User'}</p>
              <p className="text-xs text-muted-foreground">
                {userProfile?.staffRole ? String(userProfile.staffRole).charAt(0).toUpperCase() + String(userProfile.staffRole).slice(1) : 'Staff'}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto p-6 max-w-7xl">{children}</div>
      </main>
    </div>
  );
}
