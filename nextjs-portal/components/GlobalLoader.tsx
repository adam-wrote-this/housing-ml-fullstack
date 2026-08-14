"use client";

import { useAppUi } from "@/components/AppUiProvider";

export function GlobalLoader() {
  const { loading } = useAppUi();
  if (!loading) {
    return null;
  }
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30"
      role="status"
      aria-live="polite"
      aria-label="Loading"
    >
      <div className="rounded-md bg-white px-4 py-3 text-sm font-medium text-slate-800 shadow">
        Loading...
      </div>
    </div>
  );
}
