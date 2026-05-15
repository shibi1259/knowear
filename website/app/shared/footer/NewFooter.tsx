import Image from "next/image";
import Link from "next/link";
import { Mail, Phone } from "lucide-react";

import Logo from "../../../public/logo.svg";
import Headphone from "../../../public/icons/headphone.png";
import FooterCollapsibleColumn from "./FooterCollapsibleColumn";
import FooterNewsletterForm from "./FooterNewsletterForm";
import FooterSocialLinks from "./FooterSocialLinks";

// Re-exported for any external consumers that imported it from here previously.
export const SocialIcons = {
  whatsapp: "/icons/whatsapp.svg",
  instagram: "/icons/instagram.svg",
  facebook: "/icons/facebook.svg",
  snapchat: "/icons/snap4.svg",
  tiktok: "/icons/tiktok-svg.svg",
  youtube: "/icons/youtube.svg",
};

const PaymentIcons = {
  visa: "/icons/Visa.svg",
  mastercard: "/icons/Mastercard.svg",
  samsungpay: "/icons/samsung.jpeg",
  applepay: "/icons/ApplePay.svg",
  stripe: "/icons/Stripe.svg",
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

const NewFooter = () => {
  return (
    <footer className="bg-white text-[#191D23] lg:px-[5%]">
      <div className="container mx-auto px-4 py-8">
        {/* Top Section - Logo and Mission */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-4">
            <Image
              src={Logo}
              alt="Knowear"
              width={120}
              height={40}
              priority={false}
            />
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
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-12 lg:mb-16">
          <FooterCollapsibleColumn
            title="Shop By"
            links={shopLinks}
            defaultOpen={true}
          />
          <FooterCollapsibleColumn
            title="Customer Support"
            links={supportLinks}
          />
          <FooterCollapsibleColumn
            title="Our Community"
            links={communityLinks}
          />
          <FooterCollapsibleColumn
            title="Terms & Policies"
            links={policyLinks}
            mobileOnly
            externalLinks
          />

          {/* Right column: Newsletter / Contact / Follow Us */}
          <div className="space-y-3 w-full max-w-sm mx-auto lg:mx-0">
            {/* JOIN KNOWEAR COMMUNITY */}
            <div className="bg-gray-100 py-6 px-6 rounded-lg">
              <h4 className="font-bold text-sm uppercase mb-3">
                Join Knowear Community
              </h4>
              <FooterNewsletterForm />
            </div>

            {/* CONTACT */}
            <div className="bg-gray-100 py-4 px-6 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-bold text-base uppercase">Contact</h4>
                <div className="bg-white w-8 h-8 rounded-full flex justify-center items-center shadow-md">
                  <Image
                    src={Headphone}
                    alt="Contact"
                    width={18}
                    height={18}
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-2 items-center">
                <a
                  href="tel:+97145704377"
                  className="px-3 py-3 text-xs font-normal flex justify-center items-center rounded-sm bg-black text-white border-black"
                >
                  <Phone size={14} className="mr-1.5" />
                  +971 4 570 4377
                </a>
                <a
                  href="mailto:info@knowear.me"
                  className="px-2 py-3 text-xs font-normal flex justify-center items-center rounded-sm bg-black text-white border-black"
                >
                  <Mail size={14} className="mr-1.5" />
                  info@knowear.me
                </a>
              </div>
              <p className="text-xs text-gray-600 mt-4">
                Contact Us Today - We&apos;re Just a Message Away!
              </p>
            </div>

            {/* FOLLOW US */}
            <div className="bg-gray-100 py-4 px-6 rounded-lg">
              <h4 className="font-bold text-sm uppercase mb-3">Follow Us</h4>
              <FooterSocialLinks />
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <hr className="border-gray-200 mb-6 w-full" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-y-6">
          {/* Payment Methods */}
          <div className="flex items-center space-x-2">
            {Object.entries(PaymentIcons).map(([method, icon]) => (
              <div
                key={method}
                className="w-9 h-6 bg-gray-100 rounded flex items-center justify-center overflow-hidden"
              >
                <Image
                  src={icon}
                  alt={method}
                  width={32}
                  height={20}
                  className="object-contain"
                />
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
                rel="noopener noreferrer"
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
