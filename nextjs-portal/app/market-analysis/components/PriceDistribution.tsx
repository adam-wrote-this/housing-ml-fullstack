import { Card } from "@/components/ui/Card";
import { formatTranslation } from "@/lib/i18n";
import type { Translation } from "@/lib/i18n";
import type { MarketProperty } from "@/lib/types";

type PriceDistributionProps = {
  properties: MarketProperty[];
  averageSchoolRating: number;
  translation: Translation;
  formatCurrency: (value: number) => string;
  formatNumber: (value: number) => string;
};

export function PriceDistribution({
  properties,
  averageSchoolRating,
  translation: t,
  formatCurrency,
  formatNumber
}: PriceDistributionProps) {
  const segments = [
    {
      label: t.under200k,
      properties: properties.filter((property) => property.price < 200000)
    },
    {
      label: t.between200kAnd350k,
      properties: properties.filter(
        (property) => property.price >= 200000 && property.price < 350000
      )
    },
    {
      label: t.over350k,
      properties: properties.filter((property) => property.price >= 350000)
    }
  ];
  const maxCount = Math.max(1, ...segments.map((segment) => segment.properties.length));

  return (
    <Card title={t.priceDistribution}>
      <div className="space-y-5" role="img" aria-label={t.marketVisualization}>
        {segments.map((segment) => {
          const averagePrice =
            segment.properties.reduce((sum, property) => sum + property.price, 0) /
            (segment.properties.length || 1);
          return (
            <div key={segment.label}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="font-medium text-slate-700">{segment.label}</span>
                <span className="text-slate-500">{segment.properties.length}</span>
              </div>
              <div className="h-8 overflow-hidden rounded bg-slate-100">
                <div
                  className="flex h-full items-center justify-end rounded bg-brand-600 px-2 text-xs font-semibold text-white transition-[width]"
                  style={{ width: `${(segment.properties.length / maxCount) * 100}%` }}
                >
                  {segment.properties.length > 0 ? formatCurrency(averagePrice) : null}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-5 border-t border-slate-200 pt-4">
        <p className="text-sm text-slate-500">{t.avgSchoolRating}</p>
        <p className="text-xl font-semibold">
          {formatTranslation(t.ratingOutOfTen, {
            value: formatNumber(averageSchoolRating)
          })}
        </p>
      </div>
    </Card>
  );
}
