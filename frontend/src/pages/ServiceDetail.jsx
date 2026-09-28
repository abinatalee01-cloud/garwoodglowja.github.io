import React from "react";
import { useParams, Link } from "react-router-dom";
import { Check, ArrowRight, Users, Sparkles } from "lucide-react";
import * as Icons from "lucide-react";
import PageHero from "@/components/PageHero";
import GlowJourney from "@/components/GlowJourney";
import { SectionHeading, Reveal, Eyebrow } from "@/components/Primitives";
import ServiceCard from "@/components/ServiceCard";
import { SERVICES, IMAGES } from "@/data/site";
import NotFound from "@/pages/NotFound";

const ServiceDetail = () => {
  const { slug } = useParams();
  const service = SERVICES.find((s) => s.slug === slug);
  if (!service) return <NotFound />;
  const Icon = Icons[service.icon] || Icons.Sparkles;
  const related = SERVICES.filter((s) => s.slug !== slug).slice(0, 3);

  return (
    <div data-testid="service-detail-page">
      <PageHero eyebrow="Service" title={service.title} subtitle={service.short} image={IMAGES[service.image]} />

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-5 lg:px-8 grid lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-12">
            <Reveal>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-11 w-11 rounded-xl glow-btn flex items-center justify-center text-white"><Icon size={20} /></div>
                <h2 className="font-heading text-2xl font-semibold">Service Overview</h2>
              </div>
              <p className="text-white/60 leading-relaxed">
                Our {service.title} is executed to The Glow Standard™ — a systematic, detail-obsessed process
                delivered by vetted, uniformed specialists. We never rush the work, and we finish every visit with a
                Glow Check™ audit and our Signature Glow™ finish.
              </p>
            </Reveal>

            <Reveal>
              <h3 className="font-heading text-xl font-semibold mb-5">What's Included</h3>
              <div className="grid sm:grid-cols-2 gap-3">
                {service.includes.map((inc, i) => (
                  <div key={i} className="flex items-start gap-3 glass-card rounded-2xl px-5 py-4">
                    <Check size={16} className="text-glow-soft mt-0.5 shrink-0" />
                    <span className="text-sm text-white/80">{inc}</span>
                  </div>
                ))}
              </div>
            </Reveal>

            <Reveal>
              <h3 className="font-heading text-xl font-semibold mb-5">Key Benefits</h3>
              <div className="space-y-3">
                {service.benefits.map((b, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <Sparkles size={16} className="text-glow-soft mt-1 shrink-0" />
                    <span className="text-white/70">{b}</span>
                  </div>
                ))}
              </div>
            </Reveal>

            <Reveal>
              <h3 className="font-heading text-xl font-semibold mb-5">Who This Is For</h3>
              <div className="flex flex-wrap gap-2.5">
                {service.forWho.map((w) => (
                  <span key={w} className="inline-flex items-center gap-2 glass-card px-4 py-2 rounded-full text-sm text-white/75">
                    <Users size={14} className="text-glow-soft" /> {w}
                  </span>
                ))}
              </div>
            </Reveal>
          </div>

          {/* Sticky CTA */}
          <div className="lg:sticky lg:top-28 h-fit">
            <div className="glass-card rounded-3xl p-7">
              <Eyebrow>Get Started</Eyebrow>
              <h3 className="font-heading text-xl font-semibold mt-3">Request this service</h3>
              <p className="text-sm text-white/55 mt-2">Pricing is tailored to your space. Send details and photos for a fast, free quote.</p>
              <div className="text-glow-soft font-mono text-sm mt-4 mb-5">Custom Quote</div>
              <Link to="/quote" state={{ recommended_package: service.slug }} data-testid="service-quote-cta" className="glow-btn w-full py-3.5 rounded-full text-white font-medium inline-flex items-center justify-center gap-2">
                Request Your Glow Quote™ <ArrowRight size={17} />
              </Link>
              <Link to="/ai-glow-guide" className="block text-center text-sm text-white/50 hover:text-glow-soft mt-4 transition-colors">
                Or ask the AI Glow Guide™
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-[#0D0D11] border-y border-white/10">
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <SectionHeading center eyebrow="The Process" title="How your Signature Glow™ unfolds" />
          <GlowJourney />
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <SectionHeading eyebrow="Keep Exploring" title="Related services" />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {related.map((s) => <ServiceCard key={s.slug} service={s} />)}
          </div>
        </div>
      </section>
    </div>
  );
};

export default ServiceDetail;
