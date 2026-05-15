"use client";

import { endpoints } from "@/app/_constants/endpoints/endpoints";
import ProductListing from "@/app/shared/product-listing/ProductListing";
import api from "@/config/api.interceptor";
import { useSearchParams } from "next/navigation";
import React, { useEffect, useRef } from "react";

type Props = {
  /**
   * Optional URL slug from the catch-all `/products/[...slug]` route.
   * When provided, categories are derived from `slug + searchParams.category`.
   * When absent (e.g. on the root `/products` page), categories come from
   * `filterData.category` instead.
   */
  slug?: string[];
  initialProducts: any[];
  initialFilters: any;
  initialIsLastPage: boolean;
  initialTotalResults: number;
};

const ProductsClient = ({
  slug,
  initialProducts,
  initialFilters,
  initialIsLastPage,
  initialTotalResults,
}: Props) => {
  const searchParams = useSearchParams();
  const [products, setProducts] = React.useState<any[]>(initialProducts || []);
  const [filters, setFilters] = React.useState<any>(initialFilters || {});
  const [filterData, setFilterData] = React.useState<any>({ sort: "2" });
  const [isLastPage, setIsLastPage] = React.useState(!!initialIsLastPage);
  const [totalResults, setTotalResults] = React.useState(
    initialTotalResults || 0
  );
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(24);
  const [isLoading, setIsLoading] = React.useState(false);

  // Skip the very first effect call: initial data already came from SSR.
  // Subsequent runs (filter / page / search changes) will fetch on the client.
  const isFirstRun = useRef(true);

  const isSlugRoute = Array.isArray(slug) && slug.length > 0;

  const fetchProducts = async () => {
    setIsLoading(true);
    const attributes: Array<{ title: string; value: any }> = [];
    if (filterData.color) {
      attributes.push({ title: "Color", value: filterData.color });
    }
    if (filterData.size) {
      attributes.push({ title: "Size", value: filterData.size });
    }

    let category: any[];
    if (isSlugRoute) {
      const searchCategory =
        searchParams?.get("category")?.split("%25") || [];
      category = [...(slug as string[]), ...searchCategory].filter(Boolean);
    } else {
      category = filterData?.category || [];
    }

    api
      .post(endpoints.productsByCategory, {
        category,
        priceFrom: filterData?.low,
        priceTo: filterData?.high,
        limit,
        page,
        sort: filterData?.sort || "2",
        attributes,
        search: searchParams?.get("search") || "",
      })
      .then((response: any) => {
        if (response.data.errorCode == 0) {
          const productData = response.data.result.products;
          if (page === 1) {
            setProducts(productData?.product_items || []);
          } else {
            setProducts((prev) => [
              ...prev,
              ...(productData?.product_items || []),
            ]);
          }
          setFilters({
            color: response?.data?.result.filters?.attributes?.find(
              (item: any) => item._id === "Color"
            ),
            sizes: response?.data?.result.filters?.attributes?.find(
              (item: any) => item._id === "Size"
            ),
            price: response?.data?.result.filters?.price,
            category: response?.data?.result.filters?.categories,
          });
          setTotalResults(productData?.total_items || 0);
          setIsLastPage(!!productData?.last_page);
          setIsLoading(false);
        } else {
          setIsLoading(false);
        }
      })
      .catch(() => {
        setIsLoading(false);
        setIsLastPage(true);
      });
  };

  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }
    fetchProducts();
    // eslint-disable-next-line
  }, [filterData, page, searchParams]);

  return (
    <div>
      <ProductListing
        params={isSlugRoute ? slug : undefined}
        products={products}
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
};

export default ProductsClient;
