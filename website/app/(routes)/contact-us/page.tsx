import { endpoints } from "@/app/_constants/endpoints/endpoints";
import ContactForm from "@/app/shared/contact-form/ContactForm";
// import MapPin from "@/public/svgs/MapPin";
import Image from "next/image";
import { MapPin, Search } from "lucide-react";
import Link from "next/link";
import React from "react";

interface OfficeProps {
  location: string;
  title: string;
  address: string;
  countryCode: string;
  mobile: string;
  email: string;
}
interface socialLinksType {
  facebook: string;
  twitter: string;
  instagram: string;
  linkedin: string;
  tiktok: string;
  snapchat: string;
}
type Props = {
  title: string;
  description: string;
  formTitle: string;
  formDescription: string;
  map: string;
  offices: Array<OfficeProps>;
};

// Social media icons
const SocialIcons = {
  whatsapp: "/icons/whatsapp.svg",
  instagram: "/icons/instagram.svg",
  facebook: "/icons/facebook.svg",
  snapchat: "/icons/snap4.svg",
  // twitter: "/icons/twitter.svg",
  tiktok: "/icons/tiktok-svg.svg",
  youtube: "/icons/youtube.svg",
};

const getDetails = async () => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}${endpoints.contactUs}`,
    {
      cache: "no-cache",
    }
  );
  return response.json();
};
const getSocial = async () => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}${endpoints.socialmedia}`,
    {
      cache: "no-cache",
    }
  );
  return response.json();
};

export async function generateMetadata() {
  return {
    title: "Contact Us - KnoWear",
    description: "Get in touch with KnoWear for any inquiries or support.",
    keywords:
      "Contact Us, KnoWear, Support, Customer Service, Contact Information",
    openGraph: {
      title: "Contact Us - KnoWear",
      description: "Get in touch with KnoWear for any inquiries or support.",
      images: "https://knowear.me/_next/static/media/logo.38d4518e.svg",
    },
    alternates: {
      canonical: "https://www.knowear.com/contact-us",
    },
    twitter: {
      title: "Contact Us - KnoWear",
      description: "Get in touch with KnoWear for any inquiries or support.",
      images: "https://knowear.me/_next/static/media/logo.38d4518e.svg",
      card: "summary",
    },
  };
}

const page = async () => {
  const resposne = await getDetails();
  const social = await getSocial();

  const contactDetails: Props = resposne?.result;
  const socialLinks: socialLinksType = social?.result;

  return (
    <section className="pt-6 md:pb-10">
      <div className="container max-w-full">
        <div className="pb-5  border-[#D8D8D8]">
          <h1 className="text-xl font-medium lg:text-2xl lg:font-semibold">
            {contactDetails?.title}
          </h1>
          <div className="md:text-[14px] text-[12px]">
            {contactDetails?.description}
          </div>
        </div>
        <div className="h-[1.5px] md:border-b-[1px] border-b-[0.8px] border-[#D8D8D8] w-full bg-[#D8D8D8]" />
        <div className="pt-[25px] md:pt-10 grid grid-cols-2">
          <div className="lg:pr-10 pr-0 col-span-2 lg:col-span-1">
            <div className="text-lg font-medium lg:font-semibold lg:text-2xl ">
              Our Offices
            </div>
            <div className="mt-[6px] md:mt-[19px] space-y-[20px]">
              {contactDetails?.offices.map(
                (office: OfficeProps, index: number) => (
                  <div
                    key={index}
                    className="flex items-start mt-8 first:mt-0 last:pb-5 md:last:border-b-[1px] last:border-b-[0.8px] last:border-[#D8D8D8] justify-start gap-x-5"
                  >
                    <MapPin />
                    <div>
                      <div className="text-xs text-[#030712] opacity-50 font-normal">
                        {office.location}
                      </div>
                      <div className="text-xl font-medium">{office.title}</div>
                      <div className="mt-2 text-[13px] leading-[18.79px] text-[#4B5563]">
                        {office.address}
                      </div>
                      <div className="mt-[5px] md:mt-[16px]">
                        <Link
                          // href={`tel:${office.countryCode} ${office.mobile}`}
                          href={`tel:+971 4 570 4377`}
                          className="font-semibold"
                        >
                          +971 4 570 4377
                          {/* {office.countryCode} {office.mobile} */}
                        </Link>
                        <div>
                          <Link
                            href={`mailto:${office.email}`}
                            className="text-sm text-[#2563EB]"
                          >
                            {office.email}
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
            <div className="flex flex-col ">
              <div className="flex items-center justify-start gap-x-4 border-b border-[#D8D8D8] lg:border-none pt-5 lg:pt-10 pb-2 lg:pb-4">
                <div className=" py-4 px-8 rounded-lg">
                  <h4 className="font-bold text-sm uppercase mb-3">
                    Follow Us
                  </h4>
                  <div className="flex space-x-3">
                    {Object.entries(SocialIcons).map(([platform, icon]) => {
                      const typedPlatform = platform as keyof socialLinksType;
                      return (
                        <Link
                          key={platform}
                          href={socialLinks?.[typedPlatform] || "#"}
                          className="w-8 h-8 rounded-full border-2 border-black flex items-center justify-center"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Image
                            src={icon}
                            alt={platform}
                            width={20}
                            height={20}
                            className="invert"
                          />
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
              <div className="mt-4 lg:mt-5 h-[210px] md:mb-[0px] mb-[60px]">
                <iframe
                  src={contactDetails?.map}
                  width="600"
                  height="450"
                  className="border-none w-full h-full"
                  loading="lazy"
                ></iframe>
              </div>
            </div>
          </div>
          <div className="col-span-2 mt-6 lg:mt-0 lg:col-span-1">
            <ContactForm
              formTitle={contactDetails?.formTitle}
              formDescription={contactDetails?.formDescription}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default page;
