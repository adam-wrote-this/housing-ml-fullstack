"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { Locale } from "@/lib/i18n";

type AppUiContextValue = {
  loading: boolean;
  error: string;
  locale: Locale;
  setLoading: (loading: boolean) => void;
  setError: (message: string) => void;
  clearError: () => void;
  setLocale: (locale: Locale) => void;
};

const AppUiContext = createContext<AppUiContextValue | null>(null);

export function AppUiProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [locale, setLocale] = useState<Locale>("en");

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const clearError = useCallback(() => setError(""), []);

  const value = useMemo(
    () => ({
      loading,
      error,
      locale,
      setLoading,
      setError,
      clearError,
      setLocale
    }),
    [clearError, error, loading, locale]
  );

  return <AppUiContext.Provider value={value}>{children}</AppUiContext.Provider>;
}

export function useAppUi() {
  const context = useContext(AppUiContext);
  if (!context) {
    throw new Error("useAppUi must be used inside AppUiProvider");
  }
  return context;
}
