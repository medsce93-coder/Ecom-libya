import { useState, useEffect, useCallback } from "react";
import { Link } from "wouter";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";

const SLIDES = [
  {
    url: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1600&q=80",
    alt: "توصيل سريع لجميع مدن ليبيا",
  },
  {
    url: "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=1600&q=80",
    alt: "خدمة توصيل احترافية",
  },
  {
    url: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=1600&q=80",
    alt: "دفع آمن وسهل",
  },
];

const INTERVAL = 4500;

export function CTASlider() {
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
      className="relative overflow-hidden"
      style={{ minHeight: "clamp(280px, 35vh, 420px)" }}
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
            loading="lazy"
            className="w-full h-full object-cover object-center"
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
          />
        </div>
      ))}

      {/* ── Dark + primary-tinted overlay ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(135deg, rgba(29,78,216,0.82) 0%, rgba(15,23,42,0.80) 100%)",
        }}
      />

      {/* ── CTA content ── */}
      <div className="relative z-10 container mx-auto px-4 py-16 text-center flex flex-col items-center justify-center h-full text-white">
        <h2
          className="text-2xl md:text-3xl font-extrabold mb-3"
          style={{ textShadow: "0 2px 12px rgba(0,0,0,0.5)" }}
        >
          جاهز للتسوق؟
        </h2>
        <p
          className="text-blue-100 mb-8 max-w-md mx-auto"
          style={{ textShadow: "0 1px 6px rgba(0,0,0,0.4)" }}
        >
          تصفح أكثر من 286 منتج متنوع بأسعار تنافسية مع ضمان الجودة والتوصيل السريع.
        </p>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 bg-white text-primary font-bold px-8 py-3.5 rounded-full hover:bg-blue-50 transition-colors shadow-lg text-lg"
        >
          تصفح جميع المنتجات
          <ArrowLeft className="h-5 w-5" />
        </Link>
      </div>

      {/* ── Prev / Next arrows ── */}
      <button
        onClick={prev}
        aria-label="السابق"
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-black/25 hover:bg-black/45 flex items-center justify-center transition-colors backdrop-blur-sm"
      >
        <ChevronRight className="h-4 w-4 text-white" />
      </button>
      <button
        onClick={next}
        aria-label="التالي"
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-black/25 hover:bg-black/45 flex items-center justify-center transition-colors backdrop-blur-sm"
      >
        <ChevronLeft className="h-4 w-4 text-white" />
      </button>

      {/* ── Dot indicators ── */}
      <div className="absolute bottom-4 left-0 right-0 z-20 flex justify-center gap-2">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            aria-label={`الشريحة ${i + 1}`}
            className={`transition-all duration-300 rounded-full ${
              i === current
                ? "w-5 h-1.5 bg-white"
                : "w-1.5 h-1.5 bg-white/50 hover:bg-white/80"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
