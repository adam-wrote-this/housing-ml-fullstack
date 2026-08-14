import { requestJson } from "@/lib/api/http";
import type { App1PredictionResponse, HousingFeatures } from "@/lib/types";

export async function predictPropertyPrice(
  payload: HousingFeatures
): Promise<App1PredictionResponse> {
  return requestJson<App1PredictionResponse>("/api/python/property/predict", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}
