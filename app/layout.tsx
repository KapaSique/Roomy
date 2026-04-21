import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "@/components/SessionProvider";
import { Toaster } from "@/components/ui/sonner";
import ErrorBoundary from "@/components/ErrorBoundary";
import { OfflineBanner } from "@/components/OfflineBanner";

const inter = Inter({
  subsets: ["cyrillic", "latin"],
  variable: "--font-inter",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["cyrillic", "latin"],
  variable: "--font-display",
  weight: ["500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXTAUTH_URL ?? "https://roomy.live"),
  title: {
    default: "Roomy — Найди соседа, с которым уживёшься",
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
    <html lang="ru" className={`${inter.variable} ${manrope.variable}`}>
      <body className="font-sans antialiased selection:bg-primary/20">
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
