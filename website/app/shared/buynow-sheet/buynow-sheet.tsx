// import { useState, ReactNode, useEffect } from "react";
// import {
//   Sheet,
//   SheetContent,
//   SheetDescription,
//   SheetHeader,
//   SheetTitle,
//   SheetFooter,
// } from "@/components/ui/sheet";
// import { Button } from "@/components/ui/button";
// import React from "react";
// import { useRouter, useSearchParams, usePathname } from "next/navigation";
// import { useToast } from "@/hooks/use-toast";
// import { endpoints } from "@/app/_constants/endpoints/endpoints";
// import api from "@/config/api.interceptor";

// interface BuyNowSheetProps {
//   triggerButton: ReactNode;
//   productDetails: any; // You might want to type this properly based on your product structure
//   quantity: number;
//   getCartDetails: () => Promise<void>;
//   isAuthenticated: boolean; // New prop to check if user is logged in
// }

// export default function BuyNowSheet({
//   triggerButton,
//   productDetails,
//   quantity,
//   getCartDetails,
//   isAuthenticated = false, // Default to not authenticated
// }: BuyNowSheetProps) {
//   const [open, setOpen] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const { toast } = useToast();
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const pathname = usePathname();

//   const handleBuyNow = async (isGuest = false) => {
//     setLoading(true);
//     try {
//       const response = await api.post(endpoints.BuyNow, {
//         product: productDetails?.params?.slug,
//         quantity: quantity,
//         buynow: true,
//       });

//       if (response.data.errorCode === 0) {
//         const params = new URLSearchParams(searchParams.toString());
//         params.set("buynow", "true");
//         if (isGuest) {
//           params.set("guest", "true");
//         }
//         await getCartDetails();
//         setOpen(false);
//         await router.replace(`/checkout?${params.toString()}`, { scroll: false });
//       } else {
//         toast({ description: response.data.message, variant: "destructive" });
//         await getCartDetails();
//       }
//     } catch (error) {
//       console.error("Error in buy now:", error);
//       toast({ title: "Error processing buy now", variant: "destructive" });
//     } finally {
//       setLoading(false);
//     }
//   };

//   // const handleAuthAction = () => {
//   //   if (isAuthenticated) {
//   //     // If logged in, navigate to profile
//   //     handleBuyNow(false);
//   //   } else {
//   //     // If not logged in, navigate to sign in page with current page as return URL
//   //     const currentUrl = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : "");
//   //     router.push(`/p/${productDetails?.params?.slug}?view=signin&redirect=/checkout?buynow=true`);
//   //   }
//   //   setOpen(false);
//   // };
//   const handleAuthAction = async () => {
//     if (isAuthenticated) {
//       // If logged in, navigate to profile
//       handleBuyNow(false);
//     } else {
//       try {
//         const response = await api.post(endpoints.BuyNow, {
//           product: productDetails?.params?.slug,
//           quantity: quantity,
//           buynow: true,
//         });

//         if (response.data.errorCode === 0) {
//           const params = new URLSearchParams(searchParams.toString());
//           params.set("buynow", "true");

//           await getCartDetails();
//         }

//         // If not logged in, navigate to sign in page with current page as return URL
//         const currentUrl = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : "");
//         router.push(`/p/${productDetails?.params?.slug}?view=signup&redirect=/checkout?buynow=true`);
//       } catch (error) {
//         console.error("Error in handleAuthAction:", error);
//       }
//     }
//     setOpen(false);
//   };
//   const handleButtonClick = () => {
//     if (isAuthenticated) {
//       // If authenticated, go directly to checkout
//       handleBuyNow(false);
//     } else {
//       // If not authenticated, open the sheet
//       setOpen(true);
//     }
//   };

//   return (
//     <>
//       {/* Render the passed button and attach the open event */}
//       {triggerButton &&
//         React.cloneElement(triggerButton as React.ReactElement, {
//           onClick: handleButtonClick,
//         })}

//       <Sheet open={open} onOpenChange={setOpen}>
//         <div>
//         <SheetContent>

//          <SheetHeader>
//            <SheetTitle className="font-jost font-semibold text-[25px] pt-12px leading-none">Checkout Options</SheetTitle>

//          </SheetHeader>

//          {/* <div className="mt-6 flex flex-col space-y-4">
//            <Button
//              className="w-full"
//              onClick={() => handleBuyNow(false)}
//              disabled={loading}
//            >
//              {loading ? "Processing..." : "Continue to checkout"}
//            </Button>
//          </div> */}

//          {/* Buttons Container */}
//          <div className="mt-6 grid grid-cols-2 gap-4 pt-[40px]">
//            <Button
//              variant="outline"
//              onClick={handleAuthAction}
//              disabled={loading}
//              className="w-[268px] h-[50px] border border-solid border-[1px] py-[5px] px-[20px] gap-[10px] font-jost font-medium text-lg leading-20px tracking-normal rounded-none"
//            >
//              Sign In/Sign Up
//            </Button>

//            <Button
//  variant="secondary"
//  onClick={() => handleBuyNow(true)}
//  disabled={loading}
//  className="w-[268px] h-[50px] bg-black text-white  hover:bg-black hover:text-white  border border-solid border-black py-[5px] px-[20px] gap-[10px] font-jost font-medium text-lg leading-20px tracking-normal rounded-none"
// >
//  Continue as Guest
// </Button>
//          </div>
//            <SheetDescription className="pt-6 md:pt-[40px] font-jost text-[13px] sm:text-sm leading-normal md:leading-relaxed tracking-normal font-normal">
//              To view and take advantage of our full range of exclusive deals,
//              member-only discounts, and enhanced features, please log in to your account.
//            </SheetDescription>
//        </SheetContent>
//         </div>

//       </Sheet>
//     </>
//   );
// }
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

interface BuyNowSheetProps {
  triggerButton: ReactNode;
  productDetails: any; // You might want to type this properly based on your product structure
  quantity: number;
  getCartDetails: () => Promise<void>;
  isAuthenticated: boolean; // New prop to check if user is logged in
}

export default function BuyNowSheet({
  triggerButton,
  productDetails,
  quantity,
  getCartDetails,
  isAuthenticated = false, // Default to not authenticated
}: BuyNowSheetProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const handleBuyNow = async (isGuest = false) => {
    setLoading(true);
    try {
      const response = await api.post(endpoints.BuyNow, {
        product: productDetails?.params?.slug,
        quantity: quantity,
        buynow: true,
      });

      if (response.data.errorCode === 0) {
        const params = new URLSearchParams(searchParams.toString());
        params.set("buynow", "true");
        if (isGuest) {
          params.set("guest", "true");
        }
        await getCartDetails();
        setOpen(false);
        await router.replace(`/checkout?${params.toString()}`, {
          scroll: false,
        });
      } else {
        toast({ description: response.data.message, variant: "destructive" });
        await getCartDetails();
      }
    } catch (error) {
      console.error("Error in buy now:", error);
      toast({ title: "Error processing buy now", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleAuthAction = async () => {
    if (isAuthenticated) {
      // If logged in, navigate to profile
      handleBuyNow(false);
    } else {
      try {
        const response = await api.post(endpoints.BuyNow, {
          product: productDetails?.params?.slug,
          quantity: quantity,
          buynow: true,
        });

        if (response.data.errorCode === 0) {
          const params = new URLSearchParams(searchParams.toString());
          params.set("buynow", "true");

          await getCartDetails();
        }

        // If not logged in, navigate to sign in page with current page as return URL
        const currentUrl =
          pathname +
          (searchParams.toString() ? `?${searchParams.toString()}` : "");
        router.push(
          `/p/${productDetails?.params?.slug}?view=signup&redirect=/checkout?buynow=true`
        );
      } catch (error) {
        console.error("Error in handleAuthAction:", error);
      }
    }
    setOpen(false);
  };

  const handleButtonClick = () => {
    if (isAuthenticated) {
      // If authenticated, go directly to checkout
      handleBuyNow(false);
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
        <SheetContent className="w-full sm:max-w-md md:max-w-lg">
          <SheetHeader>
            <SheetTitle className="font-jost font-semibold text-xl sm:text-2xl md:text-[25px] pt-2 sm:pt-3 md:pt-12px leading-none">
              Checkout Options
            </SheetTitle>
          </SheetHeader>

          {/* Buttons Container */}
          <div className="mt-4 sm:mt-5 md:mt-6 pt-4 sm:pt-6 md:pt-[40px] flex flex-col sm:grid sm:grid-cols-2 gap-3 sm:gap-4">
            <Button
              variant="outline"
              onClick={handleAuthAction}
              disabled={loading}
              className="w-full h-10 sm:h-12 md:h-[50px] border border-solid py-1 sm:py-[5px] px-3 sm:px-[20px] gap-2 sm:gap-[10px] font-jost font-medium text-base sm:text-lg leading-5 sm:leading-20px tracking-normal rounded-none"
            >
              Sign In/Sign Up
            </Button>

            <Button
              variant="secondary"
              onClick={() => handleBuyNow(true)}
              disabled={loading}
              className="w-full h-10 sm:h-12 md:h-[50px] bg-black text-white hover:bg-black hover:text-white border border-solid border-black py-1 sm:py-[5px] px-3 sm:px-[20px] gap-2 sm:gap-[10px] font-jost font-medium text-base sm:text-lg leading-5 sm:leading-20px tracking-normal rounded-none"
            >
              Continue as Guest
            </Button>
          </div>

          <SheetDescription className="pt-4 sm:pt-5 md:pt-[40px] font-jost text-xs sm:text-sm leading-normal md:leading-relaxed tracking-normal font-normal">
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
              <p className="text-xs sm:text-sm text-gray-400 uppercase font-medium truncate text-center">
                knowear Supported over 500+ students worldwide
              </p>
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
}
