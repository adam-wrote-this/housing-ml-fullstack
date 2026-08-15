"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { useAppUi } from "@/components/AppUiProvider";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { runWhatIfSimulation } from "@/lib/api/javaApi";
import type { Translation } from "@/lib/i18n";
import type { WhatIfRequest, WhatIfResponse } from "@/lib/types";

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

type WhatIfPanelProps = {
  translation: Translation;
  formatCurrency: (value: number) => string;
};

export function WhatIfPanel({ translation: t, formatCurrency }: WhatIfPanelProps) {
  const [simulation, setSimulation] = useState<WhatIfRequest>(initialSimulation);
  const [result, setResult] = useState<WhatIfResponse | null>(null);
  const { setLoading, setError, clearError } = useAppUi();

  async function runSimulation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    clearError();
    setLoading(true);
    try {
      setResult(await runWhatIfSimulation(simulation));
    } catch (error) {
      setError(error instanceof Error ? error.message : t.simulationFailed);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card title={t.whatIfTitle}>
      <form className="space-y-3" onSubmit={runSimulation}>
        <Input
          label={t.fieldLabels.square_footage}
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
        <p className="text-xs text-slate-600">{t.current}: {simulation.squareFootage} sqft</p>
        <div className="grid grid-cols-2 gap-2">
          <Input
            label={t.baselineSquareFootage}
            type="number"
            value={simulation.baselineSquareFootage}
            onChange={(event) =>
              setSimulation((previous) => ({
                ...previous,
                baselineSquareFootage: Number(event.target.value)
              }))
            }
          />
          <Input
            label={t.fieldLabels.bedrooms}
            type="number"
            value={simulation.bedrooms}
            onChange={(event) =>
              setSimulation((previous) => ({ ...previous, bedrooms: Number(event.target.value) }))
            }
          />
          <Input
            label={t.fieldLabels.bathrooms}
            type="number"
            step="0.5"
            value={simulation.bathrooms}
            onChange={(event) =>
              setSimulation((previous) => ({ ...previous, bathrooms: Number(event.target.value) }))
            }
          />
          <Input
            label={t.fieldLabels.year_built}
            type="number"
            value={simulation.yearBuilt}
            onChange={(event) =>
              setSimulation((previous) => ({ ...previous, yearBuilt: Number(event.target.value) }))
            }
          />
          <Input
            label={t.fieldLabels.lot_size}
            type="number"
            value={simulation.lotSize}
            onChange={(event) =>
              setSimulation((previous) => ({ ...previous, lotSize: Number(event.target.value) }))
            }
          />
          <Input
            label={t.fieldLabels.distance_to_city_center}
            type="number"
            step="0.1"
            value={simulation.distanceToCityCenter}
            onChange={(event) =>
              setSimulation((previous) => ({
                ...previous,
                distanceToCityCenter: Number(event.target.value)
              }))
            }
          />
          <Input
            label={t.fieldLabels.school_rating}
            type="number"
            step="0.1"
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
      {result ? (
        <div className="mt-4 grid grid-cols-1 gap-2 rounded-md bg-brand-50 p-3 text-sm sm:grid-cols-3">
          <p>{t.predicted}<strong className="block">{formatCurrency(result.predictedPrice)}</strong></p>
          <p>{t.baseline}<strong className="block">{formatCurrency(result.baselinePrice ?? 0)}</strong></p>
          <p>{t.difference}<strong className="block">{formatCurrency(result.priceDifference ?? 0)}</strong></p>
        </div>
      ) : null}
    </Card>
  );
}
