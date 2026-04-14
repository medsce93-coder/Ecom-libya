import { Link } from "wouter";
import { articles } from "@/lib/blog-data";
import { ArrowLeft, BookOpen } from "lucide-react";

const latest = articles.slice(0, 3);

export function LatestArticles() {
  return (
    <section className="container mx-auto px-4 py-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BookOpen className="h-5 w-5 text-primary" />
            <span className="text-xs font-semibold text-primary uppercase tracking-widest">المدونة</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900">أحدث المقالات</h2>
        </div>
        <Link
          href="/blog"
          className="flex items-center gap-1 text-primary font-semibold hover:underline text-sm"
        >
          عرض الكل <ArrowLeft className="h-4 w-4" />
        </Link>
      </div>

      {/* Articles grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {latest.map((article) => (
          <Link key={article.slug} href={`/blog/${article.slug}`} className="block group">
            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow h-full flex flex-col">
              {/* Thumbnail */}
              <div className="h-44 overflow-hidden">
                <img
                  src={article.imageUrl}
                  alt={article.title}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              {/* Content */}
              <div className="p-5 flex flex-col flex-1">
                <h3 className="font-extrabold text-slate-900 text-base leading-snug mb-2 group-hover:text-primary transition-colors line-clamp-2">
                  {article.title}
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed line-clamp-2 flex-1">
                  {article.excerpt}
                </p>
                <span className="inline-flex items-center gap-1 text-primary font-bold text-sm mt-4 group-hover:gap-2 transition-all">
                  اقرأ المزيد
                  <ArrowLeft className="h-3.5 w-3.5" />
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
