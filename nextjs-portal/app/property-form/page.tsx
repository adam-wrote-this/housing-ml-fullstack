import PropertyFormClient from "@/app/property-form/form-client";

export default function PropertyFormPage() {
  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">Property Price Prediction</h1>
      <p className="text-sm text-slate-600">
        Fill all required fields to get a predicted house price.
      </p>
      <PropertyFormClient />
    </section>
  );
}
