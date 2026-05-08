"use client";
import { endpoints } from "@/app/_constants/endpoints/endpoints";
import AppLoader from "@/app/shared/app-loader/AppLoader";
import BreadCrumbs from "@/app/shared/breadcrumbs/BreadCrumbs";
import CartEmpty from "@/app/shared/cart-empty/CartEmpty";
import CartInfo from "@/app/shared/cartInfo/CartInfo";
import ApplyCoupon from "@/app/shared/cartList/ApplyCoupon";
import CartList from "@/app/shared/cartList/CartList";
import DeliveryInstructionsOption from "@/components/Modal/DeliveryNote";
import GiftWrapOption from "@/components/Modal/GiftWrapOption";
import api from "@/config/api.interceptor";
import { StateContext } from "@/providers/state/StateContext";
import Image from "next/image";
import Link from "next/link";
import React, { Suspense, useContext, useEffect, useState } from "react";

type Props = {};

const Cart = (props: Props) => {
  const { cartDetails, getCartDetails, wishlistDetails } =
    useContext(StateContext);
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [hasGiftWrap, setHasGiftWrap] = useState(
    cartDetails?.summary?.giftWrap?.enabled || false
  );
  // const [giftWrapAmount, setGiftWrapAmount] = useState(0);
  const [deliveryInstructions, setDeliveryInstructions] = useState("");

  useEffect(() => {
    if (cartDetails?.cart) {
      getCoupons();
      // getGiftWrapAmount();
      fetchDeliveryInstructions(cartDetails);
    }
  }, [cartDetails]);

  const clearCart = () => {
    api
      .post(endpoints.clearCart, {})
      .then((response: any) => {
        if (response.data?.errorCode == 0) {
          getCartDetails();
        } else {
        }
      })
      .catch((error: any) => {});
  };
  const handleDeliveryInstructionsChange = (instructions: string) => {
    setDeliveryInstructions(instructions);
    api.post(endpoints.addDeliveryNote, {
      note: instructions,
      cartId: cartDetails.cart,
    });
    // Add API call here to save delivery instructions to backend
  };
  const fetchDeliveryInstructions = async (cartDetails: any) => {
    // Check if cartId is available before calling the API
    if (!cartDetails.cart) {
      console.error("Cart ID is missing.");
      return;
    }
    // Call the API to fetch delivery instructions from backend
    try {
      const response = await api.post(endpoints.getDeliveryNoteDetails, {
        cartId: cartDetails.cart,
      });
      if (response.data?.errorCode == 0) {
        setDeliveryInstructions(response.data.result.note);
      } else {
        console.error("Failed to fetch delivery instructions.");
      }
    } catch (error) {
      console.error("Error fetching delivery instructions:", error);
    }
  };
  const getCoupons = () => {
    api
      .post(endpoints.coupons)
      .then((response: any) => {
        if (response.data?.errorCode == 0) {
          setAvailableCoupons(response.data.result.availableCoupons);
        } else {
        }
      })
      .catch((error: any) => {});
  };

  const getGiftWrapAmount = () => {
    api
      .get(endpoints.getGiftWrapDetails)
      .then((response: any) => {
        if (response.data?.errorCode == 0) {
          // setGiftWrapAmount(response.data.result.giftCharge);
        } else {
        }
      })
      .catch((error: any) => {});
  };

  const handleGiftWrapChange = (enabled: boolean) => {
    setHasGiftWrap((prev: any) => !prev);

    const endpoint = enabled
      ? endpoints.applyGiftWrap
      : endpoints.removeGiftWrap;

    api
      .post(endpoint, {
        cart: cartDetails?.cart,
      })
      .then((response: any) => {
        if (response.data?.errorCode == 0) {
          getCartDetails();
        } else {
          // Revert the local state if API call fails
          setHasGiftWrap((prev: any) => !prev);
        }
      })
      .catch((error: any) => {
        console.error(
          `Error ${enabled ? "applying" : "removing"} gift wrap:`,
          error
        );
        // Revert the local state on error
        setHasGiftWrap((prev: any) => !prev);
      });
  };

  return (
    <Suspense>
      <section
        className={
          cartDetails?.products?.length
            ? " md:bg-gradient-to-r from-[#F3F5F7] from-50% to-white to-50% max-md:bg-[#F3F5F7]"
            : ""
        }
      >
        {!cartDetails || Object.keys(cartDetails).length === 0 ? (
          <div className="py-10 md:py-5 px-5">
            <AppLoader />{" "}
          </div>
        ) : cartDetails?.products?.length ? (
          <div className="md:container max-w-full">
            <div className="grid grid-cols-2">
              <div className="col-span-2 lg:col-span-1 lg:pr-14 mt-[26px] md:mt-5 max-md:mb-[62px]  max-md:px-[15px]">
                <h1 className="text-xl font-medium md:text-[25px] md:font-semibold leading-[28.9px] md:leading-[36.13px]">
                  My Cart ({cartDetails.products.length})
                </h1>
                <CartList
                  wishlistDetails={wishlistDetails}
                  getCartDetails={getCartDetails}
                  products={cartDetails.products}
                  isCart
                />
                <div className="flex justify-end">
                  {/* <GiftWrapOption
                      onGiftWrapChange={handleGiftWrapChange}
                      cartDetails={cartDetails}
                      giftWrapAmount={giftWrapAmount}
                    />
                    <DeliveryInstructionsOption
                      onDeliveryInstructionsChange={handleDeliveryInstructionsChange}
                      cartDetails={cartDetails}
                      existingInstructions={deliveryInstructions}
                    /> */}
                  <button className="underline" onClick={clearCart}>
                    Clear Cart
                  </button>
                </div>
              </div>
              <div className="col-span-2 lg:col-span-1  max-md:px-[15px] max-md:pt-5">
                <CartInfo
                  cartDetails={cartDetails}
                  availableCoupons={availableCoupons}
                  getCartDetails={getCartDetails}
                  // hasGiftWrap={hasGiftWrap}
                  //  deliveryInstructions={deliveryInstructions}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="py-10 md:py-5 px-5">
            <CartEmpty isCartPage={true} />
          </div>
        )}
        <div className=" bg-white border-t border-b flex flex-col items-center justify-center  pt-40 pb-5 mb-5 gap-2">
          <div
            className="w-[80px] h-[80px] bg-gray-300 mask mask-image"
            style={{
              WebkitMaskImage: "url(/icons/people.png)",
              WebkitMaskRepeat: "no-repeat",
              WebkitMaskSize: "cover",
            }}
          />

          <p className="text-xl font-bold text-gray-400">500+</p>
          <p className="text-base text-gray-400 font-semibold uppercase">
            Student Supported
          </p>
          <p className="text-sm text-gray-400 uppercase font-medium">
            5% of Every purchase is donated to education
          </p>
        </div>
      </section>
    </Suspense>
  );
};

export default Cart;
