"use client";

import Link from "next/link";
import { useAppUi } from "@/components/AppUiProvider";
import { LanguageToggle } from "@/components/LanguageToggle";
import { translations } from "@/lib/i18n";

export function HeaderNav() {
  const { locale } = useAppUi();
  const t = translations[locale];

  return (
    <header className="border-b border-slate-200 bg-white">
      <nav className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="text-base font-semibold text-slate-900">
          {t.portalTitle}
        </Link>
        <div className="flex items-center gap-3 text-sm">
          <Link href="/property-form" className="text-slate-700 hover:text-slate-900">
            {t.propertyForm}
          </Link>
          <Link href="/market-analysis" className="text-slate-700 hover:text-slate-900">
            {t.marketAnalysis}
          </Link>
          <LanguageToggle />
        </div>
      </nav>
    </header>
  );
}
