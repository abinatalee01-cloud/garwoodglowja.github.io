import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Instagram, Mail, Phone, MapPin, Send } from "lucide-react";
import { toast } from "sonner";
import Logo from "@/components/Logo";
import { BRAND, SERVICES } from "@/data/site";
import api from "@/lib/api";

const Footer = () => {
  const [email, setEmail] = useState("");

  const subscribe = async (e) => {
    e.preventDefault();
    if (!email) return;
    try {
      await api.post("/newsletter", { email });
      toast.success("You're on the list — welcome to the Glow.");
      setEmail("");
    } catch {
      toast.error("Something went wrong. Please try again.");
    }
  };

  return (
    <footer className="relative border-t border-white/10 bg-[#0A0A0C] pt-16 pb-8" data-testid="site-footer">
      <div className="max-w-7xl mx-auto px-5 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-5 md:grid-cols-2">
          <div className="lg:col-span-2">
            <Logo />
            <p className="text-white/55 text-sm mt-5 max-w-sm leading-relaxed">
              {BRAND.slogan} Premium residential & commercial cleaning, island-wide across Jamaica.
            </p>
            <form onSubmit={subscribe} className="mt-6 flex max-w-sm" data-testid="newsletter-form">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email for seasonal Glow tips"
                data-testid="newsletter-input"
                className="flex-1 bg-white/5 border border-white/10 rounded-l-full px-4 py-3 text-sm text-white placeholder:text-white/35 focus:outline-none focus:border-glow-purple"
              />
              <button type="submit" data-testid="newsletter-submit" className="glow-btn px-5 rounded-r-full text-white">
                <Send size={16} />
              </button>
            </form>
          </div>

          <div>
            <h4 className="font-heading font-semibold text-sm mb-4">Company</h4>
            <ul className="space-y-3 text-sm">
              <li><Link to="/about" className="text-white/55 hover:text-glow-soft transition-colors">About Us</Link></li>
              <li><Link to="/services" className="text-white/55 hover:text-glow-soft transition-colors">Services</Link></li>
              <li><Link to="/gallery" className="text-white/55 hover:text-glow-soft transition-colors">Before & After</Link></li>
              <li><Link to="/blog" className="text-white/55 hover:text-glow-soft transition-colors">Blog</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-heading font-semibold text-sm mb-4">Services</h4>
            <ul className="space-y-3 text-sm">
              {SERVICES.slice(0, 5).map((s) => (
                <li key={s.slug}>
                  <Link to={`/services/${s.slug}`} className="text-white/55 hover:text-glow-soft transition-colors">
                    {s.title.replace(" & Penthouse Glow", "").replace(" & Boardroom Cleanse", "")}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-heading font-semibold text-sm mb-4">Get In Touch</h4>
            <ul className="space-y-3 text-sm">
              <li><a href={`tel:${BRAND.phoneRaw}`} className="flex items-center gap-2 text-white/55 hover:text-glow-soft"><Phone size={15} /> {BRAND.phone}</a></li>
              <li><a href={`mailto:${BRAND.email}`} className="flex items-center gap-2 text-white/55 hover:text-glow-soft"><Mail size={15} /> {BRAND.email}</a></li>
              <li><a href={BRAND.instagram} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-white/55 hover:text-glow-soft"><Instagram size={15} /> @garwoodglow.ja</a></li>
              <li className="flex items-center gap-2 text-white/55"><MapPin size={15} /> Island-wide, Jamaica</li>
            </ul>
          </div>
        </div>

        <div className="mt-14 pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-white/40">
          <span>© {new Date().getFullYear()} {BRAND.name}. All rights reserved.</span>
          <div className="flex items-center gap-5">
            <Link to="/privacy" className="hover:text-white/70">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-white/70">Terms & Conditions</Link>
            <Link to="/admin/login" className="hover:text-white/70">Admin</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
