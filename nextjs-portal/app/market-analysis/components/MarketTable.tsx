"use client";

import { Card } from "@/components/ui/Card";
import type {
  MarketFilterState,
  MarketSortKey
} from "@/hooks/useMarketFilters";
import type { Translation } from "@/lib/i18n";

type MarketTableProps = {
  market: MarketFilterState;
  translation: Translation;
  formatCurrency: (value: number) => string;
  formatNumber: (value: number) => string;
};

type SortableHeadingProps = {
  label: string;
  column: MarketSortKey;
  market: MarketFilterState;
  translation: Translation;
};

function SortableHeading({
  label,
  column,
  market,
  translation: t
}: SortableHeadingProps) {
  const active = market.sortKey === column;
  const nextDirection =
    active && market.sortDirection === "asc" ? t.sortDescending : t.sortAscending;
  return (
    <th
      className="whitespace-nowrap px-3 py-3 text-left font-semibold"
      aria-sort={active ? (market.sortDirection === "asc" ? "ascending" : "descending") : "none"}
    >
      <button
        type="button"
        className="inline-flex items-center gap-1 rounded hover:text-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-600"
        onClick={() => market.toggleSort(column)}
        aria-label={`${label}: ${nextDirection}`}
      >
        {label}
        <span aria-hidden="true">
          {active ? (market.sortDirection === "asc" ? "↑" : "↓") : "↕"}
        </span>
      </button>
    </th>
  );
}

export function MarketTable({
  market,
  translation: t,
  formatCurrency,
  formatNumber
}: MarketTableProps) {
  const start = market.filteredProperties.length === 0
    ? 0
    : (market.page - 1) * market.pageSize + 1;
  const end = Math.min(market.page * market.pageSize, market.filteredProperties.length);
  const resultDescription = t.showingResults
    .replace("{start}", String(start))
    .replace("{end}", String(end))
    .replace("{total}", String(market.filteredProperties.length));

  function exportCsv() {
    const headers = [
      "id", "square_footage", "bedrooms", "bathrooms", "year_built", "lot_size",
      "distance_to_city_center", "school_rating", "price"
    ];
    const rows = market.filteredProperties.map((property) => [
      property.id, property.squareFootage, property.bedrooms, property.bathrooms,
      property.yearBuilt, property.lotSize, property.distanceToCityCenter,
      property.schoolRating, property.price
    ]);
    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "filtered-housing-market.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  const sortableHeadings: Array<{ label: string; column: MarketSortKey }> = [
    { label: t.propertyId, column: "id" },
    { label: t.price, column: "price" },
    { label: t.area, column: "squareFootage" },
    { label: t.beds, column: "bedrooms" }
  ];

  return (
    <Card>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">{t.propertyDataset}</h2>
          <p className="text-sm text-slate-500" aria-live="polite">{resultDescription}</p>
        </div>
        <div className="flex flex-wrap gap-2 print:hidden">
          <button type="button" className="rounded-md border border-slate-900 bg-white px-3 py-2 text-sm font-medium text-slate-900 hover:bg-slate-100" onClick={exportCsv}>
            {t.exportCsv}
          </button>
          <button type="button" className="rounded-md border border-slate-900 bg-white px-3 py-2 text-sm font-medium text-slate-900 hover:bg-slate-100" onClick={() => window.print()}>
            {t.exportPdf}
          </button>
        </div>
      </div>

      {market.visibleProperties.length === 0 ? (
        <p className="rounded-md bg-slate-50 p-6 text-center text-sm text-slate-600">{t.noProperties}</p>
      ) : (
        <>
          <div className="hidden overflow-x-auto md:block">
            <table className="min-w-full border-collapse text-sm">
              <thead className="border-y border-slate-200 bg-slate-50 text-slate-700">
                <tr>
                  {sortableHeadings.map((heading) => (
                    <SortableHeading key={heading.column} {...heading} market={market} translation={t} />
                  ))}
                  <th className="whitespace-nowrap px-3 py-3 text-left font-semibold">{t.baths}</th>
                  {[
                    { label: t.yearBuilt, column: "yearBuilt" as const },
                    { label: t.school, column: "schoolRating" as const },
                    { label: t.distance, column: "distanceToCityCenter" as const }
                  ].map((heading) => (
                    <SortableHeading key={heading.column} {...heading} market={market} translation={t} />
                  ))}
                </tr>
              </thead>
              <tbody>
                {market.visibleProperties.map((property) => (
                  <tr key={property.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-3 py-3 font-medium">#{property.id}</td>
                    <td className="whitespace-nowrap px-3 py-3 font-semibold">{formatCurrency(property.price)}</td>
                    <td className="whitespace-nowrap px-3 py-3">{formatNumber(property.squareFootage)} sqft</td>
                    <td className="px-3 py-3">{property.bedrooms}</td>
                    <td className="px-3 py-3">{property.bathrooms}</td>
                    <td className="px-3 py-3">{property.yearBuilt}</td>
                    <td className="px-3 py-3">{property.schoolRating}</td>
                    <td className="whitespace-nowrap px-3 py-3">{property.distanceToCityCenter} mi</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="grid gap-3 md:hidden">
            {market.visibleProperties.map((property) => (
              <article key={property.id} className="rounded-md border border-slate-200 p-3">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-semibold">#{property.id}</h3>
                  <p className="font-semibold text-brand-700">{formatCurrency(property.price)}</p>
                </div>
                <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  <div><dt className="text-slate-500">{t.area}</dt><dd>{property.squareFootage} sqft</dd></div>
                  <div><dt className="text-slate-500">{t.beds} / {t.baths}</dt><dd>{property.bedrooms} / {property.bathrooms}</dd></div>
                  <div><dt className="text-slate-500">{t.yearBuilt}</dt><dd>{property.yearBuilt}</dd></div>
                  <div><dt className="text-slate-500">{t.school}</dt><dd>{property.schoolRating}</dd></div>
                  <div><dt className="text-slate-500">{t.lotSize}</dt><dd>{property.lotSize} sqft</dd></div>
                  <div><dt className="text-slate-500">{t.distance}</dt><dd>{property.distanceToCityCenter} mi</dd></div>
                </dl>
              </article>
            ))}
          </div>
        </>
      )}

      <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-4 print:hidden">
        <button type="button" className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50" disabled={market.page === 1} onClick={() => market.setPage((page) => Math.max(1, page - 1))}>
          {t.previous}
        </button>
        <span className="text-sm text-slate-600">{market.page} / {market.totalPages}</span>
        <button type="button" className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50" disabled={market.page === market.totalPages} onClick={() => market.setPage((page) => Math.min(market.totalPages, page + 1))}>
          {t.next}
        </button>
      </div>
    </Card>
  );
}
