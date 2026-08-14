"use client";

import { useEffect, useState } from "react";
import { useAppUi } from "@/components/AppUiProvider";
import { fetchMarketSegments, runWhatIfSimulation } from "@/lib/api/javaApi";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/Skeleton";
import { translations } from "@/lib/i18n";
import type { MarketSegment, WhatIfRequest, WhatIfResponse } from "@/lib/types";

const initialSimulation: WhatIfRequest = {
  squareFootage: 2000,
  bedrooms: 4,
  bathrooms: 2.5,
  yearBuilt: 2005,
  lotSize: 9000,
  distanceToCityCenter: 6,
  schoolRating: 8.5,
  baselineSquareFootage: 1800
};

export default function MarketAnalysisClient() {
  const [segments, setSegments] = useState<MarketSegment[] | null>(null);
  const [simulation, setSimulation] = useState<WhatIfRequest>(initialSimulation);
  const [simulationResult, setSimulationResult] = useState<WhatIfResponse | null>(null);
  const { locale, setLoading, setError, clearError } = useAppUi();
  const t = translations[locale];

  useEffect(() => {
    let active = true;
    async function loadSegments() {
      clearError();
      setLoading(true);
      try {
        const data = await fetchMarketSegments();
        if (active) {
          setSegments(data);
        }
      } catch (error) {
        if (active) {
          const message = error instanceof Error ? error.message : "Failed to load segments";
          setError(message);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadSegments();
    return () => {
      active = false;
    };
  }, [clearError, setError, setLoading]);

  async function onRunSimulation(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    clearError();
    setLoading(true);
    try {
      const result = await runWhatIfSimulation(simulation);
      setSimulationResult(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Simulation failed";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  const numberFormatter = new Intl.NumberFormat(locale === "en" ? "en-US" : "zh-CN", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  });

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card title={locale === "en" ? "Market Segments" : "市场分段"}>
        {!segments ? (
          <div className="space-y-2">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-4/5" />
            <Skeleton className="h-6 w-3/5" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left">
                  <th className="px-2 py-2 font-semibold">{t.segment}</th>
                  <th className="px-2 py-2 font-semibold">{t.count}</th>
                  <th className="px-2 py-2 font-semibold">{t.avgPrice}</th>
                </tr>
              </thead>
              <tbody>
                {segments.map((segment) => (
                  <tr key={segment.segment} className="border-b border-slate-100">
                    <td className="px-2 py-2">{segment.segment}</td>
                    <td className="px-2 py-2">{segment.count}</td>
                    <td className="px-2 py-2">{numberFormatter.format(segment.avgPrice ?? 0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card title={t.whatIfTitle}>
        <form className="space-y-3" onSubmit={onRunSimulation}>
          <Input
            label={locale === "en" ? "Square Footage" : "建筑面积"}
            type="range"
            min={600}
            max={5000}
            step={10}
            value={simulation.squareFootage}
            onChange={(event) =>
              setSimulation((previous) => ({
                ...previous,
                squareFootage: Number(event.target.value)
              }))
            }
          />
          <p className="text-xs text-slate-600">
            {t.current}: {simulation.squareFootage} sqft
          </p>

          <Input
            label={locale === "en" ? "Baseline Square Footage" : "基准建筑面积"}
            type="number"
            step="any"
            value={simulation.baselineSquareFootage ?? 0}
            onChange={(event) =>
              setSimulation((previous) => ({
                ...previous,
                baselineSquareFootage: Number(event.target.value)
              }))
            }
          />

          <div className="grid grid-cols-2 gap-2">
            <Input
              label={locale === "en" ? "Bedrooms" : "卧室数"}
              type="number"
              step="any"
              value={simulation.bedrooms}
              onChange={(event) =>
                setSimulation((previous) => ({
                  ...previous,
                  bedrooms: Number(event.target.value)
                }))
              }
            />
            <Input
              label={locale === "en" ? "Bathrooms" : "浴室数"}
              type="number"
              step="any"
              value={simulation.bathrooms}
              onChange={(event) =>
                setSimulation((previous) => ({
                  ...previous,
                  bathrooms: Number(event.target.value)
                }))
              }
            />
            <Input
              label={locale === "en" ? "Year Built" : "建成年份"}
              type="number"
              step="1"
              value={simulation.yearBuilt}
              onChange={(event) =>
                setSimulation((previous) => ({
                  ...previous,
                  yearBuilt: Number(event.target.value)
                }))
              }
            />
            <Input
              label={locale === "en" ? "Lot Size" : "地块面积"}
              type="number"
              step="any"
              value={simulation.lotSize}
              onChange={(event) =>
                setSimulation((previous) => ({
                  ...previous,
                  lotSize: Number(event.target.value)
                }))
              }
            />
            <Input
              label={locale === "en" ? "Distance to City Center" : "到市中心距离"}
              type="number"
              step="any"
              value={simulation.distanceToCityCenter}
              onChange={(event) =>
                setSimulation((previous) => ({
                  ...previous,
                  distanceToCityCenter: Number(event.target.value)
                }))
              }
            />
            <Input
              label={locale === "en" ? "School Rating" : "学校评级"}
              type="number"
              step="any"
              value={simulation.schoolRating}
              onChange={(event) =>
                setSimulation((previous) => ({
                  ...previous,
                  schoolRating: Number(event.target.value)
                }))
              }
            />
          </div>

          <Button type="submit">{t.runWhatIf}</Button>
        </form>

        {simulationResult ? (
          <div className="mt-3 rounded-md border border-brand-50 bg-brand-50 p-3 text-sm text-slate-800">
            <p>
              {t.predicted}:{" "}
              <strong>
                {new Intl.NumberFormat(locale === "en" ? "en-US" : "zh-CN", {
                  style: "currency",
                  currency: "USD"
                }).format(simulationResult.predictedPrice)}
              </strong>
            </p>
            {simulationResult.baselinePrice != null ? (
              <p>
                {t.baseline}:{" "}
                <strong>
                  {new Intl.NumberFormat(locale === "en" ? "en-US" : "zh-CN", {
                    style: "currency",
                    currency: "USD"
                  }).format(simulationResult.baselinePrice)}
                </strong>
              </p>
            ) : null}
            {simulationResult.priceDifference != null ? (
              <p>
                {t.difference}:{" "}
                <strong>
                  {new Intl.NumberFormat(locale === "en" ? "en-US" : "zh-CN", {
                    style: "currency",
                    currency: "USD"
                  }).format(simulationResult.priceDifference)}
                </strong>
              </p>
            ) : null}
          </div>
        ) : null}
      </Card>
    </div>
  );
}
