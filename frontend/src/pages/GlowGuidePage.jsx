import React from "react";
import PageHero from "@/components/PageHero";
import AIGlowGuide from "@/components/AIGlowGuide";
import { IMAGES } from "@/data/site";

const GlowGuidePage = () => (
  <div data-testid="glow-guide-page">
    <PageHero
      eyebrow="AI-Powered Concierge"
      title="Meet your AI Glow Guide™"
      subtitle="Describe your property, cleaning needs and preferred schedule. In seconds, we'll recommend the ideal package, compare your options side-by-side, and explain exactly why."
      image={IMAGES.chefKitchen}
    />
    <section className="py-16">
      <div className="max-w-3xl mx-auto px-5 lg:px-8">
        <AIGlowGuide />
      </div>
    </section>
  </div>
);

export default GlowGuidePage;
