import { useEffect } from "react";
import { Link, useParams } from "wouter";
import { getArticleBySlug, articles } from "@/lib/blog-data";
import { ArrowRight, Clock, Tag, Calendar, BookOpen, ArrowLeft } from "lucide-react";

function renderMarkdown(content: string): string {
  return content
    .trim()
    .split("\n")
    .map((line) => {
      if (line.startsWith("## ")) {
        return `<h2 class="text-xl md:text-2xl font-extrabold text-slate-900 mt-10 mb-4">${line.slice(3)}</h2>`;
      }
      if (line.startsWith("### ")) {
        return `<h3 class="text-lg font-bold text-slate-900 mt-6 mb-3">${line.slice(4)}</h3>`;
      }
      if (line.startsWith("- **")) {
        const inner = line.slice(2).replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
        return `<li class="text-slate-700 text-base leading-relaxed mb-1">${inner}</li>`;
      }
      if (line.startsWith("- ")) {
        return `<li class="text-slate-700 text-base leading-relaxed mb-1">${line.slice(2)}</li>`;
      }
      if (line === "") {
        return "<br/>";
      }
      const processed = line.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
      if (processed.startsWith("<h") || processed.startsWith("<li") || processed.startsWith("<br")) {
        return processed;
      }
      return `<p class="text-slate-700 text-base leading-relaxed mb-4">${processed}</p>`;
    })
    .join("\n");
}

export default function BlogPost() {
  const params = useParams<{ slug: string }>();
  const article = params.slug ? getArticleBySlug(params.slug) : undefined;

  useEffect(() => {
    if (article) {
      document.title = `${article.title} — جودة ماركت`;
      let meta = document.querySelector('meta[name="description"]');
      if (!meta) {
        meta = document.createElement("meta");
        meta.setAttribute("name", "description");
        document.head.appendChild(meta);
      }
      meta.setAttribute("content", article.metaDescription);
    } else {
      document.title = "مقالة غير موجودة — جودة ماركت";
    }
    return () => {
      document.title = "جودة ماركت";
    };
  }, [article]);

  if (!article) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="h-16 w-16 text-slate-200 mx-auto mb-4" />
          <h1 className="text-2xl font-extrabold text-slate-900 mb-2">المقالة غير موجودة</h1>
          <p className="text-slate-500 mb-6">لم نتمكن من إيجاد المقالة المطلوبة.</p>
          <Link href="/blog" className="inline-flex items-center gap-2 bg-primary text-white font-bold px-6 py-3 rounded-xl hover:bg-primary/90 transition-colors">
            <ArrowRight className="h-4 w-4" />
            العودة للمدونة
          </Link>
        </div>
      </div>
    );
  }

  const otherArticles = articles.filter((a) => a.slug !== article.slug).slice(0, 2);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero image */}
      <div className="relative h-56 md:h-80 lg:h-96 overflow-hidden bg-slate-900">
        <img
          src={article.imageUrl}
          alt={article.title}
          className="w-full h-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
        <div className="absolute bottom-0 right-0 left-0 container mx-auto px-4 pb-8">
          <div className="flex items-center gap-3 text-white/80 text-xs mb-3">
            <Link href="/blog" className="hover:text-white transition-colors flex items-center gap-1">
              <ArrowRight className="h-3 w-3" />
              المدونة
            </Link>
            <span>/</span>
            <span>{article.category}</span>
          </div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-white leading-snug max-w-3xl">
            {article.title}
          </h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
        <div className="max-w-3xl mx-auto">
          {/* Meta bar */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400 mb-10 pb-6 border-b border-slate-200">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-primary" />
              {article.date}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-primary" />
              {article.readTime} قراءة
            </span>
            <span className="flex items-center gap-1.5">
              <Tag className="h-4 w-4 text-primary" />
              {article.category}
            </span>
          </div>

          {/* Article body */}
          <div
            className="prose-custom"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(article.content) }}
          />

          {/* CTA */}
          <div className="mt-14 bg-gradient-to-r from-primary to-blue-700 rounded-2xl p-8 text-white text-center">
            <h3 className="text-xl font-extrabold mb-2">استعد للتجربة بنفسك</h3>
            <p className="text-blue-200 text-sm mb-5">
              اكتشف جميع المنتجات المذكورة في هذه المقالة في جودة ماركت مع ضمان الجودة والتوصيل السريع.
            </p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 bg-white text-primary font-bold px-7 py-3 rounded-full hover:bg-blue-50 transition-colors shadow-lg"
            >
              تسوق الآن
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </div>

          {/* Related articles */}
          {otherArticles.length > 0 && (
            <div className="mt-14">
              <h3 className="text-xl font-extrabold text-slate-900 mb-6">مقالات أخرى</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {otherArticles.map((a) => (
                  <Link key={a.slug} href={`/blog/${a.slug}`} className="block group">
                    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex gap-4 p-4">
                      <img
                        src={a.imageUrl}
                        alt={a.title}
                        className="w-20 h-20 rounded-xl object-cover shrink-0 group-hover:scale-105 transition-transform"
                      />
                      <div className="flex flex-col justify-between min-w-0">
                        <p className="text-sm font-bold text-slate-900 group-hover:text-primary transition-colors leading-snug line-clamp-2">
                          {a.title}
                        </p>
                        <span className="text-xs text-slate-400 mt-1">{a.date}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
