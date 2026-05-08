"use client";
import VideoBanner from "@/components/home/VideoBanner";
import { useEffect, useState } from "react";
import { endpoints } from "@/app/_constants/endpoints/endpoints";
import api from "@/config/api.interceptor";
import { useSearchParams } from "next/navigation";
import { useInView } from "react-intersection-observer";
import AppLoader from "@/app/shared/app-loader/AppLoader";

type Widget = {
  type: string;
  [key: string]: any;
};

export default function CheckoutSupportBanner() {
  const [widgetsList, setWidgetList] = useState<Widget[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { ref, inView } = useInView();
  const [params, setParams] = useState({ page: 1 });
  const [isLastPage, setIsLastPage] = useState(false);

  const searchParam = useSearchParams();
  const queryParams = new URLSearchParams(searchParam as any);
  const type = queryParams.get("type");

  const fetchWidgets = async (endpoint: string) => {
    setIsLoading(true);
    try {
      const resp = await api.get(`${endpoint}?page=${params.page + 1}`);
      setParams((prev) => ({ ...prev, page: prev.page + 1 }));
      const widgets = resp?.data?.result?.widgets || [];
      const lastPage = resp?.data?.result?.isLastPage ?? false;
      setWidgetList((prev) => [...prev, ...widgets]);
      setIsLastPage(lastPage);
    } catch (error) {
      // Optionally log error
    } finally {
      setIsLoading(false);
    }
  };

  const fetchData = async () => {
    if (type === "preview") {
      await fetchWidgets(endpoints.previewWidgets);
    } else if (type === "draft") {
      await fetchWidgets(endpoints.draftWidgets);
    } else {
      await fetchWidgets(endpoints.publishedWidgets);
    }
  };

  useEffect(() => {
    if (inView && !isLastPage && !isLoading) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, isLastPage, isLoading, type]);

  return (
    <div className="border-t-2">
      {widgetsList.map((item, index) => {
        switch (item?.type) {
          case "video-banner":
            return <VideoBanner checkoutBanner={true} widgetDetails={item} key={index} />;
          default:
            return null;
        }
      })}
      <div ref={ref} className="container mx-auto">
        {isLoading && <AppLoader />}
      </div>
    </div>
  );
}
