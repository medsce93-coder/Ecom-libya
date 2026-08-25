export function resolveProductImageUrl(image: string | null | undefined) {
  const value = String(image ?? "").trim();
  if (!value) return "";
  return value.startsWith("http") || value.startsWith("/") ? value : `/${value}`;
}
