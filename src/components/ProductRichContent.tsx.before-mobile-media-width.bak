import DOMPurify from "dompurify";

type ProductRichContentProps = {
  value: string | null | undefined;
};

function hasRichMarkup(value: string) {
  return /<\s*(p|h[1-6]|ul|ol|li|a|img|video|table|blockquote|strong|em|u|s|span|div|br)\b/i.test(
    value,
  );
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function sanitizeRichContent(value: string) {
  return DOMPurify.sanitize(value, {
    USE_PROFILES: { html: true },
    ADD_TAGS: ["video"],
    ADD_ATTR: ["controls", "preload", "poster"],
  });
}

export function ProductRichContent({
  value,
}: ProductRichContentProps) {
  const content = typeof value === "string" ? value.trim() : "";

  if (!content) {
    return null;
  }

  if (!hasRichMarkup(content)) {
    const paragraphs = content
      .split(/\r?\n\s*\r?\n/)
      .map((paragraph) => paragraph.trim())
      .filter(Boolean);

    return (
      <div
        dir="rtl"
        className="space-y-3 text-sm leading-8 text-slate-600"
      >
        {paragraphs.map((paragraph, index) => (
          <p key={index}>
            {paragraph.split(/\r?\n/).map((line, lineIndex) => (
              <span key={lineIndex}>
                {line}
                {lineIndex < paragraph.split(/\r?\n/).length - 1 ? (
                  <br />
                ) : null}
              </span>
            ))}
          </p>
        ))}
      </div>
    );
  }

  const safeHtml = sanitizeRichContent(content);

  return (
    <div className="overflow-hidden" dir="rtl">
      <div
        className={[
          "product-rich-content",
          "max-w-none text-right text-[15px] leading-8 text-slate-700",
          "[&_h1]:mb-4 [&_h1]:text-3xl [&_h1]:font-black [&_h1]:leading-tight [&_h1]:text-slate-900",
          "[&_h2]:mb-3 [&_h2]:mt-6 [&_h2]:text-2xl [&_h2]:font-black [&_h2]:leading-tight [&_h2]:text-slate-900",
          "[&_h3]:mb-2 [&_h3]:mt-5 [&_h3]:text-xl [&_h3]:font-extrabold [&_h3]:text-slate-900",
          "[&_p]:my-2",
          "[&_strong]:font-black [&_em]:italic [&_u]:underline [&_s]:line-through",
          "[&_ul]:my-3 [&_ul]:list-disc [&_ul]:pr-7",
          "[&_ol]:my-3 [&_ol]:list-decimal [&_ol]:pr-7",
          "[&_li]:my-1",
          "[&_a]:font-semibold [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2",
          "[&_img]:mx-auto [&_img]:my-5 [&_img]:block [&_img]:h-auto [&_img]:max-w-full [&_img]:rounded-2xl [&_img]:shadow-sm",
          "[&_video]:mx-auto [&_video]:my-5 [&_video]:block [&_video]:h-auto [&_video]:w-full [&_video]:max-w-3xl [&_video]:rounded-2xl [&_video]:bg-slate-950",
          "[&_table]:my-5 [&_table]:w-full [&_table]:border-collapse",
          "[&_th]:border [&_th]:border-slate-200 [&_th]:bg-slate-50 [&_th]:px-3 [&_th]:py-2 [&_th]:font-black [&_th]:text-slate-800",
          "[&_td]:border [&_td]:border-slate-200 [&_td]:px-3 [&_td]:py-2",
          "[&_blockquote]:my-4 [&_blockquote]:border-r-4 [&_blockquote]:border-primary [&_blockquote]:bg-primary/5 [&_blockquote]:px-4 [&_blockquote]:py-3 [&_blockquote]:text-slate-700",
        ].join(" ")}
        dangerouslySetInnerHTML={{
          __html: safeHtml,
        }}
      />
    </div>
  );
}
