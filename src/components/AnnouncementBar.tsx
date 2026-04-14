import { useBranding } from "@/lib/branding-context";

export function AnnouncementBar() {
  const { announcementActive, announcementText } = useBranding();

  if (!announcementActive || !announcementText.trim()) return null;

  const repeated = Array(6).fill(announcementText).join("   ·   ");

  return (
    <div
      className="w-full overflow-hidden text-white text-sm font-semibold select-none"
      style={{ backgroundColor: "var(--color-primary)", minHeight: "36px" }}
      aria-label="شريط الإعلانات"
    >
      <div className="flex items-center" style={{ height: "36px" }}>
        <div
          className="announcement-track whitespace-nowrap"
          style={{ animationDuration: `${Math.max(18, announcementText.length * 0.35)}s` }}
        >
          <span className="px-8">{repeated}</span>
          <span className="px-8" aria-hidden="true">{repeated}</span>
        </div>
      </div>
    </div>
  );
}
