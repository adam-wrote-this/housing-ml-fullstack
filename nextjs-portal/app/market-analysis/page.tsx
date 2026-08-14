import MarketAnalysisClient from "@/app/market-analysis/analysis-client";

export default function MarketAnalysisPage() {
  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">Market Analysis</h1>
      <p className="text-sm text-slate-600">
        Review segment stats and run what-if scenarios against the Java backend.
      </p>
      <MarketAnalysisClient />
    </section>
  );
}
