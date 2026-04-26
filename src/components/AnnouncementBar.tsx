import { useBranding } from "@/lib/branding-context";
import { buildAnnouncementSegment, getAnnouncementDuration } from "@/lib/announcement-marquee";

export function AnnouncementBar() {
  const {
    announcementActive,
    announcementText,
    announcementBgColor,
    announcementTextColor,
  } = useBranding();

  if (!announcementActive || !announcementText.trim()) return null;

  const repeatedChunk = buildAnnouncementSegment(announcementText);
  const duration = getAnnouncementDuration(announcementText);

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
