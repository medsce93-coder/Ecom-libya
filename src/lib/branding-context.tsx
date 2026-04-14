import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { apiFetch } from "./api";

const DEFAULT_PRIMARY          = "#1d4ed8";
const STORE_NAME               = "جودة ماركت";
const DEFAULT_ANNOUNCEMENT     = "🔥 عروض حصرية لفترة محدودة — الدفع عند الاستلام!";

interface BrandingState {
  logoUrl: string;
  primaryColor: string;
  storeName: string;
  announcementText: string;
  announcementActive: boolean;
}

const BrandingContext = createContext<BrandingState>({
  logoUrl: "",
  primaryColor: DEFAULT_PRIMARY,
  storeName: STORE_NAME,
  announcementText: DEFAULT_ANNOUNCEMENT,
  announcementActive: true,
});

export function useBranding() {
  return useContext(BrandingContext);
}

export function BrandingProvider({ children }: { children: ReactNode }) {
  const [logoUrl,            setLogoUrl]            = useState("");
  const [primaryColor,       setPrimaryColor]       = useState(DEFAULT_PRIMARY);
  const [announcementText,   setAnnouncementText]   = useState(DEFAULT_ANNOUNCEMENT);
  const [announcementActive, setAnnouncementActive] = useState(true);

  useEffect(() => {
    apiFetch<{
      logoUrl?: string;
      primaryColor?: string;
      announcementText?: string;
      announcementActive?: boolean;
    }>("/api/settings", { auth: false })
      .then((data: {
        logoUrl?: string;
        primaryColor?: string;
        announcementText?: string;
        announcementActive?: boolean;
      }) => {
        if (data.logoUrl) setLogoUrl(data.logoUrl);
        if (data.primaryColor && /^#[0-9a-fA-F]{3,8}$/.test(data.primaryColor)) {
          setPrimaryColor(data.primaryColor);
        }
        if (typeof data.announcementText === "string") setAnnouncementText(data.announcementText);
        if (typeof data.announcementActive === "boolean") setAnnouncementActive(data.announcementActive);
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
    }}>
      {children}
    </BrandingContext.Provider>
  );
}
