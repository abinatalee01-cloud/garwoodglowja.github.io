import React from "react";
import PageHero from "@/components/PageHero";

const SECTIONS = [
  { h: "Services", p: "Garwood Glow JA provides residential and commercial cleaning services across Jamaica. All services are delivered to The Glow Standard™ by our vetted team." },
  { h: "Quotes & Pricing", p: "All quotes are custom and provided free of charge with no obligation. Final pricing is confirmed in writing before any work begins, based on the details and photos you provide." },
  { h: "Scheduling & Access", p: "You agree to provide safe, reasonable access to the property at the scheduled time. Missed appointments or lack of access may require rescheduling." },
  { h: "Satisfaction Guarantee", p: "If you are not completely satisfied with our work, contact us within 24 hours and we will return to address any areas of concern at no additional cost." },
  { h: "Liability", p: "We are fully insured. We take great care with your property; any concerns should be reported promptly so we can make things right." },
  { h: "Contact", p: "Questions about these terms? Email garwoodglowja@gmail.com." },
];

const Terms = () => (
  <div data-testid="terms-page">
    <PageHero eyebrow="Legal" title="Terms & Conditions" subtitle="The simple, fair terms of working with Garwood Glow JA." />
    <section className="py-16">
      <div className="max-w-3xl mx-auto px-5 lg:px-8 space-y-8">
        {SECTIONS.map((s) => (
          <div key={s.h}>
            <h2 className="font-heading text-xl font-semibold mb-2">{s.h}</h2>
            <p className="text-white/60 leading-relaxed">{s.p}</p>
          </div>
        ))}
        <p className="text-white/40 text-sm pt-4">Last updated: June 2026</p>
      </div>
    </section>
  </div>
);

export default Terms;
