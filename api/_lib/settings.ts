import { query } from "./db.js";

export type HeroSliderSetting = {
  id: string;
  imageUrl: string;
  title: string;
  subtitle: string;
  primaryCtaText: string;
  primaryCtaHref: string;
  secondaryCtaText: string;
  secondaryCtaHref: string;
  isActive: boolean;
  sortOrder: number;
};

const DEFAULT_SETTINGS: {
  currencySymbol: string;
  facebookPixelId: string;
  tiktokPixelId: string;
  logoUrl: string;
  primaryColor: string;
  announcementText: string;
  announcementActive: boolean;
  heroSlider: HeroSliderSetting[];
} = {
  currencySymbol: "د.ل",
  facebookPixelId: "",
  tiktokPixelId: "",
  logoUrl: "",
  primaryColor: "#1d4ed8",
  announcementText: "🔥 عروض حصرية لفترة محدودة — الدفع عند الاستلام!",
  announcementActive: true,
  heroSlider: [],
};

const KEY_MAP = {
  currencySymbol: "currency_symbol",
  facebookPixelId: "facebook_pixel_id",
  tiktokPixelId: "tiktok_pixel_id",
  logoUrl: "logo_url",
  primaryColor: "primary_color",
  announcementText: "announcement_text",
  announcementActive: "announcement_active",
  heroSlider: "hero_slider",
} as const;

export type StoreSettings = typeof DEFAULT_SETTINGS;

export async function readSettings(): Promise<StoreSettings> {
  const rows = await query<{ key: string; value: string }>(
    "SELECT key, value FROM store_settings",
  );

  const map = new Map(rows.map((row) => [row.key, row.value]));
  let heroSlider = DEFAULT_SETTINGS.heroSlider;
  const heroSliderRaw = map.get(KEY_MAP.heroSlider);
  if (heroSliderRaw) {
    try {
      const parsed = JSON.parse(heroSliderRaw);
      heroSlider = Array.isArray(parsed) ? parsed : DEFAULT_SETTINGS.heroSlider;
    } catch {
      heroSlider = DEFAULT_SETTINGS.heroSlider;
    }
  }

  return {
    currencySymbol:
      map.get(KEY_MAP.currencySymbol) ?? DEFAULT_SETTINGS.currencySymbol,
    facebookPixelId:
      map.get(KEY_MAP.facebookPixelId) ?? DEFAULT_SETTINGS.facebookPixelId,
    tiktokPixelId:
      map.get(KEY_MAP.tiktokPixelId) ?? DEFAULT_SETTINGS.tiktokPixelId,
    logoUrl: map.get(KEY_MAP.logoUrl) ?? DEFAULT_SETTINGS.logoUrl,
    primaryColor:
      map.get(KEY_MAP.primaryColor) ?? DEFAULT_SETTINGS.primaryColor,
    announcementText:
      map.get(KEY_MAP.announcementText) ?? DEFAULT_SETTINGS.announcementText,
    announcementActive:
      (map.get(KEY_MAP.announcementActive) ??
        String(DEFAULT_SETTINGS.announcementActive)) === "true",
    heroSlider,
  };
}

export async function upsertSetting(key: string, value: string) {
  await query(
    `
      INSERT INTO store_settings (key, value, updated_at)
      VALUES ($1, $2, NOW())
      ON CONFLICT (key)
      DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()
    `,
    [key, value],
  );
}

export { DEFAULT_SETTINGS, KEY_MAP };
