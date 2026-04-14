import { useLocation } from "wouter";
import { useStore } from "@/lib/store-context";
import { useCurrency } from "@/lib/currency-context";
import { COUPON_CODE } from "@/lib/supabase";

export default function Cart() {
  const [, setLocation] = useLocation();
  const { cart, coupon, couponApplied, subtotal, shipping, discount, total, setCoupon, setCouponApplied, updateQuantity, removeFromCart } = useStore();
  const { currency } = useCurrency();

  return (
    <section className="mx-auto max-w-7xl px-4 py-14 md:px-6">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">سلة المشتريات</p>
          <h2 className="mt-2 text-4xl font-bold">سلة تسوقك</h2>
        </div>
        <button onClick={() => setLocation("/products")} className="rounded-xl border border-slate-300 px-5 py-3 font-semibold hover:bg-slate-50 transition">
          مواصلة التسوق
        </button>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.6fr_0.8fr]">
        <div className="space-y-5">
          {cart.length === 0 && (
            <div className="rounded-[1.6rem] border border-dashed border-slate-300 p-10 text-center text-slate-500">
              السلة فارغة حالياً.
            </div>
          )}
          {cart.map((item) => (
            <div key={item.id} className="grid gap-4 rounded-[1.6rem] border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-[140px_1fr_auto] md:items-center">
              <div className="h-32 overflow-hidden rounded-2xl bg-slate-100">
                <img
                  src={`/${item.image}`}
                  alt={item.name}
                  className="h-full w-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
              </div>
              <div className="text-right">
                <h3 className="text-xl font-semibold">{item.name}</h3>
                {item.description && <p className="mt-2 text-sm text-slate-600">{item.description}</p>}
                <p className="mt-3 font-bold text-primary">{currency} {item.price}</p>
              </div>
              <div className="flex flex-col items-start gap-3 md:items-end">
                <div className="flex items-center gap-3 rounded-2xl border border-slate-300 px-3 py-2">
                  <button onClick={() => updateQuantity(item.id, -1)} className="text-lg font-bold w-6 text-center hover:text-primary">-</button>
                  <span className="min-w-6 text-center font-semibold">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, 1)} className="text-lg font-bold w-6 text-center hover:text-primary">+</button>
                </div>
                <button onClick={() => removeFromCart(item.id)} className="text-sm font-semibold text-red-600 hover:text-red-700 transition">إزالة</button>
              </div>
            </div>
          ))}
        </div>

        <div className="h-fit rounded-[1.6rem] border border-slate-200 bg-white p-6 shadow-sm text-right sticky top-24">
          <h3 className="text-2xl font-bold">ملخص الطلب</h3>

          <div className="mt-4 flex gap-2">
            <input
              value={coupon}
              onChange={(e) => setCoupon(e.target.value)}
              placeholder="كود الخصم"
              className="flex-1 rounded-2xl border border-slate-300 px-4 py-3 text-right outline-none focus:border-primary"
            />
            <button
              onClick={() => setCouponApplied(coupon.trim() === COUPON_CODE)}
              className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:opacity-90 transition"
            >
              تطبيق
            </button>
          </div>
          {couponApplied && <p className="mt-3 text-sm font-medium text-green-600">✓ تم تطبيق خصم 10%</p>}
          {!couponApplied && coupon.trim() !== "" && (
            <p className="mt-3 text-sm font-medium text-red-500">كود الخصم غير صحيح</p>
          )}

          <div className="mt-5 space-y-3 text-sm text-slate-600">
            <div className="flex items-center justify-between">
              <span>المجموع الفرعي</span>
              <span className="font-semibold text-slate-900">{currency} {subtotal}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>الشحن</span>
              <span className="font-bold text-green-600">مجانًا</span>
            </div>
            <div className="flex items-center justify-between">
              <span>الخصم</span>
              <span className="font-semibold text-slate-900">- {currency} {discount}</span>
            </div>
            <div className="border-t border-slate-200 pt-3">
              <div className="flex items-center justify-between text-base">
                <span className="font-semibold text-slate-900">الإجمالي</span>
                <span className="text-xl font-bold text-slate-900">{currency} {total}</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setLocation("/checkout")}
            className="mt-5 w-full rounded-2xl bg-slate-900 px-5 py-3 font-semibold text-white hover:opacity-90 transition shadow-md"
          >
            إتمام الطلب
          </button>
        </div>
      </div>
    </section>
  );
}
