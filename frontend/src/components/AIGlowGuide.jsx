import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Check, ArrowRight, Loader2, Wand2, RefreshCw } from "lucide-react";
import { GUIDE_OPTIONS } from "@/data/site";
import api from "@/lib/api";

const OptionGrid = ({ options, value, onChange, multi, testid }) => (
  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5" data-testid={testid}>
    {options.map((o) => {
      const active = multi ? value.includes(o.value) : value === o.value;
      return (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          data-testid={`${testid}-${o.value}`}
          className={`text-left text-sm px-4 py-3 rounded-xl border transition-all duration-200 ${
            active
              ? "border-glow-purple bg-glow-purple/15 text-white shadow-[0_0_15px_rgba(139,47,201,0.3)]"
              : "border-white/10 bg-white/[0.03] text-white/65 hover:border-white/25 hover:text-white"
          }`}
        >
          {o.label}
        </button>
      );
    })}
  </div>
);

const PackageCard = ({ pkg, recommended, index }) => (
  <div
    className={`relative rounded-2xl p-6 flex flex-col ${
      recommended ? "border-2 border-glow-purple bg-glow-purple/[0.08] shadow-[0_0_30px_rgba(139,47,201,0.25)]" : "glass-card"
    }`}
    data-testid={`compare-card-${index}`}
  >
    {recommended && (
      <div className="absolute -top-3 left-6 text-[10px] font-mono uppercase tracking-widest glow-btn text-white px-3 py-1 rounded-full">
        Recommended
      </div>
    )}
    <h4 className="font-heading text-lg font-semibold text-white leading-snug mt-1">{pkg.title}</h4>
    <p className="text-sm text-white/50 mt-1.5 mb-4">{pkg.tagline}</p>
    <div className="text-glow-soft font-mono text-sm mb-4">Custom Quote</div>
    <ul className="space-y-2.5 flex-1">
      {pkg.includes.map((inc, i) => (
        <li key={i} className="flex items-start gap-2 text-sm text-white/70">
          <Check size={15} className="text-glow-soft mt-0.5 shrink-0" /> {inc}
        </li>
      ))}
    </ul>
  </div>
);

const AIGlowGuide = ({ compact = false }) => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    property_type: "villa",
    size: "1500-3500",
    urgency: "deep",
    priorities: ["Spa Bathrooms"],
    frequency: "one-time",
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const togglePriority = (v) =>
    setForm((f) => ({
      ...f,
      priorities: f.priorities.includes(v) ? f.priorities.filter((p) => p !== v) : [...f.priorities, v],
    }));

  const generate = async () => {
    setLoading(true);
    try {
      const { data } = await api.post("/glow-guide", form);
      setResult(data);
      setTimeout(() => document.getElementById("glow-result")?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const lockIn = () => {
    navigate("/quote", {
      state: {
        recommended_package: result.recommended.id,
        property_type: form.property_type,
        size: form.size,
        frequency: form.frequency,
      },
    });
  };

  return (
    <div data-testid="ai-glow-guide">
      <div className="glass-card rounded-3xl p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-xl glow-btn flex items-center justify-center text-white">
            <Wand2 size={18} />
          </div>
          <div>
            <h3 className="font-heading text-lg font-semibold text-white">AI Glow Guide™</h3>
            <p className="text-xs text-white/50">Tell us about your space — we'll match your perfect package.</p>
          </div>
        </div>

        <div className="space-y-5">
          <div>
            <label className="text-xs font-mono uppercase tracking-widest text-white/45 block mb-2.5">Property Type</label>
            <OptionGrid options={GUIDE_OPTIONS.property} value={form.property_type} onChange={(v) => set("property_type", v)} testid="guide-property" />
          </div>
          <div>
            <label className="text-xs font-mono uppercase tracking-widest text-white/45 block mb-2.5">Approx. Size</label>
            <OptionGrid options={GUIDE_OPTIONS.size} value={form.size} onChange={(v) => set("size", v)} testid="guide-size" />
          </div>
          <div>
            <label className="text-xs font-mono uppercase tracking-widest text-white/45 block mb-2.5">Condition & Urgency</label>
            <OptionGrid options={GUIDE_OPTIONS.urgency} value={form.urgency} onChange={(v) => set("urgency", v)} testid="guide-urgency" />
          </div>
          <div>
            <label className="text-xs font-mono uppercase tracking-widest text-white/45 block mb-2.5">Priority Zones (select any)</label>
            <OptionGrid options={GUIDE_OPTIONS.priorities} value={form.priorities} onChange={togglePriority} multi testid="guide-priorities" />
          </div>
          <div>
            <label className="text-xs font-mono uppercase tracking-widest text-white/45 block mb-2.5">Desired Frequency</label>
            <OptionGrid options={GUIDE_OPTIONS.frequency} value={form.frequency} onChange={(v) => set("frequency", v)} testid="guide-frequency" />
          </div>
        </div>

        <button
          onClick={generate}
          disabled={loading}
          data-testid="ai-glow-guide-submit"
          className="glow-btn w-full mt-7 py-4 rounded-full text-white font-medium inline-flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {loading ? <><Loader2 size={18} className="animate-spin" /> Consulting the Glow Guide…</> : <><Sparkles size={18} /> Generate Glow Plan & Comparison</>}
        </button>
      </div>

      <AnimatePresence>
        {result && (
          <motion.div
            id="glow-result"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 scroll-mt-28"
            data-testid="glow-guide-result"
          >
            <div className="glass-card rounded-3xl p-6 sm:p-8">
              <div className="flex flex-wrap items-center gap-4 justify-between mb-2">
                <span className="overline-label">Your Recommendation</span>
                <span className="text-sm font-mono px-3 py-1 rounded-full bg-glow-purple/20 text-glow-soft border border-glow-purple/40" data-testid="match-confidence">
                  {result.confidence}% Match
                </span>
              </div>
              <h3 className="font-heading text-2xl sm:text-3xl font-semibold text-white" data-testid="recommended-title">
                {result.recommended.title}
              </h3>

              {/* Reasoning */}
              <div className="mt-5 rounded-2xl bg-white/[0.03] border border-white/10 p-5" data-testid="glow-reasoning">
                <div className="flex items-center gap-2 text-glow-soft text-sm font-medium mb-2">
                  <Sparkles size={15} /> Why we recommended this
                </div>
                <p className="text-white/75 text-sm leading-relaxed">{result.reasoning}</p>
              </div>

              {/* Factors */}
              <div className="mt-6">
                <div className="text-xs font-mono uppercase tracking-widest text-white/45 mb-3">How your answers shaped this</div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3" data-testid="glow-factors">
                  {result.factors.map((f, i) => (
                    <div key={i} className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                      <div className="text-xs text-white/40">{f.label}</div>
                      <div className="text-sm text-white font-medium mt-0.5">{f.value}</div>
                      <div className="text-xs text-white/50 mt-1.5 leading-relaxed">{f.detail}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Comparison */}
              <div className="mt-8">
                <div className="text-xs font-mono uppercase tracking-widest text-white/45 mb-4">Compare suitable packages</div>
                <div className="grid gap-4 md:grid-cols-3" data-testid="package-comparison">
                  {result.comparison.map((pkg, i) => (
                    <PackageCard key={pkg.id} pkg={pkg} recommended={i === 0} index={i} />
                  ))}
                </div>
              </div>

              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <button onClick={lockIn} data-testid="lock-in-quote" className="glow-btn flex-1 py-4 rounded-full text-white font-medium inline-flex items-center justify-center gap-2">
                  Lock In Glow Quote™ for this Package <ArrowRight size={18} />
                </button>
                <button onClick={() => setResult(null)} data-testid="glow-guide-reset" className="glass-card px-6 py-4 rounded-full text-white/80 inline-flex items-center justify-center gap-2 hover:text-white">
                  <RefreshCw size={16} /> Start Over
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AIGlowGuide;
