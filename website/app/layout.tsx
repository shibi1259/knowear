import type { Metadata } from "next";
import { Jost } from "next/font/google";
import "./globals.css";
import PreHeader from "./shared/pre-header/PreHeader";
import Header from "./shared/header/Header";
import Footer from "./shared/footer/Footer";
import MobileFooter from "./shared/mobile-footer/MobileFooter";
import ThemeProvider from "@/providers/theme/ThemeProvider";
import { StateProvider } from "@/providers/state/StateProvider";
import { Toaster } from "@/components/ui/toaster";
import { cookies } from "next/headers";
import FacebookPixel from "@/components/layout/FacebookPixel";
import { GoogleAnalytics, GoogleTagManager } from "@next/third-parties/google";
import { endpoints } from "./_constants/endpoints/endpoints";
import Script from "next/script";
import NewFooter from "./shared/footer/NewFooter";
import SnapchatPixel from "@/components/layout/SnapchatPixel";

const jost = Jost({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const generateMetadata = async (): Promise<Metadata> => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}${endpoints.getSeoDetails}`,
      {
        next: { revalidate: 0 },
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
        <Script id="google-tag-manager" strategy="afterInteractive">
          {`
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-KJVWHD6H');
          `}
        </Script>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "KnoWear",
              url: process.env.NEXT_PUBLIC_BASE_URL,
              logo: "https://knowear.me/_next/static/media/logo.38d4518e.svg",
              sameAs: [
                "https://www.facebook.com/KnoWear.Dubai",
                "https://www.instagram.com/knowear.me/",
              ],
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
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
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org/",
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
            }),
          }}
        />        
      </head>
      <body className={`${jost.className}`}>
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-KJVWHD6H"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        <ThemeProvider>
          <StateProvider>
            <PreHeader />
            <Header deviceType={deviceType} />
            {children}
            <NewFooter />
            {/* <Footer /> */}
            <MobileFooter token={token} />
            <Toaster />
          </StateProvider>
        </ThemeProvider>
        <FacebookPixel pixelId={"1117831269406176"} />
        {/* <FacebookPixel pixelId={"747766534636930"} /> */}
        <SnapchatPixel pixelId={"a5dde0a6-5c80-4b58-9f37-3de8810c4a2b"} />
        {/* Microsoft Clarity Tracking Script */}
        <Script id="clarity-script" strategy="afterInteractive">
          {`
            (function(c,l,a,r,i,t,y){
              c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
              t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
              y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "rphweclm8a");
          `}
        </Script>
      </body>
      <GoogleAnalytics gaId={"G-JC8K33G6JR"} />
    </html>
  );
}
