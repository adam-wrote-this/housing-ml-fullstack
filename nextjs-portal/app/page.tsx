"use client";

import Link from "next/link";
import { useAppUi } from "@/components/AppUiProvider";
import { Card } from "@/components/ui/Card";
import { translations } from "@/lib/i18n";

export default function HomePage() {
  const { locale } = useAppUi();
  const t = translations[locale];

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card title={t.homeTitle1}>
        <p className="mb-4 text-sm text-slate-700">{t.homeDesc1}</p>
        <Link href="/property-form" className="font-medium">
          {t.openPropertyForm}
        </Link>
      </Card>
      <Card title={t.homeTitle2}>
        <p className="mb-4 text-sm text-slate-700">{t.homeDesc2}</p>
        <Link href="/market-analysis" className="font-medium">
          {t.openMarketAnalysis}
        </Link>
      </Card>
    </div>
  );
}
