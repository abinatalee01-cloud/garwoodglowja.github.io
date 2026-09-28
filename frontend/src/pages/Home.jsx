import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import * as Icons from "lucide-react";
import { ChevronDown, ArrowRight, Sparkles, Star, Quote } from "lucide-react";
import { SectionHeading, Eyebrow, StatCounter, Reveal } from "@/components/Primitives";
import GlowJourney from "@/components/GlowJourney";
import ServiceCard from "@/components/ServiceCard";
import BeforeAfterSlider from "@/components/BeforeAfterSlider";
import AIGlowGuide from "@/components/AIGlowGuide";
import {
  Accordion, AccordionItem, AccordionTrigger, AccordionContent,
} from "@/components/ui/accordion";
import { BRAND, IMAGES, TRUST, SERVICES, STATS, TESTIMONIALS, FAQ_CATEGORIES } from "@/data/site";

const WHY = [
  { icon: "Gem", title: "Detail-Obsessed", text: "We focus on the smallest details others overlook — corners, tracks, trims and fixtures." },
  { icon: "HeartHandshake", title: "Genuine Care", text: "We treat every home and business as if it were our own, with respect and integrity." },
  { icon: "Clock", title: "Reliable & Punctual", text: "On time, every time. Consistency you can build a routine around." },
  { icon: "Leaf", title: "Eco-Conscious Power", text: "Hospital-grade sanitation using professional, environmentally responsible products." },
];

const Home = () => {
  return (
    <div data-testid="home-page">
      {/* HERO */}
      <section className="relative min-h-screen flex items-center overflow-hidden grain">
        <div className="absolute inset-0">
          <img src={IMAGES.heroResidence} alt="" className="w-full h-full object-cover opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0C]/70 via-[#0A0A0C]/85 to-[#0A0A0C]" />
          <div className="absolute inset-0 ambient-glow" />
        </div>

        <div className="relative max-w-7xl mx-auto px-5 lg:px-8 w-full pt-28 pb-20">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="max-w-3xl">
            <Eyebrow>Premium Cleaning · Island-Wide Jamaica</Eyebrow>
            <h1 className="font-heading text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mt-6 leading-[1.05]">
              Leaving Every Space <span className="text-shimmer italic font-light">Glowing.</span>
            </h1>
            <p className="text-lg text-white/60 mt-6 max-w-xl leading-relaxed">
              {BRAND.slogan} Garwood Glow JA delivers detail-obsessed, reliable cleaning for homes,
              offices and luxury villas — finished with our unmistakable Signature Glow™.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mt-9">
              <Link to="/quote" data-testid="hero-quote-cta" className="glow-btn px-8 py-4 rounded-full text-white font-medium inline-flex items-center justify-center gap-2">
                <Sparkles size={18} /> Request Your Glow Quote™
              </Link>
              <Link to="/ai-glow-guide" data-testid="hero-ai-cta" className="glass-card px-8 py-4 rounded-full text-white font-medium inline-flex items-center justify-center gap-2 hover:border-glow-purple/50 transition-colors">
                Consult AI Glow Guide™ <ArrowRight size={18} />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mt-16 max-w-2xl">
              {STATS.map((s) => (
                <StatCounter key={s.label} {...s} />
              ))}
            </div>
          </motion.div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/40 animate-bounce">
          <ChevronDown size={26} />
        </div>
      </section>

      {/* TRUST STRIP */}
      <section className="py-16 border-y border-white/10 bg-[#0D0D11]" data-testid="trust-section">
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {TRUST.map((t, i) => {
              const Icon = Icons[t.icon] || Icons.ShieldCheck;
              return (
                <Reveal key={t.label} delay={i * 0.05}>
                  <div className="text-center px-2">
                    <div className="mx-auto h-12 w-12 rounded-2xl glass-card flex items-center justify-center text-glow-soft mb-3">
                      <Icon size={22} />
                    </div>
                    <div className="text-sm font-semibold text-white">{t.label}</div>
                    <div className="text-xs text-white/45 mt-1 leading-snug">{t.note}</div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* WHY CHOOSE US */}
      <section className="py-24 relative" data-testid="why-section">
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <SectionHeading eyebrow="Why Garwood Glow JA" title="Trust you can feel the moment we arrive" subtitle="We're not the cheapest — we're the most careful. Here's what a premium standard actually means." />
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {WHY.map((w, i) => {
              const Icon = Icons[w.icon] || Icons.Gem;
              return (
                <Reveal key={w.title} delay={i * 0.08}>
                  <div className="glass-card rounded-3xl p-7 h-full hover:border-glow-purple/50 hover:-translate-y-1 transition-all duration-300">
                    <div className="h-12 w-12 rounded-2xl glow-btn flex items-center justify-center text-white mb-5">
                      <Icon size={22} />
                    </div>
                    <h3 className="font-heading text-lg font-semibold text-white">{w.title}</h3>
                    <p className="text-sm text-white/55 mt-2 leading-relaxed">{w.text}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* SIGNATURE GLOW JOURNEY */}
      <section className="py-24 bg-[#0D0D11] border-y border-white/10" data-testid="journey-section">
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <SectionHeading center eyebrow="The Signature Glow™" title="Every service follows the same journey" subtitle="From first inquiry to the final fresh finish — a systematic process, every single time." />
          <GlowJourney />
        </div>
      </section>

      {/* FEATURED SERVICES */}
      <section className="py-24" data-testid="services-preview">
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-6 mb-12">
            <div className="max-w-xl">
              <Eyebrow>What We Do</Eyebrow>
              <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight mt-4">Cleaning, tailored to your space</h2>
            </div>
            <Link to="/services" data-testid="view-all-services" className="text-sm text-glow-soft font-medium inline-flex items-center gap-1.5 hover:gap-2.5 transition-all">
              View all services <ArrowRight size={16} />
            </Link>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {SERVICES.slice(0, 3).map((s, i) => (
              <Reveal key={s.slug} delay={i * 0.08}><ServiceCard service={s} /></Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* BEFORE & AFTER */}
      <section className="py-24 bg-[#0D0D11] border-y border-white/10" data-testid="before-after-preview">
        <div className="max-w-6xl mx-auto px-5 lg:px-8">
          <SectionHeading center eyebrow="Before & After" title="See the Glow difference" subtitle="Drag the handle to reveal the transformation. Every result is real, detail-obsessed work." />
          <BeforeAfterSlider before={IMAGES.chefKitchen} after={IMAGES.woodKitchen} label="Chef's Kitchen Revival" testid="home-before-after" />
          <div className="text-center mt-8">
            <Link to="/gallery" data-testid="view-gallery" className="glass-card inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-white font-medium hover:border-glow-purple/50 transition-colors">
              Explore the full gallery <ArrowRight size={17} />
            </Link>
          </div>
        </div>
      </section>

      {/* AI GLOW GUIDE TEASER */}
      <section className="py-24" data-testid="home-ai-guide">
        <div className="max-w-3xl mx-auto px-5 lg:px-8">
          <SectionHeading center eyebrow="AI-Powered" title="Not sure which service you need?" subtitle="Answer a few quick questions and our AI Glow Guide™ recommends your perfect package — with a side-by-side comparison and the reasoning behind it." />
          <AIGlowGuide compact />
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-24 bg-[#0D0D11] border-y border-white/10" data-testid="testimonials-section">
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <SectionHeading center eyebrow="Client Love" title="Trusted across Jamaica" />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {TESTIMONIALS.map((t, i) => (
              <Reveal key={t.name} delay={i * 0.08}>
                <div className="glass-card rounded-3xl p-6 h-full flex flex-col" data-testid={`testimonial-${i}`}>
                  <Quote size={26} className="text-glow-purple/60 mb-3" />
                  <div className="flex gap-0.5 mb-3">
                    {Array.from({ length: t.rating }).map((_, s) => (
                      <Star key={s} size={14} className="fill-glow-soft text-glow-soft" />
                    ))}
                  </div>
                  <p className="text-sm text-white/70 leading-relaxed flex-1">"{t.quote}"</p>
                  <div className="mt-5 flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full glow-btn flex items-center justify-center text-white text-sm font-semibold">
                      {t.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white">{t.name}</div>
                      <div className="text-xs text-white/45">{t.role}</div>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ PREVIEW */}
      <section className="py-24" data-testid="faq-preview">
        <div className="max-w-3xl mx-auto px-5 lg:px-8">
          <SectionHeading center eyebrow="Questions?" title="Frequently asked" />
          <Accordion type="single" collapsible className="space-y-3">
            {FAQ_CATEGORIES.slice(0, 3).flatMap((c) => c.items).slice(0, 5).map((item, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="glass-card rounded-2xl px-5 border-white/10" data-testid={`faq-preview-${i}`}>
                <AccordionTrigger className="text-left text-white hover:no-underline py-4">{item.q}</AccordionTrigger>
                <AccordionContent className="text-white/60 text-sm leading-relaxed pb-4">{item.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          <div className="text-center mt-8">
            <Link to="/faq" data-testid="view-all-faq" className="text-sm text-glow-soft font-medium inline-flex items-center gap-1.5 hover:gap-2.5 transition-all">
              See all questions <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-24" data-testid="final-cta">
        <div className="max-w-5xl mx-auto px-5 lg:px-8">
          <div className="relative rounded-[2.5rem] overflow-hidden glass-card p-10 sm:p-16 text-center grain">
            <div className="absolute inset-0 ambient-glow" />
            <div className="relative">
              <Eyebrow>Let's Make Your Space Glow</Eyebrow>
              <h2 className="font-heading text-3xl sm:text-5xl font-semibold tracking-tight mt-5 max-w-2xl mx-auto leading-tight">
                Ready for a space that's noticeably cleaner and fresher?
              </h2>
              <p className="text-white/60 mt-5 max-w-xl mx-auto">Free, no-obligation quotes. Backed by our 24-hour satisfaction guarantee.</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center mt-9">
                <Link to="/quote" data-testid="cta-quote" className="glow-btn px-8 py-4 rounded-full text-white font-medium inline-flex items-center justify-center gap-2">
                  <Sparkles size={18} /> Get Your Free Glow Quote™
                </Link>
                <Link to="/contact" data-testid="cta-contact" className="glass-card px-8 py-4 rounded-full text-white font-medium hover:border-glow-purple/50 transition-colors">
                  Talk to us
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
