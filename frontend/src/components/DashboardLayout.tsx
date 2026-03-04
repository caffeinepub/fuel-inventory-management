import { useState } from 'react';
import { Link, useLocation } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile, useIsCallerAdmin } from '../hooks/useQueries';
import { useQueryClient } from '@tanstack/react-query';
import OfflineStatusIndicator from './OfflineStatusIndicator';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
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
  Shield,
  Menu,
  X,
} from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { clear, identity } = useInternetIdentity();
  const { data: userProfile } = useGetCallerUserProfile();
  const { data: isAdmin } = useIsCallerAdmin();
  const queryClient = useQueryClient();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  const NavContent = ({ onNavigate }: { onNavigate?: () => void }) => (
    <>
      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={onNavigate}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors min-h-[44px] ${
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-foreground hover:bg-accent hover:text-accent-foreground'
              }`}
            >
              <Icon className="w-5 h-5 shrink-0" />
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          );
        })}

        {isAdmin && (
          <>
            <div className="pt-4 pb-2">
              <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Admin</p>
            </div>
            {adminItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={onNavigate}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors min-h-[44px] ${
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-foreground hover:bg-accent hover:text-accent-foreground'
                  }`}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              );
            })}
          </>
        )}
      </nav>

      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <span className="text-sm font-semibold text-primary">
              {userProfile?.name?.charAt(0).toUpperCase() || 'U'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{userProfile?.name || 'User'}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <p className="text-xs text-muted-foreground">
                {userProfile?.staffRole
                  ? String(userProfile.staffRole).charAt(0).toUpperCase() + String(userProfile.staffRole).slice(1)
                  : 'Staff'}
              </p>
              {isAdmin && (
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 flex items-center gap-1">
                  <Shield className="w-2.5 h-2.5" />
                  Admin
                </Badge>
              )}
            </div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-destructive hover:bg-destructive/10 rounded-lg transition-colors min-h-[44px]"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 bg-card border-r border-border flex-col shrink-0">
        <div className="p-6 border-b border-border">
          <h1 className="text-xl font-bold">Fuel Station</h1>
          <p className="text-sm text-muted-foreground mt-1">Management System</p>
        </div>
        <NavContent />
      </aside>

      {/* Mobile Drawer */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="w-72 p-0 flex flex-col">
          <SheetHeader className="p-6 border-b border-border">
            <SheetTitle className="text-left">
              <span className="text-xl font-bold">Fuel Station</span>
              <p className="text-sm text-muted-foreground font-normal mt-1">Management System</p>
            </SheetTitle>
          </SheetHeader>
          <div className="flex flex-col flex-1 overflow-hidden">
            <NavContent onNavigate={() => setMobileMenuOpen(false)} />
          </div>
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center gap-3 px-4 py-3 bg-card border-b border-border sticky top-0 z-10">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 rounded-lg hover:bg-accent transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-base font-bold">Fuel Station</h1>
          </div>
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-xs font-semibold text-primary">
              {userProfile?.name?.charAt(0).toUpperCase() || 'U'}
            </span>
          </div>
        </header>

        <OfflineStatusIndicator />
        <div className="p-4 sm:p-6 max-w-7xl mx-auto w-full flex-1">{children}</div>
      </main>
    </div>
  );
}
