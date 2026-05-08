"use client";
import { endpoints } from "@/app/_constants/endpoints/endpoints";
import { Button } from "@/components/ui/button";
import { Toast } from "@/components/ui/toast";
import api from "@/config/api.interceptor";
import { StateContext } from "@/providers/state/StateContext";
import WishList from "@/public/svgs/WishList";
import WishList2 from "@/public/svgs/Wishlist2";
import WishList3 from "@/public/svgs/Wishlist3";
import WishListPdp from "@/public/svgs/WishListPdp";
import React, { useContext, useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useToast } from "@/hooks/use-toast";

type Props = {
  productSlug: string;
  isWishlisted: boolean;
  isPdp?: boolean;
  isCart?: boolean;
};

const WishlistButton = (props: Props) => {
  const { productSlug, isWishlisted, isPdp, isCart } = props;
  const { getWishlistDetails } = useContext(StateContext);
  const token = Cookies.get("access_token");
  const { toast } = useToast();

  const handleWishlist = () => {
  
    if (!token) {
      toast({ title: "Please login, to add to wishlist"});
      return;
    }

    api
      .post(endpoints.manageWishList, { slug: productSlug })
      .then((res) => {
        if (res?.data?.errorCode == 0) {
          getWishlistDetails();
        } else {
        }
      })
      .catch((error: any) => { });
  };

  return (
    <>
      {isPdp ? (
        <Button
          className="p-0 h-[50px] w-[50px] bg-transparent   hover:scale-110 border border-[#D1D5DB] rounded-none"
          onClick={() => handleWishlist()}
        >
          <WishListPdp fill={isWishlisted ? "#000" : "#fff"} />
        </Button>
      ) : (
        <Button
          className="p-0 h-[unset] bg-transparent hover:scale-110 border-none rounded-none"
          onClick={() => handleWishlist()}
        >
          {isCart ? (
            <>
              <WishList2
                className="h-[21px] w-6 max-md:hidden"
                fill={isWishlisted ? "#000" : "#fff"}
              />
              <WishList3 className="md:hidden" fill={isWishlisted ? "#000" : "#fff"} />
            </>
          ) : (
            <WishList fill={isWishlisted ? "#000" : "#fff"} className="h-[20px] w-[20px]" />
          )}
        </Button>
      )}
    </>
  );
};

export default WishlistButton;
