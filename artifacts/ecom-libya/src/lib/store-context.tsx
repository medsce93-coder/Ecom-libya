import React, { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase, WHATSAPP_NUMBER, COUPON_CODE, ADMIN_EMAIL } from "./supabase";

const isAdminEmail = (email: string | undefined | null): boolean =>
  Boolean(ADMIN_EMAIL && email && email.toLowerCase() === ADMIN_EMAIL.toLowerCase());

export interface CartItem {
  id: string;
  name: string;
  price: number;
  oldPrice?: number;
  image: string;
  quantity: number;
  description?: string;
  category?: string;
}

export interface Order {
  id: string;
  _dbId?: string;
  customer: { fullName: string; city: string; phone: string; address?: string };
  paymentMethod: string;
  items: CartItem[];
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  status: string;
  createdAt: string;
}

interface StoreContextType {
  cart: CartItem[];
  wishlist: string[];
  coupon: string;
  couponApplied: boolean;
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  orders: Order[];
  adminSession: Session | null;
  adminSessionLoading: boolean;
  checkoutData: { fullName: string; city: string; phone: string; payment: string };
  checkoutError: string;
  orderSuccess: { id: string } | null;
  setCoupon: (v: string) => void;
  setCouponApplied: (v: boolean) => void;
  setCheckoutData: (data: { fullName: string; city: string; phone: string; payment: string }) => void;
  handleCheckoutChange: (field: string, value: string) => void;
  addToCart: (product: { id: string; name: string; price: number; oldPrice?: number; image: string; description?: string; category?: string }) => void;
  updateQuantity: (id: string, change: number) => void;
  removeFromCart: (id: string) => void;
  toggleWishlist: (id: string) => void;
  handleCheckoutSubmit: () => Promise<void>;
  adminSignIn: (email: string, password: string) => Promise<string | null>;
  adminSignOut: () => Promise<void>;
  updateOrderStatus: (orderId: string, newStatus: string) => Promise<void>;
  deleteOrder: (orderId: string) => Promise<void>;
  clearAllOrders: () => Promise<void>;
  exportOrdersCSV: () => void;
  copyOrderToWhatsApp: (order: Order) => void;
  openOrderInWhatsApp: (order: Order) => void;
  loadOrders: () => Promise<void>;
  statusLabel: (status: string) => string;
  statusClass: (status: string) => string;
  clearOrderSuccess: () => void;
}

const StoreContext = createContext<StoreContextType | null>(null);

function mapApiOrder(row: any): Order {
  return {
    id: row.orderNumber ?? row.id,
    _dbId: row.id,
    customer: {
      fullName: row.customerName ?? "",
      city: row.customerCity ?? "",
      phone: row.customerPhone ?? "",
      address: row.customerAddress ?? "",
    },
    paymentMethod: "الدفع عند الاستلام",
    items: (row.items || []).map((item: any) => ({
      id: item.productId ?? item.id ?? "",
      name: item.productNameAr || item.productName || "",
      price: parseFloat(String(item.price ?? 0)),
      quantity: item.quantity ?? 1,
      image: item.productImage ?? "",
    })),
    subtotal: parseFloat(String(row.subtotal ?? 0)),
    shipping: parseFloat(String(row.shippingFee ?? 0)),
    discount: 0,
    total: parseFloat(String(row.total ?? 0)),
    status: row.status ?? "new",
    createdAt: row.createdAt ?? new Date().toISOString(),
  };
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [coupon, setCoupon] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const ordersRef = useRef<Order[]>([]);
  useEffect(() => { ordersRef.current = orders; }, [orders]);
  const currencyRef = useRef("د.ل");
  useEffect(() => {
    const base = import.meta.env.VITE_API_URL ?? "";
    fetch(`${base}/api/settings`).then(r => r.json()).then(d => {
      if (d?.currencySymbol) currencyRef.current = d.currencySymbol;
    }).catch(() => {});
  }, []);
  const [adminSession, setAdminSession] = useState<Session | null>(null);
  const [adminSessionLoading, setAdminSessionLoading] = useState(true);
  const [checkoutData, setCheckoutData] = useState({ fullName: "", city: "", phone: "", payment: "الدفع عند الاستلام" });
  const [checkoutError, setCheckoutError] = useState("");
  const [orderSuccess, setOrderSuccess] = useState<{ id: string } | null>(null);

  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem("cart") || "[]");
    const savedWishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");
    if (savedCart.length) setCart(savedCart);
    if (savedWishlist.length) setWishlist(savedWishlist);

    supabase.auth.getSession().then(({ data: { session } }) => {
      setAdminSession(isAdminEmail(session?.user?.email) ? session : null);
      setAdminSessionLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setAdminSession(isAdminEmail(session?.user?.email) ? session : null);
      setAdminSessionLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => { localStorage.setItem("cart", JSON.stringify(cart)); }, [cart]);
  useEffect(() => { localStorage.setItem("wishlist", JSON.stringify(wishlist)); }, [wishlist]);

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = 0;
  const discount = couponApplied ? Math.round(subtotal * 0.1) : 0;
  const total = subtotal + shipping - discount;

  const loadOrders = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!isAdminEmail(session?.user?.email)) return;
    try {
      const res = await fetch("/api/orders?limit=200");
      if (!res.ok) throw new Error("API error");
      const data = await res.json();
      const formatted: Order[] = (data.orders || []).map(mapApiOrder);
      setOrders(formatted);
      ordersRef.current = formatted;
    } catch {
      const localOrders: Order[] = JSON.parse(localStorage.getItem("orders") || "[]");
      setOrders(localOrders);
      ordersRef.current = localOrders;
    }
  }, []);

  useEffect(() => {
    if (adminSession) loadOrders();
  }, [adminSession, loadOrders]);

  const addToCart = useCallback((product: { id: string; name: string; price: number; oldPrice?: number; image: string; description?: string; category?: string }) => {
    setCart((current) => {
      const found = current.find((item) => item.id === product.id);
      if (found) return current.map((item) => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      return [...current, { ...product, quantity: 1 }];
    });
  }, []);

  const updateQuantity = useCallback((id: string, change: number) => {
    setCart((current) =>
      current.map((item) => item.id === id ? { ...item, quantity: Math.max(1, item.quantity + change) } : item)
    );
  }, []);

  const removeFromCart = useCallback((id: string) => {
    setCart((current) => current.filter((item) => item.id !== id));
  }, []);

  const toggleWishlist = useCallback((id: string) => {
    setWishlist((current) =>
      current.includes(id) ? current.filter((w) => w !== id) : [...current, id]
    );
  }, []);

  const handleCheckoutChange = useCallback((field: string, value: string) => {
    setCheckoutData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleCheckoutSubmit = useCallback(async () => {
    const { fullName, city, phone } = checkoutData;
    if (!fullName.trim() || !city.trim() || !phone.trim()) {
      setCheckoutError("يرجى ملء جميع الحقول.");
      return;
    }
    setCheckoutError("");

    const cartItems = cart.map((item) => ({
      productId: item.id,
      id: item.id,
      name: item.name,
      nameAr: item.name,
      price: item.price,
      quantity: item.quantity,
      image: item.image,
    }));

    try {
      const res = await fetch("/api/orders/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: fullName,
          customerPhone: phone,
          customerCity: city,
          customerAddress: city,
          items: cartItems,
        }),
      });

      if (!res.ok) {
        setCheckoutError("حدث خطأ أثناء إرسال الطلب.");
        return;
      }

      const newOrder = await res.json();
      setOrderSuccess({ id: newOrder.orderNumber ?? newOrder.id });

      try {
        if (typeof window !== "undefined" && (window as any).fbq) {
          (window as any).fbq("track", "Purchase", { value: total, currency: currencyRef.current });
        }
      } catch {}
      try {
        if (typeof window !== "undefined" && (window as any).ttq) {
          (window as any).ttq.track("CompletePayment", { value: total, currency: currencyRef.current });
        }
      } catch {}

      setCart([]);
      setCoupon("");
      setCouponApplied(false);
      setCheckoutData({ fullName: "", city: "", phone: "", payment: "الدفع عند الاستلام" });
      await loadOrders();
    } catch {
      setCheckoutError("حدث خطأ أثناء إرسال الطلب.");
    }
  }, [cart, checkoutData, loadOrders]);

  const adminSignIn = useCallback(async (email: string, password: string): Promise<string | null> => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return error.message;
    if (!isAdminEmail(data.user?.email)) {
      await supabase.auth.signOut();
      return "ACCESS_DENIED";
    }
    return null;
  }, []);

  const adminSignOut = useCallback(async () => {
    await supabase.auth.signOut();
    setOrders([]);
    ordersRef.current = [];
  }, []);

  const updateOrderStatus = useCallback(async (orderId: string, newStatus: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!isAdminEmail(session?.user?.email)) return;
    const target = ordersRef.current.find((o) => o.id === orderId);
    const dbId = target?._dbId ?? orderId;
    setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status: newStatus } : o));
    try {
      const res = await fetch(`/api/orders/${dbId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) {
        console.error("updateOrderStatus failed:", await res.text());
      }
    } catch (e: any) {
      console.error("updateOrderStatus exception:", e?.message ?? e);
    }
  }, []);

  const deleteOrder = useCallback(async (orderId: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!isAdminEmail(session?.user?.email)) return;
    const target = ordersRef.current.find((o) => o.id === orderId);
    const dbId = target?._dbId ?? orderId;
    setOrders((prev) => prev.filter((o) => o.id !== orderId));
    try {
      const res = await fetch(`/api/orders/${dbId}`, { method: "DELETE" });
      if (!res.ok) {
        console.error("deleteOrder failed:", await res.text());
      }
    } catch (e: any) {
      console.error("deleteOrder exception:", e?.message ?? e);
    }
  }, []);

  const clearAllOrders = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!isAdminEmail(session?.user?.email)) return;
    if (!window.confirm("واش متأكد بغيتي تمسح جميع الطلبات؟")) return;
    try {
      const res = await fetch("/api/orders", { method: "DELETE" });
      if (!res.ok) { alert("ما قدرناش نمسحو جميع الطلبات"); return; }
    } catch {
      alert("ما قدرناش نمسحو جميع الطلبات");
      return;
    }
    setOrders([]);
    ordersRef.current = [];
    localStorage.setItem("orders", "[]");
  }, []);

  const exportOrdersCSV = useCallback(() => {
    if (!orders.length) { alert("ما كايناش طلبات باش تصدّر."); return; }
    const rows = [["Order ID","Customer Name","City","Phone","Payment Method","Status","Subtotal","Shipping","Discount","Total","Created At","Items"]];
    orders.forEach((order) => {
      const itemsText = order.items.map((item) => `${item.name} x${item.quantity}`).join(" | ");
      rows.push([order.id, order.customer.fullName, order.customer.city, order.customer.phone, order.paymentMethod, order.status, String(order.subtotal), String(order.shipping), String(order.discount), String(order.total), order.createdAt, itemsText]);
    });
    const csvContent = "\uFEFF" + rows.map((row) => row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url; link.download = "orders.csv";
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [orders]);

  const statusLabel = useCallback((status: string) => {
    const map: Record<string, string> = {
      new: "جديد",
      pending: "جديد",
      confirmed: "تم التأكيد",
      shipped: "تم الشحن",
      delivered: "تم التسليم",
      cancelled: "ملغي",
    };
    return map[status] || status;
  }, []);

  const statusClass = useCallback((status: string) => {
    const map: Record<string, string> = {
      new: "bg-blue-50 text-blue-700 border-blue-200",
      pending: "bg-blue-50 text-blue-700 border-blue-200",
      confirmed: "bg-amber-50 text-amber-700 border-amber-200",
      shipped: "bg-purple-50 text-purple-700 border-purple-200",
      delivered: "bg-green-50 text-green-700 border-green-200",
      cancelled: "bg-red-50 text-red-700 border-red-200",
    };
    return map[status] || "bg-slate-50 text-slate-700 border-slate-200";
  }, []);

  const copyOrderToWhatsApp = useCallback((order: Order) => {
    const text = buildOrderText(order, statusLabel, currencyRef.current);
    navigator.clipboard.writeText(text).then(() => alert("تم نسخ الطلب بنجاح.")).catch(() => alert("تعذر نسخ الطلب."));
  }, [statusLabel]);

  const openOrderInWhatsApp = useCallback((order: Order) => {
    const text = buildOrderText(order, statusLabel, currencyRef.current);
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`, "_blank");
  }, [statusLabel]);

  const clearOrderSuccess = useCallback(() => setOrderSuccess(null), []);

  return (
    <StoreContext.Provider value={{
      cart, wishlist, coupon, couponApplied, subtotal, shipping, discount, total,
      orders, adminSession, adminSessionLoading, checkoutData, checkoutError, orderSuccess,
      setCoupon, setCouponApplied, setCheckoutData, handleCheckoutChange,
      addToCart, updateQuantity, removeFromCart, toggleWishlist,
      handleCheckoutSubmit, adminSignIn, adminSignOut,
      updateOrderStatus, deleteOrder, clearAllOrders, exportOrdersCSV,
      copyOrderToWhatsApp, openOrderInWhatsApp, loadOrders, statusLabel, statusClass, clearOrderSuccess,
    }}>
      {children}
    </StoreContext.Provider>
  );
}

function buildOrderText(order: Order, statusLabel: (s: string) => string, currency = "د.ل"): string {
  return [
    `طلب جديد`,
    `رقم الطلب: ${order.id}`,
    `الاسم: ${order.customer.fullName}`,
    `المدينة: ${order.customer.city}`,
    `الهاتف: ${order.customer.phone}`,
    `طريقة الدفع: ${order.paymentMethod}`,
    `الحالة: ${statusLabel(order.status)}`,
    `المنتجات:`,
    ...order.items.map((item) => `- ${item.name} × ${item.quantity} = ${currency} ${item.price * item.quantity}`),
    `المجموع الفرعي: ${currency} ${order.subtotal}`,
    `الشحن: ${currency} ${order.shipping}`,
    `الخصم: ${currency} ${order.discount}`,
    `الإجمالي: ${currency} ${order.total}`,
  ].join("\n");
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
