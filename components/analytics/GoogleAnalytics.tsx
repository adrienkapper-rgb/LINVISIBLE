'use client';

import Script from 'next/script';

interface GoogleAnalyticsProps {
  measurementId: string;
}

export function GoogleAnalytics({ measurementId }: GoogleAnalyticsProps) {
  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          
          gtag('config', '${measurementId}', {
            page_title: document.title,
            page_location: window.location.href,
          });

          // Enhanced Ecommerce Events
          window.gtag = gtag;
        `}
      </Script>
    </>
  );
}

// Helper functions for e-commerce tracking
export const trackPurchase = (transactionId: string, value: number, items: any[]) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'purchase', {
      transaction_id: transactionId,
      value: value,
      currency: 'EUR',
      items: items.map(item => ({
        item_id: item.id,
        item_name: item.name,
        category: 'Cocktails',
        quantity: item.quantity,
        price: item.price,
      })),
    });
  }
};

export const trackAddToCart = (item: any, quantity: number) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'add_to_cart', {
      currency: 'EUR',
      value: item.price * quantity,
      items: [{
        item_id: item.id,
        item_name: item.name,
        category: 'Cocktails',
        quantity: quantity,
        price: item.price,
      }],
    });
  }
};

export const trackViewItem = (item: any) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'view_item', {
      currency: 'EUR',
      value: item.price,
      items: [{
        item_id: item.id,
        item_name: item.name,
        category: 'Cocktails',
        price: item.price,
      }],
    });
  }
};

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
}