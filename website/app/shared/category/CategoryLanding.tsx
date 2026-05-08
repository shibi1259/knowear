"use client";
import React, { useState, useEffect } from "react";
import api from "@/config/api.interceptor";
import { endpoints } from "@/app/_constants/endpoints/endpoints";
import ImageSlider from "./productSection";
import FeatureList from "./featureList";
import WorkoutSection from "./workoutSection";
import VideoBanner from "./videoBanner";
import ProductBanner from "./hotspotSection";
import ThreeBannerLayout from "./ThreeBanner";
import ProductSliderLandingPage from "./productSliderLandingPage";
import ProductListingLanding from "../product-listing-landing/ProductListingLanding";

const LeggingsCategoryPage: React.FC<any> = ({ categorySlug }) => {
  const [activeTab, setActiveTab] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [categoryLandingPage, setCategoryLandingPage] = useState<any>(null);
  const [allTabs, setAllTabs] = useState<any[]>([]);
  const [currentTab, setCurrentTab] = useState<any>(null);
  const [pageLoading, setPageLoading] = useState(true);

  // Product listing states
  const [products, setProducts] = useState<any>([]);
  const [filters, setFilters] = useState({});
  const [filterData, setFilterData] = useState<any>({
    sort: "2",
    category: [],
  });
  const [isLastPage, setIsLastPage] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(24);
  const [isLoading, setIsLoading] = useState(false);

  const fetchProducts = async () => {
    if (!currentTab || currentTab.isMainCategory) return;
    setIsLoading(true);
    const attributes = [];
    if (filterData.color) {
      attributes.push({ title: "Color", value: filterData.color });
    }
    if (filterData.size) {
      attributes.push({ title: "Size", value: filterData.size });
    }

    try {
      const response = await api.post(endpoints.productsByCategory, {
        category: currentTab?.isMainCategory ? [] : [currentTab?.slug],
        priceFrom: filterData?.low,
        priceTo: filterData?.high,
        limit,
        page,
        sort: filterData?.sort || "2",
        attributes: attributes,
      });

      if (response.data.errorCode === 0) {
        const productData = response.data.result.products;
        setProducts((prevState: any) => ({
          ...productData,
          product_items:
            page === 1
              ? productData.product_items
              : [...prevState.product_items, ...productData.product_items],
        }));

        setFilters({
          color: response?.data?.result.filters?.attributes?.find(
            (item: any) => item._id === "Color"
          ),
          sizes: response?.data?.result.filters?.attributes?.find(
            (item: any) => item._id === "Size"
          ),
          price: response?.data?.result.filters?.price,
        });

        setIsLastPage(response.data.result?.products?.last_page);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      setIsLastPage(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const getCategoryLandingPage = async () => {
      try {
        const response = await api.post(endpoints.categoryLandingPage, {
          category: categorySlug
        });
        const data = await response.data;

        setCategoryLandingPage(data?.result);

        if (data?.result) {
          const mainCategory = {
            _id: data.result.category?._id,
            name: data.result.category?.name,
            isMainCategory: true,
            slug: data.result.category?.slug,
          };

          const combinedTabs = [
            mainCategory,
            ...(data.result.subCategories || []),
          ];
          setAllTabs(combinedTabs);
          setActiveTab(mainCategory?._id);
        }
      } catch (error) {
        console.error("Error fetching category landing page:", error);
      } finally {
        setPageLoading(false);
      }
    };

    if (categorySlug) {
      getCategoryLandingPage();
    }
  }, [categorySlug]);

  useEffect(() => {
    if (activeTab && allTabs.length > 0) {
      const tab = allTabs.find((tab) => tab._id === activeTab);
      setCurrentTab(tab);
      setPage(1); // Reset page when changing tabs
      setFilterData((prev: any) => ({
        ...prev,
        category: tab?.isMainCategory ? [] : [tab?._id],
      }));
    }
  }, [activeTab, allTabs]);

  useEffect(() => {
    if (currentTab && filterData.category.length > 0) {
      fetchProducts();
    }
  }, [currentTab, filterData, page]);

  const renderContent = () => {
    if (pageLoading) {
      return (
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      );
    }

    if (currentTab?.isMainCategory) {
      return (
        <div className="space-y-8 md:space-y-12">
          <ProductSliderLandingPage
            widgetDetails={categoryLandingPage?.products}
            activeTab={activeTab}
          />
          <FeatureList data={categoryLandingPage} />
          <WorkoutSection data={categoryLandingPage} />
          <ImageSlider data={categoryLandingPage} activeTab={activeTab} />
          <VideoBanner data={categoryLandingPage} />
          <ProductSliderLandingPage
            widgetDetails={categoryLandingPage?.products3}
            activeTab={activeTab}
          />
          <ProductBanner data={categoryLandingPage} />
          <ThreeBannerLayout data={categoryLandingPage} />
          <ProductSliderLandingPage
            widgetDetails={categoryLandingPage?.products4}
            activeTab={activeTab}
          />
        </div>
      );
    } else {
      return (
        <div className="space-y-8 md:space-y-12">
          <ProductListingLanding
            products={products?.product_items || []}
            filters={filters}
            filterData={filterData}
            setFilterData={setFilterData}
            isLastPage={isLastPage}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
            setPage={setPage}
            setLimit={setLimit}
          />
        </div>
      );
    }
  };

  return (
    <div className="mx-auto">
      {/* Header */}
      <header className="py-4 md:py-6">
        <h1 className="text-2xl md:text-3xl font-bold">
          {allTabs.find((tab) => tab._id === activeTab)?.name}
        </h1>
      </header>

      {/* Mobile Tabs */}
      <div className="md:hidden border-b mb-4">
        <div className="relative">
          <button
            className="w-full flex items-center justify-between py-2 px-4 border rounded bg-white"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <span>{allTabs.find((tab) => tab._id === activeTab)?.name}</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-5 w-5 transition-transform ${
                isMenuOpen ? "rotate-180" : ""
              }`}
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>

          {isMenuOpen && (
            <div className="absolute z-10 w-full mt-1 bg-white border rounded shadow-lg">
              {allTabs.map((tab) => (
                <button
                  key={tab._id}
                  className={`block w-full text-left px-4 py-2 ${
                    activeTab === tab._id ? "bg-gray-100" : ""
                  }`}
                  onClick={() => {
                    setActiveTab(tab._id);
                    setIsMenuOpen(false);
                  }}
                >
                  {tab.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Desktop Tabs */}
      <div className="hidden md:block border-b mb-6">
        <nav className="grid grid-cols-5 gap-5 overflow:auto ">
          {allTabs.map((tab) => (
            <button
              key={tab._id}
              className={`pb-4 px-1 text-sm lg:text-base ${
                activeTab === tab._id
                  ? "border-b-2 border-black text-black"
                  : "text-gray-500"
              }`}
              onClick={() => setActiveTab(tab._id)}
            >
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      {/* Hero Section */}
      {currentTab?.isMainCategory && (
        <div className="mb-6 md:mb-8 relative overflow-hidden ">
          <div className="relative aspect-[16/9]">
            <img
              src={categoryLandingPage?.mainImage}
              alt="Category main image"
              className="w-full md:h-full  h-[242px] object-cover"
            />

            {/* Feature Icons */}
            <div className="absolute top-2 right-2  md:top-4 md:right-4 flex flex-col gap-2 md:gap-4 max-w-[120px] md:max-w-[140px]">
              <div className="p-2 md:p-3 rounded-lg flex flex-col items-center text-center">
                <img
                  src={categoryLandingPage?.firstIcon}
                  alt={categoryLandingPage?.firstIconTitle}
                  className="w-8 h-8 md:w-10 md:h-10 mb-1 md:mb-2 object-contain"
                />
                <h3 className="font-semibold text-xs md:text-sm text-white">
                  {categoryLandingPage?.firstIconTitle}
                </h3>
                <p
                  className="text-[10px] md:text-xs text-white"
                  dangerouslySetInnerHTML={{
                    __html: categoryLandingPage?.firstIconDescription,
                  }}
                ></p>
              </div>

              <div className="p-2 md:p-3 rounded-lg flex flex-col items-center text-center">
                <img
                  src={categoryLandingPage?.secondIcon}
                  alt={categoryLandingPage?.secondIconTitle}
                  className="w-8 h-8 md:w-10 md:h-10 mb-1 md:mb-2 object-contain"
                />
                <h3 className="font-semibold text-xs md:text-sm text-white">
                  {categoryLandingPage?.secondIconTitle}
                </h3>
                <p
                  className="text-[10px] md:text-xs text-white"
                  dangerouslySetInnerHTML={{
                    __html: categoryLandingPage?.secondIconDescription,
                  }}
                ></p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Set Collections Section */}
      {currentTab?.isMainCategory && (
        <section className="mb-6 md:mb-[47px]">
          <h2 className="text-xl md:text-2xl font-semibold mb-3 md:mb-4 text-center">
            {categoryLandingPage?.bottomTitle}
          </h2>
          <div
            className="text-center text-xs md:text-sm text-gray-600 px-2 md:px-8 max-w-3xl mx-auto"
            dangerouslySetInnerHTML={{
              __html: categoryLandingPage?.bottomDescription,
            }}
          ></div>
        </section>
      )}

      {renderContent()}
    </div>
  );
};

export default LeggingsCategoryPage;
