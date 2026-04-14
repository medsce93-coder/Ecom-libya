import { useState, useRef, useEffect } from "react";
import { useGetProduct } from "@/lib/api-client";
import { useCurrency } from "@/lib/currency-context";
import { apiFetch } from "@/lib/api";

const PRODUCT_ID = "9c2dfe3f-cf3f-423b-8b7d-10cdd7f36e32";

const FEATURES = [
  { icon: "ðŸš€", title: "Ø¢Ù„Ø§Ù Ø§Ù„ÙÙ‚Ø§Ø¹Ø§Øª ÙÙŠ Ø«ÙˆØ§Ù†ÙŠ", desc: "Ù…ÙˆØ·ÙˆØ± Ù‚ÙˆÙŠ ÙŠØ®Ù„ÙŠ Ø§Ù„Ù„Ø¹Ø¨ ÙˆØ§Ù„Ø¶Ø­Ùƒ Ù…Ø§ ÙŠÙƒÙ…Ù„Ø´." },
  { icon: "ðŸ”‹", title: "ÙŠØ®Ø¯Ù… Ø¨Ø§Ù„Ø¨Ø·Ø§Ø±ÙŠØ©", desc: "Ø³Ø§Ù‡Ù„ Ø¨ÙƒÙ„ØŒ Ø±ÙƒØ¨ Ø§Ù„Ø¨Ø·Ø±ÙŠØ§ØªØŒ Ø§Ù†Ø²Ù„ Ø¹Ø§Ù„Ø²Ø±ØŒ ÙˆØ§Ø³ØªÙ…ØªØ¹." },
  { icon: "ðŸ‘¶", title: "Ø¢Ù…Ù† 100%", desc: "Ù…Ø®Ø¯ÙˆÙ… Ø¨Ù…ÙˆØ§Ø¯ Ù…ØªÙŠÙ†Ø© ÙˆÙ…Ø§ ÙÙŠÙ‡ Ø­ØªÙ‰ Ø®Ø·Ø± Ø¹Ù„Ù‰ ØµØºØ§Ø±Ùƒ." },
  { icon: "ðŸ’¡", title: "ØªØµÙ…ÙŠÙ… Ø®ÙÙŠÙ", desc: "ÙŠÙ‚Ø¯Ø±ÙˆØ§ ÙŠØ´Ø¯ÙˆÙ‡ Ø§Ù„ØµØºØ§Ø± ÙˆÙŠÙ„Ø¹Ø¨ÙˆØ§ Ø¨ÙŠÙ‡ Ø¨Ø±ÙˆØ­Ù‡Ù… Ù…Ù† ØºÙŠØ± ØªØ¹Ø¨." },
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
      setError("ÙŠØ±Ø¬Ù‰ ØªØ¹Ø¨Ø¦Ø© Ø¬Ù…ÙŠØ¹ Ø§Ù„Ø­Ù‚ÙˆÙ„.");
      return;
    }
    setSubmitting(true);
    try {
      await apiFetch("/api/orders/direct", {
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
      setError("ØµØ§Ø± Ø®Ø·Ø£ØŒ Ø­Ø§ÙˆÙ„ Ù…Ø±Ø© Ø«Ø§Ù†ÙŠØ©.");
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
        <div className="text-6xl mb-4">ðŸŽ‰</div>
        <h1 className="text-2xl font-extrabold text-green-600 mb-2">ØªØ£ÙƒØ¯ Ø·Ù„Ø¨Ùƒ Ø¨Ù†Ø¬Ø§Ø­!</h1>
        <p className="text-slate-600 text-lg mb-1">Ø´ÙƒØ±Ø§Ù‹ <strong>{form.name}</strong>!</p>
        <p className="text-slate-500">Ø±Ø§Ø­ ÙŠØªÙˆØ§ØµÙ„ Ù…Ø¹Ùƒ ÙØ±ÙŠÙ‚Ù†Ø§ Ø¹Ù„Ù‰ Ø§Ù„Ø±Ù‚Ù… <strong>{form.phone}</strong> Ø®Ù„Ø§Ù„ ÙØªØ±Ø© Ù‚Ø±ÙŠØ¨Ø© Ù„ØªØ£ÙƒÙŠØ¯ Ø§Ù„Ø·Ù„Ø¨ ÙˆØ§Ù„ØªÙˆØµÙŠÙ„.</p>
        <div className="mt-6 bg-green-50 border border-green-200 rounded-2xl p-4 max-w-sm w-full">
          <p className="font-bold text-green-700">ðŸ“¦ ØªÙØ§ØµÙŠÙ„ Ø·Ù„Ø¨Ùƒ</p>
          <p className="text-slate-700 mt-1">Ù…Ø³Ø¯Ø³ Ø§Ù„ÙÙ‚Ø§Ø¹Ø§Øª Ø§Ù„Ø¢Ù„ÙŠ Ã— 1</p>
          <p className="text-slate-700">Ø§Ù„Ø³Ø¹Ø±: <span className="font-bold text-primary">{price} {currency}</span></p>
          <p className="text-slate-500 text-sm mt-1">Ø§Ù„Ø¯ÙØ¹ Ø¹Ù†Ø¯ Ø§Ù„Ø§Ø³ØªÙ„Ø§Ù… ðŸ’³</p>
        </div>
        <a
          href="/"
          className="mt-5 inline-flex items-center gap-2 border border-slate-300 text-slate-600 hover:border-slate-400 hover:text-slate-800 font-semibold text-sm px-6 py-3 rounded-xl transition-colors"
        >
          Ø§Ù„Ø±Ø¬ÙˆØ¹ Ù„Ù„ØµÙØ­Ø© Ø§Ù„Ø±Ø¦ÙŠØ³ÙŠØ© ðŸ 
        </a>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white" dir="rtl">

      {/* â”€â”€ Top bar â”€â”€ */}
      <div className="bg-primary text-white text-center py-2 px-4 text-sm font-bold tracking-wide">
        ðŸ”¥ Ø¹Ø±Ø¶ Ù…Ø­Ø¯ÙˆØ¯ â€” Ø§Ù„ØªÙˆØµÙŠÙ„ Ù…Ø¬Ø§Ù†ÙŠ Ù„Ø¹Ù†Ø¯ Ø¨Ø§Ø¨ Ø§Ù„Ø­ÙˆØ´!
      </div>

      {/* â”€â”€ Header â”€â”€ */}
      <header className="bg-white border-b border-slate-100 py-3 px-4 flex items-center justify-between sticky top-0 z-30 shadow-sm">
        <div className="text-primary font-black text-xl tracking-tight">Ø¬ÙˆØ¯Ø© Ù…Ø§Ø±ÙƒØª</div>
        <button
          onClick={scrollToForm}
          className="bg-green-500 hover:bg-green-600 text-white text-xs font-bold px-4 py-2 rounded-full transition-colors"
        >
          Ø§Ø·Ù„Ø¨ ØªÙˆØ© â†
        </button>
      </header>

      {/* â”€â”€ Hero â”€â”€ */}
      <section className="bg-gradient-to-b from-blue-50 to-white px-4 pt-8 pb-6 text-center">
        {/* Badges */}
        <div className="flex justify-center gap-2 mb-4 flex-wrap">
          <span className="bg-rose-500 text-white text-xs font-bold px-3 py-1 rounded-full">ðŸ”¥ Ø¹Ø±Ø¶ Ø­ØµØ±ÙŠ</span>
          <span className="bg-amber-400 text-white text-xs font-bold px-3 py-1 rounded-full">ðŸ›µ ØªÙˆØµÙŠÙ„ Ù…Ø¬Ø§Ù†ÙŠ</span>
          <span className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">ðŸ’³ Ø§Ù„Ø¯ÙØ¹ Ø¹Ù†Ø¯ Ø§Ù„Ø§Ø³ØªÙ„Ø§Ù…</span>
        </div>

        {/* Headline */}
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight mb-3">
          ÙØ±Ø­ ØµØºØ§Ø±Ùƒ ÙˆØ¯ÙŠØ± Ø¬Ùˆ Ø³Ù…Ø­<br />
          <span className="text-primary">Ù…Ø¹ Ù…Ø³Ø¯Ø³ Ø§Ù„ÙÙ‚Ø§Ø¹Ø§Øª Ø§Ù„Ø¢Ù„ÙŠ! ðŸ«§ðŸ”«</span>
        </h1>

        <p className="text-slate-600 text-base max-w-md mx-auto mb-6 leading-relaxed">
          ÙÙƒÙƒ Ù…Ù† Ø§Ù„ØªØ¹Ø¨ ÙˆØ§Ù„Ù†ÙØ® Ø¨Ø§Ù„Ø·Ø±ÙŠÙ‚Ø© Ø§Ù„Ù‚Ø¯ÙŠÙ…Ø©! Ø§Ù„Ù…Ø³Ø¯Ø³ Ù‡Ø¶Ø§ ÙŠØ·Ù„Ø¹ Ø¢Ù„Ø§Ù Ø§Ù„ÙÙ‚Ø§Ø¹Ø§Øª ÙÙŠ Ø«ÙˆØ§Ù†ÙŠ Ø¨Ø¶ØºØ·Ø© Ø²Ø± ÙˆØ­Ø¯Ø©.
        </p>

        {/* Product image */}
        {imageUrl && (
          <img
            src={imageUrl}
            alt="Ù…Ø³Ø¯Ø³ Ø§Ù„ÙÙ‚Ø§Ø¹Ø§Øª Ø§Ù„Ø¢Ù„ÙŠ"
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
          ðŸ›’ Ø§Ø·Ù„Ø¨ ØªÙˆØ© ÙˆØ®Ù„Øµ ÙƒØ§Ø´ Ù„Ù…Ø§ ØªØ³ØªÙ„Ù…!
        </button>
        <p className="text-slate-400 text-xs mt-3">Ø§Ù„ÙƒÙ…ÙŠØ© Ù…Ø­Ø¯ÙˆØ¯Ø© â€” Ø­Ø¬Ø² Ù„Ø§ ÙŠÙ„Ø²Ù… Ø§Ù„Ø¯ÙØ¹ Ø§Ù„Ù…Ø³Ø¨Ù‚</p>
      </section>

      {/* â”€â”€ Features â”€â”€ */}
      <section className="px-4 py-8 bg-white">
        <h2 className="text-center text-xl font-extrabold text-slate-800 mb-6">Ù„ÙŠØ´ Ù…Ø³Ø¯Ø³ Ø§Ù„ÙÙ‚Ø§Ø¹Ø§Øª Ù‡Ø¶Ø§ Ù…Ø®ØªÙ„ÙØŸ</h2>
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

      {/* â”€â”€ Box contents â”€â”€ */}
      <section className="px-4 py-6 bg-slate-50">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 mb-4">
            <p className="font-extrabold text-slate-800 mb-3 text-base">ðŸ“¦ Ø´Ù†Ùˆ ÙŠØ¬ÙŠÙƒ ÙÙŠ Ø§Ù„Ø¨Ø§ÙƒÙˆØŸ</p>
            <ul className="space-y-2 text-slate-600 text-sm">
              <li className="flex items-center gap-2"><span className="text-green-500 font-bold">âœ“</span> Ù…Ø³Ø¯Ø³ Ø§Ù„ÙÙ‚Ø§Ø¹Ø§Øª Ø§Ù„Ø¢Ù„ÙŠ</li>
              <li className="flex items-center gap-2"><span className="text-green-500 font-bold">âœ“</span> Ø´ÙŠØ´Ø© Ø³Ø§Ø¦Ù„ Ø§Ù„ÙÙ‚Ø§Ø¹Ø§Øª</li>
              <li className="flex items-center gap-2"><span className="text-green-500 font-bold">âœ“</span> ØµØ­Ù† ØµØºÙŠØ±</li>
            </ul>
          </div>

          <div className="bg-amber-50 border-2 border-amber-400 rounded-2xl p-5">
            <p className="font-extrabold text-amber-800 text-base mb-1">ðŸ”¥ Ø¹Ø±Ø¶ Ø®Ø§Øµ:</p>
            <p className="text-amber-700 text-sm leading-relaxed">
              ØªØ®ÙÙŠØ¶ Ø­ØµØ±ÙŠ + Ø§Ù„ØªÙˆØµÙŠÙ„ Ù„Ø¹Ù†Ø¯ Ø¨Ø§Ø¨ Ø§Ù„Ø­ÙˆØ´!<br />
              <span className="font-bold">(Ø±Ø¯ Ø¨Ø§Ù„Ùƒ: Ø§Ù„ÙƒÙ…ÙŠØ© Ø§Ù„Ù„ÙŠ Ù‚Ø¹Ø¯Øª Ù…Ø­Ø¯ÙˆØ¯Ø© Ø¬Ø¯Ø§Ù‹)</span>
            </p>
          </div>
        </div>
      </section>

      {/* â”€â”€ Testimonials â”€â”€ */}
      <section className="px-4 py-8 bg-white">
        <h2 className="text-center text-xl font-extrabold text-slate-800 mb-6">Ø´Ù†Ùˆ Ù‚Ø§Ù„ÙˆØ§ Ø§Ù„Ø¹Ù…Ù„Ø§Ø¡ØŸ â­</h2>
        <div className="space-y-3 max-w-md mx-auto">
          {[
            { name: "ÙØ§Ø·Ù…Ø© Ù….", text: "Ø§Ø´ØªØ±ÙŠØªÙ‡ Ù„ÙˆÙ„Ø¯ÙŠ ÙˆÙ…Ø§ ØªØµØ¯Ù‚ÙŠ Ù‚Ø¯ÙŠØ´ ÙØ±Ø­! Ø§Ù„ÙÙ‚Ø§Ø¹Ø§Øª ØªØ·Ù„Ø¹ Ø¨ÙƒØ«Ø±Ø© ÙˆØ¨Ø³Ø±Ø¹Ø©. Ø´ÙŠ Ø±Ø§Ø¦Ø¹ ÙˆØ§Ù„Ù„Ù‡! â­â­â­â­â­" },
            { name: "Ø®Ø§Ù„Ø¯ Ø¹.", text: "Ø§Ø³ØªÙ„Ù…Øª Ø§Ù„Ø·Ù„Ø¨ ÙÙŠ ÙŠÙˆÙ…ÙŠÙ† ÙˆÙƒÙ„ Ø´ÙŠ ØªÙ…Ø§Ù…. Ø§Ù„Ù…Ø³Ø¯Ø³ Ø®ÙÙŠÙ ÙˆØ£ÙˆÙ„Ø§Ø¯ÙŠ ÙŠÙ„Ø¹Ø¨ÙˆØ§ Ø¨ÙŠÙ‡ ÙƒÙ„ ÙŠÙˆÙ…! â­â­â­â­â­" },
            { name: "Ù…Ø±ÙŠÙ… Ø¨.", text: "Ù‡Ø¯ÙŠØ© Ù…Ø«Ø§Ù„ÙŠØ© Ù„Ù„ØµØºØ§Ø±ØŒ Ø¢Ù…Ù† ÙˆØ³Ù‡Ù„ Ø§Ù„Ø§Ø³ØªØ®Ø¯Ø§Ù…. Ø§Ù„Ø¯ÙØ¹ Ø¹Ù†Ø¯ Ø§Ù„Ø§Ø³ØªÙ„Ø§Ù… Ø®Ù„Ø§Ù†ÙŠ Ù…Ø±ØªØ§Ø­Ø© Ø£ÙƒØ«Ø±. â­â­â­â­â­" },
          ].map((t) => (
            <div key={t.name} className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
              <p className="text-slate-700 text-sm leading-relaxed mb-2">"{t.text}"</p>
              <p className="text-primary font-bold text-xs">â€” {t.name}</p>
            </div>
          ))}
        </div>
      </section>

      {/* â”€â”€ Order Form â”€â”€ */}
      <section ref={formRef} id="order-form" className="px-4 py-8 bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-6">
            <span className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">âœ… Ø§Ù„Ø¯ÙØ¹ Ø¹Ù†Ø¯ Ø§Ù„Ø§Ø³ØªÙ„Ø§Ù… â€” Ø¨Ø¯ÙˆÙ† Ø¨Ø·Ø§Ù‚Ø©</span>
            <h2 className="text-2xl font-extrabold text-slate-900 mt-3 mb-1">Ø§Ø·Ù„Ø¨ Ø¯Ù„ÙˆÙ‚ØªÙŠ! ðŸ›’</h2>
            <p className="text-slate-500 text-sm">Ø§Ù…Ù„Ø§ Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª ÙˆÙØ±ÙŠÙ‚Ù†Ø§ ÙŠØªÙˆØ§ØµÙ„ Ù…Ø¹Ùƒ Ù„ØªØ£ÙƒÙŠØ¯ Ø§Ù„Ø·Ù„Ø¨</p>
          </div>

          {/* Order summary card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow p-4 mb-5 flex items-center gap-4">
            {imageUrl && (
              <img
                src={imageUrl}
                alt="Ù…Ø³Ø¯Ø³ Ø§Ù„ÙÙ‚Ø§Ø¹Ø§Øª"
                className="w-16 h-16 object-contain rounded-xl border border-slate-100"
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
              />
            )}
            <div className="flex-1 min-w-0">
              <p className="font-bold text-slate-800 text-sm leading-tight">Ù…Ø³Ø¯Ø³ Ø§Ù„ÙÙ‚Ø§Ø¹Ø§Øª Ø§Ù„Ø¢Ù„ÙŠ Ø¨Ø¨Ø·Ø§Ø±ÙŠØ§Øª</p>
              <p className="text-xs text-slate-500 mt-0.5">Ø§Ù„ÙƒÙ…ÙŠØ©: 1</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-primary font-extrabold text-lg">{price} {currency}</p>
              {compareAt > price && <p className="text-slate-400 line-through text-xs">{compareAt} {currency}</p>}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Ø§Ù„Ø§Ø³Ù… Ø§Ù„ÙƒØ§Ù…Ù„ *</label>
              <input
                type="text"
                placeholder="Ø£Ø¯Ø®Ù„ Ø§Ø³Ù…Ùƒ Ø§Ù„ÙƒØ§Ù…Ù„"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Ø±Ù‚Ù… Ø§Ù„Ù‡Ø§ØªÙ *</label>
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
              <label className="block text-sm font-bold text-slate-700 mb-1">Ø§Ù„Ø¹Ù†ÙˆØ§Ù† *</label>
              <textarea
                placeholder="Ø§Ù„Ù…Ø¯ÙŠÙ†Ø© â€” Ø§Ù„Ø­ÙŠ â€” Ø¨Ø§Ù„Ù‚Ø±Ø¨ Ù…Ù†..."
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                rows={3}
                className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                required
              />
            </div>

            {error && (
              <p className="text-rose-600 text-sm bg-rose-50 border border-rose-200 rounded-xl px-4 py-2">
                âš ï¸ {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-green-500 hover:bg-green-600 disabled:opacity-60 disabled:cursor-not-allowed active:scale-95 text-white font-extrabold text-lg py-4 rounded-2xl shadow-lg shadow-green-200 transition-all duration-150"
            >
              {submitting ? "Ø¬Ø§Ø±ÙŠ Ø§Ù„Ø¥Ø±Ø³Ø§Ù„..." : "ØªØ£ÙƒÙŠØ¯ Ø§Ù„Ø·Ù„Ø¨ ðŸ›’"}
            </button>

            <div className="flex items-center justify-center gap-4 text-xs text-slate-500 pt-1">
              <span>ðŸ”’ Ø¨ÙŠØ§Ù†Ø§Øª Ø¢Ù…Ù†Ø©</span>
              <span>ðŸ’³ Ø§Ù„Ø¯ÙØ¹ Ø¹Ù†Ø¯ Ø§Ù„Ø§Ø³ØªÙ„Ø§Ù…</span>
              <span>ðŸšš ØªÙˆØµÙŠÙ„ Ø³Ø±ÙŠØ¹</span>
            </div>
          </form>
        </div>
      </section>

      {/* â”€â”€ Footer â”€â”€ */}
      <footer className="bg-slate-900 text-white text-center py-5 px-4 text-xs">
        <p className="font-bold text-base mb-1">Ø¬ÙˆØ¯Ø© Ù…Ø§Ø±ÙƒØª</p>
        <p className="text-slate-400">Ø§Ù„ÙˆØ¬Ù‡Ø© Ø§Ù„Ø£ÙˆÙ„Ù‰ Ù„Ù„ØªØ³ÙˆÙ‚ Ø§Ù„Ø¹Ø§Ø¦Ù„ÙŠ ÙÙŠ Ù„ÙŠØ¨ÙŠØ§</p>
        <p className="text-slate-500 mt-2">Ø¬Ù…ÙŠØ¹ Ø§Ù„Ø­Ù‚ÙˆÙ‚ Ù…Ø­ÙÙˆØ¸Ø© Â© {new Date().getFullYear()}</p>
      </footer>

      {/* â”€â”€ Sticky mobile CTA â”€â”€ */}
      {stickyVisible && (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-3 bg-white border-t border-slate-200 shadow-xl md:hidden">
          <button
            onClick={scrollToForm}
            className="w-full bg-green-500 hover:bg-green-600 active:scale-95 text-white font-extrabold text-base py-3.5 rounded-2xl shadow-lg shadow-green-200 transition-all duration-150"
            style={{ animation: "pulse-cta 2s ease-in-out infinite" }}
          >
            ðŸ›’ Ø§Ø·Ù„Ø¨ ØªÙˆØ© â€” {price} {currency} ÙÙ‚Ø·!
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




