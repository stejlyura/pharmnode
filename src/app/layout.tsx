import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { I18nProvider } from "@/context/I18nContext";
import { ThemeScript } from "@/components/ThemeScript";
import { FeedbackWidget } from "@/components/FeedbackWidget";
import { CookieConsent } from "@/components/CookieConsent";
import { PaddleInit } from "@/components/PaddleInit";
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
      className="h-full antialiased"
      suppressHydrationWarning
    >
      <head>
        <ThemeScript />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col">
        <PaddleInit />
        <AuthProvider>
          <I18nProvider>
            {children}
            <FeedbackWidget />
            <CookieConsent />
          </I18nProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
