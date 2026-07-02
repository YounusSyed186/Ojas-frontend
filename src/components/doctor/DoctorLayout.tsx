import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Stethoscope,
  Users,
  Utensils,
  CalendarDays,
  FileText,
  UserCircle,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import logo from "@/assets/ojas-logo.png";

export type DoctorNavItem = {
  label: string;
  to: string;
  icon: React.ComponentType<{ className?: string }>;
};

const defaultNavItems: DoctorNavItem[] = [
  { label: "Dashboard", to: "/doctor/dashboard", icon: LayoutDashboard },
  { label: "Consultations", to: "/doctor/consultations", icon: Stethoscope },
  { label: "Patients", to: "/doctor/patients", icon: Users },
  { label: "Meal Plans", to: "/doctor/meal-plans", icon: Utensils },
  { label: "Schedule", to: "/doctor/schedule", icon: CalendarDays },
  { label: "Notes", to: "/doctor/notes", icon: FileText },
  { label: "Profile", to: "/doctor/profile", icon: UserCircle },
];

type DoctorLayoutProps = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  navItems?: DoctorNavItem[];
};

export const DoctorLayout = ({ title, subtitle, children, navItems = defaultNavItems }: DoctorLayoutProps) => {
  const { pathname } = useLocation();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f6f8f5]">
      {/* Mobile header */}
      <div className="lg:hidden sticky top-0 z-40 flex items-center justify-between border-b bg-white px-4 py-3">
        <Link to="/" className="flex items-center">
          <img src={logo} alt="OJAS" className="h-10 w-auto" />
        </Link>
        <Button variant="outline" size="icon" onClick={() => setMobileOpen((open) => !open)}>
          {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      <div className="mx-auto flex max-w-[1400px]">
        {/* Sidebar */}
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-50 w-64 border-r bg-[#021B09] text-white transition-transform lg:static lg:translate-x-0",
            mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          )}
        >
          <div className="flex h-full flex-col p-5">
            <Link to="/" className="mb-8 hidden lg:block">
              <img src={logo} alt="OJAS" className="h-12 w-auto" />
            </Link>

            <div className="mb-6 rounded-2xl bg-white/10 p-4">
              <div className="text-xs uppercase tracking-widest text-white/60">Signed in as</div>
              <div className="mt-1 font-medium">{user?.name}</div>
              <div className="text-xs capitalize text-white/70">Doctor</div>
            </div>

            <nav className="space-y-1 flex-1">
              {navItems.map(({ label, to, icon: Icon }) => {
                const active = pathname === to || (to !== "/doctor/dashboard" && pathname.startsWith(to));
                return (
                  <Link
                    key={to}
                    to={to}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
                      active ? "bg-white text-[#021B09]" : "text-white/80 hover:bg-white/10 hover:text-white",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </Link>
                );
              })}
            </nav>

            <div className="space-y-2 pt-6">
              <Button asChild variant="outline" className="w-full rounded-full border-white/20 bg-transparent text-white hover:bg-white/10">
                <Link to="/">Back to site</Link>
              </Button>
              <Button
                variant="outline"
                className="w-full rounded-full border-white/20 bg-transparent text-white hover:bg-white/10"
                onClick={logout}
              >
                <LogOut className="mr-2 h-4 w-4" /> Sign out
              </Button>
            </div>
          </div>
        </aside>

        {/* Overlay */}
        {mobileOpen && (
          <button
            type="button"
            className="fixed inset-0 z-40 bg-black/40 lg:hidden"
            aria-label="Close navigation"
            onClick={() => setMobileOpen(false)}
          />
        )}

        {/* Main content */}
        <main className="min-h-screen flex-1 px-4 py-6 lg:px-8 lg:py-8">
          <div className="mb-8">
            <h1 className="font-display text-3xl font-semibold text-[#021B09]">{title}</h1>
            {subtitle && <p className="mt-2 max-w-3xl text-sm text-muted-foreground">{subtitle}</p>}
          </div>
          {children}
        </main>
      </div>
    </div>
  );
};