"use client";

import { useAppUi } from "@/components/AppUiProvider";
import { localeLabels, type Locale } from "@/lib/i18n";

export function LanguageToggle() {
  const { locale, setLocale } = useAppUi();

  return (
    <div className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 p-1 text-xs font-medium text-slate-700">
      {(["en", "zh"] as Locale[]).map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => setLocale(option)}
          className={`rounded-full px-2.5 py-1 transition ${
            locale === option ? "bg-slate-900 text-white shadow-sm" : "text-slate-600 hover:text-slate-900"
          }`}
          aria-label={`Switch language to ${option === "en" ? "English" : "中文"}`}
        >
          {localeLabels[option]}
        </button>
      ))}
    </div>
  );
}
