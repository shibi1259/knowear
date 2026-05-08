"use client";
import React, { useContext, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import WishlistButton from "../buttons/wishlist/WishlistButton";
import { ProductCardProps } from "@/types/productCard.types";
import { StateContext } from "@/providers/state/StateContext";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import api from "@/config/api.interceptor";
import { endpoints } from "@/app/_constants/endpoints/endpoints";
import { toast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

const ProductCard = (props: {
  productDetails: ProductCardProps;
  wishlist?: boolean;
}) => {
  const router = useRouter();
  const { wishlistDetails, getWishlistDetails, getCartDetails } =
    useContext(StateContext);
  const [isWishlisted, setIsWishlisted] = React.useState(false);

  useEffect(() => {
    const wishlistIds =
      wishlistDetails &&
      wishlistDetails?.map((wishlistItem: any) => {
        return wishlistItem.params.slug;
      });
    const isWishlisted =
      wishlistIds?.includes(props.productDetails.params.slug) || false;
    setIsWishlisted(isWishlisted);
  }, [wishlistDetails]);

  const handleWishlist = () => {
    api
      .post(endpoints.manageWishList, {
        slug: props.productDetails?.params?.slug,
      })
      .then((res) => {
        if (res?.data?.errorCode == 0) {
          getWishlistDetails();
        } else {
        }
      })
      .catch((error: any) => {});
  };

  const addToCart = () => {
    if (props.productDetails?.isCart) {
      router.push("/cart");
      return;
    }
    api
      .post(endpoints.addToCart, {
        product: props.productDetails.params.slug,
        quantity: 1,
      })
      .then((response: any) => {
        if (response.data.errorCode == 0) {
          getCartDetails();
          getWishlistDetails();
          toast({ description: response.data.message, variant: "success" });
        } else {
          toast({ description: response.data.message, variant: "destructive" });
          getCartDetails();
        }
      })
      .catch((error: any) => {});
  };

  return (
    <>
      {props.productDetails && (
        <div
          className={`group border border-[#DEDEDE] ${
            props?.wishlist ? "bg-[#FAFAFA]" : ""
          }`}
        >
          <div className="relative bg-white">
            <Link
              href={`/p/${props.productDetails?.params?.slug}`}
              className="relative"
            >
              <Image
                width={858}
                height={1317}
                src={props.productDetails.thumbnail.thumbnail}
                alt={props.productDetails.name.text}
                className="w-full object-cover group-hover:opacity-100 group-hover:visibility-visible transition-all duration-300 ease-in-out"
              />
              <Image
                width={858}
                height={1317}
                src={props.productDetails.hoverMedias.thumbnail}
                alt={props.productDetails.name.text}
                className="w-full object-cover absolute top-0 left-0 h-full transition-opacity duration-300 ease-in-out opacity-0 group-hover:opacity-100 
      will-change-transform translate-z-0 backface-hidden pointer-events-none z-10"
              />
            </Link>
            <div className="absolute top-[9px] lg:top-[10px] left-[11px] lg:left-[9px]  right-[11px] lg:right-[unset]  bg-white text-[10px] lg:text-xs text-[#757575] font-normal h-6 px-1 lg:px-[10px] grid place-items-center whitespace-nowrap line-clamp-1 w-fit">
              {props.productDetails.donationPercentage.text}
            </div>
            <div className="absolute bottom-0 left-0 bg-[#364A46] text-xs text-white font-normal h-[18px] md:h-6 px-[6px] md:px-[10px] grid place-items-center">
              New
            </div>
            <div className="absolute bottom-[18px] lg:bottom-[unset] lg:top-4  right-[11px] lg:right-3 z-10">
              <WishlistButton
                productSlug={props.productDetails.params.slug}
                isWishlisted={isWishlisted}
              />
            </div>
          </div>
          <Link
            className={`${
              !props?.wishlist ? "bg-white" : ""
            } px-2 lg:px-4 pt-3 lg:pt-4 pb-4 lg:pb-5 border-t border-gray-200 block`}
            href={`/p/${props.productDetails?.params?.slug}`}
          >
            <h6 className="text-black text-sm md:text-base font-medium line-clamp-1">
              {props.productDetails.name.text}
            </h6>
            <p className="hidden lg:block text-sm font-normal text-gray-500 line-clamp-1 leading-5">
              {props.productDetails.overview.text}
            </p>
            <ul className="flex items-center space-x-2 mt-3 lg:mt-4 whitespace-nowrap">
              <li className="text-black text-sm lg:text-base font-medium">
                {props?.productDetails.price.text}
              </li>
              {props?.productDetails?.actualPrice.text && (
                <li className="text-gray-400 text-xs lg:text-base font-normal line-through">
                  {props?.productDetails.actualPrice.text}
                </li>
              )}
              {props?.productDetails.percentageOff.text && (
                <li className="text-xs text-black font-normal bg-gray-300 h-4 lg:h-6 px-1 flex items-center">
                  {props?.productDetails.percentageOff.text}
                </li>
              )}
            </ul>
          </Link>
          {props?.wishlist ? (
            <div className="flex gap-2.5 h-[30px] md:h-[45px] ml-[9px] mr-3 mb-2.5 md:mb-[17px] md:ml-[15px] md:mr-[16px]">
              <Button
                onClick={addToCart}
                className="flex items-center gap-x-3 justify-center grow h-full hover:bg-black text-white bg-black rounded-none"
              >
                <svg
                  width="19"
                  height="18"
                  viewBox="0 0 19 18"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="max-md:hidden"
                >
                  <path
                    d="M7.4375 16.375C7.8172 16.375 8.125 16.0672 8.125 15.6875C8.125 15.3078 7.8172 15 7.4375 15C7.0578 15 6.75 15.3078 6.75 15.6875C6.75 16.0672 7.0578 16.375 7.4375 16.375Z"
                    stroke="white"
                    stroke-width="1.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M15.6875 16.375C16.0672 16.375 16.375 16.0672 16.375 15.6875C16.375 15.3078 16.0672 15 15.6875 15C15.3078 15 15 15.3078 15 15.6875C15 16.0672 15.3078 16.375 15.6875 16.375Z"
                    stroke="white"
                    stroke-width="1.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M1.25 1.25H4.25L6.26 11.0691C6.32858 11.4067 6.51643 11.71 6.79066 11.9258C7.06489 12.1417 7.40802 12.2563 7.76 12.2497H15.05C15.402 12.2563 15.7451 12.1417 16.0193 11.9258C16.2936 11.71 16.4814 11.4067 16.55 11.0691L17.75 4.91658H5"
                    stroke="white"
                    stroke-width="1.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
                <p className="font-medium text-xs md:text-[17px] max-md:uppercase leading-5 ">
                  {props.productDetails?.isCart ? "Go to Cart" : "Move to Cart"}
                </p>
              </Button>
              <button
                onClick={handleWishlist}
                className="size-[30px] md:size-[45px] border border-[#DEDEDE] flex items-center justify-center"
              >
                <Trash2 className="text-[#FF9C9C] size-[18px]" />
              </button>
            </div>
          ) : (
            <></>
          )}
        </div>
      )}
    </>
  );
};

export default ProductCard;
