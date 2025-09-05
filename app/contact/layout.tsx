import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Contact - L'invisible Bordeaux",
  description: "Contactez L'invisible, atelier artisanal de cocktails à Bordeaux. Projets sur mesure, cocktails personnalisés, livraison Gironde. Réponse rapide garantie.",
  keywords: [
    'contact cocktails bordeaux',
    'atelier cocktails bordeaux', 
    'cocktails sur mesure bordeaux',
    'mixologie bordeaux',
    'événement cocktails gironde',
    'cocktails professionnels bordeaux'
  ],
  openGraph: {
    title: "Contactez L'invisible - Atelier Cocktails Bordeaux",
    description: "Projets sur mesure, événements, cocktails personnalisés. Notre atelier bordelais répond à tous vos besoins en mixologie.",
    type: 'website',
    url: 'https://www.cocktails-linvisible.fr/contact',
  },
  alternates: {
    canonical: 'https://www.cocktails-linvisible.fr/contact',
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const contactPageSchema = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    "name": "Contact - L'invisible",
    "description": "Page de contact pour L'invisible, atelier artisanal de cocktails à Bordeaux",
    "url": "https://www.cocktails-linvisible.fr/contact",
    "mainEntity": {
      "@type": "LocalBusiness",
      "name": "L'invisible",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Bordeaux",
        "addressRegion": "Nouvelle-Aquitaine",
        "addressCountry": "FR",
        "postalCode": "33000"
      },
      "contactPoint": {
        "@type": "ContactPoint",
        "contactType": "Customer Service",
        "areaServed": "FR",
        "availableLanguage": "French"
      },
      "openingHours": "Mo-Fr 09:00-17:00",
      "serviceArea": {
        "@type": "GeoCircle",
        "geoMidpoint": {
          "@type": "GeoCoordinates", 
          "latitude": 44.837789,
          "longitude": -0.57918
        },
        "geoRadius": "50000"
      }
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(contactPageSchema),
        }}
      />
      {children}
    </>
  );
}