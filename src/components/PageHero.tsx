import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

interface Crumb { label: string; to?: string }

interface Props {
  eyebrow?: string;
  title: ReactNode;
  subtitle?: string;
  crumbs?: Crumb[];
}

export const PageHero = ({ eyebrow, title, subtitle, crumbs }: Props) => (
  <section className="pt-32 md:pt-40 pb-12 md:pb-16">
    <div className="container">
      {crumbs && crumbs.length > 0 && (
        <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-6">
          {crumbs.map((c, i) => (
            <span key={i} className="inline-flex items-center gap-1.5">
              {c.to ? (
                <Link to={c.to} className="hover:text-foreground transition-colors">{c.label}</Link>
              ) : (
                <span className="text-foreground">{c.label}</span>
              )}
              {i < crumbs.length - 1 && <ChevronRight className="w-3 h-3 opacity-50" />}
            </span>
          ))}
        </nav>
      )}
      {eyebrow && (
        <p className="text-xs uppercase tracking-[0.3em] text-accent font-medium mb-4">{eyebrow}</p>
      )}
      <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-semibold leading-[1.02] tracking-tight max-w-4xl">
        {title}
      </h1>
      {subtitle && (
        <p className="mt-5 text-lg text-muted-foreground max-w-2xl leading-relaxed">{subtitle}</p>
      )}
    </div>
  </section>
);
