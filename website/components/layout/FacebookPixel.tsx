"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const FacebookPixel = ({ pixelId }: { pixelId: string }) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastTrackedUrl = useRef<string | null>(null);
  const [shouldLoad, setShouldLoad] = useState(false);

  // Gate: only inject script after first user interaction
  useEffect(() => {
    const events = ["click", "scroll", "touchstart", "keydown"] as const;

    const handler = () => {
      setShouldLoad(true);
      events.forEach(e => window.removeEventListener(e, handler));
    };

    events.forEach(e =>
      window.addEventListener(e, handler, { passive: true, once: true })
    );

    return () => events.forEach(e => window.removeEventListener(e, handler));
  }, []);

  // Track route changes after pixel is loaded
  useEffect(() => {
    if (!shouldLoad) return;

    const currentUrl = pathname + searchParams.toString();
    if (lastTrackedUrl.current === currentUrl) return;
    lastTrackedUrl.current = currentUrl;

    if (typeof window?.fbq !== "function") return;
    window.fbq("track", "PageView");
  }, [pathname, searchParams, shouldLoad]);

  if (!shouldLoad) return null;

  return (
    <script
      id="fb-pixel"
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
    />
  );
};

export default FacebookPixel;