"use client";
import React, { useContext, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import WishlistButton from "../buttons/wishlist/WishlistButton";
import { StateContext } from "@/providers/state/StateContext";

const SearchProductCard = (props: {
  productDetails: any;
  wishlistDetails: any;
  setSearchPopUp:(item:boolean)=>void;
}) => {
  //   const { wishlistDetails } = useContext(StateContext);
  const [isWishlisted, setIsWishlisted] = React.useState(false);

  useEffect(() => {
    const wishlistIds =
    props?.wishlistDetails &&
    props?.wishlistDetails?.map((wishlistItem: any) => {
        return wishlistItem.params.slug;
      });
    const isWishlisted =
      wishlistIds?.includes(props.productDetails.params.slug) || false;
    setIsWishlisted(isWishlisted);
    // eslint-disable-next-line
  }, [props?.wishlistDetails]);

  return (
    <>
      {props.productDetails && (
        <div className="group border border-[#DEDEDE] max-w-[235px]">
          <div className="relative">
            <Link
              href={`/p/${props.productDetails?.params?.slug}`}
              className="relative"
              onClick={()=>props.setSearchPopUp(false)}
            >
              <Image
                width={858}
                height={1317}
                src={props.productDetails.thumbnail}
                alt={props.productDetails.name}
                className="w-[235px] h-[324px] object-cover group-hover:opacity-100 group-hover:visibility-visible transition-all duration-300 ease-in-out"
              />
            </Link>
            <div className="absolute top-[9px] lg:top-[10px] left-[11px] lg:left-[9px]  right-[11px] lg:right-[unset]  bg-white text-[10px] md:text-xs text-[#757575] font-normal h-6 px-1 md:px-[10px] grid place-items-center">
              {props.productDetails.donationPercentage.text}
            </div>
            {/* <div className="absolute bottom-0 left-0 bg-[#364A46] text-xs text-white font-normal h-[18px] md:h-6 px-[6px] md:px-[10px] grid place-items-center">
              New
            </div> */}
            <div className="absolute bottom-[18px] lg:bottom-[unset] lg:top-4  right-[11px] lg:right-3 z-10">
              <WishlistButton productSlug={props.productDetails.params.slug} isWishlisted={isWishlisted} />
            </div>
          </div>
          <Link
            className="bg-white px-[9px] lg:px-[15px] pt-[11px] lg:pt-[14px] pb-[15px] lg:pb-[19px] border-t-[1px] border-[#DEDEDE] block"
            href={`/p/${props.productDetails?.params?.slug}`}
            onClick={()=>props.setSearchPopUp(false)}
          >
            <h6 className="text-black text-[13px] md:text-[15px] font-medium md:font-semibold line-clamp-1">
              {props.productDetails.name}
            </h6>
            <p className="block text-[13px] font-normal text-[#808080] line-clamp-1 py-[5px]">
              {props.productDetails.overview}
            </p>
            <ul className="flex justify-start items-center flex-wrap">
              <li className="w-full lg:w-auto text-black text-[13px] lg:text-base font-medium leading-4">
                {props.productDetails?.price?.text}
              </li>
              <li className="text-[#9A9AB0] text-xs lg:text-base  font-normal line-through leading-[15px] ml-1">
                {props.productDetails?.actualPrice?.text}
              </li>
              <li className="ml-[9px] text-xs text-black font-normal bg-[#D4D4D4] h-[15px] lg:h-[23px] grid place-items-center px-[2px] lg:px-1">
                {props?.productDetails?.percentageOff?.text}
              </li>
            </ul>
          </Link>
        </div>
      )}
    </>
  );
};

export default SearchProductCard;
