import { useState, useRef, useEffect } from "react";
import { useParams, Link } from "wouter";
import { useCurrency } from "@/lib/currency-context";
import { apiFetch } from "@/lib/api";
import { useBranding } from "@/lib/branding-context";

interface LandingPageProduct {
  id: string;
  name: string;
  nameAr: string;
  price: string | number;
  compareAtPrice?: string | number | null;
  priceQty2?: string | number | null;
  priceQty3?: string | number | null;
  quantityPrices?: Array<{
    quantity: number;
    price: string | number;
  }>;
  imageUrl?: string | null;
  slug?: string | null;
}

interface LandingPageData {
  id: string;
  productId: string;
  slug: string;
  headline: string;
  subheadline: string;
  mediaUrls: string[];
  features: string[];
  boxContents?: string | null;
  urgencyText?: string | null;
  product: LandingPageProduct;
}

export default function DynamicLandingPage() {
  const { slug } = useParams<{ slug: string }>();
  const { currency } = useCurrency();
  const { marketCountry } = useBranding();
  const [page, setPage] = useState<LandingPageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const formRef = useRef<HTMLDivElement>(null);
  const heroCtaRef = useRef<HTMLButtonElement>(null);
  const [stickyVisible, setStickyVisible] = useState(false);
  const [activeMedia, setActiveMedia] = useState(0);

  const [form, setForm] = useState({ name: "", phone: "", address: "" });
  const [qtyTier, setQtyTier] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    apiFetch<LandingPageData>(`/api/landing-pages?slug=${encodeURIComponent(slug)}`, {
      auth: false,
    })
      .then((data) => { if (data) setPage(data); })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    const hero = heroCtaRef.current;
    if (!hero) return;
    const obs = new IntersectionObserver(
      ([entry]) => setStickyVisible(!entry.isIntersecting),
      { threshold: 0 }
    );
    obs.observe(hero);
    return () => obs.disconnect();
  }, [page]);

  useEffect(() => {
    if (page) document.title = `${page.headline} | جودة ماركت`;
    return () => { document.title = "جودة ماركت"; };
  }, [page]);

  const scrollToForm = () => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.name.trim() || !form.phone.trim() || !form.address.trim()) {
      setError("يرجى تعبئة جميع الحقول.");
      return;
    }
    if (!page) return;
    setSubmitting(true);
    try {
      await apiFetch("/api/orders?action=direct", {
        method: "POST",
        auth: false,
        body: {
          productId: page.productId,
          qtyTier,
          quantity: qtyTier,
          customerName: form.name,
          customerPhone: form.phone,
          customerAddress: form.address,
          customerCity: form.address,
        },
      });
      setSuccess(true);

      try {
        const orderTotal = selectedPrice;
        if ((window as any).fbq) {
          (window as any).fbq("track", "Purchase", {
            value: orderTotal,
            currency,
          });
        }
      } catch {}

      try {
        const orderTotal = selectedPrice;
        if ((window as any).ttq) {
          (window as any).ttq.track("CompletePayment", {
            value: orderTotal,
            currency,
          });
        }
      } catch {}

      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setError("صار خطأ، حاول مرة ثانية.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50" dir="rtl">
        <div className="flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center animate-pulse">
            <span className="text-2xl">🛒</span>
          </div>
          <p className="text-slate-400 text-sm">جارٍ تحميل العرض…</p>
        </div>
      </div>
    );
  }

  if (notFound || !page) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-center px-4" dir="rtl">
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

  const price = parseFloat(String(page.product.price));
  const compareAt = page.product.compareAtPrice
    ? parseFloat(String(page.product.compareAtPrice))
    : null;

  const quantityPrices = (page.product.quantityPrices ?? [])
    .map((item) => ({
      quantity: Number(item.quantity),
      price: Number(item.price),
    }))
    .filter(
      (item) =>
        Number.isFinite(item.quantity) &&
        item.quantity > 1 &&
        Number.isFinite(item.price) &&
        item.price > 0,
    )
    .sort((a, b) => a.quantity - b.quantity);

  const volumeOptions = [
    { quantity: 1, price },
    ...quantityPrices,
  ];

  const hasVolume = quantityPrices.length > 0;

  const selectedOption =
    volumeOptions.find((option) => option.quantity === qtyTier) ??
    volumeOptions[0];

  const selectedPrice = selectedOption.price;
  const selectedQuantity = selectedOption.quantity;
  const discount = compareAt && compareAt > price ? Math.round(((compareAt - price) / compareAt) * 100) : null;

  const resolveImage = (url?: string | null) => {
    if (!url) return null;
    if (url.startsWith("http") || url.startsWith("/")) return url;
    return `/${url}`;
  };

  type MediaKind = "youtube" | "tiktok" | "instagram" | "facebook" | "video" | "image";

  const getMediaKind = (url: string): MediaKind => {
    if (/youtube\.com|youtu\.be/.test(url)) return "youtube";
    if (/tiktok\.com/.test(url)) return "tiktok";
    if (/instagram\.com\/(reel|p|tv)\//.test(url)) return "instagram";
    if (/facebook\.com\/(watch|video|reel|share\/v)|fb\.watch/.test(url)) return "facebook";
    if (/\.(mp4|webm|mov)(\?.*)?$/i.test(url)) return "video";
    return "image";
  };

  const getYouTubeEmbed = (url: string) => {
    const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    return m ? `https://www.youtube.com/embed/${m[1]}?rel=0&playsinline=1&autoplay=1&mute=1&loop=1&playlist=${m[1]}` : url;
  };

  const getTikTokEmbed = (url: string) => {
    const m = url.match(/tiktok\.com\/(?:@[^/]+\/video\/|v\/)(\d+)/);
    return m ? `https://www.tiktok.com/embed/v2/${m[1]}?autoplay=1&muted=1` : url;
  };

  const getInstagramEmbed = (url: string) => {
    const m = url.match(/instagram\.com\/(reel|p|tv)\/([A-Za-z0-9_-]+)/);
    return m ? `https://www.instagram.com/${m[1]}/${m[2]}/embed/captioned/` : url;
  };

  const getFacebookEmbed = (url: string) => {
    return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=false&autoplay=1&mute=1&width=560`;
  };

  const renderMedia = (url: string, alt: string, extraClass = "") => {
    const kind = getMediaKind(url);

    if (kind === "youtube") {
      return (
        <div className={`relative w-full ${extraClass}`} style={{ paddingBottom: "56.25%" }}>
          <iframe
            src={getYouTubeEmbed(url)}
            title={alt}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 w-full h-full"
          />
        </div>
      );
    }

    if (kind === "tiktok") {
      return (
        <div className={`w-full max-w-xs mx-auto ${extraClass}`} style={{ aspectRatio: "9/16" }}>
          <iframe
            src={getTikTokEmbed(url)}
            title={alt}
            allow="autoplay; encrypted-media"
            allowFullScreen
            style={{ width: "100%", height: "100%", display: "block", border: "none", position: "relative", zIndex: 10, pointerEvents: "auto" }}
          />
        </div>
      );
    }

    if (kind === "instagram") {
      return (
        <div className={`w-full max-w-sm mx-auto ${extraClass}`} style={{ aspectRatio: "9/16" }}>
          <iframe
            src={getInstagramEmbed(url)}
            title={alt}
            allow="encrypted-media"
            allowFullScreen
            scrolling="no"
            style={{ width: "100%", height: "100%", display: "block", border: "none", position: "relative", zIndex: 10, pointerEvents: "auto" }}
          />
        </div>
      );
    }

    if (kind === "facebook") {
      return (
        <div className={`w-full ${extraClass}`} style={{ aspectRatio: "16/9" }}>
          <iframe
            src={getFacebookEmbed(url)}
            title={alt}
            allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
            allowFullScreen
            scrolling="no"
            style={{ width: "100%", height: "100%", display: "block", border: "none", position: "relative", zIndex: 10, pointerEvents: "auto" }}
          />
        </div>
      );
    }

    if (kind === "video") {
      return (
        <div className={`bg-slate-900 ${extraClass}`}>
          <video
            src={url}
            autoPlay={true}
            loop={true}
            muted={true}
            playsInline={true}
            controls
            preload="auto"
            className="w-full h-auto block min-h-[200px]"
          />
        </div>
      );
    }

    return (
      <img
        src={url}
        alt={alt}
        className={`w-full h-auto block ${extraClass}`}
        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
      />
    );
  };

  const renderThumb = (url: string) => {
    const kind = getMediaKind(url);
    if (kind === "image") {
      return (
        <img
          src={url}
          alt=""
          className="w-full h-full object-cover"
          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
        />
      );
    }
    const bg = kind === "youtube" ? "bg-red-600" : kind === "tiktok" ? "bg-black" : "bg-slate-700";
    const icon = kind === "tiktok" ? "♪" : "▶";
    return (
      <div className={`w-full h-full ${bg} flex items-center justify-center`}>
        <span className="text-white text-xl">{icon}</span>
      </div>
    );
  };

  const allMediaUrls = (page.mediaUrls || []).map(resolveImage).filter(Boolean) as string[];
  const productFallback = resolveImage(page.product.imageUrl);
  const mediaList = allMediaUrls.length > 0 ? allMediaUrls : (productFallback ? [productFallback] : []);
  const heroImage = mediaList[0] ?? null;
  const thumbMedia = mediaList.slice(1);

  if (success) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8 text-center" dir="rtl">
        <div className="text-6xl mb-4">🎉</div>
        <h1 className="text-2xl font-extrabold text-green-600 mb-2">تأكد طلبك بنجاح!</h1>
        <p className="text-slate-600 text-lg mb-1">شكراً <strong>{form.name}</strong>!</p>
        <p className="text-slate-500">راح يتواصل معك فريقنا على الرقم <strong>{form.phone}</strong> خلال فترة قريبة لتأكيد الطلب والتوصيل.</p>
        <div className="mt-6 bg-green-50 border border-green-200 rounded-2xl p-4 max-w-sm w-full">
          <p className="font-bold text-green-700">📦 تفاصيل طلبك</p>
          <p className="text-slate-700 mt-1">{page.product.nameAr} × {qtyTier}</p>
          <p className="text-slate-700">السعر: <span className="font-bold text-primary">{selectedPrice} {currency}</span></p>
          <p className="text-slate-500 text-sm mt-1">الدفع عند الاستلام 💳</p>
        </div>
        <a
          href="/"
          className="mt-5 inline-flex items-center gap-2 border border-slate-300 text-slate-600 hover:border-slate-400 hover:text-slate-800 font-semibold text-sm px-6 py-3 rounded-xl transition-colors"
        >
          الرجوع للصفحة الرئيسية 🏠
        </a>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white" dir="rtl">

      {/* ── Top bar ── */}
      <div className="bg-primary text-white text-center py-2 px-4 text-sm font-bold tracking-wide">
        🔥 {page.urgencyText ?? "عرض محدود —  التوصيل بالمجان، والدفع عند الاستلام!"}
      </div>

      {/* ── Header ── */}
      <header className="bg-white border-b border-slate-100 py-3 px-4 flex items-center justify-between sticky top-0 z-30 shadow-sm">
        <Link href="/" className="text-primary font-black text-xl tracking-tight hover:opacity-80 transition-opacity">
          جودة ماركت
        </Link>
        <button
          onClick={scrollToForm}
          className="bg-green-500 hover:bg-green-600 text-white text-xs font-bold px-4 py-2 rounded-full transition-colors"
        >
          اطلب الآن ←
        </button>
      </header>

      {/* ── Hero ── */}
      <section className="bg-gradient-to-b from-blue-50 to-white px-4 pt-8 pb-6 text-center">
        <div className="flex justify-center gap-2 mb-4 flex-wrap">
          <span className="bg-rose-500 text-white text-xs font-bold px-3 py-1 rounded-full">🔥 عرض حصري</span>
          <span className="bg-amber-400 text-white text-xs font-bold px-3 py-1 rounded-full">🛵 توصيل مجاني</span>
          <span className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">💳 الدفع عند الاستلام</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight mb-3">
          {page.headline}
        </h1>

        {page.subheadline && (
          <p className="text-slate-600 text-base max-w-md mx-auto mb-6 leading-relaxed">{page.subheadline}</p>
        )}

        {/* ── Media carousel ── */}
        {mediaList.length > 0 && (
          <div className="mb-6 max-w-md mx-auto">
            {/* Main media — type-aware, hugs content naturally */}
            <div className="relative rounded-2xl overflow-hidden shadow-lg">
              <div key={activeMedia}>
                {renderMedia(mediaList[activeMedia], page.product.nameAr)}
              </div>
              {mediaList.length > 1 && (
                <>
                  <button
                    onClick={() => setActiveMedia((i) => (i - 1 + mediaList.length) % mediaList.length)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-black/40 hover:bg-black/60 text-white rounded-full w-9 h-9 flex items-center justify-center shadow text-lg font-bold transition"
                    aria-label="السابق"
                  >›</button>
                  <button
                    onClick={() => setActiveMedia((i) => (i + 1) % mediaList.length)}
                    className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-black/40 hover:bg-black/60 text-white rounded-full w-9 h-9 flex items-center justify-center shadow text-lg font-bold transition"
                    aria-label="التالي"
                  >‹</button>
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-10 flex gap-1.5">
                    {mediaList.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveMedia(i)}
                        className={`w-2 h-2 rounded-full transition-all ${i === activeMedia ? "bg-white scale-125" : "bg-white/50"}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Thumbnail strip */}
            {mediaList.length > 1 && (
              <div className="flex gap-2 mt-3 overflow-x-auto pb-1 justify-center">
                {mediaList.map((src, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveMedia(i)}
                    className={`shrink-0 w-14 h-14 rounded-xl overflow-hidden border-2 transition-all ${i === activeMedia ? "border-primary shadow-md" : "border-slate-200 opacity-60 hover:opacity-90"}`}
                  >
                    {renderThumb(src)}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-center gap-3 mb-6">
          <span className="text-3xl font-black text-primary">{selectedPrice} {currency}</span>
          {compareAt && compareAt > price && (
            <span className="text-lg text-slate-400 line-through">{compareAt} {currency}</span>
          )}
          {discount && (
            <span className="bg-rose-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">-{discount}%</span>
          )}
        </div>

        <button
          ref={heroCtaRef}
          onClick={scrollToForm}
          className="relative inline-flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 active:scale-95 text-white font-extrabold text-lg px-8 py-4 rounded-2xl shadow-lg shadow-green-200 transition-all duration-150 w-full max-w-sm mx-auto"
          style={{ animation: "pulse-cta 2s ease-in-out infinite" }}
        >
          🛒 اطلب الآن وادفع عند الاستلام!
        </button>
        <p className="text-slate-400 text-xs mt-3">الكمية محدودة — حجز لا يلزم الدفع المسبق</p>
      </section>

      {/* ── Features ── */}
      {page.features.length > 0 && (
        <section className="px-4 py-8 bg-white">
          <h2 className="text-center text-xl font-extrabold text-slate-800 mb-6">لماذا هذا المنتج مختلف؟</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
            {page.features.map((f, i) => (
              <div key={i} className="flex gap-3 bg-blue-50 rounded-2xl p-4 items-start">
                <span className="text-green-500 font-black text-lg mt-0.5">✓</span>
                <p className="text-slate-700 text-sm leading-snug">{f}</p>
              </div>
            ))}
          </div>

          {/* Extra media in the features section */}
          {thumbMedia.length > 0 && (
            <div className="mt-8 max-w-2xl mx-auto grid grid-cols-1 gap-6">
              {thumbMedia.map((src, i) => {
                const kind = getMediaKind(src);
                if (kind === "image") {
                  return (
                    <button
                      key={i}
                      onClick={() => setActiveMedia(i + 1)}
                      className="rounded-2xl overflow-hidden shadow-md border border-slate-100 cursor-pointer hover:shadow-lg transition-shadow w-full"
                    >
                      <img
                        src={src}
                        alt={`وسائط ${i + 2}`}
                        className="w-full h-auto block"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                      />
                    </button>
                  );
                }
                return (
                  <div key={i} className="rounded-2xl overflow-hidden shadow-md">
                    {renderMedia(src, `وسائط ${i + 2}`)}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* ── Box contents & urgency ── */}
      {(page.boxContents || page.urgencyText) && (
        <section className="px-4 py-6 bg-slate-50">
          <div className="max-w-md mx-auto space-y-4">
            {page.boxContents && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                <p className="font-extrabold text-slate-800 mb-3 text-base">📦 محتويات الباك</p>
                <div className="space-y-1.5">
                  {page.boxContents.split("\n").filter(Boolean).map((line, i) => (
                    <div key={i} className="flex items-center gap-2 text-slate-600 text-sm">
                      <span className="text-green-500 font-bold">✓</span>
                      {line.trim()}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {page.urgencyText && (
              <div className="bg-amber-50 border-2 border-amber-400 rounded-2xl p-5">
                <p className="font-extrabold text-amber-800 text-base mb-1">🔥 عرض خاص:</p>
                <p className="text-amber-700 text-sm leading-relaxed">{page.urgencyText}</p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── Order Form ── */}
      <section ref={formRef} id="order-form" className="px-4 py-8 bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-6">
            <span className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">✅ الدفع عند الاستلام — بدون بطاقة</span>
            <h2 className="text-2xl font-extrabold text-slate-900 mt-3 mb-1">اطلب الآن! 🛒</h2>
            <p className="text-slate-500 text-sm">املأ البيانات وسيتواصل معك فريقنا لتأكيد الطلب</p>
          </div>

          {/* ── Volume selector ── */}
          {hasVolume && (
            <div className="mb-5 space-y-2.5">
              <p className="text-sm font-extrabold text-slate-800 text-center mb-3">
                🎁 اختار عرضك
              </p>

              {volumeOptions.map((option, index) => {
                const quantity = option.quantity;
                const optionPrice = option.price;
                const isSelected = qtyTier === quantity;
                const savings = price * quantity - optionPrice;

                return (
                  <button
                    key={quantity}
                    type="button"
                    onClick={() => setQtyTier(quantity)}
                    className={`w-full flex items-center justify-between gap-3 rounded-2xl border-2 px-4 py-3.5 text-right transition-all relative overflow-hidden ${
                      isSelected
                        ? index === 1
                          ? "border-green-500 bg-green-50 shadow-sm"
                          : index >= 2
                            ? "border-amber-500 bg-amber-50 shadow-sm"
                            : "border-primary bg-primary/5 shadow-sm"
                        : "border-slate-200 bg-white"
                    }`}
                  >
                    {index === 1 && (
                      <span className="absolute top-0 left-0 bg-green-500 text-white text-[10px] font-black px-2 py-0.5 rounded-br-xl">
                        الأوفر
                      </span>
                    )}

                    {index >= 2 && (
                      <span className="absolute top-0 left-0 bg-amber-500 text-white text-[10px] font-black px-2 py-0.5 rounded-br-xl">
                        أفضل سعر
                      </span>
                    )}

                    <div className={`flex-1 min-w-0 ${index > 0 ? "mt-1" : ""}`}>
                      <p
                        className={`font-extrabold text-sm ${
                          isSelected
                            ? index === 1
                              ? "text-green-700"
                              : index >= 2
                                ? "text-amber-700"
                                : "text-primary"
                            : "text-slate-700"
                        }`}
                      >
                        {quantity === 1
                          ? "قطعة واحدة"
                          : `${quantity} قطع`}
                      </p>

                      <p className="text-xs text-slate-400 mt-0.5">
                        الكمية: {quantity}
                        {savings > 0
                          ? ` — وفّر ${savings.toFixed(0)} ${currency}`
                          : ""}
                      </p>
                    </div>

                    <p
                      className={`font-black text-base shrink-0 ${
                        isSelected
                          ? index === 1
                            ? "text-green-700"
                            : index >= 2
                              ? "text-amber-700"
                              : "text-primary"
                          : "text-slate-700"
                      }`}
                    >
                      {optionPrice} {currency}
                    </p>

                    <span
                      className={`w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center ${
                        isSelected
                          ? index === 1
                            ? "border-green-500 bg-green-500"
                            : index >= 2
                              ? "border-amber-500 bg-amber-500"
                              : "border-primary bg-primary"
                          : "border-slate-300"
                      }`}
                    >
                      {isSelected && (
                        <span className="w-2 h-2 bg-white rounded-full block" />
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
          {/* Order summary card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow p-4 mb-5 flex items-center gap-4">
            {heroImage && getMediaKind(heroImage) === "image" && (
              <img
                src={heroImage}
                alt={page.product.nameAr}
                className="w-16 h-16 object-contain rounded-xl border border-slate-100"
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
              />
            )}
            <div className="flex-1 min-w-0">
              <p className="font-bold text-slate-800 text-sm leading-tight">{page.product.nameAr}</p>
              <p className="text-xs text-slate-500 mt-0.5">الكمية: {qtyTier}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-primary font-extrabold text-lg">{selectedPrice} {currency}</p>
              {qtyTier === 1 && compareAt && compareAt > price && <p className="text-slate-400 line-through text-xs">{compareAt} {currency}</p>}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">الاسم الكامل *</label>
              <input
                type="text"
                placeholder="أدخل اسمك الكامل"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">رقم الهاتف *</label>
              <input
                type="tel"
                placeholder="09XXXXXXXX"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                dir="ltr"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">العنوان *</label>
              <textarea
                placeholder="المدينة — الحي — العنوان"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                rows={3}
                className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                required
              />
            </div>

            {error && (
              <p className="text-rose-600 text-sm bg-rose-50 border border-rose-200 rounded-xl px-4 py-2">
                ⚠️ {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-green-500 hover:bg-green-600 disabled:opacity-60 disabled:cursor-not-allowed active:scale-95 text-white font-extrabold text-lg py-4 rounded-2xl shadow-lg shadow-green-200 transition-all duration-150"
            >
              {submitting ? "جاري الإرسال..." : "تأكيد الطلب 🛒"}
            </button>

            <div className="flex items-center justify-center gap-4 text-xs text-slate-500 pt-1">
              <span>🔒 بيانات آمنة</span>
              <span>💳 الدفع عند الاستلام</span>
              <span>🚚 توصيل سريع</span>
            </div>
          </form>
        </div>
      </section>

      {/* ── Back to store ── */}
      <div className="bg-slate-50 border-t border-slate-100 py-6 px-4 text-center">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-slate-600 hover:text-primary font-semibold text-sm border border-slate-300 hover:border-primary rounded-full px-5 py-2.5 transition-colors bg-white shadow-sm"
        >
          ← تصفح جميع المنتجات
        </Link>
      </div>

      {/* ── Footer ── */}
      <footer className="bg-slate-900 text-white text-center py-5 px-4 text-xs">
        <p className="font-bold text-base mb-1">جودة ماركت</p>
        <p className="text-slate-400">الوجهة الأولى للتسوق العائلي في {marketCountry}</p>
        <p className="text-slate-500 mt-2">جميع الحقوق محفوظة © {new Date().getFullYear()}</p>
      </footer>

      {/* ── Sticky mobile CTA ── */}
      {stickyVisible && (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-3 bg-white border-t border-slate-200 shadow-xl md:hidden">
          <button
            onClick={scrollToForm}
            className="w-full bg-green-500 hover:bg-green-600 active:scale-95 text-white font-extrabold text-base py-3.5 rounded-2xl shadow-lg shadow-green-200 transition-all duration-150"
          >
            🛒 اطلب الآن — {selectedPrice} {currency} فقط!
          </button>
        </div>
      )}

      <style>{`
        @keyframes pulse-cta {
          0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(34,197,94,0.5); }
          50% { transform: scale(1.02); box-shadow: 0 0 0 10px rgba(34,197,94,0); }
        }
      `}</style>
    </div>
  );
}
