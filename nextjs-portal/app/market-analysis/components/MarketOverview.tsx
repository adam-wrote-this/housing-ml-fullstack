import { Card } from "@/components/ui/Card";
import type { Translation } from "@/lib/i18n";

type MarketOverviewProps = {
  translation: Translation;
  totalProperties: number;
  filteredCount: number;
  averagePrice: number;
  medianPrice: number;
  averageArea: number;
  formatCurrency: (value: number) => string;
  formatNumber: (value: number) => string;
};

export function MarketOverview({
  translation: t,
  totalProperties,
  filteredCount,
  averagePrice,
  medianPrice,
  averageArea,
  formatCurrency,
  formatNumber
}: MarketOverviewProps) {
  const metrics = [
    { label: t.filteredProperties, value: `${filteredCount} / ${totalProperties}` },
    { label: t.avgPrice, value: formatCurrency(averagePrice) },
    { label: t.medianPrice, value: formatCurrency(medianPrice) },
    { label: t.avgArea, value: `${formatNumber(averageArea)} sqft` }
  ];

  return (
    <div aria-label={t.marketOverview} className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {metrics.map((metric) => (
        <Card key={metric.label}>
          <p className="text-sm font-medium text-slate-500">{metric.label}</p>
          <p className="mt-2 text-2xl font-semibold text-slate-950">{metric.value}</p>
        </Card>
      ))}
    </div>
  );
}
