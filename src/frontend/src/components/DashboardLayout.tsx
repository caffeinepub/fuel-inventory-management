import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useQueryClient } from "@tanstack/react-query";
import { Link, useLocation } from "@tanstack/react-router";
import {
  AlertTriangle,
  BarChart3,
  Clock,
  DollarSign,
  FileText,
  Flame,
  Fuel,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  PieChart,
  Receipt,
  Settings,
  Shield,
  ShoppingCart,
  TrendingUp,
  Users,
} from "lucide-react";
import { useState } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useGetCallerUserProfile, useIsCallerAdmin } from "../hooks/useQueries";
import OfflineStatusIndicator from "./OfflineStatusIndicator";

export default function DashboardLayout({
  children,
}: { children: React.ReactNode }) {
  const { clear } = useInternetIdentity();
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
    { path: "/", label: "Dashboard", icon: LayoutDashboard },
    { path: "/tanks", label: "Tank Monitor", icon: Fuel },
    { path: "/alerts", label: "Alerts", icon: AlertTriangle },
    { path: "/stock", label: "Stock Reconciliation", icon: Package },
    { path: "/sales", label: "New Sale", icon: ShoppingCart },
    { path: "/shifts", label: "Shifts", icon: Clock },
    { path: "/shift-report", label: "Shift Reports", icon: FileText },
    { path: "/cash", label: "Cash Collection", icon: DollarSign },
    { path: "/expenses", label: "Expenses", icon: Receipt },
    { path: "/profit-loss", label: "Profit & Loss", icon: TrendingUp },
    { path: "/reports", label: "Sales Reports", icon: BarChart3 },
    { path: "/analytics", label: "Fuel Analytics", icon: PieChart },
    { path: "/charts", label: "Charts", icon: BarChart3 },
  ];

  const adminItems = [
    { path: "/staff", label: "Staff Management", icon: Users },
    { path: "/fuel-management", label: "Fuel Management", icon: Fuel },
    { path: "/prices", label: "Price Updates", icon: Settings },
  ];

  const NavContent = ({ onNavigate }: { onNavigate?: () => void }) => (
    <>
      <nav className="flex-1 overflow-y-auto px-3 py-2.5 space-y-0.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={onNavigate}
              data-ocid={`nav.${item.label.toLowerCase().replace(/\s+/g, "_")}.link`}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 min-h-[48px] group ${
                isActive
                  ? "nav-active-gradient text-white shadow-md"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Icon className="w-[18px] h-[18px] shrink-0" />
              <span className="text-sm font-medium leading-tight">
                {item.label}
              </span>
            </Link>
          );
        })}

        {isAdmin && (
          <>
            <div className="pt-4 pb-1.5">
              <div className="flex items-center gap-2 px-3">
                <div className="h-px flex-1 bg-white/10" />
                <p className="text-[9px] font-bold text-white/40 uppercase tracking-[0.15em]">
                  Admin
                </p>
                <div className="h-px flex-1 bg-white/10" />
              </div>
            </div>
            {adminItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={onNavigate}
                  data-ocid={`nav.admin_${item.label.toLowerCase().replace(/\s+/g, "_")}.link`}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 min-h-[48px] group ${
                    isActive
                      ? "nav-active-gradient text-white shadow-md"
                      : "text-white/70 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Icon className="w-[18px] h-[18px] shrink-0" />
                  <span className="text-sm font-medium leading-tight">
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </>
        )}
      </nav>

      {/* User Section */}
      <div className="px-3 pb-3 pt-2 border-t border-white/10">
        <div className="flex items-center gap-3 px-2 py-2.5 rounded-xl bg-white/5 mb-1.5">
          {/* Avatar */}
          <div className="w-9 h-9 rounded-xl bg-orange-500 flex items-center justify-center shrink-0 shadow-sm">
            <span className="text-sm font-bold text-white">
              {userProfile?.name?.charAt(0).toUpperCase() || "U"}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate leading-tight">
              {userProfile?.name || "User"}
            </p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <p className="text-xs text-white/55 leading-tight truncate">
                {userProfile?.staffRole
                  ? String(userProfile.staffRole).charAt(0).toUpperCase() +
                    String(userProfile.staffRole).slice(1)
                  : "Staff"}
              </p>
              {isAdmin && (
                <Badge className="text-[9px] px-1.5 py-0 h-[14px] flex items-center gap-0.5 bg-orange-500/25 text-orange-300 border-orange-400/20 hover:bg-orange-500/35 leading-none shrink-0">
                  <Shield className="w-2 h-2" />
                  Admin
                </Badge>
              )}
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          data-ocid="nav.logout.button"
          className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-red-300/80 hover:text-red-300 hover:bg-red-500/15 rounded-lg transition-colors duration-150 min-h-[44px]"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          Logout
        </button>
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 sidebar-gradient border-r border-white/8 flex-col shrink-0">
        {/* Brand Header — premium treatment */}
        <div className="sidebar-brand-header flex items-center gap-3 px-5 min-h-[72px] border-b border-white/10 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center shrink-0 shadow-lg">
            <Flame className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0">
            <h2 className="text-base font-bold text-white leading-tight tracking-tight">
              Fuel Station
            </h2>
            <p className="text-[11px] text-white/50 font-medium tracking-wide mt-0.5">
              Management System
            </p>
          </div>
        </div>
        <NavContent />
      </aside>

      {/* Mobile Drawer */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent
          side="left"
          className="w-72 p-0 flex flex-col sidebar-gradient border-r border-white/8"
        >
          {/* Brand Header in Drawer — same premium treatment */}
          <SheetHeader className="shrink-0 border-b border-white/10 sidebar-brand-header">
            <SheetTitle className="text-left px-5 min-h-[72px] flex items-center">
              <div className="flex items-center gap-3 w-full">
                <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center shrink-0 shadow-lg">
                  <Flame className="w-5 h-5 text-white" />
                </div>
                <div className="min-w-0">
                  <span className="text-base font-bold text-white leading-tight tracking-tight block">
                    Fuel Station
                  </span>
                  <p className="text-[11px] text-white/50 font-medium tracking-wide mt-0.5">
                    Management System
                  </p>
                </div>
              </div>
            </SheetTitle>
          </SheetHeader>
          <div className="flex flex-col flex-1 overflow-hidden">
            <NavContent onNavigate={() => setMobileMenuOpen(false)} />
          </div>
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto flex flex-col min-w-0">
        {/* Mobile Header — consistent height with sidebar brand */}
        <header className="md:hidden flex items-center gap-2 px-4 mobile-header-gradient text-white sticky top-0 z-10 shadow-lg safe-top min-h-[60px]">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center shrink-0"
            aria-label="Open menu"
            data-ocid="nav.menu.button"
          >
            <Menu className="w-5 h-5 text-white" />
          </button>
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-orange-500 flex items-center justify-center shrink-0 shadow-sm">
              <Flame className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-sm font-bold text-white truncate">
              Fuel Station
            </span>
          </div>
          <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center shrink-0 shadow-sm">
            <span className="text-xs font-bold text-white">
              {userProfile?.name?.charAt(0).toUpperCase() || "U"}
            </span>
          </div>
        </header>

        <OfflineStatusIndicator />
        <div className="p-3 sm:p-4 md:p-6 max-w-7xl mx-auto w-full flex-1">
          {children}
        </div>
      </main>
    </div>
  );
}
