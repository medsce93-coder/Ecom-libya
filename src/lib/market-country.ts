export type MarketCountryOption = {
  name: string;
  adjective: string;
  cityExample: string;
  phoneExample: string;
};

export const DEFAULT_MARKET_COUNTRY: MarketCountryOption = {
  name: "ليبيا",
  adjective: "الليبية",
  cityExample: "طرابلس",
  phoneExample: "0911234567",
};

export const MARKET_COUNTRY_OPTIONS: MarketCountryOption[] = [
  DEFAULT_MARKET_COUNTRY,
  { name: "المغرب", adjective: "المغربية", cityExample: "الدار البيضاء", phoneExample: "0612345678" },
  { name: "مصر", adjective: "المصرية", cityExample: "القاهرة", phoneExample: "01012345678" },
  { name: "السعودية", adjective: "السعودية", cityExample: "الرياض", phoneExample: "0501234567" },
  { name: "الإمارات", adjective: "الإماراتية", cityExample: "دبي", phoneExample: "0501234567" },
  { name: "تونس", adjective: "التونسية", cityExample: "تونس", phoneExample: "20123456" },
  { name: "الجزائر", adjective: "الجزائرية", cityExample: "الجزائر", phoneExample: "0550123456" },
];

export const OTHER_MARKET_COUNTRY = "__other__";

export function findMarketCountry(name: string | null | undefined) {
  const normalized = String(name ?? "").trim();
  return MARKET_COUNTRY_OPTIONS.find((country) => country.name === normalized);
}

export function resolveMarketCountry(
  name: string | null | undefined,
  adjective: string | null | undefined,
): MarketCountryOption {
  const normalizedName = String(name ?? "").trim() || DEFAULT_MARKET_COUNTRY.name;
  const knownCountry = findMarketCountry(normalizedName);

  return {
    name: normalizedName,
    adjective:
      String(adjective ?? "").trim() ||
      knownCountry?.adjective ||
      DEFAULT_MARKET_COUNTRY.adjective,
    cityExample: knownCountry?.cityExample || "مدينتك",
    phoneExample: knownCountry?.phoneExample || "رقم هاتفك",
  };
}

export function getMarketCityPlaceholder(name: string | null | undefined) {
  return `مثال: ${findMarketCountry(name)?.cityExample || "مدينتك"}`;
}

export function getMarketPhonePlaceholder(name: string | null | undefined) {
  return `مثال: ${findMarketCountry(name)?.phoneExample || "رقم هاتفك"}`;
}
