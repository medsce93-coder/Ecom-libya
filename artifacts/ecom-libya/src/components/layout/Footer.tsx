import { Link } from "wouter";
import { MessageCircle, Phone, Mail, Package } from "lucide-react";
import { useBranding } from "@/lib/branding-context";

export function Footer() {
  const { logoUrl, storeName } = useBranding();

  return (
    <footer className="bg-slate-900 text-white mt-auto">
      <div className="container mx-auto px-4 py-14 grid grid-cols-1 md:grid-cols-3 gap-10">
        {/* Brand */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={storeName}
                className="h-9 w-auto max-w-[160px] object-contain brightness-0 invert"
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
              />
            ) : (
              <>
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Package className="h-4 w-4 text-white" />
                </div>
                <span className="text-xl font-extrabold tracking-tight">{storeName}</span>
              </>
            )}
          </div>
          <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
            منصتك الموثوقة للتسوق الإلكتروني في ليبيا. جودة مضمونة، توصيل سريع لجميع المدن، والدفع عند الاستلام.
          </p>
          <a
            href="https://wa.me/212765074750"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20bd5c] text-white text-sm font-bold px-5 py-2.5 rounded-full transition-colors"
          >
            <MessageCircle className="h-4 w-4" />
            تواصل عبر واتساب
          </a>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="font-bold text-base mb-5 text-white">روابط سريعة</h4>
          <ul className="space-y-3 text-sm text-slate-400">
            <li>
              <Link href="/" className="hover:text-white transition-colors inline-block">الرئيسية</Link>
            </li>
            <li>
              <Link href="/products" className="hover:text-white transition-colors inline-block">المنتجات</Link>
            </li>
            <li>
              <Link href="/blog" className="hover:text-white transition-colors inline-block">المدونة</Link>
            </li>
            <li>
              <Link href="/cart" className="hover:text-white transition-colors inline-block">سلة المشتريات</Link>
            </li>
            <li>
              <Link href="/checkout" className="hover:text-white transition-colors inline-block">إتمام الطلب</Link>
            </li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="font-bold text-base mb-5 text-white">تواصل معنا</h4>
          <ul className="space-y-3 text-sm text-slate-400">
            <li className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-primary shrink-0" />
              <span dir="ltr">+212 765 074 750</span>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-primary shrink-0" />
              <span>info@libyastore.ly</span>
            </li>
          </ul>
          <div className="mt-6">
            <p className="text-xs text-slate-500 mb-2 font-semibold">مميزات التسوق:</p>
            <ul className="text-xs text-slate-400 space-y-1.5">
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                دفع عند الاستلام
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                توصيل لجميع المدن الليبية
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                منتجات أصلية مضمونة
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-800">
        <div className="container mx-auto px-4 py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <span>&copy; {new Date().getFullYear()} {storeName}. جميع الحقوق محفوظة.</span>
          <span>الدفع عند الاستلام · توصيل آمن · جودة مضمونة</span>
        </div>
      </div>
    </footer>
  );
}
