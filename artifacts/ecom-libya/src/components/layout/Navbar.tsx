import { Link, useLocation } from "wouter";
import { ShoppingCart, Package, Menu, X, Heart } from "lucide-react";
import { useState } from "react";
import { useStore } from "@/lib/store-context";
import { useBranding } from "@/lib/branding-context";

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [location] = useLocation();
  const { cart, wishlist } = useStore();
  const { logoUrl, storeName } = useBranding();

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const close = () => setMobileOpen(false);

  const desktopLink = (href: string, label: string) => (
    <Link
      href={href}
      className={`text-sm font-semibold transition-colors ${
        location === href
          ? "text-primary border-b-2 border-primary pb-0.5"
          : "text-slate-600 hover:text-primary"
      }`}
      onClick={close}
    >
      {label}
    </Link>
  );

  const mobileLink = (href: string, label: string) => (
    <Link
      href={href}
      className={`flex items-center rounded-xl px-4 py-3.5 text-base font-semibold transition-colors min-h-[52px] touch-manipulation ${
        location === href
          ? "bg-primary/10 text-primary"
          : "text-slate-700 hover:bg-slate-100"
      }`}
      onClick={close}
    >
      {label}
    </Link>
  );

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-slate-200 shadow-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0" onClick={close}>
          {logoUrl ? (
            <img
              src={logoUrl}
              alt={storeName}
              className="h-9 w-auto max-w-[160px] object-contain"
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
            />
          ) : (
            <>
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Package className="h-4 w-4 text-white" />
              </div>
              <span className="text-xl font-extrabold text-slate-900 tracking-tight">
                {storeName.split(" ")[0]} <span className="text-primary">{storeName.split(" ")[1] ?? ""}</span>
              </span>
            </>
          )}
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          {desktopLink("/", "الرئيسية")}
          {desktopLink("/products", "المنتجات")}
          {desktopLink("/blog", "المدونة")}
          {desktopLink("/cart", "السلة")}
          {desktopLink("/checkout", "إتمام الطلب")}
          {desktopLink("/account", "الحساب")}
          {desktopLink("/admin", "الإدارة")}
        </nav>

        {/* Right side icons */}
        <div className="flex items-center gap-1.5 md:gap-2">
          {/* Wishlist (desktop) */}
          <Link
            href="/wishlist"
            className="relative hidden sm:flex items-center gap-1.5 text-slate-600 hover:text-primary font-semibold p-2.5 rounded-full hover:bg-slate-100 transition-colors min-h-[44px] min-w-[44px] justify-center"
          >
            <Heart className="h-4 w-4" />
            {wishlist.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
                {wishlist.length}
              </span>
            )}
          </Link>

          {/* Cart */}
          <Link
            href="/cart"
            className="relative flex items-center gap-1.5 bg-primary/5 hover:bg-primary/10 text-primary font-semibold px-3 py-2.5 rounded-full transition-colors min-h-[44px] touch-manipulation"
            onClick={close}
          >
            <ShoppingCart className="h-4 w-4 shrink-0" />
            <span className="hidden sm:inline text-sm">السلة</span>
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white shadow">
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            )}
          </Link>

          {/* Hamburger */}
          <button
            className="md:hidden flex items-center justify-center p-2.5 text-slate-600 hover:text-primary rounded-xl hover:bg-slate-100 transition-colors min-h-[44px] min-w-[44px] touch-manipulation"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="القائمة"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-slate-100 px-3 py-3 flex flex-col gap-1 shadow-lg max-h-[80vh] overflow-y-auto">
          {mobileLink("/", "🏠 الرئيسية")}
          {mobileLink("/products", "🛍️ المنتجات")}
          {mobileLink("/blog", "📝 المدونة")}
          {mobileLink("/cart", `🛒 السلة${cartCount > 0 ? ` (${cartCount})` : ""}`)}
          {mobileLink("/checkout", "✅ إتمام الطلب")}
          {mobileLink("/wishlist", `❤️ المفضلة${wishlist.length > 0 ? ` (${wishlist.length})` : ""}`)}
          {mobileLink("/account", "👤 الحساب")}
          {mobileLink("/admin", "⚙️ الإدارة")}
        </div>
      )}
    </header>
  );
}
