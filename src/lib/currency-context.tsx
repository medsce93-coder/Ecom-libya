import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { apiFetch } from "./api";

interface CurrencyContextValue {
  currency: string;
  setCurrency: (c: string) => void;
}

const CurrencyContext = createContext<CurrencyContextValue>({
  currency: "د.ل",
  setCurrency: () => {},
});

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState("د.ل");

  useEffect(() => {
    apiFetch<{ currencySymbol?: string }>("/api/settings", { auth: false })
      .then((data) => {
        if (data?.currencySymbol) setCurrencyState(data.currencySymbol);
      })
      .catch(() => {});
  }, []);

  const setCurrency = (c: string) => setCurrencyState(c);

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  return useContext(CurrencyContext);
}
