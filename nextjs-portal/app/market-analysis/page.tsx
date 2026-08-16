import MarketAnalysisClient from "@/app/market-analysis/analysis-client";
import type { MarketDashboard } from "@/lib/types";

export const dynamic = "force-dynamic";

async function loadMarketDashboard(): Promise<MarketDashboard> {
  // 服务端取数，避免内部服务地址进入浏览器包。
  const javaBackendUrl = process.env.JAVA_BACKEND_URL || "http://localhost:8080";
  const response = await fetch(`${javaBackendUrl}/market/dashboard`, {
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(`Failed to load market dashboard (${response.status})`);
  }

  return (await response.json()) as MarketDashboard;
}

export default async function MarketAnalysisPage() {
  const dashboard = await loadMarketDashboard();
  return <MarketAnalysisClient initialDashboard={dashboard} />;
}
