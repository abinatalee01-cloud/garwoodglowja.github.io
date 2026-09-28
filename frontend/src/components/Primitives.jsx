import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

export const Eyebrow = ({ children }) => (
  <span className="overline-label inline-flex items-center gap-2">
    <span className="h-px w-6 bg-glow-soft/60" /> {children}
  </span>
);

export const SectionHeading = ({ eyebrow, title, subtitle, center, light, testid }) => (
  <div className={`${center ? "text-center mx-auto" : ""} max-w-2xl mb-14`} data-testid={testid}>
    {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
    <h2 className={`font-heading text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight mt-4 ${light ? "text-[#0D0D11]" : "text-white"}`}>
      {title}
    </h2>
    {subtitle && (
      <p className={`mt-4 text-base leading-relaxed ${light ? "text-[#4a4a55]" : "text-white/55"}`}>{subtitle}</p>
    )}
  </div>
);

export const StatCounter = ({ value, suffix, label }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && !started) {
          setStarted(true);
          const duration = 1400;
          const start = performance.now();
          const tick = (now) => {
            const p = Math.min((now - start) / duration, 1);
            setCount(Math.floor(p * value));
            if (p < 1) requestAnimationFrame(tick);
            else setCount(value);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.4 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [value, started]);

  return (
    <div ref={ref} className="text-center" data-testid="stat-counter">
      <div className="font-heading text-4xl lg:text-5xl font-bold text-shimmer">
        {count}
        <span className="text-glow-soft">{suffix}</span>
      </div>
      <div className="mt-2 text-xs font-mono uppercase tracking-widest text-white/45">{label}</div>
    </div>
  );
};

export const Reveal = ({ children, delay = 0, className = "" }) => (
  <motion.div
    initial={{ opacity: 0, y: 24 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-60px" }}
    transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    className={className}
  >
    {children}
  </motion.div>
);
