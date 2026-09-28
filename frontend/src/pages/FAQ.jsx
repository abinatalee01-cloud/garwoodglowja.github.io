import React, { useState } from "react";
import PageHero from "@/components/PageHero";
import { Reveal } from "@/components/Primitives";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { FAQ_CATEGORIES, IMAGES } from "@/data/site";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const FAQ = () => {
  const [active, setActive] = useState(FAQ_CATEGORIES[0].category);
  const cat = FAQ_CATEGORIES.find((c) => c.category === active);

  return (
    <div data-testid="faq-page">
      <PageHero
        eyebrow="Support"
        title="Frequently asked questions"
        subtitle="Everything you need to know about working with Garwood Glow JA. Still unsure? We're one message away."
        image={IMAGES.marbleMirrors}
      />
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-5 lg:px-8 grid lg:grid-cols-4 gap-10">
          <div className="lg:col-span-1">
            <div className="flex lg:flex-col gap-2 overflow-x-auto lg:sticky lg:top-28" data-testid="faq-categories">
              {FAQ_CATEGORIES.map((c) => (
                <button
                  key={c.category}
                  onClick={() => setActive(c.category)}
                  data-testid={`faq-cat-${c.category.toLowerCase().replace(/[^a-z]/g, "")}`}
                  className={`text-left whitespace-nowrap px-4 py-3 rounded-xl text-sm transition-all ${
                    active === c.category ? "glow-btn text-white" : "glass-card text-white/60 hover:text-white"
                  }`}
                >
                  {c.category}
                </button>
              ))}
            </div>
          </div>

          <div className="lg:col-span-3">
            <Reveal key={active}>
              <Accordion type="single" collapsible className="space-y-3">
                {cat.items.map((item, i) => (
                  <AccordionItem key={i} value={`item-${i}`} className="glass-card rounded-2xl px-5 border-white/10" data-testid={`faq-item-${i}`}>
                    <AccordionTrigger className="text-left text-white hover:no-underline py-4">{item.q}</AccordionTrigger>
                    <AccordionContent className="text-white/60 text-sm leading-relaxed pb-4">{item.a}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </Reveal>

            <div className="mt-10 glass-card rounded-3xl p-8 text-center">
              <h3 className="font-heading text-xl font-semibold">Still have questions?</h3>
              <Link to="/contact" data-testid="faq-contact-cta" className="glow-btn inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-white font-medium mt-5">
                Get in touch <ArrowRight size={17} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default FAQ;
