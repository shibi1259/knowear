"use client";
import React, { useState, useEffect, useRef } from "react";
import AppLoader from "../app-loader/AppLoader";
import { usePathname, useSearchParams } from "next/navigation";
import { useLoading } from "@/providers/loading/LoadingProvider";

function routeKeyFromNext(pathname: string, searchParams: URLSearchParams) {
  const q = searchParams.toString();
  return q ? `${pathname}?${q}` : pathname;
}

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
  // Latest URL React / Next considers active. Updated every render so we can
  // compare with `window.location` inside `popstate` without stale closures.
  const nextRouteKeyRef = useRef("");
  nextRouteKeyRef.current = routeKeyFromNext(pathname, searchParams);

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
      const historyKey =
        window.location.pathname + window.location.search;
      const nextKey = nextRouteKeyRef.current;
      // Next.js App Router often applies the history entry and updates
      // `usePathname` / `useSearchParams` *before* our `popstate` listener
      // runs. In that case `setIsNavigating(true)` would fire *after* the
      // clear effect — pathname does not change again, and the spinner never
      // clears. Skip showing the loader when the browser URL already matches
      // React’s route.
      if (historyKey === nextKey) {
        setIsNavigating(false);
        return;
      }
      setIsNavigating(true);
    };

    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        setIsNavigating(false);
      }
    };

    document.addEventListener("click", handleLinkClick);
    window.addEventListener("popstate", handlePopState);
    window.addEventListener("pageshow", handlePageShow);

    return () => {
      document.removeEventListener("click", handleLinkClick);
      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener("pageshow", handlePageShow);
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
