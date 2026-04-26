import { useBranding } from "@/lib/branding-context";

export function AnnouncementBar() {
  const {
    announcementActive,
    announcementText,
    announcementBgColor,
    announcementTextColor,
  } = useBranding();

  if (!announcementActive || !announcementText.trim()) return null;

  const repeatCount = Math.max(8, Math.ceil(240 / Math.max(announcementText.length, 1)));
  const repeatedChunk = `${Array(repeatCount).fill(announcementText).join("   ·   ")}   ·   `;
  const duration = Math.max(18, announcementText.length * 0.42);

  return (
    <div
      className="w-full overflow-hidden text-sm font-semibold select-none"
      style={{
        backgroundColor: announcementBgColor,
        color: announcementTextColor,
        minHeight: "36px",
      }}
      aria-label="شريط الإعلانات"
    >
      <div className="flex items-center" style={{ height: "36px" }}>
        <div className="announcement-track" style={{ animationDuration: `${duration}s` }}>
          <span className="announcement-segment">{repeatedChunk}</span>
          <span className="announcement-segment" aria-hidden="true">{repeatedChunk}</span>
        </div>
      </div>
    </div>
  );
}
