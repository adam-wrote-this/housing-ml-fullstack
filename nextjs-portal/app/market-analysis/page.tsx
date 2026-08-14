"use client";

import MarketAnalysisClient from "@/app/market-analysis/analysis-client";
import { useAppUi } from "@/components/AppUiProvider";
import { translations } from "@/lib/i18n";

export default function MarketAnalysisPage() {
  const { locale } = useAppUi();
  const t = translations[locale];

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">{t.marketPageTitle}</h1>
      <p className="text-sm text-slate-600">{t.marketPageIntro}</p>
      <MarketAnalysisClient />
    </section>
  );
}
