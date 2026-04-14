import { useEffect } from "react";
import { Link } from "wouter";
import { articles } from "@/lib/blog-data";
import { ArrowLeft, Clock, Tag, BookOpen } from "lucide-react";

export default function BlogList() {
  useEffect(() => {
    document.title = "المدونة — جودة ماركت";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute(
        "content",
        "مدونة جودة ماركت — مقالات ونصائح في التجميل والعناية الشخصية والأجهزة المنزلية والتسوق الذكي."
      );
    }
  }, []);

  const [featured, ...rest] = articles;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Page Header */}
      <div className="bg-white border-b border-slate-100 py-10">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-bold px-4 py-1.5 rounded-full mb-4">
            <BookOpen className="h-3.5 w-3.5" />
            المدونة
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-3">
            نصائح، أدلة، وإلهام
          </h1>
          <p className="text-slate-500 max-w-md mx-auto text-sm md:text-base">
            مقالات مختارة في التجميل، الأجهزة المنزلية، والتسوق الذكي.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Featured article */}
        <Link href={`/blog/${featured.slug}`} className="block mb-10 group">
          <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-lg transition-shadow">
            <div className="md:flex">
              <div className="md:w-1/2 h-56 md:h-auto relative overflow-hidden">
                <img
                  src={featured.imageUrl}
                  alt={featured.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-4 right-4 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full">
                  مقالة مميزة
                </span>
              </div>
              <div className="md:w-1/2 p-7 md:p-10 flex flex-col justify-center">
                <div className="flex items-center gap-3 text-xs text-slate-400 mb-4">
                  <span className="flex items-center gap-1">
                    <Tag className="h-3 w-3" />
                    {featured.category}
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {featured.readTime} قراءة
                  </span>
                  <span>·</span>
                  <span>{featured.date}</span>
                </div>
                <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 mb-3 group-hover:text-primary transition-colors leading-snug">
                  {featured.title}
                </h2>
                <p className="text-slate-500 text-sm leading-relaxed mb-6">
                  {featured.excerpt}
                </p>
                <span className="inline-flex items-center gap-2 text-primary font-bold text-sm group-hover:gap-3 transition-all">
                  اقرأ المقالة
                  <ArrowLeft className="h-4 w-4" />
                </span>
              </div>
            </div>
          </div>
        </Link>

        {/* Rest of articles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {rest.map((article) => (
            <Link key={article.slug} href={`/blog/${article.slug}`} className="block group">
              <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow h-full flex flex-col">
                <div className="h-48 overflow-hidden relative">
                  <img
                    src={article.imageUrl}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex items-center gap-3 text-xs text-slate-400 mb-3">
                    <span className="flex items-center gap-1">
                      <Tag className="h-3 w-3" />
                      {article.category}
                    </span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {article.readTime} قراءة
                    </span>
                  </div>
                  <h2 className="text-lg font-extrabold text-slate-900 mb-2 group-hover:text-primary transition-colors leading-snug flex-1">
                    {article.title}
                  </h2>
                  <p className="text-slate-500 text-sm leading-relaxed mb-4 line-clamp-2">
                    {article.excerpt}
                  </p>
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-50">
                    <span className="text-xs text-slate-400">{article.date}</span>
                    <span className="inline-flex items-center gap-1 text-primary font-bold text-sm group-hover:gap-2 transition-all">
                      اقرأ المزيد
                      <ArrowLeft className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
