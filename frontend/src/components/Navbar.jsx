import React, { useState, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Sparkles } from "lucide-react";
import Logo from "@/components/Logo";

const LINKS = [
  { to: "/about", label: "About" },
  { to: "/services", label: "Services" },
  { to: "/gallery", label: "Gallery" },
  { to: "/ai-glow-guide", label: "AI Glow Guide™" },
  { to: "/faq", label: "FAQ" },
  { to: "/blog", label: "Blog" },
  { to: "/contact", label: "Contact" },
];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled ? "backdrop-blur-xl bg-[#0A0A0C]/85 border-b border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.5)]" : "bg-transparent"
      }`}
      data-testid="main-navbar"
    >
      <div className="max-w-7xl mx-auto px-5 lg:px-8 h-[76px] flex items-center justify-between">
        <Logo />

        <nav className="hidden lg:flex items-center gap-7">
          {LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              data-testid={`nav-${l.label.toLowerCase().replace(/[^a-z]/g, "")}`}
              className={({ isActive }) =>
                `text-sm transition-colors hover:text-white ${isActive ? "text-glow-soft" : "text-white/70"}`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden lg:flex items-center">
          <button
            onClick={() => navigate("/quote")}
            data-testid="nav-quote-cta"
            className="glow-btn text-white text-sm font-medium px-6 py-3 rounded-full inline-flex items-center gap-2"
          >
            <Sparkles size={15} /> Request Your Glow Quote™
          </button>
        </div>

        <button
          className="lg:hidden text-white p-2"
          onClick={() => setOpen((o) => !o)}
          data-testid="mobile-menu-toggle"
          aria-label="Toggle menu"
        >
          {open ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="lg:hidden backdrop-blur-xl bg-[#0A0A0C]/95 border-b border-white/10"
            data-testid="mobile-menu"
          >
            <div className="px-5 py-6 flex flex-col gap-2">
              {LINKS.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  onClick={() => setOpen(false)}
                  className="py-3 px-4 rounded-xl text-white/80 hover:bg-white/5 hover:text-white transition-colors"
                  data-testid={`mobile-nav-${l.label.toLowerCase().replace(/[^a-z]/g, "")}`}
                >
                  {l.label}
                </Link>
              ))}
              <button
                onClick={() => { setOpen(false); navigate("/quote"); }}
                className="glow-btn text-white font-medium px-6 py-3.5 rounded-full mt-3"
                data-testid="mobile-quote-cta"
              >
                Request Your Glow Quote™
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
