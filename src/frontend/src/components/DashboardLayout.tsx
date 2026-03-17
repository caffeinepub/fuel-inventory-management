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
  Zap,
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
    { path: "/stock", label: "Stock Recon", icon: Package },
    { path: "/sales", label: "New Sale", icon: ShoppingCart },
    { path: "/shifts", label: "Shifts", icon: Clock },
    { path: "/shift-report", label: "Shift Reports", icon: FileText },
    { path: "/staff", label: "Staff Management", icon: Users },
    { path: "/cash", label: "Cash Collection", icon: DollarSign },
    { path: "/expenses", label: "Expenses", icon: Receipt },
    { path: "/profit-loss", label: "Profit & Loss", icon: TrendingUp },
    { path: "/reports", label: "Sales Reports", icon: BarChart3 },
    { path: "/analytics", label: "Fuel Analytics", icon: PieChart },
    { path: "/charts", label: "Charts", icon: BarChart3 },
  ];

  const adminItems = [
    { path: "/fuel-management", label: "Fuel Mgmt", icon: Fuel },
    { path: "/prices", label: "Price Updates", icon: Settings },
  ];

  const NavLink = ({
    path,
    label,
    icon: Icon,
    onNavigate,
  }: {
    path: string;
    label: string;
    icon: React.ElementType;
    onNavigate?: () => void;
  }) => {
    const isActive = location.pathname === path;
    return (
      <Link
        to={path}
        onClick={onNavigate}
        data-ocid={`nav.${label.toLowerCase().replace(/[^a-z0-9]+/g, "_")}.link`}
        className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 min-h-[44px] ${
          isActive
            ? "nav-active-gradient text-white"
            : "text-white/55 hover:bg-white/8 hover:text-white/90"
        }`}
      >
        {isActive && (
          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r-full bg-primary" />
        )}
        <span
          className={`w-8 h-8 flex items-center justify-center rounded-lg shrink-0 transition-colors ${
            isActive ? "bg-primary/20" : "bg-white/5"
          }`}
        >
          <Icon className="w-[15px] h-[15px]" />
        </span>
        <span className="text-[13px] font-medium leading-tight">{label}</span>
      </Link>
    );
  };

  const roleLabel = userProfile?.staffRole
    ? String(userProfile.staffRole).charAt(0).toUpperCase() +
      String(userProfile.staffRole).slice(1)
    : "Staff";

  const NavContent = ({ onNavigate }: { onNavigate?: () => void }) => (
    <>
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
        {navItems.map((item) => (
          <NavLink key={item.path} {...item} onNavigate={onNavigate} />
        ))}

        {isAdmin && (
          <>
            <div className="pt-4 pb-2">
              <div className="flex items-center gap-2 px-3">
                <div className="h-px flex-1 bg-white/8" />
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  <p className="text-[9px] font-bold text-white/40 uppercase tracking-[0.18em]">
                    Admin
                  </p>
                </div>
                <div className="h-px flex-1 bg-white/8" />
              </div>
            </div>
            {adminItems.map((item) => (
              <NavLink key={item.path} {...item} onNavigate={onNavigate} />
            ))}
          </>
        )}
      </nav>

      {/* User section */}
      <div className="px-3 pb-4 pt-2 border-t border-white/8">
        <div
          className="flex items-center gap-3 px-3 py-3 rounded-xl mb-2"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.18 0.04 260 / 0.8), oklch(0.15 0.03 260 / 0.9))",
            border: "1px solid oklch(0.65 0.20 45 / 0.15)",
          }}
        >
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 font-bold text-sm text-white"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.65 0.20 45), oklch(0.55 0.18 35))",
            }}
          >
            {userProfile?.name?.charAt(0).toUpperCase() ?? "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">
              {userProfile?.name ?? "User"}
            </p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[11px] text-white/50">{roleLabel}</span>
              {isAdmin && (
                <Badge
                  className="text-[9px] px-1.5 py-0 h-[14px] shrink-0"
                  style={{
                    background: "oklch(0.65 0.20 45 / 0.2)",
                    color: "oklch(0.80 0.18 45)",
                    border: "1px solid oklch(0.65 0.20 45 / 0.3)",
                  }}
                >
                  <Shield className="w-2 h-2 mr-0.5" />
                  Admin
                </Badge>
              )}
            </div>
          </div>
        </div>
        <div className="mb-2.5">
          <OfflineStatusIndicator />
        </div>
        <button
          type="button"
          onClick={handleLogout}
          data-ocid="nav.logout.button"
          className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm rounded-xl transition-colors duration-150 min-h-[44px]"
          style={{
            color: "oklch(0.65 0.20 15 / 0.7)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "oklch(0.62 0.22 15 / 0.12)";
            e.currentTarget.style.color = "oklch(0.72 0.22 15)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "";
            e.currentTarget.style.color = "oklch(0.65 0.20 15 / 0.7)";
          }}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span className="font-medium">Sign Out</span>
        </button>
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Desktop Sidebar */}
      <aside
        className="hidden md:flex w-62 sidebar-gradient flex-col shrink-0"
        style={{ width: "248px" }}
      >
        {/* Brand Header */}
        <div className="sidebar-brand-header flex items-center gap-3 px-5 min-h-[68px] border-b border-white/8 shrink-0">
          <div className="relative">
            <div
              className="absolute inset-0 rounded-xl blur-md"
              style={{ background: "oklch(0.65 0.20 45 / 0.4)" }}
            />
            <div
              className="relative w-9 h-9 rounded-xl flex items-center justify-center"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.65 0.20 45), oklch(0.55 0.18 35))",
              }}
            >
              <Flame className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="min-w-0">
            <h2
              className="text-sm font-bold leading-tight gradient-text"
              style={{ fontFamily: '"Bricolage Grotesque",system-ui' }}
            >
              Fuel Station
            </h2>
            <p className="text-[10px] text-white/40 font-medium tracking-wide mt-0.5">
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
          className="w-72 p-0 border-r border-white/8 flex flex-col"
          style={{
            background:
              "linear-gradient(180deg, oklch(0.13 0.05 260) 0%, oklch(0.10 0.03 260) 100%)",
          }}
        >
          <SheetHeader className="sidebar-brand-header px-5 min-h-[68px] border-b border-white/8 flex-row items-center justify-start gap-3 space-y-0 shrink-0">
            <div className="relative">
              <div
                className="absolute inset-0 rounded-xl blur-md"
                style={{ background: "oklch(0.65 0.20 45 / 0.4)" }}
              />
              <div
                className="relative w-9 h-9 rounded-xl flex items-center justify-center"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.65 0.20 45), oklch(0.55 0.18 35))",
                }}
              >
                <Flame className="w-5 h-5 text-white" />
              </div>
            </div>
            <SheetTitle
              className="text-sm font-bold gradient-text"
              style={{ fontFamily: '"Bricolage Grotesque",system-ui' }}
            >
              Fuel Station
            </SheetTitle>
          </SheetHeader>
          <div className="flex-1 flex flex-col overflow-hidden">
            <NavContent onNavigate={() => setMobileMenuOpen(false)} />
          </div>
        </SheetContent>
      </Sheet>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile top bar */}
        <header
          className="md:hidden flex items-center justify-between px-4 min-h-[60px] border-b border-white/8 shrink-0"
          style={{
            background:
              "linear-gradient(90deg, oklch(0.13 0.05 260) 0%, oklch(0.10 0.03 260) 100%)",
          }}
        >
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="p-2.5 text-white/50 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
              data-ocid="nav.mobile_menu.button"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Zap
                  className="w-4 h-4"
                  style={{ color: "oklch(0.65 0.20 45)" }}
                />
              </div>
              <span
                className="text-sm font-bold gradient-text"
                style={{ fontFamily: '"Bricolage Grotesque",system-ui' }}
              >
                Fuel Station
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <OfflineStatusIndicator />
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold text-white"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.65 0.20 45), oklch(0.55 0.18 35))",
              }}
            >
              {userProfile?.name?.charAt(0).toUpperCase() ?? "U"}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="px-4 py-5 sm:px-6 sm:py-6 max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
