"use client";

import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { useAppUi } from "@/components/AppUiProvider";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { runWhatIfSimulation } from "@/lib/api/javaApi";
import { formatTranslation } from "@/lib/i18n";
import type { Translation } from "@/lib/i18n";
import type {
  MarketProperty,
  WhatIfRequest,
  WhatIfResponse
} from "@/lib/types";

type Scenario = Omit<MarketProperty, "id" | "price">;
type ScenarioField = keyof Scenario;

type WhatIfPanelProps = {
  baselineProperty: MarketProperty | null;
  translation: Translation;
  formatCurrency: (value: number) => string;
  formatNumber: (value: number) => string;
  onClear: () => void;
};

function toScenario(property: MarketProperty): Scenario {
  return {
    squareFootage: property.squareFootage,
    bedrooms: property.bedrooms,
    bathrooms: property.bathrooms,
    yearBuilt: property.yearBuilt,
    lotSize: property.lotSize,
    distanceToCityCenter: property.distanceToCityCenter,
    schoolRating: property.schoolRating
  };
}

export function WhatIfPanel({
  baselineProperty,
  translation: t,
  formatCurrency,
  formatNumber,
  onClear
}: WhatIfPanelProps) {
  const [scenario, setScenario] = useState<Scenario | null>(
    baselineProperty ? toScenario(baselineProperty) : null
  );
  const [result, setResult] = useState<WhatIfResponse | null>(null);
  const { setLoading, setError, clearError } = useAppUi();

  useEffect(() => {
    setScenario(baselineProperty ? toScenario(baselineProperty) : null);
    setResult(null);
  }, [baselineProperty]);

  const changedFields = useMemo(() => {
    if (!baselineProperty || !scenario) {
      return [];
    }
    return (Object.keys(scenario) as ScenarioField[]).filter(
      (field) => scenario[field] !== baselineProperty[field]
    );
  }, [baselineProperty, scenario]);

  if (!baselineProperty || !scenario) {
    return (
      <div id="what-if-analysis">
        <Card title={t.whatIfTitle}>
          <p className="rounded-md border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-600">
            {t.selectPropertyForWhatIf}
          </p>
        </Card>
      </div>
    );
  }

  const fields: Array<{
    key: ScenarioField;
    label: string;
    step: string;
    min: number;
    max: number;
  }> = [
    { key: "squareFootage", label: t.fieldLabels.square_footage, step: "1", min: 1, max: 100000 },
    { key: "bedrooms", label: t.fieldLabels.bedrooms, step: "1", min: 0, max: 100 },
    { key: "bathrooms", label: t.fieldLabels.bathrooms, step: "0.5", min: 0, max: 100 },
    { key: "yearBuilt", label: t.fieldLabels.year_built, step: "1", min: 1800, max: 2200 },
    { key: "lotSize", label: t.fieldLabels.lot_size, step: "1", min: 1, max: 10000000 },
    {
      key: "distanceToCityCenter",
      label: t.fieldLabels.distance_to_city_center,
      step: "0.1",
      min: 0,
      max: 10000
    },
    { key: "schoolRating", label: t.fieldLabels.school_rating, step: "0.1", min: 0, max: 10 }
  ];

  const fieldLabels: Record<ScenarioField, string> = Object.fromEntries(
    fields.map((field) => [field.key, field.label])
  ) as Record<ScenarioField, string>;

  function buildRequest(): WhatIfRequest {
    // 仅发送变更值，Java 从基准房源补齐其余字段。
    const overrides: WhatIfRequest["overrides"] = {};
    changedFields.forEach((field) => {
      overrides[field] = scenario![field];
    });
    return { propertyId: baselineProperty!.id, overrides };
  }

  async function runSimulation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (changedFields.length === 0) {
      setError(t.noScenarioChanges);
      return;
    }
    clearError();
    setLoading(true);
    try {
      setResult(await runWhatIfSimulation(buildRequest()));
    } catch (error) {
      setError(error instanceof Error ? error.message : t.simulationFailed);
    } finally {
      setLoading(false);
    }
  }

  function resetScenario() {
    setScenario(toScenario(baselineProperty!));
    setResult(null);
    clearError();
  }

  const differenceClass = result && result.priceDifference >= 0
    ? "text-emerald-700"
    : "text-rose-700";

  return (
    <div id="what-if-analysis">
      <Card title={t.whatIfTitle}>
        <div className="mb-4 rounded-md bg-slate-50 p-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-semibold text-slate-900">
                {formatTranslation(t.selectedBaselineProperty, { id: baselineProperty.id })}
              </p>
              <p className="text-sm text-slate-600">
                {t.actualDatasetPrice}: {formatCurrency(baselineProperty.price)}
              </p>
            </div>
            <button
              type="button"
              className="text-sm font-medium text-brand-700 hover:underline"
              onClick={onClear}
            >
              {t.clearBaseline}
            </button>
          </div>
        </div>

        <form className="space-y-4" onSubmit={runSimulation}>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {fields.map((field) => {
              const changed = changedFields.includes(field.key);
              return (
                <div
                  key={field.key}
                  className={changed ? "rounded-md bg-amber-50 p-2 ring-1 ring-amber-200" : "p-2"}
                >
                  <Input
                    label={field.label}
                    type="number"
                    min={field.min}
                    max={field.max}
                    step={field.step}
                    value={scenario[field.key]}
                    onChange={(event) => {
                      const value = Number(event.target.value);
                      setScenario((previous) => previous
                        ? { ...previous, [field.key]: value }
                        : previous);
                      setResult(null);
                    }}
                  />
                  <p className="mt-1 text-xs text-slate-500">
                    {formatTranslation(t.baselineValue, {
                      value: formatNumber(baselineProperty[field.key])
                    })}
                  </p>
                </div>
              );
            })}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="submit" disabled={changedFields.length === 0}>
              {t.runWhatIf}
            </Button>
            <button
              type="button"
              className="rounded-md border border-slate-900 bg-white px-3 py-2 text-sm font-medium text-slate-900 hover:bg-slate-100"
              onClick={resetScenario}
            >
              {t.resetScenario}
            </button>
          </div>
          {changedFields.length === 0 ? (
            <p className="text-xs text-slate-500">{t.noScenarioChanges}</p>
          ) : null}
        </form>

        {result ? (
          <div className="mt-5 space-y-4" aria-live="polite">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              <div className="rounded-md bg-slate-100 p-3 text-sm">
                <p className="text-slate-600">{t.baselineModelPrediction}</p>
                <strong className="block text-lg">{formatCurrency(result.baselinePrediction)}</strong>
              </div>
              <div className="rounded-md bg-brand-50 p-3 text-sm">
                <p className="text-slate-600">{t.scenarioModelPrediction}</p>
                <strong className="block text-lg">{formatCurrency(result.scenarioPrediction)}</strong>
              </div>
              <div className="rounded-md bg-slate-100 p-3 text-sm">
                <p className="text-slate-600">{t.expectedPriceImpact}</p>
                <strong className={`block text-lg ${differenceClass}`}>
                  {result.priceDifference >= 0 ? "+" : ""}
                  {formatCurrency(result.priceDifference)}
                </strong>
                <span className={`text-xs ${differenceClass}`}>
                  {formatTranslation(t.percentageChange, {
                    value: `${result.percentageDifference >= 0 ? "+" : ""}${formatNumber(
                      result.percentageDifference
                    )}`
                  })}
                </span>
              </div>
            </div>

            <div>
              <h3 className="mb-2 text-sm font-semibold text-slate-900">{t.changedParameters}</h3>
              <ul className="space-y-2">
                {result.impacts.map((impact) => (
                  <li
                    key={impact.field}
                    className="flex flex-col justify-between gap-1 rounded-md border border-slate-200 px-3 py-2 text-sm sm:flex-row sm:items-center"
                  >
                    <span>
                      <strong>{fieldLabels[impact.field]}</strong>
                      <span className="ml-2 text-slate-500">
                        {formatNumber(impact.baselineValue)} → {formatNumber(impact.scenarioValue)}
                      </span>
                    </span>
                    <span className={impact.priceImpact >= 0 ? "text-emerald-700" : "text-rose-700"}>
                      {formatTranslation(t.modelImpact, {
                        value: `${impact.priceImpact >= 0 ? "+" : ""}${formatCurrency(
                          impact.priceImpact
                        )}`
                      })}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : null}
      </Card>
    </div>
  );
}
