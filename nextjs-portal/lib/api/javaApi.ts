import { requestJson } from "@/lib/api/http";
import type { MarketSegment, WhatIfRequest, WhatIfResponse } from "@/lib/types";

export async function fetchMarketSegments(): Promise<MarketSegment[]> {
  return requestJson<MarketSegment[]>("/api/java/market/segments");
}

export async function runWhatIfSimulation(
  payload: WhatIfRequest
): Promise<WhatIfResponse> {
  return requestJson<WhatIfResponse>("/api/java/market/whatif", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}
