import { Instagram, Twitter, Facebook } from "lucide-react";
import { Link } from "react-router-dom";
import logo from "@/assets/ojas-logo.png";

export const Footer = () => (
  <footer className="pt-24 pb-28 md:pb-32">
    <div className="container">
      <div className="rounded-[2rem] bg-[#021B09] text-primary-foreground p-10 md:p-14 shadow-soft">
        <div className="grid md:grid-cols-4 gap-10">
          <div className="md:col-span-2">
            <Link to="/" className="inline-flex items-center" aria-label="OJAS Cuisine — Home">
              <img
                src={logo}
                alt="OJAS Cuisine — Energize, Nourish, Evolve"
                className="h-24 w-auto rounded-2xl shadow-soft"
                loading="lazy"
                decoding="async"
              />
            </Link>
            <p className="mt-4 text-primary-foreground/80 max-w-sm leading-relaxed">
              Personalised meals, expert nutrition, and doctor-led care — all in one calm, considered place.
            </p>
            <div className="mt-6 flex items-center gap-3">
              {[Instagram, Twitter, Facebook].map((Icon, i) => (
                <a key={i} href="#" className="w-10 h-10 rounded-full bg-primary-foreground/10 grid place-items-center hover:bg-[hsl(140_38%_55%)] hover:text-[#021B09] focus-visible:bg-[hsl(140_38%_55%)] focus-visible:text-[#021B09] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground transition-colors">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-primary-foreground/60 mb-4">Explore</div>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/meals" className="hover:text-[hsl(140_38%_70%)] focus-visible:text-[hsl(140_38%_70%)] focus-visible:outline-none focus-visible:underline underline-offset-4 transition-colors">Meals</Link></li>
              <li><Link to="/plans" className="hover:text-[hsl(140_38%_70%)] focus-visible:text-[hsl(140_38%_70%)] focus-visible:outline-none focus-visible:underline underline-offset-4 transition-colors">Plans</Link></li>
              <li><Link to="/experts" className="hover:text-[hsl(140_38%_70%)] focus-visible:text-[hsl(140_38%_70%)] focus-visible:outline-none focus-visible:underline underline-offset-4 transition-colors">Experts</Link></li>
              <li><Link to="/builder" className="hover:text-[hsl(140_38%_70%)] focus-visible:text-[hsl(140_38%_70%)] focus-visible:outline-none focus-visible:underline underline-offset-4 transition-colors">Builder</Link></li>
              <li><Link to="/delivery" className="hover:text-[hsl(140_38%_70%)] focus-visible:text-[hsl(140_38%_70%)] focus-visible:outline-none focus-visible:underline underline-offset-4 transition-colors">Delivery</Link></li>
              <li><Link to="/about" className="hover:text-[hsl(140_38%_70%)] focus-visible:text-[hsl(140_38%_70%)] focus-visible:outline-none focus-visible:underline underline-offset-4 transition-colors">About</Link></li>
              <li><Link to="/contact" className="hover:text-[hsl(140_38%_70%)] focus-visible:text-[hsl(140_38%_70%)] focus-visible:outline-none focus-visible:underline underline-offset-4 transition-colors">Contact</Link></li>
            </ul>
          </div>

          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-primary-foreground/60 mb-4">Contact</div>
            <ul className="space-y-2.5 text-sm text-primary-foreground/80">
              <li>hello@ojas.health</li>
              <li>+91 96403 64031</li>
              <li>Bengaluru · India</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-primary-foreground/15 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-primary-foreground/70">
          <div>© {new Date().getFullYear()} OJAS. All rights reserved.</div>
          <div>
            Designed and Developed by{" "}
            <a
              href="https://inspiringwave.in/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex text-primary-foreground font-medium hover:text-[hsl(140_38%_70%)] focus-visible:text-[hsl(140_38%_70%)] focus-visible:outline-none focus-visible:underline underline-offset-4 transition-colors"
            >
              INSPIRING WAVE
            </a>
          </div>
        </div>
      </div>
    </div>
  </footer>
);
