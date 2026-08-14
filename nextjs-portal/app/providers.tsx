"use client";

import { AppUiProvider } from "@/components/AppUiProvider";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { GlobalErrorAlert } from "@/components/GlobalErrorAlert";
import { GlobalLoader } from "@/components/GlobalLoader";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <AppUiProvider>
        <GlobalLoader />
        <GlobalErrorAlert />
        {children}
      </AppUiProvider>
    </ErrorBoundary>
  );
}
