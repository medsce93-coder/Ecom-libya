import { useState, useEffect, useCallback, type ReactNode } from "react";
import { Link } from "wouter";
import { Sparkles, ArrowLeft, ChevronLeft, ChevronRight, CheckCircle2 } from "lucide-react";
import { apiFetch } from "@/lib/api";

export type HeroSlide = {
  id: string;
  imageUrl: string;
  title: string;
  subtitle: string;
  primaryCtaText: string;
  primaryCtaHref: string;
  secondaryCtaText: string;
  secondaryCtaHref: string;
  isActive: boolean;
  sortOrder: number;
};

const DEFAULT_SLIDE_TEXT = {
  title: "تسوّق كل احتياجاتك من\nجودة ماركت",
  subtitle:
    "منتجات مختارة بعناية، توصيل سريع لجميع المدن الليبية، ودفع عند الاستلام بكل أمان.",
  primaryCtaText: "ابدأ التسوق الآن",
  primaryCtaHref: "/products",
  secondaryCtaText: "تصفح الأقسام",
  secondaryCtaHref: "#home-categories",
};

const DEFAULT_SLIDES: HeroSlide[] = [
  {
    id: "default-1",
    imageUrl: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1600&q=80",
    ...DEFAULT_SLIDE_TEXT,
    isActive: true,
    sortOrder: 0,
  },
  {
    id: "default-2",
    imageUrl: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1600&q=80",
    ...DEFAULT_SLIDE_TEXT,
    isActive: true,
    sortOrder: 1,
  },
  {
    id: "default-3",
    imageUrl: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1600&q=80",
    ...DEFAULT_SLIDE_TEXT,
    isActive: true,
    sortOrder: 2,
  },
];

const INTERVAL = 5000;

function normalizeSlides(input: unknown): HeroSlide[] {
  if (!Array.isArray(input)) return DEFAULT_SLIDES;

  const slides = input
    .map((slide, index) => {
      const item = slide && typeof slide === "object"
        ? (slide as Partial<HeroSlide>)
        : {};

      return {
        id: String(item.id || `slide-${index}`),
        imageUrl: String(item.imageUrl || "").trim(),
        title: String(item.title || "").trim(),
        subtitle: String(item.subtitle || "").trim(),
        primaryCtaText: String(item.primaryCtaText || "").trim(),
        primaryCtaHref: String(item.primaryCtaHref || "").trim(),
        secondaryCtaText: String(item.secondaryCtaText || "").trim(),
        secondaryCtaHref: String(item.secondaryCtaHref || "").trim(),
        isActive: item.isActive !== false,
        sortOrder: Number.isFinite(Number(item.sortOrder)) ? Number(item.sortOrder) : index,
      };
    })
    .filter((slide) => slide.isActive && slide.imageUrl)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  return slides.length ? slides : DEFAULT_SLIDES;
}

function CtaLink({
  href,
  className,
  children,
}: {
  href: string;
  className: string;
  children: ReactNode;
}) {
  const target = href || "/products";
  if (target.startsWith("#") || /^(https?:|mailto:|tel:)/i.test(target)) {
    return (
      <a href={target} className={className}>
        {children}
      </a>
    );
  }

  return (
    <Link href={target} className={className}>
      {children}
    </Link>
  );
}

export function HeroSlider() {
  const [slides, setSlides] = useState<HeroSlide[]>(DEFAULT_SLIDES);
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % slides.length);
  }, [slides.length]);

  const prev = useCallback(() => {
    setCurrent((c) => (c - 1 + slides.length) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    apiFetch<{ heroSlider?: HeroSlide[] }>("/api/settings", { auth: false })
      .then((data) => setSlides(normalizeSlides(data?.heroSlider)))
      .catch(() => setSlides(DEFAULT_SLIDES));
  }, []);

  useEffect(() => {
    if (current >= slides.length) setCurrent(0);
  }, [current, slides.length]);

  useEffect(() => {
    if (paused || slides.length <= 1) return;
    const id = setInterval(next, INTERVAL);
    return () => clearInterval(id);
  }, [paused, next, slides.length]);

  const slide = slides[current] ?? DEFAULT_SLIDES[0];

  return (
    <section
      className="relative overflow-hidden text-white"
      style={{ minHeight: "clamp(500px, 62vh, 720px)" }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {slides.map((item, i) => (
        <div
          key={item.id}
          aria-hidden={i !== current}
          className="absolute inset-0 transition-opacity duration-1000"
          style={{ opacity: i === current ? 1 : 0 }}
        >
          <img
            src={item.imageUrl}
            alt={item.title}
            loading={i === 0 ? "eager" : "lazy"}
            className="w-full h-full object-cover object-center"
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
          />
        </div>
      ))}

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(to left, rgba(2,6,23,0.78) 0%, rgba(2,6,23,0.58) 45%, rgba(2,6,23,0.46) 100%)",
        }}
      />

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-44 -left-36 w-96 h-96 rounded-full bg-primary/25 blur-3xl" />
        <div className="absolute -bottom-44 -right-16 w-80 h-80 rounded-full bg-cyan-400/15 blur-3xl" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-16 md:py-24 flex items-center min-h-[inherit]">
        <div className="w-full max-w-3xl py-2 text-center md:text-right">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white/95 text-sm font-semibold px-4 py-1.5 rounded-full mb-5">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            متجر موثوق للتسوق داخل ليبيا
          </div>

          <h1
            className="text-3xl md:text-5xl lg:text-6xl font-extrabold mb-4 leading-tight whitespace-pre-line"
            style={{ textShadow: "0 2px 16px rgba(0,0,0,0.6)" }}
          >
            {slide.title}
          </h1>

          <p
            className="text-base md:text-lg text-slate-200 mb-7 leading-relaxed max-w-2xl mx-auto md:mr-0"
            style={{ textShadow: "0 1px 8px rgba(0,0,0,0.5)" }}
          >
            {slide.subtitle}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-3 mb-7">
            {slide.primaryCtaText && (
              <CtaLink
                href={slide.primaryCtaHref}
                className="inline-flex items-center gap-2 bg-primary hover:bg-blue-600 text-white font-bold px-7 py-3.5 rounded-2xl transition-colors shadow-lg shadow-primary/30"
              >
                {slide.primaryCtaText}
                <ArrowLeft className="h-5 w-5" />
              </CtaLink>
            )}
            {slide.secondaryCtaText && (
              <CtaLink
                href={slide.secondaryCtaHref}
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-7 py-3.5 rounded-2xl transition-colors border border-white/20"
              >
                {slide.secondaryCtaText}
              </CtaLink>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm text-slate-200">
            {[
              "دفع عند الاستلام",
              "توصيل سريع داخل ليبيا",
              "جودة مضمونة",
            ].map((item) => (
              <div key={item} className="inline-flex items-center justify-center md:justify-start gap-2 rounded-xl bg-white/10 px-3 py-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {slides.length > 1 && (
        <>
          <button
            onClick={prev}
            aria-label="السابق"
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/35 hover:bg-black/55 flex items-center justify-center transition-colors backdrop-blur-sm"
          >
            <ChevronRight className="h-5 w-5 text-white" />
          </button>
          <button
            onClick={next}
            aria-label="التالي"
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/35 hover:bg-black/55 flex items-center justify-center transition-colors backdrop-blur-sm"
          >
            <ChevronLeft className="h-5 w-5 text-white" />
          </button>

          <div className="absolute bottom-5 left-0 right-0 z-20 flex justify-center gap-2">
            {slides.map((_, i) => (
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
        </>
      )}
    </section>
  );
}
