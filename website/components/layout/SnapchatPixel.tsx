"use client";

import { usePathname } from "next/navigation";
import Script from "next/script";
import { useEffect, useRef } from "react";
import * as snapPixel from "@/config/snapPixel";

const SnapchatPixel = ({ pixelId }: any) => {
  const pathname = usePathname();
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) {
        snapPixel.pageview();
    }
  }, [pathname]);

  return (
    <>
      <Script
        id="snap-pixel"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            (function(e,t,n){if(e.snaptr)return;var a=e.snaptr=function(){
            a.handleRequest?a.handleRequest.apply(a,arguments):a.queue.push(arguments)};
            a.queue=[];var s='script';r=t.createElement(s);r.async=!0;
            r.src=n;var u=t.getElementsByTagName(s)[0];
            u.parentNode.insertBefore(r,u);})(window,document,
            'https://sc-static.net/scevent.min.js');
            snaptr('init', '${pixelId}', {
              'user_email': '__INSERT_USER_EMAIL__'
            });
          `,
        }}
        onLoad={() => {
          initialized.current = true;
        }}
      />

      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          src={`https://sc-static.net/scevent.gif?pid=${pixelId}&ev=PAGE_VIEW&noscript=1`}
          alt=""
        />
      </noscript>
    </>
  );
};

export default SnapchatPixel;
