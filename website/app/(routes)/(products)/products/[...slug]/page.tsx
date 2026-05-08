"use client";
import { endpoints } from "@/app/_constants/endpoints/endpoints";
import ProductListing from "@/app/shared/product-listing/ProductListing";
import api from "@/config/api.interceptor";
import { useParams, useSearchParams } from "next/navigation";
import React, { useEffect } from "react";

type Props = {};

const Products = (props: Props) => {
  const params = useParams();
  const searchParams= useSearchParams()
  const [products, setProducts] = React.useState<any>([]);
  const [filters, setFilters] = React.useState({});
  const [filterData, setFilterData] = React.useState<any>({
    sort: "2",
  });
  const [isLastPage, setIsLastPage] = React.useState(false);
  const [totalResults, setTotalResults] = React.useState(0);
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(24);
  const [isLoading, setIsLoading] = React.useState(false);
  

  const fetchProducts = async () => {
    setIsLoading(true);
    const attributes = [];
    if (filterData.color) {
      attributes.push({ title: "Color", value: filterData.color });
    }
    if (filterData.size) {
      attributes.push({ title: "Size", value: filterData.size });
    }
    const slugCategory = Array.isArray(params?.slug) ? params.slug : [params.slug];
    const searchCategory = searchParams?.get('category')?.split('%25') || [];
    const combinedCategories = [...slugCategory, ...searchCategory].filter(Boolean);
    api
      .post(endpoints.productsByCategory, {
        category:combinedCategories||[],
        priceFrom: filterData?.low,
        priceTo: filterData?.high,
        limit,
        page,
        sort: filterData?.sort || "2",
        attributes:attributes,
        search:searchParams?.get('search')||''
      })
      .then((response: any) => {
        if (response.data.errorCode == 0) {
          if (page === 1) {
            setProducts(response.data.result.products?.product_items);
          } else {
            setProducts((prev: any) => [
              ...prev,
              ...response.data.result.products?.product_items,
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
          setTotalResults(response.data.result?.products?.total_items);
          setIsLastPage(response.data.result?.products?.last_page);
          setIsLoading(false);
        } else {
          setIsLoading(false);
        }
      })
      .catch((error: any) => {
        setIsLoading(false);
        setIsLastPage(true)
      });
  };

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line
  }, [filterData, page,searchParams]);
console.log("params?.slugparams?.slug",params?.slug);

  return (
    <div>
      <ProductListing
        params={params?.slug}
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

export default Products;
