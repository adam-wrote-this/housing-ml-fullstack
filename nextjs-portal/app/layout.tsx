import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import Providers from "@/app/providers";

export const metadata: Metadata = {
  title: "Housing ML Portal",
  description: "Unified portal for property prediction and market analysis"
};

export default function RootLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <header className="border-b border-slate-200 bg-white">
            <nav className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3">
              <Link href="/" className="text-base font-semibold text-slate-900">
                Housing ML Portal
              </Link>
              <div className="flex items-center gap-4 text-sm">
                <Link href="/property-form">Property Form</Link>
                <Link href="/market-analysis">Market Analysis</Link>
              </div>
            </nav>
          </header>
          <main className="mx-auto w-full max-w-6xl p-4">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
