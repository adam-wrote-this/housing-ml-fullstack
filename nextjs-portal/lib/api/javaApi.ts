import { requestJson } from "@/lib/api/http";
import type {
  MarketDashboard,
  MarketSegment,
  WhatIfRequest,
  WhatIfResponse
} from "@/lib/types";

export async function fetchMarketSegments(): Promise<MarketSegment[]> {
  return requestJson<MarketSegment[]>("/api/java/market/segments");
}

export async function fetchMarketDashboard(): Promise<MarketDashboard> {
  return requestJson<MarketDashboard>("/api/java/market/dashboard");
}

export async function runWhatIfSimulation(
  payload: WhatIfRequest
): Promise<WhatIfResponse> {
  return requestJson<WhatIfResponse>("/api/java/market/whatif", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}
