import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { Jost } from "next/font/google";
import "./globals.css";
// import PreHeader from "./shared/pre-header/PreHeader";
// import Header from "./shared/header/Header";
// import Footer from "./shared/footer/Footer";
// import MobileFooter from "./shared/mobile-footer/MobileFooter";
import ThemeProvider from "@/providers/theme/ThemeProvider";
import { StateProvider } from "@/providers/state/StateProvider";
import { LoadingProvider } from "@/providers/loading/LoadingProvider";
import { Toaster } from "@/components/ui/toaster";
import { cookies } from "next/headers";
import FacebookPixel from "@/components/layout/FacebookPixel";
import { GoogleAnalytics, GoogleTagManager } from "@next/third-parties/google";
import { endpoints } from "./_constants/endpoints/endpoints";
import Script from "next/script";
// import NewFooter from "./shared/footer/NewFooter";
import SnapchatPixel from "@/components/layout/SnapchatPixel";

import PreHeader from "./shared/pre-header/PreHeader";
import Header from "./shared/header/Header";
import NewFooter from "./shared/footer/NewFooter";
import MobileFooter from "./shared/mobile-footer/MobileFooter";
import NavigationLoader from "./shared/navigation-loader/NavigationLoader";

const jost = Jost({
  subsets: ["latin"],
  weight: ["400"], // Single weight for fastest mobile FCP
  display: "swap", // Faster font loading with fallback
  preload: false, // Add preload for mobile performance
  variable: "--font-jost", // CSS variable for faster access
});

const generateMetadata = async (): Promise<Metadata> => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}${endpoints.getSeoDetails}`,
      {
        next: { revalidate: 300 }, // 5 minutes cache for faster repeat visits
      }
    );
    const responseData = await response.json();
    const seoDetails = responseData?.result?.seoSection;
    return {
      title: seoDetails.title,
      description: seoDetails.description,
      keywords: seoDetails.keywords,
      openGraph: {
        title: seoDetails.title,
        description: seoDetails.description,
        images: seoDetails.image,
      },
      alternates: {
        canonical: seoDetails.canonical,
      },
      twitter: {
        title: seoDetails.title,
        description: seoDetails.description,
        images: seoDetails.image,
        card: seoDetails.xCard,
      },
      other: {
        "facebook-domain-verification": "xjptq7oto3rkzfuyrqk8h3efxu8l6g",
        "google-site-verification":
          "qvl4nJYkCTDg2Shho7V_zzAeiZCDa8azmFIP0UIoMkI",
      },
    };
  } catch (error) {
    console.error("Error fetching SEO details:", error);
    return {
      title: "Knowear",
      description: "Knowear",
      other: {
        "facebook-domain-verification": "xjptq7oto3rkzfuyrqk8h3efxu8l6g",
        "google-site-verification":
          "qvl4nJYkCTDg2Shho7V_zzAeiZCDa8azmFIP0UIoMkI",
      },
    };
  }
};

export { generateMetadata as metadata };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const deviceType = cookies().get("deviceType")?.value || "desktop";
  const token = cookies().get("access_token")?.value;
  return (
    <html lang="en">
      <head>
        {process.env.NEXT_PUBLIC_PRODUCTION !== "true" && (
          <meta name="robots" content="noindex,nofollow" />
        )}
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="preconnect" href="https://knowear.s3.ap-south-1.amazonaws.com" />
        <link rel="preconnect" href={process.env.NEXT_PUBLIC_API_URL || ""} />

        {/* DNS prefetch for non-critical third-party resources */}
        <link rel="dns-prefetch" href="//www.googletagmanager.com" />
        <link rel="dns-prefetch" href="//www.google-analytics.com" />
        <link rel="dns-prefetch" href="//connect.facebook.net" />
        <link rel="dns-prefetch" href="//sc-static.net" />
        <link rel="dns-prefetch" href="//www.clarity.ms" />

        {/* Critical CSS inlining - ultra minimal for fastest mobile rendering */}
        <style dangerouslySetInnerHTML={{
          __html: `
            body { font-family: 'Jost', sans-serif; margin: 0; padding: 0; line-height: 1.5; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
            img { max-width: 100%; height: auto; }
            .animate-pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
            @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: .5; } }
            .bg-gray-200 { background-color: #f3f4f6; }
            .rounded-lg { border-radius: 0.5rem; }
            .mb-4 { margin-bottom: 1rem; }
            .h-64 { height: 16rem; }
            .h-8 { height: 2rem; }
            .w-full { width: 100%; }
            /* Mobile-specific optimizations */
            @media (max-width: 768px) {
              body { font-size: 16px; }
              img { transform: translateZ(0); backface-visibility: hidden; }
            }
          `
        }} />
        
        {/* Google Tag Manager - deferred so it does not block initial render */}
        <Script id="google-tag-manager" strategy="afterInteractive">
          {`
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-KJVWHD6H');
          `}
        </Script>

        {/* Combined JSON-LD (Organization + LocalBusiness + WebSite) for smaller HTML */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "Organization",
                  name: "KnoWear",
                  url: process.env.NEXT_PUBLIC_BASE_URL,
                  logo: "https://knowear.me/_next/static/media/logo.38d4518e.svg",
                  sameAs: [
                    "https://www.facebook.com/KnoWear.Dubai",
                    "https://www.instagram.com/knowear.me/",
                  ],
                },
                {
                  "@type": "LocalBusiness",
                  name: "KnoWear",
                  image: "https://knowear.me/_next/static/media/logo.38d4518e.svg",
                  "@id": "",
                  url: process.env.NEXT_PUBLIC_BASE_URL,
                  telephone: "+971 1529725961",
                  address: {
                    "@type": "PostalAddress",
                    streetAddress:
                      "The Light Commercial Tower, 16, 5 street - 3 Hadaeq Mohammed Bin Rashid - Arjan - Al Barsha South",
                    addressLocality: "Dubai",
                    postalCode: "",
                    addressCountry: "AE",
                  },
                  geo: {
                    "@type": "GeoCoordinates",
                    latitude: 25.065615,
                    longitude: 55.245638,
                  },
                },
                {
                  "@type": "WebSite",
                  name: "KnoWear",
                  url: process.env.NEXT_PUBLIC_BASE_URL,
                  potentialAction: {
                    "@type": "SearchAction",
                    target:
                      process.env.NEXT_PUBLIC_BASE_URL +
                      "search?q{search_term_string}",
                    "query-input": "required name=search_term_string",
                  },
                },
              ],
            }),
          }}
        />
      </head>
      <body className={`${jost.className} ${jost.variable}`}>
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-KJVWHD6H"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        <ThemeProvider>
          <LoadingProvider>
            <StateProvider>
              <NavigationLoader />
              <PreHeader />
              <Header deviceType={deviceType} />
              {children}
              <NewFooter />
              {/* <Footer /> */}
              <MobileFooter token={token} />
              <Toaster />
            </StateProvider>
          </LoadingProvider>
        </ThemeProvider>
        <FacebookPixel pixelId={"1117831269406176"} />
        {/* <FacebookPixel pixelId={"747766534636930"} /> */}
        <SnapchatPixel pixelId={"a5dde0a6-5c80-4b58-9f37-3de8810c4a2b"} />        
        {/* Microsoft Clarity Tracking Script - Deferred for 90+ Lighthouse score */}
        <Script id="clarity-script" strategy="lazyOnload">
          {`
            (function(c,l,a,r,i,t,y){
              c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
              t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
              y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "rphweclm8a");
          `}
        </Script>
      </body>
      {/* Google Analytics - Deferred for 90+ Lighthouse score */}
      <GoogleAnalytics gaId={"G-JC8K33G6JR"} />
    </html>
  );
}
