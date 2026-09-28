import React from "react";
import { Link } from "react-router-dom";

export const Logo = ({ className = "", showText = true }) => (
  <Link to="/" className={`flex items-center gap-3 ${className}`} data-testid="brand-logo">
    <img
      src="https://customer-assets-4nw71qhi.emergentagent.net/job_40014bd6-c4ff-49cd-8fba-da31b350680a/artifacts/7hb17ty6_IMG_0157.webp"
      alt="Garwood Glow JA"
      className="h-11 w-11 rounded-lg object-cover ring-1 ring-white/10"
    />
    {showText && (
      <span className="font-heading text-lg font-semibold tracking-tight leading-none">
        Garwood <span className="text-glow-soft">Glow</span>
        <span className="block text-[10px] font-mono tracking-[0.3em] text-white/40 mt-0.5">JAMAICA</span>
      </span>
    )}
  </Link>
);

export default Logo;
