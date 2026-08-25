import type { VercelRequest, VercelResponse } from "@vercel/node";
import { requireAdmin } from "./_lib/auth.js";
import { methodNotAllowed, sendJson } from "./_lib/http.js";
import {
  DEFAULT_SETTINGS,
  KEY_MAP,
  readSettings,
  type HeroSliderSetting,
  upsertSetting,
} from "./_lib/settings.js";

function normalizeHeroSlider(input: unknown): HeroSliderSetting[] {
  if (!Array.isArray(input)) return DEFAULT_SETTINGS.heroSlider;

  return input
    .map((slide, index) => {
      const item = slide && typeof slide === "object"
        ? (slide as Record<string, unknown>)
        : {};
      const id = String(item.id ?? "").trim() || `slide-${Date.now()}-${index}`;

      return {
        id,
        imageUrl: String(item.imageUrl ?? "").trim(),
        title: String(item.title ?? "").trim(),
        subtitle: String(item.subtitle ?? "").trim(),
        primaryCtaText: String(item.primaryCtaText ?? "").trim(),
        primaryCtaHref: String(item.primaryCtaHref ?? "").trim(),
        secondaryCtaText: String(item.secondaryCtaText ?? "").trim(),
        secondaryCtaHref: String(item.secondaryCtaHref ?? "").trim(),
        isActive: item.isActive !== false,
        sortOrder: Number.isFinite(Number(item.sortOrder))
          ? Number(item.sortOrder)
          : index,
      };
    })
    .filter((slide) => slide.imageUrl || slide.title || slide.subtitle)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((slide, index) => ({ ...slide, sortOrder: index }));
}

function normalizeColor(input: unknown, fallback: string) {
  const color = String(input ?? "").trim();
  return /^#[0-9a-fA-F]{3,8}$/.test(color) ? color : fallback;
}

async function getSettings(res: VercelResponse) {
  try {
    const settings = await readSettings();
    return sendJson(res, 200, settings);
  } catch (error) {
    console.error("Failed to read settings", error);
    return sendJson(res, 200, DEFAULT_SETTINGS);
  }
}

async function updateSettings(req: VercelRequest, res: VercelResponse) {
  const admin = await requireAdmin(req, res);
  if (!admin) return;

  try {
    const body = req.body ?? {};
    const currentSettings = await readSettings();
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
    const announcementBgColor = body.announcementBgColor === undefined
      ? currentSettings.announcementBgColor
      : normalizeColor(body.announcementBgColor, "");
    const announcementTextColor = body.announcementTextColor === undefined
      ? currentSettings.announcementTextColor
      : normalizeColor(body.announcementTextColor, "");
    const marketCountry = body.marketCountry === undefined
      ? currentSettings.marketCountry
      : String(body.marketCountry ?? "").trim() || DEFAULT_SETTINGS.marketCountry;
    const marketCountryAdjective = body.marketCountryAdjective === undefined
      ? currentSettings.marketCountryAdjective
      : String(body.marketCountryAdjective ?? "").trim() || DEFAULT_SETTINGS.marketCountryAdjective;

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
      announcementBgColor,
      announcementTextColor,
      marketCountry,
      marketCountryAdjective,
      heroSlider: body.heroSlider === undefined
        ? currentSettings.heroSlider
        : normalizeHeroSlider(body.heroSlider),
    };

    await Promise.all([
      upsertSetting(KEY_MAP.currencySymbol, next.currencySymbol),
      upsertSetting(KEY_MAP.facebookPixelId, next.facebookPixelId),
      upsertSetting(KEY_MAP.tiktokPixelId, next.tiktokPixelId),
      upsertSetting(KEY_MAP.logoUrl, next.logoUrl),
      upsertSetting(KEY_MAP.primaryColor, next.primaryColor),
      upsertSetting(KEY_MAP.announcementText, next.announcementText),
      upsertSetting(KEY_MAP.announcementActive, next.announcementActive),
      upsertSetting(KEY_MAP.announcementBgColor, next.announcementBgColor),
      upsertSetting(KEY_MAP.announcementTextColor, next.announcementTextColor),
      upsertSetting(KEY_MAP.marketCountry, next.marketCountry),
      upsertSetting(KEY_MAP.marketCountryAdjective, next.marketCountryAdjective),
      upsertSetting(KEY_MAP.heroSlider, JSON.stringify(next.heroSlider)),
    ]);

    return sendJson(res, 200, {
      ...next,
      announcementActive: next.announcementActive === "true",
    });
  } catch (error) {
    console.error("Failed to save settings", error);
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
