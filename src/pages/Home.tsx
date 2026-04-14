import { Link } from "wouter";
import { useGetFeaturedProducts, getGetFeaturedProductsQueryKey, useGetCategories, getGetCategoriesQueryKey } from "@/lib/api-client";
import { ShieldCheck, Truck, CreditCard, ShoppingBag, Star, ArrowLeft } from "lucide-react";
import { ProductCard } from "@/components/ProductCard";
import { Testimonials } from "@/components/Testimonials";
import { LatestArticles } from "@/components/LatestArticles";
import { HeroSlider } from "@/components/HeroSlider";
import { CTASlider } from "@/components/CTASlider";

const CATEGORY_ICONS: Record<string, string> = {
  "Ø§Ù„Ø¬Ù…Ø§Ù„ ÙˆØ§Ù„Ø¹Ù†Ø§ÙŠØ©": "ðŸ’„",
  "Ø§Ù„ØµØ­Ø© ÙˆØ§Ù„Ø¹Ù†Ø§ÙŠØ© Ø§Ù„Ø´Ø®ØµÙŠØ©": "ðŸ’Š",
  "Ø§Ù„Ù…Ù†Ø²Ù„ ÙˆØ§Ù„Ù…Ø·Ø¨Ø®": "ðŸ ",
  "Ø§Ù„Ø£Ø¬Ù‡Ø²Ø© Ø§Ù„Ø°ÙƒÙŠØ©": "ðŸ“±",
  "Ø§Ù„Ø£Ø·ÙØ§Ù„": "ðŸ§¸",
  "Ø§Ù„Ù…ÙƒÙ…Ù„Ø§Øª Ø§Ù„ØºØ°Ø§Ø¦ÙŠØ©": "ðŸŒ¿",
  "Ù…Ù†ØªØ¬Ø§Øª Ù…ØªÙ†ÙˆØ¹Ø©": "ðŸ›ï¸",
  "Ø§Ù„Ø¹Ù†Ø§ÙŠØ© Ø¨Ø§Ù„Ø¨Ø´Ø±Ø©": "âœ¨",
};

export default function Home() {
  const { data: featuredProducts, isLoading: loadingProducts } = useGetFeaturedProducts({
    query: { queryKey: getGetFeaturedProductsQueryKey() }
  });

  const { data: categories, isLoading: loadingCategories } = useGetCategories({
    query: { queryKey: getGetCategoriesQueryKey() }
  });

  return (
    <div className="flex flex-col">
      {/* â”€â”€ Hero Slider â”€â”€ */}
      <HeroSlider />

      {/* â”€â”€ Trust Badges â”€â”€ */}
      <section className="bg-white border-b border-slate-100 py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              {
                icon: <Truck className="h-6 w-6" />,
                color: "text-primary bg-blue-50",
                title: "ØªÙˆØµÙŠÙ„ Ø³Ø±ÙŠØ¹",
                desc: "Ù†ÙˆØµÙ„ Ø·Ù„Ø¨Ø§ØªÙƒ Ù„Ø¬Ù…ÙŠØ¹ Ø§Ù„Ù…Ø¯Ù† Ø§Ù„Ù„ÙŠØ¨ÙŠØ©",
              },
              {
                icon: <CreditCard className="h-6 w-6" />,
                color: "text-emerald-600 bg-emerald-50",
                title: "Ø¯ÙØ¹ Ø¹Ù†Ø¯ Ø§Ù„Ø§Ø³ØªÙ„Ø§Ù…",
                desc: "ØªØ³ÙˆÙ‚ Ø¨Ø£Ù…Ø§Ù† ÙˆØ§Ø¯ÙØ¹ Ø¹Ù†Ø¯ Ø§Ø³ØªÙ„Ø§Ù… Ù…Ù†ØªØ¬Ø§ØªÙƒ",
              },
              {
                icon: <ShieldCheck className="h-6 w-6" />,
                color: "text-amber-600 bg-amber-50",
                title: "Ù…Ù†ØªØ¬Ø§Øª Ø£ØµÙ„ÙŠØ©",
                desc: "Ù†Ø¶Ù…Ù† Ù„Ùƒ Ø¬ÙˆØ¯Ø© Ø¬Ù…ÙŠØ¹ Ø§Ù„Ù…Ù†ØªØ¬Ø§Øª Ø§Ù„Ù…Ø¹Ø±ÙˆØ¶Ø©",
              },
            ].map((b) => (
              <div key={b.title} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${b.color}`}>
                  {b.icon}
                </div>
                <div>
                  <div className="font-bold text-slate-900">{b.title}</div>
                  <div className="text-sm text-slate-500">{b.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* â”€â”€ Categories â”€â”€ */}
      <section className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ShoppingBag className="h-5 w-5 text-primary" />
              <span className="text-xs font-semibold text-primary uppercase tracking-widest">Ø§Ù„Ø£Ù‚Ø³Ø§Ù…</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900">ØªØµÙØ­ Ø­Ø³Ø¨ Ø§Ù„Ù‚Ø³Ù…</h2>
          </div>
          <Link href="/products" className="flex items-center gap-1 text-primary font-semibold hover:underline text-sm">
            Ø¹Ø±Ø¶ Ø§Ù„ÙƒÙ„ <ArrowLeft className="h-4 w-4" />
          </Link>
        </div>

        {loadingCategories ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-24 bg-slate-200 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {categories?.map((cat) => (
              <Link key={cat.id} href={`/products?categoryId=${cat.id}`} className="block group">
                <div className="bg-white border border-slate-100 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 hover:border-primary hover:shadow-md hover:bg-primary/5 transition-all h-24 cursor-pointer">
                  <span className="text-2xl leading-none">
                    {CATEGORY_ICONS[cat.nameAr] || "ðŸ“¦"}
                  </span>
                  <div className="text-xs font-bold text-center text-slate-700 group-hover:text-primary transition-colors leading-tight">
                    {cat.nameAr}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* â”€â”€ Featured Products â”€â”€ */}
      <section className="container mx-auto px-4 pb-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Star className="h-5 w-5 text-amber-400 fill-amber-400" />
              <span className="text-xs font-semibold text-primary uppercase tracking-widest">Ù…Ø®ØªØ§Ø±Ø© Ù„Ùƒ</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900">Ø£Ø¨Ø±Ø² Ø§Ù„Ù…Ù†ØªØ¬Ø§Øª</h2>
          </div>
          <Link href="/products" className="flex items-center gap-1 text-primary font-semibold hover:underline text-sm">
            Ø¹Ø±Ø¶ Ø§Ù„ÙƒÙ„ <ArrowLeft className="h-4 w-4" />
          </Link>
        </div>

        {loadingProducts ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-72 bg-slate-200 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 animate-fade-in">
            {featuredProducts?.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* â”€â”€ Latest Articles â”€â”€ */}
      <LatestArticles />

      {/* â”€â”€ Testimonials â”€â”€ */}
      <Testimonials />

      {/* â”€â”€ CTA Slider â”€â”€ */}
      <CTASlider />
    </div>
  );
}

