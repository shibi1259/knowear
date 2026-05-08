"use client";
import React, { useState, useEffect } from "react";
import AppLoader from "../app-loader/AppLoader";
import { usePathname, useSearchParams } from "next/navigation";
import { useLoading } from "@/providers/loading/LoadingProvider";

interface NavigationLoaderProps {
  isLoading?: boolean;
}

const NavigationLoader: React.FC<NavigationLoaderProps> = ({
  isLoading: externalLoading,
}) => {
  const [isNavigating, setIsNavigating] = useState(false);
  const { isLoading: globalLoading } = useLoading();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const isInternalNavigation = (link: HTMLAnchorElement) => {
      if (!link.href) return false;
      if (link.target && link.target !== "" && link.target !== "_self") return false;
      if (link.hasAttribute("download")) return false;
      if (link.href.includes("#")) return false;
      try {
        const url = new URL(link.href, window.location.href);
        if (url.origin !== window.location.origin) return false;
        if (url.pathname === window.location.pathname && url.search === window.location.search) {
          return false;
        }
        return true;
      } catch {
        return false;
      }
    };

    const handleLinkClick = (e: MouseEvent) => {
      if (e.defaultPrevented) return;
      if (e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      const target = e.target as HTMLElement | null;
      const link = target?.closest("a") as HTMLAnchorElement | null;
      if (!link) return;
      if (!isInternalNavigation(link)) return;

      setIsNavigating(true);
    };

    const handlePopState = () => {
      setIsNavigating(true);
    };

    document.addEventListener("click", handleLinkClick);
    window.addEventListener("popstate", handlePopState);

    return () => {
      document.removeEventListener("click", handleLinkClick);
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  useEffect(() => {
    setIsNavigating(false);
  }, [pathname, searchParams]);

  const showLoader =
    externalLoading !== undefined
      ? externalLoading
      : isNavigating || globalLoading;

  if (!showLoader) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white">
      <AppLoader width="80" height="80" />
    </div>
  );
};

export default NavigationLoader;
