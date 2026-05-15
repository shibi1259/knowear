"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import { endpoints } from "@/app/_constants/endpoints/endpoints";
import api from "@/config/api.interceptor";

const SOCIAL_ICONS: Record<string, string> = {
  whatsapp: "/icons/whatsapp.svg",
  instagram: "/icons/instagram.svg",
  facebook: "/icons/facebook.svg",
  snapchat: "/icons/snap4.svg",
  tiktok: "/icons/tiktok-svg.svg",
  youtube: "/icons/youtube.svg",
};

const FooterSocialLinks = () => {
  const [socialLinks, setSocialLinks] = useState<Record<string, string> | null>(
    null
  );

  useEffect(() => {
    let mounted = true;
    api
      .get(endpoints.socialmedia)
      .then((res) => {
        if (!mounted) return;
        if (res.status === 200) {
          setSocialLinks(res?.data?.result || {});
        }
      })
      .catch(() => {
        if (mounted) setSocialLinks({});
      });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="flex space-x-3">
      {Object.entries(SOCIAL_ICONS).map(([platform, icon]) => {
        const href = socialLinks?.[platform] || "#";
        return (
          <Link
            key={platform}
            href={href}
            className="w-8 h-8 rounded-full border-2 border-black flex items-center justify-center"
            target="_blank"
            rel="noopener noreferrer"
            aria-label={platform}
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
  );
};

export default FooterSocialLinks;
