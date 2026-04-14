import { useState, useEffect, useRef } from "react";
import { CheckCircle2 } from "lucide-react";

const BUYERS = [
  { name: "محمد الطيب", city: "طرابلس",   ago: "منذ 3 دقائق" },
  { name: "فاطمة العمراني", city: "بنغازي",  ago: "منذ 7 دقائق" },
  { name: "عبد الله المنصوري", city: "مصراتة", ago: "منذ 12 دقيقة" },
  { name: "أسماء الزهراء", city: "الزاوية", ago: "منذ 18 دقيقة" },
  { name: "خالد الغرياني", city: "سرت",     ago: "منذ 24 دقيقة" },
];

const SHOW_DURATION  = 4_000;   // ms the popup is visible
const FIRST_DELAY   = 8_000;   // ms before first popup
const CYCLE_INTERVAL = 17_000;  // ms between popups

export function SocialProofPopup() {
  const [visible, setVisible] = useState(false);
  const [index, setIndex]     = useState(0);
  const cycleRef = useRef(0);

  useEffect(() => {
    // First popup after FIRST_DELAY
    const first = setTimeout(() => {
      setIndex(0);
      setVisible(true);
      const hide = setTimeout(() => setVisible(false), SHOW_DURATION);

      // Recurring popups
      const cycle = setInterval(() => {
        cycleRef.current = (cycleRef.current + 1) % BUYERS.length;
        setIndex(cycleRef.current);
        setVisible(true);
        setTimeout(() => setVisible(false), SHOW_DURATION);
      }, CYCLE_INTERVAL);

      return () => { clearTimeout(hide); clearInterval(cycle); };
    }, FIRST_DELAY);

    return () => clearTimeout(first);
  }, []);

  const buyer = BUYERS[index];

  return (
    <div
      aria-live="polite"
      className={`
        fixed left-4 z-50 max-w-[280px] w-[calc(100vw-32px)] sm:max-w-xs
        transition-all duration-500 ease-out
        ${visible
          ? "opacity-100 translate-y-0 pointer-events-auto"
          : "opacity-0 translate-y-4 pointer-events-none"}
      `}
      /* Above sticky bar on mobile (≈72px), above viewport edge on desktop */
      style={{ bottom: "calc(80px + env(safe-area-inset-bottom, 0px))" }}
    >
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xl px-4 py-3 flex items-start gap-3">
        {/* Avatar */}
        <div className="w-9 h-9 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
          {buyer.name.charAt(0)}
        </div>

        {/* Text */}
        <div className="min-w-0">
          <p className="text-[13px] font-bold text-slate-900 leading-snug">
            اشترى <span className="text-primary">{buyer.name}</span> من {buyer.city} هذا المنتج
          </p>
          <div className="flex items-center gap-1 mt-0.5">
            <CheckCircle2 className="h-3 w-3 text-emerald-500 shrink-0" />
            <span className="text-[11px] text-slate-400">{buyer.ago}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
