import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/app/providers";
import { HeaderNav } from "@/components/HeaderNav";

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
          <HeaderNav />
          <main className="mx-auto w-full max-w-6xl p-4">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
