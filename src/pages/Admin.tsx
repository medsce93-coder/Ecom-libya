import { useState, useEffect, useCallback } from "react";
import { Link } from "wouter";
import { useStore } from "@/lib/store-context";
import { useCurrency } from "@/lib/currency-context";
import { apiFetch } from "@/lib/api";
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

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   ADMIN LOGIN
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
function AdminLogin() {
  const { adminSignIn } = useStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError("Ø§Ù„Ø±Ø¬Ø§Ø¡ Ø¥Ø¯Ø®Ø§Ù„ Ø§Ù„Ø¨Ø±ÙŠØ¯ Ø§Ù„Ø¥Ù„ÙƒØªØ±ÙˆÙ†ÙŠ ÙˆÙƒÙ„Ù…Ø© Ø§Ù„Ù…Ø±ÙˆØ±.");
      return;
    }
    setLoading(true);
    setError("");
    const err = await adminSignIn(email.trim(), password);
    if (err) {
      setError("Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ø¯Ø®ÙˆÙ„ ØºÙŠØ± ØµØ­ÙŠØ­Ø©. ÙŠØ±Ø¬Ù‰ Ø§Ù„Ù…Ø­Ø§ÙˆÙ„Ø© Ù…Ø±Ø© Ø£Ø®Ø±Ù‰.");
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
          <h1 className="text-3xl font-bold text-white tracking-tight">Ù„ÙˆØ­Ø© Ø§Ù„Ø¥Ø¯Ø§Ø±Ø©</h1>
          <p className="mt-2 text-sm text-blue-200/70">Ø£Ø¯Ø®Ù„ Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ø¯Ø®ÙˆÙ„ Ù„Ù„Ù…ØªØ§Ø¨Ø¹Ø©</p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-5" dir="rtl">
            <div>
              <label className="block text-sm font-medium text-blue-100 mb-2">Ø§Ù„Ø¨Ø±ÙŠØ¯ Ø§Ù„Ø¥Ù„ÙƒØªØ±ÙˆÙ†ÙŠ</label>
              <input
                type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com" autoComplete="email"
                className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-white placeholder-white/30 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all text-right"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-blue-100 mb-2">ÙƒÙ„Ù…Ø© Ø§Ù„Ù…Ø±ÙˆØ±</label>
              <input
                type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢" autoComplete="current-password"
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
                  Ø¬Ø§Ø±Ù Ø§Ù„ØªØ­Ù‚Ù‚â€¦
                </span>
              ) : "ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø¯Ø®ÙˆÙ„"}
            </button>
          </form>
        </div>

        <div className="text-center mt-6">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-blue-200/60 hover:text-blue-100 transition-colors duration-200 group">
            <svg className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 5l7 7-7 7" />
            </svg>
            Ø§Ù„Ø¹ÙˆØ¯Ø© Ø¥Ù„Ù‰ Ø§Ù„Ù…ØªØ¬Ø±
          </Link>
        </div>
        <p className="text-center text-xs text-white/25 mt-6">Ø¬ÙˆØ¯Ø© Ù…Ø§Ø±ÙƒØª Â· Ù„ÙˆØ­Ø© Ø§Ù„ØªØ­ÙƒÙ… Ø§Ù„Ø¥Ø¯Ø§Ø±ÙŠØ©</p>
      </div>
    </div>
  );
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   ORDERS TAB
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
function OrdersTab() {
  const { orders, updateOrderStatus, deleteOrder, clearAllOrders, exportOrdersCSV, copyOrderToWhatsApp, openOrderInWhatsApp, loadOrders, statusLabel, statusClass } = useStore();
  const { currency } = useCurrency();

  return (
    <div className="grid gap-6">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-[1.6rem] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="text-right">
          <p className="text-lg font-bold">Ø¹Ø¯Ø¯ Ø§Ù„Ø·Ù„Ø¨Ø§Øª: {orders.length}</p>
          <p className="text-sm text-slate-500">ÙŠÙ…ÙƒÙ†Ùƒ ØªØºÙŠÙŠØ± Ø§Ù„Ø­Ø§Ù„Ø© Ø£Ùˆ Ø­Ø°Ù Ø£ÙŠ Ø·Ù„Ø¨.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={loadOrders} className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold hover:bg-slate-50 transition">ØªØ­Ø¯ÙŠØ«</button>
          <button onClick={exportOrdersCSV} className="rounded-xl border border-green-300 px-4 py-2 text-sm font-semibold text-green-700 hover:bg-green-50 transition">ØªØµØ¯ÙŠØ± CSV</button>
          <button onClick={clearAllOrders} className="rounded-xl border border-red-300 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 transition">Ù…Ø³Ø­ Ø§Ù„ÙƒÙ„</button>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="rounded-[1.6rem] border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">Ù„Ø§ ØªÙˆØ¬Ø¯ Ø·Ù„Ø¨Ø§Øª Ø­Ø§Ù„ÙŠØ§Ù‹.</div>
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
                    <h4 className="mb-3 text-sm font-bold text-slate-800 border-b border-slate-200 pb-2">ðŸ“¦ ØªÙØ§ØµÙŠÙ„ Ø§Ù„Ø·Ù„Ø¨ÙŠØ©:</h4>
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
                      <span className="text-sm font-bold text-slate-600">Ø§Ù„Ø¥Ø¬Ù…Ø§Ù„ÙŠ:</span>
                      <span className="text-lg font-black text-green-600">{currency} {order.total}</span>
                    </div>
                  </div>

                  <p className="mt-3 text-sm text-slate-600">Ø±Ù‚Ù… Ø§Ù„Ø·Ù„Ø¨: <span className="font-mono">{order.id}</span></p>
                  <p className="mt-1 text-sm text-slate-600">Ø§Ù„Ù…Ø¯ÙŠÙ†Ø©: {order.customer.city}</p>
                  <p className="mt-1 text-sm text-slate-600">Ø§Ù„Ù‡Ø§ØªÙ: <span dir="ltr">{order.customer.phone}</span></p>
                  <p className="mt-1 text-sm text-slate-600">Ø§Ù„Ø¯ÙØ¹: {order.paymentMethod}</p>
                  <p className="mt-1 text-sm text-slate-600">Ø§Ù„ØªØ§Ø±ÙŠØ®: {new Date(order.createdAt).toLocaleString("ar-EG")}</p>
                </div>

                <div className="flex flex-col gap-2 min-w-[140px]">
                  <select
                    value={order.status || "new"}
                    onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                    className="rounded-xl border border-slate-300 px-4 py-2 text-sm outline-none bg-white"
                  >
                    <option value="new">Ø¬Ø¯ÙŠØ¯</option>
                    <option value="confirmed">ØªÙ… Ø§Ù„ØªØ£ÙƒÙŠØ¯</option>
                    <option value="shipped">ØªÙ… Ø§Ù„Ø´Ø­Ù†</option>
                    <option value="delivered">ØªÙ… Ø§Ù„ØªØ³Ù„ÙŠÙ…</option>
                    <option value="cancelled">Ù…Ù„ØºÙŠ</option>
                  </select>
                  <button onClick={() => copyOrderToWhatsApp(order)} className="rounded-xl border border-blue-300 px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50 transition">Ù†Ø³Ø® Ø§Ù„Ø·Ù„Ø¨</button>
                  <button onClick={() => openOrderInWhatsApp(order)} className="rounded-xl border border-green-400 px-4 py-2 text-sm font-semibold text-green-700 hover:bg-green-50 transition">Ø¥Ø±Ø³Ø§Ù„ ÙˆØ§ØªØ³Ø§Ø¨</button>
                  <button onClick={() => deleteOrder(order.id)} className="rounded-xl border border-red-300 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 transition">Ø­Ø°Ù Ø§Ù„Ø·Ù„Ø¨</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   EDIT PRICE MODAL
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
type Product = {
  id: string; nameAr: string; price: number; compareAtPrice: number | null;
  stock: number; imageUrl: string | null; categoryName: string | null;
  active: boolean; featured: boolean; badge: string | null; rating: number;
};

/* â”€â”€â”€ Shared Image Input (upload from device OR paste URL) â”€â”€â”€â”€â”€â”€â”€â”€ */
function ProductImageInput({ value, onChange }: { value: string; onChange: (url: string) => void }) {
  const [uploading, setUploading] = useState(false);
  const [urlDraft, setUrlDraft] = useState(value);

  useEffect(() => { setUrlDraft(value); }, [value]);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const { url } = await apiFetch<{ url: string }>("/api/upload", {
        method: "POST",
        body: fd,
      });
      onChange(url);
    } catch { /* silent â€” parent can show a generic error */ }
    finally { setUploading(false); }
  };

  const resolvePreview = (url: string) =>
    !url ? "" : url.startsWith("http") || url.startsWith("/") ? url : `/${url}`;

  return (
    <div className="space-y-2">
      {/* Preview */}
      {value ? (
        <div className="relative w-full h-36 rounded-xl bg-slate-50 border border-slate-200 overflow-hidden flex items-center justify-center">
          <img
            src={resolvePreview(value)}
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
        {uploading ? "Ø¬Ø§Ø±Ù Ø§Ù„Ø±ÙØ¹â€¦" : "Ø±ÙØ¹ ØµÙˆØ±Ø© Ù…Ù† Ø§Ù„Ø¬Ù‡Ø§Ø²"}
        <input type="file" accept="image/*,image/gif" className="hidden" onChange={handleFile} disabled={uploading} />
      </label>

      {/* URL paste */}
      <input
        type="text"
        value={urlDraft}
        onChange={e => setUrlDraft(e.target.value)}
        onBlur={() => onChange(urlDraft.trim())}
        onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); onChange(urlDraft.trim()); } }}
        placeholder="Ø£Ùˆ Ø§Ù„ØµÙ‚ Ø±Ø§Ø¨Ø· Ø§Ù„ØµÙˆØ±Ø© Ù…Ø¨Ø§Ø´Ø±Ø©Ù‹ Ù‡Ù†Ø§â€¦"
        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-primary focus:bg-white transition-all"
        dir="ltr"
      />
    </div>
  );
}

/* â”€â”€â”€ Create Product Modal â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function CreateProductModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const queryClient = useQueryClient();
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
    if (!nameAr.trim()) { setError("Ø§Ø³Ù… Ø§Ù„Ù…Ù†ØªØ¬ Ù…Ø·Ù„ÙˆØ¨."); return; }
    const priceNum = parseFloat(price);
    if (!price || isNaN(priceNum) || priceNum < 0) { setError("Ø§Ù„Ø±Ø¬Ø§Ø¡ Ø¥Ø¯Ø®Ø§Ù„ Ø³Ø¹Ø± ØµØ­ÙŠØ­."); return; }
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
    } catch {
      setError("Ø­Ø¯Ø« Ø®Ø·Ø£ Ø£Ø«Ù†Ø§Ø¡ Ø§Ù„Ø¥Ø¶Ø§ÙØ©. Ø­Ø§ÙˆÙ„ Ù…Ø±Ø© Ø£Ø®Ø±Ù‰.");
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
            <p className="text-xs text-slate-400 font-medium">Ø¥Ø¶Ø§ÙØ© Ù…Ù†ØªØ¬</p>
            <h3 className="font-bold text-slate-900 text-base">Ù…Ù†ØªØ¬ Ø¬Ø¯ÙŠØ¯</h3>
          </div>
          <div className="w-8" />
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          {/* Name */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">Ø§Ø³Ù… Ø§Ù„Ù…Ù†ØªØ¬ *</label>
            <input
              type="text"
              value={nameAr}
              onChange={e => setNameAr(e.target.value)}
              placeholder="Ù…Ø«Ø§Ù„: ÙƒØ±ÙŠÙ… Ø§Ù„ØªØ±Ø·ÙŠØ¨ Ø§Ù„Ù„ÙŠÙ„ÙŠ"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-right outline-none focus:border-primary focus:bg-white transition-all"
              autoFocus
            />
          </div>

          {/* Price + Stock side by side */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Ø§Ù„Ø³Ø¹Ø± ({currency}) *</label>
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
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Ø§Ù„ÙƒÙ…ÙŠØ© (Ø³Ø·ÙˆÙƒ)</label>
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
            <label className="block text-sm font-bold text-slate-700 mb-1.5">Ø£Ø³Ø¹Ø§Ø± Ø§Ù„ÙƒÙ…ÙŠØ§Øª <span className="text-slate-400 font-normal">(Ø§Ø®ØªÙŠØ§Ø±ÙŠ â€” Ù„ØªÙØ¹ÙŠÙ„ Ø¹Ø±ÙˆØ¶ Ø§Ù„Ø­Ø¬Ù…)</span></label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-500 mb-1">Ø³Ø¹Ø± Ù‚Ø·Ø¹ØªÙŠÙ† ({currency})</label>
                <input
                  type="number" min="0" step="0.5" value={priceQty2}
                  onChange={e => setPriceQty2(e.target.value)}
                  placeholder="Ù…Ø«Ø§Ù„: 79"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-right outline-none focus:border-primary focus:bg-white transition-all"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Ø³Ø¹Ø± 3 Ù‚Ø·Ø¹ ({currency})</label>
                <input
                  type="number" min="0" step="0.5" value={priceQty3}
                  onChange={e => setPriceQty3(e.target.value)}
                  placeholder="Ù…Ø«Ø§Ù„: 110"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-right outline-none focus:border-primary focus:bg-white transition-all"
                />
              </div>
            </div>
          </div>

          {/* Image */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">Ø§Ù„ØµÙˆØ±Ø© Ø§Ù„Ø±Ø¦ÙŠØ³ÙŠØ© Ù„Ù„Ù…Ù†ØªØ¬</label>
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
              Ø¥Ù„ØºØ§Ø¡
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-xl bg-primary text-white font-bold py-3 text-sm hover:bg-blue-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              {saving ? "Ø¬Ø§Ø±Ù Ø§Ù„Ø­ÙØ¸â€¦" : "Ø¥Ø¶Ø§ÙØ© Ø§Ù„Ù…Ù†ØªØ¬"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EditModal({ product, onClose, onSaved }: { product: Product; onClose: () => void; onSaved: () => void }) {
  const { mutateAsync: updateProduct } = useUpdateProduct();
  const [price, setPrice] = useState(String(product.price));
  const [comparePrice, setComparePrice] = useState(product.compareAtPrice ? String(product.compareAtPrice) : "");
  const [priceQty2, setPriceQty2] = useState((product as any).priceQty2 ? String((product as any).priceQty2) : "");
  const [priceQty3, setPriceQty3] = useState((product as any).priceQty3 ? String((product as any).priceQty3) : "");
  const [stock, setStock] = useState(String(product.stock));
  const [imageUrl, setImageUrl] = useState(product.imageUrl || "");
  const [active, setActive] = useState(product.active);
  const [featured, setFeatured] = useState(product.featured);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [err, setErr] = useState("");

  const imgSrc = product.imageUrl
    ? (product.imageUrl.startsWith("http") || product.imageUrl.startsWith("/") ? product.imageUrl : `/${product.imageUrl}`)
    : null;

  const priceNum = parseFloat(price);
  const comparePriceNum = comparePrice ? parseFloat(comparePrice) : null;
  const stockNum = parseInt(stock);

  const valid =
    !isNaN(priceNum) && priceNum >= 0 &&
    (comparePrice === "" || (!isNaN(comparePriceNum!) && comparePriceNum! >= 0)) &&
    !isNaN(stockNum) && stockNum >= 0;

  const handleSave = async () => {
    if (!valid) { setErr("ØªØ£ÙƒØ¯ Ù…Ù† ØµØ­Ø© Ø§Ù„Ù‚ÙŠÙ… Ø§Ù„Ù…ÙØ¯Ø®Ù„Ø©."); return; }
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
    } catch {
      setErr("Ø­Ø¯Ø« Ø®Ø·Ø£ Ø£Ø«Ù†Ø§Ø¡ Ø§Ù„Ø­ÙØ¸. ÙŠØ±Ø¬Ù‰ Ø§Ù„Ù…Ø­Ø§ÙˆÙ„Ø© Ù…Ø¬Ø¯Ø¯Ø§Ù‹.");
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
            <p className="text-xs text-slate-400 font-medium">ØªØ¹Ø¯ÙŠÙ„ Ø§Ù„Ù…Ù†ØªØ¬</p>
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
            <p className="text-xs text-slate-400 truncate">{product.categoryName || "Ø¨Ø¯ÙˆÙ† ÙØ¦Ø©"}</p>
            <div className="flex items-center gap-2 flex-wrap mt-0.5">
              <span className="text-lg font-black text-primary">{product.price} {currency}</span>
              {product.compareAtPrice && (
                <span className="text-sm text-slate-400 line-through">{product.compareAtPrice} {currency}</span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">Ø§Ù„Ù…Ø®Ø²ÙˆÙ† Ø§Ù„Ø­Ø§Ù„ÙŠ: <span className="font-bold text-slate-700">{product.stock}</span></p>
          </div>
        </div>

        {/* Form */}
        <div className="px-5 py-5 space-y-4 overflow-y-auto flex-1" dir="rtl">
          {/* Price */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">
              Ø§Ù„Ø³Ø¹Ø± Ø§Ù„Ø¬Ø¯ÙŠØ¯ <span className="text-slate-400 font-normal">({currency})</span>
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
              Ø§Ù„Ø³Ø¹Ø± Ø§Ù„Ø£ØµÙ„ÙŠ (Ù‚Ø¨Ù„ Ø§Ù„Ø®ØµÙ…) <span className="text-slate-400 font-normal">â€” Ø§Ø®ØªÙŠØ§Ø±ÙŠ</span>
            </label>
            <div className="relative">
              <input
                type="number" min="0" step="0.5" value={comparePrice}
                onChange={(e) => setComparePrice(e.target.value)}
                className="w-full rounded-xl border-2 border-slate-200 focus:border-primary px-4 py-3 text-lg font-bold text-slate-500 outline-none transition-colors bg-white text-right"
                placeholder="Ø§ØªØ±ÙƒÙ‡ ÙØ§Ø±ØºØ§Ù‹ Ø¥Ù† Ù„Ù… ÙŠÙƒÙ† Ù‡Ù†Ø§Ùƒ Ø®ØµÙ…"
              />
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">{currency}</span>
            </div>
            {comparePrice && comparePriceNum && priceNum && comparePriceNum > priceNum && (
              <p className="text-xs text-emerald-600 font-semibold mt-1 text-right">
                âœ… Ø®ØµÙ… {Math.round(((comparePriceNum - priceNum) / comparePriceNum) * 100)}% â€” ØªÙˆÙÙŠØ± {(comparePriceNum - priceNum).toFixed(0)} {currency}
              </p>
            )}
          </div>

          {/* Volume pricing */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">
              Ø£Ø³Ø¹Ø§Ø± Ø§Ù„ÙƒÙ…ÙŠØ§Øª <span className="text-slate-400 font-normal">â€” Ø§Ø®ØªÙŠØ§Ø±ÙŠ</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <label className="block text-xs text-slate-500 mb-1">Ø³Ø¹Ø± Ù‚Ø·Ø¹ØªÙŠÙ†</label>
                <input
                  type="number" min="0" step="0.5" value={priceQty2}
                  onChange={(e) => setPriceQty2(e.target.value)}
                  className="w-full rounded-xl border-2 border-slate-200 focus:border-primary px-4 py-2.5 text-base font-bold text-slate-700 outline-none transition-colors bg-white text-right"
                  placeholder="ÙØ§Ø±Øº = ØºÙŠØ± Ù…ÙØ¹Ù‘Ù„"
                />
              </div>
              <div className="relative">
                <label className="block text-xs text-slate-500 mb-1">Ø³Ø¹Ø± 3 Ù‚Ø·Ø¹</label>
                <input
                  type="number" min="0" step="0.5" value={priceQty3}
                  onChange={(e) => setPriceQty3(e.target.value)}
                  className="w-full rounded-xl border-2 border-slate-200 focus:border-primary px-4 py-2.5 text-base font-bold text-slate-700 outline-none transition-colors bg-white text-right"
                  placeholder="ÙØ§Ø±Øº = ØºÙŠØ± Ù…ÙØ¹Ù‘Ù„"
                />
              </div>
            </div>
          </div>

          {/* Stock */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">Ø§Ù„ÙƒÙ…ÙŠØ© ÙÙŠ Ø§Ù„Ù…Ø®Ø²ÙˆÙ† (Ø³Ø·ÙˆÙƒ)</label>
            <input
              type="number" min="0" step="1" value={stock}
              onChange={(e) => setStock(e.target.value)}
              className="w-full rounded-xl border-2 border-slate-200 focus:border-primary px-4 py-3 text-lg font-bold text-slate-900 outline-none transition-colors bg-white text-right"
              placeholder="0"
            />
          </div>

          {/* Image */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">Ø§Ù„ØµÙˆØ±Ø© Ø§Ù„Ø±Ø¦ÙŠØ³ÙŠØ© Ù„Ù„Ù…Ù†ØªØ¬</label>
            <ProductImageInput value={imageUrl} onChange={setImageUrl} />
          </div>

          {/* Toggles */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button" onClick={() => setActive(!active)}
              className={`flex items-center justify-between gap-2 rounded-xl border-2 px-4 py-3 transition-all ${active ? "border-emerald-400 bg-emerald-50 text-emerald-800" : "border-slate-200 bg-slate-50 text-slate-500"}`}
            >
              <span className="text-sm font-bold">Ù†Ø´Ø·</span>
              {active ? <ToggleRight className="h-5 w-5" /> : <ToggleLeft className="h-5 w-5" />}
            </button>
            <button
              type="button" onClick={() => setFeatured(!featured)}
              className={`flex items-center justify-between gap-2 rounded-xl border-2 px-4 py-3 transition-all ${featured ? "border-amber-400 bg-amber-50 text-amber-800" : "border-slate-200 bg-slate-50 text-slate-500"}`}
            >
              <span className="text-sm font-bold">Ù…Ù…ÙŠÙ‘Ø²</span>
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
              <span className="flex items-center justify-center gap-2"><Check className="h-5 w-5" /> ØªÙ… Ø§Ù„Ø­ÙØ¸ Ø¨Ù†Ø¬Ø§Ø­!</span>
            ) : saving ? (
              <span className="flex items-center justify-center gap-2"><Loader2 className="h-5 w-5 animate-spin" /> Ø¬Ø§Ø±Ù Ø§Ù„Ø­ÙØ¸â€¦</span>
            ) : "Ø­ÙØ¸ Ø§Ù„ØªØºÙŠÙŠØ±Ø§Øª"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   PRODUCTS TAB
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
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
    if (!window.confirm(`Ù‡Ù„ Ø£Ù†Øª Ù…ØªØ£ÙƒØ¯ Ù…Ù† Ø­Ø°Ù Ù‡Ø°Ø§ Ø§Ù„Ù…Ù†ØªØ¬ØŸ\n"${name}"`)) return;
    try {
      await apiFetch(`/api/products/${id}`, { method: "DELETE" });
      queryClient.invalidateQueries({ queryKey: ["getProducts"] });
    } catch {
      alert("Ø­Ø¯Ø« Ø®Ø·Ø£ Ø£Ø«Ù†Ø§Ø¡ Ø­Ø°Ù Ø§Ù„Ù…Ù†ØªØ¬ØŒ Ø­Ø§ÙˆÙ„ Ù…Ø¬Ø¯Ø¯Ø§Ù‹.");
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
            placeholder="Ø¨Ø­Ø« Ø¹Ù† Ù…Ù†ØªØ¬ Ø¨Ø§Ù„Ø§Ø³Ù…â€¦"
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
            <p className="text-sm font-bold text-slate-700">{total} Ù…Ù†ØªØ¬</p>
            {isFetching && !isLoading && <p className="text-xs text-slate-400">Ø¬Ø§Ø±Ù Ø§Ù„ØªØ­Ø¯ÙŠØ«â€¦</p>}
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 rounded-xl bg-primary hover:bg-blue-700 text-white text-sm font-bold px-4 py-2.5 transition-colors touch-manipulation"
          >
            <Plus className="h-4 w-4" />
            Ø¥Ø¶Ø§ÙØ© Ù…Ù†ØªØ¬
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
          Ø­Ø¯Ø« Ø®Ø·Ø£ Ø£Ø«Ù†Ø§Ø¡ ØªØ­Ù…ÙŠÙ„ Ø§Ù„Ù…Ù†ØªØ¬Ø§Øª. Ø­Ø§ÙˆÙ„ Ù…Ø±Ø© Ø£Ø®Ø±Ù‰.
        </div>
      )}

      {/* Empty */}
      {!isLoading && !error && products.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center text-slate-400">
          <Package className="h-10 w-10 mx-auto mb-3 opacity-40" />
          <p className="font-medium">Ù„Ø§ ØªÙˆØ¬Ø¯ Ù…Ù†ØªØ¬Ø§Øª Ù…Ø·Ø§Ø¨Ù‚Ø© Ù„Ø¨Ø­Ø«Ùƒ.</p>
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
                    {p.featured && <span className="text-[10px] bg-amber-100 text-amber-700 font-bold px-1.5 py-0.5 rounded-md">Ù…Ù…ÙŠØ²</span>}
                    {!p.active && <span className="text-[10px] bg-slate-100 text-slate-500 font-bold px-1.5 py-0.5 rounded-md">Ù…Ø¹Ø·Ù‘Ù„</span>}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{p.categoryName || "Ø¨Ø¯ÙˆÙ† ÙØ¦Ø©"} Â· Ù…Ø®Ø²ÙˆÙ†: {p.stock}</p>
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
                    ØªØ¹Ø¯ÙŠÙ„
                  </button>
                  <button
                    onClick={() => handleDelete(p.id, p.nameAr)}
                    className="rounded-xl bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white text-xs font-bold px-3 py-2 transition-colors touch-manipulation border border-rose-200 hover:border-rose-600"
                  >
                    Ø­Ø°Ù
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
            Ø§Ù„Ø³Ø§Ø¨Ù‚
          </button>
          <span className="text-sm text-slate-500 font-medium">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition"
          >
            Ø§Ù„ØªØ§Ù„ÙŠ
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

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   LANDING PAGES TAB
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
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
    } catch { setPages([]); }
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
      mediaUrls: p.mediaUrls && p.mediaUrls.length > 0 ? p.mediaUrls : [""],
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
      setFormError("Ø§Ù„Ù…Ù†ØªØ¬ ÙˆØ§Ù„Ø±Ø§Ø¨Ø· ÙˆØ§Ù„Ø¹Ù†ÙˆØ§Ù† Ø§Ù„Ø±Ø¦ÙŠØ³ÙŠ Ù…Ø·Ù„ÙˆØ¨Ø©.");
      return;
    }
    setSaving(true);
    try {
      const body = {
        ...form,
        features: form.features.filter(f => f.trim()),
        mediaUrls: form.mediaUrls.filter(u => u.trim()),
        boxContents: form.boxContents || null,
        urgencyText: form.urgencyText || null,
      };
      const url = mode === "edit" ? `/api/landing-pages/${editingPage!.id}` : "/api/landing-pages";
      await apiFetch(url, {
        method: mode === "edit" ? "PUT" : "POST",
        body,
      });
      await loadPages();
      setMode("list");
    } catch (e: any) {
      setFormError(e.message ?? "ØµØ§Ø± Ø®Ø·Ø£ØŒ Ø­Ø§ÙˆÙ„ Ù…Ø±Ø© Ø«Ø§Ù†ÙŠØ©.");
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    await apiFetch(`/api/landing-pages/${deleteId}`, { method: "DELETE" });
    setDeleteId(null);
    setDeleting(false);
    await loadPages();
  };

  const updateFeature = (i: number, val: string) => {
    const fs = [...form.features]; fs[i] = val; setForm({ ...form, features: fs });
  };
  const addFeature = () => setForm({ ...form, features: [...form.features, ""] });
  const removeFeature = (i: number) => setForm({ ...form, features: form.features.filter((_, j) => j !== i) });

  const updateMediaUrl = (i: number, val: string) => {
    const ms = [...form.mediaUrls]; ms[i] = val; setForm({ ...form, mediaUrls: ms });
  };
  const addMedia = () => setForm({ ...form, mediaUrls: [...form.mediaUrls, ""] });
  const removeMedia = (i: number) => setForm({ ...form, mediaUrls: form.mediaUrls.filter((_, j) => j !== i) });

  const [uploadingIdx, setUploadingIdx] = useState<number | null>(null);
  const handleFileUpload = async (i: number, file: File) => {
    setUploadingIdx(i);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const { url } = await apiFetch<{ url: string }>("/api/upload", {
        method: "POST",
        body: fd,
      });
      updateMediaUrl(i, url);
    } catch {
      setFormError("ÙØ´Ù„ Ø±ÙØ¹ Ø§Ù„ØµÙˆØ±Ø©ØŒ Ø­Ø§ÙˆÙ„ Ù…Ø±Ø© Ø«Ø§Ù†ÙŠØ©.");
    } finally {
      setUploadingIdx(null);
    }
  };

  /* â”€â”€ Form view (create / edit) â”€â”€ */
  if (mode === "create" || mode === "edit") {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <button onClick={() => setMode("list")} className="text-slate-500 hover:text-slate-800 flex items-center gap-1 text-sm font-semibold">
            <ChevronRight className="h-4 w-4" /> Ø±Ø¬ÙˆØ¹ Ù„Ù„Ù‚Ø§Ø¦Ù…Ø©
          </button>
          <h3 className="font-extrabold text-slate-900 text-lg">{mode === "create" ? "ØµÙØ­Ø© Ù‡Ø¨ÙˆØ· Ø¬Ø¯ÙŠØ¯Ø©" : "ØªØ¹Ø¯ÙŠÙ„ Ø§Ù„ØµÙØ­Ø©"}</h3>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5 max-w-2xl">

          {/* Product */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Ø§Ù„Ù…Ù†ØªØ¬ *</label>
            <select
              value={form.productId}
              onChange={e => setForm({ ...form, productId: e.target.value })}
              className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-white"
            >
              <option value="">â€” Ø§Ø®ØªØ± Ù…Ù†ØªØ¬ â€”</option>
              {allProducts.map((p: any) => (
                <option key={p.id} value={p.id}>{p.nameAr} ({parseFloat(p.price)} {currency})</option>
              ))}
            </select>
          </div>

          {/* Slug */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">
              Ø±Ø§Ø¨Ø· Ø§Ù„ØµÙØ­Ø© * <span className="text-slate-400 font-normal">(Ù…Ø«Ø§Ù„: bubble-gun-promo)</span>
            </label>
            <div className="flex items-center border border-slate-300 rounded-xl overflow-hidden focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
              <span className="bg-slate-50 px-3 py-2.5 text-slate-400 text-sm border-l border-slate-300 select-none">/offer/</span>
              <input
                type="text"
                value={form.slug}
                onChange={e => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/\s+/g, "-") })}
                placeholder="bubble-gun-promo"
                className="flex-1 px-3 py-2.5 text-sm outline-none"
                dir="ltr"
              />
            </div>
          </div>

          {/* Headline */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Ø§Ù„Ø¹Ù†ÙˆØ§Ù† Ø§Ù„Ø±Ø¦ÙŠØ³ÙŠ *</label>
            <input
              type="text"
              value={form.headline}
              onChange={e => setForm({ ...form, headline: e.target.value })}
              placeholder="ÙØ±Ø­ ØµØºØ§Ø±Ùƒ Ù…Ø¹ Ù…Ø³Ø¯Ø³ Ø§Ù„ÙÙ‚Ø§Ø¹Ø§Øª Ø§Ù„Ø¢Ù„ÙŠ! ðŸ«§"
              className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Subheadline */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Ø§Ù„Ø¹Ù†ÙˆØ§Ù† Ø§Ù„ÙØ±Ø¹ÙŠ <span className="text-slate-400 font-normal">(Ø§Ø®ØªÙŠØ§Ø±ÙŠ)</span></label>
            <textarea
              value={form.subheadline}
              onChange={e => setForm({ ...form, subheadline: e.target.value })}
              rows={2}
              placeholder="ÙˆØµÙ Ù…Ø®ØªØµØ± ÙˆÙ…Ù‚Ù†Ø¹ Ù„Ù„Ø¹Ø±Ø¶..."
              className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none"
            />
          </div>

          {/* Media (multi-upload) */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Ø§Ù„ØµÙˆØ±ØŒ Ø§Ù„ÙÙŠØ¯ÙŠÙˆÙ‡Ø§ØªØŒ ÙˆØ§Ù„Ø±ÙˆØ§Ø¨Ø· (YouTube/TikTok) <span className="text-slate-400 font-normal">(Ø§Ø®ØªÙŠØ§Ø±ÙŠ â€” ÙŠØ³ØªØ¨Ø¯Ù„ ØµÙˆØ±Ø© Ø§Ù„Ù…Ù†ØªØ¬)</span>
            </label>
            <div className="space-y-3">
              {form.mediaUrls.map((url, i) => (
                <div key={i} className="border border-slate-200 rounded-2xl p-3 bg-slate-50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500">ØµÙˆØ±Ø© {i + 1}</span>
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
                      : <span className="text-lg">ðŸ“</span>
                    }
                    <span className="text-sm text-slate-600 font-semibold">
                      {uploadingIdx === i ? "Ø¬Ø§Ø±Ù Ø§Ù„Ø±ÙØ¹..." : "Ø±ÙØ¹ Ù…Ù† Ø§Ù„Ø¬Ù‡Ø§Ø²"}
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
                    <span>Ø£Ùˆ</span>
                    <div className="flex-1 h-px bg-slate-200" />
                  </div>

                  {/* URL input */}
                  <input
                    type="text"
                    value={url}
                    onChange={e => updateMediaUrl(i, e.target.value)}
                    placeholder="Ø±Ø§Ø¨Ø· Ø§Ù„ØµÙˆØ±Ø©ØŒ Ø£Ùˆ Ø±Ø§Ø¨Ø· ÙÙŠØ¯ÙŠÙˆ ÙŠÙˆØªÙŠÙˆØ¨ / ØªÙŠÙƒØªÙˆÙƒ"
                    dir="ltr"
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-white"
                  />

                  {/* Preview */}
                  {url.trim() && (
                    <img
                      src={url.startsWith("http") || url.startsWith("/") ? url : `/${url}`}
                      alt="Ù…Ø¹Ø§ÙŠÙ†Ø©"
                      className="w-full max-h-32 object-contain rounded-xl border border-slate-200 bg-white"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                      onLoad={(e) => { (e.target as HTMLImageElement).style.display = ""; }}
                    />
                  )}
                </div>
              ))}
              <button onClick={addMedia} className="text-primary text-sm font-bold flex items-center gap-1 hover:underline mt-1">
                + Ø£Ø¶Ù Ù…ÙŠØ¯ÙŠØ§ (ØµÙˆØ±Ø©ØŒ ÙÙŠØ¯ÙŠÙˆØŒ Ø±Ø§Ø¨Ø·)
              </button>
            </div>
          </div>

          {/* Features */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Ù†Ù‚Ø§Ø· Ø§Ù„Ø¨ÙŠØ¹ <span className="text-slate-400 font-normal">(Ù…Ù…ÙŠØ²Ø§Øª Ø§Ù„Ù…Ù†ØªØ¬)</span>
            </label>
            <div className="space-y-2">
              {form.features.map((f, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={f}
                    onChange={e => updateFeature(i, e.target.value)}
                    placeholder={`Ù…ÙŠØ²Ø© ${i + 1}ØŒ Ù…Ø«Ù„Ø§Ù‹: Ø¢Ù…Ù† 100% Ù„Ù„Ø£Ø·ÙØ§Ù„`}
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
                + Ø£Ø¶Ù Ù…ÙŠØ²Ø©
              </button>
            </div>
          </div>

          {/* Box contents */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">
              Ù…Ø­ØªÙˆÙŠØ§Øª Ø§Ù„Ø¨Ø§ÙƒÙˆ <span className="text-slate-400 font-normal">(Ø³Ø·Ø± Ù„ÙƒÙ„ Ø¹Ù†ØµØ±ØŒ Ø§Ø®ØªÙŠØ§Ø±ÙŠ)</span>
            </label>
            <textarea
              value={form.boxContents}
              onChange={e => setForm({ ...form, boxContents: e.target.value })}
              rows={3}
              placeholder={"Ù…Ø³Ø¯Ø³ Ø§Ù„ÙÙ‚Ø§Ø¹Ø§Øª Ø§Ù„Ø¢Ù„ÙŠ\nØ´ÙŠØ´Ø© Ø³Ø§Ø¦Ù„ Ø§Ù„ÙÙ‚Ø§Ø¹Ø§Øª\nØµØ­Ù† ØµØºÙŠØ±"}
              className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none"
            />
          </div>

          {/* Urgency text */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">
              Ù†Øµ Ø§Ù„Ø¥Ù„Ø­Ø§Ø­ <span className="text-slate-400 font-normal">(Ø§Ù„Ø´Ø±ÙŠØ· Ø§Ù„Ø£Ø²Ø±Ù‚ Ø£Ø¹Ù„Ù‰ Ø§Ù„ØµÙØ­Ø©)</span>
            </label>
            <input
              type="text"
              value={form.urgencyText}
              onChange={e => setForm({ ...form, urgencyText: e.target.value })}
              placeholder="Ø¹Ø±Ø¶ Ù…Ø­Ø¯ÙˆØ¯ â€” Ø§Ù„ØªÙˆØµÙŠÙ„ Ù…Ø¬Ø§Ù†ÙŠ Ù„Ø¹Ù†Ø¯ Ø¨Ø§Ø¨ Ø§Ù„Ø­ÙˆØ´!"
              className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {formError && (
            <p className="text-rose-600 text-sm bg-rose-50 border border-rose-200 rounded-xl px-4 py-2">âš ï¸ {formError}</p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 bg-primary hover:bg-primary/90 disabled:opacity-60 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              {saving ? "Ø¬Ø§Ø±Ù Ø§Ù„Ø­ÙØ¸â€¦" : mode === "create" ? "Ø¥Ù†Ø´Ø§Ø¡ Ø§Ù„ØµÙØ­Ø©" : "Ø­ÙØ¸ Ø§Ù„ØªØ¹Ø¯ÙŠÙ„Ø§Øª"}
            </button>
            <button
              onClick={() => setMode("list")}
              className="px-5 py-3 border border-slate-300 rounded-xl text-slate-700 font-semibold hover:bg-slate-50 transition-colors text-sm"
            >
              Ø¥Ù„ØºØ§Ø¡
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* â”€â”€ List view â”€â”€ */
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-slate-500 text-sm">{pages.length} ØµÙØ­Ø©</p>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-primary text-white font-bold px-4 py-2.5 rounded-xl text-sm hover:bg-primary/90 transition-colors"
        >
          <Megaphone className="h-4 w-4" /> ØµÙØ­Ø© Ø¬Ø¯ÙŠØ¯Ø©
        </button>
      </div>

      {loadingPages ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
        </div>
      ) : pages.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 py-16 text-center">
          <div className="text-4xl mb-3">ðŸ“£</div>
          <p className="font-bold text-slate-700 mb-1">Ù„Ø§ ØªÙˆØ¬Ø¯ ØµÙØ­Ø§Øª Ù‡Ø¨ÙˆØ· Ø­ØªÙ‰ Ø§Ù„Ø¢Ù†</p>
          <p className="text-slate-400 text-sm mb-4">Ø£Ù†Ø´Ø¦ Ø£ÙˆÙ„ ØµÙØ­Ø© ÙˆØ±ÙˆÙ‘Ø¬ Ù„Ù…Ù†ØªØ¬Ø§ØªÙƒ</p>
          <button onClick={openCreate} className="bg-primary text-white font-bold px-5 py-2.5 rounded-xl text-sm hover:bg-primary/90 transition-colors">
            + Ø¥Ù†Ø´Ø§Ø¡ Ø£ÙˆÙ„ ØµÙØ­Ø©
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[600px]">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-right px-4 py-3 font-bold text-slate-700">Ø§Ù„Ø±Ø§Ø¨Ø·</th>
                  <th className="text-right px-4 py-3 font-bold text-slate-700">Ø§Ù„Ø¹Ù†ÙˆØ§Ù†</th>
                  <th className="text-right px-4 py-3 font-bold text-slate-700">Ø§Ù„Ù…Ù†ØªØ¬</th>
                  <th className="text-right px-4 py-3 font-bold text-slate-700">Ø§Ù„Ø³Ø¹Ø±</th>
                  <th className="text-right px-4 py-3 font-bold text-slate-700">Ø¥Ø¬Ø±Ø§Ø¡Ø§Øª</th>
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
                          ØªØ¹Ø¯ÙŠÙ„
                        </button>
                        <button
                          onClick={() => setDeleteId(p.id)}
                          className="text-xs bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold px-3 py-1.5 rounded-lg transition-colors"
                        >
                          Ø­Ø°Ù
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
            <div className="text-4xl mb-3">ðŸ—‘ï¸</div>
            <h3 className="font-extrabold text-slate-900 text-lg mb-1">Ø­Ø°Ù Ø§Ù„ØµÙØ­Ø©ØŸ</h3>
            <p className="text-slate-500 text-sm mb-5">Ù„Ø§ ÙŠÙ…ÙƒÙ† Ø§Ù„ØªØ±Ø§Ø¬Ø¹ Ø¹Ù† Ù‡Ø°Ø§ Ø§Ù„Ø¥Ø¬Ø±Ø§Ø¡.</p>
            <div className="flex gap-3">
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 bg-rose-500 hover:bg-rose-600 disabled:opacity-60 text-white font-bold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                {deleting && <Loader2 className="h-4 w-4 animate-spin" />}
                {deleting ? "Ø¬Ø§Ø±Ù Ø§Ù„Ø­Ø°Ùâ€¦" : "ØªØ£ÙƒÙŠØ¯ Ø§Ù„Ø­Ø°Ù"}
              </button>
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 border border-slate-300 text-slate-700 font-semibold py-2.5 rounded-xl hover:bg-slate-50 transition-colors"
              >
                Ø¥Ù„ØºØ§Ø¡
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   SETTINGS TAB
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
function SettingsTab() {
  const { currency, setCurrency } = useCurrency();
  const [localCurrency, setLocalCurrency] = useState(currency);
  const [facebookPixelId, setFacebookPixelId] = useState("");
  const [tiktokPixelId, setTiktokPixelId] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#1d4ed8");
  const [announcementText, setAnnouncementText] = useState("ðŸ”¥ Ø¹Ø±ÙˆØ¶ Ø­ØµØ±ÙŠØ© Ù„ÙØªØ±Ø© Ù…Ø­Ø¯ÙˆØ¯Ø© â€” Ø§Ù„Ø¯ÙØ¹ Ø¹Ù†Ø¯ Ø§Ù„Ø§Ø³ØªÙ„Ø§Ù…!");
  const [announcementActive, setAnnouncementActive] = useState(true);
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
        if (data.primaryColor     !== undefined) setPrimaryColor(data.primaryColor);
        if (data.announcementText !== undefined) setAnnouncementText(data.announcementText);
        if (typeof data.announcementActive === "boolean") setAnnouncementActive(data.announcementActive);
      })
      .catch(() => {});
  }, []);

  const handleSave = async () => {
    if (!localCurrency.trim()) { setError("Ø±Ù…Ø² Ø§Ù„Ø¹Ù…Ù„Ø© Ù„Ø§ ÙŠÙ…ÙƒÙ† Ø£Ù† ÙŠÙƒÙˆÙ† ÙØ§Ø±ØºØ§Ù‹"); return; }
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
      setError("Ø­Ø¯Ø« Ø®Ø·Ø£ Ø£Ø«Ù†Ø§Ø¡ Ø§Ù„Ø­ÙØ¸. Ø­Ø§ÙˆÙ„ Ù…Ø±Ø© Ø£Ø®Ø±Ù‰.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto">
      <div className="rounded-[1.6rem] border border-slate-200 bg-white p-6 shadow-sm text-right space-y-6">
        <div>
          <h3 className="text-xl font-extrabold text-slate-900">Ø¥Ø¹Ø¯Ø§Ø¯Ø§Øª Ø§Ù„Ù…ØªØ¬Ø±</h3>
          <p className="text-sm text-slate-500 mt-1">ØªØ­ÙƒÙ… ÙÙŠ Ø§Ù„Ø¥Ø¹Ø¯Ø§Ø¯Ø§Øª Ø§Ù„Ø¹Ø§Ù…Ø© Ù„Ù„Ù…ØªØ¬Ø± Ø§Ù„ØªÙŠ ØªØ¤Ø«Ø± Ø¹Ù„Ù‰ Ø¬Ù…ÙŠØ¹ Ø§Ù„ØµÙØ­Ø§Øª.</p>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-bold text-slate-700">Ø±Ù…Ø² Ø§Ù„Ø¹Ù…Ù„Ø©</label>
          <p className="text-xs text-slate-500">ÙŠÙØ¹Ø±Ø¶ Ø¨Ø¬Ø§Ù†Ø¨ ÙƒÙ„ Ø³Ø¹Ø± ÙÙŠ Ø§Ù„Ù…ØªØ¬Ø±. Ù…Ø«Ø§Ù„: Ø¯.Ù„ØŒ Ø¯Ø±Ù‡Ù…ØŒ Ø±ÙŠØ§Ù„ØŒ $ØŒ â‚¬</p>
          <div className="flex items-center gap-3 mt-2">
            <input
              type="text"
              value={localCurrency}
              onChange={(e) => { setLocalCurrency(e.target.value); setSaved(false); }}
              placeholder="Ø¯.Ù„"
              className="flex-1 rounded-2xl border-2 border-slate-200 focus:border-primary px-4 py-3 text-base font-bold text-right outline-none transition"
              dir="rtl"
              maxLength={10}
            />
            <div className="w-16 h-12 rounded-2xl bg-slate-50 border-2 border-slate-200 flex items-center justify-center font-black text-primary text-lg shrink-0">
              {localCurrency || "ØŸ"}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-bold text-slate-700">Facebook Pixel ID</label>
          <p className="text-xs text-slate-500">Ø£Ø¯Ø®Ù„ Ù…Ø¹Ø±Ù‘Ù Ø¨ÙƒØ³Ù„ ÙÙŠØ³Ø¨ÙˆÙƒ Ù„ØªÙØ¹ÙŠÙ„ ØªØªØ¨Ø¹ Ø§Ù„Ø¥Ø¹Ù„Ø§Ù†Ø§Øª. Ø§ØªØ±ÙƒÙ‡ ÙØ§Ø±ØºØ§Ù‹ Ù„Ø¥ÙŠÙ‚Ø§Ù Ø§Ù„ØªØªØ¨Ø¹.</p>
          <input
            type="text"
            value={facebookPixelId}
            onChange={(e) => { setFacebookPixelId(e.target.value); setSaved(false); }}
            placeholder="Ù…Ø«Ø§Ù„: 1234567890123456"
            className="w-full rounded-2xl border-2 border-slate-200 focus:border-primary px-4 py-3 text-base text-left outline-none transition"
            dir="ltr"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-bold text-slate-700">TikTok Pixel ID</label>
          <p className="text-xs text-slate-500">Ø£Ø¯Ø®Ù„ Ù…Ø¹Ø±Ù‘Ù Ø¨ÙƒØ³Ù„ ØªÙŠÙƒ ØªÙˆÙƒ Ù„ØªÙØ¹ÙŠÙ„ ØªØªØ¨Ø¹ Ø§Ù„Ø¥Ø¹Ù„Ø§Ù†Ø§Øª. Ø§ØªØ±ÙƒÙ‡ ÙØ§Ø±ØºØ§Ù‹ Ù„Ø¥ÙŠÙ‚Ø§Ù Ø§Ù„ØªØªØ¨Ø¹.</p>
          <input
            type="text"
            value={tiktokPixelId}
            onChange={(e) => { setTiktokPixelId(e.target.value); setSaved(false); }}
            placeholder="Ù…Ø«Ø§Ù„: ABCDE12345"
            className="w-full rounded-2xl border-2 border-slate-200 focus:border-primary px-4 py-3 text-base text-left outline-none transition"
            dir="ltr"
          />
        </div>

        {/* â”€â”€ Announcement Bar â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <div className="pt-2 border-t border-slate-100">
          <h4 className="text-base font-extrabold text-slate-800 mb-1">Ø´Ø±ÙŠØ· Ø§Ù„Ø¥Ø¹Ù„Ø§Ù†Ø§Øª</h4>
          <p className="text-xs text-slate-500 mb-4">Ø´Ø±ÙŠØ· Ù…ØªØ­Ø±Ùƒ ÙŠØ¸Ù‡Ø± Ø£Ø³ÙÙ„ Ø§Ù„Ù‚Ø§Ø¦Ù…Ø© Ø§Ù„Ø¹Ù„ÙˆÙŠØ© ÙÙŠ Ø¬Ù…ÙŠØ¹ ØµÙØ­Ø§Øª Ø§Ù„Ù…ØªØ¬Ø±.</p>

          <div className="space-y-4">
            {/* Toggle */}
            <div className="flex items-center justify-between gap-3 rounded-2xl border-2 border-slate-200 bg-slate-50 px-4 py-3">
              <div>
                <p className="text-sm font-bold text-slate-700">ØªÙØ¹ÙŠÙ„ Ø§Ù„Ø´Ø±ÙŠØ·</p>
                <p className="text-xs text-slate-500 mt-0.5">Ø¥Ø¸Ù‡Ø§Ø± Ø£Ùˆ Ø¥Ø®ÙØ§Ø¡ Ø´Ø±ÙŠØ· Ø§Ù„Ø¥Ø¹Ù„Ø§Ù†Ø§Øª Ø¨Ø§Ù„ÙƒØ§Ù…Ù„</p>
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
              <label className="block text-sm font-bold text-slate-700">Ù†Øµ Ø§Ù„Ø¥Ø¹Ù„Ø§Ù†</label>
              <input
                type="text"
                value={announcementText}
                onChange={(e) => { setAnnouncementText(e.target.value); setSaved(false); }}
                placeholder="ðŸ”¥ Ø¹Ø±ÙˆØ¶ Ø­ØµØ±ÙŠØ© Ù„ÙØªØ±Ø© Ù…Ø­Ø¯ÙˆØ¯Ø© â€” Ø§Ù„Ø¯ÙØ¹ Ø¹Ù†Ø¯ Ø§Ù„Ø§Ø³ØªÙ„Ø§Ù…!"
                className="w-full rounded-2xl border-2 border-slate-200 focus:border-primary px-4 py-3 text-base text-right outline-none transition"
                dir="rtl"
              />
            </div>

            {/* Preview */}
            {announcementActive && announcementText.trim() && (
              <div
                className="w-full overflow-hidden rounded-xl text-white text-xs font-semibold"
                style={{ backgroundColor: "var(--color-primary)", height: "32px" }}
              >
                <div className="flex items-center h-full">
                  <div className="announcement-track whitespace-nowrap" style={{ animationDuration: "12s" }}>
                    <span className="px-6">{announcementText}   Â·   {announcementText}   Â·   {announcementText}</span>
                    <span className="px-6" aria-hidden="true">{announcementText}   Â·   {announcementText}   Â·   {announcementText}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* â”€â”€ Visual Branding â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <div className="pt-2 border-t border-slate-100">
          <h4 className="text-base font-extrabold text-slate-800 mb-1">Ø§Ù„Ù‡ÙˆÙŠØ© Ø§Ù„Ø¨ØµØ±ÙŠØ©</h4>
          <p className="text-xs text-slate-500 mb-4">Ù„ÙˆØºÙˆ Ø§Ù„Ù…ØªØ¬Ø± ÙˆØ§Ù„Ù„ÙˆÙ† Ø§Ù„Ø£Ø³Ø§Ø³ÙŠ Ø§Ù„Ø°ÙŠ ÙŠØ¸Ù‡Ø± ÙÙŠ Ø¬Ù…ÙŠØ¹ Ø§Ù„ØµÙØ­Ø§Øª.</p>

          <div className="space-y-5">
            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-700">Ù„ÙˆØºÙˆ Ø§Ù„Ù…ØªØ¬Ø±</label>
              <p className="text-xs text-slate-500">Ø§Ø±ÙØ¹ ØµÙˆØ±Ø© Ø§Ù„Ù„ÙˆØºÙˆ Ø£Ùˆ Ø§Ù„ØµÙ‚ Ø±Ø§Ø¨Ø·Ù‡Ø§. Ø¥Ø°Ø§ ØªÙØ±Ùƒ ÙØ§Ø±ØºØ§Ù‹ ÙŠÙØ¹Ø±Ø¶ Ø§Ø³Ù… Ø§Ù„Ù…ØªØ¬Ø±.</p>
              <ProductImageInput value={logoUrl} onChange={(url) => { setLogoUrl(url); setSaved(false); }} />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-700">Ø§Ù„Ù„ÙˆÙ† Ø§Ù„Ø£Ø³Ø§Ø³ÙŠ Ù„Ù„Ù…ØªØ¬Ø±</label>
              <p className="text-xs text-slate-500">ÙŠØ¤Ø«Ø± Ø¹Ù„Ù‰ Ø§Ù„Ø£Ø²Ø±Ø§Ø± ÙˆØ§Ù„Ø±ÙˆØ§Ø¨Ø· ÙˆØ§Ù„Ø¹Ù†Ø§ØµØ± Ø§Ù„Ø¨Ø§Ø±Ø²Ø© ÙÙŠ ÙƒØ§Ù…Ù„ Ø§Ù„Ù…ÙˆÙ‚Ø¹.</p>
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
            âœ… ØªÙ… Ø­ÙØ¸ Ø§Ù„Ø¥Ø¹Ø¯Ø§Ø¯Ø§Øª Ø¨Ù†Ø¬Ø§Ø­
          </div>
        )}

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full rounded-2xl bg-slate-900 hover:bg-primary px-5 py-3.5 text-base font-bold text-white transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? "Ø¬Ø§Ø±Ù Ø§Ù„Ø­ÙØ¸â€¦" : "Ø­ÙØ¸ Ø§Ù„ØªØºÙŠÙŠØ±Ø§Øª"}
        </button>
      </div>
    </div>
  );
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   ADMIN DASHBOARD (tabbed shell)
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
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
    { id: "orders",         label: "Ø§Ù„Ø·Ù„Ø¨Ø§Øª",            icon: ShoppingBag, count: orders.length },
    { id: "products",       label: "Ø¥Ø¯Ø§Ø±Ø© Ø§Ù„Ù…Ù†ØªØ¬Ø§Øª",      icon: Tag },
    { id: "landing-pages",  label: "ØµÙØ­Ø§Øª Ø§Ù„Ù‡Ø¨ÙˆØ·",        icon: Megaphone },
    { id: "settings",       label: "Ø¥Ø¹Ø¯Ø§Ø¯Ø§Øª Ø§Ù„Ù…ØªØ¬Ø±",      icon: Settings },
  ];

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 md:px-6">

      {/* â”€â”€ Page header â”€â”€ */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div className="text-right">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Ù„ÙˆØ­Ø© Ø§Ù„Ø¥Ø¯Ø§Ø±Ø©</p>
          <h2 className="mt-1 text-3xl font-extrabold text-slate-900">
            {activeTab === "orders" ? "Ø¥Ø¯Ø§Ø±Ø© Ø§Ù„Ø·Ù„Ø¨Ø§Øª" : activeTab === "products" ? "Ø¥Ø¯Ø§Ø±Ø© Ø§Ù„Ù…Ù†ØªØ¬Ø§Øª" : activeTab === "landing-pages" ? "ØµÙØ­Ø§Øª Ø§Ù„Ù‡Ø¨ÙˆØ·" : "Ø¥Ø¹Ø¯Ø§Ø¯Ø§Øª Ø§Ù„Ù…ØªØ¬Ø±"}
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
          {signingOut ? "Ø¬Ø§Ø±Ù Ø§Ù„Ø®Ø±ÙˆØ¬â€¦" : "ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø®Ø±ÙˆØ¬"}
        </button>
      </div>

      {/* â”€â”€ Tab bar â”€â”€ */}
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

      {/* â”€â”€ Tab content â”€â”€ */}
      {activeTab === "orders"         && <OrdersTab />}
      {activeTab === "products"       && <ProductsTab />}
      {activeTab === "landing-pages"  && <LandingPagesTab />}
      {activeTab === "settings"       && <SettingsTab />}
    </section>
  );
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   ROOT EXPORT
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
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
          <p className="text-white/50 text-sm">Ø¬Ø§Ø±Ù Ø§Ù„ØªØ­Ù‚Ù‚ Ù…Ù† Ø§Ù„Ø¬Ù„Ø³Ø©â€¦</p>
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

