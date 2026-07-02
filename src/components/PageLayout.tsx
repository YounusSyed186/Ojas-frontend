import { ReactNode, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { NutritionistFAB } from "./NutritionistFAB";

interface Props {
  children: ReactNode;
  title?: string;
  description?: string;
}

export const PageLayout = ({ children, title, description }: Props) => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [pathname]);

  useEffect(() => {
    if (title) document.title = title;
    if (description) {
      let m = document.querySelector('meta[name="description"]');
      if (!m) {
        m = document.createElement("meta");
        m.setAttribute("name", "description");
        document.head.appendChild(m);
      }
      m.setAttribute("content", description);
    }
    let c = document.querySelector('link[rel="canonical"]');
    if (!c) {
      c = document.createElement("link");
      c.setAttribute("rel", "canonical");
      document.head.appendChild(c);
    }
    c.setAttribute("href", window.location.origin + pathname);
  }, [title, description, pathname]);

  return (
    <main className="relative overflow-x-hidden">
      <Navbar />
      {children}
      <Footer />
      <NutritionistFAB />
    </main>
  );
};
