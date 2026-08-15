import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import type { MarketFilterState } from "@/hooks/useMarketFilters";
import type { Translation } from "@/lib/i18n";

type MarketFiltersPanelProps = {
  market: MarketFilterState;
  translation: Translation;
};

export function MarketFiltersPanel({ market, translation: t }: MarketFiltersPanelProps) {
  return (
    <Card title={t.marketFilters}>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <Input
          label={t.searchPropertyId}
          type="search"
          inputMode="numeric"
          value={market.filters.searchId}
          onChange={(event) => market.updateFilter("searchId", event.target.value)}
        />
        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
          {t.priceRange}
          <select
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600"
            value={market.filters.priceRange}
            onChange={(event) =>
              market.updateFilter(
                "priceRange",
                event.target.value as typeof market.filters.priceRange
              )
            }
          >
            <option value="all">{t.allPriceRanges}</option>
            <option value="under200">{t.under200k}</option>
            <option value="between200And350">{t.between200kAnd350k}</option>
            <option value="over350">{t.over350k}</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
          {t.beds}
          <select
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600"
            value={market.filters.bedrooms}
            onChange={(event) => market.updateFilter("bedrooms", event.target.value)}
          >
            <option value="all">{t.allBedrooms}</option>
            {[2, 3, 4].map((bedrooms) => (
              <option key={bedrooms} value={bedrooms}>{bedrooms}</option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
          {t.minimumSchoolRating}
          <select
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600"
            value={market.filters.minimumSchoolRating}
            onChange={(event) => market.updateFilter("minimumSchoolRating", event.target.value)}
          >
            <option value="all">{t.anyRating}</option>
            {[7, 8, 9].map((rating) => (
              <option key={rating} value={rating}>{rating}+</option>
            ))}
          </select>
        </label>
        <button
          type="button"
          className="self-end rounded-md border border-slate-900 bg-white px-4 py-2 text-sm font-medium text-slate-900 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-900"
          onClick={market.resetFilters}
        >
          {t.resetFilters}
        </button>
      </div>
    </Card>
  );
}
