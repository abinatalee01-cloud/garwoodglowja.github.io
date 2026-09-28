import React from "react";
import { Link } from "react-router-dom";
import { Check, Sparkles, ArrowRight } from "lucide-react";
import PageHero from "@/components/PageHero";
import GlowJourney from "@/components/GlowJourney";
import { SectionHeading, Reveal, Eyebrow } from "@/components/Primitives";
import { IMAGES, GLOW_STANDARD } from "@/data/site";

const VALUES = ["Professionalism", "Integrity", "Reliability", "Respect", "Attention to Detail", "Consistency", "Customer Care", "Continuous Improvement"];

const TIMELINE = [
  { year: "The Beginning", text: "Founded on a simple belief — that cleaning done with genuine care and relentless attention to detail transforms how a space feels." },
  { year: "The Standard", text: "We codified everything into The Glow Standard™ — a repeatable promise of quality clients can rely on, every single visit." },
  { year: "Island-Wide", text: "From Kingston to Montego Bay to Ocho Rios, Garwood Glow JA now serves homes, offices and luxury villas across Jamaica." },
  { year: "The Future", text: "Building toward customer portals, recurring plans and a signature experience that scales without ever losing the personal touch." },
];

const About = () => (
  <div data-testid="about-page">
    <PageHero
      eyebrow="Our Story"
      title="Care you can trust, cleanliness you can see"
      subtitle="Garwood Glow JA is a premium cleaning service built on professionalism, reliability and a genuine obsession with detail."
      image={IMAGES.estateLivingRoom}
    />

    {/* Story + Mission/Vision */}
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-5 lg:px-8 grid lg:grid-cols-2 gap-12 items-start">
        <Reveal>
          <Eyebrow>The Company</Eyebrow>
          <h2 className="font-heading text-3xl font-semibold mt-4">More than clean — noticeably fresher</h2>
          <p className="text-white/60 mt-5 leading-relaxed">
            We're not the cheapest cleaning company, and we never set out to be. We're the one you invite into your
            home and business with complete confidence. Every interaction is designed to reinforce trust — from the
            way we arrive to the signature fresh scent we leave behind.
          </p>
          <p className="text-white/60 mt-4 leading-relaxed">
            Our people follow The Glow Standard™ on every job, so the result is consistent, dependable and always a
            little better than expected.
          </p>
        </Reveal>
        <div className="grid gap-5">
          <Reveal delay={0.1}>
            <div className="glass-card rounded-3xl p-7">
              <div className="overline-label">Our Mission</div>
              <p className="text-white/70 mt-3 leading-relaxed">
                To provide exceptional residential and commercial cleaning across Jamaica — creating healthier, more
                comfortable spaces through attention to detail, professionalism, reliability and genuine care.
              </p>
            </div>
          </Reveal>
          <Reveal delay={0.2}>
            <div className="glass-card rounded-3xl p-7">
              <div className="overline-label">Our Vision</div>
              <p className="text-white/70 mt-3 leading-relaxed">
                To become Jamaica's most trusted and recognized cleaning company — known for exceptional quality,
                outstanding service, and a signature experience that leaves every property glowing.
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>

    {/* Core Values */}
    <section className="py-20 bg-[#0D0D11] border-y border-white/10">
      <div className="max-w-7xl mx-auto px-5 lg:px-8">
        <SectionHeading center eyebrow="What We Stand For" title="Core values" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {VALUES.map((v, i) => (
            <Reveal key={v} delay={i * 0.05}>
              <div className="glass-card rounded-2xl p-6 text-center hover:border-glow-purple/50 transition-colors">
                <Sparkles size={20} className="text-glow-soft mx-auto mb-3" />
                <div className="text-sm font-medium text-white">{v}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>

    {/* Glow Standard */}
    <section className="py-20">
      <div className="max-w-5xl mx-auto px-5 lg:px-8">
        <SectionHeading center eyebrow="Our Promise" title="The Glow Standard™" subtitle="The benchmark every member of our team follows, without exception." />
        <div className="grid gap-3 sm:grid-cols-2">
          {GLOW_STANDARD.map((s, i) => (
            <Reveal key={i} delay={i * 0.04}>
              <div className="flex items-center gap-3 glass-card rounded-2xl px-5 py-4">
                <div className="h-7 w-7 rounded-full glow-btn flex items-center justify-center text-white shrink-0">
                  <Check size={14} />
                </div>
                <span className="text-sm text-white/80">{s}</span>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>

    {/* Journey */}
    <section className="py-20 bg-[#0D0D11] border-y border-white/10">
      <div className="max-w-7xl mx-auto px-5 lg:px-8">
        <SectionHeading center eyebrow="How It Works" title="The Signature Glow™ journey" />
        <GlowJourney />
      </div>
    </section>

    {/* Timeline */}
    <section className="py-20">
      <div className="max-w-4xl mx-auto px-5 lg:px-8">
        <SectionHeading center eyebrow="Our Path" title="Company timeline" />
        <div className="relative pl-8 border-l border-white/10 space-y-10">
          {TIMELINE.map((t, i) => (
            <Reveal key={i} delay={i * 0.08}>
              <div className="relative">
                <div className="absolute -left-[41px] top-1 h-4 w-4 rounded-full glow-btn" />
                <div className="overline-label">{t.year}</div>
                <p className="text-white/65 mt-2 leading-relaxed">{t.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>

    {/* Team placeholder */}
    <section className="py-20 bg-[#0D0D11] border-y border-white/10">
      <div className="max-w-7xl mx-auto px-5 lg:px-8">
        <SectionHeading center eyebrow="The People" title="Meet the Glow team" subtitle="Real photos of our vetted, uniformed specialists coming soon." />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {["Lead Concierge", "Glow Specialist", "Quality Auditor", "Villa Team Lead"].map((role, i) => (
            <Reveal key={role} delay={i * 0.06}>
              <div className="glass-card rounded-3xl overflow-hidden">
                <div className="aspect-square bg-gradient-to-br from-glow-purple/20 to-transparent flex items-center justify-center">
                  <span className="font-heading text-5xl text-white/15">GG</span>
                </div>
                <div className="p-4 text-center">
                  <div className="text-sm font-medium text-white">Team Member</div>
                  <div className="text-xs text-white/45 mt-0.5">{role}</div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>

    {/* CTA */}
    <section className="py-20">
      <div className="max-w-4xl mx-auto px-5 lg:px-8 text-center">
        <h2 className="font-heading text-3xl sm:text-4xl font-semibold">Ready to experience the Glow?</h2>
        <Link to="/quote" data-testid="about-cta" className="glow-btn inline-flex items-center gap-2 px-8 py-4 rounded-full text-white font-medium mt-8">
          Request Your Glow Quote™ <ArrowRight size={18} />
        </Link>
      </div>
    </section>
  </div>
);

export default About;
