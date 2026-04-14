import type { VercelRequest, VercelResponse } from "@vercel/node";

export function setCommonHeaders(res: VercelResponse) {
  res.setHeader("Cache-Control", "no-store");
}

export function sendJson(
  res: VercelResponse,
  status: number,
  payload: unknown,
) {
  setCommonHeaders(res);
  return res.status(status).json(payload);
}

export function parseIntParam(
  value: string | string[] | undefined,
  fallback: number,
) {
  if (typeof value !== "string") return fallback;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function parseBoolParam(
  value: string | string[] | undefined,
  fallback = false,
) {
  if (typeof value !== "string") return fallback;
  return value.toLowerCase() === "true";
}

export function getRouteParam(
  req: VercelRequest,
  key: string,
): string | null {
  const value = req.query[key];
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

export function methodNotAllowed(
  res: VercelResponse,
  allowed: string[],
) {
  res.setHeader("Allow", allowed.join(", "));
  return sendJson(res, 405, {
    error: "method_not_allowed",
    message: "Method not allowed",
  });
}
