"use client";
import CategoryGrids from "@/components/home/CategoryGrids";
import ProductSlider from "@/app/shared/product-slider/ProductSlider";
import VideoBanner from "@/components/home/VideoBanner";
import BannerCounter from "@/components/home/BannerCounter";
import HeroBanner from "@/components/home/HeroBanner";

import { useEffect, useState } from "react";
import { endpoints } from "@/app/_constants/endpoints/endpoints";
import api from "@/config/api.interceptor";
import { useSearchParams } from "next/navigation";
import { useInView } from "react-intersection-observer";
import AppLoader from "../app-loader/AppLoader";
import CustomHtml from "@/components/home/CustomHtml";

export default function WidgetList({ data }: any) {
  const [widgetsList, setWidgetList] = useState(data?.result?.widgets);
  const [isLoading, setisLoading] = useState(false);
  const { ref, inView } = useInView();
  const [params, setParams] = useState({ page: 1 });
  const [isLastPage, setIsLastPage] = useState(data?.result?.isLastPage);

  const getPublishedWidgets = async () => {
    setisLoading(true);

    try {
      const resp = await api.get(
        `${endpoints.publishedWidgets}?page=${params?.page + 1}`
      );

      setParams((prevParams) => ({
        ...prevParams,
        page: prevParams.page + 1,
      }));

      setWidgetList([...widgetsList, ...resp?.data?.result?.widgets]);
      setIsLastPage(resp?.data?.result?.isLastPage);
      setisLoading(false);
    } catch (error) {
      setisLoading(false);
    }
  };

  const getPreviewWidgets = async () => {
    setisLoading(true);
    try {
      const resp = await api.get(
        `${endpoints.previewWidgets}?page=${params?.page + 1}`
      );
      setParams((prevParams) => ({
        ...prevParams,
        page: prevParams.page + 1,
      }));
      setWidgetList([...widgetsList, ...resp?.data?.result?.widgets]);
      setIsLastPage(resp?.data?.result?.isLastPage);
      setisLoading(false);
    } catch (error) {
      console.log("Error caught in preview widgets", error);
      setisLoading(false);
    }
  };

  const getDraftWidgets = async () => {
    setisLoading(true);
    try {
      const resp = await api.get(
        `${endpoints.draftWidgets}?page=${params?.page + 1}`
      );

      setParams((prevParams) => ({
        ...prevParams,
        page: prevParams.page + 1,
      }));
      setWidgetList([...widgetsList, ...resp?.data?.result?.widgets]);
      setIsLastPage(resp?.data?.result?.isLastPage);
      setisLoading(false);
    } catch (error) {
      console.log("Error caught in draft widgets", error);
      setisLoading(false);
    }
  };

  const searchParam = useSearchParams();
  const queryParams = new URLSearchParams(searchParam);
  const type = queryParams.get("type");

  const fetchData = async () => {
    try {
      if (type == "preview") {
        await getPreviewWidgets();
      } else if (type == "draft") {
        await getDraftWidgets();
      } else {
        await getPublishedWidgets();
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (inView && !isLastPage && !isLoading) {
      fetchData();
    }
  }, [inView]);
  return (
    <>
      <div>
        {widgetsList?.map((item: any, index: any) => {
          console.log("item", item);
          switch (item?.type) {
            case "image-slider":
              return <CategoryGrids widgetDetails={item} key={index} />;
            case "products":
              return <ProductSlider widgetDetails={item} key={index} />;
            case "hero-banner":
              return <HeroBanner widgetDetails={item} key={index} />;
            case "video-banner":
              return <VideoBanner widgetDetails={item} key={index} />;
            case "html":
              return <CustomHtml widgetDetails={item} key={index} />;
            case "banner-counter":
              return <BannerCounter widgetDetails={item} key={index} />;
            default:
              return null;
          }
        })}
        <div ref={ref} className="container mx-auto">
          {isLoading && <AppLoader />}
        </div>
      </div>
    </>
  );
}
