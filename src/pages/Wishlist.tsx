import { useLocation } from "wouter";
import { useGetProducts, getGetProductsQueryKey } from "@/lib/api-client";
import { ProductCard } from "@/components/ProductCard";
import { useStore } from "@/lib/store-context";

export default function Wishlist() {
  const [, setLocation] = useLocation();
  const { wishlist } = useStore();

  const { data, isLoading } = useGetProducts(
    { limit: 300 },
    { query: { queryKey: getGetProductsQueryKey({ limit: 300 }) } }
  );

  const wishlistProducts = (data?.products || []).filter((p) => wishlist.includes(p.id));

  return (
    <section className="mx-auto max-w-7xl px-4 py-14 md:px-6">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Ø§Ù„Ù…ÙØ¶Ù„Ø©</p>
          <h2 className="mt-2 text-4xl font-bold">Ø§Ù„Ù…Ù†ØªØ¬Ø§Øª Ø§Ù„Ù…Ø­ÙÙˆØ¸Ø©</h2>
        </div>
        <button onClick={() => setLocation("/products")} className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold hover:bg-slate-50 transition">
          ØªØµÙØ­ Ø§Ù„Ù…Ù†ØªØ¬Ø§Øª
        </button>
      </div>

      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-64 bg-slate-200 rounded-2xl animate-pulse" />)}
        </div>
      ) : wishlistProducts.length === 0 ? (
        <div className="rounded-[1.6rem] border border-dashed border-slate-300 p-16 text-center text-slate-500">
          <p className="text-lg font-medium">Ù„Ø§ ØªÙˆØ¬Ø¯ Ù…Ù†ØªØ¬Ø§Øª ÙÙŠ Ø§Ù„Ù…ÙØ¶Ù„Ø©</p>
          <p className="mt-2 text-sm">Ø§Ø¶ØºØ· Ø¹Ù„Ù‰ Ù‚Ù„Ø¨ Ø£ÙŠ Ù…Ù†ØªØ¬ Ù„Ø­ÙØ¸Ù‡ Ù‡Ù†Ø§</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {wishlistProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}

