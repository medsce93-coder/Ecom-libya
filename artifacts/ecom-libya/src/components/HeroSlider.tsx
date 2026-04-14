import { useState, useEffect, useCallback } from "react";
import { Link } from "wouter";
import { Sparkles, ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";

const SLIDES = [
  {
    url: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1600&q=80",
    alt: "تسوق عائلي متنوع",
  },
  {
    url: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1600&q=80",
    alt: "أزياء وإكسسوارات",
  },
  {
    url: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1600&q=80",
    alt: "تجربة تسوق سهلة وآمنة",
  },
];

const INTERVAL = 5000;

export function HeroSlider() {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  const next = useCallback(() =>
    setCurrent((c) => (c + 1) % SLIDES.length), []);
  const prev = useCallback(() =>
    setCurrent((c) => (c - 1 + SLIDES.length) % SLIDES.length), []);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(next, INTERVAL);
    return () => clearInterval(id);
  }, [paused, next]);

  return (
    <section
      className="relative overflow-hidden text-white"
      style={{ minHeight: "clamp(480px, 60vh, 700px)" }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* ── Slides (crossfade) ── */}
      {SLIDES.map((slide, i) => (
        <div
          key={slide.url}
          aria-hidden={i !== current}
          className="absolute inset-0 transition-opacity duration-1000"
          style={{ opacity: i === current ? 1 : 0 }}
        >
          <img
            src={slide.url}
            alt={slide.alt}
            loading={i === 0 ? "eager" : "lazy"}
            className="w-full h-full object-cover object-center"
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
          />
        </div>
      ))}

      {/* ── Dark gradient overlay — ensures text is always legible ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.45) 50%, rgba(0,0,0,0.70) 100%)",
        }}
      />

      {/* ── Blurred colour blobs (keep visual richness) ── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -bottom-40 -right-20 w-80 h-80 rounded-full bg-blue-400/10 blur-3xl" />
      </div>

      {/* ── Hero content ── */}
      <div className="relative z-10 container mx-auto px-4 py-20 md:py-32 text-center flex flex-col items-center">
        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white/90 text-sm font-semibold px-4 py-1.5 rounded-full mb-6">
          <Sparkles className="h-3.5 w-3.5 text-amber-400" />
          أكثر من 280 منتج متاح الآن
        </div>

        <h1
          className="text-4xl md:text-6xl lg:text-7xl font-extrabold mb-6 leading-tight tracking-tight"
          style={{ textShadow: "0 2px 16px rgba(0,0,0,0.6)" }}
        >
          تسوّق بكل ثقة من
          <br />
          <span className="text-blue-400">جودة ماركت</span>
        </h1>

        <p
          className="text-lg md:text-xl text-slate-200 mb-10 max-w-2xl mx-auto leading-relaxed"
          style={{ textShadow: "0 1px 8px rgba(0,0,0,0.5)" }}
        >
          الوجهة الأولى للتسوق العائلي في ليبيا — جودة مضمونة، توصيل سريع لجميع المدن، والدفع عند الاستلام.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 bg-primary hover:bg-blue-600 text-white font-bold px-8 py-3.5 rounded-full transition-colors shadow-lg shadow-primary/30 text-lg"
          >
            تسوّق الآن
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <a
            href="https://wa.me/212765074750"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-8 py-3.5 rounded-full transition-colors border border-white/20 backdrop-blur-sm"
          >
            تواصل معنا
          </a>
        </div>

        {/* Stats */}
        <div className="mt-14 grid grid-cols-3 gap-6 max-w-lg mx-auto border-t border-white/20 pt-10">
          {[
            { label: "منتج متاح", value: "286+" },
            { label: "مدينة ليبية", value: "18+" },
            { label: "عميل سعيد", value: "5000+" },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <div
                className="text-2xl md:text-3xl font-extrabold text-white"
                style={{ textShadow: "0 1px 8px rgba(0,0,0,0.4)" }}
              >
                {s.value}
              </div>
              <div className="text-xs text-slate-300 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Prev / Next arrows ── */}
      <button
        onClick={prev}
        aria-label="السابق"
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/30 hover:bg-black/50 flex items-center justify-center transition-colors backdrop-blur-sm"
      >
        <ChevronRight className="h-5 w-5 text-white" />
      </button>
      <button
        onClick={next}
        aria-label="التالي"
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/30 hover:bg-black/50 flex items-center justify-center transition-colors backdrop-blur-sm"
      >
        <ChevronLeft className="h-5 w-5 text-white" />
      </button>

      {/* ── Dot indicators ── */}
      <div className="absolute bottom-5 left-0 right-0 z-20 flex justify-center gap-2">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            aria-label={`الشريحة ${i + 1}`}
            className={`transition-all duration-300 rounded-full ${
              i === current
                ? "w-6 h-2 bg-white"
                : "w-2 h-2 bg-white/50 hover:bg-white/80"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
