const MIN_SEGMENT_CHARS = 1200;
const MIN_REPEATS = 12;

export function buildAnnouncementSegment(text: string): string {
  const normalized = text.trim();
  if (!normalized) return "";

  const repeatCount = Math.max(
    MIN_REPEATS,
    Math.ceil(MIN_SEGMENT_CHARS / Math.max(normalized.length, 1)),
  );

  return `${Array(repeatCount).fill(normalized).join("   ·   ")}   ·   `;
}

export function getAnnouncementDuration(text: string): number {
  const normalizedLength = Math.max(text.trim().length, 1);
  return Math.max(20, Math.min(90, normalizedLength * 0.55));
}
