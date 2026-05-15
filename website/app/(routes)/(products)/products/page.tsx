import { cookies } from "next/headers";
import React from "react";

import { endpoints } from "@/app/_constants/endpoints/endpoints";
import ProductsClient from "./ProductsClient";

type SearchParams = { [key: string]: string | string[] | undefined };

type FetchedInitial = {
  products: any[];
  filters: any;
  isLastPage: boolean;
  totalResults: number;
};

async function fetchInitialProducts(
  searchParams: SearchParams
): Promise<FetchedInitial> {
  try {
    const token = cookies().get("access_token")?.value;
    const deviceToken = cookies().get("device_token")?.value;

    const search =
      typeof searchParams?.search === "string" ? searchParams.search : "";

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}${endpoints.productsByCategory}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Devicetoken: deviceToken ?? "",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({
          category: [],
          priceFrom: undefined,
          priceTo: undefined,
          limit: 24,
          page: 1,
          sort: "2",
          attributes: [],
          search,
        }),
        next: { revalidate: 60 },
      }
    );

    if (!res.ok) {
      return {
        products: [],
        filters: {},
        isLastPage: true,
        totalResults: 0,
      };
    }

    const json = await res.json();
    if (json?.errorCode !== 0) {
      return {
        products: [],
        filters: {},
        isLastPage: true,
        totalResults: 0,
      };
    }

    const result = json?.result;
    const productsRoot = result?.products;
    const attributes = result?.filters?.attributes || [];

    return {
      products: productsRoot?.product_items || [],
      filters: {
        color: attributes.find((item: any) => item._id === "Color"),
        sizes: attributes.find((item: any) => item._id === "Size"),
        price: result?.filters?.price,
        category: result?.filters?.categories,
      },
      isLastPage: !!productsRoot?.last_page,
      totalResults: productsRoot?.total_items || 0,
    };
  } catch {
    return {
      products: [],
      filters: {},
      isLastPage: true,
      totalResults: 0,
    };
  }
}

const ProductsPage = async ({
  searchParams,
}: {
  searchParams: SearchParams;
}) => {
  const initial = await fetchInitialProducts(searchParams || {});

  return (
    <ProductsClient
      initialProducts={initial.products}
      initialFilters={initial.filters}
      initialIsLastPage={initial.isLastPage}
      initialTotalResults={initial.totalResults}
    />
  );
};

export default ProductsPage;
