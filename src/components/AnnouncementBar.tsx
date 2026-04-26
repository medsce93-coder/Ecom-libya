import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { useBranding } from "@/lib/branding-context";

const GROUP_WIDTH_RATIO = 1.5;
const MIN_REPEAT_COUNT = 2;
const MIN_DURATION_SECONDS = 22;
const MAX_DURATION_SECONDS = 30;
const PIXELS_PER_SECOND = 72;

type MarqueeStyle = CSSProperties & {
  "--marquee-distance": string;
};

type AnnouncementTickerProps = {
  text: string;
  backgroundColor: string;
  color: string;
  className?: string;
  height?: number;
};

export function AnnouncementTicker({
  text,
  backgroundColor,
  color,
  className = "text-sm",
  height = 36,
}: AnnouncementTickerProps) {
  const cleanText = text.trim();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const itemRef = useRef<HTMLSpanElement | null>(null);
  const groupRef = useRef<HTMLDivElement | null>(null);
  const [repeatCount, setRepeatCount] = useState(MIN_REPEAT_COUNT);
  const [groupWidth, setGroupWidth] = useState(0);

  const measureRepeats = useCallback(() => {
    const containerWidth = containerRef.current?.getBoundingClientRect().width ?? 0;
    const itemWidth = itemRef.current?.getBoundingClientRect().width ?? 0;
    if (!containerWidth || !itemWidth) return;

    const neededWidth = containerWidth * GROUP_WIDTH_RATIO;
    const nextRepeatCount = Math.max(
      MIN_REPEAT_COUNT,
      Math.ceil(neededWidth / itemWidth),
    );
    setRepeatCount((current) =>
      current === nextRepeatCount ? current : nextRepeatCount,
    );
  }, [cleanText]);

  useLayoutEffect(() => {
    measureRepeats();
  }, [measureRepeats]);

  useEffect(() => {
    const container = containerRef.current;
    const item = itemRef.current;
    if (!container || !item) return;

    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", measureRepeats);
      return () => window.removeEventListener("resize", measureRepeats);
    }

    const observer = new ResizeObserver(measureRepeats);
    observer.observe(container);
    observer.observe(item);
    return () => observer.disconnect();
  }, [measureRepeats]);

  useLayoutEffect(() => {
    const measureGroup = () => {
      const width = groupRef.current?.getBoundingClientRect().width ?? 0;
      setGroupWidth(width);
    };

    measureGroup();
    const group = groupRef.current;
    if (!group || typeof ResizeObserver === "undefined") return;

    const observer = new ResizeObserver(measureGroup);
    observer.observe(group);
    return () => observer.disconnect();
  }, [cleanText, repeatCount]);

  if (!cleanText) return null;

  const items = Array.from({ length: repeatCount });
  const distance = Math.max(groupWidth, 1);
  const duration = Math.min(
    MAX_DURATION_SECONDS,
    Math.max(MIN_DURATION_SECONDS, distance / PIXELS_PER_SECOND),
  );
  const trackStyle: MarqueeStyle = {
    "--marquee-distance": `${distance}px`,
    animationDuration: `${duration}s`,
  };

  return (
    <div
      ref={containerRef}
      className={`w-full overflow-hidden font-semibold select-none ${className}`}
      style={{
        backgroundColor,
        color,
        minHeight: `${height}px`,
      }}
      aria-label={cleanText}
    >
      <div className="flex items-center" style={{ height: `${height}px` }}>
        <div className="announcement-track" style={trackStyle} aria-hidden="true">
          {[0, 1].map((group) => (
            <div
              className="announcement-group"
              ref={group === 0 ? groupRef : undefined}
              key={group}
            >
              {items.map((_, index) => (
                <span
                  className="announcement-item"
                  dir="rtl"
                  ref={group === 0 && index === 0 ? itemRef : undefined}
                  key={index}
                >
                  {cleanText}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function AnnouncementBar() {
  const {
    announcementActive,
    announcementText,
    announcementBgColor,
    announcementTextColor,
  } = useBranding();

  if (!announcementActive || !announcementText.trim()) return null;

  return (
    <AnnouncementTicker
      text={announcementText}
      backgroundColor={announcementBgColor}
      color={announcementTextColor}
      className="text-sm"
      height={36}
    />
  );
}
