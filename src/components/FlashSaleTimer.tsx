import { useState, useEffect, useRef } from "react";
import { Timer } from "lucide-react";

/** Returns a stable start-seconds value seeded by product id so the timer
 *  doesn't reset on re-render but is unique per product. */
function seedSeconds(productId: string): number {
  let hash = 0;
  for (let i = 0; i < productId.length; i++) {
    hash = (hash * 31 + productId.charCodeAt(i)) & 0xffff;
  }
  // Range: 11 min (660s) – 28 min (1680s)
  return 660 + (hash % 1021);
}

interface Props { productId: string }

export function FlashSaleTimer({ productId }: Props) {
  const initialRef = useRef(seedSeconds(productId));
  const [secs, setSecs] = useState(initialRef.current);

  useEffect(() => {
    const id = setInterval(() => {
      setSecs((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const mm = String(Math.floor(secs / 60)).padStart(2, "0");
  const ss = String(secs % 60).padStart(2, "0");
  const urgent = secs < 300; // under 5 min → extra-urgent style

  if (secs === 0) return null;

  return (
    <div
      className={`flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-sm font-bold transition-colors ${
        urgent
          ? "bg-rose-600 text-white animate-pulse"
          : "bg-amber-50 border border-amber-200 text-amber-800"
      }`}
    >
      <Timer className={`h-4 w-4 shrink-0 ${urgent ? "text-white" : "text-amber-500"}`} />
      <span>⏳ ينتهي هذا العرض الخاص خلال:</span>
      <span
        className={`font-black text-base tabular-nums ${urgent ? "text-white" : "text-rose-600"}`}
        dir="ltr"
      >
        {mm}:{ss}
      </span>
    </div>
  );
}
