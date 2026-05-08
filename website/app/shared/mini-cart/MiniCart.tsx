"use client";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTrigger,
} from "@/components/ui/sheet";
import userIcon from "../../../public/icons/user.svg";
import React, { Suspense, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import AddToCartButton from "../buttons/add-to-cart/AddToCartButton";
import CartProduct from "../cartList/CartProduct";
import api from "@/config/api.interceptor";
import { endpoints } from "@/app/_constants/endpoints/endpoints";
import CartEmpty from "../cart-empty/CartEmpty";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import SheetPopup from "../sheet-popup/SheetPopup";
import AppLoader from "../app-loader/AppLoader";
import Cookies from "js-cookie";
import AddToCartSheet from "../add-to-cart-sheet/AddToCartSheet";

interface ProductDetails {
  params: {
    slug: string;
  };
  // Add other required properties here
}

const MiniCart = (props: any) => {
  const {
    open,
    setOpen,
    addToCart,
    cartDetails,
    wishlistDetails,
    getCartDetails,
  } = props.props;
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [deleteProductOpen, setDeleteProductOpen] = React.useState(false);
  const [selectedProductSlug, setSelectedProductSlug] = React.useState("");
  const token = Cookies.get("access_token");
  const [authSheetOpen, setAuthSheetOpen] = useState(false);
  const [checkoutProductDetails, setCheckoutProductDetails] = useState<ProductDetails | null>(null);
  // useEffect(() => {
  //   console.log(props.props.cartDetails, "product detailsqwqwqw");
  //   const cart = props.props.cartDetails;
  //   if (cart) { 
  //     if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
  //       // Optiow ultimat enal debug log
        
  //       trackAddToCart(cartDetails);  
  //     }
  //   }
  // }, [pathname, cartDetails]);
  
  useEffect(() => {
    const viewParam = searchParams.get("view");
    if (viewParam === "cart") {
      setOpen(true);
    }
  }, [searchParams, setOpen]);

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

  const productRemoveHandler = (e: any) => {
    setDeleteProductOpen(true);
    setSelectedProductSlug(e);
  };

  const handleSheetOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      const params = new URLSearchParams(searchParams.toString());
      params.set("view", "cart");
      router.replace(`?${params.toString()}`, { scroll: false });
    } else {
      router.replace(pathname, { scroll: false });
    }
    setOpen(isOpen);
  };

  const removeFromCart = () => {
    api
      .post(endpoints.removeFromCart, {
        product: selectedProductSlug,
      })
      .then((response) => {
        if (response.data?.errorCode == 0) {
          getCartDetails();
          setDeleteProductOpen(false);
        } else {
        }
      })
      .catch((error: any) => {});
  };

  const handleCheckoutClick = (e: any) => {
    if (!token) {
      e.preventDefault();
      // Set dummy product details for the checkout
      setCheckoutProductDetails({
        params: {
          slug: "checkout"
        }
      });
      // Close the mini cart and open the auth sheet
      setOpen(false);
      setAuthSheetOpen(true);
    }
    // If token exists, the link will work normally and redirect to checkout
  };

  // Custom button component for the auth sheet
  const AuthSheetTrigger = React.useMemo(
    () => (
      <Button className="hidden">Auth Trigger</Button>
    ),
    []
  );

  // Handle after auth actions
  const handleAfterAuth = () => {
    // After authentication, redirect to checkout
    router.push('/checkout');
  };

  return (
    <>
      <AddToCartButton  cartDetails={cartDetails} addToCart={addToCart} setOpen={setOpen}/>
      <Sheet
        open={open}
        onOpenChange={open ? handleSheetOpenChange : addToCart}
      >
        <SheetContent
          iconClassName="md:right-[123px] md:top-[27px]"
          className="w-full sm:max-w-[683px] p-0 pt-5 md:pt-[22px] mb-0 overflow-auto"
        >
          <SheetHeader className="px-[15px] md:px-[124px]">
            {cartDetails?.products?.length ? (
              <h5 className="text-black font-medium md:font-semibold text-xl md:text-[25px]">
                My Cart ({cartDetails?.products?.length})
              </h5>
            ) : (
              <></>
            )}
          </SheetHeader>

          <SheetDescription
            className={`${
              cartDetails?.products?.length ? "" : "h-full"
            } pt-5 md:pt-[22px]`}
          >
            <div
              className={`${
                cartDetails?.products?.length
                  ? "h-full overflow-y-auto"
                  : "h-full"
              }  px-[15px] md:px-[124px] pb-5 md:pb-[49px]`}
            >
              {(!cartDetails || Object.keys(cartDetails).length === 0) ? <div className="py-10 md:py-5 px-5"><AppLoader /> </div>:
              cartDetails?.products?.length ? (
                cartDetails?.products?.map((product: any, index: number) => {
                  return (
                    <div key={index}>
                      <CartProduct
                        key={product.quantity}
                        wishlistDetails={wishlistDetails}
                        getCartDetails={getCartDetails}
                        product={product}
                        minicart
                        productRemoveHandler={productRemoveHandler}
                      />
                    </div>
                  );
                })
              ) : (
                <CartEmpty />
              )}
              {cartDetails?.products?.length ? (
                <div className="flex justify-end ">
                  <button
                    className="underline text-[13px] md:text-[15px] text-black"
                    onClick={clearCart}
                  >
                    Clear Cart
                  </button>
                </div>
              ) : (
                <></>
              )}
            </div>
            {cartDetails?.products?.length ? (
              <div className="bg-[#F3F5F7] font-bold px-[15px] md:px-[124px] sm:h-[154px] sticky w-full bottom-0 left-0 right-0 text-black pt-5 pb-5 md:pt-[18px] md:pb-[21px]">
                <div className="flex justify-between w-full font-bold">
                  <p className="text-base md:text-xl">Estimated total</p>
                  <p className="text-lg md:text-xl">
                    {cartDetails?.summary?.wholeTotal?.text}
                  </p>
                </div>
                <p className="max-md:pt-1.5 text-xs md:text-sm font-normal">
                  Taxes, discounts and shipping calculated at checkout
                </p>
                <div className="pt-5 md:pt-[15px] flex justify-between gap-x-[33px] md:gap-x-[35px]">
                  <Link className="w-full" href="/cart">
                    <Button className="h-[45px] md:h-[50px] !border !border-black !leading-none py-0 w-full flex items-center justify-center font-medium text-[15px] md:text-lg  text-black bg-white rounded-none hover:bg-white">
                      View My Cart
                    </Button>
                  </Link>
                  {token ? (
                    <Link className="w-full" href="/checkout">
                      <Button className="h-[45px] md:h-[50px] !leading-none py-0 w-full flex items-center justify-center font-medium text-[15px] md:text-lg text-white bg-black rounded-none hover:bg-black">
                        Check Out
                      </Button>
                    </Link>
                  ) : (
                    <Button 
                      className="h-[45px] md:h-[50px] !leading-none py-0 w-full flex items-center justify-center font-medium text-[15px] md:text-lg text-white bg-black rounded-none hover:bg-black"
                      onClick={handleCheckoutClick}
                    >
                      Check Out
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <></>
            )}
            <SheetPopup
              title="Remove product"
              description="Are you sure want to remove this item from your cart?"
              onClose={() => setDeleteProductOpen(false)}
              open={deleteProductOpen}
              setOpen={setDeleteProductOpen}
              onSuccess={removeFromCart}
            />
          </SheetDescription>
        </SheetContent>
      </Sheet>

      {/* Auth sheet for checkout */}
      {checkoutProductDetails && (
  <AddToCartSheet
    triggerButton={AuthSheetTrigger}
    productDetails={checkoutProductDetails}
    quantity={1}
    getCartDetails={getCartDetails}
    isAuthenticated={!!token}
    open={authSheetOpen}
    setOpen={setAuthSheetOpen}
    onContinueAsGuest={() => router.push('/checkout')}
    onSignIn={() => {
      // Get current URL and add ?view=signin to it
      const currentUrl = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : "");
      // Check if there are already query parameters
      const separator = currentUrl.includes('?') ? '&' : '?';
      router.push(`${currentUrl}${separator}view=signin`);
    }}
    isCheckout={true}
  />
)}
    </>
  );
};

const MiniCartProvider = (props: any) => {
  return (
    <Suspense>
      <MiniCart props={props} />
    </Suspense>
  );
};

export default MiniCartProvider;