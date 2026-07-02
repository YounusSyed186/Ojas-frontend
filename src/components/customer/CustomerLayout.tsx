import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  CreditCard,
  Utensils,
  CalendarDays,
  User,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  ClipboardList,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

export type CustomerNavItem = {
  label: string;
  to: string;
  icon: React.ComponentType<{ className?: string }>;
};

const navItems: CustomerNavItem[] = [
  { label: "Dashboard", to: "/customer/overview", icon: LayoutDashboard },
  { label: "My Subscription", to: "/customer/subscription", icon: ClipboardList },
  { label: "Meal Plan", to: "/customer/meal-plan", icon: Utensils },
  { label: "Consultations", to: "/customer/consultations", icon: CalendarDays },
  { label: "Payments", to: "/customer/payments", icon: CreditCard },
  { label: "Profile", to: "/customer/profile", icon: User },
  { label: "Notifications", to: "/customer/notifications", icon: Bell },
  { label: "Settings", to: "/customer/settings", icon: Settings },
];

type CustomerLayoutProps = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
};

export const CustomerLayout = ({ title, subtitle, children }: CustomerLayoutProps) => {
  const { pathname } = useLocation();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile header */}
      <div className="sticky top-0 z-40 flex items-center justify-between border-b bg-white px-4 py-3 lg:hidden">
        <Link to="/customer/overview" className="text-lg font-bold text-gray-900">
          My Account
        </Link>
        <Button variant="outline" size="icon" onClick={() => setMobileOpen((open) => !open)}>
          {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      <div className="mx-auto flex max-w-[1600px]">
        {/* Sidebar */}
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-50 w-64 border-r bg-white shadow-sm transition-transform lg:static lg:translate-x-0",
            mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          )}
        >
          <div className="flex h-full flex-col">
            <div className="border-b px-6 py-5">
              <Link to="/customer/overview" className="text-xl font-bold text-gray-900">
                OJAS
              </Link>
              <p className="text-xs text-muted-foreground mt-1">Customer Portal</p>
            </div>

            <div className="border-b px-6 py-4">
              <div className="text-xs uppercase tracking-wider text-muted-foreground">Signed in as</div>
              <div className="mt-1 text-sm font-medium">{user?.name}</div>
              <div className="text-xs capitalize text-muted-foreground">{user?.role}</div>
            </div>

            <nav className="flex-1 overflow-y-auto px-3 py-4">
              <div className="space-y-0.5">
                {navItems.map(({ label, to, icon: Icon }) => {
                  const active = pathname === to || pathname.startsWith(`${to}/`);
                  return (
                    <Link
                      key={to}
                      to={to}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                        active
                          ? "bg-primary/10 font-medium text-primary"
                          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span>{label}</span>
                    </Link>
                  );
                })}
              </div>
            </nav>

            <div className="border-t p-4 space-y-2">
              <Button asChild variant="outline" size="sm" className="w-full justify-start rounded-lg text-sm">
                <Link to="/">Back to site</Link>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start rounded-lg text-sm"
                onClick={logout}
              >
                <LogOut className="mr-2 h-4 w-4" /> Sign out
              </Button>
            </div>
          </div>
        </aside>

        {/* Overlay for mobile */}
        {mobileOpen && (
          <button
            type="button"
            className="fixed inset-0 z-40 bg-black/30 lg:hidden"
            aria-label="Close navigation"
            onClick={() => setMobileOpen(false)}
          />
        )}

        {/* Main content */}
        <main className="min-h-screen flex-1 px-4 py-6 lg:px-8 lg:py-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
          </div>
          {children}
        </main>
      </div>
    </div>
  );
};