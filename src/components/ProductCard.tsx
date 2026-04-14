import { Link, useLocation } from "wouter";
import type { Product } from "@/lib/api-client";
import { ShoppingCart, Star, Heart } from "lucide-react";
import { useStore } from "@/lib/store-context";
import { useCurrency } from "@/lib/currency-context";
import { toast } from "sonner";

const BADGE_STYLES: Record<string, string> = {
  "Ø§Ù„Ø£ÙƒØ«Ø± Ø·Ù„Ø¨Ø§Ù‹": "bg-amber-500 text-white",
  "Ø¹Ø±Ø¶":          "bg-emerald-500 text-white",
  "Ø¬Ø¯ÙŠØ¯":         "bg-blue-500 text-white",
  "Ù…Ø­Ø¯ÙˆØ¯":        "bg-rose-500 text-white",
};

export function ProductCard({ product }: { product: Product }) {
  const [, setLocation] = useLocation();
  const { addToCart, toggleWishlist, wishlist } = useStore();
  const { currency } = useCurrency();
  const inWishlist = wishlist.includes(product.id);

  const productPayload = {
    id: product.id,
    name: product.nameAr,
    price: product.price,
    oldPrice: product.compareAtPrice ?? undefined,
    image: product.imageUrl ?? "",
    description: product.descriptionAr ?? "",
    category: product.categoryName ?? "",
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCart(productPayload);
    toast.success("âœ“ Ø£ÙØ¶ÙŠÙ Ø¥Ù„Ù‰ Ø§Ù„Ø³Ù„Ø©", { position: "top-center", duration: 2000 });
  };

  const handleOrderNow = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCart(productPayload);
    setLocation("/checkout");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    toggleWishlist(product.id);
  };

  const badgeLabel = (product as any).badge as string | null;
  const badgeClass = badgeLabel ? (BADGE_STYLES[badgeLabel] || "bg-slate-500 text-white") : "";

  const discountPct = product.compareAtPrice && product.compareAtPrice > product.price
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : null;

  const initials = product.nameAr?.substring(0, 2) || "ØŸ";

  return (
    <div className="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden flex flex-col">
      <Link href={`/products/${(product as any).slug ?? product.id}`} className="block relative aspect-square overflow-hidden bg-slate-50">
        {product.imageUrl ? (
          <img
            src={product.imageUrl?.startsWith("http") || product.imageUrl?.startsWith("/") ? product.imageUrl : `/${product.imageUrl}`}
            alt={product.nameAr}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              const img = e.target as HTMLImageElement;
              img.style.display = "none";
              const fallback = img.nextElementSibling as HTMLElement | null;
              if (fallback) fallback.style.display = "flex";
            }}
          />
        ) : null}
        <div
          className="w-full h-full items-center justify-center text-4xl font-bold text-slate-300 bg-slate-50"
          style={{ display: product.imageUrl ? "none" : "flex" }}
        >
          {initials}
        </div>

        <div className="absolute top-2 right-2 flex flex-col gap-1.5">
          {discountPct && (
            <span className="text-[11px] font-bold bg-rose-500 text-white px-2 py-0.5 rounded-full shadow">
              -{discountPct}%
            </span>
          )}
          {badgeLabel && (
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full shadow ${badgeClass}`}>
              {badgeLabel}
            </span>
          )}
        </div>

        <button
          onClick={handleWishlist}
          className="absolute top-2 left-2 w-7 h-7 flex items-center justify-center rounded-full bg-white shadow hover:scale-110 transition-transform"
          aria-label="Ø¥Ø¶Ø§ÙØ© Ø¥Ù„Ù‰ Ø§Ù„Ù…ÙØ¶Ù„Ø©"
        >
          <Heart className={`h-3.5 w-3.5 ${inWishlist ? "fill-rose-500 text-rose-500" : "text-slate-400"}`} />
        </button>
      </Link>

      <div className="p-3.5 flex flex-col flex-1 gap-2">
        {product.categoryName && (
          <span className="text-[11px] font-semibold text-primary bg-primary/8 px-2 py-0.5 rounded-full self-start">
            {product.categoryName}
          </span>
        )}

        <Link href={`/products/${(product as any).slug ?? product.id}`} className="font-bold text-slate-800 text-sm leading-snug line-clamp-2 hover:text-primary transition-colors flex-1">
          {product.nameAr}
        </Link>

        {(product as any).rating && (
          <div className="flex items-center gap-1">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            <span className="text-xs font-semibold text-slate-600">{Number((product as any).rating).toFixed(1)}</span>
          </div>
        )}

        <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-50">
          <div className="flex flex-col">
            <span className="font-extrabold text-primary text-base leading-tight">{product.price} {currency}</span>
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <span className="text-xs text-slate-400 line-through leading-tight">{product.compareAtPrice} {currency}</span>
            )}
          </div>
          <button
            onClick={handleAddToCart}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-primary/10 hover:bg-primary hover:text-white text-primary transition-all duration-200 shrink-0"
            title="Ø£Ø¶Ù Ø¥Ù„Ù‰ Ø§Ù„Ø³Ù„Ø©"
          >
            <ShoppingCart className="h-4 w-4" />
          </button>
        </div>

        <button
          onClick={handleOrderNow}
          className="w-full rounded-xl bg-slate-900 px-3 py-2 text-xs font-bold text-white hover:opacity-90 transition mt-1"
        >
          Ø§Ø·Ù„Ø¨ Ø§Ù„Ø¢Ù†
        </button>
      </div>
    </div>
  );
}


