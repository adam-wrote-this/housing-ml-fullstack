"use client";

import { useAppUi } from "@/components/AppUiProvider";

export function GlobalErrorAlert() {
  const { error, clearError } = useAppUi();
  if (!error) {
    return null;
  }
  return (
    <div className="fixed left-4 right-4 top-4 z-50 mx-auto max-w-3xl rounded-md border border-rose-300 bg-rose-50 p-3 text-sm text-rose-800 shadow">
      <div className="flex items-start justify-between gap-3">
        <p>{error}</p>
        <button
          type="button"
          onClick={clearError}
          className="rounded border border-rose-300 px-2 py-0.5 text-xs font-medium text-rose-700 hover:bg-rose-100"
          aria-label="Dismiss error"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
