import { useEffect } from "react";
import { useLocation } from "wouter";
import { useStore } from "@/lib/store-context";
import { useCurrency } from "@/lib/currency-context";
import { resolveProductImageUrl } from "@/lib/product-image";
import { useBranding } from "@/lib/branding-context";
import { getMarketCityPlaceholder, getMarketPhonePlaceholder } from "@/lib/market-country";

export default function Checkout() {
  const [, setLocation] = useLocation();
  const {
    cart, checkoutData, checkoutError, orderSuccess,
    handleCheckoutChange, handleCheckoutSubmit,
    subtotal, shipping, discount, total, clearOrderSuccess,
  } = useStore();
  const { currency } = useCurrency();
  const { marketCountry } = useBranding();

  useEffect(() => {
    if (orderSuccess) {
      setLocation(`/order-success?id=${encodeURIComponent(orderSuccess.id)}`);
      clearOrderSuccess();
    }
  }, [orderSuccess, setLocation, clearOrderSuccess]);

  const inputCls =
    "w-full rounded-2xl border border-slate-300 bg-white px-4 py-4 text-base text-right outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition min-h-[52px] touch-manipulation";

  return (
    <section className="mx-auto max-w-4xl px-4 py-8 md:py-14 md:px-6">
      <div className="mb-6 md:mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">إتمام الطلب</p>
        <h2 className="mt-2 text-3xl md:text-4xl font-bold">أكمل طلبك بسرعة</h2>
        <p className="mt-2 text-sm md:text-base text-slate-600">عمّر غير المعلومات الضرورية وسنتواصل معك لتأكيد الطلب وتفاصيل التوصيل.</p>
      </div>

      {/* On mobile: order summary first so user sees what they're buying */}
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        {/* Form */}
        <div className="order-2 lg:order-1">
          <div className="rounded-2xl md:rounded-[1.6rem] border border-slate-200 bg-white p-5 md:p-6 shadow-sm text-right">
            <h3 className="text-xl font-bold">معلومات الطلب</h3>

            <div className="mt-5 grid gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-1.5 text-right">الاسم الكامل</label>
                <input
                  type="text"
                  value={checkoutData.fullName}
                  onChange={(e) => handleCheckoutChange("fullName", e.target.value)}
                  placeholder="مثال: محمد علي"
                  className={inputCls}
                  autoComplete="name"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-1.5 text-right">المدينة</label>
                <input
                  type="text"
                  value={checkoutData.city}
                  onChange={(e) => handleCheckoutChange("city", e.target.value)}
                  placeholder={getMarketCityPlaceholder(marketCountry)}
                  className={inputCls}
                  autoComplete="address-level2"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-1.5 text-right">رقم الهاتف</label>
                <input
                  type="tel"
                  value={checkoutData.phone}
                  onChange={(e) => handleCheckoutChange("phone", e.target.value)}
                  placeholder={getMarketPhonePlaceholder(marketCountry)}
                  className={inputCls}
                  autoComplete="tel"
                  inputMode="tel"
                  dir="ltr"
                />
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
              <p className="font-semibold text-slate-900">طريقة الدفع</p>
              <p className="mt-2 text-sm text-slate-600">💵 الدفع عند الاستلام — لا تحتاج بطاقة بنكية</p>
            </div>

            {checkoutError && (
              <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                {checkoutError}
              </div>
            )}

            <button
              type="button"
              onClick={handleCheckoutSubmit}
              className="mt-6 w-full min-h-[56px] rounded-2xl bg-slate-900 px-5 py-4 text-base font-bold text-white hover:bg-primary transition-colors shadow-md touch-manipulation active:scale-[0.98]"
            >
              تأكيد الطلب الآن
            </button>

            <p className="mt-3 text-xs md:text-sm text-slate-500 text-center">
              🔒 معلوماتك آمنة — سنتواصل معك لتأكيد الطلب
            </p>
          </div>
        </div>

        {/* Order summary */}
        <div className="order-1 lg:order-2 h-fit rounded-2xl md:rounded-[1.6rem] border border-slate-200 bg-white p-5 md:p-6 shadow-sm text-right">
          <h3 className="text-xl font-bold mb-4">ملخص الطلب</h3>

          <div className="space-y-3">
            {cart.length === 0 ? (
              <p className="text-sm text-slate-500">السلة فارغة حالياً.</p>
            ) : (
              cart.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-3 text-sm py-2 border-b border-slate-50 last:border-0">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-slate-100 bg-slate-50">
                      {resolveProductImageUrl(item.image) ? (
                        <img
                          src={resolveProductImageUrl(item.image)}
                          alt={item.name}
                          className="h-full w-full object-cover"
                          onError={(event) => {
                            event.currentTarget.style.display = "none";
                            event.currentTarget.nextElementSibling?.classList.remove("hidden");
                          }}
                        />
                      ) : null}
                      <div className={`h-full w-full items-center justify-center text-xs font-bold text-slate-400 ${resolveProductImageUrl(item.image) ? "hidden" : "flex"}`}>
                        بدون صورة
                      </div>
                    </div>
                    <span className="min-w-0 text-slate-700 font-medium leading-snug">
  {item.name}
  {item.bundleQuantity
    ? ` × ${item.bundleQuantity} قطع`
    : ` × ${item.quantity}`}
</span>
                  </div>
                  <span className="font-bold text-slate-900 shrink-0">
  {currency}{" "}
  {(item.bundleTotalPrice !== undefined
    ? item.bundleTotalPrice * item.quantity
    : item.price * item.quantity
  ).toFixed(0)}
</span>
                </div>
              ))
            )}
          </div>

          <div className="mt-4 space-y-2.5 border-t border-slate-200 pt-4 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-slate-600">المجموع الفرعي</span>
              <span className="font-semibold">{currency} {subtotal}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600">الشحن</span>
              <span className="font-bold text-emerald-600">مجاني 🚚</span>
            </div>
            {discount > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-slate-600">الخصم</span>
                <span className="font-semibold text-rose-500">- {currency} {discount}</span>
              </div>
            )}
            <div className="flex items-center justify-between text-base font-black border-t border-slate-200 pt-3">
              <span className="text-slate-900">الإجمالي</span>
              <span className="text-primary text-xl">{currency} {total}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
