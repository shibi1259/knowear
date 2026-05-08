"use client";
import React from "react";
import ProductsLanding from "./ProductsLanding";
import ProductFilterLanding from "./ProductFilterLanding";
import { ProductCardProps } from "@/types/productCard.types";

type Props = {
  deviceType?: string;
  products: Array<ProductCardProps>;
  params?: any;
  headers?:any;
  filters: any;
  isLastPage:boolean;
  filterData: any;
  isCollection?:boolean;
  setFilterData: (item: any) => void;
  isLoading: boolean;
  setIsLoading: (item: boolean) => void;
  setLimit:(item:number)=>void;
  setPage:(item:number)=>void;
};

const ProductListingLanding = (props: Props) => {
  const [isGrid, setIsGrid] = React.useState(4);

  return (
    <div className="max-w-full">
      <ProductFilterLanding
        params={props.params||[]}
        isGrid={isGrid}
        setIsGrid={setIsGrid}
        filterData={props.filterData}
        filters={props.filters}
        setFilterData={props.setFilterData}
        setPage={props.setPage}
        isCollection={props?.isCollection}
        headers={props?.headers}
      />
      <ProductsLanding
        isGrid={isGrid}
        products={props.products}
        isLoading={props.isLoading}
        setIsLoading={props.setIsLoading}
        isLastPage={props.isLastPage}
        setPage={props.setPage}
        setLimit={props.setLimit}
      />
    </div>
  );
};

export default ProductListingLanding;
