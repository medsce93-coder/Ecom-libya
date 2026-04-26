import { useBranding } from "@/lib/branding-context";

const MARQUEE_ITEM_COUNT = 8;
const MARQUEE_DURATION_SECONDS = 30;

export function AnnouncementBar() {
  const {
    announcementActive,
    announcementText,
    announcementBgColor,
    announcementTextColor,
  } = useBranding();

  if (!announcementActive || !announcementText.trim()) return null;

  const text = announcementText.trim();
  const items = Array.from({ length: MARQUEE_ITEM_COUNT });

  return (
    <div
      className="w-full overflow-hidden text-sm font-semibold select-none"
      style={{
        backgroundColor: announcementBgColor,
        color: announcementTextColor,
        minHeight: "36px",
      }}
      aria-label={text}
    >
      <div className="flex items-center" style={{ height: "36px" }}>
        <div
          className="announcement-track"
          style={{ animationDuration: `${MARQUEE_DURATION_SECONDS}s` }}
          aria-hidden="true"
        >
          {[0, 1].map((group) => (
            <div className="announcement-group" key={group}>
              {items.map((_, index) => (
                <span className="announcement-item" dir="rtl" key={index}>
                  {text}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
