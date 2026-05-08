"use client";
import React, { useState } from "react";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import CouponCard from "./CouponCard";
import { Button } from "@/components/ui/button";
import ArrowRight from "@/public/svgs/ArrowRight";
import { endpoints } from "@/app/_constants/endpoints/endpoints";
import api from "@/config/api.interceptor";
import { CartDetails } from "@/types/providers";
import { toast } from "@/hooks/use-toast";
import SuccessTick from "@/public/svgs/SuccessTick";
import DiscountShape from "@/public/svgs/DiscountShape";

type Props = {
  cartDetails: CartDetails;
  availableCoupons: any[];
  getCartDetails: () => void;
};

const ApplyCoupon = (props: Props) => {
  const [couponValue, setCouponValue] = useState("");
  console.log("props", props.cartDetails);

  const handleApplyCoupon = (coupon: string) => {
    api
      .post(endpoints.applyCoupon, {
        cart: props.cartDetails.cart,
        coupon: coupon,
      })
      .then((response: any) => {
        if (response.data?.errorCode == 0) {
          props.getCartDetails();
          console.log("response.data.message", response.data.message);

          toast({ description: response.data.message, variant: "success" });
          setCouponValue("");
        } else {
          toast({ description: response.data.message, variant: "destructive" });
        }
      })
      .catch((error: any) => { });
  };

  const removeCoupon = () => {
    api
      .post(endpoints.removeCoupon, {
        cart: props.cartDetails.cart,
        // coupon: coupon,
      })
      .then((response: any) => {
        if (response.data?.errorCode == 0) {
          props.getCartDetails();
          console.log("response.data.message", response.data.message);

          toast({ description: response.data.message, variant: "success" });
          setCouponValue("");
        } else {
          toast({ description: response.data.message, variant: "destructive" });
        }
      })
      .catch((error: any) => { });
  };

  return (
    <div>
      {props.cartDetails?.appliedCoupon?.value ? (
        <div className="flex justify-between items-baseline w-full bg-[#F9F9F9] py-4 px-[21px]">
          <div>
            <h3 className="font-bold text-sm">
              <span className="pr-1">
                {`'${props.cartDetails?.appliedCoupon?.coupon}'`}
              </span>
              Applied
            </h3>
            <div className="mt-1.5 flex gap-1.5">
              <SuccessTick />
              <span className="font-semibold text-sm">
                {props.cartDetails?.appliedCoupon?.amount}
                <span className="font-normal text-black text-opacity-50">
                  Coupon savings
                </span>
              </span>
            </div>
          </div>
          <button onClick={() => removeCoupon()} className="underline text-sm font-normal">Remove</button>
        </div>
      ) : (
        <Sheet>
          <SheetTrigger className="w-full h-14 bg-[#F9F9F9] px-4">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center justify-start gap-x-3">
                <DiscountShape />
                <div>Apply Coupon</div>
              </div>
              <ArrowRight />
            </div>
          </SheetTrigger>
          <SheetContent
            iconClassName={"max-md:top-[49px]"}
            className="w-full sm:max-w-[683px] md:pt-[36px] md:px-[54px] max-md:pt-[45px] max-md:px-[15px]"
            iconTop={"md:top-[26px]"}
          >
            <SheetHeader>
              <SheetTitle className="text-2xl leading-[28.9px] md:leading-[19px]">Available Coupons</SheetTitle>
            </SheetHeader>
            <div className="mt-[29px] mb-[20px] h-[50px] bg-[#F9F9F9] w-full flex items-center pl-5 pr-[13px] md:pr-6  py-[15px] justify-between border border-[#E8EAED]">
              <Input
                type="text"
                placeholder="Enter your coupon code"
                onChange={(e) => setCouponValue(e.target.value)}
                className="w-full text-base px-0 placeholder:text-base text-black text-opacity-50 font-normal border-0 bg-transparent"
              />
              <Button
                onClick={() => handleApplyCoupon(couponValue)}
                className="h-[25px] bg-black text-white hover:bg-black flex items-center justify-center px-2.5 font-normal text-sm rounded-none"
              >
                Apply
              </Button>
            </div>
            {props?.availableCoupons?.length > 0 ? (
              <div>
                <div className="h-px w-full mb-5 bg-[#D8D8D8]" />
                {props?.availableCoupons?.map((coupon: any, index: number) => (
                  <div
                    key={index}
                    className="flex justify-between py-2 pl-2 pr-2 md:pr-6 bg-[#F3F5F7] md:mb-[20px] mb-[15px]"
                  >
                    <div className="flex gap-5 justify-between w-full">
                      <div className="bg-black text-white w-[33px] min-h-[96px] flex items-center justify-center px-4 ">
                        <p className="-rotate-90 whitespace-nowrap text-[13px] font-bold">
                          {coupon?.value}
                        </p>
                      </div>
                      <div className="pt-4 flex justify-between w-full">
                        <div>
                          <h3 className="font-bold text-[13px] capitalize">
                            {coupon?.coupon}
                          </h3>
                          <p className="pt-3 text-black text-opacity-50 text-sm">
                            {coupon?.message}
                          </p>
                        </div>
                        <Button
                          onClick={() => {
                            handleApplyCoupon(coupon?.coupon);
                          }}
                          className="h-[25px] bg-black text-white hover:bg-black flex items-center justify-center px-2.5 font-normal text-sm rounded-none"
                        >
                          Apply
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="font-medium text-sm md:text-base text-center text-black opacity-50">
                No Coupons Available
              </div>
            )}
            <div>
              <CouponCard />
            </div>
          </SheetContent>
        </Sheet>
      )}
    </div>
  );
};

export default ApplyCoupon;
