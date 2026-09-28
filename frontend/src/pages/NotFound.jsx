import React from "react";
import { Link } from "react-router-dom";
import { Home, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

const NotFound = () => (
  <div className="min-h-screen flex items-center justify-center px-5 grain relative overflow-hidden" data-testid="not-found-page">
    <div className="absolute inset-0 ambient-glow" />
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative text-center max-w-lg">
      <div className="font-heading text-8xl sm:text-9xl font-bold text-shimmer">404</div>
      <div className="flex items-center justify-center gap-2 text-glow-soft mt-2">
        <Sparkles size={18} /> <span className="font-mono text-sm uppercase tracking-widest">Lost the glow</span>
      </div>
      <h1 className="font-heading text-2xl sm:text-3xl font-semibold mt-6">This page couldn't be found</h1>
      <p className="text-white/55 mt-3">The page you're looking for may have moved — but your spotless space is still just a click away.</p>
      <Link to="/" data-testid="notfound-home-cta" className="glow-btn inline-flex items-center gap-2 px-8 py-4 rounded-full text-white font-medium mt-8">
        <Home size={18} /> Back to Home
      </Link>
    </motion.div>
  </div>
);

export default NotFound;
