"use client";

import { useMemo } from "react";
import { MarketFiltersPanel } from "@/app/market-analysis/components/MarketFiltersPanel";
import { MarketOverview } from "@/app/market-analysis/components/MarketOverview";
import { MarketTable } from "@/app/market-analysis/components/MarketTable";
import { PriceDistribution } from "@/app/market-analysis/components/PriceDistribution";
import { WhatIfPanel } from "@/app/market-analysis/components/WhatIfPanel";
import { useAppUi } from "@/components/AppUiProvider";
import { useMarketFilters } from "@/hooks/useMarketFilters";
import { translations } from "@/lib/i18n";
import type { MarketDashboard, MarketProperty } from "@/lib/types";

type MarketAnalysisClientProps = {
  initialDashboard: MarketDashboard;
};

function calculateMedian(properties: MarketProperty[]) {
  if (properties.length === 0) {
    return 0;
  }
  const prices = properties.map((property) => property.price).sort((left, right) => left - right);
  const middle = Math.floor(prices.length / 2);
  return prices.length % 2 === 0
    ? (prices[middle - 1] + prices[middle]) / 2
    : prices[middle];
}

export default function MarketAnalysisClient({ initialDashboard }: MarketAnalysisClientProps) {
  const { locale } = useAppUi();
  const t = translations[locale];
  const market = useMarketFilters(initialDashboard.properties);

  const currencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat(locale === "en" ? "en-US" : "zh-CN", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0
      }),
    [locale]
  );
  const numberFormatter = useMemo(
    () => new Intl.NumberFormat(locale === "en" ? "en-US" : "zh-CN", {
      maximumFractionDigits: 1
    }),
    [locale]
  );

  const summary = useMemo(() => {
    const properties = market.filteredProperties;
    const divisor = properties.length || 1;
    return {
      count: properties.length,
      averagePrice:
        properties.reduce((sum, property) => sum + property.price, 0) / divisor,
      medianPrice: calculateMedian(properties),
      averageArea:
        properties.reduce((sum, property) => sum + property.squareFootage, 0) / divisor,
      averageSchoolRating:
        properties.reduce((sum, property) => sum + property.schoolRating, 0) / divisor
    };
  }, [market.filteredProperties]);

  const formatCurrency = (value: number) => currencyFormatter.format(value);
  const formatNumber = (value: number) => numberFormatter.format(value);

  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-slate-950">{t.marketPageTitle}</h1>
        <p className="mt-1 text-sm text-slate-600">{t.marketPageIntro}</p>
      </header>

      <MarketOverview
        translation={t}
        totalProperties={initialDashboard.summary.totalProperties}
        filteredCount={summary.count}
        averagePrice={summary.averagePrice}
        medianPrice={summary.medianPrice}
        averageArea={summary.averageArea}
        formatCurrency={formatCurrency}
        formatNumber={formatNumber}
      />
      <MarketFiltersPanel market={market} translation={t} />

      <div className="grid gap-4 xl:grid-cols-2">
        <PriceDistribution
          properties={market.filteredProperties}
          averageSchoolRating={summary.averageSchoolRating}
          translation={t}
          formatCurrency={formatCurrency}
          formatNumber={formatNumber}
        />
        <WhatIfPanel translation={t} formatCurrency={formatCurrency} />
      </div>

      <MarketTable
        market={market}
        translation={t}
        formatCurrency={formatCurrency}
        formatNumber={formatNumber}
      />
    </section>
  );
}
