import type { VercelRequest, VercelResponse } from "@vercel/node";
import { requireAdmin } from "./_lib/auth";
import { methodNotAllowed, sendJson } from "./_lib/http";
import {
  DEFAULT_SETTINGS,
  KEY_MAP,
  readSettings,
  upsertSetting,
} from "./_lib/settings";

async function getSettings(res: VercelResponse) {
  try {
    const settings = await readSettings();
    return sendJson(res, 200, settings);
  } catch (error) {
    return sendJson(res, 200, DEFAULT_SETTINGS);
  }
}

async function updateSettings(req: VercelRequest, res: VercelResponse) {
  const admin = await requireAdmin(req, res);
  if (!admin) return;

  try {
    const body = req.body ?? {};
    const currencySymbol = String(body.currencySymbol ?? "").trim();
    if (!currencySymbol) {
      return sendJson(res, 400, {
        error: "bad_request",
        message: "currencySymbol is required",
      });
    }

    const primaryColorRaw = String(body.primaryColor ?? "").trim();
    const primaryColor = /^#[0-9a-fA-F]{3,8}$/.test(primaryColorRaw)
      ? primaryColorRaw
      : DEFAULT_SETTINGS.primaryColor;

    const next = {
      currencySymbol,
      facebookPixelId: String(body.facebookPixelId ?? "").trim(),
      tiktokPixelId: String(body.tiktokPixelId ?? "").trim(),
      logoUrl: String(body.logoUrl ?? "").trim(),
      primaryColor,
      announcementText: String(
        body.announcementText ?? DEFAULT_SETTINGS.announcementText,
      ).trim(),
      announcementActive: body.announcementActive === false ? "false" : "true",
    };

    await Promise.all([
      upsertSetting(KEY_MAP.currencySymbol, next.currencySymbol),
      upsertSetting(KEY_MAP.facebookPixelId, next.facebookPixelId),
      upsertSetting(KEY_MAP.tiktokPixelId, next.tiktokPixelId),
      upsertSetting(KEY_MAP.logoUrl, next.logoUrl),
      upsertSetting(KEY_MAP.primaryColor, next.primaryColor),
      upsertSetting(KEY_MAP.announcementText, next.announcementText),
      upsertSetting(KEY_MAP.announcementActive, next.announcementActive),
    ]);

    return sendJson(res, 200, {
      ...next,
      announcementActive: next.announcementActive === "true",
    });
  } catch (error) {
    return sendJson(res, 500, {
      error: "internal_error",
      message: "Failed to save settings",
    });
  }
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  if (req.method === "GET") return getSettings(res);
  if (req.method === "PUT") return updateSettings(req, res);
  return methodNotAllowed(res, ["GET", "PUT"]);
}
