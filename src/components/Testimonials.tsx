import { Star, Quote } from "lucide-react";

const REVIEWS = [
  {
    id: 1,
    name: "فاطمة الزهراء المنصوري",
    city: "طرابلس",
    rating: 5,
    date: "مارس 2025",
    avatar: "ف",
    avatarColor: "bg-rose-500",
    text: "تجربة تسوق رائعة من البداية للنهاية! طلبت جهاز تدليك الرقبة ووصل في أقل من 48 ساعة وهو مغلّف بشكل ممتاز. الجودة فاقت توقعاتي تماماً والسعر أفضل بكثير من المحلات. سأتسوق مرة أخرى بكل تأكيد.",
  },
  {
    id: 2,
    name: "عبد الرحمن الطيب",
    city: "بنغازي",
    rating: 5,
    date: "أبريل 2025",
    avatar: "ع",
    avatarColor: "bg-blue-600",
    text: "صراحة كنت متردداً في البداية من التسوق أونلاين، لكن ميزة الدفع عند الاستلام غيّرت كل شيء. طلبت المكنسة الذكية ووصلت بحالة ممتازة. الموظف اللي سلّم الطلب كان محترم جداً. ممتاز!",
  },
  {
    id: 3,
    name: "مريم الكيلاني",
    city: "مصراتة",
    rating: 5,
    date: "فبراير 2025",
    avatar: "م",
    avatarColor: "bg-emerald-600",
    text: "اشتريت مجموعة منتجات عناية للبشرة وكانت كلها أصلية 100%، مش زي بعض المحلات اللي تبيع تقليد. الزيت الافغاني الأصلي والسيروم الكوري وصلوا بنفس اليوم المحدد. جودة ماركت من أفضل المتاجر اللي تعاملت معها.",
  },
  {
    id: 4,
    name: "خالد أبو بكر الغرياني",
    city: "الزاوية",
    rating: 5,
    date: "مارس 2025",
    avatar: "خ",
    avatarColor: "bg-amber-600",
    text: "خدمة عملاء تستاهل 10 نجوم. لما كان في مشكلة صغيرة في الطلب، ردوا علي على الواتساب في أقل من 10 دقائق وحلوا المشكلة فوراً. هذا الالتزام نادر في السوق الليبي. شكراً جودة ماركت!",
  },
  {
    id: 5,
    name: "أسماء الشريف",
    city: "سبها",
    rating: 5,
    date: "أبريل 2025",
    avatar: "أ",
    avatarColor: "bg-violet-600",
    text: "ما توقعت يوصل لسبها بهالسرعة! طلبت حزام تدريب الخصر وجهاز التدليك ووصلوا خلال يومين. المنتجات بالضبط زي ما هم في الصور. سعيدة جداً وراح أرشح جودة ماركت لكل صديقاتي.",
  },
];

function StarRating({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${i < count ? "fill-amber-400 text-amber-400" : "fill-slate-200 text-slate-200"}`}
        />
      ))}
    </div>
  );
}

export function Testimonials() {
  return (
    <section className="bg-gradient-to-b from-slate-50 to-white py-16 md:py-20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold px-4 py-1.5 rounded-full mb-4">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            آراء عملائنا
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-3">
            ماذا يقول عملاؤنا عنّا؟
          </h2>
          <p className="text-slate-500 max-w-md mx-auto text-sm md:text-base">
            أكثر من 5000 عميل سعيد في جميع أنحاء ليبيا. إليك بعض تجاربهم الحقيقية.
          </p>

          {/* Overall rating */}
          <div className="flex items-center justify-center gap-3 mt-5">
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-5 w-5 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <span className="text-2xl font-extrabold text-slate-900">4.9</span>
            <span className="text-slate-500 text-sm">من 5 — بناءً على آلاف التقييمات</span>
          </div>
        </div>

        {/* Reviews grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {REVIEWS.map((review, idx) => (
            <div
              key={review.id}
              className={`relative bg-white rounded-2xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-4 ${
                idx === 0 ? "lg:col-span-2" : ""
              }`}
            >
              {/* Quote icon */}
              <Quote className="absolute top-5 left-5 h-8 w-8 text-primary/10 fill-primary/10" />

              {/* Stars + date */}
              <div className="flex items-center justify-between">
                <StarRating count={review.rating} />
                <span className="text-xs text-slate-400">{review.date}</span>
              </div>

              {/* Review text */}
              <p className="text-slate-700 text-sm leading-relaxed flex-1">
                "{review.text}"
              </p>

              {/* Reviewer info */}
              <div className="flex items-center gap-3 pt-2 border-t border-slate-50">
                <div
                  className={`w-10 h-10 rounded-full ${review.avatarColor} flex items-center justify-center text-white font-bold text-sm shrink-0`}
                >
                  {review.avatar}
                </div>
                <div>
                  <div className="font-bold text-slate-900 text-sm">{review.name}</div>
                  <div className="text-xs text-slate-400">{review.city}</div>
                </div>
                <div className="mr-auto">
                  <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                    مشترٍ موثّق
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
