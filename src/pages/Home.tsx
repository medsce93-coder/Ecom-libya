import { Link } from "wouter";
import { useGetFeaturedProducts, getGetFeaturedProductsQueryKey, useGetCategories, getGetCategoriesQueryKey } from "@/lib/api-client";
import { ShieldCheck, Truck, CreditCard, ShoppingBag, Star, ArrowLeft } from "lucide-react";
import { ProductCard } from "@/components/ProductCard";
import { Testimonials } from "@/components/Testimonials";
import { LatestArticles } from "@/components/LatestArticles";
import { HeroSlider } from "@/components/HeroSlider";
import { CTASlider } from "@/components/CTASlider";
import { useBranding } from "@/lib/branding-context";

const CATEGORY_ICONS_BY_ID: Record<string, string> = {
  beauty: "💄",
  personal: "💊",
  home: "🏠",
  smart: "📱",
  kids: "🧸",
  supplements: "🌿",
  various: "🛍️",
  skincare: "✨",
};

export default function Home() {
  const { marketCountryAdjective } = useBranding();
  const { data: featuredProducts, isLoading: loadingProducts } = useGetFeaturedProducts({
    query: { queryKey: getGetFeaturedProductsQueryKey() }
  });

  const { data: categories, isLoading: loadingCategories } = useGetCategories({
    query: { queryKey: getGetCategoriesQueryKey() }
  });

  return (
    <div className="flex flex-col bg-gradient-to-b from-slate-50 via-white to-slate-50/60">
      <HeroSlider />

      <section className="bg-white/95 border-y border-slate-100 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 mb-6">
            <div>
              <p className="text-sm font-semibold text-primary">تسوّق بثقة من متجرك المحلي</p>
              <p className="text-sm text-slate-600">منتجات يومية مختارة بعناية مع توصيل سريع والدفع عند الاستلام.</p>
            </div>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:border-primary hover:text-primary transition-colors"
            >
              تصفح كل المنتجات
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              {
                icon: <Truck className="h-6 w-6" />,
                color: "text-primary bg-blue-50",
                title: "توصيل سريع",
                desc: `نوصّل طلباتك لجميع المدن ${marketCountryAdjective}`,
              },
              {
                icon: <CreditCard className="h-6 w-6" />,
                color: "text-emerald-600 bg-emerald-50",
                title: "دفع عند الاستلام",
                desc: "تسوّق بأمان وادفع عند استلام منتجاتك",
              },
              {
                icon: <ShieldCheck className="h-6 w-6" />,
                color: "text-amber-600 bg-amber-50",
                title: "منتجات أصلية",
                desc: "نضمن لك جودة جميع المنتجات المعروضة",
              },
            ].map((b) => (
              <div key={b.title} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
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

      <section id="home-categories" className="container mx-auto px-4 py-14">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ShoppingBag className="h-5 w-5 text-primary" />
              <span className="text-xs font-semibold text-primary uppercase tracking-widest">الأقسام</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900">تصفح حسب القسم</h2>
            <p className="text-sm text-slate-500 mt-1">اختَر القسم المناسب للوصول إلى المنتجات أسرع.</p>
          </div>
          <Link href="/products" className="hidden sm:inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-4 py-2 text-primary font-semibold text-sm hover:border-primary hover:bg-primary/5 transition-colors">
            عرض الكل <ArrowLeft className="h-4 w-4" />
          </Link>
        </div>

        {loadingCategories ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-28 bg-slate-200 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
            {categories?.map((cat) => (
              <Link key={cat.id} href={`/products?categoryId=${cat.id}`} className="block group">
                <div className="bg-white border border-slate-100 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 hover:border-primary hover:shadow-md hover:bg-primary/5 transition-all h-28 cursor-pointer">
                  <span className="text-2xl leading-none">
                    {CATEGORY_ICONS_BY_ID[cat.id] || "📦"}
                  </span>
                  <div className="text-xs font-bold text-center text-slate-700 group-hover:text-primary transition-colors leading-tight">
                    {cat.nameAr}
                  </div>
                  <span className="text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                    {cat.productCount} منتج
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="container mx-auto px-4 pb-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Star className="h-5 w-5 text-amber-400 fill-amber-400" />
              <span className="text-xs font-semibold text-primary uppercase tracking-widest">مختارة لك</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900">أبرز المنتجات</h2>
            <p className="text-sm text-slate-500 mt-1">اختيارات مميزة يكثر طلبها من العملاء.</p>
          </div>
          <Link href="/products" className="hidden sm:inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-4 py-2 text-primary font-semibold text-sm hover:border-primary hover:bg-primary/5 transition-colors">
            عرض الكل <ArrowLeft className="h-4 w-4" />
          </Link>
        </div>

        {loadingProducts ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-72 bg-slate-200 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : featuredProducts?.length ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 animate-fade-in">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
            لا توجد منتجات مميزة حالياً.
          </div>
        )}
      </section>

      <LatestArticles />

      <Testimonials />

      <CTASlider />
    </div>
  );
}
