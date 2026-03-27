import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "@/components/SessionProvider";
import { Toaster } from "@/components/ui/sonner";
import ErrorBoundary from "@/components/ErrorBoundary";
import { OfflineBanner } from "@/components/OfflineBanner";

const cormorant = Cormorant_Garamond({
  subsets: ["cyrillic", "latin"],
  variable: "--font-cormorant",
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  subsets: ["cyrillic", "latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "Roomy — Найди идеального соседа",
    template: "%s | Roomy",
  },
  description: "Подбор соседей по совместимости привычек и образа жизни. Найди соседа мечты через анализ совместимости.",
  keywords: ["соседи", "совместимость", "аренда", "жильё", "roommate", "matching"],
  authors: [{ name: "Roomy Team" }],
  manifest: "/manifest.json",
  openGraph: {
    title: "Roomy — Найди идеального соседа",
    description: "Подбор соседей по совместимости привычек и образа жизни",
    type: "website",
    locale: "ru_RU",
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: "Roomy — Найди идеального соседа",
      },
    ],
    siteName: "Roomy",
  },
  twitter: {
    card: "summary_large_image",
    title: "Roomy — Найди идеального соседа",
    description: "Подбор соседей по совместимости привычек и образа жизни",
    images: ["/og-image.svg"],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className={`${cormorant.variable} ${inter.variable}`}>
      <body className="font-sans antialiased">
        <ErrorBoundary>
          <SessionProvider>
            {children}
            <Toaster />
            <OfflineBanner />
          </SessionProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
