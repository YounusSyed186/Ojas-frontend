import { useEffect, useState } from "react";
import { Menu, X, ShoppingBag, User, LogOut } from "lucide-react";
import { Link, NavLink, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { AuthDialog } from "@/components/AuthDialog";
import logo from "@/assets/ojas-logo.png";
import { getDashboardPath } from "@/lib/roles";

const links = [
  { label: "Meals", to: "/meals" },
  { label: "Plans", to: "/plans" },
  { label: "Experts", to: "/experts" },
  { label: "Builder", to: "/builder" },
  { label: "Delivery", to: "/delivery" },
  { label: "Contact", to: "/contact" },
];

export const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [searchParams] = useSearchParams();
  const { count, open: openCart } = useCart();
  const { isAuthenticated, user, logout } = useAuth();
  const dashboardPath = getDashboardPath(user?.role);

  // Handle ?auth=signin or ?auth=verify-phone from URL (e.g. from ProtectedRoute redirect)
  const authParam = searchParams.get("auth");
  const [authDefaultMode, setAuthDefaultMode] = useState<"signin" | "verify-phone" | undefined>(undefined);

  useEffect(() => {
    if (authParam === "signin" || authParam === "verify-phone") {
      setAuthDefaultMode(authParam);
      setAuthOpen(true);
    }
  }, [authParam]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? "py-2" : "py-4"
      }`}
    >
      <div className="container">
        <nav
          className={`flex items-center justify-between rounded-full px-5 py-3 transition-all duration-500 bg-[#021B09] shadow-soft`}
        >
          <Link to="/" className="flex items-center group" aria-label="OJAS Cuisine — Home">
            <img
              src={logo}
              alt="OJAS Cuisine — Energize, Nourish, Evolve"
              className={`transition-all duration-500 w-auto ${scrolled ? "h-12" : "h-16"} drop-shadow-sm`}
              loading="eager"
              decoding="async"
            />
          </Link>

          <ul className="hidden lg:flex items-center gap-7 text-sm font-medium text-white/90">
            {links.map((l) => (
              <li key={l.to}>
                <NavLink
                  to={l.to}
                  className={({ isActive }) =>
                    `relative transition-colors after:absolute after:left-0 after:-bottom-1 after:h-px after:bg-accent after:transition-all hover:after:w-full ${
                      isActive ? "text-white after:w-full" : "hover:text-white after:w-0"
                    }`
                  }
                >
                  {l.label}
                </NavLink>
              </li>
            ))}
          </ul>

          <div className="hidden md:flex items-center gap-3 text-white">
            <button
              type="button"
              onClick={openCart}
              className="relative w-10 h-10 grid place-items-center rounded-full hover:bg-white/20 transition-colors"
              aria-label={`Cart with ${count} item${count === 1 ? "" : "s"}`}
            >
              <ShoppingBag className="w-4 h-4" />
              {count > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-accent text-[10px] font-semibold grid place-items-center text-accent-foreground">
                  {count}
                </span>
              )}
            </button>

            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Link
                  to={dashboardPath}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-sm"
                >
                  <User className="w-4 h-4" />
                  <span className="max-w-[100px] truncate">{user?.name?.split(" ")[0] || "Account"}</span>
                </Link>
                <button
                  onClick={logout}
                  className="w-10 h-10 grid place-items-center rounded-full hover:bg-white/20 transition-colors"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Button
                type="button"
                size="sm"
                onClick={() => setAuthOpen(true)}
                className="rounded-full bg-white text-primary hover:bg-white/90 shadow-soft"
              >
                Sign in
              </Button>
            )}
          </div>

          <div className="lg:hidden flex items-center gap-2 text-white">
            <button
              type="button"
              onClick={openCart}
              className="relative w-10 h-10 grid place-items-center rounded-full hover:bg-white/20 transition-colors"
              aria-label={`Cart with ${count} item${count === 1 ? "" : "s"}`}
            >
              <ShoppingBag className="w-4 h-4" />
              {count > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-accent text-[10px] font-semibold grid place-items-center text-accent-foreground">
                  {count}
                </span>
              )}
            </button>
            <button onClick={() => setOpen(!open)} aria-label="Menu">
              {open ? <X /> : <Menu />}
            </button>
          </div>
        </nav>

        {open && (
          <div className="lg:hidden mt-2 glass rounded-3xl p-6 animate-fade-up">
            <ul className="flex flex-col gap-4">
              {links.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} onClick={() => setOpen(false)} className="text-lg font-medium">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
            {isAuthenticated ? (
              <div className="mt-4 space-y-2">
                <Link
                  to={dashboardPath}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 w-full p-3 rounded-xl bg-white/10 text-sm"
                >
                  <User className="w-4 h-4" /> Dashboard
                </Link>
                <button
                  onClick={() => { logout(); setOpen(false); }}
                  className="flex items-center gap-2 w-full p-3 rounded-xl bg-white/10 text-sm"
                >
                  <LogOut className="w-4 h-4" /> Sign out
                </button>
              </div>
            ) : (
              <Button
                type="button"
                className="w-full mt-4 rounded-full bg-primary"
                onClick={() => {
                  setOpen(false);
                  setAuthOpen(true);
                }}
              >
                Sign in
              </Button>
            )}
          </div>
        )}
      </div>
      <AuthDialog open={authOpen} onOpenChange={setAuthOpen} defaultMode={authDefaultMode} />
    </header>
  );
};