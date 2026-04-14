import { useParams, Link, useLocation } from "wouter";
import { useGetProduct, getGetProductQueryKey } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import {
  ShoppingCart, ArrowRight, Star,
  CheckCircle2, Shield, Truck, Banknote, Zap, Award, Clock
} from "lucide-react";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { useStore } from "@/lib/store-context";
import { useCurrency } from "@/lib/currency-context";
import { FlashSaleTimer } from "@/components/FlashSaleTimer";
import { SocialProofPopup } from "@/components/SocialProofPopup";

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   Persuasive features per category
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
const CATEGORY_FEATURES: Record<string, string[]> = {
  "Ø§Ù„Ø£Ø¬Ù‡Ø²Ø© Ø§Ù„Ø°ÙƒÙŠØ©": [
    "Ø£Ø¯Ø§Ø¡ Ù…ØªÙ‚Ø¯Ù… ÙŠÙˆÙØ± ÙˆÙ‚ØªÙƒ ÙˆÙŠØ±ÙØ¹ Ø¥Ù†ØªØ§Ø¬ÙŠØªÙƒ",
    "ØªØµÙ…ÙŠÙ… Ø£Ù†ÙŠÙ‚ Ù…Ù†Ø§Ø³Ø¨ Ù„Ø­ÙŠØ§ØªÙƒ Ø§Ù„ÙŠÙˆÙ…ÙŠØ©",
    "Ù…ØªÙˆØ§ÙÙ‚ Ù…Ø¹ Ø£Ø­Ø¯Ø« Ø§Ù„ØªØ·Ø¨ÙŠÙ‚Ø§Øª ÙˆØ§Ù„Ø£Ù†Ø¸Ù…Ø©",
    "Ø¶Ù…Ø§Ù† Ø§Ù„Ø¬ÙˆØ¯Ø© Ø§Ù„ÙƒØ§Ù…Ù„Ø© Ø¹Ù„Ù‰ ÙƒÙ„ Ù‚Ø·Ø¹Ø©",
  ],
  "Ø§Ù„Ø£Ø·ÙØ§Ù„": [
    "Ø¢Ù…Ù† 100% Ù„Ù„Ø£Ø·ÙØ§Ù„ â€” Ø®Ø§Ù„Ù Ù…Ù† Ø£ÙŠ Ù…ÙˆØ§Ø¯ Ø¶Ø§Ø±Ø©",
    "ÙŠØ­ÙØ² Ø§Ù„Ø¥Ø¨Ø¯Ø§Ø¹ ÙˆØ§Ù„Ø°ÙƒØ§Ø¡ Ù…Ù†Ø° Ø§Ù„ØµØºØ±",
    "Ù…ØªÙŠÙ† ÙˆÙŠØªØ­Ù…Ù„ Ø§Ù„Ù„Ø¹Ø¨ Ø§Ù„ÙŠÙˆÙ…ÙŠ Ø¨ÙƒÙ„ Ù‚ÙˆØ©",
    "Ù…Ø­Ø¨ÙˆØ¨ Ù…Ù† Ø§Ù„Ø£Ø·ÙØ§Ù„ ÙˆÙ…Ø±ÙŠØ­ Ù„Ø±Ø§Ø­Ø© Ø¨Ø§Ù„ Ø§Ù„Ø¢Ø¨Ø§Ø¡",
  ],
  "Ø§Ù„Ø¬Ù…Ø§Ù„ ÙˆØ§Ù„Ø¹Ù†Ø§ÙŠØ©": [
    "Ù†ØªØ§Ø¦Ø¬ Ù…Ù„Ù…ÙˆØ³Ø© ØªØ¸Ù‡Ø± Ù…Ù† Ø§Ù„Ø£Ø³Ø¨ÙˆØ¹ Ø§Ù„Ø£ÙˆÙ„",
    "ØªØ±ÙƒÙŠØ¨Ø© Ù…ÙˆØ«ÙˆÙ‚Ø© ÙˆÙ…Ø¬Ø±Ù‘Ø¨Ø© Ù…Ù† Ø¢Ù„Ø§Ù Ø§Ù„Ø¹Ù…ÙŠÙ„Ø§Øª",
    "Ù…Ù†Ø§Ø³Ø¨ Ù„Ù…Ù†Ø§Ø® Ù„ÙŠØ¨ÙŠØ§ Ø§Ù„Ø­Ø§Ø± ÙˆØ·Ø¨ÙŠØ¹Ø© Ø§Ù„Ø¨Ø´Ø±Ø© Ø§Ù„Ø¹Ø±Ø¨ÙŠØ©",
    "Ø³Ø¹Ø± Ø¹Ø§Ø¯Ù„ Ù„Ù…Ù†ØªØ¬ Ø¨Ø¬ÙˆØ¯Ø© Ø§Ù„Ø¹Ù„Ø§Ù…Ø§Øª Ø§Ù„Ø¹Ø§Ù„Ù…ÙŠØ©",
  ],
  "Ø§Ù„ØµØ­Ø© ÙˆØ§Ù„Ø¹Ù†Ø§ÙŠØ© Ø§Ù„Ø´Ø®ØµÙŠØ©": [
    "ÙŠØ¯Ø¹Ù… ØµØ­ØªÙƒ Ø§Ù„ÙŠÙˆÙ…ÙŠØ© Ø¨Ø´ÙƒÙ„ Ù…Ø­Ø³ÙˆØ³",
    "Ù…ÙƒÙˆÙ†Ø§Øª Ù…Ø®ØªØ§Ø±Ø© Ø¨Ø¹Ù†Ø§ÙŠØ© Ù„Ø¶Ù…Ø§Ù† Ø§Ù„Ø³Ù„Ø§Ù…Ø©",
    "Ù†ØªØ§Ø¦Ø¬ Ø³Ø±ÙŠØ¹Ø© ØªØ´Ø¹Ø± Ø¨Ù‡Ø§ Ù…Ù†Ø° Ø§Ù„Ø¨Ø¯Ø§ÙŠØ©",
    "Ù…Ù†Ø§Ø³Ø¨ Ù„Ù„Ø§Ø³ØªØ®Ø¯Ø§Ù… Ø§Ù„ÙŠÙˆÙ…ÙŠ Ù„ÙƒÙ„ Ø§Ù„ÙØ¦Ø§Øª",
  ],
  "Ø§Ù„Ø¹Ù†Ø§ÙŠØ© Ø¨Ø§Ù„Ø¨Ø´Ø±Ø©": [
    "ÙŠÙØ±Ø·Ù‘Ø¨ Ø§Ù„Ø¨Ø´Ø±Ø© ÙˆÙŠØ¬Ø¯Ø¯ Ù†Ø¶Ø§Ø±ØªÙ‡Ø§ Ø¨Ø¹Ù…Ù‚",
    "Ù…ØµÙ…Ù… Ø®ØµÙŠØµØ§Ù‹ Ù„Ù„Ù…Ù†Ø§Ø® Ø§Ù„Ø¬Ø§Ù ÙˆØ§Ù„Ø­Ø§Ø±",
    "ØªØ±ÙƒÙŠØ¨Ø© Ù„Ø·ÙŠÙØ© â€” Ø¢Ù…Ù†Ø© Ø­ØªÙ‰ Ù„Ù„Ø¨Ø´Ø±Ø© Ø§Ù„Ø­Ø³Ø§Ø³Ø©",
    "Ø¨Ø´Ø±Ø© Ø£ÙƒØ«Ø± Ø¥Ø´Ø±Ø§Ù‚Ø§Ù‹ ÙˆÙ†Ø¹ÙˆÙ…Ø© ÙÙŠ ÙˆÙ‚Øª Ù‚ÙŠØ§Ø³ÙŠ",
  ],
  "Ø§Ù„Ù…ÙƒÙ…Ù„Ø§Øª Ø§Ù„ØºØ°Ø§Ø¦ÙŠØ©": [
    "ØªØ±ÙƒÙŠØ² ÙØ§Ø¦Ù‚ Ø¨Ø£Ø¹Ù„Ù‰ Ù…Ø¹Ø§ÙŠÙŠØ± Ø§Ù„Ø¬ÙˆØ¯Ø© Ø§Ù„Ø¹Ø§Ù„Ù…ÙŠØ©",
    "ÙŠÙØ¹Ø²Ø² Ø·Ø§Ù‚ØªÙƒ ÙˆØ£Ø¯Ø§Ø¡Ùƒ Ø·ÙˆØ§Ù„ Ø§Ù„ÙŠÙˆÙ…",
    "Ù…Ø«Ø§Ù„ÙŠ Ù„Ù„Ø±ÙŠØ§Ø¶ÙŠÙŠÙ† ÙˆÙ„Ù…Ù† ÙŠØ¨Ø­Ø« Ø¹Ù† Ù†Ø´Ø§Ø· Ø­Ù‚ÙŠÙ‚ÙŠ",
    "Ù†ØªØ§Ø¦Ø¬ ÙˆØ§Ø¶Ø­Ø© ÙˆÙ…Ù„Ù…ÙˆØ³Ø© Ø®Ù„Ø§Ù„ Ø£Ø³Ø¨ÙˆØ¹ÙŠÙ† ÙÙ‚Ø·",
  ],
  "Ø§Ù„Ù…Ù†Ø²Ù„ ÙˆØ§Ù„Ù…Ø·Ø¨Ø®": [
    "ÙŠÙØ­ÙˆÙ‘Ù„ Ù…Ù†Ø²Ù„Ùƒ Ù„Ø¨ÙŠØ¦Ø© Ù…Ù†Ø¸Ù…Ø© ÙˆØ£Ù†ÙŠÙ‚Ø©",
    "Ø¬ÙˆØ¯Ø© Ù…ÙˆØ§Ø¯ Ø¹Ø§Ù„ÙŠØ© ØªØµÙ…Ø¯ Ø£Ù…Ø§Ù… Ø§Ù„Ø§Ø³ØªØ®Ø¯Ø§Ù… Ø§Ù„ÙŠÙˆÙ…ÙŠ",
    "ØªØµÙ…ÙŠÙ… Ø¹Ù…Ù„ÙŠ ÙŠÙˆÙØ± ÙˆÙ‚ØªÙƒ ÙˆØ¬Ù‡Ø¯Ùƒ ÙÙŠ Ø§Ù„Ø£Ø¹Ù…Ø§Ù„ Ø§Ù„Ù…Ù†Ø²Ù„ÙŠØ©",
    "Ù…Ø«Ø§Ù„ÙŠ Ù„Ù„Ù…Ø·Ø¨Ø® Ø§Ù„Ù„ÙŠØ¨ÙŠ ÙˆØ­ÙŠØ§Ø© Ø§Ù„Ø¹Ø§Ø¦Ù„Ø©",
  ],
  "Ù…Ù†ØªØ¬Ø§Øª Ù…ØªÙ†ÙˆØ¹Ø©": [
    "Ø¬ÙˆØ¯Ø© Ù…Ø¶Ù…ÙˆÙ†Ø© 100% Ø¹Ù„Ù‰ ÙƒÙ„ Ø·Ù„Ø¨",
    "Ù…Ù†ØªØ¬ Ù…Ø¬Ø±Ù‘Ø¨ ÙˆÙ…Ø­Ø¨ÙˆØ¨ Ù…Ù† Ø¢Ù„Ø§Ù Ø§Ù„Ø¹Ù…Ù„Ø§Ø¡ Ø§Ù„Ù„ÙŠØ¨ÙŠÙŠÙ†",
    "Ø§Ø®ØªÙŠØ§Ø± Ø°ÙƒÙŠ ÙŠÙØ­Ø³Ù‘Ù† Ø­ÙŠØ§ØªÙƒ Ø§Ù„ÙŠÙˆÙ…ÙŠØ© ÙØ¹Ù„Ø§Ù‹",
    "Ø³Ø¹Ø± Ø¹Ø§Ø¯Ù„ Ø¨Ø¯ÙˆÙ† Ù…Ø¨Ø§Ù„ØºØ© â€” Ù‚ÙŠÙ…Ø© Ø­Ù‚ÙŠÙ‚ÙŠØ© Ù„ÙƒÙ„ Ø¯ÙŠÙ†Ø§Ø±",
  ],
};

const DEFAULT_FEATURES = [
  "Ø¬ÙˆØ¯Ø© Ù…Ø¶Ù…ÙˆÙ†Ø© Ø¹Ù„Ù‰ ÙƒÙ„ Ø·Ù„Ø¨",
  "Ù…Ù†ØªØ¬ Ø£ØµÙ„ÙŠ Ø¨Ø³Ø¹Ø± Ù…Ù†Ø§Ø³Ø¨",
  "Ù…Ø¬Ø±Ù‘Ø¨ ÙˆÙ…Ø±Ø¶ÙŠ Ù…Ù† Ø§Ù„Ø¹Ù…Ù„Ø§Ø¡",
  "Ø¯Ø¹Ù… ÙƒØ§Ù…Ù„ Ø¨Ø¹Ø¯ Ø§Ù„Ø´Ø±Ø§Ø¡",
];

function getFeatures(categoryName: string | null | undefined): string[] {
  if (!categoryName) return DEFAULT_FEATURES;
  for (const [key, val] of Object.entries(CATEGORY_FEATURES)) {
    if (categoryName.includes(key) || key.includes(categoryName)) return val;
  }
  return DEFAULT_FEATURES;
}

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   Component
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [, setLocation] = useLocation();
  const [qtyTier, setQtyTier] = useState<1 | 2 | 3>(1);
  const { addToCart } = useStore();
  const { currency } = useCurrency();

  const { data: product, isLoading } = useGetProduct(slug!, {
    query: { enabled: !!slug, queryKey: getGetProductQueryKey(slug!) }
  });

  /* Scroll-triggered sticky bar â€” window.scroll is reliable regardless of
     when the product data arrives (IntersectionObserver would miss the ref
     being null on initial mount before the product loads). */
  const [stickyVisible, setStickyVisible] = useState(false);
  useEffect(() => {
    const onScroll = () => setStickyVisible(window.scrollY > 280);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll(); // run once on mount in case page is already scrolled
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const getBundlePrice = (p: typeof product) => {
    if (!p) return 0;
    const pq2 = (p as any).priceQty2 ? parseFloat(String((p as any).priceQty2)) : null;
    const pq3 = (p as any).priceQty3 ? parseFloat(String((p as any).priceQty3)) : null;
    if (qtyTier === 3 && pq3) return pq3;
    if (qtyTier === 2 && pq2) return pq2;
    return p.price;
  };

  const handleAddToCart = () => {
    if (!product) return;
    const bundleTotal = getBundlePrice(product);
    const perUnit = bundleTotal / qtyTier;
    for (let i = 0; i < qtyTier; i++) {
      addToCart({
        id: product.id,
        name: product.nameAr,
        price: perUnit,
        oldPrice: qtyTier === 1 ? (product.compareAtPrice ?? undefined) : undefined,
        image: product.imageUrl ?? "",
        description: product.descriptionAr ?? "",
        category: product.categoryName ?? "",
      });
    }
    toast.success(`âœ“ Ø£ÙØ¶ÙŠÙ Ø¥Ù„Ù‰ Ø§Ù„Ø³Ù„Ø© (${qtyTier} ${qtyTier === 1 ? "Ù‚Ø·Ø¹Ø©" : "Ù‚Ø·Ø¹"})`, { position: "top-center", duration: 2000 });
  };

  const handleOrderNow = () => {
    if (!product) return;
    const bundleTotal = getBundlePrice(product);
    const perUnit = bundleTotal / qtyTier;
    for (let i = 0; i < qtyTier; i++) {
      addToCart({
        id: product.id,
        name: product.nameAr,
        price: perUnit,
        oldPrice: qtyTier === 1 ? (product.compareAtPrice ?? undefined) : undefined,
        image: product.imageUrl ?? "",
        description: product.descriptionAr ?? "",
        category: product.categoryName ?? "",
      });
    }
    setLocation("/checkout");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /* Loading skeleton */
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 py-6">
        <div className="container mx-auto px-4">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 animate-pulse">
            <div className="flex flex-col lg:flex-row gap-8">
              <div className="w-full lg:w-1/2 aspect-square bg-slate-200 rounded-2xl" />
              <div className="w-full lg:w-1/2 space-y-4">
                <div className="h-4 bg-slate-200 rounded w-24" />
                <div className="h-8 bg-slate-200 rounded w-3/4" />
                <div className="h-10 bg-slate-200 rounded w-1/3" />
                <div className="h-24 bg-slate-200 rounded w-full" />
                <div className="h-12 bg-slate-200 rounded w-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* Not found */
  if (!product) {
    return (
      <div className="container mx-auto px-4 py-32 text-center">
        <div className="text-6xl mb-4">ðŸ”</div>
        <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Ø§Ù„Ù…Ù†ØªØ¬ ØºÙŠØ± Ù…ÙˆØ¬ÙˆØ¯</h2>
        <p className="text-slate-500 mb-6">Ù„Ù… Ù†Ø¹Ø«Ø± Ø¹Ù„Ù‰ Ù‡Ø°Ø§ Ø§Ù„Ù…Ù†ØªØ¬.</p>
        <Link href="/products" className="inline-flex items-center gap-2 bg-primary text-white font-bold px-6 py-3 rounded-full">
          <ArrowRight className="h-4 w-4" /> Ø§Ù„Ø¹ÙˆØ¯Ø© Ù„Ù„Ù…Ù†ØªØ¬Ø§Øª
        </Link>
      </div>
    );
  }

  const discount = product.compareAtPrice && product.compareAtPrice > product.price
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : null;
  const savings = product.compareAtPrice && product.compareAtPrice > product.price
    ? (product.compareAtPrice - product.price).toFixed(0)
    : null;

  const pq2 = (product as any).priceQty2 ? parseFloat(String((product as any).priceQty2)) : null;
  const pq3 = (product as any).priceQty3 ? parseFloat(String((product as any).priceQty3)) : null;
  const hasVolume = !!(pq2 || pq3);
  const selectedPrice = qtyTier === 3 && pq3 ? pq3 : qtyTier === 2 && pq2 ? pq2 : product.price;

  /* Stock scarcity â€” seeded by id so it stays stable across re-renders */
  const stockLeft = ((product.id.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % 5) + 3);

  const features = getFeatures(product.categoryName);
  const initials = product.nameAr?.substring(0, 2) || "ØŸ";
  const ratingNum = product.rating ? Number(product.rating) : 4.5;
  const reviewCount = Math.floor(ratingNum * 47 + 31);

  return (
    <>
      {/* â”€â”€ Page â”€â”€ */}
      <div className="bg-slate-50 min-h-screen py-5 md:py-8">
        {/* pb-28 on mobile = space so sticky bar never hides content */}
        <div className="container mx-auto px-3 sm:px-4 max-w-6xl pb-28 md:pb-0">

          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-xs md:text-sm text-slate-500 mb-4 md:mb-6 flex-wrap">
            <Link href="/" className="hover:text-primary transition-colors">Ø§Ù„Ø±Ø¦ÙŠØ³ÙŠØ©</Link>
            <span className="text-slate-300">/</span>
            <Link href="/products" className="hover:text-primary transition-colors">Ø§Ù„Ù…Ù†ØªØ¬Ø§Øª</Link>
            <span className="text-slate-300">/</span>
            <span className="text-slate-700 font-medium line-clamp-1 max-w-[160px] md:max-w-[220px]">{product.nameAr}</span>
          </div>

          {/* Main card */}
          <div className="bg-white rounded-2xl md:rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="flex flex-col lg:flex-row">

              {/* â”€â”€ Image Panel â”€â”€ */}
              <div className="w-full lg:w-[46%] bg-gradient-to-br from-slate-50 to-slate-100 relative flex items-center justify-center min-h-[280px] md:min-h-[400px] lg:min-h-[560px] p-6 md:p-10 border-b lg:border-b-0 lg:border-l border-slate-100">
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl?.startsWith("http") || product.imageUrl?.startsWith("/") ? product.imageUrl : `/${product.imageUrl}`}
                    alt={product.nameAr}
                    className="object-contain w-full h-full max-h-[260px] md:max-h-[380px] lg:max-h-[440px] drop-shadow-lg"
                    onError={(e) => {
                      const img = e.target as HTMLImageElement;
                      img.style.display = "none";
                      const fb = img.nextElementSibling as HTMLElement | null;
                      if (fb) fb.style.display = "flex";
                    }}
                  />
                ) : null}
                <div
                  className="w-full h-full items-center justify-center text-7xl md:text-8xl font-black text-slate-300 min-h-[200px] select-none"
                  style={{ display: product.imageUrl ? "none" : "flex" }}
                >
                  {initials}
                </div>

                {/* Badges */}
                <div className="absolute top-3 right-3 md:top-5 md:right-5 flex flex-col gap-1.5 md:gap-2">
                  {discount && (
                    <span className="bg-rose-500 text-white text-xs md:text-sm font-black px-2.5 py-1 md:px-3 md:py-1.5 rounded-full shadow-lg shadow-rose-200">
                      Ø®ØµÙ… {discount}%
                    </span>
                  )}
                  {(product as any).badge && (
                    <span className="bg-amber-500 text-white text-xs md:text-sm font-bold px-2.5 py-1 md:px-3 md:py-1.5 rounded-full shadow-lg shadow-amber-200">
                      {(product as any).badge}
                    </span>
                  )}
                </div>

                {/* Urgency pill */}
                <div className="absolute bottom-3 right-3 left-3 md:bottom-5 md:right-5 md:left-5">
                  <div className="bg-white/90 backdrop-blur-sm border border-slate-200 rounded-xl md:rounded-2xl px-3 py-2 md:px-4 md:py-2.5 flex items-center gap-2 shadow-sm">
                    <Zap className="h-3.5 w-3.5 md:h-4 md:w-4 text-amber-500 shrink-0 fill-amber-400" />
                    <span className="text-[11px] md:text-xs font-bold text-slate-700">ðŸ”¥ Ù…Ù†ØªØ¬ Ø±Ø§Ø¦Ø¬ â€” Ø¥Ù‚Ø¨Ø§Ù„ Ø¹Ø§Ù„Ù Ù‡Ø°Ø§ Ø§Ù„Ø£Ø³Ø¨ÙˆØ¹</span>
                  </div>
                </div>
              </div>

              {/* â”€â”€ Content Panel â”€â”€ */}
              <div className="w-full lg:w-[54%] p-5 md:p-7 lg:p-10 flex flex-col gap-4 md:gap-5">

                {/* Category + availability */}
                <div className="flex items-center gap-2 flex-wrap">
                  {product.categoryName && (
                    <span className="bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full">
                      {product.categoryName}
                    </span>
                  )}
                  <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full border border-emerald-100">
                    âœ“ Ù…ØªÙˆÙØ± ÙˆÙ…ØªØ§Ø­ Ù„Ù„Ø·Ù„Ø¨
                  </span>
                  {/* Stock scarcity */}
                  <span className="bg-rose-50 text-rose-700 text-xs font-bold px-3 py-1 rounded-full border border-rose-100 animate-pulse">
                    ðŸ”¥ ØªØ¨Ù‚Ù‘Øª {stockLeft} Ù‚Ø·Ø¹ ÙÙ‚Ø·!
                  </span>
                </div>

                {/* Title */}
                <h1 className="text-xl md:text-2xl lg:text-[1.75rem] font-black text-slate-900 leading-snug">
                  {product.nameAr}
                </h1>

                {/* Rating */}
                <div className="flex items-center gap-2 md:gap-3 flex-wrap">
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3.5 w-3.5 md:h-4 md:w-4 ${i < Math.round(ratingNum) ? "fill-amber-400 text-amber-400" : "text-slate-200 fill-slate-200"}`}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-bold text-slate-700">{ratingNum.toFixed(1)}</span>
                  <span className="text-xs md:text-sm text-slate-400">({reviewCount} ØªÙ‚ÙŠÙŠÙ…)</span>
                  <span className="text-xs text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full">
                    Ù…ÙˆØµÙ‰ Ø¨Ù‡
                  </span>
                </div>

                {/* Flash sale countdown */}
                <FlashSaleTimer productId={product.id} />

                {/* Price block */}
                <div className="bg-gradient-to-l from-primary/5 to-blue-50 rounded-xl md:rounded-2xl p-3.5 md:p-4 border border-primary/10">
                  <div className="flex items-end gap-2 md:gap-3 flex-wrap">
                    <span className="text-3xl md:text-4xl font-black text-primary leading-none">{product.price}</span>
                    <span className="text-lg md:text-xl font-bold text-primary/80 mb-0.5">{currency}</span>
                    {product.compareAtPrice && product.compareAtPrice > product.price && (
                      <span className="text-sm md:text-base text-slate-400 line-through font-medium">{product.compareAtPrice} {currency}</span>
                    )}
                  </div>
                  {savings && (
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-xs md:text-sm font-black text-emerald-600 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                        ðŸ’° ÙˆÙÙ‘Ø± {savings} {currency}
                      </span>
                      <span className="text-xs text-slate-500">Ù…Ù‚Ø§Ø±Ù†Ø©Ù‹ Ø¨Ø§Ù„Ø³Ø¹Ø± Ø§Ù„Ø£ØµÙ„ÙŠ</span>
                    </div>
                  )}
                </div>

                {/* Description */}
                {product.descriptionAr && (
                  <div className="bg-slate-50 rounded-xl md:rounded-2xl p-3.5 md:p-4 border border-slate-100">
                    <h3 className="text-sm font-black text-slate-700 mb-2 flex items-center gap-1.5">
                      <Award className="h-4 w-4 text-primary shrink-0" />
                      Ù„Ù…Ø§Ø°Ø§ Ù‡Ø°Ø§ Ø§Ù„Ù…Ù†ØªØ¬ØŸ
                    </h3>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      {product.descriptionAr}
                    </p>
                  </div>
                )}

                {/* Features list */}
                <div>
                  <h3 className="text-sm font-black text-slate-700 mb-3 flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                    Ø§Ù„Ù…Ù…ÙŠØ²Ø§Øª Ø§Ù„Ø±Ø¦ÙŠØ³ÙŠØ©
                  </h3>
                  <div className="grid grid-cols-1 gap-2">
                    {features.map((feat, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-2.5 bg-white border border-slate-100 rounded-xl px-3.5 py-2.5 shadow-sm"
                      >
                        <span className="text-base leading-none mt-0.5 shrink-0">âœ…</span>
                        <span className="text-sm text-slate-700 font-medium leading-snug">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Trust bar */}
                <div className="grid grid-cols-3 gap-2 text-center">
                  {[
                    { icon: <Banknote className="h-5 w-5 text-emerald-500 mx-auto mb-1" />, label: "Ø§Ù„Ø¯ÙØ¹ Ø¹Ù†Ø¯ Ø§Ù„Ø§Ø³ØªÙ„Ø§Ù…" },
                    { icon: <Truck className="h-5 w-5 text-blue-500 mx-auto mb-1" />, label: "ØªÙˆØµÙŠÙ„ Ù„ÙƒÙ„ Ù„ÙŠØ¨ÙŠØ§" },
                    { icon: <Shield className="h-5 w-5 text-purple-500 mx-auto mb-1" />, label: "Ø¶Ù…Ø§Ù† Ø§Ù„Ø¬ÙˆØ¯Ø© 100%" },
                  ].map(({ icon, label }) => (
                    <div key={label} className="bg-slate-50 border border-slate-100 rounded-xl py-3 px-2">
                      {icon}
                      <p className="text-[10px] md:text-[11px] font-bold text-slate-600 leading-tight">{label}</p>
                    </div>
                  ))}
                </div>

                {/* â”€â”€ Primary CTA: Order Now â”€â”€ */}
                <button
                  onClick={handleOrderNow}
                  className="flex w-full rounded-2xl bg-slate-900 hover:bg-primary px-6 py-4 text-lg font-black text-white shadow-lg hover:shadow-primary/30 transition-all duration-200 items-center justify-center gap-2 group touch-manipulation active:scale-[0.98]"
                >
                  <Clock className="h-5 w-5 group-hover:animate-pulse" />
                  Ø§Ø·Ù„Ø¨ Ø§Ù„Ø¢Ù† â€” Ø§Ù„Ø¯ÙØ¹ Ø¹Ù†Ø¯ Ø§Ù„Ø§Ø³ØªÙ„Ø§Ù…
                </button>

                {/* Volume tier selector */}
                {hasVolume && (
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-slate-500 mb-1">Ø§Ø®ØªØ± Ø§Ù„ÙƒÙ…ÙŠØ©</p>

                    {/* Tier 1 â€” always shown */}
                    <button
                      onClick={() => setQtyTier(1)}
                      className={`w-full flex items-center justify-between rounded-2xl border-2 px-4 py-3 transition-all duration-150 touch-manipulation ${
                        qtyTier === 1
                          ? "border-primary bg-blue-50"
                          : "border-slate-200 bg-white hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                          qtyTier === 1 ? "border-primary" : "border-slate-300"
                        }`}>
                          {qtyTier === 1 && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                        </div>
                        <span className="font-bold text-slate-800 text-sm">Ù‚Ø·Ø¹Ø© ÙˆØ§Ø­Ø¯Ø©</span>
                      </div>
                      <span className={`font-black text-base ${qtyTier === 1 ? "text-primary" : "text-slate-700"}`}>
                        {product.price} <span className="text-xs font-bold">{currency}</span>
                      </span>
                    </button>

                    {/* Tier 2 */}
                    {pq2 && (
                      <button
                        onClick={() => setQtyTier(2)}
                        className={`w-full flex items-center justify-between rounded-2xl border-2 px-4 py-3 transition-all duration-150 touch-manipulation relative ${
                          qtyTier === 2
                            ? "border-emerald-500 bg-emerald-50"
                            : "border-slate-200 bg-white hover:border-slate-300"
                        }`}
                      >
                        <span className="absolute -top-2.5 right-3 bg-emerald-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                          Ø§Ù„Ø£ÙˆÙØ± âœ¦
                        </span>
                        <div className="flex items-center gap-2.5">
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                            qtyTier === 2 ? "border-emerald-500" : "border-slate-300"
                          }`}>
                            {qtyTier === 2 && <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />}
                          </div>
                          <div className="text-right">
                            <span className="font-bold text-slate-800 text-sm">Ù‚Ø·Ø¹ØªØ§Ù†</span>
                            <span className="text-[10px] text-emerald-600 font-bold mr-1.5">
                              ÙˆÙÙ‘Ø± {(product.price * 2 - pq2).toFixed(0)} {currency}
                            </span>
                          </div>
                        </div>
                        <span className={`font-black text-base ${qtyTier === 2 ? "text-emerald-600" : "text-slate-700"}`}>
                          {pq2} <span className="text-xs font-bold">{currency}</span>
                        </span>
                      </button>
                    )}

                    {/* Tier 3 */}
                    {pq3 && (
                      <button
                        onClick={() => setQtyTier(3)}
                        className={`w-full flex items-center justify-between rounded-2xl border-2 px-4 py-3 transition-all duration-150 touch-manipulation relative ${
                          qtyTier === 3
                            ? "border-amber-500 bg-amber-50"
                            : "border-slate-200 bg-white hover:border-slate-300"
                        }`}
                      >
                        <span className="absolute -top-2.5 right-3 bg-amber-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                          Ø§Ù„ØªÙˆÙÙŠØ± Ø§Ù„Ø£Ù‚ØµÙ‰ âœ¦
                        </span>
                        <div className="flex items-center gap-2.5">
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                            qtyTier === 3 ? "border-amber-500" : "border-slate-300"
                          }`}>
                            {qtyTier === 3 && <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />}
                          </div>
                          <div className="text-right">
                            <span className="font-bold text-slate-800 text-sm">Ù£ Ù‚Ø·Ø¹</span>
                            <span className="text-[10px] text-amber-600 font-bold mr-1.5">
                              ÙˆÙÙ‘Ø± {(product.price * 3 - pq3).toFixed(0)} {currency}
                            </span>
                          </div>
                        </div>
                        <span className={`font-black text-base ${qtyTier === 3 ? "text-amber-600" : "text-slate-700"}`}>
                          {pq3} <span className="text-xs font-bold">{currency}</span>
                        </span>
                      </button>
                    )}
                  </div>
                )}

                {/* Add to cart button */}
                <Button
                  size="lg"
                  className="w-full h-12 rounded-full text-sm md:text-base gap-2 font-bold shadow-md shadow-primary/20 bg-primary hover:bg-blue-700 text-white touch-manipulation"
                  onClick={handleAddToCart}
                >
                  <ShoppingCart className="h-4 w-4 md:h-5 md:w-5 shrink-0" />
                  Ø£Ø¶Ù Ø¥Ù„Ù‰ Ø§Ù„Ø³Ù„Ø©
                  {hasVolume && qtyTier > 1 && (
                    <span className="text-xs opacity-80 font-semibold">â€” {selectedPrice} {currency}</span>
                  )}
                </Button>

              </div>
            </div>
          </div>

          {/* Back link */}
          <div className="mt-5 md:mt-6">
            <Link href="/products" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-primary font-semibold transition-colors min-h-[44px]">
              <ArrowRight className="h-4 w-4 shrink-0" />
              Ø§Ù„Ø¹ÙˆØ¯Ø© Ù„Ø¬Ù…ÙŠØ¹ Ø§Ù„Ù…Ù†ØªØ¬Ø§Øª
            </Link>
          </div>
        </div>
      </div>

      {/* â”€â”€ Sticky Mobile Order Bar â€” scroll-triggered slide-up â”€â”€ */}
      <div
        className={`md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 shadow-[0_-6px_24px_rgba(0,0,0,0.14)] px-4 pt-3 transition-transform duration-300 ease-out ${
          stickyVisible ? "translate-y-0" : "translate-y-full"
        }`}
        style={{ paddingBottom: "calc(12px + env(safe-area-inset-bottom, 0px))" }}
        aria-hidden={!stickyVisible}
      >
        <div className="flex items-center gap-3">
          {/* Thumbnail */}
          {product.imageUrl && (
            <div className="w-11 h-11 rounded-xl overflow-hidden border border-slate-100 shrink-0 bg-slate-50">
              <img
                src={product.imageUrl.startsWith("http") || product.imageUrl.startsWith("/") ? product.imageUrl : `/${product.imageUrl}`}
                alt={product.nameAr}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Title + price */}
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-slate-700 truncate leading-tight">
              {product.nameAr}
            </p>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-lg font-black text-primary leading-none">{selectedPrice}</span>
              <span className="text-xs font-bold text-primary/80">{currency}</span>
              {qtyTier > 1 && (
                <span className="text-[10px] text-emerald-600 font-bold mr-1">{qtyTier} Ù‚Ø·Ø¹</span>
              )}
              {qtyTier === 1 && discount && (
                <span className="text-[10px] text-rose-500 font-bold mr-1">Ø®ØµÙ… {discount}%</span>
              )}
            </div>
          </div>

          {/* CTA */}
          <button
            onClick={handleOrderNow}
            className="flex items-center justify-center gap-1.5 bg-slate-900 hover:bg-primary text-white font-black text-sm rounded-xl px-4 py-3 shadow-lg transition-all duration-200 touch-manipulation active:scale-95 shrink-0"
          >
            <Clock className="h-3.5 w-3.5 shrink-0" />
            Ø§Ø·Ù„Ø¨ Ø§Ù„Ø¢Ù†
          </button>
        </div>
      </div>

      {/* â”€â”€ Social Proof Popup â”€â”€ */}
      <SocialProofPopup />
    </>
  );
}

