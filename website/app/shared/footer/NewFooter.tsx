"use client";
import Image from "next/image";
import Link from "next/link";
import React, { useContext, useEffect, useState } from "react";
import Logo from "../../../public/logo.svg";
import { ThemeContext } from "@/providers/theme/ThemeContext";
import api from "@/config/api.interceptor";
import { endpoints } from "@/app/_constants/endpoints/endpoints";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import {
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Phone,
  Mail,
  Headphones,
} from "lucide-react";
import Headphone from "../../../public/icons/headphone.png";

// Social media icons
export const SocialIcons = {
  whatsapp: "/icons/whatsapp.svg",
  instagram: "/icons/instagram.svg",
  facebook: "/icons/facebook.svg",
  snapchat: "/icons/snap4.svg",
  // twitter: "/icons/twitter.svg",
  tiktok: "/icons/tiktok-svg.svg",
  youtube: "/icons/youtube.svg",
};

// Payment method icons
const PaymentIcons = {
  visa: "/icons/Visa.svg",
  mastercard: "/icons/Mastercard.svg",
  //   amex: "/icons/Amex.svg",
  //   JCB:"/icons/JCB.svg",
  //   unionPay:"/icons/UnionPay.svg",
  //   amazonpay: "/icons/AmazonPay.svg",
  //   googlepay: "/icons/GooglePay.svg",
  samsungpay: "/icons/samsung.jpeg",
  applepay: "/icons/ApplePay.svg",
  stripe: "/icons/Stripe.svg",
};

type NewsLetterFormInputs = {
  email: string;
};

const NewFooter = () => {
  const themeData = useContext(ThemeContext);
  const [logo, setLogo] = useState(Logo);
  const [footerData, setFooterData] = useState<any>();
  const [socialLinks, setSocialLinks] = useState<any>();
  const [expandedSections, setExpandedSections] = useState<{
    shop: boolean;
    support: boolean;
    community: boolean;
    policies: boolean;
  }>({
    shop: true,
    support: false,
    community: false,
    policies: false,
  });

  const form = useForm<NewsLetterFormInputs>({
    defaultValues: {
      email: "",
    },
  });

  useEffect(() => {
    if (themeData?.logo) setLogo(themeData?.logo);
  }, [themeData?.logo]);

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

  const onSubmit = (data: NewsLetterFormInputs) => {
    api
      .post(endpoints.subscribe, data)
      .then((res) => {
        if (res.data.errorCode == 0) {
          toast({ description: "Subscribed successfully", variant: "success" });
          form.reset();
        } else {
          toast({ description: res.data.message, variant: "success" });
        }
      })
      .catch((err) => {
        toast({
          description: err.response.data.message,
          variant: "destructive",
        });
      });
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const shopLinks = [
    { title: "What's New", link: "/products?filter=new" },
    { title: "View all Products", link: "/products" },
    { title: "Best Seller", link: "/products?filter=bestseller" },
    { title: "Categories", link: "/categories" },
    { title: "Leggings", link: "/categories/leggings" },
    { title: "Sports Bra", link: "/categories/sports-bra" },
    { title: "Pants | trousers", link: "/categories/trouser" },
    { title: "Tops | T-shirts", link: "/categories/shorts" },
    { title: "Shorts", link: "/categories/shorts" },
    { title: "Sets", link: "/categories/leggings" },
  ];

  const supportLinks = [
    { title: "My Account", link: "/account" },
    { title: "My Orders", link: "/orders" },
    { title: "FAQs", link: "/faqs" },
    { title: "Career", link: "/careers" },
    { title: "Contact Us", link: "/contact-us" },
    { title: "About Us", link: "/about" },
  ];

  const communityLinks = [
    { title: "Our Story", link: "/about" },
    { title: "Our Impact", link: "/about?section=key-figures" },
    { title: "Our Blog", link: "/blogs" },
  ];

  const policyLinks = [
    { title: "Terms & Conditions", link: "/terms-and-conditions" },
    { title: "Shipping Policy", link: "/shipping-policy" },
    { title: "Refund Policy", link: "/refund-policy" },
    { title: "Privacy Policy", link: "/privacy-policy" },
  ];

  return (
    <footer className="bg-white text-[#191D23]  lg:px-[5%]">
      {/* Top Section - Logo and Mission */}
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-4">
            <Image src={Logo} alt="Knowear" width={120} height={40} />
          </Link>
          <p className="text-sm text-black max-w-2xl mx-auto mb-4">
            Emirati Initiative to Support Education for underprivileged
            students, supported by Najmsuhail Investment. <br />
            At KnoWear, 5% of every purchase is donated to supporting education
            worldwide.
          </p>
          <p className="text-lg font-semibold">
            Shop with impact. Empower the next generation.
          </p>
        </div>

        <hr className="border-gray-200 mb-8" />

        {/* Main Footer Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-64 sm:mb-80 lg:mb-20">
          {/* SHOP BY Section */}
          <div className="border-b lg:border-0">
            <div
              className={`flex items-center justify-between lg:justify-start mb-4 ${
                expandedSections.shop ? "border-b lg:border-0" : "border-0"
              }`}
            >
              <h4 className="font-bold text-sm uppercase">Shop By</h4>
              <button
                onClick={() => toggleSection("shop")}
                className="lg:hidden"
              >
                {expandedSections.shop ? (
                  <ChevronUp size={20} />
                ) : (
                  <ChevronDown size={20} />
                )}
              </button>
            </div>
            <ul
              className={`space-y-2 ${
                !expandedSections.shop ? "hidden lg:block" : ""
              }`}
            >
              {shopLinks.map((item, index) => (
                <li key={index}>
                  <Link
                    href={item.link}
                    className="text-sm text-gray-600 hover:text-black transition-colors"
                  >
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* CUSTOMER SUPPORT Section */}
          <div className=" border-b lg:border-0">
            <div
              className={`flex items-center justify-between lg:justify-start mb-4 ${
                expandedSections.support ? "border-b lg:border-0" : "border-0"
              }`}
            >
              <h4 className="font-bold text-sm uppercase">Customer Support</h4>
              <button
                onClick={() => toggleSection("support")}
                className="lg:hidden"
              >
                {expandedSections.support ? (
                  <ChevronUp size={20} />
                ) : (
                  <ChevronDown size={20} />
                )}
              </button>
            </div>
            <ul
              className={`space-y-2 ${
                !expandedSections.support ? "hidden lg:block" : ""
              }`}
            >
              {supportLinks.map((item, index) => (
                <li key={index}>
                  <Link
                    href={item.link}
                    className="text-sm text-gray-600 hover:text-black transition-colors"
                  >
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* OUR COMMUNITY Section */}
          <div className="border-b lg:border-0">
            <div
              className={`flex items-center justify-between lg:justify-start mb-4 ${
                expandedSections.community ? "border-b lg:border-0" : "border-0"
              }`}
            >
              <h4 className="font-bold text-sm uppercase">Our Community</h4>
              <button
                onClick={() => toggleSection("community")}
                className="lg:hidden"
              >
                {expandedSections.community ? (
                  <ChevronUp size={20} />
                ) : (
                  <ChevronDown size={20} />
                )}
              </button>
            </div>
            <ul
              className={`space-y-2 ${
                !expandedSections.community ? "hidden lg:block" : ""
              }`}
            >
              {communityLinks.map((item, index) => (
                <li key={index}>
                  <Link
                    href={item.link}
                    className="text-sm text-gray-600 hover:text-black transition-colors"
                  >
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Terms & Policy */}
          <div className="border-b lg:hidden">
            <div
              className={`flex items-center justify-between mb-4 ${
                expandedSections.policies ? "border-b" : ""
              }`}
            >
              <h4 className="font-bold text-sm uppercase">TERMS & POLICIES</h4>
              <button onClick={() => toggleSection("policies")}>
                {expandedSections.policies ? (
                  <ChevronUp size={20} />
                ) : (
                  <ChevronDown size={20} />
                )}
              </button>
            </div>
            <ul
              className={`space-y-2 ${
                !expandedSections.policies ? "hidden" : ""
              }`}
            >
              <div className="flex flex-col space-y-2 mb-3">
                {policyLinks.map((item, index) => (
                  <Link
                    key={index}
                    href={item.link}
                    className="text-sm text-gray-600 hover:text-black transition-colors"
                    target="_blank"
                  >
                    {item.title}
                  </Link>
                ))}
              </div>
            </ul>
          </div>

          {/* Interactive Sections */}
          <div className="space-y-2 w-[380px] h-[165px]">
            {/* JOIN KNOWEAR COMMUNITY */}
            <div className="bg-gray-100 py-8 px-8 mx-auto rounded-lg">
              <h4 className="font-bold text-sm uppercase mb-3 ml-2">
                Join Knowear Community
              </h4>
              <form onSubmit={form.handleSubmit(onSubmit)} className="flex">
                <div className="bg-black flex items-center rounded-sm ">
                  <Input
                    placeholder="Email address"
                    {...form.register("email", {
                      required: "Email is required",
                      pattern: {
                        value:
                          /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
                        message: "Please enter a valid email address",
                      },
                    })}
                    className="flex-1 rounded-sm border-gray-300 text-sm w-[248px] h-[50px]"
                  />
                  <Button
                    type="submit"
                    className=" hover:bg-gray-800 text-white rounded-sm px-4"
                  >
                    <ArrowRight size={16} />
                  </Button>
                </div>
              </form>
            </div>

            {/* CONTACT */}
            <div className="bg-gray-100 py-4 px-8  rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-bold text-base  uppercase">Contact</h4>
                <div className="bg-white w-8 h-8 rounded-full flex justify-center items-center shadow-md">
                  <Image src={Headphone} alt="Knowear" width={18} height={18} />
                </div>
              </div>
              <div className="space-x-2 flex justify-between items-center">
                <button className="px-3 py-3 text-xs font-normal flex justify-center items-center rounded-sm bg-black text-white  border-black">
                  <Phone size={14} className="mr-1.5" />
                  +971 4 570 4377
                </button>
                <button className=" px-2 py-3 text-xs font-normal flex justify-center8tem8center rounded-sm bg-black text-white  border-black">
                  <Mail size={14} className="mr-1.5" />
                  info@knowear.me
                </button>
              </div>
              <p className="text-xs text-gray-600 mt-4">
                Contact Us Today - We're Just a Message Away!
              </p>
            </div>

            {/* FOLLOW US */}
            <div className="bg-gray-100 py-4 px-8 rounded-lg">
              <h4 className="font-bold text-sm uppercase mb-3">Follow Us</h4>
              <div className="flex space-x-3">
                {Object.entries(SocialIcons).map(([platform, icon]) => (
                  <Link
                    key={platform}
                    href={socialLinks?.[platform] || "#"}
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
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <hr className="border-gray-200 mb-6 w-full" />

        <div className="flex flex-col md:flex-row items-center justify-between space-y-6 md:space-y-0">
          {/* Payment Methods */}
          <div className="flex items-center space-x-2">
            {Object.entries(PaymentIcons).map(([method, icon]) => (
              <div
                key={method}
                className="w-8 h-5 bg-gray-100 rounded flex items-center justify-center"
              >
                <Image src={icon} alt={method} width={36} height={24} />
              </div>
            ))}
          </div>

          {/* Copyright */}
          <div className="text-sm text-gray-600">
            © {new Date().getFullYear()} Knowear. All right reserved.
          </div>

          {/* Policy Links - Only visible on desktop */}
          <div className="hidden lg:flex space-x-4 text-sm">
            {policyLinks.map((item, index) => (
              <Link
                key={index}
                href={item.link}
                className="text-gray-600 hover:text-black transition-colors"
                target="_blank"
              >
                {item.title}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default NewFooter;
