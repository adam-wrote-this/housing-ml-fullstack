"use client";

import { useEffect, useMemo, useState } from "react";
import { useAppUi } from "@/components/AppUiProvider";
import { fetchMarketSegments } from "@/lib/api/javaApi";
import { predictPropertyPrice } from "@/lib/api/pythonApi";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { translations } from "@/lib/i18n";
import type {
  HousingFeatures,
  PredictionHistoryItem,
  PropertyComparisonItem
} from "@/lib/types";

const emptyForm: Record<keyof HousingFeatures, string> = {
  square_footage: "",
  bedrooms: "",
  bathrooms: "",
  year_built: "",
  lot_size: "",
  distance_to_city_center: "",
  school_rating: ""
};

const HISTORY_STORAGE_KEY = "property-prediction-history";
const COMPARISON_STORAGE_KEY = "property-comparison-items";
const MAX_COMPARE_ITEMS = 4;

function formatCurrency(value: number, locale: "en" | "zh") {
  return new Intl.NumberFormat(locale === "en" ? "en-US" : "zh-CN", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2
  }).format(value);
}

function toHousingFeatures(raw: Record<keyof HousingFeatures, string>): HousingFeatures {
  return {
    square_footage: Number(raw.square_footage),
    bedrooms: Number(raw.bedrooms),
    bathrooms: Number(raw.bathrooms),
    year_built: Number(raw.year_built),
    lot_size: Number(raw.lot_size),
    distance_to_city_center: Number(raw.distance_to_city_center),
    school_rating: Number(raw.school_rating)
  };
}

export default function PropertyFormClient() {
  const [form, setForm] = useState<Record<keyof HousingFeatures, string>>(emptyForm);
  const [predictedPrice, setPredictedPrice] = useState<number | null>(null);
  const [lastSubmitted, setLastSubmitted] = useState<HousingFeatures | null>(null);
  const [history, setHistory] = useState<PredictionHistoryItem[]>([]);
  const [compareItems, setCompareItems] = useState<PropertyComparisonItem[]>([]);
  const [benchmarkPrice, setBenchmarkPrice] = useState<number>(275000);
  const { locale, setLoading, setError, clearError } = useAppUi();
  const t = translations[locale];

  useEffect(() => {
    let isMounted = true;

    fetchMarketSegments()
      .then((segments) => {
        if (!isMounted || segments.length === 0) {
          return;
        }

        const validSegments = segments.filter((segment) => segment.count > 0 && Number.isFinite(segment.avgPrice));
        if (validSegments.length === 0) {
          return;
        }

        const totalCount = validSegments.reduce((sum, segment) => sum + segment.count, 0);
        const weightedAverage =
          validSegments.reduce((sum, segment) => sum + segment.avgPrice * segment.count, 0) / totalCount;

        setBenchmarkPrice(weightedAverage || 275000);
      })
      .catch(() => {
        if (isMounted) {
          setBenchmarkPrice(275000);
        }
      });

    if (typeof window === "undefined") {
      return () => {
        isMounted = false;
      };
    }

    try {
      const storedHistory = window.localStorage.getItem(HISTORY_STORAGE_KEY);
      const storedCompare = window.localStorage.getItem(COMPARISON_STORAGE_KEY);

      if (storedHistory) {
        setHistory(JSON.parse(storedHistory) as PredictionHistoryItem[]);
      }

      if (storedCompare) {
        setCompareItems(JSON.parse(storedCompare) as PropertyComparisonItem[]);
      }
    } catch {
      // Ignore invalid localStorage payloads.
    }

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(COMPARISON_STORAGE_KEY, JSON.stringify(compareItems));
  }, [compareItems]);

  const fields = useMemo(
    () =>
      [
        { key: "square_footage", label: t.fieldLabels.square_footage },
        { key: "bedrooms", label: t.fieldLabels.bedrooms },
        { key: "bathrooms", label: t.fieldLabels.bathrooms },
        { key: "year_built", label: t.fieldLabels.year_built },
        { key: "lot_size", label: t.fieldLabels.lot_size },
        { key: "distance_to_city_center", label: t.fieldLabels.distance_to_city_center },
        { key: "school_rating", label: t.fieldLabels.school_rating }
      ] as const,
    [locale]
  );

  const getHistoryCompareId = (item: PredictionHistoryItem) => `history:${item.id}`;

  const historyAverage = history.length
    ? history.reduce((sum, item) => sum + item.predictedPrice, 0) / history.length
    : 0;

  const chartValues = [
    { label: t.current, value: predictedPrice ?? 0, color: "bg-emerald-500" },
    { label: t.historyAvg, value: historyAverage || predictedPrice || 0, color: "bg-sky-500" },
    { label: t.benchmark, value: benchmarkPrice, color: "bg-amber-500" }
  ];

  const chartMax = Math.max(...chartValues.map((item) => item.value), 1);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    clearError();

    const hasEmptyValue = Object.values(form).some((value) => value === "" || value === null);
    if (hasEmptyValue) {
      setError(t.pleaseComplete);
      return;
    }

    const payload = toHousingFeatures(form);
    setLastSubmitted(payload);
    setLoading(true);

    try {
      const result = await predictPropertyPrice(payload);
      const nextPrice = result.predicted_price;
      setPredictedPrice(nextPrice);
      setForm(emptyForm);

      const newHistoryItem: PredictionHistoryItem = {
        id: `${Date.now()}`,
        createdAt: new Date().toISOString(),
        inputs: payload,
        predictedPrice: nextPrice
      };

      setHistory((previous) => [newHistoryItem, ...previous].slice(0, 6));
    } catch (error) {
      const message = error instanceof Error ? error.message : t.predictionFailed;
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  function toggleCompareItem(item: PredictionHistoryItem) {
    const compareId = getHistoryCompareId(item);

    setCompareItems((previous) => {
      const exists = previous.some((candidate) => candidate.id === compareId);

      if (exists) {
        return previous.filter((candidate) => candidate.id !== compareId);
      }

      if (previous.length >= MAX_COMPARE_ITEMS) {
        setError(t.compareLimit.replace("{count}", String(MAX_COMPARE_ITEMS)));
        return previous;
      }

      const compareItem: PropertyComparisonItem = {
        id: compareId,
        label: `${t.history} ${previous.length + 1}`,
        inputs: item.inputs,
        predictedPrice: item.predictedPrice
      };

      return [compareItem, ...previous].slice(0, MAX_COMPARE_ITEMS);
    });
  }

  function handleClearForm() {
    setForm(emptyForm);
    setPredictedPrice(null);
    setLastSubmitted(null);
    clearError();
  }

  return (
    <div className="space-y-6">
      <Card title={t.propertyFormTitle}>
        <form className="grid gap-3 sm:grid-cols-2" onSubmit={onSubmit}>
          {fields.map((field) => (
            <Input
              key={field.key}
              label={field.label}
              name={field.key}
              type="number"
              required
              step="any"
              value={form[field.key]}
              onChange={(event) =>
                setForm((previous) => ({
                  ...previous,
                  [field.key]: event.target.value
                }))
              }
            />
          ))}

          <div className="sm:col-span-2 flex flex-wrap gap-3">
            <Button type="submit">{t.predictPrice}</Button>
            <Button
              type="button"
              className="border border-slate-800 bg-white !text-slate-900 shadow-sm hover:bg-slate-100"
              onClick={handleClearForm}
            >
              {t.clear}
            </Button>
          </div>
        </form>
      </Card>

      {predictedPrice !== null ? (
        <Card title={t.predictionResult}>
          <div className="rounded-md border border-emerald-300 bg-emerald-50 p-4 text-sm text-emerald-900">
            <div className="mb-2 flex items-center justify-between gap-3">
              <span className="font-semibold">{t.predictedPrice}</span>
              <span className="text-lg font-bold">{formatCurrency(predictedPrice, locale)}</span>
            </div>

            <div className="mt-4 flex h-28 items-end gap-3">
              {chartValues.map((item) => (
                <div key={item.label} className="flex flex-1 flex-col items-center gap-2">
                  <div className="flex h-20 w-full items-end justify-center">
                    <div
                      className={`w-full rounded-t-md ${item.color}`}
                      style={{ height: `${Math.max((item.value / chartMax) * 100, 6)}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-medium uppercase tracking-wide text-slate-600">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>

          </div>
        </Card>
      ) : null}

      {lastSubmitted && predictedPrice !== null ? (
        <Card title={t.resultsSummary}>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-600">
                  <th className="py-2 pr-4">{t.field}</th>
                  <th className="py-2 pr-4">{t.value}</th>
                </tr>
              </thead>
              <tbody>
                {fields.map((field) => (
                  <tr key={field.key} className="border-b border-slate-100">
                    <td className="py-2 pr-4 font-medium text-slate-700">{field.label}</td>
                    <td className="py-2 pr-4">{lastSubmitted[field.key]}</td>
                  </tr>
                ))}
                <tr>
                  <td className="py-2 pr-4 font-medium text-slate-700">{t.predictedPrice}</td>
                  <td className="py-2 pr-4 font-semibold text-emerald-700">
                    {formatCurrency(predictedPrice, locale)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>
      ) : null}

      {history.length > 0 ? (
        <Card title={t.recentPredictions}>
          <div className="space-y-3">
            {history.slice(0, 5).map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-3 rounded-md border border-slate-200 bg-slate-50 p-3"
              >
                <div>
                  <div className="text-sm font-medium text-slate-800">
                    {formatCurrency(item.predictedPrice, locale)}
                  </div>
                  <div className="text-xs text-slate-500">
                    {new Date(item.createdAt).toLocaleString(locale === "en" ? "en-US" : "zh-CN")}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    className="border border-slate-800 bg-white !text-slate-900 shadow-sm hover:bg-slate-100"
                    onClick={() => {
                      setForm(
                        Object.fromEntries(
                          Object.keys(emptyForm).map((key) => [
                            key,
                            String(item.inputs[key as keyof HousingFeatures])
                          ])
                        ) as Record<keyof HousingFeatures, string>
                      );
                      setLastSubmitted(item.inputs);
                      setPredictedPrice(item.predictedPrice);
                    }}
                  >
                    {t.use}
                  </Button>
                  <Button
                    type="button"
                    className={
                        compareItems.some((candidate) => candidate.id === getHistoryCompareId(item))
                        ? "bg-emerald-600 text-white hover:bg-emerald-700"
                        : "bg-slate-200 text-slate-800 hover:bg-slate-300"
                    }
                    onClick={() => toggleCompareItem(item)}
                  >
                      {compareItems.some((candidate) => candidate.id === getHistoryCompareId(item))
                      ? t.selected
                      : t.compare}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      ) : null}

      {compareItems.length > 0 ? (
        <Card title={t.propertyComparison}>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-600">
                  <th className="py-2 pr-4">{t.property}</th>
                  <th className="py-2 pr-4">{t.area}</th>
                  <th className="py-2 pr-4">{t.beds}</th>
                  <th className="py-2 pr-4">{t.baths}</th>
                  <th className="py-2 pr-4">{t.school}</th>
                  <th className="py-2 pr-4">{t.distance}</th>
                  <th className="py-2 pr-4">{t.price}</th>
                </tr>
              </thead>
              <tbody>
                {compareItems.map((item) => (
                  <tr key={item.id} className="border-b border-slate-100">
                    <td className="py-2 pr-4 font-medium text-slate-700">{item.label}</td>
                    <td className="py-2 pr-4">{item.inputs.square_footage}</td>
                    <td className="py-2 pr-4">{item.inputs.bedrooms}</td>
                    <td className="py-2 pr-4">{item.inputs.bathrooms}</td>
                    <td className="py-2 pr-4">{item.inputs.school_rating}</td>
                    <td className="py-2 pr-4">{item.inputs.distance_to_city_center}</td>
                    <td className="py-2 pr-4 font-semibold text-emerald-700">
                      {formatCurrency(item.predictedPrice, locale)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : null}
    </div>
  );
}
