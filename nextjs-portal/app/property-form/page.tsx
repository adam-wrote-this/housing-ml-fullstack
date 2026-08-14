"use client";

import PropertyFormClient from "@/app/property-form/form-client";
import { useAppUi } from "@/components/AppUiProvider";
import { translations } from "@/lib/i18n";

export default function PropertyFormPage() {
  const { locale } = useAppUi();
  const t = translations[locale];

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">{t.propertyPageTitle}</h1>
      <p className="text-sm text-slate-600">{t.propertyPageIntro}</p>
      <PropertyFormClient />
    </section>
  );
}
