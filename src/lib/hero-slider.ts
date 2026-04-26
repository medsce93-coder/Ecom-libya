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

export const DEFAULT_HERO_SLIDES: HeroSlide[] = [
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

export function cloneHeroSlides(input: HeroSlide[]): HeroSlide[] {
  return input.map((slide, index) => ({
    ...slide,
    id: String(slide.id || `slide-${index}`),
    imageUrl: String(slide.imageUrl || "").trim(),
    title: String(slide.title || "").trim(),
    subtitle: String(slide.subtitle || "").trim(),
    primaryCtaText: String(slide.primaryCtaText || "").trim(),
    primaryCtaHref: String(slide.primaryCtaHref || "").trim(),
    secondaryCtaText: String(slide.secondaryCtaText || "").trim(),
    secondaryCtaHref: String(slide.secondaryCtaHref || "").trim(),
    isActive: slide.isActive !== false,
    sortOrder: Number.isFinite(Number(slide.sortOrder)) ? Number(slide.sortOrder) : index,
  }));
}

export function getDefaultHeroSlides(): HeroSlide[] {
  return cloneHeroSlides(DEFAULT_HERO_SLIDES);
}

export function normalizeHeroSlides(input: unknown): HeroSlide[] {
  if (!Array.isArray(input)) return getDefaultHeroSlides();

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

  return slides.length ? slides : getDefaultHeroSlides();
}
