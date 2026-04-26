import { useState, useEffect, useCallback } from "react";
import { Link } from "wouter";
import { useStore } from "@/lib/store-context";
import { useCurrency } from "@/lib/currency-context";
import { apiFetch } from "@/lib/api";
import { buildAnnouncementSegment, getAnnouncementDuration } from "@/lib/announcement-marquee";
import { getDefaultHeroSlides, type HeroSlide } from "@/lib/hero-slider";
import {
  useGetProducts, getGetProductsQueryKey,
  useUpdateProduct,
} from "@/lib/api-client";
import { useQueryClient } from "@tanstack/react-query";
import {
  Search, ChevronRight, ChevronLeft, X, Check,
  Loader2, Package, ShoppingBag, Tag, Layers,
  ToggleLeft, ToggleRight, Star, Megaphone, Plus, Upload, ImageIcon, Settings,
} from "lucide-react";

/* ══════════════════════════════════════════════════════════
   ADMIN LOGIN
══════════════════════════════════════════════════════════ */
function AdminLogin() {
  const { adminSignIn } = useStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError("الرجاء إدخال البريد الإلكتروني وكلمة المرور.");
      return;
    }
    setLoading(true);
    setError("");
    const err = await adminSignIn(email.trim(), password);
    if (err) {
      setError("بيانات الدخول غير صحيحة. يرجى المحاولة مرة أخرى.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 mb-6 shadow-xl">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">لوحة الإدارة</h1>
          <p className="mt-2 text-sm text-blue-200/70">أدخل بيانات الدخول للمتابعة</p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-5" dir="rtl">
            <div>
              <label className="block text-sm font-medium text-blue-100 mb-2">البريد الإلكتروني</label>
              <input
                type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com" autoComplete="email"
                className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-white placeholder-white/30 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all text-right"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-blue-100 mb-2">كلمة المرور</label>
              <input
                type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" autoComplete="current-password"
                className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-white placeholder-white/30 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all text-right"
              />
            </div>
            {error && (
              <div className="flex items-center gap-2 rounded-xl bg-red-500/15 border border-red-400/30 px-4 py-3">
                <svg className="w-4 h-4 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-red-300">{error}</p>
              </div>
            )}
            <button
              type="submit" disabled={loading}
              className="w-full rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed px-5 py-3.5 font-semibold text-white transition-all shadow-lg shadow-blue-600/30 mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  جارٍ التحقق…
                </span>
              ) : "تسجيل الدخول"}
            </button>
          </form>
        </div>

        <div className="text-center mt-6">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-blue-200/60 hover:text-blue-100 transition-colors duration-200 group">
            <svg className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 5l7 7-7 7" />
            </svg>
            العودة إلى المتجر
          </Link>
        </div>
        <p className="text-center text-xs text-white/25 mt-6">جودة ماركت · لوحة التحكم الإدارية</p>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   ORDERS TAB
══════════════════════════════════════════════════════════ */
function OrdersTab() {
  const { orders, updateOrderStatus, deleteOrder, clearAllOrders, exportOrdersCSV, copyOrderToWhatsApp, openOrderInWhatsApp, loadOrders, statusLabel, statusClass } = useStore();
  const { currency } = useCurrency();

  return (
    <div className="grid gap-6">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-[1.6rem] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="text-right">
          <p className="text-lg font-bold">عدد الطلبات: {orders.length}</p>
          <p className="text-sm text-slate-500">يمكنك تغيير الحالة أو حذف أي طلب.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={loadOrders} className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold hover:bg-slate-50 transition">تحديث</button>
          <button onClick={exportOrdersCSV} className="rounded-xl border border-green-300 px-4 py-2 text-sm font-semibold text-green-700 hover:bg-green-50 transition">تصدير CSV</button>
          <button onClick={clearAllOrders} className="rounded-xl border border-red-300 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 transition">مسح الكل</button>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="rounded-[1.6rem] border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">لا توجد طلبات حالياً.</div>
      ) : (
        <div className="grid gap-5">
          {orders.map((order) => (
            <div key={order.id} className="rounded-[1.6rem] border border-slate-200 bg-white p-6 shadow-sm text-right">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <h3 className="text-xl font-bold">{order.customer.fullName}</h3>
                    <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusClass(order.status)}`}>{statusLabel(order.status)}</span>
                  </div>

                  <div className="mt-4 w-full rounded-xl bg-slate-50 p-4 border border-slate-100">
                    <h4 className="mb-3 text-sm font-bold text-slate-800 border-b border-slate-200 pb-2">📦 تفاصيل الطلبية:</h4>
                    <ul className="space-y-2">
                      {(order.items || []).map((item, idx) => (
                        <li key={idx} className="flex justify-between items-center text-sm">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-900">{item.name}</span>
                            <span className="rounded-md bg-slate-200 px-2 py-0.5 text-xs font-bold text-slate-600">x{item.quantity || 1}</span>
                          </div>
                          <span className="font-bold text-slate-700">{currency} {item.price}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-3 pt-3 border-t border-slate-200 flex justify-between items-center">
                      <span className="text-sm font-bold text-slate-600">الإجمالي:</span>
                      <span className="text-lg font-black text-green-600">{currency} {order.total}</span>
                    </div>
                  </div>

                  <p className="mt-3 text-sm text-slate-600">رقم الطلب: <span className="font-mono">{order.id}</span></p>
                  <p className="mt-1 text-sm text-slate-600">المدينة: {order.customer.city}</p>
                  <p className="mt-1 text-sm text-slate-600">الهاتف: <span dir="ltr">{order.customer.phone}</span></p>
                  <p className="mt-1 text-sm text-slate-600">الدفع: {order.paymentMethod}</p>
                  <p className="mt-1 text-sm text-slate-600">التاريخ: {new Date(order.createdAt).toLocaleString("ar-EG")}</p>
                </div>

                <div className="flex flex-col gap-2 min-w-[140px]">
                  <select
                    value={order.status || "new"}
                    onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                    className="rounded-xl border border-slate-300 px-4 py-2 text-sm outline-none bg-white"
                  >
                    <option value="new">جديد</option>
                    <option value="confirmed">تم التأكيد</option>
                    <option value="shipped">تم الشحن</option>
                    <option value="delivered">تم التسليم</option>
                    <option value="cancelled">ملغي</option>
                  </select>
                  <button onClick={() => copyOrderToWhatsApp(order)} className="rounded-xl border border-blue-300 px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50 transition">نسخ الطلب</button>
                  <button onClick={() => openOrderInWhatsApp(order)} className="rounded-xl border border-green-400 px-4 py-2 text-sm font-semibold text-green-700 hover:bg-green-50 transition">إرسال واتساب</button>
                  <button onClick={() => deleteOrder(order.id)} className="rounded-xl border border-red-300 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 transition">حذف الطلب</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   EDIT PRICE MODAL
══════════════════════════════════════════════════════════ */
type Product = {
  id: string; nameAr: string; price: number; compareAtPrice: number | null;
  stock: number; imageUrl: string | null; categoryName: string | null;
  active: boolean; featured: boolean; badge: string | null; rating: number;
};

/* ─── Shared Image Input (upload from device OR paste URL) ──────── */
function ProductImageInput({
  value,
  onChange,
}: {
  value?: string | null;
  onChange: (url: string) => void;
}) {
  const safeValue = typeof value === "string" ? value : "";
  const [uploading, setUploading] = useState(false);
  const [urlDraft, setUrlDraft] = useState(safeValue);
  const [uploadError, setUploadError] = useState("");

  useEffect(() => { setUrlDraft(safeValue); }, [safeValue]);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    setUploadError("");
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const uploadResult = await apiFetch<{
        url?: string;
        publicUrl?: string;
        path?: string;
      }>("/api/upload", {
        method: "POST",
        body: fd,
      });
      const uploadedUrl =
        uploadResult?.url || uploadResult?.publicUrl || uploadResult?.path;
      if (!uploadedUrl) {
        console.error("Admin product image upload response missing URL", {
          uploadResult,
        });
        throw new Error("Upload response missing URL");
      }

      try {
        const normalizedUploadedUrl = String(uploadedUrl);
        setUrlDraft(normalizedUploadedUrl);
        onChange(normalizedUploadedUrl);
      } catch (stateError) {
        console.error("Admin product image state update failed", {
          stateError,
          uploadedUrl,
        });
        throw stateError;
      }
    } catch (error) {
      console.error("Admin product image upload failed", {
        error,
        fileName: file?.name,
        fileType: file?.type,
        fileSize: file?.size,
      });
      setUploadError("Failed to upload image. Please try a smaller file.");
    }
    finally { setUploading(false); }
  };

  const resolvePreview = (url: string) =>
    !url ? "" : url.startsWith("http") || url.startsWith("/") ? url : `/${url}`;

  return (
    <div className="space-y-2">
      {/* Preview */}
      {safeValue ? (
        <div className="relative w-full h-36 rounded-xl bg-slate-50 border border-slate-200 overflow-hidden flex items-center justify-center">
          <img
            src={resolvePreview(safeValue)}
            alt=""
            className="max-h-full max-w-full object-contain"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute top-2 left-2 bg-white rounded-full p-1 shadow hover:bg-red-50 transition-colors"
          >
            <X className="h-3.5 w-3.5 text-slate-500" />
          </button>
        </div>
      ) : (
        <div className="w-full h-24 rounded-xl bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center">
          <ImageIcon className="h-8 w-8 text-slate-300" />
        </div>
      )}

      {/* Upload button */}
      <label className={`flex items-center justify-center gap-2 cursor-pointer rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-600 hover:border-primary hover:bg-primary/5 transition-colors w-full ${uploading ? "opacity-60 pointer-events-none" : ""}`}>
        {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
        {uploading ? "جارٍ الرفع…" : "رفع صورة من الجهاز"}
        <input type="file" accept="image/*,image/gif" className="hidden" onChange={handleFile} disabled={uploading} />
      </label>

      {uploadError && (
        <p className="text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-2.5 py-1.5">
          {uploadError}
        </p>
      )}

      {/* URL paste */}
      <input
        type="text"
        value={urlDraft}
        onChange={e => setUrlDraft(e.target.value)}
        onBlur={() => {
          if (uploading) return;
          const nextUrl = urlDraft.trim();
          if (nextUrl !== safeValue) onChange(nextUrl);
        }}
        onKeyDown={e => {
          if (e.key === "Enter") {
            e.preventDefault();
            const nextUrl = urlDraft.trim();
            if (nextUrl !== safeValue) onChange(nextUrl);
          }
        }}
        placeholder="أو الصق رابط الصورة مباشرةً هنا…"
        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-primary focus:bg-white transition-all"
        dir="ltr"
      />
    </div>
  );
}

/* ─── Create Product Modal ───────────────────────────────── */
function CreateProductModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const queryClient = useQueryClient();
  const { currency } = useCurrency();
  const [nameAr, setNameAr] = useState("");
  const [price, setPrice] = useState("");
  const [priceQty2, setPriceQty2] = useState("");
  const [priceQty3, setPriceQty3] = useState("");
  const [stock, setStock] = useState("0");
  const [imageUrl, setImageUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!nameAr.trim()) { setError("اسم المنتج مطلوب."); return; }
    const priceNum = parseFloat(price);
    if (!price || isNaN(priceNum) || priceNum < 0) { setError("الرجاء إدخال سعر صحيح."); return; }
    const stockNum = Math.max(0, parseInt(stock) || 0);

    setSaving(true);
    try {
      await apiFetch("/api/products", {
        method: "POST",
        body: {
          nameAr: nameAr.trim(),
          name: nameAr.trim(),
          price: priceNum,
          priceQty2: priceQty2 ? parseFloat(priceQty2) : null,
          priceQty3: priceQty3 ? parseFloat(priceQty3) : null,
          stock: stockNum,
          imageUrl: imageUrl.trim() || null,
          active: true,
        },
      });
      queryClient.invalidateQueries({ queryKey: ["getProducts"] });
      onSaved();
      onClose();
    } catch (error) {
      console.error("Failed to create product from admin modal", error);
      setError("حدث خطأ أثناء الإضافة. حاول مرة أخرى.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl w-full sm:max-w-md text-right overflow-y-auto max-h-[92vh]" dir="rtl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 sticky top-0 bg-white z-10">
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-slate-100 transition-colors">
            <X className="h-5 w-5 text-slate-500" />
          </button>
          <div className="text-center">
            <p className="text-xs text-slate-400 font-medium">إضافة منتج</p>
            <h3 className="font-bold text-slate-900 text-base">منتج جديد</h3>
          </div>
          <div className="w-8" />
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          {/* Name */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">اسم المنتج *</label>
            <input
              type="text"
              value={nameAr}
              onChange={e => setNameAr(e.target.value)}
              placeholder="مثال: كريم الترطيب الليلي"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-right outline-none focus:border-primary focus:bg-white transition-all"
              autoFocus
            />
          </div>

          {/* Price + Stock side by side */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">السعر ({currency}) *</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={price}
                onChange={e => setPrice(e.target.value)}
                placeholder="0.00"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-right outline-none focus:border-primary focus:bg-white transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">الكمية (سطوك)</label>
              <input
                type="number"
                min="0"
                step="1"
                value={stock}
                onChange={e => setStock(e.target.value)}
                placeholder="0"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-right outline-none focus:border-primary focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Volume pricing */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">أسعار الكميات <span className="text-slate-400 font-normal">(اختياري — لتفعيل عروض الحجم)</span></label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-500 mb-1">سعر قطعتين ({currency})</label>
                <input
                  type="number" min="0" step="0.5" value={priceQty2}
                  onChange={e => setPriceQty2(e.target.value)}
                  placeholder="مثال: 79"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-right outline-none focus:border-primary focus:bg-white transition-all"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">سعر 3 قطع ({currency})</label>
                <input
                  type="number" min="0" step="0.5" value={priceQty3}
                  onChange={e => setPriceQty3(e.target.value)}
                  placeholder="مثال: 110"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-right outline-none focus:border-primary focus:bg-white transition-all"
                />
              </div>
            </div>
          </div>

          {/* Image */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">الصورة الرئيسية للمنتج</label>
            <ProductImageInput value={imageUrl} onChange={setImageUrl} />
          </div>

          {error && (
            <p className="text-sm text-red-600 font-medium bg-red-50 rounded-xl px-4 py-2.5">{error}</p>
          )}

          <div className="flex gap-3 pb-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-slate-200 bg-white text-slate-700 font-bold py-3 text-sm hover:bg-slate-50 transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-xl bg-primary text-white font-bold py-3 text-sm hover:bg-blue-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              {saving ? "جارٍ الحفظ…" : "إضافة المنتج"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EditModal({ product, onClose, onSaved }: { product: Product; onClose: () => void; onSaved: () => void }) {
  const { currency } = useCurrency();
  const { mutateAsync: updateProduct } = useUpdateProduct();
  const initialPrice = Number.isFinite(Number(product.price)) ? String(Number(product.price)) : "0";
  const initialComparePrice = Number.isFinite(Number(product.compareAtPrice))
    ? String(Number(product.compareAtPrice))
    : "";
  const initialPriceQty2 = Number.isFinite(Number((product as any).priceQty2))
    ? String(Number((product as any).priceQty2))
    : "";
  const initialPriceQty3 = Number.isFinite(Number((product as any).priceQty3))
    ? String(Number((product as any).priceQty3))
    : "";
  const initialStock = Number.isFinite(Number(product.stock)) ? String(Number(product.stock)) : "0";
  const initialImageUrl = typeof product.imageUrl === "string" ? product.imageUrl : "";
  const initialActive = Boolean(product.active);
  const initialFeatured = Boolean(product.featured);

  const [price, setPrice] = useState(initialPrice);
  const [comparePrice, setComparePrice] = useState(initialComparePrice);
  const [priceQty2, setPriceQty2] = useState(initialPriceQty2);
  const [priceQty3, setPriceQty3] = useState(initialPriceQty3);
  const [stock, setStock] = useState(initialStock);
  const [imageUrl, setImageUrl] = useState(initialImageUrl);
  const [active, setActive] = useState(initialActive);
  const [featured, setFeatured] = useState(initialFeatured);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [err, setErr] = useState("");

  const imgSrc = initialImageUrl
    ? (initialImageUrl.startsWith("http") || initialImageUrl.startsWith("/") ? initialImageUrl : `/${initialImageUrl}`)
    : null;

  const priceNum = parseFloat(price);
  const comparePriceNum = comparePrice ? parseFloat(comparePrice) : null;
  const stockNum = parseInt(stock);

  const valid =
    !isNaN(priceNum) && priceNum >= 0 &&
    (comparePrice === "" || (!isNaN(comparePriceNum!) && comparePriceNum! >= 0)) &&
    !isNaN(stockNum) && stockNum >= 0;

  const handleSave = async () => {
    if (!valid) { setErr("تأكد من صحة القيم المُدخلة."); return; }
    setErr("");
    setSaving(true);
    try {
      await updateProduct({
        id: product.id,
        data: {
          price: priceNum,
          compareAtPrice: comparePriceNum,
          priceQty2: priceQty2 ? parseFloat(priceQty2) : null,
          priceQty3: priceQty3 ? parseFloat(priceQty3) : null,
          stock: stockNum,
          imageUrl: imageUrl.trim() || null,
          active,
          featured,
        } as any,
      });
      setSaved(true);
      setTimeout(() => { onSaved(); onClose(); }, 900);
    } catch (error) {
      console.error("Failed to update product from admin modal", {
        error,
        productId: product.id,
      });
      setErr("حدث خطأ أثناء الحفظ. يرجى المحاولة مجدداً.");
    } finally {
      setSaving(false);
    }
  };

  /* Close on backdrop click */
  const handleBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  /* Close on Escape */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4"
      onClick={handleBackdrop}
    >
      <div className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[92vh] animate-in slide-in-from-bottom-4 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <button onClick={onClose} className="rounded-xl p-2 hover:bg-slate-100 transition text-slate-500">
            <X className="h-5 w-5" />
          </button>
          <div className="text-center flex-1">
            <p className="text-xs text-slate-400 font-medium">تعديل المنتج</p>
            <h3 className="font-bold text-slate-900 text-sm mt-0.5 truncate max-w-[220px] mx-auto">{product.nameAr}</h3>
          </div>
          <div className="w-9" />
        </div>

        {/* Product preview */}
        <div className="flex items-center gap-3 px-5 py-4 bg-slate-50 border-b border-slate-100">
          <div className="w-14 h-14 rounded-xl bg-white border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
            {imgSrc
              ? <img src={imgSrc} alt={product.nameAr} className="w-full h-full object-contain" />
              : <Package className="h-6 w-6 text-slate-300" />
            }
          </div>
          <div className="text-right flex-1 min-w-0">
            <p className="text-xs text-slate-400 truncate">{product.categoryName || "بدون فئة"}</p>
            <div className="flex items-center gap-2 flex-wrap mt-0.5">
              <span className="text-lg font-black text-primary">{product.price} {currency}</span>
              {product.compareAtPrice && (
                <span className="text-sm text-slate-400 line-through">{product.compareAtPrice} {currency}</span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">المخزون الحالي: <span className="font-bold text-slate-700">{product.stock}</span></p>
          </div>
        </div>

        {/* Form */}
        <div className="px-5 py-5 space-y-4 overflow-y-auto flex-1" dir="rtl">
          {/* Price */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">
              السعر الجديد <span className="text-slate-400 font-normal">({currency})</span>
            </label>
            <div className="relative">
              <input
                type="number" min="0" step="0.5" value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full rounded-xl border-2 border-slate-200 focus:border-primary px-4 py-3 text-xl font-black text-slate-900 outline-none transition-colors bg-white text-right"
                placeholder="0.00"
              />
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">{currency}</span>
            </div>
          </div>

          {/* Compare-at price */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">
              السعر الأصلي (قبل الخصم) <span className="text-slate-400 font-normal">— اختياري</span>
            </label>
            <div className="relative">
              <input
                type="number" min="0" step="0.5" value={comparePrice}
                onChange={(e) => setComparePrice(e.target.value)}
                className="w-full rounded-xl border-2 border-slate-200 focus:border-primary px-4 py-3 text-lg font-bold text-slate-500 outline-none transition-colors bg-white text-right"
                placeholder="اتركه فارغاً إن لم يكن هناك خصم"
              />
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">{currency}</span>
            </div>
            {comparePrice && comparePriceNum && priceNum && comparePriceNum > priceNum && (
              <p className="text-xs text-emerald-600 font-semibold mt-1 text-right">
                ✅ خصم {Math.round(((comparePriceNum - priceNum) / comparePriceNum) * 100)}% — توفير {(comparePriceNum - priceNum).toFixed(0)} {currency}
              </p>
            )}
          </div>

          {/* Volume pricing */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">
              أسعار الكميات <span className="text-slate-400 font-normal">— اختياري</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <label className="block text-xs text-slate-500 mb-1">سعر قطعتين</label>
                <input
                  type="number" min="0" step="0.5" value={priceQty2}
                  onChange={(e) => setPriceQty2(e.target.value)}
                  className="w-full rounded-xl border-2 border-slate-200 focus:border-primary px-4 py-2.5 text-base font-bold text-slate-700 outline-none transition-colors bg-white text-right"
                  placeholder="فارغ = غير مفعّل"
                />
              </div>
              <div className="relative">
                <label className="block text-xs text-slate-500 mb-1">سعر 3 قطع</label>
                <input
                  type="number" min="0" step="0.5" value={priceQty3}
                  onChange={(e) => setPriceQty3(e.target.value)}
                  className="w-full rounded-xl border-2 border-slate-200 focus:border-primary px-4 py-2.5 text-base font-bold text-slate-700 outline-none transition-colors bg-white text-right"
                  placeholder="فارغ = غير مفعّل"
                />
              </div>
            </div>
          </div>

          {/* Stock */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">الكمية في المخزون (سطوك)</label>
            <input
              type="number" min="0" step="1" value={stock}
              onChange={(e) => setStock(e.target.value)}
              className="w-full rounded-xl border-2 border-slate-200 focus:border-primary px-4 py-3 text-lg font-bold text-slate-900 outline-none transition-colors bg-white text-right"
              placeholder="0"
            />
          </div>

          {/* Image */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">الصورة الرئيسية للمنتج</label>
            <ProductImageInput value={imageUrl} onChange={setImageUrl} />
          </div>

          {/* Toggles */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button" onClick={() => setActive(!active)}
              className={`flex items-center justify-between gap-2 rounded-xl border-2 px-4 py-3 transition-all ${active ? "border-emerald-400 bg-emerald-50 text-emerald-800" : "border-slate-200 bg-slate-50 text-slate-500"}`}
            >
              <span className="text-sm font-bold">نشط</span>
              {active ? <ToggleRight className="h-5 w-5" /> : <ToggleLeft className="h-5 w-5" />}
            </button>
            <button
              type="button" onClick={() => setFeatured(!featured)}
              className={`flex items-center justify-between gap-2 rounded-xl border-2 px-4 py-3 transition-all ${featured ? "border-amber-400 bg-amber-50 text-amber-800" : "border-slate-200 bg-slate-50 text-slate-500"}`}
            >
              <span className="text-sm font-bold">مميّز</span>
              <Star className={`h-4 w-4 ${featured ? "fill-amber-400 text-amber-400" : ""}`} />
            </button>
          </div>

          {/* Error */}
          {err && (
            <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 text-right">
              {err}
            </div>
          )}

          {/* Save button */}
          <button
            onClick={handleSave} disabled={saving || !valid || saved}
            className={`w-full rounded-xl px-5 py-4 font-black text-white text-base transition-all shadow-lg touch-manipulation ${
              saved
                ? "bg-emerald-500 shadow-emerald-200"
                : "bg-primary hover:bg-blue-700 shadow-primary/30 disabled:opacity-50 disabled:cursor-not-allowed"
            }`}
          >
            {saved ? (
              <span className="flex items-center justify-center gap-2"><Check className="h-5 w-5" /> تم الحفظ بنجاح!</span>
            ) : saving ? (
              <span className="flex items-center justify-center gap-2"><Loader2 className="h-5 w-5 animate-spin" /> جارٍ الحفظ…</span>
            ) : "حفظ التغييرات"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   PRODUCTS TAB
══════════════════════════════════════════════════════════ */
const PAGE_SIZE = 20;

function ProductsTab() {
  const queryClient = useQueryClient();
  const { currency } = useCurrency();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  /* Debounce search */
  useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 350);
    return () => clearTimeout(t);
  }, [search]);

  const queryParams = {
    includeInactive: "true",
    ...(debouncedSearch ? { search: debouncedSearch } : {}),
    page: String(page),
    limit: String(PAGE_SIZE),
  };

  const { data, isLoading, isFetching, error } = useGetProducts(queryParams, {
    query: { queryKey: getGetProductsQueryKey(queryParams) },
  });

  const products: Product[] = (data as any)?.products ?? [];
  const total: number = (data as any)?.total ?? 0;
  const totalPages: number = (data as any)?.totalPages ?? 1;

  const handleSaved = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["getProducts"] });
  }, [queryClient]);

  const handleDelete = useCallback(async (id: string, name: string) => {
    if (!window.confirm(`هل أنت متأكد من حذف هذا المنتج؟\n"${name}"`)) return;
    try {
      await apiFetch(`/api/products?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      queryClient.invalidateQueries({ queryKey: ["getProducts"] });
    } catch {
      alert("حدث خطأ أثناء حذف المنتج، حاول مجدداً.");
    }
  }, [queryClient]);

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-[1.6rem] border border-slate-200 bg-white p-4 shadow-sm">
        {/* Search */}
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث عن منتج بالاسم…"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 pr-10 pl-4 py-2.5 text-sm outline-none focus:border-primary focus:bg-white transition-all text-right"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700">
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right">
            <p className="text-sm font-bold text-slate-700">{total} منتج</p>
            {isFetching && !isLoading && <p className="text-xs text-slate-400">جارٍ التحديث…</p>}
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 rounded-xl bg-primary hover:bg-blue-700 text-white text-sm font-bold px-4 py-2.5 transition-colors touch-manipulation"
          >
            <Plus className="h-4 w-4" />
            إضافة منتج
          </button>
        </div>
      </div>

      {/* Loading skeleton */}
      {isLoading && (
        <div className="grid gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-slate-100 bg-white p-4 flex items-center gap-3 animate-pulse">
              <div className="w-14 h-14 rounded-xl bg-slate-100 shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-slate-100 rounded-lg w-2/3" />
                <div className="h-3 bg-slate-100 rounded-lg w-1/3" />
              </div>
              <div className="w-20 h-9 bg-slate-100 rounded-xl" />
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-center text-red-700 text-sm font-medium">
          حدث خطأ أثناء تحميل المنتجات. حاول مرة أخرى.
        </div>
      )}

      {/* Empty */}
      {!isLoading && !error && products.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center text-slate-400">
          <Package className="h-10 w-10 mx-auto mb-3 opacity-40" />
          <p className="font-medium">لا توجد منتجات مطابقة لبحثك.</p>
        </div>
      )}

      {/* Product cards */}
      {!isLoading && products.length > 0 && (
        <div className="grid gap-2.5">
          {products.map((p) => {
            const imgSrc = p.imageUrl
              ? (p.imageUrl.startsWith("http") || p.imageUrl.startsWith("/") ? p.imageUrl : `/${p.imageUrl}`)
              : null;
            const discount = p.compareAtPrice && p.compareAtPrice > p.price
              ? Math.round(((p.compareAtPrice - p.price) / p.compareAtPrice) * 100)
              : null;

            return (
              <div
                key={p.id}
                className={`rounded-2xl border bg-white p-3 flex items-center gap-3 transition-shadow hover:shadow-md ${
                  !p.active ? "opacity-60 border-slate-100" : "border-slate-200"
                }`}
              >
                {/* Thumbnail */}
                <div className="w-14 h-14 rounded-xl bg-slate-50 border border-slate-100 overflow-hidden shrink-0 flex items-center justify-center">
                  {imgSrc
                    ? <img src={imgSrc} alt={p.nameAr} className="w-full h-full object-contain" />
                    : <Package className="h-5 w-5 text-slate-300" />
                  }
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 text-right">
                  <div className="flex items-center gap-1.5 flex-wrap justify-end">
                    <p className="font-bold text-slate-900 text-sm truncate">{p.nameAr}</p>
                    {p.featured && <span className="text-[10px] bg-amber-100 text-amber-700 font-bold px-1.5 py-0.5 rounded-md">مميز</span>}
                    {!p.active && <span className="text-[10px] bg-slate-100 text-slate-500 font-bold px-1.5 py-0.5 rounded-md">معطّل</span>}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{p.categoryName || "بدون فئة"} · مخزون: {p.stock}</p>
                  <div className="flex items-baseline gap-1.5 mt-1 justify-end">
                    <span className="text-base font-black text-primary">{p.price} {currency}</span>
                    {p.compareAtPrice && p.compareAtPrice > p.price && (
                      <>
                        <span className="text-xs text-slate-400 line-through">{p.compareAtPrice}</span>
                        <span className="text-[10px] bg-rose-100 text-rose-600 font-bold px-1.5 py-0.5 rounded-md">-{discount}%</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-1.5 shrink-0">
                  <button
                    onClick={() => setEditingProduct(p)}
                    className="rounded-xl bg-slate-900 hover:bg-primary text-white text-xs font-bold px-3 py-2 transition-colors touch-manipulation"
                  >
                    تعديل
                  </button>
                  <button
                    onClick={() => handleDelete(p.id, p.nameAr)}
                    className="rounded-xl bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white text-xs font-bold px-3 py-2 transition-colors touch-manipulation border border-rose-200 hover:border-rose-600"
                  >
                    حذف
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition"
          >
            <ChevronRight className="h-4 w-4" />
            السابق
          </button>
          <span className="text-sm text-slate-500 font-medium">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition"
          >
            التالي
            <ChevronLeft className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Edit Modal */}
      {editingProduct && (
        <EditModal
          product={editingProduct}
          onClose={() => setEditingProduct(null)}
          onSaved={handleSaved}
        />
      )}

      {/* Create Product Modal */}
      {showCreateModal && (
        <CreateProductModal
          onClose={() => setShowCreateModal(false)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   LANDING PAGES TAB
══════════════════════════════════════════════════════════ */
interface AdminLandingPage {
  id: string;
  productId: string;
  slug: string;
  headline: string;
  subheadline: string;
  mediaUrls: string[];
  features: string[];
  boxContents?: string | null;
  urgencyText?: string | null;
  productNameAr: string;
  productImageUrl?: string | null;
  productPrice: string;
}

const EMPTY_LP_FORM = {
  productId: "", slug: "", headline: "", subheadline: "",
  mediaUrls: [""], features: [""], boxContents: "", urgencyText: "",
};

function LandingPagesTab() {
  const { currency } = useCurrency();
  const [pages, setPages] = useState<AdminLandingPage[]>([]);
  const [loadingPages, setLoadingPages] = useState(true);
  const [mode, setMode] = useState<"list" | "create" | "edit">("list");
  const [editingPage, setEditingPage] = useState<AdminLandingPage | null>(null);
  const [form, setForm] = useState(EMPTY_LP_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const landingProductQuery = { limit: "500", includeInactive: "true" } as const;
  const { data: productsData } = useGetProducts(landingProductQuery, {
    query: { queryKey: getGetProductsQueryKey(landingProductQuery) },
  });
  const allProducts: any[] = (productsData as any)?.products ?? [];

  const loadPages = useCallback(async () => {
    setLoadingPages(true);
    try {
      const data = await apiFetch<AdminLandingPage[]>("/api/landing-pages", {
        auth: false,
      });
      setPages(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load admin landing pages", error);
      setPages([]);
    }
    finally { setLoadingPages(false); }
  }, []);

  useEffect(() => { loadPages(); }, [loadPages]);

  const openCreate = () => {
    setForm(EMPTY_LP_FORM);
    setEditingPage(null);
    setMode("create");
    setFormError("");
  };

  const openEdit = (p: AdminLandingPage) => {
    setEditingPage(p);
    setForm({
      productId: p.productId,
      slug: p.slug,
      headline: p.headline,
      subheadline: p.subheadline ?? "",
      mediaUrls: Array.isArray(p.mediaUrls) && p.mediaUrls.length > 0
        ? p.mediaUrls.map((u) => (typeof u === "string" ? u : ""))
        : [""],
      features: p.features.length > 0 ? p.features : [""],
      boxContents: p.boxContents ?? "",
      urgencyText: p.urgencyText ?? "",
    });
    setMode("edit");
    setFormError("");
  };

  const handleSave = async () => {
    setFormError("");
    if (!form.productId || !form.slug || !form.headline) {
      setFormError("المنتج والرابط والعنوان الرئيسي مطلوبة.");
      return;
    }
    setSaving(true);
    try {
      const body = {
        ...form,
        features: form.features
          .filter((f): f is string => typeof f === "string" && f.trim().length > 0)
          .map((f) => f.trim()),
        mediaUrls: form.mediaUrls
          .filter((u): u is string => typeof u === "string" && u.trim().length > 0)
          .map((u) => u.trim()),
        boxContents: form.boxContents || null,
        urgencyText: form.urgencyText || null,
      };
      const url = mode === "edit"
        ? `/api/landing-pages?id=${encodeURIComponent(editingPage!.id)}`
        : "/api/landing-pages";
      await apiFetch(url, {
        method: mode === "edit" ? "PUT" : "POST",
        body,
      });
      await loadPages();
      setMode("list");
    } catch (e: any) {
      console.error("Failed to save landing page", {
        error: e,
        mode,
        landingPageId: editingPage?.id ?? null,
      });
      setFormError(e.message ?? "صار خطأ، حاول مرة ثانية.");
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    await apiFetch(`/api/landing-pages?id=${encodeURIComponent(deleteId)}`, {
      method: "DELETE",
    });
    setDeleteId(null);
    setDeleting(false);
    await loadPages();
  };

  const updateFeature = (i: number, val: string) => {
    setForm((prev) => {
      const features = [...prev.features];
      features[i] = val;
      return { ...prev, features };
    });
  };
  const addFeature = () =>
    setForm((prev) => ({ ...prev, features: [...prev.features, ""] }));
  const removeFeature = (i: number) =>
    setForm((prev) => ({
      ...prev,
      features: prev.features.filter((_, j) => j !== i),
    }));

  const updateMediaUrl = (i: number, val: string) => {
    setForm((prev) => {
      const mediaUrls = [...prev.mediaUrls];
      if (i >= mediaUrls.length) {
        mediaUrls.push(val);
      } else {
        mediaUrls[i] = val;
      }
      return { ...prev, mediaUrls };
    });
  };
  const addMedia = () =>
    setForm((prev) => ({ ...prev, mediaUrls: [...prev.mediaUrls, ""] }));
  const removeMedia = (i: number) =>
    setForm((prev) => ({
      ...prev,
      mediaUrls: prev.mediaUrls.filter((_, j) => j !== i),
    }));

  const [uploadingIdx, setUploadingIdx] = useState<number | null>(null);
  const normalizeMediaUrl = (url: string) =>
    !url ? "" : url.startsWith("http") || url.startsWith("/") ? url : `/${url}`;
  const isVideoMedia = (url: string) =>
    /\.(mp4|webm|mov)(\?.*)?$/i.test(url.trim());
  const isExternalEmbedLink = (url: string) =>
    /(?:youtube\.com|youtu\.be|tiktok\.com)/i.test(url.trim());

  const handleFileUpload = async (i: number, file: File) => {
    setUploadingIdx(i);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const uploadResult = await apiFetch<{
        url?: string;
        publicUrl?: string;
        path?: string;
      }>("/api/upload", {
        method: "POST",
        body: fd,
      });
      const uploadedUrl = uploadResult?.url || uploadResult?.publicUrl || uploadResult?.path;
      if (!uploadedUrl) {
        console.error("Landing page media upload response missing URL", {
          uploadResult,
          index: i,
          fileName: file?.name,
        });
        throw new Error("Upload response did not include media URL");
      }
      try {
        updateMediaUrl(i, String(uploadedUrl));
      } catch (stateError) {
        console.error("Landing page media state update failed", {
          stateError,
          index: i,
          uploadedUrl,
        });
        throw stateError;
      }
      setFormError("");
    } catch (error) {
      console.error("Landing page media upload failed", {
        error,
        index: i,
        fileName: file?.name,
        fileType: file?.type,
      });
      setFormError("فشل رفع الوسائط، حاول مرة ثانية.");
    } finally {
      setUploadingIdx(null);
    }
  };

  /* ── Form view (create / edit) ── */
  if (mode === "create" || mode === "edit") {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <button onClick={() => setMode("list")} className="text-slate-500 hover:text-slate-800 flex items-center gap-1 text-sm font-semibold">
            <ChevronRight className="h-4 w-4" /> رجوع للقائمة
          </button>
          <h3 className="font-extrabold text-slate-900 text-lg">{mode === "create" ? "صفحة هبوط جديدة" : "تعديل الصفحة"}</h3>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5 max-w-2xl">

          {/* Product */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">المنتج *</label>
            <select
              value={form.productId}
              onChange={e => setForm((prev) => ({ ...prev, productId: e.target.value }))}
              className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-white"
            >
              <option value="">— اختر منتج —</option>
              {allProducts.map((p: any) => (
                <option key={p.id} value={p.id}>{p.nameAr} ({parseFloat(p.price)} {currency})</option>
              ))}
            </select>
          </div>

          {/* Slug */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">
              رابط الصفحة * <span className="text-slate-400 font-normal">(مثال: bubble-gun-promo)</span>
            </label>
            <div className="flex items-center border border-slate-300 rounded-xl overflow-hidden focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
              <span className="bg-slate-50 px-3 py-2.5 text-slate-400 text-sm border-l border-slate-300 select-none">/offer/</span>
              <input
                type="text"
                value={form.slug}
                onChange={e =>
                  setForm((prev) => ({
                    ...prev,
                    slug: e.target.value.toLowerCase().replace(/\s+/g, "-"),
                  }))
                }
                placeholder="bubble-gun-promo"
                className="flex-1 px-3 py-2.5 text-sm outline-none"
                dir="ltr"
              />
            </div>
          </div>

          {/* Headline */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">العنوان الرئيسي *</label>
            <input
              type="text"
              value={form.headline}
              onChange={e => setForm((prev) => ({ ...prev, headline: e.target.value }))}
              placeholder="فرح صغارك مع مسدس الفقاعات الآلي! 🫧"
              className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Subheadline */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">العنوان الفرعي <span className="text-slate-400 font-normal">(اختياري)</span></label>
            <textarea
              value={form.subheadline}
              onChange={e => setForm((prev) => ({ ...prev, subheadline: e.target.value }))}
              rows={2}
              placeholder="وصف مختصر ومقنع للعرض..."
              className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none"
            />
          </div>

          {/* Media (multi-upload) */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              الصور، الفيديوهات، والروابط (YouTube/TikTok) <span className="text-slate-400 font-normal">(اختياري — يستبدل صورة المنتج)</span>
            </label>
            <div className="space-y-3">
              {form.mediaUrls.map((rawUrl, i) => {
                const url = typeof rawUrl === "string" ? rawUrl : "";
                return (
                <div key={i} className="border border-slate-200 rounded-2xl p-3 bg-slate-50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500">صورة {i + 1}</span>
                    {form.mediaUrls.length > 1 && (
                      <button onClick={() => removeMedia(i)} className="text-slate-400 hover:text-rose-500 transition-colors p-1">
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  {/* File upload */}
                  <label className={`flex items-center gap-2 cursor-pointer border border-dashed border-slate-300 rounded-xl px-3 py-2 hover:border-primary hover:bg-primary/5 transition-colors ${uploadingIdx === i ? "opacity-60 pointer-events-none" : ""}`}>
                    {uploadingIdx === i
                      ? <Loader2 className="h-4 w-4 text-primary animate-spin shrink-0" />
                      : <span className="text-lg">📁</span>
                    }
                    <span className="text-sm text-slate-600 font-semibold">
                      {uploadingIdx === i ? "جارٍ الرفع..." : "رفع من الجهاز"}
                    </span>
                    <input
                      type="file"
                      accept="image/*,.gif,video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov"
                      className="hidden"
                      onChange={e => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(i, file);
                        e.target.value = "";
                      }}
                    />
                  </label>

                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <div className="flex-1 h-px bg-slate-200" />
                    <span>أو</span>
                    <div className="flex-1 h-px bg-slate-200" />
                  </div>

                  {/* URL input */}
                  <input
                    type="text"
                    value={url}
                    onChange={e => updateMediaUrl(i, e.target.value)}
                    placeholder="رابط الصورة، أو رابط فيديو يوتيوب / تيكتوك"
                    dir="ltr"
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-white"
                  />

                  {/* Preview */}
                  {url.trim() && (
                    isExternalEmbedLink(url) ? (
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-primary hover:underline"
                        dir="ltr"
                      >
                        {url}
                      </a>
                    ) : isVideoMedia(url) ? (
                      <video
                        src={normalizeMediaUrl(url)}
                        controls
                        preload="metadata"
                        className="w-full max-h-48 rounded-xl border border-slate-200 bg-black"
                      />
                    ) : (
                      <img
                        src={normalizeMediaUrl(url)}
                        alt="معاينة"
                        className="w-full max-h-32 object-contain rounded-xl border border-slate-200 bg-white"
                        onError={(e) => {
                          console.error("Landing page media preview failed", {
                            url,
                            type: "image",
                          });
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                        onLoad={(e) => { (e.target as HTMLImageElement).style.display = ""; }}
                      />
                    )
                  )}
                </div>
                );
              })}
              <button onClick={addMedia} className="text-primary text-sm font-bold flex items-center gap-1 hover:underline mt-1">
                + أضف ميديا (صورة، فيديو، رابط)
              </button>
            </div>
          </div>

          {/* Features */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              نقاط البيع <span className="text-slate-400 font-normal">(مميزات المنتج)</span>
            </label>
            <div className="space-y-2">
              {form.features.map((f, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={f}
                    onChange={e => updateFeature(i, e.target.value)}
                    placeholder={`ميزة ${i + 1}، مثلاً: آمن 100% للأطفال`}
                    className="flex-1 border border-slate-300 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                  {form.features.length > 1 && (
                    <button onClick={() => removeFeature(i)} className="text-slate-400 hover:text-rose-500 transition-colors p-1 shrink-0">
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
              <button onClick={addFeature} className="text-primary text-sm font-bold flex items-center gap-1 hover:underline mt-1">
                + أضف ميزة
              </button>
            </div>
          </div>

          {/* Box contents */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">
              محتويات الباكو <span className="text-slate-400 font-normal">(سطر لكل عنصر، اختياري)</span>
            </label>
            <textarea
              value={form.boxContents}
              onChange={e => setForm((prev) => ({ ...prev, boxContents: e.target.value }))}
              rows={3}
              placeholder={"مسدس الفقاعات الآلي\nشيشة سائل الفقاعات\nصحن صغير"}
              className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none"
            />
          </div>

          {/* Urgency text */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">
              نص الإلحاح <span className="text-slate-400 font-normal">(الشريط الأزرق أعلى الصفحة)</span>
            </label>
            <input
              type="text"
              value={form.urgencyText}
              onChange={e => setForm((prev) => ({ ...prev, urgencyText: e.target.value }))}
              placeholder="عرض محدود — التوصيل مجاني لعند باب الحوش!"
              className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {formError && (
            <p className="text-rose-600 text-sm bg-rose-50 border border-rose-200 rounded-xl px-4 py-2">⚠️ {formError}</p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 bg-primary hover:bg-primary/90 disabled:opacity-60 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              {saving ? "جارٍ الحفظ…" : mode === "create" ? "إنشاء الصفحة" : "حفظ التعديلات"}
            </button>
            <button
              onClick={() => setMode("list")}
              className="px-5 py-3 border border-slate-300 rounded-xl text-slate-700 font-semibold hover:bg-slate-50 transition-colors text-sm"
            >
              إلغاء
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ── List view ── */
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-slate-500 text-sm">{pages.length} صفحة</p>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-primary text-white font-bold px-4 py-2.5 rounded-xl text-sm hover:bg-primary/90 transition-colors"
        >
          <Megaphone className="h-4 w-4" /> صفحة جديدة
        </button>
      </div>

      {loadingPages ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
        </div>
      ) : pages.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 py-16 text-center">
          <div className="text-4xl mb-3">📣</div>
          <p className="font-bold text-slate-700 mb-1">لا توجد صفحات هبوط حتى الآن</p>
          <p className="text-slate-400 text-sm mb-4">أنشئ أول صفحة وروّج لمنتجاتك</p>
          <button onClick={openCreate} className="bg-primary text-white font-bold px-5 py-2.5 rounded-xl text-sm hover:bg-primary/90 transition-colors">
            + إنشاء أول صفحة
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[600px]">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-right px-4 py-3 font-bold text-slate-700">الرابط</th>
                  <th className="text-right px-4 py-3 font-bold text-slate-700">العنوان</th>
                  <th className="text-right px-4 py-3 font-bold text-slate-700">المنتج</th>
                  <th className="text-right px-4 py-3 font-bold text-slate-700">السعر</th>
                  <th className="text-right px-4 py-3 font-bold text-slate-700">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pages.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <a
                        href={`/offer/${p.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary font-bold hover:underline text-xs"
                        dir="ltr"
                      >
                        /offer/{p.slug}
                      </a>
                    </td>
                    <td className="px-4 py-3 text-slate-800 max-w-[180px] truncate font-medium">{p.headline}</td>
                    <td className="px-4 py-3 text-slate-600 text-xs">{p.productNameAr}</td>
                    <td className="px-4 py-3 text-primary font-bold">{parseFloat(p.productPrice)} {currency}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEdit(p)}
                          className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-3 py-1.5 rounded-lg transition-colors"
                        >
                          تعديل
                        </button>
                        <button
                          onClick={() => setDeleteId(p.id)}
                          className="text-xs bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold px-3 py-1.5 rounded-lg transition-colors"
                        >
                          حذف
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full text-center">
            <div className="text-4xl mb-3">🗑️</div>
            <h3 className="font-extrabold text-slate-900 text-lg mb-1">حذف الصفحة؟</h3>
            <p className="text-slate-500 text-sm mb-5">لا يمكن التراجع عن هذا الإجراء.</p>
            <div className="flex gap-3">
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 bg-rose-500 hover:bg-rose-600 disabled:opacity-60 text-white font-bold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                {deleting && <Loader2 className="h-4 w-4 animate-spin" />}
                {deleting ? "جارٍ الحذف…" : "تأكيد الحذف"}
              </button>
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 border border-slate-300 text-slate-700 font-semibold py-2.5 rounded-xl hover:bg-slate-50 transition-colors"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   SETTINGS TAB
══════════════════════════════════════════════════════════ */
type HeroSliderAdminSlide = HeroSlide;

function getDefaultHeroSliderAdminSlides(): HeroSliderAdminSlide[] {
  return getDefaultHeroSlides().map((slide, index) => ({
    ...slide,
    id: slide.id || `default-${index}`,
    sortOrder: index,
  }));
}

function createHeroSlide(sortOrder: number): HeroSliderAdminSlide {
  return {
    id: `slide-${Date.now()}-${sortOrder}`,
    imageUrl: "",
    title: "عنوان الشريحة",
    subtitle: "وصف قصير يظهر فوق صورة السلايدر.",
    primaryCtaText: "تسوق الآن",
    primaryCtaHref: "/products",
    secondaryCtaText: "تصفح الأقسام",
    secondaryCtaHref: "#home-categories",
    isActive: true,
    sortOrder,
  };
}

function normalizeHeroSliderAdmin(value: unknown): HeroSliderAdminSlide[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((slide, index) => {
      const item = slide && typeof slide === "object"
        ? (slide as Partial<HeroSliderAdminSlide>)
        : {};

      return {
        id: String(item.id || `slide-${index}`),
        imageUrl: String(item.imageUrl || ""),
        title: String(item.title || ""),
        subtitle: String(item.subtitle || ""),
        primaryCtaText: String(item.primaryCtaText || ""),
        primaryCtaHref: String(item.primaryCtaHref || ""),
        secondaryCtaText: String(item.secondaryCtaText || ""),
        secondaryCtaHref: String(item.secondaryCtaHref || ""),
        isActive: item.isActive !== false,
        sortOrder: Number.isFinite(Number(item.sortOrder)) ? Number(item.sortOrder) : index,
      };
    })
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((slide, index) => ({ ...slide, sortOrder: index }));
}

function isHexColor(value: unknown): value is string {
  return typeof value === "string" && /^#[0-9a-fA-F]{3,8}$/.test(value);
}

function SettingsTab() {
  const { currency, setCurrency } = useCurrency();
  const [localCurrency, setLocalCurrency] = useState(currency);
  const [facebookPixelId, setFacebookPixelId] = useState("");
  const [tiktokPixelId, setTiktokPixelId] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#1d4ed8");
  const [announcementText, setAnnouncementText] = useState("🔥 عروض حصرية لفترة محدودة — الدفع عند الاستلام!");
  const [announcementActive, setAnnouncementActive] = useState(true);
  const [announcementBgColor, setAnnouncementBgColor] = useState("#1d4ed8");
  const [announcementTextColor, setAnnouncementTextColor] = useState("#ffffff");
  const [heroSlides, setHeroSlides] = useState<HeroSliderAdminSlide[]>(
    () => getDefaultHeroSliderAdminSlides(),
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => { setLocalCurrency(currency); }, [currency]);

  useEffect(() => {
    apiFetch("/api/settings", { auth: false })
      .then((data) => {
        if (data.facebookPixelId  !== undefined) setFacebookPixelId(data.facebookPixelId);
        if (data.tiktokPixelId    !== undefined) setTiktokPixelId(data.tiktokPixelId);
        if (data.logoUrl          !== undefined) setLogoUrl(data.logoUrl);
        const resolvedPrimaryColor = isHexColor(data.primaryColor)
          ? data.primaryColor
          : "#1d4ed8";
        setPrimaryColor(resolvedPrimaryColor);
        if (data.announcementText !== undefined) setAnnouncementText(data.announcementText);
        if (typeof data.announcementActive === "boolean") setAnnouncementActive(data.announcementActive);
        setAnnouncementBgColor(
          isHexColor(data.announcementBgColor)
            ? data.announcementBgColor
            : resolvedPrimaryColor,
        );
        setAnnouncementTextColor(
          isHexColor(data.announcementTextColor)
            ? data.announcementTextColor
            : "#ffffff",
        );
        const normalizedSavedSlides = normalizeHeroSliderAdmin(data.heroSlider);
        setHeroSlides(
          normalizedSavedSlides.length
            ? normalizedSavedSlides
            : getDefaultHeroSliderAdminSlides(),
        );
      })
      .catch(() => {});
  }, []);

  const updateHeroSlide = (id: string, patch: Partial<HeroSliderAdminSlide>) => {
    setHeroSlides((prev) =>
      prev.map((slide) => slide.id === id ? { ...slide, ...patch } : slide),
    );
    setSaved(false);
  };

  const addHeroSlide = () => {
    setHeroSlides((prev) => [...prev, createHeroSlide(prev.length)]);
    setSaved(false);
  };

  const removeHeroSlide = (id: string) => {
    setHeroSlides((prev) =>
      prev
        .filter((slide) => slide.id !== id)
        .map((slide, index) => ({ ...slide, sortOrder: index })),
    );
    setSaved(false);
  };

  const moveHeroSlide = (id: string, direction: -1 | 1) => {
    setHeroSlides((prev) => {
      const next = [...prev].sort((a, b) => a.sortOrder - b.sortOrder);
      const index = next.findIndex((slide) => slide.id === id);
      const target = index + direction;
      if (index < 0 || target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next.map((slide, order) => ({ ...slide, sortOrder: order }));
    });
    setSaved(false);
  };

  const preparedHeroSlides = heroSlides
    .slice()
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((slide, index) => ({
      ...slide,
      id: slide.id || `slide-${index}`,
      imageUrl: slide.imageUrl.trim(),
      title: slide.title.trim(),
      subtitle: slide.subtitle.trim(),
      primaryCtaText: slide.primaryCtaText.trim(),
      primaryCtaHref: slide.primaryCtaHref.trim(),
      secondaryCtaText: slide.secondaryCtaText.trim(),
      secondaryCtaHref: slide.secondaryCtaHref.trim(),
      sortOrder: index,
    }));

  const announcementLoopText = buildAnnouncementSegment(announcementText);
  const announcementDuration = getAnnouncementDuration(announcementText);

  const handleSave = async () => {
    if (!localCurrency.trim()) { setError("رمز العملة لا يمكن أن يكون فارغاً"); return; }
    setSaving(true); setError(""); setSaved(false);
    try {
      const data = await apiFetch<any>("/api/settings", {
        method: "PUT",
        body: {
          currencySymbol:     localCurrency.trim(),
          facebookPixelId:    facebookPixelId.trim(),
          tiktokPixelId:      tiktokPixelId.trim(),
          logoUrl:            logoUrl.trim(),
          primaryColor:       primaryColor.trim(),
          announcementText:   announcementText.trim(),
          announcementActive: announcementActive,
          announcementBgColor: announcementBgColor.trim(),
          announcementTextColor: announcementTextColor.trim(),
          heroSlider:         preparedHeroSlides,
        },
      });
      setCurrency(data.currencySymbol);
      if (data.primaryColor) {
        document.documentElement.style.setProperty("--color-primary", data.primaryColor);
        document.documentElement.style.setProperty("--color-ring", data.primaryColor);
        document.documentElement.style.setProperty("--color-brand", data.primaryColor);
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError("حدث خطأ أثناء الحفظ. حاول مرة أخرى.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="rounded-[1.6rem] border border-slate-200 bg-white p-6 shadow-sm text-right space-y-6">
        <div>
          <h3 className="text-xl font-extrabold text-slate-900">إعدادات المتجر</h3>
          <p className="text-sm text-slate-500 mt-1">تحكم في الإعدادات العامة للمتجر التي تؤثر على جميع الصفحات.</p>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-bold text-slate-700">رمز العملة</label>
          <p className="text-xs text-slate-500">يُعرض بجانب كل سعر في المتجر. مثال: د.ل، درهم، ريال، $، €</p>
          <div className="flex items-center gap-3 mt-2">
            <input
              type="text"
              value={localCurrency}
              onChange={(e) => { setLocalCurrency(e.target.value); setSaved(false); }}
              placeholder="د.ل"
              className="flex-1 rounded-2xl border-2 border-slate-200 focus:border-primary px-4 py-3 text-base font-bold text-right outline-none transition"
              dir="rtl"
              maxLength={10}
            />
            <div className="w-16 h-12 rounded-2xl bg-slate-50 border-2 border-slate-200 flex items-center justify-center font-black text-primary text-lg shrink-0">
              {localCurrency || "؟"}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-bold text-slate-700">Facebook Pixel ID</label>
          <p className="text-xs text-slate-500">أدخل معرّف بكسل فيسبوك لتفعيل تتبع الإعلانات. اتركه فارغاً لإيقاف التتبع.</p>
          <input
            type="text"
            value={facebookPixelId}
            onChange={(e) => { setFacebookPixelId(e.target.value); setSaved(false); }}
            placeholder="مثال: 1234567890123456"
            className="w-full rounded-2xl border-2 border-slate-200 focus:border-primary px-4 py-3 text-base text-left outline-none transition"
            dir="ltr"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-bold text-slate-700">TikTok Pixel ID</label>
          <p className="text-xs text-slate-500">أدخل معرّف بكسل تيك توك لتفعيل تتبع الإعلانات. اتركه فارغاً لإيقاف التتبع.</p>
          <input
            type="text"
            value={tiktokPixelId}
            onChange={(e) => { setTiktokPixelId(e.target.value); setSaved(false); }}
            placeholder="مثال: ABCDE12345"
            className="w-full rounded-2xl border-2 border-slate-200 focus:border-primary px-4 py-3 text-base text-left outline-none transition"
            dir="ltr"
          />
        </div>

        {/* ── Announcement Bar ────────────────────────── */}
        <div className="pt-2 border-t border-slate-100">
          <h4 className="text-base font-extrabold text-slate-800 mb-1">شريط الإعلانات</h4>
          <p className="text-xs text-slate-500 mb-4">شريط متحرك يظهر أسفل القائمة العلوية في جميع صفحات المتجر.</p>

          <div className="space-y-4">
            {/* Toggle */}
            <div className="flex items-center justify-between gap-3 rounded-2xl border-2 border-slate-200 bg-slate-50 px-4 py-3">
              <div>
                <p className="text-sm font-bold text-slate-700">تفعيل الشريط</p>
                <p className="text-xs text-slate-500 mt-0.5">إظهار أو إخفاء شريط الإعلانات بالكامل</p>
              </div>
              <button
                type="button"
                onClick={() => { setAnnouncementActive((v) => !v); setSaved(false); }}
                className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${announcementActive ? "bg-primary" : "bg-slate-300"}`}
                role="switch"
                aria-checked={announcementActive}
              >
                <span
                  className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${announcementActive ? "-translate-x-5" : "translate-x-0"}`}
                />
              </button>
            </div>

            {/* Text */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-700">نص الإعلان</label>
              <input
                type="text"
                value={announcementText}
                onChange={(e) => { setAnnouncementText(e.target.value); setSaved(false); }}
                placeholder="🔥 عروض حصرية لفترة محدودة — الدفع عند الاستلام!"
                className="w-full rounded-2xl border-2 border-slate-200 focus:border-primary px-4 py-3 text-base text-right outline-none transition"
                dir="rtl"
              />
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-2">
                <label className="block text-sm font-bold text-slate-700">لون خلفية الشريط</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={announcementBgColor}
                    onChange={(e) => { setAnnouncementBgColor(e.target.value); setSaved(false); }}
                    className="w-12 h-12 rounded-xl border-2 border-slate-200 cursor-pointer p-1 bg-white"
                  />
                  <input
                    type="text"
                    value={announcementBgColor}
                    onChange={(e) => {
                      if (/^#[0-9a-fA-F]{0,8}$/.test(e.target.value)) {
                        setAnnouncementBgColor(e.target.value);
                        setSaved(false);
                      }
                    }}
                    placeholder="#1d4ed8"
                    className="flex-1 rounded-2xl border-2 border-slate-200 focus:border-primary px-4 py-3 text-base font-mono text-left outline-none transition"
                    dir="ltr"
                    maxLength={9}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-bold text-slate-700">لون نص الشريط</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={announcementTextColor}
                    onChange={(e) => { setAnnouncementTextColor(e.target.value); setSaved(false); }}
                    className="w-12 h-12 rounded-xl border-2 border-slate-200 cursor-pointer p-1 bg-white"
                  />
                  <input
                    type="text"
                    value={announcementTextColor}
                    onChange={(e) => {
                      if (/^#[0-9a-fA-F]{0,8}$/.test(e.target.value)) {
                        setAnnouncementTextColor(e.target.value);
                        setSaved(false);
                      }
                    }}
                    placeholder="#ffffff"
                    className="flex-1 rounded-2xl border-2 border-slate-200 focus:border-primary px-4 py-3 text-base font-mono text-left outline-none transition"
                    dir="ltr"
                    maxLength={9}
                  />
                </div>
              </div>
            </div>

            {/* Preview */}
            {announcementActive && announcementText.trim() && (
              <div
                className="w-full overflow-hidden rounded-xl text-xs font-semibold"
                style={{
                  backgroundColor: announcementBgColor,
                  color: announcementTextColor,
                  height: "32px",
                }}
              >
                <div className="flex items-center h-full">
                  <div
                    className="announcement-track"
                    style={{ animationDuration: `${announcementDuration}s` }}
                  >
                    <span className="announcement-segment">
                      {announcementLoopText}
                    </span>
                    <span className="announcement-segment" aria-hidden="true">
                      {announcementLoopText}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="pt-2 border-t border-slate-100">
          <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h4 className="text-base font-extrabold text-slate-800 mb-1">سلايدر الصفحة الرئيسية</h4>
              <p className="text-xs text-slate-500">تحكم في صور ونصوص وأزرار السلايدر الرئيسي. إذا لم تضف أي شريحة فعالة سيظهر السلايدر الافتراضي.</p>
            </div>
            <button
              type="button"
              onClick={addHeroSlide}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white hover:opacity-90 transition"
            >
              <Plus className="h-4 w-4" />
              إضافة شريحة
            </button>
          </div>

          {heroSlides.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-5 text-center">
              <ImageIcon className="mx-auto mb-2 h-8 w-8 text-slate-300" />
              <p className="text-sm font-bold text-slate-700">لا توجد شرائح مخصصة بعد</p>
              <p className="mt-1 text-xs text-slate-500">سيستخدم الموقع الشرائح الافتراضية إلى أن تضيف وتحفظ شرائح جديدة.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {heroSlides
                .slice()
                .sort((a, b) => a.sortOrder - b.sortOrder)
                .map((slide, index, orderedSlides) => (
                  <div key={slide.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-extrabold text-slate-800">شريحة {index + 1}</p>
                        <p className="text-xs text-slate-500">الترتيب: {index + 1}</p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => updateHeroSlide(slide.id, { isActive: !slide.isActive })}
                          className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition ${slide.isActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-500"}`}
                        >
                          {slide.isActive ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                          {slide.isActive ? "مفعلة" : "معطلة"}
                        </button>
                        <button
                          type="button"
                          onClick={() => moveHeroSlide(slide.id, -1)}
                          disabled={index === 0}
                          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-100 disabled:opacity-40"
                        >
                          أعلى
                        </button>
                        <button
                          type="button"
                          onClick={() => moveHeroSlide(slide.id, 1)}
                          disabled={index === orderedSlides.length - 1}
                          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-100 disabled:opacity-40"
                        >
                          أسفل
                        </button>
                        <button
                          type="button"
                          onClick={() => removeHeroSlide(slide.id)}
                          className="rounded-xl border border-rose-200 bg-white px-3 py-2 text-xs font-bold text-rose-600 transition hover:bg-rose-50"
                        >
                          حذف
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-slate-700">صورة الشريحة</label>
                      <ProductImageInput
                        value={slide.imageUrl}
                        onChange={(url) => updateHeroSlide(slide.id, { imageUrl: url })}
                      />
                    </div>

                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="space-y-2 md:col-span-2">
                        <label className="block text-sm font-bold text-slate-700">العنوان</label>
                        <input
                          type="text"
                          value={slide.title}
                          onChange={(e) => updateHeroSlide(slide.id, { title: e.target.value })}
                          placeholder="مثال: تسوق كل احتياجاتك من جودة ماركت"
                          className="w-full rounded-2xl border-2 border-slate-200 focus:border-primary px-4 py-3 text-base text-right outline-none transition"
                          dir="rtl"
                        />
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <label className="block text-sm font-bold text-slate-700">النص الفرعي</label>
                        <textarea
                          value={slide.subtitle}
                          onChange={(e) => updateHeroSlide(slide.id, { subtitle: e.target.value })}
                          placeholder="وصف قصير للشريحة يظهر أسفل العنوان"
                          className="min-h-[90px] w-full rounded-2xl border-2 border-slate-200 focus:border-primary px-4 py-3 text-base text-right outline-none transition"
                          dir="rtl"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-bold text-slate-700">نص الزر الأساسي</label>
                        <input
                          type="text"
                          value={slide.primaryCtaText}
                          onChange={(e) => updateHeroSlide(slide.id, { primaryCtaText: e.target.value })}
                          placeholder="تسوق الآن"
                          className="w-full rounded-2xl border-2 border-slate-200 focus:border-primary px-4 py-3 text-base text-right outline-none transition"
                          dir="rtl"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-bold text-slate-700">رابط الزر الأساسي</label>
                        <input
                          type="text"
                          value={slide.primaryCtaHref}
                          onChange={(e) => updateHeroSlide(slide.id, { primaryCtaHref: e.target.value })}
                          placeholder="/products"
                          className="w-full rounded-2xl border-2 border-slate-200 focus:border-primary px-4 py-3 text-base text-left outline-none transition"
                          dir="ltr"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-bold text-slate-700">نص الزر الثانوي</label>
                        <input
                          type="text"
                          value={slide.secondaryCtaText}
                          onChange={(e) => updateHeroSlide(slide.id, { secondaryCtaText: e.target.value })}
                          placeholder="تصفح الأقسام"
                          className="w-full rounded-2xl border-2 border-slate-200 focus:border-primary px-4 py-3 text-base text-right outline-none transition"
                          dir="rtl"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-bold text-slate-700">رابط الزر الثانوي</label>
                        <input
                          type="text"
                          value={slide.secondaryCtaHref}
                          onChange={(e) => updateHeroSlide(slide.id, { secondaryCtaHref: e.target.value })}
                          placeholder="#home-categories"
                          className="w-full rounded-2xl border-2 border-slate-200 focus:border-primary px-4 py-3 text-base text-left outline-none transition"
                          dir="ltr"
                        />
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* ── Visual Branding ─────────────────────────── */}
        <div className="pt-2 border-t border-slate-100">
          <h4 className="text-base font-extrabold text-slate-800 mb-1">الهوية البصرية</h4>
          <p className="text-xs text-slate-500 mb-4">لوغو المتجر واللون الأساسي الذي يظهر في جميع الصفحات.</p>

          <div className="space-y-5">
            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-700">لوغو المتجر</label>
              <p className="text-xs text-slate-500">ارفع صورة اللوغو أو الصق رابطها. إذا تُرك فارغاً يُعرض اسم المتجر.</p>
              <ProductImageInput value={logoUrl} onChange={(url) => { setLogoUrl(url); setSaved(false); }} />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-700">اللون الأساسي للمتجر</label>
              <p className="text-xs text-slate-500">يؤثر على الأزرار والروابط والعناصر البارزة في كامل الموقع.</p>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => { setPrimaryColor(e.target.value); setSaved(false); }}
                  className="w-12 h-12 rounded-xl border-2 border-slate-200 cursor-pointer p-1 bg-white"
                />
                <input
                  type="text"
                  value={primaryColor}
                  onChange={(e) => { if (/^#[0-9a-fA-F]{0,8}$/.test(e.target.value)) { setPrimaryColor(e.target.value); setSaved(false); } }}
                  placeholder="#1d4ed8"
                  className="flex-1 rounded-2xl border-2 border-slate-200 focus:border-primary px-4 py-3 text-base font-mono text-left outline-none transition"
                  dir="ltr"
                  maxLength={9}
                />
                <div
                  className="w-12 h-12 rounded-xl border-2 border-slate-200 shrink-0"
                  style={{ backgroundColor: primaryColor }}
                />
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
            {error}
          </div>
        )}

        {saved && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700 flex items-center gap-2">
            ✅ تم حفظ الإعدادات بنجاح
          </div>
        )}

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full rounded-2xl bg-slate-900 hover:bg-primary px-5 py-3.5 text-base font-bold text-white transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? "جارٍ الحفظ…" : "حفظ التغييرات"}
        </button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   ADMIN DASHBOARD (tabbed shell)
══════════════════════════════════════════════════════════ */
type Tab = "orders" | "products" | "landing-pages" | "settings";

function AdminDashboard() {
  const { adminSession, adminSignOut, orders, loadOrders } = useStore();
  const [activeTab, setActiveTab] = useState<Tab>("orders");
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    setSigningOut(true);
    await adminSignOut();
  };

  const TABS: { id: Tab; label: string; icon: typeof ShoppingBag; count?: number }[] = [
    { id: "orders",         label: "الطلبات",            icon: ShoppingBag, count: orders.length },
    { id: "products",       label: "إدارة المنتجات",      icon: Tag },
    { id: "landing-pages",  label: "صفحات الهبوط",        icon: Megaphone },
    { id: "settings",       label: "إعدادات المتجر",      icon: Settings },
  ];

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 md:px-6">

      {/* ── Page header ── */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div className="text-right">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">لوحة الإدارة</p>
          <h2 className="mt-1 text-3xl font-extrabold text-slate-900">
            {activeTab === "orders" ? "إدارة الطلبات" : activeTab === "products" ? "إدارة المنتجات" : activeTab === "landing-pages" ? "صفحات الهبوط" : "إعدادات المتجر"}
          </h2>
          {adminSession?.user?.email && (
            <p className="mt-0.5 text-xs text-slate-400">{adminSession.user.email}</p>
          )}
        </div>
        <button
          onClick={handleSignOut} disabled={signingOut}
          className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition disabled:opacity-60 flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          {signingOut ? "جارٍ الخروج…" : "تسجيل الخروج"}
        </button>
      </div>

      {/* ── Tab bar ── */}
      <div className="flex gap-2 mb-6 bg-slate-100 p-1.5 rounded-2xl w-fit">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition-all duration-150 ${
                active
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
              {tab.count !== undefined && (
                <span className={`text-xs px-1.5 py-0.5 rounded-md font-bold ${active ? "bg-primary text-white" : "bg-slate-200 text-slate-600"}`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Tab content ── */}
      {activeTab === "orders"         && <OrdersTab />}
      {activeTab === "products"       && <ProductsTab />}
      {activeTab === "landing-pages"  && <LandingPagesTab />}
      {activeTab === "settings"       && <SettingsTab />}
    </section>
  );
}

/* ══════════════════════════════════════════════════════════
   ROOT EXPORT
══════════════════════════════════════════════════════════ */
export default function Admin() {
  const { adminSession, adminSessionLoading } = useStore();

  if (adminSessionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900">
        <div className="flex flex-col items-center gap-4">
          <svg className="w-10 h-10 text-blue-400 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-white/50 text-sm">جارٍ التحقق من الجلسة…</p>
        </div>
      </div>
    );
  }

  if (!adminSession) return <AdminLogin />;

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <AdminDashboard />
    </div>
  );
}

