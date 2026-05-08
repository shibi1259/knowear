import { useState, ReactNode, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import React from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { endpoints } from "@/app/_constants/endpoints/endpoints";
import api from "@/config/api.interceptor";
import Image from "next/image";

interface AddToCartSheetProps {
  triggerButton: ReactNode;
  productDetails: any;
  quantity: number;
  getCartDetails: () => Promise<void>;
  isAuthenticated: boolean;
  addToCart?: (item: any) => void;
  setOpen?: (open: boolean) => void;
  open?: boolean;
  onContinueAsGuest?: () => void;
  onSignIn?: () => void;
  isCheckout?: boolean;
}

export default function AddToCartSheet({
  triggerButton,
  productDetails,
  quantity,
  getCartDetails,
  isAuthenticated = false,
  addToCart,
  setOpen: setExternalOpen,
  open: externalOpen,
  onContinueAsGuest,
  onSignIn,
  isCheckout = false,
}: AddToCartSheetProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  // Use either external or internal open state
  const open = externalOpen !== undefined ? externalOpen : internalOpen;
  const setOpen = setExternalOpen || setInternalOpen;

  // Handle effect to sync external open state if provided
  useEffect(() => {
    if (externalOpen !== undefined) {
      setInternalOpen(externalOpen);
    }
  }, [externalOpen]);

  const handleAddToCart = async () => {
    if (isCheckout) {
      // If it's checkout flow, don't add to cart
      if (onContinueAsGuest) {
        const params = new URLSearchParams(searchParams.toString());
        params.set("guest", "true");

        try {
          onContinueAsGuest();
        } catch (error) {
          console.error("Error continuing as guest:", error);
          toast({ title: "Error continuing as guest", variant: "destructive" });
        }
      }
      setOpen(false);
      return;
    }

    setLoading(true);
    try {
      const response = await api.post(endpoints.addToCart, {
        product: productDetails?.params?.slug,
        quantity: quantity,
      });

      if (response.data.errorCode === 0) {
        await getCartDetails();
        setOpen(false);
        if (addToCart) {
          addToCart(productDetails); // Open the mini cart after adding
        }
        toast({ description: "Product added to cart successfully" });
      } else {
        toast({ description: response.data.message, variant: "destructive" });
        await getCartDetails();
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast({ title: "Error adding to cart", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleAuthAction = () => {
    if (isAuthenticated) {
      // If logged in, add to cart
      handleAddToCart();
    } else {
      // If customized sign in action is provided, use it
      if (onSignIn) {
        onSignIn();
      } else {
        // Default behavior - navigate to sign in page with current page as return URL
        const currentUrl =
          pathname +
          (searchParams.toString() ? `?${searchParams.toString()}` : "");
        router.push(
          `/p/${productDetails?.params?.slug}?view=signup&redirect=/checkout}`
        );
      }
    }
    setOpen(false);
  };

  const handleButtonClick = () => {
    if (isAuthenticated) {
      // If authenticated, add to cart directly
      handleAddToCart();
    } else {
      // If not authenticated, open the sheet
      setOpen(true);
    }
  };

  return (
    <>
      {/* Render the passed button and attach the open event */}
      {triggerButton &&
        React.cloneElement(triggerButton as React.ReactElement, {
          onClick: handleButtonClick,
        })}

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle className="font-jost font-semibold text-xl sm:text-2xl md:text-[25px] pt-4 md:pt-[36px] leading-none">
              {isCheckout ? "Checkout Options" : "Add to Cart Options"}
            </SheetTitle>
          </SheetHeader>

          {/* Responsive Buttons Container */}
          <div className="mt-4 md:mt-6 flex flex-col sm:grid sm:grid-cols-2 gap-3 md:gap-4 pt-6 md:pt-[40px]">
            <Button
              variant="outline"
              onClick={handleAuthAction}
              disabled={loading}
              className="w-full h-10 sm:h-12 md:h-[50px] border border-solid py-1 px-3 md:py-[5px] md:px-[20px] gap-2 md:gap-[10px] font-jost font-medium text-base md:text-lg leading-tight md:leading-20px tracking-normal rounded-none"
            >
              Sign In/Sign Up
            </Button>

            <Button
              variant="secondary"
              onClick={handleAddToCart}
              disabled={loading}
              className="w-full h-10 sm:h-12 md:h-[50px] pt-[0.75] bg-black text-white hover:bg-black hover:text-white border border-solid border-black py-1 px-3 md:py-[5px] md:px-[20px] gap-2 md:gap-[10px] font-jost font-medium text-base md:text-lg leading-tight md:leading-20px tracking-normal rounded-none"
            >
              Continue as Guest
            </Button>
          </div>
          <SheetDescription className="pt-6 md:pt-[40px] font-jost text-[13px] sm:text-sm leading-normal md:leading-relaxed tracking-normal font-normal">
            To view and take advantage of our full range of exclusive deals,
            member-only discounts, and enhanced features, please log in to your
            account.
          </SheetDescription>
          <SheetFooter className="absolute bottom-0 left-0 right-0 bg-white p-4 sm:p-6 md:p-8">
            <div className="flex flex-col items-center justify-center pt-10 mb-5 gap-2 w-full">
              <Image
                src={"/icons/discount.png"}
                alt="Get Cash"
                width={100}
                height={100}
                className="w-[80px] h-[80px] object-cover"
              />

              <p className="text-xl font-bold text-gray-400">5%</p>
              <p className="text-base text-gray-400 font-semibold uppercase">
                Revenue Supports education
              </p>
              <p className="text-xs sm:text-sm text-gray-400 uppercase font-medium truncate  text-center">
                knowear Supported over 500+ students worldwide
              </p>
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
}
