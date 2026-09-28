import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import PageHero from "@/components/PageHero";
import ServiceCard from "@/components/ServiceCard";
import { Reveal } from "@/components/Primitives";
import { SERVICES, IMAGES } from "@/data/site";

const Services = () => (
  <div data-testid="services-page">
    <PageHero
      eyebrow="Our Services"
      title="A premium clean for every kind of space"
      subtitle="From luxury homes and villas to executive offices and post-construction sites — every service is delivered to The Glow Standard™."
      image={IMAGES.commercial}
    />
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-5 lg:px-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((s, i) => (
            <Reveal key={s.slug} delay={i * 0.06}><ServiceCard service={s} /></Reveal>
          ))}
        </div>

        <div className="mt-16 text-center glass-card rounded-3xl p-10">
          <h2 className="font-heading text-2xl sm:text-3xl font-semibold">Not sure which one fits?</h2>
          <p className="text-white/55 mt-3 max-w-lg mx-auto">Let our AI Glow Guide™ recommend the perfect package based on your space and schedule.</p>
          <Link to="/ai-glow-guide" data-testid="services-ai-cta" className="glow-btn inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-white font-medium mt-7">
            Consult AI Glow Guide™ <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </section>
  </div>
);

export default Services;
