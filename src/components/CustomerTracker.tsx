'use client';

import React from 'react';
import Script from 'next/script';

interface Pixel {
  id: string;
  type: 'facebook' | 'tiktok' | 'google' | 'snapchat';
  pixelId: string;
  isActive: boolean;
  events?: string[];
}

interface CustomerTrackerProps {
  pixels: Pixel[];
}

const CustomerTracker = ({ pixels }: CustomerTrackerProps) => {
  if (!pixels || pixels.length === 0) return null;

  return (
    <>
      {pixels.map((pixel) => {
        if (!pixel.isActive) return null;

        switch (pixel.type) {
          case 'facebook':
            return (
              <React.Fragment key={pixel.id}>
                <Script id={`fb-pixel-${pixel.id}`} strategy="afterInteractive">
                  {`
                    !function(f,b,e,v,n,t,s)
                    {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                    n.queue=[];t=b.createElement(e);t.async=!0;
                    t.src=v;s=b.getElementsByTagName(e)[0];
                    s.parentNode.insertBefore(t,s)}(window, document,'script',
                    'https://connect.facebook.net/en_US/fbevents.js');
                    fbq('init', '${pixel.pixelId}');
                    fbq('track', 'PageView');
                    ${pixel.events?.includes('ViewContent') ? "fbq('track', 'ViewContent');" : ""}
                  `}
                </Script>
                <noscript>
                  <img
                    height="1"
                    width="1"
                    style={{ display: 'none' }}
                    src={`https://www.facebook.com/tr?id=${pixel.pixelId}&ev=PageView&noscript=1`}
                  />
                </noscript>
              </React.Fragment>
            );

          case 'tiktok':
            return (
              <Script key={pixel.id} id={`tt-pixel-${pixel.id}`} strategy="afterInteractive">
                {`
                  !function (w, d, t) {
                    w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};
                    if ('${pixel.pixelId}' && '${pixel.pixelId}' !== 'undefined') {
                      ttq.load('${pixel.pixelId}');
                      ttq.page();
                    }
                  }(window, document, 'ttq');
                `}
              </Script>
            );

          default:
            return null;
        }
      })}
    </>
  );
};

export default CustomerTracker;