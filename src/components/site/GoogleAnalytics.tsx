import Script from 'next/script';

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

// mdstore.top's own analytics — the marketing site only, never the
// merchant-owned [domain] storefronts (those use the per-store pixel
// configured in the dashboard, see CustomerTracker).
export default function GoogleAnalytics() {
  if (!GA_ID) return null;

  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
      <Script id="ga-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = gtag;
          gtag('js', new Date());
          gtag('config', '${GA_ID}');
        `}
      </Script>
    </>
  );
}
