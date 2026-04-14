import { useParams, useLocation } from "wouter";
import { useGetProduct, getGetProductQueryKey } from "@/lib/api-client";
import { useState, useEffect, useRef } from "react";
import { useStore } from "@/lib/store-context";
import { useCurrency } from "@/lib/currency-context";
import { FlashSaleTimer } from "@/components/FlashSaleTimer";
import { SocialProofPopup } from "@/components/SocialProofPopup";
import {
  CheckCircle2, Star, Truck, Banknote, Shield,
  ChevronDown, Play, Package,
} from "lucide-react";

/* â”€â”€ Per-category benefit bullets â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
const CATEGORY_BENEFITS: Record<string, string[]> = {
  "Ø§Ù„Ø£Ø¬Ù‡Ø²Ø© Ø§Ù„Ø°ÙƒÙŠØ©":           ["ÙŠÙˆÙÙ‘Ø± ÙˆÙ‚ØªÙƒ ÙˆÙŠØ±ÙØ¹ Ø¥Ù†ØªØ§Ø¬ÙŠØªÙƒ ÙƒÙ„ ÙŠÙˆÙ…", "ØªØµÙ…ÙŠÙ… Ø£Ù†ÙŠÙ‚ ÙŠÙ„ÙŠÙ‚ Ø¨Ø£Ø³Ù„ÙˆØ¨ Ø­ÙŠØ§ØªÙƒ", "ÙŠØ¹Ù…Ù„ ÙÙˆØ±Ø§Ù‹ â€” Ø¨Ø¯ÙˆÙ† ØªØ¹Ù‚ÙŠØ¯", "Ø¶Ù…Ø§Ù† Ø´Ø§Ù…Ù„ Ø¹Ù„Ù‰ ÙƒÙ„ Ù‚Ø·Ø¹Ø©"],
  "Ø§Ù„Ø£Ø·ÙØ§Ù„":                   ["Ø¢Ù…Ù† 100% â€” Ø®Ø§Ù„Ù Ù…Ù† Ø£ÙŠ Ù…ÙˆØ§Ø¯ Ø¶Ø§Ø±Ø©", "ÙŠØ­ÙÙ‘Ø² Ø¥Ø¨Ø¯Ø§Ø¹ Ø·ÙÙ„Ùƒ ÙˆØ°ÙƒØ§Ø¡Ù‡", "Ù…ØªÙŠÙ† ÙŠØµÙ…Ø¯ Ø£Ù…Ø§Ù… Ø§Ù„Ù„Ø¹Ø¨ Ø§Ù„ÙŠÙˆÙ…ÙŠ", "Ø³Ø¹Ø§Ø¯Ø© Ø§Ù„Ø£Ø·ÙØ§Ù„ = Ø±Ø§Ø­Ø© Ø¨Ø§Ù„Ùƒ Ø£Ù†ØªÙŽ"],
  "Ø§Ù„Ø¬Ù…Ø§Ù„ ÙˆØ§Ù„Ø¹Ù†Ø§ÙŠØ©":           ["Ù†ØªØ§Ø¦Ø¬ Ù…Ø±Ø¦ÙŠØ© Ù…Ù† Ø§Ù„Ø£Ø³Ø¨ÙˆØ¹ Ø§Ù„Ø£ÙˆÙ„", "Ù…Ù†Ø§Ø³Ø¨ Ù„Ù…Ù†Ø§Ø® Ù„ÙŠØ¨ÙŠØ§ Ø§Ù„Ø­Ø§Ø± ÙˆØ§Ù„Ø¬Ø§Ù", "ØªØ±ÙƒÙŠØ¨Ø© Ù…Ø¬Ø±Ù‘Ø¨Ø© Ù…Ù† Ø¢Ù„Ø§Ù Ø§Ù„Ø¹Ù…ÙŠÙ„Ø§Øª", "Ø³Ø¹Ø± Ø¹Ø§Ø¯Ù„ Ø¨Ø¬ÙˆØ¯Ø© Ø§Ù„Ø¹Ù„Ø§Ù…Ø§Øª Ø§Ù„Ø¹Ø§Ù„Ù…ÙŠØ©"],
  "Ø§Ù„ØµØ­Ø© ÙˆØ§Ù„Ø¹Ù†Ø§ÙŠØ© Ø§Ù„Ø´Ø®ØµÙŠØ©":   ["ÙŠØ¯Ø¹Ù… ØµØ­ØªÙƒ Ø§Ù„ÙŠÙˆÙ…ÙŠØ© ÙØ¹Ù„Ø§Ù‹", "Ù…ÙƒÙˆÙ‘Ù†Ø§Øª Ù…Ø®ØªØ§Ø±Ø© ÙˆÙ…Ø¶Ù…ÙˆÙ†Ø© Ø§Ù„Ø³Ù„Ø§Ù…Ø©", "Ù†ØªØ§Ø¦Ø¬ Ø³Ø±ÙŠØ¹Ø© ØªØ­Ø³Ù‘Ù‡Ø§ Ù…Ù† Ø§Ù„Ø£ÙˆÙ„", "Ù…Ù†Ø§Ø³Ø¨ Ù„Ø¬Ù…ÙŠØ¹ Ø§Ù„ÙØ¦Ø§Øª ÙˆØ§Ù„Ø£Ø¹Ù…Ø§Ø±"],
  "Ø§Ù„Ø¹Ù†Ø§ÙŠØ© Ø¨Ø§Ù„Ø¨Ø´Ø±Ø©":           ["ÙŠÙØ±Ø·Ù‘Ø¨ ÙˆÙŠØ¬Ø¯Ø¯ Ù†Ø¶Ø§Ø±Ø© Ø¨Ø´Ø±ØªÙƒ Ø¨Ø¹Ù…Ù‚", "ØªØ±ÙƒÙŠØ¨Ø© Ù„Ø·ÙŠÙØ© â€” Ø¢Ù…Ù†Ø© Ù„Ù„Ø¨Ø´Ø±Ø© Ø§Ù„Ø­Ø³Ø§Ø³Ø©", "Ø¨Ø´Ø±Ø© Ø£ÙƒØ«Ø± Ø¥Ø´Ø±Ø§Ù‚Ø§Ù‹ ÙˆÙ†Ø¹ÙˆÙ…Ø©", "Ù…Ø¬Ø±Ù‘Ø¨ ÙˆÙ…Ø­Ø¨ÙˆØ¨ Ù…Ù† Ø¢Ù„Ø§Ù Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù…Ø§Øª"],
  "Ø§Ù„Ù…ÙƒÙ…Ù„Ø§Øª Ø§Ù„ØºØ°Ø§Ø¦ÙŠØ©":         ["ÙŠØ¹Ø²Ø² Ø·Ø§Ù‚ØªÙƒ ÙˆØ£Ø¯Ø§Ø¡Ùƒ Ø·ÙˆØ§Ù„ Ø§Ù„ÙŠÙˆÙ…", "ØªØ±ÙƒÙŠØ² Ø¹Ø§Ù„Ù Ø¨Ø£Ø¹Ù„Ù‰ Ù…Ø¹Ø§ÙŠÙŠØ± Ø§Ù„Ø¬ÙˆØ¯Ø©", "Ù†ØªØ§Ø¦Ø¬ ÙˆØ§Ø¶Ø­Ø© Ø®Ù„Ø§Ù„ Ø£Ø³Ø¨ÙˆØ¹ÙŠÙ†", "Ù…Ø«Ø§Ù„ÙŠ Ù„Ù„Ø±ÙŠØ§Ø¶ÙŠÙŠÙ† ÙˆØ£ØµØ­Ø§Ø¨ Ø§Ù„Ù†Ø´Ø§Ø·"],
  "Ø§Ù„Ù…Ù†Ø²Ù„ ÙˆØ§Ù„Ù…Ø·Ø¨Ø®":            ["ÙŠØ­ÙˆÙ‘Ù„ Ù…Ù†Ø²Ù„Ùƒ Ù„Ø¨ÙŠØ¦Ø© Ù…Ù†Ø¸Ù…Ø© ÙˆØ£Ù†ÙŠÙ‚Ø©", "Ø¬ÙˆØ¯Ø© Ù…ÙˆØ§Ø¯ ØªØµÙ…Ø¯ Ù„Ù„Ø§Ø³ØªØ®Ø¯Ø§Ù… Ø§Ù„ÙŠÙˆÙ…ÙŠ", "ÙŠÙˆÙÙ‘Ø± ÙˆÙ‚ØªÙƒ ÙˆØ¬Ù‡Ø¯Ùƒ ÙÙŠ Ø£Ø¹Ù…Ø§Ù„ Ø§Ù„Ù…Ù†Ø²Ù„", "Ù…Ø«Ø§Ù„ÙŠ Ù„Ù„Ù…Ø·Ø¨Ø® Ø§Ù„Ù„ÙŠØ¨ÙŠ ÙˆØ­ÙŠØ§Ø© Ø§Ù„Ø¹Ø§Ø¦Ù„Ø©"],
  "Ù…Ù†ØªØ¬Ø§Øª Ù…ØªÙ†ÙˆØ¹Ø©":             ["Ø¬ÙˆØ¯Ø© Ù…Ø¶Ù…ÙˆÙ†Ø© 100% Ø¹Ù„Ù‰ ÙƒÙ„ Ø·Ù„Ø¨", "Ù…Ù†ØªØ¬ Ù…Ø¬Ø±Ù‘Ø¨ ÙˆÙ…Ø­Ø¨ÙˆØ¨ Ù…Ù† Ø§Ù„Ù„ÙŠØ¨ÙŠÙŠÙ†", "ÙŠÙØ­Ø³Ù‘Ù† Ø­ÙŠØ§ØªÙƒ Ø§Ù„ÙŠÙˆÙ…ÙŠØ© ÙØ¹Ù„Ø§Ù‹", "Ù‚ÙŠÙ…Ø© Ø­Ù‚ÙŠÙ‚ÙŠØ© Ù„ÙƒÙ„ Ø¯ÙŠÙ†Ø§Ø± ØªÙ†ÙÙ‚Ù‡"],
};
const DEFAULT_BENEFITS = ["Ø¬ÙˆØ¯Ø© Ù…Ø¶Ù…ÙˆÙ†Ø© 100%", "Ù…Ù†ØªØ¬ Ø£ØµÙ„ÙŠ ÙˆÙ…ÙˆØ«ÙˆÙ‚", "ØªÙˆØµÙŠÙ„ Ø³Ø±ÙŠØ¹ Ù„Ø¬Ù…ÙŠØ¹ Ù„ÙŠØ¨ÙŠØ§", "Ø¯ÙØ¹ Ù…Ø±ÙŠØ­ Ø¹Ù†Ø¯ Ø§Ù„Ø§Ø³ØªÙ„Ø§Ù…"];

function getBenefits(cat?: string | null) {
  if (!cat) return DEFAULT_BENEFITS;
  for (const [k, v] of Object.entries(CATEGORY_BENEFITS)) {
    if (cat.includes(k) || k.includes(cat)) return v;
  }
  return DEFAULT_BENEFITS;
}

/* â”€â”€ Hardcoded testimonials â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
const TESTIMONIALS = [
  {
    name: "Ø±Ø§Ù†ÙŠØ§ Ø§Ù„Ø·ÙŠØ¨",     city: "Ø¨Ù†ØºØ§Ø²ÙŠ",  avatar: "Ø±", color: "bg-rose-500",
    rating: 5,
    text: "Ø§Ø³ØªÙ„Ù…Øª Ø§Ù„Ù…Ù†ØªØ¬ ÙÙŠ ÙŠÙˆÙ…ÙŠÙ† ÙˆÙƒØ§Ù† Ø£ÙØ¶Ù„ Ù…Ù…Ø§ ØªÙˆÙ‚Ø¹Øª! Ø§Ù„Ø¬ÙˆØ¯Ø© Ù…Ù…ØªØ§Ø²Ø© Ø¬Ø¯Ø§Ù‹ ÙˆØ§Ù„ØªØºÙ„ÙŠÙ ÙƒØ§Ù† Ø±Ø§Ø¦Ø¹Ø§Ù‹. Ø³Ø£Ø·Ù„Ø¨ Ù…Ø±Ø© Ø«Ø§Ù†ÙŠØ© Ø¨ÙƒÙ„ ØªØ£ÙƒÙŠØ¯.",
  },
  {
    name: "Ø¹Ø¨Ø¯ Ø§Ù„Ù„Ù‡ Ø§Ù„Ù…Ù†ØµÙˆØ±", city: "Ø·Ø±Ø§Ø¨Ù„Ø³", avatar: "Ø¹", color: "bg-blue-600",
    rating: 5,
    text: "ÙƒÙ†Øª Ù…ØªØ±Ø¯Ø¯Ø§Ù‹ ÙÙŠ Ø§Ù„Ø¨Ø¯Ø§ÙŠØ© Ù…Ù† Ø§Ù„ØªØ³ÙˆÙ‚ Ø£ÙˆÙ†Ù„Ø§ÙŠÙ†ØŒ Ù„ÙƒÙ† Ø§Ù„Ø¯ÙØ¹ Ø¹Ù†Ø¯ Ø§Ù„Ø§Ø³ØªÙ„Ø§Ù… Ø£Ø²Ø§Ù„ ÙƒÙ„ Ù‚Ù„Ù‚ÙŠ. Ø§Ù„Ù…Ù†ØªØ¬ ÙˆØµÙ„ ÙˆØ£Ù†Ø§ Ù…Ø¨Ø³ÙˆØ· Ø¬Ø¯Ø§Ù‹. Ø´ÙƒØ±Ø§Ù‹ Ø¬ÙˆØ¯Ø© Ù…Ø§Ø±ÙƒØª!",
  },
  {
    name: "Ù†Ø³Ø±ÙŠÙ† Ø§Ù„Ø£Ù…ÙŠÙ†",    city: "Ù…ØµØ±Ø§ØªØ©", avatar: "Ù†", color: "bg-emerald-600",
    rating: 5,
    text: "Ø§Ø´ØªØ±ÙŠØª Ù„Ø£ÙˆÙ„Ø§Ø¯ÙŠ ÙˆÙ‡Ù… Ø³Ø¹Ø¯Ø§Ø¡ Ø¬Ø¯Ø§Ù‹. Ø®Ø¯Ù…Ø© Ø§Ù„ØªÙˆØµÙŠÙ„ ÙƒØ§Ù†Øª Ø³Ø±ÙŠØ¹Ø© ÙˆØ§Ù„Ù…ØªØ¬Ø± Ø£Ø¬Ø§Ø¨ Ø¹Ù„Ù‰ Ø§Ø³ØªÙØ³Ø§Ø±ÙŠ Ø¹Ù„Ù‰ Ø§Ù„ÙˆØ§ØªØ³Ø§Ø¨ Ø¨Ø¯Ù‚ÙŠÙ‚ØªÙŠÙ†. Ù…Ù…ØªØ§Ø²!",
  },
];

/* â”€â”€ FAQ â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
const FAQS = [
  { q: "ÙƒÙŠÙ ÙŠØªÙ… Ø§Ù„Ø¯ÙØ¹ØŸ",            a: "Ø§Ù„Ø¯ÙØ¹ Ø¹Ù†Ø¯ Ø§Ù„Ø§Ø³ØªÙ„Ø§Ù… ÙÙ‚Ø· â€” ØªØ³ØªÙ„Ù… Ø§Ù„Ù…Ù†ØªØ¬ ÙˆØªØ¯ÙØ¹ØŒ Ø¨Ø¯ÙˆÙ† Ø£ÙŠ Ù…Ø®Ø§Ø·Ø±Ø© Ù…Ù† Ø·Ø±ÙÙƒ." },
  { q: "ÙƒÙ… ÙŠØ³ØªØºØ±Ù‚ Ø§Ù„ØªÙˆØµÙŠÙ„ØŸ",        a: "ÙŠØµÙ„ Ø·Ù„Ø¨Ùƒ Ø®Ù„Ø§Ù„ 2â€“4 Ø£ÙŠØ§Ù… Ù„Ø¬Ù…ÙŠØ¹ Ù…Ø¯Ù† Ù„ÙŠØ¨ÙŠØ§. Ù†ÙˆØµÙ„ Ù„Ø£ÙƒØ«Ø± Ù…Ù† 18 Ù…Ø¯ÙŠÙ†Ø©." },
  { q: "Ù…Ø§Ø°Ø§ Ù„Ùˆ Ù„Ù… ÙŠØ¹Ø¬Ø¨Ù†ÙŠ Ø§Ù„Ù…Ù†ØªØ¬ØŸ",  a: "Ø±Ø¶Ø§Ùƒ Ø¶Ù…Ø§Ù†Ù†Ø§. ØªÙˆØ§ØµÙ„ Ù…Ø¹Ù†Ø§ ÙˆØ³Ù†Ø­Ù„ Ø§Ù„Ø£Ù…Ø± ÙÙˆØ±Ø§Ù‹ â€” Ø±Ø¯ ÙƒØ§Ù…Ù„ Ø£Ùˆ Ø§Ø³ØªØ¨Ø¯Ø§Ù„ Ø¨Ø¯ÙˆÙ† ØªØ¹Ù‚ÙŠØ¯." },
];

/* â”€â”€ Stars component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function Stars({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={`h-4 w-4 ${i < count ? "fill-amber-400 text-amber-400" : "fill-slate-200 text-slate-200"}`} />
      ))}
    </div>
  );
}

/* â”€â”€ FAQ Item â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-slate-200 rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-3 p-4 text-right bg-white hover:bg-slate-50 transition-colors"
      >
        <span className="font-bold text-slate-900 text-sm">{q}</span>
        <ChevronDown className={`h-4 w-4 text-slate-400 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="px-4 pb-4 text-sm text-slate-600 leading-relaxed bg-white">
          {a}
        </div>
      )}
    </div>
  );
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
export default function LandingPage() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { addToCart } = useStore();
  const { currency } = useCurrency();
  const heroRef = useRef<HTMLDivElement>(null);
  const [stickyVisible, setStickyVisible] = useState(false);

  const { data: product, isLoading } = useGetProduct(id!, {
    query: { enabled: !!id, queryKey: getGetProductQueryKey(id!) },
  });

  /* Sticky bar appears after scrolling past hero */
  useEffect(() => {
    const onScroll = () => setStickyVisible(window.scrollY > 320);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* SEO */
  useEffect(() => {
    if (product) {
      document.title = `${product.nameAr} â€” Ø¹Ø±Ø¶ Ø®Ø§Øµ | Ø¬ÙˆØ¯Ø© Ù…Ø§Ø±ÙƒØª`;
    }
    return () => { document.title = "Ø¬ÙˆØ¯Ø© Ù…Ø§Ø±ÙƒØª"; };
  }, [product]);

  const handleOrder = () => {
    if (!product) return;
    addToCart({
      id: product.id,
      name: product.nameAr,
      price: product.price,
      oldPrice: product.compareAtPrice ?? undefined,
      image: product.imageUrl ?? "",
      description: product.descriptionAr ?? "",
      category: product.categoryName ?? "",
    });
    setLocation("/checkout");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const discount = product?.compareAtPrice && product.compareAtPrice > product.price
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : null;
  const savings = product?.compareAtPrice && product.compareAtPrice > product.price
    ? (product.compareAtPrice - product.price).toFixed(0)
    : null;
  const stockLeft = product
    ? (product.id.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % 5) + 3
    : 5;
  const benefits = getBenefits(product?.categoryName);
  const imgSrc = product?.imageUrl
    ? (product.imageUrl.startsWith("http") ? product.imageUrl : `/${product.imageUrl}`)
    : null;

  /* â”€â”€ Loading â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center animate-pulse">
            <Package className="h-8 w-8 text-primary/50" />
          </div>
          <p className="text-slate-400 text-sm font-medium">Ø¬Ø§Ø±Ù ØªØ­Ù…ÙŠÙ„ Ø§Ù„Ø¹Ø±Ø¶â€¦</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-center px-4">
        <div>
          <div className="text-5xl mb-4">ðŸ”</div>
          <h1 className="text-2xl font-extrabold text-slate-900 mb-2">Ø§Ù„Ø¹Ø±Ø¶ ØºÙŠØ± Ù…ÙˆØ¬ÙˆØ¯</h1>
          <p className="text-slate-500 mb-6">Ù„Ù… Ù†ØªÙ…ÙƒÙ† Ù…Ù† Ø¥ÙŠØ¬Ø§Ø¯ Ù‡Ø°Ø§ Ø§Ù„Ø¹Ø±Ø¶.</p>
          <a href="/products" className="inline-flex items-center gap-2 bg-primary text-white font-bold px-6 py-3 rounded-xl">
            ØªØµÙØ­ Ø§Ù„Ù…Ù†ØªØ¬Ø§Øª
          </a>
        </div>
      </div>
    );
  }

  /* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
  return (
    <>
      <div className="bg-slate-50 pb-28">

        {/* â”€â”€ TOP BRAND BAR â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <div className="bg-white border-b border-slate-100 px-4 py-3 flex items-center justify-between sticky top-0 z-40 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center">
              <Package className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="font-extrabold text-slate-900 text-sm">
              Ù…ØªØ¬Ø± <span className="text-primary">Ù„ÙŠØ¨ÙŠØ§</span>
            </span>
          </div>
          <button
            onClick={handleOrder}
            className="bg-primary text-white font-black text-sm px-4 py-2 rounded-full shadow hover:bg-blue-700 transition-colors touch-manipulation"
          >
            Ø§Ø·Ù„Ø¨ Ø§Ù„Ø¢Ù† â†
          </button>
        </div>

        {/* â”€â”€ URGENCY STRIP â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <div className="bg-rose-600 text-white text-center py-2 px-4 text-xs md:text-sm font-bold animate-pulse">
          âš¡ Ø¹Ø±Ø¶ Ù…Ø­Ø¯ÙˆØ¯ â€” ØªØ¨Ù‚Ù‘Øª {stockLeft} Ù‚Ø·Ø¹ ÙÙ‚Ø·! Ø§Ø·Ù„Ø¨ Ø§Ù„Ø¢Ù† Ù‚Ø¨Ù„ Ù†ÙØ§Ø¯ Ø§Ù„ÙƒÙ…ÙŠØ©
        </div>

        {/* â”€â”€ HERO â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <div ref={heroRef} className="bg-white">
          <div className="container mx-auto px-4 py-8 md:py-12 max-w-2xl">

            {/* Category badge */}
            {product.categoryName && (
              <div className="flex justify-center mb-4">
                <span className="bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full">
                  {product.categoryName}
                </span>
              </div>
            )}

            {/* Hook headline */}
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-slate-900 text-center leading-snug mb-2">
              {product.nameAr}
            </h1>
            {product.descriptionAr && (
              <p className="text-center text-slate-500 text-sm md:text-base leading-relaxed max-w-lg mx-auto mb-6">
                {product.descriptionAr}
              </p>
            )}

            {/* Rating row */}
            <div className="flex items-center justify-center gap-2 mb-6">
              <Stars count={5} />
              <span className="text-sm font-bold text-slate-700">4.9</span>
              <span className="text-xs text-slate-400">(+2,300 Ø¹Ù…ÙŠÙ„ Ø±Ø§Ø¶Ù)</span>
            </div>

            {/* Product image */}
            <div className="relative mx-auto mb-6 max-w-sm">
              {discount && (
                <span className="absolute top-3 right-3 z-10 bg-rose-500 text-white text-sm font-black px-3 py-1 rounded-full shadow-lg">
                  Ø®ØµÙ… {discount}%
                </span>
              )}
              <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-3xl p-6 aspect-square flex items-center justify-center shadow-inner">
                {imgSrc ? (
                  <img
                    src={imgSrc}
                    alt={product.nameAr}
                    className="object-contain w-full h-full max-h-72 drop-shadow-xl"
                  />
                ) : (
                  <div className="text-8xl font-black text-slate-300 select-none">
                    {product.nameAr.substring(0, 2)}
                  </div>
                )}
              </div>
            </div>

            {/* Flash timer */}
            <div className="mb-4">
              <FlashSaleTimer productId={product.id} />
            </div>

            {/* Price */}
            <div className="bg-gradient-to-l from-primary/5 to-blue-50 rounded-2xl p-4 border border-primary/10 mb-5">
              <div className="flex items-end justify-center gap-2 flex-wrap">
                <span className="text-4xl font-black text-primary">{product.price}</span>
                <span className="text-xl font-bold text-primary/80 mb-1">{currency}</span>
                {product.compareAtPrice && product.compareAtPrice > product.price && (
                  <span className="text-base text-slate-400 line-through mb-1">{product.compareAtPrice} {currency}</span>
                )}
              </div>
              {savings && (
                <p className="text-center text-emerald-700 font-black text-sm mt-1">
                  ðŸ’° ÙˆÙÙ‘Ø± {savings} {currency} â€” Ø¨Ø¯Ù„Ø§Ù‹ Ù…Ù† {product.compareAtPrice} {currency}
                </p>
              )}
            </div>

            {/* Hero CTA */}
            <button
              onClick={handleOrder}
              className="w-full bg-primary hover:bg-blue-700 text-white font-black text-xl py-5 rounded-2xl shadow-xl shadow-primary/30 transition-all active:scale-[0.98] touch-manipulation mb-3"
            >
              ðŸ›’ Ø§Ø·Ù„Ø¨ Ø§Ù„Ø¢Ù† â€” Ø§Ù„Ø¯ÙØ¹ Ø¹Ù†Ø¯ Ø§Ù„Ø§Ø³ØªÙ„Ø§Ù…
            </button>

            {/* Micro trust */}
            <div className="flex items-center justify-center gap-4 text-xs text-slate-400 font-medium">
              <span className="flex items-center gap-1"><Banknote className="h-3.5 w-3.5 text-emerald-500" /> Ø¯ÙØ¹ Ø¹Ù†Ø¯ Ø§Ù„Ø§Ø³ØªÙ„Ø§Ù…</span>
              <span className="flex items-center gap-1"><Truck className="h-3.5 w-3.5 text-blue-500" /> ØªÙˆØµÙŠÙ„ Ø³Ø±ÙŠØ¹</span>
              <span className="flex items-center gap-1"><Shield className="h-3.5 w-3.5 text-purple-500" /> Ø¶Ù…Ø§Ù† Ø§Ù„Ø¬ÙˆØ¯Ø©</span>
            </div>
          </div>
        </div>

        {/* â”€â”€ VIDEO / GIF PLACEHOLDER â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <div className="rounded-3xl overflow-hidden bg-slate-800 aspect-video flex flex-col items-center justify-center gap-3 shadow-xl relative">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-700 to-slate-900" />
            <div className="relative z-10 flex flex-col items-center gap-3">
              <div className="w-16 h-16 rounded-full bg-white/20 border-2 border-white/40 flex items-center justify-center backdrop-blur-sm">
                <Play className="h-7 w-7 text-white fill-white mr-[-3px]" />
              </div>
              <p className="text-white font-bold text-base">Ø´Ø§Ù‡Ø¯ Ø§Ù„Ù…Ù†ØªØ¬ ÙˆÙ‡Ùˆ ÙŠØ¹Ù…Ù„</p>
              <p className="text-white/60 text-xs">Ø£Ø¶Ù Ø±Ø§Ø¨Ø· Ø§Ù„ÙÙŠØ¯ÙŠÙˆ Ø£Ùˆ GIF Ù‡Ù†Ø§</p>
            </div>
            <div className="absolute bottom-3 right-3 bg-black/50 text-white text-[10px] font-bold px-2 py-0.5 rounded">
              VIDEO / GIF PLACEHOLDER
            </div>
          </div>
        </div>

        {/* â”€â”€ BENEFITS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <div className="bg-white py-10">
          <div className="container mx-auto px-4 max-w-2xl">
            <div className="text-center mb-7">
              <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">Ù„Ù…Ø§Ø°Ø§ ÙŠØ®ØªØ§Ø±Ù‡ Ø§Ù„Ø¢Ù„Ø§ÙØŸ</span>
              <h2 className="text-2xl font-extrabold text-slate-900 mt-3">Ø§Ù„Ù…Ù…ÙŠØ²Ø§Øª Ø§Ù„ØªÙŠ Ø³ØªØºÙŠÙ‘Ø± ÙŠÙˆÙ…Ùƒ</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {benefits.map((b, i) => (
                <div key={i} className="flex items-start gap-3 bg-slate-50 border border-slate-100 rounded-2xl p-4">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                  <span className="text-sm font-semibold text-slate-800 leading-snug">{b}</span>
                </div>
              ))}
            </div>

            {/* Mid-page CTA */}
            <button
              onClick={handleOrder}
              className="w-full mt-8 bg-slate-900 hover:bg-primary text-white font-black text-lg py-4 rounded-2xl shadow-lg transition-all active:scale-[0.98] touch-manipulation"
            >
              Ø§Ø·Ù„Ø¨ Ø§Ù„Ø¢Ù† ÙˆØ§Ø³ØªÙØ¯ Ù…Ù† Ø§Ù„Ø¹Ø±Ø¶ â†
            </button>
          </div>
        </div>

        {/* â”€â”€ STATS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <div className="bg-primary py-10 text-white">
          <div className="container mx-auto px-4 max-w-2xl">
            <div className="grid grid-cols-3 gap-4 text-center">
              {[
                { value: "5000+", label: "Ø¹Ù…ÙŠÙ„ Ø³Ø¹ÙŠØ¯" },
                { value: "18+",   label: "Ù…Ø¯ÙŠÙ†Ø© Ù„ÙŠØ¨ÙŠØ©" },
                { value: "4.9",   label: "ØªÙ‚ÙŠÙŠÙ… Ù…Ù† 5" },
              ].map((s) => (
                <div key={s.label}>
                  <div className="text-3xl font-extrabold">{s.value}</div>
                  <div className="text-blue-200 text-xs mt-1">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* â”€â”€ TESTIMONIALS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <div className="bg-white py-10">
          <div className="container mx-auto px-4 max-w-2xl">
            <div className="text-center mb-7">
              <span className="text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-100">
                â­ Ø¢Ø±Ø§Ø¡ Ø§Ù„Ø¹Ù…Ù„Ø§Ø¡ Ø§Ù„Ø­Ù‚ÙŠÙ‚ÙŠØ©
              </span>
              <h2 className="text-2xl font-extrabold text-slate-900 mt-3">Ù…Ø§Ø°Ø§ ÙŠÙ‚ÙˆÙ„ÙˆÙ† Ø¹Ù† Ø§Ù„Ù…Ù†ØªØ¬ØŸ</h2>
            </div>
            <div className="flex flex-col gap-4">
              {TESTIMONIALS.map((t) => (
                <div key={t.name} className="bg-slate-50 border border-slate-100 rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full ${t.color} text-white font-bold flex items-center justify-center text-sm shrink-0`}>
                        {t.avatar}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-sm">{t.name}</p>
                        <p className="text-xs text-slate-400">{t.city}</p>
                      </div>
                    </div>
                    <span className="text-xs text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                      Ù…Ø´ØªØ±Ù Ù…ÙˆØ«Ù‘Ù‚ âœ“
                    </span>
                  </div>
                  <Stars count={t.rating} />
                  <p className="mt-2 text-sm text-slate-700 leading-relaxed">"{t.text}"</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* â”€â”€ FINAL PRICING + CTA â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <div className="bg-gradient-to-br from-slate-900 to-blue-950 py-12 text-white">
          <div className="container mx-auto px-4 max-w-2xl text-center">
            <p className="text-blue-300 text-sm font-bold mb-2">âš¡ Ù„Ø§ ØªÙÙˆÙ‘Øª Ù‡Ø°Ø§ Ø§Ù„Ø¹Ø±Ø¶</p>
            <h2 className="text-2xl md:text-3xl font-extrabold mb-6">{product.nameAr}</h2>

            {/* Stock + timer */}
            <div className="bg-white/10 border border-white/20 rounded-2xl p-4 mb-6 backdrop-blur-sm">
              <div className="flex flex-col gap-2">
                <FlashSaleTimer productId={product.id} />
                <p className="text-rose-300 font-bold text-sm">ðŸ”¥ ØªØ¨Ù‚Ù‘Øª {stockLeft} Ù‚Ø·Ø¹ ÙÙ‚Ø· ÙÙŠ Ø§Ù„Ù…Ø®Ø²Ù†</p>
              </div>
            </div>

            {/* Price */}
            <div className="flex items-end justify-center gap-2 mb-2 flex-wrap">
              <span className="text-5xl font-black">{product.price}</span>
              <span className="text-2xl font-bold text-blue-300 mb-1">{currency}</span>
              {product.compareAtPrice && product.compareAtPrice > product.price && (
                <span className="text-xl text-slate-400 line-through mb-1">{product.compareAtPrice} {currency}</span>
              )}
            </div>
            {savings && (
              <p className="text-emerald-400 font-bold text-sm mb-6">âœ… ØªÙˆÙÙŠØ± {savings} {currency} Ø¹Ù† Ø§Ù„Ø³Ø¹Ø± Ø§Ù„Ø£ØµÙ„ÙŠ</p>
            )}

            <button
              onClick={handleOrder}
              className="w-full bg-primary hover:bg-blue-500 text-white font-black text-xl py-5 rounded-2xl shadow-2xl transition-all active:scale-[0.98] touch-manipulation"
            >
              ðŸ›’ Ø§Ø·Ù„Ø¨ Ø§Ù„Ø¢Ù† â€” Ø§Ù„Ø¯ÙØ¹ Ø¹Ù†Ø¯ Ø§Ù„Ø§Ø³ØªÙ„Ø§Ù…
            </button>
            <p className="text-slate-400 text-xs mt-3">Ù„Ø§ Ø­Ø§Ø¬Ø© Ù„Ø¨Ø·Ø§Ù‚Ø© Ø¨Ù†ÙƒÙŠØ© Â· ØªÙˆØµÙŠÙ„ Ù„Ø¬Ù…ÙŠØ¹ Ù…Ø¯Ù† Ù„ÙŠØ¨ÙŠØ§</p>
          </div>
        </div>

        {/* â”€â”€ FAQ â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <div className="bg-white py-10">
          <div className="container mx-auto px-4 max-w-2xl">
            <h2 className="text-xl font-extrabold text-slate-900 text-center mb-6">Ø£Ø³Ø¦Ù„Ø© Ø´Ø§Ø¦Ø¹Ø©</h2>
            <div className="flex flex-col gap-3">
              {FAQS.map((f) => <FaqItem key={f.q} q={f.q} a={f.a} />)}
            </div>
          </div>
        </div>

        {/* â”€â”€ FOOTER â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <div className="bg-slate-900 text-center py-6 px-4">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-6 h-6 bg-primary rounded-md flex items-center justify-center">
              <Package className="h-3 w-3 text-white" />
            </div>
            <span className="text-white font-extrabold text-sm">Ø¬ÙˆØ¯Ø© Ù…Ø§Ø±ÙƒØª</span>
          </div>
          <p className="text-slate-400 text-xs">Â© {new Date().getFullYear()} Ø¬ÙˆØ¯Ø© Ù…Ø§Ø±ÙƒØª Â· Ø¯ÙØ¹ Ø¹Ù†Ø¯ Ø§Ù„Ø§Ø³ØªÙ„Ø§Ù… Â· ØªÙˆØµÙŠÙ„ Ù„Ø¬Ù…ÙŠØ¹ Ù…Ø¯Ù† Ù„ÙŠØ¨ÙŠØ§</p>
        </div>
      </div>

      {/* â”€â”€ STICKY BOTTOM BAR â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 shadow-[0_-6px_24px_rgba(0,0,0,0.14)] transition-transform duration-300 ease-out ${
          stickyVisible ? "translate-y-0" : "translate-y-full"
        }`}
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
        aria-hidden={!stickyVisible}
      >
        <div className="container mx-auto max-w-2xl px-4 py-3 flex items-center gap-3">
          {/* Thumbnail */}
          {imgSrc && (
            <div className="w-10 h-10 rounded-xl overflow-hidden border border-slate-100 shrink-0 bg-slate-50">
              <img src={imgSrc} alt={product.nameAr} className="w-full h-full object-cover" />
            </div>
          )}
          {/* Price */}
          <div className="flex-1 min-w-0">
            <p className="text-xs text-slate-500 truncate">{product.nameAr}</p>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-black text-primary">{product.price}</span>
              <span className="text-xs font-bold text-primary/80">{currency}</span>
              {discount && <span className="text-[10px] text-rose-500 font-bold mr-1">Ø®ØµÙ… {discount}%</span>}
            </div>
          </div>
          {/* CTA */}
          <button
            onClick={handleOrder}
            className="shrink-0 bg-primary text-white font-black text-sm px-5 py-3 rounded-xl shadow-lg hover:bg-blue-700 transition-colors touch-manipulation active:scale-95"
          >
            Ø§Ø·Ù„Ø¨ Ø§Ù„Ø¢Ù† â†
          </button>
        </div>
      </div>

      {/* Social proof popup â€” sits above sticky bar */}
      <SocialProofPopup />
    </>
  );
}

