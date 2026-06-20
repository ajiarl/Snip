import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { Geist } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import Script from "next/script";
import "./globals.css";

const geist = Geist({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-geist",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://snip.to"),
  title: "SNIP - Link Management",
  description: "Platform manajemen link berperforma tinggi untuk tim engineering modern. Perpendek, bagikan, dan lacak URL dengan aman.",
  keywords: ["link shortener", "url shortener", "perpendek link", "snip", "link management", "short url"],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "SNIP - Link Management",
    description: "Platform manajemen link berperforma tinggi untuk tim engineering modern. Perpendek, bagikan, dan lacak URL dengan aman.",
    url: "/",
    siteName: "SNIP",
    locale: "id_ID",
    type: "website",
    images: ["/og-image.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "SNIP - Link Management",
    description: "Platform manajemen link berperforma tinggi untuk tim engineering modern.",
    images: ["/og-image.png"],
  },
  verification: {
    google: process.env.GOOGLE_VERIFICATION_TOKEN,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${geist.variable}`}>
      <body className="font-sans bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
          <Toaster position="top-right" />
          <Analytics />
          <Script
            defer
            src="https://static.cloudflareinsights.com/beacon.min.js"
            data-cf-beacon='{"token": "69b71269522248e6987d2797d08ef6bd"}'
            strategy="afterInteractive"
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
