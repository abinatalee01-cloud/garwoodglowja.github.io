import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import PageHero from "@/components/PageHero";
import BeforeAfterSlider from "@/components/BeforeAfterSlider";
import { Reveal } from "@/components/Primitives";
import { GALLERY, IMAGES } from "@/data/site";

const CATEGORIES = ["All", "Kitchen", "Bathroom", "Living", "Commercial"];

const Gallery = () => {
  const [filter, setFilter] = useState("All");
  const [lightbox, setLightbox] = useState(null);
  const items = filter === "All" ? GALLERY : GALLERY.filter((g) => g.category === filter);

  return (
    <div data-testid="gallery-page">
      <PageHero
        eyebrow="Before & After"
        title="The Glow difference, revealed"
        subtitle="Drag any slider to reveal the transformation. Real spaces, real results — with room for unlimited additions as we grow."
        image={IMAGES.marbleBathroom}
      />

      <section className="py-14">
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <div className="flex flex-wrap gap-2.5 mb-10" data-testid="gallery-filters">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setFilter(c)}
                data-testid={`filter-${c.toLowerCase()}`}
                className={`px-5 py-2.5 rounded-full text-sm transition-all ${
                  filter === c ? "glow-btn text-white" : "glass-card text-white/60 hover:text-white"
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          <div className="columns-1 md:columns-2 gap-6 [&>*]:mb-6" data-testid="gallery-grid">
            {items.map((g, i) => (
              <Reveal key={g.id} delay={(i % 3) * 0.06}>
                <div className="break-inside-avoid">
                  <BeforeAfterSlider before={IMAGES[g.before]} after={IMAGES[g.after]} label={g.title} testid={`gallery-item-${g.id}`} />
                  <button
                    onClick={() => setLightbox(g)}
                    data-testid={`gallery-expand-${g.id}`}
                    className="mt-3 text-sm text-white/50 hover:text-glow-soft transition-colors"
                  >
                    {g.category} · View full result
                  </button>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-sm flex items-center justify-center p-5"
            onClick={() => setLightbox(null)}
            data-testid="gallery-lightbox"
          >
            <button className="absolute top-6 right-6 text-white/70 hover:text-white" data-testid="lightbox-close"><X size={28} /></button>
            <div className="w-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
              <BeforeAfterSlider before={IMAGES[lightbox.before]} after={IMAGES[lightbox.after]} label={lightbox.title} testid="lightbox-slider" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Gallery;
