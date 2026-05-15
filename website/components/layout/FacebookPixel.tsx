"use client";

import { usePathname, useSearchParams } from "next/navigation";
import Script from "next/script";
import { useEffect, useRef } from "react";

const FacebookPixel = ({ pixelId }: { pixelId: string }) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastTrackedUrl = useRef<string | null>(null); // null = not yet initialized

  useEffect(() => {
    const currentUrl = pathname + searchParams.toString();

    // Skip if same URL
    if (lastTrackedUrl.current === currentUrl) return;

    lastTrackedUrl.current = currentUrl;

    // Wait for fbq to be available
    if (typeof window?.fbq !== "function") return;

    window.fbq("track", "PageView");
  }, [pathname, searchParams]);

  return (
    <>
      <Script
        id="fb-pixel-check"
        strategy="lazyOnload"
        dangerouslySetInnerHTML={{
          __html: `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${pixelId}');
            fbq('track', 'PageView');
          `,
        }}
        onLoad={() => {
          // Mark initial URL as already tracked by the inline fbq('track', 'PageView') above
          lastTrackedUrl.current = window.location.pathname + window.location.search.replace("?", "");
        }}
      />
    </>
  );
};

export default FacebookPixel;