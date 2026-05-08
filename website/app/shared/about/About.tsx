"use client";
import { useCounter } from "@/hooks/useCounter";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import { useSearchParams } from "next/navigation";
import api from "@/config/api.interceptor";
import { endpoints } from "@/app/_constants/endpoints/endpoints";

type Props = {};

const About = (props: Props) => {
  const { ref, inView } = useInView();
  const [inViewCounter, setInViewCounter] = useState(false);
  const [customer, setCustomer] = useState(0);
  const [employee, setEmployee] = useState(0);
  const [nation, setNation] = useState(0);

  const searchParams = useSearchParams();
  const [paragraph1, setParagraph1] = useState("");
  const [paragraph2, setParagraph2] = useState("");  
  const [paragraph3, setParagraph3] = useState("");
  
  const [aboutData, setAboutData] = useState<any>(null);

  useEffect(() => {
    if (inView) {
      setInViewCounter(true);
    }
    // eslint-disable-next-line
  }, [inView]);

  useEffect(() => {
    // Check for the scroll parameter
    const section = searchParams.get("section");
    if (section === "key-figures") {
      // Find the element and scroll to it
      const keyFiguresSection = document.getElementById("key-figures");
      if (keyFiguresSection) {
        keyFiguresSection.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [searchParams]);

  function addCommasToNumber(num: number) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }
  
  const getAboutData = () => {
    api.post(endpoints.getAbout).then((res) => {
      console.log(res?.data?.errorCode,"response from the api about us")
      if (res?.data?.errorCode === 0) {
        console.log("About Data result", res?.data?.result);
        setAboutData(res?.data?.result);
        setCustomer(res?.data?.result?.counters[0]?.value);
        setEmployee(res?.data?.result?.counters[1]?.value);
        setNation(res?.data?.result?.counters[2]?.value);

        // Split paragraph into three parts here
        if (res?.data?.result?.section1?.paragraph) {
          const fullParagraph = res?.data?.result?.section1?.paragraph;
          const words = fullParagraph.split(' ');
          console.log(words,)
          // Calculate word counts for each section (approximately 200 words each)
          const firstSectionEnd = Math.min(50, words.length);
          const secondSectionEnd = Math.min(100, words.length);
          
          // Create the three paragraph sections
          setParagraph1(words.slice(0, firstSectionEnd).join(' '));
          setParagraph2(words.slice(firstSectionEnd, secondSectionEnd).join(' '));
          setParagraph3(words.slice(secondSectionEnd).join(' '));
          console.log("Paragraph 1:", words.slice(0, firstSectionEnd).join(' '));
          console.log("Paragraph 2:", words.slice(firstSectionEnd, secondSectionEnd).join(' '));
          console.log("Paragraph 3:", words.slice(secondSectionEnd).join(' '));
        }
      }
    })
  };

  useEffect(() => {
    // Call the API when component mounts
    getAboutData();
  }, []);

  return (
    <main>
      {/* Header Section */}
      <section className="mt-6 md:mt-8 mx-auto max-w-screen-2xl px-4 md:px-8">
        <div className="container max-w-full">
          <div className="pb-5 md:pb-8">
            <h1 className="font-semibold text-xl md:text-3xl">KnoWear</h1>
            <p className="text-xs md:text-sm font-normal pt-2">
              Empower the World with Style
            </p>
          </div>
          
          {/* Mission Statement Section */}
          <div className="mb-8">
            {/* <h3 className="font-medium text-lg md:text-2xl mb-4">{aboutData?.section1?.heading}</h3> */}
            <h3 className="font-jost font-medium text-base leading-none tracking-normal align-middle capitalize mb-4 md:text-2xl">
  {aboutData?.section1?.heading}
</h3>
            {/* <div className="lg:hidden">
              <img 
                src={`https://knowearcommerce.s3.ap-south-1.amazonaws.com/${aboutData?.section1?.mobileBanner1}`} 
                alt="Women's Collection Mobile"
                className="w-full"
              />
              <div className="bg-gray-100 py-6 text-center">
                <Link
                  href={aboutData?.section1?.button1?.link || "#"}
                  className="bg-white inline-block px-10 py-3 text-base font-medium text-black"
                >
                  {aboutData?.section1?.button1?.label || "Shop Women"}
                </Link>
              </div>
            </div> */}

<div className="lg:hidden relative">
  <img
    src={`https://knowearcommerce.s3.ap-south-1.amazonaws.com/${aboutData?.section1?.mobileBanner1}`}
    alt="Women's Collection Mobile"
    className="w-full"
  />
  <div className="absolute bottom-6 left-0 right-0 text-center">
    <Link
      href={aboutData?.section1?.button1?.link || "#"}
      className="border border-white bg-[#00000080] inline-block px-10 py-3 text-base font-medium text-white"
    >
      {aboutData?.section1?.button1?.label || "Shop Women"}
    </Link>
  </div>
</div>
            {/* Not showing the full paragraph here anymore since we're splitting it */}
          </div>
        </div>
      </section>

      {/* Fashion Categories Section */}
      <section className="mx-auto max-w-screen-2xl px-4 md:px-8 mb-12">
        <div className="container max-w-full">
          {/* First Paragraph - Before Banner 1 */}
          {paragraph1 && (
            <div className="mb-6">
              <p className="text-sm leading-relaxed">
                {paragraph1}
              </p>
            </div>
          )}

          {/* Women Shopping Image - Banner 1 */}
          <div className="mb-8">
            {/* Mobile Banner */}
          
            {/* Desktop Banner */}
            <div className="hidden lg:block relative">
              <img 
                src={`https://knowearcommerce.s3.ap-south-1.amazonaws.com/${aboutData?.section1?.banner1}`} 
                alt="Women's Collection Desktop"
                className="w-full"
              />
              <div className="absolute bottom-8 left-0 right-0 flex justify-center">
                {/* <Link
                  href={aboutData?.section1?.button1?.link || "#"}
                  className="border border-white inline-block px-10 py-3 text-base font-medium text-white"
                >
                  {aboutData?.section1?.button1?.label || "Shop Women"}
                </Link> */}
                <Link 
  href={aboutData?.section1?.button1?.link || "#"} 
  className="border border-white inline-block px-10 py-3 text-base font-medium text-white bg-[#00000080]"
>
  {aboutData?.section1?.button1?.label || "Shop Women"}
</Link>
              </div>
            </div>

            {/* Second Paragraph - After Banner 1 */}
            {paragraph2 && (
              <div className="mt-6 mb-8">
                <p className="text-sm leading-relaxed">
                  {paragraph2}
                </p>
              </div>
            )}
          </div>

          {/* Accessories Image - Banner 2 */}
          <div className="mb-12">
            {/* Mobile / Tablet Banner */}
       

            {/* Desktop Banner */}
            <div className="hidden lg:block relative">
              <img 
                src={`https://knowearcommerce.s3.ap-south-1.amazonaws.com/${aboutData?.section1?.banner2}`}
                alt="Accessories Desktop Banner"
                className="w-full"
              />
              <div className="absolute bottom-8 left-0 right-0 flex justify-center">
                <Link
                  href={aboutData?.section1?.button2?.link || "#"}
                  className="border border-white inline-block px-10 py-3 text-base font-medium text-white bg-[#00000080]"
                >
                  {aboutData?.section1?.button2?.label || "Shop Accessories"}
                </Link>
              </div>
            </div>

            {/* Third Paragraph - After Banner 2 */}
            {paragraph3 && (
              <div className="mt-6 mb-8">
                <p className="text-sm leading-relaxed">
                  {paragraph3}
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
      
      {/* Hero Banner Section */}
      <section className="mx-auto max-w-screen-2xl px-4 md:px-8 mb-12">
  {/* Category heading and mission statement section */}
  <div className="container max-w-full mb-8">
  <h3 className="text-sm uppercase tracking-wider text-gray-600 mb-2 text-center sm:text-left">
  KNOWEAR CATEGORIES
</h3>
    {/* <h2 className="text-3xl font-bold align-ce mb-4"> {aboutData?.section2?.heading}</h2> */}
    <h2 className="font-jost font-medium text-xl leading-none tracking-normal align-middle mb-4 lg:text-3xl lg:font-bold"> 
  {aboutData?.section2?.heading}
</h2>
    {/* <div className="lg:hidden">
              <img 
                src={`https://knowearcommerce.s3.ap-south-1.amazonaws.com/${aboutData?.section2?.mobileBanner2}`}
                alt="Accessories Mobile Banner"
                className="w-full"
              />
              <div className="bg-gray-100 py-6 text-center">
                <Link
                  href={aboutData?.section1?.button2?.link || "#"}
                  className="bg-white inline-block px-10 py-3 text-base font-medium text-black"
                >
                  {aboutData?.section1?.button2?.label || "Shop Accessories"}
                </Link>
              </div>
            </div> */}
            <div className="lg:hidden relative">
  <img
    src={`https://knowearcommerce.s3.ap-south-1.amazonaws.com/${aboutData?.section2?.mobileBanner2}`}
    alt="Accessories Mobile Banner"
    className="w-full"
  />
  <div className="absolute inset-x-0 bottom-8 text-center">
    <Link
      href={aboutData?.section1?.button2?.link || "#"}
      className="border border-white bg-[#00000080] inline-block px-10 py-3 text-base font-medium text-white"
    >
      {aboutData?.section1?.button2?.label || "Shop Accessories"}
    </Link>
  </div>
</div>
    <p className="mb-4">
      {aboutData?.section2?.paragraph}
    </p>
    
    
  </div>

  <div className="container max-w-full">
    <div className="relative">
      {/* Desktop Banner Image (hidden on mobile) */}
      <img
        src={`https://knowearcommerce.s3.ap-south-1.amazonaws.com/${aboutData?.section2?.banner}`}
        className="w-full hidden md:block"
        alt="Woman in athletic wear - desktop"
      />
      
      {/* Mobile Banner Image (hidden on desktop) */}
      <img
        src={`https://knowearcommerce.s3.ap-south-1.amazonaws.com/${aboutData?.section3?.mobileBanner3}`}
        className="w-full block md:hidden"
        alt="Woman in athletic wear - mobile"
      />
      
      {/* Text and Button positioned over the banner - left aligned */}
      <div className="absolute bottom-8 left-8 md:left-12 flex flex-col items-start lg:pb-[197px] lg:pt-[52px]">
      <p className="font-jost font-normal text-base leading-none tracking-normal align-middle text-white mb-1 md:text-2xl">
  {aboutData?.section2?.bannerDescription}
</p>
<h4 className="font-jost font-medium text-[25px] !leading-[125%] tracking-normal align-middle text-white max-w-sm md:text-4xl lg:text-[50px]">
  {aboutData?.section2?.bannerHeading}
</h4>

        <Link
          href={aboutData?.section2?.button?.link || "#"}
          className="bg-white inline-block px-8 py-3 text-base font-medium text-black mt-4 md:mt-6"
        >
          {aboutData?.section2?.button?.label || "Shop Now"}
        </Link>
      </div>
    </div>
  </div>
</section>
      {/* Key Figures Section */}
      <section
        id="key-figures"
        className="mt-12 mx-auto max-w-screen-2xl px-4 md:px-8"
      >
        <div className="container max-w-full">
        <h4 className="font-medium text-xl md:text-2xl text-black mb-4 text-left md:text-center">
  {aboutData?.section3?.heading}
</h4>

          <p className="text-sm md:text-base  md:text-2xl text-black mb-4 text-left md:text-center">
            {aboutData?.section3?.paragraph}
          </p>
        
          {/* Stats Counter Section */}
          <div
            ref={ref}
            className="mb-16 flex flex-col md:flex-row md:justify-evenly text-center md:text-left"
          >
            <div className="flex flex-col items-center  md:w-1/3">
              <h5 className="text-2xl md:text-3xl text-black font-semibold md:mb-4">
                {addCommasToNumber(customer)}
              </h5>
              <p className="text-xs md:text-sm max-w-[150px] md:max-w-none md:mb-4 text-black md:pl-4">
                {aboutData?.counters[0]?.label}
              </p>
            </div>
            <div className="flex flex-col items-center  md:w-1/3">
              <h5 className="text-2xl md:text-3xl text-black font-semibold md:mb-4">
                {addCommasToNumber(employee)}
              </h5>
              <p className="text-xs md:text-sm max-w-[150px] md:max-w-none md:mb-4 text-black md:pl-4">
                {aboutData?.counters[1]?.label}
              </p>
            </div>
            <div className="flex flex-col items-center  md:w-1/3">
              <h5 className="text-2xl md:text-3xl text-black font-semibold md:mb-4">
                {addCommasToNumber(nation)}
              </h5>
              <p className="text-xs md:text-sm max-w-[150px] md:max-w-none md:mb-4 text-black md:pl-4">
                {aboutData?.counters[2]?.label}
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default About;