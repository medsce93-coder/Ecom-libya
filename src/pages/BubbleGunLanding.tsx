import { useState, useRef, useEffect } from "react";
import { useGetProduct } from "@/lib/api-client";
import { useCurrency } from "@/lib/currency-context";
import { apiFetch } from "@/lib/api";

const PRODUCT_ID = "9c2dfe3f-cf3f-423b-8b7d-10cdd7f36e32";

const FEATURES = [
  { icon: "🚀", title: "آلاف الفقاعات في ثواني", desc: "موطور قوي يخلي اللعب والضحك ما يكملش." },
  { icon: "🔋", title: "يخدم بالبطارية", desc: "ساهل بكل، ركب البطريات، انزل عالزر، واستمتع." },
  { icon: "👶", title: "آمن 100%", desc: "مخدوم بمواد متينة وما فيه حتى خطر على صغارك." },
  { icon: "💡", title: "تصميم خفيف", desc: "يقدروا يشدوه الصغار ويلعبوا بيه بروحهم من غير تعب." },
];

export default function BubbleGunLanding() {
  const { data: product } = useGetProduct(PRODUCT_ID);
  const { currency } = useCurrency();

  const formRef = useRef<HTMLDivElement>(null);
  const heroCtaRef = useRef<HTMLButtonElement>(null);
  const [stickyVisible, setStickyVisible] = useState(false);

  const [form, setForm] = useState({ name: "", phone: "", address: "" });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const hero = heroCtaRef.current;
    if (!hero) return;
    const obs = new IntersectionObserver(
      ([entry]) => setStickyVisible(!entry.isIntersecting),
      { threshold: 0 }
    );
    obs.observe(hero);
    return () => obs.disconnect();
  }, []);

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.name.trim() || !form.phone.trim() || !form.address.trim()) {
      setError("يرجى تعبئة جميع الحقول.");
      return;
    }
    setSubmitting(true);
    try {
      await apiFetch("/api/orders?action=direct", {
        method: "POST",
        auth: false,
        body: {
          productId: PRODUCT_ID,
          quantity: 1,
          customerName: form.name,
          customerPhone: form.phone,
          customerAddress: form.address,
        },
      });
      setSuccess(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setError("صار خطأ، حاول مرة ثانية.");
    } finally {
      setSubmitting(false);
    }
  };

  const price = product?.price ?? 239;
  const compareAt = product?.compareAtPrice ?? 262;
  const imageUrl = product?.imageUrl
    ? product.imageUrl.startsWith("http")
      ? product.imageUrl
      : `/${product.imageUrl}`
    : null;
  const discount = compareAt > price ? Math.round(((compareAt - price) / compareAt) * 100) : 9;

  if (success) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8 text-center" dir="rtl">
        <div className="text-6xl mb-4">🎉</div>
        <h1 className="text-2xl font-extrabold text-green-600 mb-2">تأكد طلبك بنجاح!</h1>
        <p className="text-slate-600 text-lg mb-1">شكراً <strong>{form.name}</strong>!</p>
        <p className="text-slate-500">راح يتواصل معك فريقنا على الرقم <strong>{form.phone}</strong> خلال فترة قريبة لتأكيد الطلب والتوصيل.</p>
        <div className="mt-6 bg-green-50 border border-green-200 rounded-2xl p-4 max-w-sm w-full">
          <p className="font-bold text-green-700">📦 تفاصيل طلبك</p>
          <p className="text-slate-700 mt-1">مسدس الفقاعات الآلي × 1</p>
          <p className="text-slate-700">السعر: <span className="font-bold text-primary">{price} {currency}</span></p>
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
        🔥 عرض محدود — التوصيل مجاني لعند باب الحوش!
      </div>

      {/* ── Header ── */}
      <header className="bg-white border-b border-slate-100 py-3 px-4 flex items-center justify-between sticky top-0 z-30 shadow-sm">
        <div className="text-primary font-black text-xl tracking-tight">جودة ماركت</div>
        <button
          onClick={scrollToForm}
          className="bg-green-500 hover:bg-green-600 text-white text-xs font-bold px-4 py-2 rounded-full transition-colors"
        >
          اطلب توة ←
        </button>
      </header>

      {/* ── Hero ── */}
      <section className="bg-gradient-to-b from-blue-50 to-white px-4 pt-8 pb-6 text-center">
        {/* Badges */}
        <div className="flex justify-center gap-2 mb-4 flex-wrap">
          <span className="bg-rose-500 text-white text-xs font-bold px-3 py-1 rounded-full">🔥 عرض حصري</span>
          <span className="bg-amber-400 text-white text-xs font-bold px-3 py-1 rounded-full">🛵 توصيل مجاني</span>
          <span className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">💳 الدفع عند الاستلام</span>
        </div>

        {/* Headline */}
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight mb-3">
          فرح صغارك ودير جو سمح<br />
          <span className="text-primary">مع مسدس الفقاعات الآلي! 🫧🔫</span>
        </h1>

        <p className="text-slate-600 text-base max-w-md mx-auto mb-6 leading-relaxed">
          فكك من التعب والنفخ بالطريقة القديمة! المسدس هضا يطلع آلاف الفقاعات في ثواني بضغطة زر وحدة.
        </p>

        {/* Product image */}
        {imageUrl && (
          <img
            src={imageUrl}
            alt="مسدس الفقاعات الآلي"
            className="w-full max-w-md mx-auto rounded-lg shadow-2xl mb-6 object-contain max-h-72"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
        )}

        {/* Price */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <span className="text-3xl font-black text-primary">{price} {currency}</span>
          {compareAt > price && (
            <span className="text-lg text-slate-400 line-through">{compareAt} {currency}</span>
          )}
          <span className="bg-rose-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
            -{discount}%
          </span>
        </div>

        {/* Hero CTA */}
        <button
          ref={heroCtaRef}
          onClick={scrollToForm}
          className="relative inline-flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 active:scale-95 text-white font-extrabold text-lg px-8 py-4 rounded-2xl shadow-lg shadow-green-200 transition-all duration-150 w-full max-w-sm mx-auto"
          style={{ animation: "pulse-cta 2s ease-in-out infinite" }}
        >
          🛒 اطلب توة وخلص كاش لما تستلم!
        </button>
        <p className="text-slate-400 text-xs mt-3">الكمية محدودة — حجز لا يلزم الدفع المسبق</p>
      </section>

      {/* ── Features ── */}
      <section className="px-4 py-8 bg-white">
        <h2 className="text-center text-xl font-extrabold text-slate-800 mb-6">ليش مسدس الفقاعات هضا مختلف؟</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
          {FEATURES.map((f) => (
            <div key={f.title} className="flex gap-3 bg-blue-50 rounded-2xl p-4 items-start">
              <span className="text-2xl mt-0.5">{f.icon}</span>
              <div>
                <p className="font-bold text-slate-800 text-sm">{f.title}</p>
                <p className="text-slate-500 text-sm mt-0.5 leading-snug">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Box contents ── */}
      <section className="px-4 py-6 bg-slate-50">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 mb-4">
            <p className="font-extrabold text-slate-800 mb-3 text-base">📦 شنو يجيك في الباكو؟</p>
            <ul className="space-y-2 text-slate-600 text-sm">
              <li className="flex items-center gap-2"><span className="text-green-500 font-bold">✓</span> مسدس الفقاعات الآلي</li>
              <li className="flex items-center gap-2"><span className="text-green-500 font-bold">✓</span> شيشة سائل الفقاعات</li>
              <li className="flex items-center gap-2"><span className="text-green-500 font-bold">✓</span> صحن صغير</li>
            </ul>
          </div>

          <div className="bg-amber-50 border-2 border-amber-400 rounded-2xl p-5">
            <p className="font-extrabold text-amber-800 text-base mb-1">🔥 عرض خاص:</p>
            <p className="text-amber-700 text-sm leading-relaxed">
              تخفيض حصري + التوصيل لعند باب الحوش!<br />
              <span className="font-bold">(رد بالك: الكمية اللي قعدت محدودة جداً)</span>
            </p>
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="px-4 py-8 bg-white">
        <h2 className="text-center text-xl font-extrabold text-slate-800 mb-6">شنو قالوا العملاء؟ ⭐</h2>
        <div className="space-y-3 max-w-md mx-auto">
          {[
            { name: "فاطمة م.", text: "اشتريته لولدي وما تصدقي قديش فرح! الفقاعات تطلع بكثرة وبسرعة. شي رائع والله! ⭐⭐⭐⭐⭐" },
            { name: "خالد ع.", text: "استلمت الطلب في يومين وكل شي تمام. المسدس خفيف وأولادي يلعبوا بيه كل يوم! ⭐⭐⭐⭐⭐" },
            { name: "مريم ب.", text: "هدية مثالية للصغار، آمن وسهل الاستخدام. الدفع عند الاستلام خلاني مرتاحة أكثر. ⭐⭐⭐⭐⭐" },
          ].map((t) => (
            <div key={t.name} className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
              <p className="text-slate-700 text-sm leading-relaxed mb-2">"{t.text}"</p>
              <p className="text-primary font-bold text-xs">— {t.name}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Order Form ── */}
      <section ref={formRef} id="order-form" className="px-4 py-8 bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-6">
            <span className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">✅ الدفع عند الاستلام — بدون بطاقة</span>
            <h2 className="text-2xl font-extrabold text-slate-900 mt-3 mb-1">اطلب دلوقتي! 🛒</h2>
            <p className="text-slate-500 text-sm">املا البيانات وفريقنا يتواصل معك لتأكيد الطلب</p>
          </div>

          {/* Order summary card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow p-4 mb-5 flex items-center gap-4">
            {imageUrl && (
              <img
                src={imageUrl}
                alt="مسدس الفقاعات"
                className="w-16 h-16 object-contain rounded-xl border border-slate-100"
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
              />
            )}
            <div className="flex-1 min-w-0">
              <p className="font-bold text-slate-800 text-sm leading-tight">مسدس الفقاعات الآلي ببطاريات</p>
              <p className="text-xs text-slate-500 mt-0.5">الكمية: 1</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-primary font-extrabold text-lg">{price} {currency}</p>
              {compareAt > price && <p className="text-slate-400 line-through text-xs">{compareAt} {currency}</p>}
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
                placeholder="المدينة — الحي — بالقرب من..."
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

      {/* ── Footer ── */}
      <footer className="bg-slate-900 text-white text-center py-5 px-4 text-xs">
        <p className="font-bold text-base mb-1">جودة ماركت</p>
        <p className="text-slate-400">الوجهة الأولى للتسوق العائلي في ليبيا</p>
        <p className="text-slate-500 mt-2">جميع الحقوق محفوظة © {new Date().getFullYear()}</p>
      </footer>

      {/* ── Sticky mobile CTA ── */}
      {stickyVisible && (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-3 bg-white border-t border-slate-200 shadow-xl md:hidden">
          <button
            onClick={scrollToForm}
            className="w-full bg-green-500 hover:bg-green-600 active:scale-95 text-white font-extrabold text-base py-3.5 rounded-2xl shadow-lg shadow-green-200 transition-all duration-150"
            style={{ animation: "pulse-cta 2s ease-in-out infinite" }}
          >
            🛒 اطلب توة — {price} {currency} فقط!
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




