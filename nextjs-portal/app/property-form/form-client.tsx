"use client";

import { useMemo, useState } from "react";
import { useAppUi } from "@/components/AppUiProvider";
import { predictPropertyPrice } from "@/lib/api/pythonApi";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { translations } from "@/lib/i18n";
import type { HousingFeatures } from "@/lib/types";

const initialForm: HousingFeatures = {
  square_footage: 1850,
  bedrooms: 3,
  bathrooms: 2,
  year_built: 1998,
  lot_size: 7500,
  distance_to_city_center: 5.6,
  school_rating: 8.2
};

export default function PropertyFormClient() {
  const [form, setForm] = useState<HousingFeatures>(initialForm);
  const [predictedPrice, setPredictedPrice] = useState<number | null>(null);
  const { locale, setLoading, setError, clearError } = useAppUi();
  const t = translations[locale];

  const fields = useMemo(
    () =>
      [
        { key: "square_footage", label: locale === "en" ? "Square Footage" : "建筑面积" },
        { key: "bedrooms", label: locale === "en" ? "Bedrooms" : "卧室数" },
        { key: "bathrooms", label: locale === "en" ? "Bathrooms" : "浴室数" },
        { key: "year_built", label: locale === "en" ? "Year Built" : "建成年份" },
        { key: "lot_size", label: locale === "en" ? "Lot Size" : "地块面积" },
        { key: "distance_to_city_center", label: locale === "en" ? "Distance To City Center" : "到市中心距离" },
        { key: "school_rating", label: locale === "en" ? "School Rating" : "学校评级" }
      ] as const,
    [locale]
  );

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    clearError();
    setLoading(true);
    try {
      const result = await predictPropertyPrice(form);
      setPredictedPrice(result.predicted_price);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Prediction failed";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
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
                [field.key]: Number(event.target.value)
              }))
            }
          />
        ))}
        <div className="sm:col-span-2">
          <Button type="submit">{t.predictPrice}</Button>
        </div>
      </form>

      {predictedPrice !== null ? (
        <div className="mt-4 rounded-md border border-emerald-300 bg-emerald-50 p-3 text-sm text-emerald-900">
          {t.predictedPrice}:{" "}
          <span className="font-semibold">
            {new Intl.NumberFormat(locale === "en" ? "en-US" : "zh-CN", {
              style: "currency",
              currency: "USD",
              maximumFractionDigits: 2
            }).format(predictedPrice)}
          </span>
        </div>
      ) : null}
    </Card>
  );
}
