"use client";
import Image from "next/image";
import Link from "next/link";
import React, { useContext, useEffect, useState } from "react";
import Logo from "../../../public/logo.svg";
import NewsLetterForm from "../newsletterform/NewsLetterForm";
import { ThemeContext } from "@/providers/theme/ThemeContext";
import api from "@/config/api.interceptor";
import { endpoints } from "@/app/_constants/endpoints/endpoints";
import { Data } from "@/types/footerData.types";
import Webcastle from "@/public/svgs/Webcastle";
import { usePathname } from "next/navigation";

const Footer = (props: any) => {
  const themeData = useContext(ThemeContext);
  const [logo, setLogo] = useState(Logo);
  const pathName = usePathname();
  const [footerData, setFooterData] = useState<any>();
  const [socialLinks, setSocialLinks] = useState<any>();

  useEffect(() => {
    if (themeData?.logo) setLogo(themeData?.logo);
  }, [themeData?.logo]);

  const disableContainer =
    pathName.includes("/add-address") ||
    pathName.includes("/order-placed") ||
    pathName.includes("/profile") ||
    pathName.includes("/orders") ||
    pathName.includes("/favourites")
      ? "hidden md:block " // Hide on mobile, show on larger screens
      : "";

  const getFooterData = () => {
    api.get(endpoints.getFooterData).then((res) => {
      if (res.status === 200) {
        setFooterData(res?.data?.result);
      }
    });
  };

  const getSocialLinks = async () => {
    api.get(endpoints.socialmedia).then((res) => {
      if (res.status === 200) {
        setSocialLinks(res?.data?.result);
      }
    });
  };

  useEffect(() => {
    getFooterData();
    getSocialLinks();
  }, []);

 

  return (
    <footer
      className={`bg-[#F6F6F6] pt-[58px] pb-20 lg:pb-3 ${disableContainer}`}
    >
      <div className="container max-w-full">
        <Link href={"/"} className="w-[132px] table mb-[73px]">
          <Image src={Logo} alt="Logo" />
        </Link>
        <div className="flex justify-start items-start flex-wrap gap-3 md:gap-y-6">
          <div className="flex justify-start items-start flex-wrap gap-3 md:gap-y-6 lg:w-[calc(100%_-_398px)]">
            <div className="w-[calc(100%_/_2_-_6px)] lg:w-[calc(100%_/_3_-_9px)] ">
              <h4 className="font-bold text-[13px] text-[#191D23] uppercase !leading-[18px]">
                {footerData?.shopTitle}
              </h4>
              <ul className="mt-3 md:mt-8">
                {footerData?.shopLinks?.map((item: any, index: number) => (
                  <li key={index}>
                    <Link
                      href={item.link}
                      className="font-normal text-[13px]  md:text-sm text-[#191D23] md:!leading-10"
                    >
                      {item.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="w-[calc(100%_/_2_-_6px)] lg:w-[calc(100%_/_3_-_9px)] ">
              <h4 className="font-bold text-[13px] text-[#191D23] uppercase !leading-[18px]">
                {footerData?.communityTitle}
              </h4>
              <ul className="mt-3 md:mt-8">
                {footerData?.communityLinks?.map((item: any, index: number) => (
                  <li key={index}>
                    <Link
                      href={item.link}
                      className="font-normal text-[13px]  md:text-sm text-[#191D23] md:!leading-10"
                    >
                      {item.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="w-full lg:w-[calc(100%_/_3_-_9px)]  mb-[25px] md:mb-0">
              <h4 className="font-bold text-[13px] text-[#191D23] uppercase !leading-[18px]">
                {footerData?.customerSupportTitle}
              </h4>

              <ul className="mt-3 md:mt-8">
                {footerData?.customerSupportLinks?.map(
                  (item: any, index: number) => (
                    <li key={index}>
                      <Link
                        href={item.link}
                        className="font-normal text-[13px]  md:text-sm text-[#191D23] md:!leading-10"
                      >
                        {item.title}
                      </Link>
                    </li>
                  )
                )}
              </ul>
            </div>
          </div>
          <div className="w-full lg:w-[386px]">
            <h4 className="font-bold  text-xl  text-[#191D23] mb-[17px] md:mb-[37px] leading-[18px]">
              {footerData?.newsletterTitle}
            </h4>
            <NewsLetterForm />

            <ul className="mt-[25px] lg:mt-[34px] flex justify-between ">
              <li className="flex flex-col gap-y-1 lg:gap-y-[9px]">
                <label className="text-[#64748B] text-[13px] uppercase font-bold">
                  {footerData?.callUsTitle}
                </label>
                <Link
                  href={`tel:${footerData?.callUsValue}`}
                  className="text-[#191D23] text-[15px] lg:text-lg font-semibold"
                >
                  {footerData?.callUsValue}
                </Link>
              </li>
              <li className="flex flex-col gap-y-1  lg:gap-y-[9px]">
                <label className="text-[#64748B] text-[13px] uppercase font-bold">
                  {footerData?.emailTitle}
                </label>
                <Link
                  href={`mailto:${footerData?.emailUsValue}`}
                  className="text-[#191D23] text-[15px] lg:text-lg font-semibold"
                >
                  {footerData?.emailUsValue}
                </Link>
              </li>
            </ul>

            <div className="flex items-center justify-start gap-x-4 border-b border-[#D8D8D8] lg:border-none py-5 lg:py-10">
              <div>Follow us:</div>
              <div className="flex items-center justify-center gap-x-1">
                {socialLinks?.instagram ? (
                  <Link
                    href={socialLinks?.instagram}
                    className="h-8 w-8 grid place-items-center bg-black text-white"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Image
                      src={"/icons/instagram.svg"}
                      alt="Instagram"
                      height={16}
                      width={16}
                    />
                  </Link>
                ) : (
                  <></>
                )}
                {socialLinks?.facebook ? (
                  <Link
                    href={`${socialLinks?.facebook}`} // Access the specific value property
                    target="_blank"
                    rel="nofollow"
                    className="h-8 w-8 grid place-items-center bg-black text-white"
                  >
                    <Image
                      src={"/icons/facebook.svg"}
                      alt="Facebook"
                      height={16}
                      width={16}
                    />
                  </Link>
                ) : (
                  <></>
                )}
                {socialLinks?.tiktok ? (
                  <Link
                    href={socialLinks?.tiktok}
                    className="h-8 w-8 grid place-items-center bg-black text-white"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Image
                      src={"/icons/tiktok-svg.svg"}
                      alt="TikTok"
                      height={16}
                      width={16}
                    />
                  </Link>
                ) : (
                  <></>
                )}
                {socialLinks?.snapchat ? (
                  <Link
                    href={socialLinks?.snapchat}
                    className="h-8 w-8 grid place-items-center bg-black text-white"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Image
                      src={"/icons/snap4.svg"}
                      alt="Snapchat"
                      height={16}
                      width={16}
                    />
                  </Link>
                ) : (
                  <></>
                )}
                {socialLinks?.youtube ? (
                  <Link
                    href={socialLinks?.youtube}
                    className="h-8 w-8 grid place-items-center bg-black text-white"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Image
                      src={"/icons/youtube.svg"}
                      alt="YouTube"
                      height={16}
                      width={16}
                    />
                  </Link>
                ) : (
                  <></>
                )}
                {socialLinks?.whatsapp ? (
                  <Link
                    href={socialLinks?.whatsapp}
                    className="h-8 w-8 grid place-items-center bg-black text-white"
                    target="https://wa.me/971529725961"
                    rel="noopener noreferrer"
                  >
                    <Image
                      src={"/icons/whatsapp.svg"}
                      alt="whatsapp"
                      height={16}
                      width={16}
                    />
                  </Link>
                ) : (
                  <></>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-[37px] lg:mt-20 pt-3 lg:pt-[27px] border-t-[1px] border-[#E4E4E7]">
          <p className="flex justify-center items-center gap-x-2 text-black text-xs lg:text-sm font-normal">
            © {new Date().getFullYear()} Knowear.All right reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
