import { useParams, useLocation } from "wouter";
import { useGetProduct, getGetProductQueryKey } from "@workspace/api-client-react";
import { useState, useEffect, useRef } from "react";
import { useStore } from "@/lib/store-context";
import { useCurrency } from "@/lib/currency-context";
import { FlashSaleTimer } from "@/components/FlashSaleTimer";
import { SocialProofPopup } from "@/components/SocialProofPopup";
import {
  CheckCircle2, Star, Truck, Banknote, Shield,
  ChevronDown, Play, Package,
} from "lucide-react";

/* ── Per-category benefit bullets ──────────────────────── */
const CATEGORY_BENEFITS: Record<string, string[]> = {
  "الأجهزة الذكية":           ["يوفّر وقتك ويرفع إنتاجيتك كل يوم", "تصميم أنيق يليق بأسلوب حياتك", "يعمل فوراً — بدون تعقيد", "ضمان شامل على كل قطعة"],
  "الأطفال":                   ["آمن 100% — خالٍ من أي مواد ضارة", "يحفّز إبداع طفلك وذكاءه", "متين يصمد أمام اللعب اليومي", "سعادة الأطفال = راحة بالك أنتَ"],
  "الجمال والعناية":           ["نتائج مرئية من الأسبوع الأول", "مناسب لمناخ ليبيا الحار والجاف", "تركيبة مجرّبة من آلاف العميلات", "سعر عادل بجودة العلامات العالمية"],
  "الصحة والعناية الشخصية":   ["يدعم صحتك اليومية فعلاً", "مكوّنات مختارة ومضمونة السلامة", "نتائج سريعة تحسّها من الأول", "مناسب لجميع الفئات والأعمار"],
  "العناية بالبشرة":           ["يُرطّب ويجدد نضارة بشرتك بعمق", "تركيبة لطيفة — آمنة للبشرة الحساسة", "بشرة أكثر إشراقاً ونعومة", "مجرّب ومحبوب من آلاف المستخدمات"],
  "المكملات الغذائية":         ["يعزز طاقتك وأداءك طوال اليوم", "تركيز عالٍ بأعلى معايير الجودة", "نتائج واضحة خلال أسبوعين", "مثالي للرياضيين وأصحاب النشاط"],
  "المنزل والمطبخ":            ["يحوّل منزلك لبيئة منظمة وأنيقة", "جودة مواد تصمد للاستخدام اليومي", "يوفّر وقتك وجهدك في أعمال المنزل", "مثالي للمطبخ الليبي وحياة العائلة"],
  "منتجات متنوعة":             ["جودة مضمونة 100% على كل طلب", "منتج مجرّب ومحبوب من الليبيين", "يُحسّن حياتك اليومية فعلاً", "قيمة حقيقية لكل دينار تنفقه"],
};
const DEFAULT_BENEFITS = ["جودة مضمونة 100%", "منتج أصلي وموثوق", "توصيل سريع لجميع ليبيا", "دفع مريح عند الاستلام"];

function getBenefits(cat?: string | null) {
  if (!cat) return DEFAULT_BENEFITS;
  for (const [k, v] of Object.entries(CATEGORY_BENEFITS)) {
    if (cat.includes(k) || k.includes(cat)) return v;
  }
  return DEFAULT_BENEFITS;
}

/* ── Hardcoded testimonials ─────────────────────────────── */
const TESTIMONIALS = [
  {
    name: "رانيا الطيب",     city: "بنغازي",  avatar: "ر", color: "bg-rose-500",
    rating: 5,
    text: "استلمت المنتج في يومين وكان أفضل مما توقعت! الجودة ممتازة جداً والتغليف كان رائعاً. سأطلب مرة ثانية بكل تأكيد.",
  },
  {
    name: "عبد الله المنصور", city: "طرابلس", avatar: "ع", color: "bg-blue-600",
    rating: 5,
    text: "كنت متردداً في البداية من التسوق أونلاين، لكن الدفع عند الاستلام أزال كل قلقي. المنتج وصل وأنا مبسوط جداً. شكراً جودة ماركت!",
  },
  {
    name: "نسرين الأمين",    city: "مصراتة", avatar: "ن", color: "bg-emerald-600",
    rating: 5,
    text: "اشتريت لأولادي وهم سعداء جداً. خدمة التوصيل كانت سريعة والمتجر أجاب على استفساري على الواتساب بدقيقتين. ممتاز!",
  },
];

/* ── FAQ ────────────────────────────────────────────────── */
const FAQS = [
  { q: "كيف يتم الدفع؟",            a: "الدفع عند الاستلام فقط — تستلم المنتج وتدفع، بدون أي مخاطرة من طرفك." },
  { q: "كم يستغرق التوصيل؟",        a: "يصل طلبك خلال 2–4 أيام لجميع مدن ليبيا. نوصل لأكثر من 18 مدينة." },
  { q: "ماذا لو لم يعجبني المنتج؟",  a: "رضاك ضماننا. تواصل معنا وسنحل الأمر فوراً — رد كامل أو استبدال بدون تعقيد." },
];

/* ── Stars component ────────────────────────────────────── */
function Stars({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={`h-4 w-4 ${i < count ? "fill-amber-400 text-amber-400" : "fill-slate-200 text-slate-200"}`} />
      ))}
    </div>
  );
}

/* ── FAQ Item ───────────────────────────────────────────── */
function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-slate-200 rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-3 p-4 text-right bg-white hover:bg-slate-50 transition-colors"
      >
        <span className="font-bold text-slate-900 text-sm">{q}</span>
        <ChevronDown className={`h-4 w-4 text-slate-400 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="px-4 pb-4 text-sm text-slate-600 leading-relaxed bg-white">
          {a}
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════ */
export default function LandingPage() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { addToCart } = useStore();
  const { currency } = useCurrency();
  const heroRef = useRef<HTMLDivElement>(null);
  const [stickyVisible, setStickyVisible] = useState(false);

  const { data: product, isLoading } = useGetProduct(id!, {
    query: { enabled: !!id, queryKey: getGetProductQueryKey(id!) },
  });

  /* Sticky bar appears after scrolling past hero */
  useEffect(() => {
    const onScroll = () => setStickyVisible(window.scrollY > 320);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* SEO */
  useEffect(() => {
    if (product) {
      document.title = `${product.nameAr} — عرض خاص | جودة ماركت`;
    }
    return () => { document.title = "جودة ماركت"; };
  }, [product]);

  const handleOrder = () => {
    if (!product) return;
    addToCart({
      id: product.id,
      name: product.nameAr,
      price: product.price,
      oldPrice: product.compareAtPrice ?? undefined,
      image: product.imageUrl ?? "",
      description: product.descriptionAr ?? "",
      category: product.categoryName ?? "",
    });
    setLocation("/checkout");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const discount = product?.compareAtPrice && product.compareAtPrice > product.price
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : null;
  const savings = product?.compareAtPrice && product.compareAtPrice > product.price
    ? (product.compareAtPrice - product.price).toFixed(0)
    : null;
  const stockLeft = product
    ? (product.id.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % 5) + 3
    : 5;
  const benefits = getBenefits(product?.categoryName);
  const imgSrc = product?.imageUrl
    ? (product.imageUrl.startsWith("http") ? product.imageUrl : `/${product.imageUrl}`)
    : null;

  /* ── Loading ───────────────────────────── */
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center animate-pulse">
            <Package className="h-8 w-8 text-primary/50" />
          </div>
          <p className="text-slate-400 text-sm font-medium">جارٍ تحميل العرض…</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-center px-4">
        <div>
          <div className="text-5xl mb-4">🔍</div>
          <h1 className="text-2xl font-extrabold text-slate-900 mb-2">العرض غير موجود</h1>
          <p className="text-slate-500 mb-6">لم نتمكن من إيجاد هذا العرض.</p>
          <a href="/products" className="inline-flex items-center gap-2 bg-primary text-white font-bold px-6 py-3 rounded-xl">
            تصفح المنتجات
          </a>
        </div>
      </div>
    );
  }

  /* ═══════════════════════════════════════════════════════ */
  return (
    <>
      <div className="bg-slate-50 pb-28">

        {/* ── TOP BRAND BAR ──────────────────────────────── */}
        <div className="bg-white border-b border-slate-100 px-4 py-3 flex items-center justify-between sticky top-0 z-40 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center">
              <Package className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="font-extrabold text-slate-900 text-sm">
              متجر <span className="text-primary">ليبيا</span>
            </span>
          </div>
          <button
            onClick={handleOrder}
            className="bg-primary text-white font-black text-sm px-4 py-2 rounded-full shadow hover:bg-blue-700 transition-colors touch-manipulation"
          >
            اطلب الآن ←
          </button>
        </div>

        {/* ── URGENCY STRIP ──────────────────────────────── */}
        <div className="bg-rose-600 text-white text-center py-2 px-4 text-xs md:text-sm font-bold animate-pulse">
          ⚡ عرض محدود — تبقّت {stockLeft} قطع فقط! اطلب الآن قبل نفاد الكمية
        </div>

        {/* ── HERO ───────────────────────────────────────── */}
        <div ref={heroRef} className="bg-white">
          <div className="container mx-auto px-4 py-8 md:py-12 max-w-2xl">

            {/* Category badge */}
            {product.categoryName && (
              <div className="flex justify-center mb-4">
                <span className="bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full">
                  {product.categoryName}
                </span>
              </div>
            )}

            {/* Hook headline */}
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-slate-900 text-center leading-snug mb-2">
              {product.nameAr}
            </h1>
            {product.descriptionAr && (
              <p className="text-center text-slate-500 text-sm md:text-base leading-relaxed max-w-lg mx-auto mb-6">
                {product.descriptionAr}
              </p>
            )}

            {/* Rating row */}
            <div className="flex items-center justify-center gap-2 mb-6">
              <Stars count={5} />
              <span className="text-sm font-bold text-slate-700">4.9</span>
              <span className="text-xs text-slate-400">(+2,300 عميل راضٍ)</span>
            </div>

            {/* Product image */}
            <div className="relative mx-auto mb-6 max-w-sm">
              {discount && (
                <span className="absolute top-3 right-3 z-10 bg-rose-500 text-white text-sm font-black px-3 py-1 rounded-full shadow-lg">
                  خصم {discount}%
                </span>
              )}
              <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-3xl p-6 aspect-square flex items-center justify-center shadow-inner">
                {imgSrc ? (
                  <img
                    src={imgSrc}
                    alt={product.nameAr}
                    className="object-contain w-full h-full max-h-72 drop-shadow-xl"
                  />
                ) : (
                  <div className="text-8xl font-black text-slate-300 select-none">
                    {product.nameAr.substring(0, 2)}
                  </div>
                )}
              </div>
            </div>

            {/* Flash timer */}
            <div className="mb-4">
              <FlashSaleTimer productId={product.id} />
            </div>

            {/* Price */}
            <div className="bg-gradient-to-l from-primary/5 to-blue-50 rounded-2xl p-4 border border-primary/10 mb-5">
              <div className="flex items-end justify-center gap-2 flex-wrap">
                <span className="text-4xl font-black text-primary">{product.price}</span>
                <span className="text-xl font-bold text-primary/80 mb-1">{currency}</span>
                {product.compareAtPrice && product.compareAtPrice > product.price && (
                  <span className="text-base text-slate-400 line-through mb-1">{product.compareAtPrice} {currency}</span>
                )}
              </div>
              {savings && (
                <p className="text-center text-emerald-700 font-black text-sm mt-1">
                  💰 وفّر {savings} {currency} — بدلاً من {product.compareAtPrice} {currency}
                </p>
              )}
            </div>

            {/* Hero CTA */}
            <button
              onClick={handleOrder}
              className="w-full bg-primary hover:bg-blue-700 text-white font-black text-xl py-5 rounded-2xl shadow-xl shadow-primary/30 transition-all active:scale-[0.98] touch-manipulation mb-3"
            >
              🛒 اطلب الآن — الدفع عند الاستلام
            </button>

            {/* Micro trust */}
            <div className="flex items-center justify-center gap-4 text-xs text-slate-400 font-medium">
              <span className="flex items-center gap-1"><Banknote className="h-3.5 w-3.5 text-emerald-500" /> دفع عند الاستلام</span>
              <span className="flex items-center gap-1"><Truck className="h-3.5 w-3.5 text-blue-500" /> توصيل سريع</span>
              <span className="flex items-center gap-1"><Shield className="h-3.5 w-3.5 text-purple-500" /> ضمان الجودة</span>
            </div>
          </div>
        </div>

        {/* ── VIDEO / GIF PLACEHOLDER ────────────────────── */}
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <div className="rounded-3xl overflow-hidden bg-slate-800 aspect-video flex flex-col items-center justify-center gap-3 shadow-xl relative">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-700 to-slate-900" />
            <div className="relative z-10 flex flex-col items-center gap-3">
              <div className="w-16 h-16 rounded-full bg-white/20 border-2 border-white/40 flex items-center justify-center backdrop-blur-sm">
                <Play className="h-7 w-7 text-white fill-white mr-[-3px]" />
              </div>
              <p className="text-white font-bold text-base">شاهد المنتج وهو يعمل</p>
              <p className="text-white/60 text-xs">أضف رابط الفيديو أو GIF هنا</p>
            </div>
            <div className="absolute bottom-3 right-3 bg-black/50 text-white text-[10px] font-bold px-2 py-0.5 rounded">
              VIDEO / GIF PLACEHOLDER
            </div>
          </div>
        </div>

        {/* ── BENEFITS ───────────────────────────────────── */}
        <div className="bg-white py-10">
          <div className="container mx-auto px-4 max-w-2xl">
            <div className="text-center mb-7">
              <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">لماذا يختاره الآلاف؟</span>
              <h2 className="text-2xl font-extrabold text-slate-900 mt-3">المميزات التي ستغيّر يومك</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {benefits.map((b, i) => (
                <div key={i} className="flex items-start gap-3 bg-slate-50 border border-slate-100 rounded-2xl p-4">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                  <span className="text-sm font-semibold text-slate-800 leading-snug">{b}</span>
                </div>
              ))}
            </div>

            {/* Mid-page CTA */}
            <button
              onClick={handleOrder}
              className="w-full mt-8 bg-slate-900 hover:bg-primary text-white font-black text-lg py-4 rounded-2xl shadow-lg transition-all active:scale-[0.98] touch-manipulation"
            >
              اطلب الآن واستفد من العرض ←
            </button>
          </div>
        </div>

        {/* ── STATS ──────────────────────────────────────── */}
        <div className="bg-primary py-10 text-white">
          <div className="container mx-auto px-4 max-w-2xl">
            <div className="grid grid-cols-3 gap-4 text-center">
              {[
                { value: "5000+", label: "عميل سعيد" },
                { value: "18+",   label: "مدينة ليبية" },
                { value: "4.9",   label: "تقييم من 5" },
              ].map((s) => (
                <div key={s.label}>
                  <div className="text-3xl font-extrabold">{s.value}</div>
                  <div className="text-blue-200 text-xs mt-1">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── TESTIMONIALS ───────────────────────────────── */}
        <div className="bg-white py-10">
          <div className="container mx-auto px-4 max-w-2xl">
            <div className="text-center mb-7">
              <span className="text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-100">
                ⭐ آراء العملاء الحقيقية
              </span>
              <h2 className="text-2xl font-extrabold text-slate-900 mt-3">ماذا يقولون عن المنتج؟</h2>
            </div>
            <div className="flex flex-col gap-4">
              {TESTIMONIALS.map((t) => (
                <div key={t.name} className="bg-slate-50 border border-slate-100 rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full ${t.color} text-white font-bold flex items-center justify-center text-sm shrink-0`}>
                        {t.avatar}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-sm">{t.name}</p>
                        <p className="text-xs text-slate-400">{t.city}</p>
                      </div>
                    </div>
                    <span className="text-xs text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                      مشترٍ موثّق ✓
                    </span>
                  </div>
                  <Stars count={t.rating} />
                  <p className="mt-2 text-sm text-slate-700 leading-relaxed">"{t.text}"</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── FINAL PRICING + CTA ────────────────────────── */}
        <div className="bg-gradient-to-br from-slate-900 to-blue-950 py-12 text-white">
          <div className="container mx-auto px-4 max-w-2xl text-center">
            <p className="text-blue-300 text-sm font-bold mb-2">⚡ لا تفوّت هذا العرض</p>
            <h2 className="text-2xl md:text-3xl font-extrabold mb-6">{product.nameAr}</h2>

            {/* Stock + timer */}
            <div className="bg-white/10 border border-white/20 rounded-2xl p-4 mb-6 backdrop-blur-sm">
              <div className="flex flex-col gap-2">
                <FlashSaleTimer productId={product.id} />
                <p className="text-rose-300 font-bold text-sm">🔥 تبقّت {stockLeft} قطع فقط في المخزن</p>
              </div>
            </div>

            {/* Price */}
            <div className="flex items-end justify-center gap-2 mb-2 flex-wrap">
              <span className="text-5xl font-black">{product.price}</span>
              <span className="text-2xl font-bold text-blue-300 mb-1">{currency}</span>
              {product.compareAtPrice && product.compareAtPrice > product.price && (
                <span className="text-xl text-slate-400 line-through mb-1">{product.compareAtPrice} {currency}</span>
              )}
            </div>
            {savings && (
              <p className="text-emerald-400 font-bold text-sm mb-6">✅ توفير {savings} {currency} عن السعر الأصلي</p>
            )}

            <button
              onClick={handleOrder}
              className="w-full bg-primary hover:bg-blue-500 text-white font-black text-xl py-5 rounded-2xl shadow-2xl transition-all active:scale-[0.98] touch-manipulation"
            >
              🛒 اطلب الآن — الدفع عند الاستلام
            </button>
            <p className="text-slate-400 text-xs mt-3">لا حاجة لبطاقة بنكية · توصيل لجميع مدن ليبيا</p>
          </div>
        </div>

        {/* ── FAQ ────────────────────────────────────────── */}
        <div className="bg-white py-10">
          <div className="container mx-auto px-4 max-w-2xl">
            <h2 className="text-xl font-extrabold text-slate-900 text-center mb-6">أسئلة شائعة</h2>
            <div className="flex flex-col gap-3">
              {FAQS.map((f) => <FaqItem key={f.q} q={f.q} a={f.a} />)}
            </div>
          </div>
        </div>

        {/* ── FOOTER ─────────────────────────────────────── */}
        <div className="bg-slate-900 text-center py-6 px-4">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-6 h-6 bg-primary rounded-md flex items-center justify-center">
              <Package className="h-3 w-3 text-white" />
            </div>
            <span className="text-white font-extrabold text-sm">جودة ماركت</span>
          </div>
          <p className="text-slate-400 text-xs">© {new Date().getFullYear()} جودة ماركت · دفع عند الاستلام · توصيل لجميع مدن ليبيا</p>
        </div>
      </div>

      {/* ── STICKY BOTTOM BAR ──────────────────────────────── */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 shadow-[0_-6px_24px_rgba(0,0,0,0.14)] transition-transform duration-300 ease-out ${
          stickyVisible ? "translate-y-0" : "translate-y-full"
        }`}
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
        aria-hidden={!stickyVisible}
      >
        <div className="container mx-auto max-w-2xl px-4 py-3 flex items-center gap-3">
          {/* Thumbnail */}
          {imgSrc && (
            <div className="w-10 h-10 rounded-xl overflow-hidden border border-slate-100 shrink-0 bg-slate-50">
              <img src={imgSrc} alt={product.nameAr} className="w-full h-full object-cover" />
            </div>
          )}
          {/* Price */}
          <div className="flex-1 min-w-0">
            <p className="text-xs text-slate-500 truncate">{product.nameAr}</p>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-black text-primary">{product.price}</span>
              <span className="text-xs font-bold text-primary/80">{currency}</span>
              {discount && <span className="text-[10px] text-rose-500 font-bold mr-1">خصم {discount}%</span>}
            </div>
          </div>
          {/* CTA */}
          <button
            onClick={handleOrder}
            className="shrink-0 bg-primary text-white font-black text-sm px-5 py-3 rounded-xl shadow-lg hover:bg-blue-700 transition-colors touch-manipulation active:scale-95"
          >
            اطلب الآن ←
          </button>
        </div>
      </div>

      {/* Social proof popup — sits above sticky bar */}
      <SocialProofPopup />
    </>
  );
}
