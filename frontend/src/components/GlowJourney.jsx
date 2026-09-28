import React, { useState } from "react";
import { motion } from "framer-motion";
import { FileText, ClipboardList, Sparkles, ShieldCheck, Wind } from "lucide-react";
import { JOURNEY } from "@/data/site";

const ICONS = [FileText, ClipboardList, Sparkles, ShieldCheck, Wind];

const GlowJourney = () => {
  const [active, setActive] = useState(0);
  const current = JOURNEY[active];
  const CurrentIcon = ICONS[active];

  return (
    <div data-testid="glow-journey">
      <div className="relative flex flex-col md:flex-row md:items-center gap-2 mb-10">
        <div className="absolute hidden md:block top-6 left-0 right-0 h-px bg-white/10" />
        {JOURNEY.map((step, i) => {
          const Icon = ICONS[i];
          const isActive = i === active;
          return (
            <button
              key={step.step}
              onClick={() => setActive(i)}
              data-testid={`journey-step-${step.step}`}
              className="relative flex-1 flex md:flex-col items-center md:text-center gap-3 md:gap-2 group"
            >
              <div
                className={`h-12 w-12 rounded-full flex items-center justify-center border transition-all duration-300 z-10 ${
                  isActive
                    ? "glow-btn text-white border-transparent scale-110"
                    : "bg-[#121217] border-white/15 text-white/50 group-hover:border-glow-purple/60 group-hover:text-glow-soft"
                }`}
              >
                <Icon size={19} />
              </div>
              <span className={`text-sm font-medium transition-colors ${isActive ? "text-white" : "text-white/50"}`}>
                {step.name}
              </span>
            </button>
          );
        })}
      </div>

      <motion.div
        key={active}
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="glass-card rounded-3xl p-8 flex flex-col md:flex-row gap-6 items-start"
      >
        <div className="h-14 w-14 rounded-2xl glow-btn flex items-center justify-center text-white shrink-0">
          <CurrentIcon size={24} />
        </div>
        <div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-glow-soft text-sm">0{current.step}</span>
            <span className="overline-label">{current.tagline}</span>
          </div>
          <h3 className="font-heading text-2xl font-semibold text-white mt-2">{current.name}</h3>
          <p className="text-white/60 mt-3 leading-relaxed max-w-2xl">{current.description}</p>
        </div>
      </motion.div>
    </div>
  );
};

export default GlowJourney;
