import { useLocation } from "wouter";
import { WHATSAPP_NUMBER } from "@/lib/supabase";

export default function OrderSuccess() {
  const [, setLocation] = useLocation();
  const params = new URLSearchParams(window.location.search);
  const orderId = params.get("id") || "";

  return (
    <section className="mx-auto max-w-3xl px-4 py-24 md:px-6 text-center">
      <div className="rounded-[1.6rem] border border-green-200 bg-white p-10 shadow-sm">
        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-green-100 text-green-600 text-5xl">
          ✓
        </div>
        <h2 className="text-4xl font-bold text-slate-900">شكراً لك! تم تأكيد طلبك بنجاح</h2>
        {orderId && (
          <p className="mt-5 text-lg text-slate-700">
            رقم الطلب ديالك هو: <span className="font-bold text-primary">{orderId}</span>
          </p>
        )}
        <p className="mt-3 text-slate-600">
          سنتواصل معك في أقرب وقت لتأكيد تفاصيل الشحن والتوصيل.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => setLocation("/")}
            className="rounded-2xl bg-slate-900 px-8 py-3 font-semibold text-white hover:opacity-90 transition shadow-md"
          >
            العودة للرئيسية
          </button>
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("مرحبا، أريد الاستفسار عن طلبي رقم: " + orderId)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-2xl border border-green-500 bg-green-50 px-8 py-3 font-semibold text-green-700 hover:bg-green-100 transition"
          >
            تواصل واتساب
          </a>
        </div>
      </div>
    </section>
  );
}
