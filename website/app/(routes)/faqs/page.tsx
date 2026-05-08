import React from "react";
import FaqItems from "./FaqItems";
import { Metadata } from "next";
import Script from "next/script";

type Props = {};

interface FaqResponse {
  result: Array<FaqItem>;
}

interface FaqItem {
  question: string;
  answer: string;
}

const getFaqs = async () => {
  const response = await fetch(process.env.NEXT_PUBLIC_API_URL + "/faq", {
    cache: "no-cache",
  });
  return response.json();
};

export async function generateMetadata(): Promise<Metadata> {
    const respone = await getFaqs()
    const seoDetails = respone?.result[0]?.seoSection;
    return {
        title: seoDetails?.title || "Knowear",
        description: seoDetails?.description || "Knowear",
        keywords: seoDetails?.keywords || "Knowear",
        openGraph: {
            title: seoDetails?.title || "Knowear",
            description: seoDetails?.description || "Knowear",
            images: seoDetails?.image || "",
        },
        alternates: {
            canonical: seoDetails?.canonical || "https://www.knowear.com/faqs",
        },
        twitter: {
            title: seoDetails.title || "Knowear",
            description: seoDetails.description || "Knowear",
            images: seoDetails.image || "",
            card: seoDetails.xCard || "",
        },
    }
}

const page = async (props: Props) => {
  const faqItems: FaqResponse = await getFaqs();

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqItems.result.map((item) => ({
      "@type": "Question",
      "name": item.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": item.answer
      }
    }))
  };

  return (
    <>
      <Script
        id="faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqSchema)
        }}
      />
      <section className="pt-[26px] sm:pt-6 pb-32">
        <div className="container max-w-full">
          <h1 className="text-xl lg:text-[35px] font-medium md:font-semibold leading-[50.58px]">
            Frequently Asked Question
          </h1>
          <div className="md:mt-2 text-xs lg:text-sm mb-[22px] md:mb-[39px]">
            {/* Did you come here for something in particular or just general
            Riker-bashing? And blowing */}
          </div>
          <div>
            <FaqItems faqItems={faqItems} />
          </div>
        </div>
      </section>
    </>
  );
};

export default page;
