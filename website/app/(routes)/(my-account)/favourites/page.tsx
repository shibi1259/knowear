"use client";
import React, { useContext, useEffect } from "react";
import dynamic from "next/dynamic";
import { StateContext } from "@/providers/state/StateContext";
import { ProductCardProps } from "@/types/productCard.types";
import EmptyWishlist from "@/app/shared/empty-states/empty-wishlist/EmptyWishlist";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useRouter } from "next/navigation";
import arrowIcon from "../../../../public/icons/backArrow.svg";
import ArrowLeft from "@/public/svgs/ArrowLeft";

type Props = {};

const ProductCard = dynamic(
  () => import("@/app/shared/product-card/ProductCard"),
  {
    ssr: false,
  }
);

const Favourites = (props: Props) => {
  const router = useRouter();
  const { wishlistDetails, getWishlistDetails } = useContext(StateContext);

  useEffect(() => {
    getWishlistDetails();
  }, []);

  const handleBackClick = () => {
    router.back();
  };

  return (
    <>
      <div className="flex justify-start items-center gap-[9px] mb-[22px] md:mb-[30px]">
        <Button
          variant="ghost"
          className="p-0 h-[unset] md:hidden"
          onClick={handleBackClick}
        >
          <ArrowLeft />
        </Button>
        <h1 className="text-black text-xl lg:text-[35px] font-medium lg:font-semibold leading-[50.58px]">
          Wishlist
        </h1>
      </div>
      {wishlistDetails.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 max-md:gap-x-4 max-md:gap-y-[47px]">
          {wishlistDetails?.map((product: ProductCardProps) => (
            <ProductCard
              key={product.params.slug}
              productDetails={product}
              wishlist={true}
            />
          ))}
        </div>
      ) : (
        <div className="mt-20">
          <EmptyWishlist />
        </div>
      )}
    </>
  );
};

export default Favourites;
