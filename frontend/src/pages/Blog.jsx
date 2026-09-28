import React, { useState } from "react";
import { Search, ArrowUpRight } from "lucide-react";
import { toast } from "sonner";
import PageHero from "@/components/PageHero";
import { Reveal, Eyebrow } from "@/components/Primitives";
import { BLOG, IMAGES } from "@/data/site";
import api from "@/lib/api";

const Blog = () => {
  const [q, setQ] = useState("");
  const [email, setEmail] = useState("");
  const featured = BLOG.find((b) => b.featured);
  const posts = BLOG.filter((b) => !b.featured).filter((b) => b.title.toLowerCase().includes(q.toLowerCase()));

  const subscribe = async (e) => {
    e.preventDefault();
    try { await api.post("/newsletter", { email }); toast.success("Subscribed — Glow tips incoming!"); setEmail(""); }
    catch { toast.error("Please try again."); }
  };

  return (
    <div data-testid="blog-page">
      <PageHero eyebrow="The Glow Journal" title="Cleaning tips & inside stories" subtitle="Insights on premium cleaning, hosting, wellness and the craft behind The Glow Standard™." image={IMAGES.woodKitchen} />

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <div className="relative max-w-md mb-12">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
            <input
              value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search articles…"
              data-testid="blog-search"
              className="w-full glass-card rounded-full pl-11 pr-4 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-glow-purple"
            />
          </div>

          {featured && !q && (
            <Reveal>
              <div className="grid lg:grid-cols-2 gap-8 items-center glass-card rounded-3xl overflow-hidden mb-14" data-testid="blog-featured">
                <div className="h-72 lg:h-full overflow-hidden">
                  <img src={IMAGES[featured.image]} alt={featured.title} className="w-full h-full object-cover" />
                </div>
                <div className="p-8">
                  <Eyebrow>Featured · {featured.category}</Eyebrow>
                  <h2 className="font-heading text-2xl sm:text-3xl font-semibold mt-4">{featured.title}</h2>
                  <p className="text-white/60 mt-4 leading-relaxed">{featured.excerpt}</p>
                  <div className="mt-6 inline-flex items-center gap-1.5 text-glow-soft text-sm font-medium">Read article <ArrowUpRight size={16} /></div>
                </div>
              </div>
            </Reveal>
          )}

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3" data-testid="blog-grid">
            {posts.map((p, i) => (
              <Reveal key={p.slug} delay={i * 0.06}>
                <div className="glass-card rounded-3xl overflow-hidden group cursor-pointer hover:border-glow-purple/50 transition-colors h-full" data-testid={`blog-post-${p.slug}`}>
                  <div className="h-48 overflow-hidden">
                    <img src={IMAGES[p.image]} alt={p.title} loading="lazy" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-3 text-xs text-white/45">
                      <span className="text-glow-soft">{p.category}</span> · <span>{p.date}</span>
                    </div>
                    <h3 className="font-heading text-lg font-semibold mt-2 group-hover:text-glow-soft transition-colors">{p.title}</h3>
                    <p className="text-sm text-white/55 mt-2 leading-relaxed">{p.excerpt}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          <div className="mt-16 glass-card rounded-3xl p-10 text-center grain relative overflow-hidden">
            <div className="absolute inset-0 ambient-glow" />
            <div className="relative">
              <h3 className="font-heading text-2xl font-semibold">Get seasonal Glow tips</h3>
              <p className="text-white/55 mt-2">Join our newsletter — no spam, just genuinely useful cleaning wisdom.</p>
              <form onSubmit={subscribe} className="mt-6 flex max-w-md mx-auto" data-testid="blog-newsletter">
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Your email" className="flex-1 bg-white/5 border border-white/10 rounded-l-full px-4 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-glow-purple" />
                <button type="submit" className="glow-btn px-6 rounded-r-full text-white font-medium text-sm">Subscribe</button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Blog;
