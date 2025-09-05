import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "sonner";
import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-sans",
  display: 'swap',
});

const playfair = Playfair_Display({ 
  subsets: ["latin"],
  variable: "--font-serif",
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: "L'invisible - Cocktails Artisanaux Bordeaux | Atelier & Éditeur",
    template: "%s | L'invisible - Cocktails Bordeaux"
  },
  description: "Atelier artisanal de cocktails prêts à boire à Bordeaux. Cocktails classiques et signatures créés par des mixologues. Livraison professionnels et particuliers.",
  keywords: [
    'cocktails bordeaux',
    'cocktails artisanaux',
    'cocktails prêts à boire',
    'mixologie bordeaux',
    'atelier cocktails',
    'cocktails professionnels',
    'éditeur cocktails',
    'cocktails signatures'
  ],
  authors: [{ name: "L'invisible" }],
  creator: "L'invisible",
  publisher: "L'invisible",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: 'https://www.cocktails-linvisible.fr',
    title: "L'invisible - Cocktails Artisanaux Bordeaux",
    description: "Atelier artisanal de cocktails prêts à boire à Bordeaux. Cocktails classiques et signatures créés par des mixologues.",
    siteName: "L'invisible",
    images: [{
      url: 'https://rnxhkjvcixumuvjfxdjo.supabase.co/storage/v1/object/public/product-images/hero-image.png',
      width: 1200,
      height: 630,
      alt: "L'invisible - Cocktails artisanaux Bordeaux",
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: "L'invisible - Cocktails Artisanaux Bordeaux",
    description: "Atelier artisanal de cocktails prêts à boire à Bordeaux. Cocktails classiques et signatures créés par des mixologues.",
    images: ['https://rnxhkjvcixumuvjfxdjo.supabase.co/storage/v1/object/public/product-images/hero-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": "https://www.cocktails-linvisible.fr/#organization",
    "name": "L'invisible",
    "alternateName": "L'invisible - Éditeur de cocktails",
    "description": "Atelier artisanal de cocktails prêts à boire à Bordeaux. Cocktails classiques et signatures créés par des mixologues. Livraison Gironde.",
    "url": "https://www.cocktails-linvisible.fr",
    "logo": "https://rnxhkjvcixumuvjfxdjo.supabase.co/storage/v1/object/public/product-images/hero-image.png",
    "image": "https://rnxhkjvcixumuvjfxdjo.supabase.co/storage/v1/object/public/product-images/hero-image.png",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Atelier L'invisible",
      "addressLocality": "Bordeaux",
      "addressRegion": "Nouvelle-Aquitaine",
      "postalCode": "33000",
      "addressCountry": "FR"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 44.837789,
      "longitude": -0.57918
    },
    "areaServed": [
      {
        "@type": "City",
        "name": "Bordeaux"
      },
      {
        "@type": "State", 
        "name": "Gironde"
      },
      {
        "@type": "State",
        "name": "Nouvelle-Aquitaine"
      }
    ],
    "priceRange": "€€",
    "currenciesAccepted": "EUR",
    "paymentAccepted": "Carte bancaire, Virement",
    "openingHours": "Mo-Fr 09:00-17:00",
    "serviceType": "Livraison, Retrait",
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Cocktails Artisanaux",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Product",
            "name": "Cocktails Classiques",
            "category": "Cocktails"
          }
        },
        {
          "@type": "Offer", 
          "itemOffered": {
            "@type": "Product",
            "name": "Cocktails Signatures",
            "category": "Cocktails"
          }
        }
      ]
    },
    "makesOffer": [
      {
        "@type": "Offer",
        "name": "Cocktails pour professionnels",
        "description": "Cocktails prêts à servir pour restaurants et bars"
      },
      {
        "@type": "Offer",
        "name": "Cocktails pour particuliers", 
        "description": "Cocktails artisanaux pour événements privés"
      }
    ],
    "knowsAbout": [
      "Cocktails artisanaux Bordeaux",
      "Mixologie professionnelle", 
      "Cocktails prêts à boire",
      "Atelier cocktails Gironde",
      "Éditeur cocktails signatures"
    ],
    "sameAs": []
  };

  return (
    <html lang="fr">
      <body
        className={`${inter.variable} ${playfair.variable} font-sans antialiased min-h-screen flex flex-col`}
      >
        {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
          <GoogleAnalytics measurementId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID} />
        )}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(localBusinessSchema),
          }}
        />
        <Header />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
        <Toaster />
        <SonnerToaster richColors position="top-right" />
      </body>
    </html>
  );
}
