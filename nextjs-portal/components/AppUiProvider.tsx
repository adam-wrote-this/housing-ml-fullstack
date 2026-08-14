"use client";

import { createContext, useContext, useMemo, useState } from "react";

type AppUiContextValue = {
  loading: boolean;
  error: string;
  setLoading: (loading: boolean) => void;
  setError: (message: string) => void;
  clearError: () => void;
};

const AppUiContext = createContext<AppUiContextValue | null>(null);

export function AppUiProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const value = useMemo(
    () => ({
      loading,
      error,
      setLoading,
      setError,
      clearError: () => setError("")
    }),
    [loading, error]
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
