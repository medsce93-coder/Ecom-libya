export type MarketCountryOption = {
  name: string;
  adjective: string;
};

export const DEFAULT_MARKET_COUNTRY: MarketCountryOption = {
  name: "ليبيا",
  adjective: "الليبية",
};

export const MARKET_COUNTRY_OPTIONS: MarketCountryOption[] = [
  DEFAULT_MARKET_COUNTRY,
  { name: "المغرب", adjective: "المغربية" },
  { name: "مصر", adjective: "المصرية" },
  { name: "السعودية", adjective: "السعودية" },
  { name: "الإمارات", adjective: "الإماراتية" },
  { name: "تونس", adjective: "التونسية" },
  { name: "الجزائر", adjective: "الجزائرية" },
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
  };
}
