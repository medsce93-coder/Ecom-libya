import { useState, useEffect, useRef } from "react";
import { useGetProducts, getGetProductsQueryKey, useGetCategories, getGetCategoriesQueryKey } from "@/lib/api-client";
import { ProductCard } from "@/components/ProductCard";
import { Input } from "@/components/ui/input";
import { Search, SlidersHorizontal, X, Loader2 } from "lucide-react";

const PAGE_LIMIT = 16;

export default function Products() {
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const prevFilterRef = useRef({ search: "", categoryId: "" });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const catId = params.get("categoryId");
    if (catId) setCategoryId(catId);
  }, []);

  useEffect(() => {
    const prev = prevFilterRef.current;
    if (prev.search !== search || prev.categoryId !== categoryId) {
      prevFilterRef.current = { search, categoryId };
      setPage(1);
      setAllProducts([]);
      setTotal(0);
      setIsLoadingMore(false);
    }
  }, [search, categoryId]);

  const activeCategoryId = categoryId || undefined;
  const queryParams = {
    search: search || undefined,
    categoryId: activeCategoryId,
    page,
    limit: PAGE_LIMIT,
  };

  const { data: productsData, isLoading, isFetching } = useGetProducts(
    queryParams,
    { query: { queryKey: getGetProductsQueryKey(queryParams) } }
  );

  const { data: categories } = useGetCategories({
    query: { queryKey: getGetCategoriesQueryKey() }
  });

  useEffect(() => {
    if (!productsData) return;
    if (page === 1) {
      setAllProducts(productsData.products);
    } else {
      setAllProducts(prev => {
        const existingIds = new Set(prev.map((p: any) => p.id));
        const fresh = productsData.products.filter((p: any) => !existingIds.has(p.id));
        return [...prev, ...fresh];
      });
    }
    setTotal(productsData.total);
    setIsLoadingMore(false);
  }, [productsData, page]);

  const clearFilters = () => {
    setSearch("");
    setCategoryId("");
  };

  const handleLoadMore = () => {
    setIsLoadingMore(true);
    setPage(prev => prev + 1);
  };

  const hasFilters = !!search || !!categoryId;
  const hasMore = allProducts.length < total && total > 0;
  const showInitialSkeleton = isLoading && page === 1 && allProducts.length === 0;
  const selectedCategory = categories?.find((cat) => cat.id === categoryId);
  const activeFilterCount = Number(!!search) + Number(!!categoryId);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50/70">
      <div className="bg-white/95 border-b border-slate-100 py-7">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">المنتجات</h1>
              <p className="text-sm text-slate-500 mt-1">تسوق حسب القسم أو ابحث مباشرة عن المنتج المناسب.</p>
              {total > 0 && (
                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                  <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 font-medium">{total} منتج متاح</span>
                  {selectedCategory && (
                    <span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary font-semibold">
                      القسم: {selectedCategory.nameAr}
                    </span>
                  )}
                </div>
              )}
            </div>
            <button
              className="relative flex items-center gap-2 text-sm font-semibold text-slate-700 bg-white border border-slate-200 px-4 py-2 rounded-xl hover:border-primary hover:text-primary transition-colors md:hidden"
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal className="h-4 w-4" />
              الفلاتر
              {activeFilterCount > 0 && (
                <span className="absolute -top-2 -left-2 min-w-5 h-5 px-1 rounded-full bg-primary text-white text-[11px] flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          <aside className={`w-full md:w-64 shrink-0 space-y-5 ${showFilters ? "block" : "hidden md:block"} md:sticky md:top-24`}>
            <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
              <h3 className="font-bold text-sm text-slate-900 mb-3">البحث</h3>
              <div className="relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="ابحث عن منتج..."
                  className="pr-9 bg-slate-50 rounded-xl border-slate-200 h-10 text-sm"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-sm text-slate-900">الأقسام</h3>
                {hasFilters && (
                  <button onClick={clearFilters} className="text-xs text-primary hover:underline flex items-center gap-0.5">
                    <X className="h-3 w-3" /> إعادة ضبط
                  </button>
                )}
              </div>
              <ul className="space-y-1">
                <li>
                  <button
                    className={`text-sm w-full text-right py-2 px-3 rounded-xl transition-colors font-medium ${
                      !categoryId ? "bg-primary text-white" : "text-slate-600 hover:bg-slate-50"
                    }`}
                    onClick={() => setCategoryId("")}
                  >
                    كل الأقسام
                  </button>
                </li>
                {categories?.map((cat) => (
                  <li key={cat.id}>
                    <button
                      className={`text-sm w-full text-right py-2 px-3 rounded-xl transition-colors flex justify-between items-center gap-2 font-medium ${
                        categoryId === cat.id
                          ? "bg-primary text-white"
                          : "text-slate-600 hover:bg-slate-50"
                      }`}
                      onClick={() => setCategoryId(cat.id)}
                    >
                      <span className="truncate">{cat.nameAr}</span>
                      <span className={`text-xs px-1.5 py-0.5 rounded-full shrink-0 ${
                        categoryId === cat.id ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                      }`}>
                        {cat.productCount}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          <div className="flex-1 min-w-0">
            {hasFilters && (
              <div className="mb-5 rounded-2xl border border-slate-200 bg-white px-4 py-3 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  {search && <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">بحث: {search}</span>}
                  {selectedCategory && <span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary font-semibold">{selectedCategory.nameAr}</span>}
                </div>
                <button onClick={clearFilters} className="text-xs font-semibold text-primary hover:underline">
                  مسح جميع الفلاتر
                </button>
              </div>
            )}

            {showInitialSkeleton ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {Array.from({ length: PAGE_LIMIT }).map((_, i) => (
                  <div key={i} className="h-72 bg-slate-200 rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : allProducts.length === 0 && !isFetching ? (
              <div className="text-center py-24 bg-white rounded-2xl border border-dashed border-slate-200">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="h-7 w-7 text-slate-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">لا توجد منتجات</h3>
                <p className="text-slate-500 text-sm mb-6">لم نعثر على منتجات تطابق بحثك الحالي.</p>
                <button
                  onClick={clearFilters}
                  className="inline-flex items-center rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/5"
                >
                  مسح الفلاتر والبحث
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-bold text-slate-800">النتائج</h2>
                  <span className="text-xs text-slate-500">عرض {allProducts.length} من {total}</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {allProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}

                  {isLoadingMore && Array.from({ length: 4 }).map((_, i) => (
                    <div key={`skeleton-${i}`} className="h-72 bg-slate-200 rounded-2xl animate-pulse" />
                  ))}
                </div>

                {hasMore && (
                  <div className="flex justify-center mt-10">
                    <button
                      onClick={handleLoadMore}
                      disabled={isLoadingMore || isFetching}
                      className="group relative flex items-center gap-3 bg-primary hover:bg-primary/90 disabled:bg-primary/60 text-white font-bold text-sm md:text-base px-8 py-3.5 rounded-2xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      {isLoadingMore || isFetching ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          <span>جارٍ التحميل...</span>
                        </>
                      ) : (
                        <>
                          <span>عرض المزيد</span>
                          <span className="bg-white/20 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                            {total - allProducts.length} منتج
                          </span>
                        </>
                      )}
                    </button>
                  </div>
                )}

                {!hasMore && allProducts.length > 0 && total > PAGE_LIMIT && (
                  <div className="flex items-center gap-3 justify-center mt-10 text-slate-400 text-sm">
                    <div className="h-px w-16 bg-slate-200" />
                    <span>تم عرض جميع المنتجات ({total})</span>
                    <div className="h-px w-16 bg-slate-200" />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
