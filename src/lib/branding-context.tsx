import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { apiFetch } from "./api";
import { DEFAULT_MARKET_COUNTRY, resolveMarketCountry } from "./market-country";

const DEFAULT_PRIMARY          = "#1d4ed8";
const STORE_NAME               = "جودة ماركت";
const DEFAULT_ANNOUNCEMENT     = "🔥 عروض حصرية لفترة محدودة — الدفع عند الاستلام!";

interface BrandingState {
  logoUrl: string;
  primaryColor: string;
  storeName: string;
  announcementText: string;
  announcementActive: boolean;
  announcementBgColor: string;
  announcementTextColor: string;
  marketCountry: string;
  marketCountryAdjective: string;
}

const BrandingContext = createContext<BrandingState>({
  logoUrl: "",
  primaryColor: DEFAULT_PRIMARY,
  storeName: STORE_NAME,
  announcementText: DEFAULT_ANNOUNCEMENT,
  announcementActive: true,
  announcementBgColor: DEFAULT_PRIMARY,
  announcementTextColor: "#ffffff",
  marketCountry: DEFAULT_MARKET_COUNTRY.name,
  marketCountryAdjective: DEFAULT_MARKET_COUNTRY.adjective,
});

export function useBranding() {
  return useContext(BrandingContext);
}

export function BrandingProvider({ children }: { children: ReactNode }) {
  const [logoUrl,            setLogoUrl]            = useState("");
  const [primaryColor,       setPrimaryColor]       = useState(DEFAULT_PRIMARY);
  const [announcementText,   setAnnouncementText]   = useState(DEFAULT_ANNOUNCEMENT);
  const [announcementActive, setAnnouncementActive] = useState(true);
  const [announcementBgColor, setAnnouncementBgColor] = useState("");
  const [announcementTextColor, setAnnouncementTextColor] = useState("#ffffff");
  const [marketCountry, setMarketCountry] = useState(DEFAULT_MARKET_COUNTRY.name);
  const [marketCountryAdjective, setMarketCountryAdjective] = useState(DEFAULT_MARKET_COUNTRY.adjective);

  useEffect(() => {
    apiFetch<{
      logoUrl?: string;
      primaryColor?: string;
      announcementText?: string;
      announcementActive?: boolean;
      announcementBgColor?: string;
      announcementTextColor?: string;
      marketCountry?: string;
      marketCountryAdjective?: string;
    }>("/api/settings", { auth: false })
      .then((data: {
        logoUrl?: string;
        primaryColor?: string;
        announcementText?: string;
        announcementActive?: boolean;
        announcementBgColor?: string;
        announcementTextColor?: string;
        marketCountry?: string;
        marketCountryAdjective?: string;
      }) => {
        if (data.logoUrl) setLogoUrl(data.logoUrl);
        const resolvedPrimary = data.primaryColor && /^#[0-9a-fA-F]{3,8}$/.test(data.primaryColor)
          ? data.primaryColor
          : DEFAULT_PRIMARY;
        setPrimaryColor(resolvedPrimary);
        if (typeof data.announcementText === "string") setAnnouncementText(data.announcementText);
        if (typeof data.announcementActive === "boolean") setAnnouncementActive(data.announcementActive);
        if (typeof data.announcementBgColor === "string" && /^#[0-9a-fA-F]{3,8}$/.test(data.announcementBgColor)) {
          setAnnouncementBgColor(data.announcementBgColor);
        } else {
          setAnnouncementBgColor("");
        }
        if (typeof data.announcementTextColor === "string" && /^#[0-9a-fA-F]{3,8}$/.test(data.announcementTextColor)) {
          setAnnouncementTextColor(data.announcementTextColor);
        } else {
          setAnnouncementTextColor("#ffffff");
        }
        const market = resolveMarketCountry(data.marketCountry, data.marketCountryAdjective);
        setMarketCountry(market.name);
        setMarketCountryAdjective(market.adjective);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    document.documentElement.style.setProperty("--color-primary", primaryColor);
    document.documentElement.style.setProperty("--color-ring",    primaryColor);
    document.documentElement.style.setProperty("--color-brand",   primaryColor);
  }, [primaryColor]);

  return (
    <BrandingContext.Provider value={{
      logoUrl,
      primaryColor,
      storeName: STORE_NAME,
      announcementText,
      announcementActive,
      announcementBgColor: announcementBgColor || primaryColor,
      announcementTextColor,
      marketCountry,
      marketCountryAdjective,
    }}>
      {children}
    </BrandingContext.Provider>
  );
}
