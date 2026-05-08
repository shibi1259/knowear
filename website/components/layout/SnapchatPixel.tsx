"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import * as snapPixel from "@/config/snapPixel";

const SnapchatPixel = ({ pixelId }: { pixelId: string }) => {
  const pathname = usePathname();
  const initialized = useRef(false);
  const [shouldLoad, setShouldLoad] = useState(false);

  // Gate: only inject after first user interaction
  useEffect(() => {
    const events = ["click", "scroll", "touchstart"] as const;

    const handler = () => {
      setShouldLoad(true);
      events.forEach(e => window.removeEventListener(e, handler));
    };

    events.forEach(e =>
      window.addEventListener(e, handler, { passive: true, once: true })
    );

    return () => events.forEach(e => window.removeEventListener(e, handler));
  }, []);

  // Track route changes after init
  useEffect(() => {
    if (!initialized.current) return;
    snapPixel.pageview();
  }, [pathname]);

  if (!shouldLoad) return null;

  return (
    <script
      id="snap-pixel"
      dangerouslySetInnerHTML={{
        __html: `
          (function(e,t,n){if(e.snaptr)return;var a=e.snaptr=function(){
          a.handleRequest?a.handleRequest.apply(a,arguments):a.queue.push(arguments)};
          a.queue=[];var s='script';r=t.createElement(s);r.async=!0;
          r.src=n;var u=t.getElementsByTagName(s)[0];
          u.parentNode.insertBefore(r,u);})(window,document,
          'https://sc-static.net/scevent.min.js');
          snaptr('init', '${pixelId}');
          snaptr('track', 'PAGE_VIEW');
          window.__snapInitialized = true;
        `,
      }}
    />
  );
};

export default SnapchatPixel;