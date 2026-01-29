import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MRR Calculator - Track Your Monthly Recurring Revenue",
  description: "Track your MRR, calculate ARR, forecast growth, and know when you'll hit your revenue targets. Free SaaS metrics calculator.",
  keywords: ["MRR calculator", "ARR calculator", "SaaS metrics", "revenue tracking", "subscription revenue", "startup metrics"],
  openGraph: {
    title: "MRR Calculator",
    description: "Track your Monthly Recurring Revenue and forecast growth",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MRR Calculator",
    description: "Track your Monthly Recurring Revenue and forecast growth",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
