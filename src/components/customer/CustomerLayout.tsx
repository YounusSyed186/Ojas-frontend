import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  CreditCard,
  Utensils,
  CalendarDays,
  User,
  LogOut,
  Menu,
  X,
  ClipboardList,
  ShoppingBag,
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
  { label: "Overview", to: "/customer/dashboard", icon: LayoutDashboard },
  { label: "Orders", to: "/customer/orders", icon: ShoppingBag },
  { label: "Subscription", to: "/customer/subscription", icon: ClipboardList },
  { label: "Meal plan", to: "/customer/meal-plan", icon: Utensils },
  { label: "Consultations", to: "/customer/consultations", icon: CalendarDays },
  { label: "Payments", to: "/customer/payments", icon: CreditCard },
  { label: "Account", to: "/customer/account", icon: User },
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
    <div className="min-h-screen bg-background">
      {/* Mobile header */}
      <div className="sticky top-0 z-40 flex items-center justify-between border-b bg-card/95 px-4 py-3 backdrop-blur lg:hidden">
        <Link to="/customer/dashboard" className="font-serif text-xl font-bold text-primary">
          OJAS
        </Link>
        <Button variant="outline" size="icon" aria-label={mobileOpen ? "Close dashboard navigation" : "Open dashboard navigation"} aria-expanded={mobileOpen} aria-controls="customer-navigation" onClick={() => setMobileOpen((open) => !open)}>
          {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      <div className="mx-auto flex min-h-screen max-w-[1800px]">
        {/* Sidebar */}
        <aside
          id="customer-navigation"
          className={cn(
            "fixed inset-y-0 left-0 z-50 w-72 border-r bg-primary text-primary-foreground shadow-2xl transition-transform lg:sticky lg:top-0 lg:h-screen lg:translate-x-0",
            mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          )}
        >
          <div className="flex h-full flex-col">
            <div className="border-b border-white/10 px-6 py-6">
              <Link to="/customer/dashboard" className="font-serif text-2xl font-bold tracking-wide text-white">
                OJAS
              </Link>
              <p className="mt-1 text-xs uppercase tracking-[0.2em] text-white/55">Customer portal</p>
            </div>

            <div className="border-b border-white/10 px-5 py-5">
              <div className="flex items-center gap-3 rounded-2xl bg-white/5 p-3">
                <div className="grid h-10 w-10 place-items-center rounded-full bg-white/15 font-semibold">
                  {user?.name?.charAt(0).toUpperCase() || "U"}
                </div>
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-white">{user?.name}</div>
                  <div className="truncate text-xs text-white/55">{user?.email}</div>
                </div>
              </div>
            </div>

            <nav aria-label="Customer dashboard" className="flex-1 overflow-y-auto px-4 py-5">
              <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40">My account</p>
              <div className="space-y-1">
                {navItems.map(({ label, to, icon: Icon }) => {
                  const active = pathname === to || pathname.startsWith(`${to}/`);
                  return (
                    <Link
                      key={to}
                      to={to}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
                        active
                          ? "bg-white font-semibold text-primary shadow-sm"
                          : "text-white/65 hover:bg-white/10 hover:text-white",
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span>{label}</span>
                    </Link>
                  );
                })}
              </div>
            </nav>

            <div className="space-y-2 border-t border-white/10 p-4">
              <Button asChild variant="ghost" size="sm" className="w-full justify-start text-white/70 hover:bg-white/10 hover:text-white">
                <Link to="/">Back to website</Link>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-white/70 hover:bg-white/10 hover:text-white"
                onClick={() => void logout()}
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
        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-9">
          <div className="mx-auto max-w-7xl">
          <div className="mb-7 border-b pb-5">
            <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-primary/55">Customer portal</p>
            <h1 className="text-3xl font-semibold text-foreground sm:text-4xl">{title}</h1>
            {subtitle && <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{subtitle}</p>}
          </div>
          {children}
          </div>
        </main>
      </div>
    </div>
  );
};
