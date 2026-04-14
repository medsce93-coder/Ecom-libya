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

  // Track previous filter to detect changes
  const prevFilterRef = useRef({ search: "", categoryId: "" });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const catId = params.get("categoryId");
    if (catId) setCategoryId(catId);
  }, []);

  // Reset pagination whenever filters change
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

  // Append or replace products when new data arrives
  useEffect(() => {
    if (!productsData) return;
    if (page === 1) {
      setAllProducts(productsData.products);
    } else {
      setAllProducts(prev => {
        // Deduplicate by id in case of race conditions
        const existingIds = new Set(prev.map((p: any) => p.id));
        const fresh = productsData.products.filter((p: any) => !existingIds.has(p.id));
        return [...prev, ...fresh];
      });
    }
    setTotal(productsData.total);
    setIsLoadingMore(false);
  }, [productsData]);

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

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Page Header */}
      <div className="bg-white border-b border-slate-100 py-6">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">Ø§Ù„Ù…Ù†ØªØ¬Ø§Øª</h1>
              {total > 0 && (
                <p className="text-sm text-slate-500 mt-0.5">
                  {total} Ù…Ù†ØªØ¬ Ù…ØªØ§Ø­
                  {categoryId && categories && (
                    <span className="font-semibold text-primary">
                      {" "}Â· {categories.find(c => c.id === categoryId)?.nameAr}
                    </span>
                  )}
                </p>
              )}
            </div>
            <button
              className="flex items-center gap-2 text-sm font-semibold text-slate-600 bg-white border border-slate-200 px-4 py-2 rounded-xl hover:border-primary hover:text-primary transition-colors md:hidden"
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal className="h-4 w-4" />
              Ø§Ù„ÙÙ„Ø§ØªØ±
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-6">
          {/* â”€â”€ Sidebar â”€â”€ */}
          <aside className={`w-full md:w-56 shrink-0 space-y-5 ${showFilters ? "block" : "hidden md:block"}`}>
            {/* Search */}
            <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
              <h3 className="font-bold text-sm text-slate-900 mb-3">Ø§Ù„Ø¨Ø­Ø«</h3>
              <div className="relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Ø§Ø¨Ø­Ø« Ø¹Ù† Ù…Ù†ØªØ¬..."
                  className="pr-9 bg-slate-50 rounded-xl border-slate-200 h-10 text-sm"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            {/* Categories */}
            <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-sm text-slate-900">Ø§Ù„Ø£Ù‚Ø³Ø§Ù…</h3>
                {hasFilters && (
                  <button onClick={clearFilters} className="text-xs text-primary hover:underline flex items-center gap-0.5">
                    <X className="h-3 w-3" /> Ù…Ø³Ø­
                  </button>
                )}
              </div>
              <ul className="space-y-0.5">
                <li>
                  <button
                    className={`text-sm w-full text-right py-2 px-3 rounded-xl transition-colors font-medium ${
                      !categoryId ? "bg-primary text-white" : "text-slate-600 hover:bg-slate-50"
                    }`}
                    onClick={() => setCategoryId("")}
                  >
                    Ø§Ù„ÙƒÙ„
                  </button>
                </li>
                {categories?.map((cat) => (
                  <li key={cat.id}>
                    <button
                      className={`text-sm w-full text-right py-2 px-3 rounded-xl transition-colors flex justify-between items-center font-medium ${
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

          {/* â”€â”€ Product Grid â”€â”€ */}
          <div className="flex-1 min-w-0">
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
                <h3 className="text-lg font-bold text-slate-900 mb-2">Ù„Ø§ ØªÙˆØ¬Ø¯ Ù…Ù†ØªØ¬Ø§Øª</h3>
                <p className="text-slate-500 text-sm mb-6">Ù„Ù… Ù†Ø¹Ø«Ø± Ø¹Ù„Ù‰ Ù…Ù†ØªØ¬Ø§Øª ØªØ·Ø§Ø¨Ù‚ Ø¨Ø­Ø«Ùƒ.</p>
                <button
                  onClick={clearFilters}
                  className="text-primary font-semibold hover:underline text-sm"
                >
                  Ù…Ø³Ø­ Ø§Ù„ÙÙ„Ø§ØªØ± ÙˆØ§Ù„Ø¨Ø­Ø«
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {allProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}

                  {/* Skeleton tiles appended during load-more */}
                  {isLoadingMore && Array.from({ length: 4 }).map((_, i) => (
                    <div key={`skeleton-${i}`} className="h-72 bg-slate-200 rounded-2xl animate-pulse" />
                  ))}
                </div>

                {/* Load More Button */}
                {hasMore && (
                  <div className="flex justify-center mt-10">
                    <button
                      onClick={handleLoadMore}
                      disabled={isLoadingMore || isFetching}
                      className="group relative flex items-center gap-3 bg-primary hover:bg-primary/90 disabled:bg-primary/60 text-white font-bold text-base px-10 py-4 rounded-2xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      {isLoadingMore || isFetching ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          <span>Ø¬Ø§Ø±ÙŠ Ø§Ù„ØªØ­Ù…ÙŠÙ„...</span>
                        </>
                      ) : (
                        <>
                          <span>Ø¹Ø±Ø¶ Ø§Ù„Ù…Ø²ÙŠØ¯</span>
                          <span className="bg-white/20 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                            {total - allProducts.length} Ù…Ù†ØªØ¬
                          </span>
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* All-loaded indicator */}
                {!hasMore && allProducts.length > 0 && total > PAGE_LIMIT && (
                  <div className="flex items-center gap-3 justify-center mt-10 text-slate-400 text-sm">
                    <div className="h-px w-16 bg-slate-200" />
                    <span>ØªÙ… Ø¹Ø±Ø¶ Ø¬Ù…ÙŠØ¹ Ø§Ù„Ù…Ù†ØªØ¬Ø§Øª ({total})</span>
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

