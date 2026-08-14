import Link from "next/link";
import { Card } from "@/components/ui/Card";

export default function HomePage() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card title="App1 - Property Prediction">
        <p className="mb-4 text-sm text-slate-700">
          Submit property features and get instant predicted price from the Python backend.
        </p>
        <Link href="/property-form" className="font-medium">
          Open property form
        </Link>
      </Card>
      <Card title="App2 - Market Analysis">
        <p className="mb-4 text-sm text-slate-700">
          Explore market segments and run what-if simulation powered by the Java backend.
        </p>
        <Link href="/market-analysis" className="font-medium">
          Open market analysis
        </Link>
      </Card>
    </div>
  );
}
