import { useBranding } from "@/lib/branding-context";

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
  if (!cleanText) return null;

  return (
    <div
      className={`w-full overflow-hidden font-semibold select-none ${className}`}
      style={{
        backgroundColor,
        color,
        minHeight: `${height}px`,
      }}
      aria-label={cleanText}
    >
      <div className="flex items-center" style={{ height: `${height}px` }}>
        <div className="announcement-track" aria-hidden="true">
          <div className="announcement-copy">
            <span className="announcement-item" dir="rtl">
              {cleanText}
            </span>
          </div>
          <div className="announcement-copy">
            <span className="announcement-item" dir="rtl">
              {cleanText}
            </span>
          </div>
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
