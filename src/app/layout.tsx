import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { I18nProvider } from "@/context/I18nContext";
import { ThemeScript } from "@/components/ThemeScript";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "cyrillic"],
});

export const metadata: Metadata = {
  title: {
    template: '%s | PharmNode',
    default: 'PharmNode - Pharmaceutical Formulation SaaS',
  },
  description: 'Advanced decision support system for pharmaceutical formulations, flowability calculations, and tableting geometry optimization.',
  applicationName: 'PharmNode',
  keywords: ['pharmaceuticals', 'formulation', 'tableting', 'Hausner ratio', 'Carr index', 'SaaS', 'pharmacy', 'chemistry'],
  authors: [{ name: 'PharmNode Team' }],
  creator: 'PharmNode',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://pharmnode.com',
    siteName: 'PharmNode',
    title: 'PharmNode - Pharmaceutical Formulation SaaS',
    description: 'Advanced decision support system for pharmaceutical formulations, flowability calculations, and tableting geometry optimization.',
    images: [
      {
        url: '/opengraph-image.png',
        width: 1200,
        height: 630,
        alt: 'PharmNode Platform Preview',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PharmNode - Pharmaceutical Formulation SaaS',
    description: 'Advanced decision support system for pharmaceutical formulations, flowability calculations, and tableting geometry optimization.',
    images: ['/opengraph-image.png'],
  },
  manifest: '/manifest.json',
  icons: {
    icon: '/icon.png',
    apple: '/apple-icon.png',
  },
};

export const viewport = {
  themeColor: '#05e69f',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <ThemeScript />
      </head>
      <body className="min-h-full flex flex-col">
        <AuthProvider>
          <I18nProvider>
            {children}
          </I18nProvider>
        </AuthProvider>
      </body>
    </html>
  );
}



