import { Router } from "express";
import { db } from "@workspace/db";
import { storeSettingsTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

const router = Router();

const DEFAULT_SETTINGS = {
  currencySymbol: "د.ل",
  facebookPixelId: "",
  tiktokPixelId: "",
  logoUrl: "",
  primaryColor: "#1d4ed8",
  announcementText: "🔥 عروض حصرية لفترة محدودة — الدفع عند الاستلام!",
  announcementActive: "true",
};

async function getSettingValue(key: string, fallback: string): Promise<string> {
  const rows = await db
    .select()
    .from(storeSettingsTable)
    .where(eq(storeSettingsTable.key, key))
    .limit(1);
  return rows[0]?.value ?? fallback;
}

async function upsertSetting(key: string, value: string) {
  await db
    .insert(storeSettingsTable)
    .values({ key, value })
    .onConflictDoUpdate({
      target: storeSettingsTable.key,
      set: { value, updatedAt: new Date() },
    });
}

router.get("/settings", async (_req, res) => {
  try {
    const [
      currencySymbol, facebookPixelId, tiktokPixelId,
      logoUrl, primaryColor, announcementText, announcementActive,
    ] = await Promise.all([
      getSettingValue("currency_symbol",      DEFAULT_SETTINGS.currencySymbol),
      getSettingValue("facebook_pixel_id",    DEFAULT_SETTINGS.facebookPixelId),
      getSettingValue("tiktok_pixel_id",      DEFAULT_SETTINGS.tiktokPixelId),
      getSettingValue("logo_url",             DEFAULT_SETTINGS.logoUrl),
      getSettingValue("primary_color",        DEFAULT_SETTINGS.primaryColor),
      getSettingValue("announcement_text",    DEFAULT_SETTINGS.announcementText),
      getSettingValue("announcement_active",  DEFAULT_SETTINGS.announcementActive),
    ]);
    res.json({
      currencySymbol,
      facebookPixelId,
      tiktokPixelId,
      logoUrl,
      primaryColor,
      announcementText,
      announcementActive: announcementActive === "true",
    });
  } catch (err) {
    console.error("[settings] GET /api/settings error:", err);
    res.json({
      ...DEFAULT_SETTINGS,
      announcementActive: true,
    });
  }
});

router.put("/settings", async (req, res) => {
  try {
    const {
      currencySymbol, facebookPixelId, tiktokPixelId,
      logoUrl, primaryColor, announcementText, announcementActive,
    } = req.body as {
      currencySymbol?: string;
      facebookPixelId?: string;
      tiktokPixelId?: string;
      logoUrl?: string;
      primaryColor?: string;
      announcementText?: string;
      announcementActive?: boolean;
    };

    if (!currencySymbol || typeof currencySymbol !== "string" || currencySymbol.trim().length === 0) {
      return res.status(400).json({ error: "currencySymbol is required" });
    }

    const trimmedCurrency   = currencySymbol.trim();
    const trimmedFb         = typeof facebookPixelId === "string" ? facebookPixelId.trim() : "";
    const trimmedTt         = typeof tiktokPixelId === "string" ? tiktokPixelId.trim() : "";
    const trimmedLogo       = typeof logoUrl === "string" ? logoUrl.trim() : "";
    const trimmedColor      = typeof primaryColor === "string" && primaryColor.trim().match(/^#[0-9a-fA-F]{3,8}$/)
      ? primaryColor.trim() : DEFAULT_SETTINGS.primaryColor;
    const trimmedAnnText    = typeof announcementText === "string" ? announcementText.trim() : DEFAULT_SETTINGS.announcementText;
    const trimmedAnnActive  = announcementActive === false ? "false" : "true";

    await Promise.all([
      upsertSetting("currency_symbol",     trimmedCurrency),
      upsertSetting("facebook_pixel_id",   trimmedFb),
      upsertSetting("tiktok_pixel_id",     trimmedTt),
      upsertSetting("logo_url",            trimmedLogo),
      upsertSetting("primary_color",       trimmedColor),
      upsertSetting("announcement_text",   trimmedAnnText),
      upsertSetting("announcement_active", trimmedAnnActive),
    ]);

    console.log("[settings] PUT /api/settings — saved successfully");
    res.json({
      currencySymbol: trimmedCurrency,
      facebookPixelId: trimmedFb,
      tiktokPixelId: trimmedTt,
      logoUrl: trimmedLogo,
      primaryColor: trimmedColor,
      announcementText: trimmedAnnText,
      announcementActive: trimmedAnnActive === "true",
    });
  } catch (err) {
    console.error("[settings] PUT /api/settings error:", err);
    res.status(500).json({ error: "Failed to save setting" });
  }
});

export default router;
