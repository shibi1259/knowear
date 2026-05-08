"use client";
import { endpoints } from "@/app/_constants/endpoints/endpoints";
import AddressCard from "@/app/shared/address-card/AddressCard";
import AddressForm, {
  AddressFormHandle,
} from "@/app/shared/order-summary/AddressForm";
import OrderSummary from "@/app/shared/order-summary/OrderSummary";
import PaymentMethods from "@/app/shared/order-summary/PaymentMethods";
import UserDetails from "@/app/shared/order-summary/UserDetails";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import api from "@/config/api.interceptor";
import { toast } from "@/hooks/use-toast";
import { StateContext } from "@/providers/state/StateContext";
import { usePathname, useRouter } from "next/navigation";
import Cookies from "js-cookie";
import React, { useContext, useEffect, useRef, useState } from "react";
import GiftWrapOption from "@/components/Modal/GiftWrapOption";
import DeliveryInstructionsOption from "@/components/Modal/DeliveryNote";
import {
  trackAddToCart,
  trackCheckout,
  trackPaymentInfo,
} from "@/config/fpixel";
import * as Accordion from "@radix-ui/react-accordion";
import { ChevronDown } from "lucide-react";
import VideoBanner from "@/components/home/VideoBanner";
import Home from "@/app/page";
import CheckoutSupportBanner from "@/components/orders/CheckoutSupportBanner";
import Image from "next/image";
import SecureLock from "@/public/svgs/SecureLock";
import { trackSnapCheckoutStart } from "@/config/snapPixel";

type Props = {
  searchParams: any;
};

const Checkout = (props: Props) => {
  const {
    cartDetails: cartValues,
    getGuestUser,
    guestDetails,
  } = useContext(StateContext);
  const router = useRouter();
  const guestToken = Cookies.get("guest_access_token");
  const pathname = usePathname();
  const addressFormRef = useRef<AddressFormHandle>(null);
  const [cartDetails, setCartDetails] = useState<any>(cartValues || {});
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasGiftWrap, setHasGiftWrap] = useState(false);
  const [giftWrapAmount, setGiftWrapAmount] = useState(0);
  const [checkoutFormData, setCheckoutFormData] = useState<any>({
    email: "",
    paymentType: "",
    cardNo: "",
    cardName: "",
    expiryDate: "",
    cvv: "",
    isVerified: guestToken ? false : true,
  });
  const [isEmail, setIsEmail] = useState(false);
  const [isAddress, setIsAddress] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, getUser, address, getAddress } = useContext(StateContext);
  const defaultAddress = address?.find((item: any) => item?.isDefaultShipping);
  const [deliveryInstructions, setDeliveryInstructions] = useState("");
  const [isUpdatingDeliveryNote, setIsUpdatingDeliveryNote] = useState(false);
  const [checkoutTracked, setCheckoutTracked] = useState(false);
  const checkoutTriggeredRef = useRef(false);

  useEffect(() => {
    getGiftWrapAmount();
    if (user?.email) {
      setCheckoutFormData({
        ...checkoutFormData,
        email: user?.email,
      });
      setIsEmail(true);
      getAddress();
    } else {
      // setIsEmail(false);
    }
    if (guestDetails?.email) {
      setCheckoutFormData({
        ...checkoutFormData,
        email: guestDetails?.email,
      });
      setIsEmail(true);
    } else {
      // setIsEmail(false);
    }
    // eslint-disable-next-line
  }, [user?.email, guestDetails?.email]);

  useEffect(() => {
    if (!checkoutTriggeredRef.current && cartDetails) {
      checkoutTriggeredRef.current = true;
      setCheckoutTracked(true);
      // Track checkout event when cart details are available
      trackCheckout(cartDetails);
    }
  }, [cartDetails]);

  useEffect(() => {
    if (guestToken) {
      getGuestUser();
    }

    // Log after cart details are fetched
    getCartDetails().then((result) => {});

    // eslint-disable-next-line
  }, [guestToken]);

  useEffect(() => {
    if (defaultAddress || checkoutFormData?.guestAddress?.type) {
      setIsAddress(true);
    } else {
      setIsAddress(false);
    }
    // eslint-disable-next-line
  }, [defaultAddress, checkoutFormData?.guestAddress]);

  useEffect(() => {
    setIsLoaded(false);
    let statValue;
    let countryCode;
    if (checkoutFormData?.guestAddress?.state || defaultAddress?.state) {
      statValue =
        checkoutFormData?.guestAddress?.state || defaultAddress?.state;
      countryCode =
        checkoutFormData?.guestAddress?.country || defaultAddress?.country;

      getCartDetails(statValue, countryCode);
    } else {
      setIsLoaded(true);
      getCartDetails();
    }
  }, [checkoutFormData?.guestAddress?.state, defaultAddress?.countryCode]);
  const handleDeliveryInstructionsChange = (instructions: string) => {
    // Prevent multiple API calls if one is already in progress
    if (isUpdatingDeliveryNote) {
      return;
    }

    // Check if cartDetails exists and has a cart property before proceeding
    if (!cartDetails || !cartDetails.cart) {
      console.error("Cart details or cart ID is missing");
      return;
    }

    // Determine if we're removing the note (empty or whitespace string)
    const isRemovingNote = !instructions.trim();

    const endpoint = isRemovingNote
      ? endpoints.removeDeliveryNote
      : endpoints.addDeliveryNote;

    const payload = isRemovingNote
      ? { cartId: cartDetails.cart } // Payload for removal
      : {
          note: instructions,
          cartId: cartDetails.cart,
          _id: cartDetails.summary.deliveryNote._id,
        }; // Payload for addition/update

    // Set updating state to prevent multiple calls
    setIsUpdatingDeliveryNote(true);

    // Optimistically update UI state
    setDeliveryInstructions(isRemovingNote ? "" : instructions);

    api
      .post(endpoint, payload)
      .then((response) => {
        if (response.data?.errorCode === 0) {
          // Success! Refresh cart details
          getCartDetails().then((result) => {
            console.log(
              isRemovingNote
                ? "Delivery note successfully removed"
                : "Delivery note successfully updated",
              result
            );
          });
          console.log(address, "address after instruction");

          // Ensure `address` is valid
          if (Array.isArray(address) && address.length > 0) {
            // Find the default shipping address
            const defaultShippingAddress = address.find(
              (addr) => addr.isDefaultShipping
            );

            if (defaultShippingAddress) {
              const state = defaultShippingAddress.state || "";
              const country = defaultShippingAddress.country || "";

              console.log("Using Default Shipping Address");
              console.log("State:", state);
              console.log("Country:", country);

              const cartDetails = getCartDetails(state, country);
              console.log(cartDetails, "Cart details based on address");
            } else {
              console.warn("No default shipping address found.");
            }
          } else if (address && typeof address === "object") {
            // Single address case (not array)
            const isDefaultShipping = address.isDefaultShipping || false;
            const state = address.state || "";
            const country = address.country || "";

            console.log("Single Address Found");
            console.log("isDefaultShipping:", isDefaultShipping);
            console.log("State:", state);
            console.log("Country:", country);

            const cartDetails = getCartDetails(state, country);
            console.log(cartDetails, "Cart details based on address");
          } else {
            console.warn("Address is undefined or not valid.");
          }
        } else {
          console.error("Failed to update delivery note:", response.data);
          // Revert the UI state on failure
          setDeliveryInstructions((prev) => (isRemovingNote ? prev : ""));
          toast({
            title: "Failed to update delivery instructions",
            description: response.data?.message || "Please try again",
            variant: "destructive",
            duration: 3000,
          });
        }
      })
      .catch((error) => {
        console.error("Error updating delivery note:", error);
        // Revert the UI state on error
        setDeliveryInstructions((prev) => (isRemovingNote ? prev : ""));
        toast({
          title: "Error updating delivery instructions",
          description: error.message || "Please try again",
          variant: "destructive",
          duration: 3000,
        });
      })
      .finally(() => {
        // Reset updating state after API call completes
        setIsUpdatingDeliveryNote(false);
      });
  };
  const fetchDeliveryInstructions = async () => {
    // Check if cartDetails exists and has a cart property before proceeding
    if (!cartDetails || !cartDetails.cart) {
      console.error("Cart details or cart ID is missing.");
      return;
    }

    // Call the API to fetch delivery instructions from backend
    try {
      const response = await api.post(endpoints.getDeliveryNoteDetails, {
        cartId: cartDetails.cart,
      });
      if (response.data?.errorCode === 0) {
        setDeliveryInstructions(response.data.result.note || "");
      } else {
        console.error(
          "Failed to fetch delivery instructions:",
          response.data?.message
        );
      }
    } catch (error) {
      console.error("Error fetching delivery instructions:", error);
    }
  };

  // const handleDeliveryInstructionsChange = (instructions: string) => {
  //   setDeliveryInstructions(instructions);
  //   api.post(endpoints.addDeliveryNote, { note: instructions, cartId: cartDetails.cart })
  //   // Add API call here to save delivery instructions to backend
  // };
  // const fetchDeliveryInstructions = async (cartDetails: any) => {
  //   // Check if cartId is available before calling the API
  //   if (!cartDetails.cart) {
  //     console.error("Cart ID is missing.");
  //     return;
  //   }
  //   // Call the API to fetch delivery instructions from backend
  //   try {
  //     const response = await api.post(endpoints.getDeliveryNoteDetails, { cartId: cartDetails.cart });
  //     if (response.data?.errorCode == 0) {
  //       setDeliveryInstructions(response.data.result.note);
  //     } else {
  //       console.error("Failed to fetch delivery instructions.");
  //     }
  //   } catch (error) {
  //     console.error("Error fetching delivery instructions:", error);
  //   }
  // }
  // const getCartDetails = (state:any,countryCode:any) => {
  //   setIsLoaded(false);

  //   return new Promise((resolve, reject) => {
  //     api
  //       .post(endpoints.cart,{state:state,countryCode:countryCode})
  //       .then((res) => {
  //         if (res?.data?.errorCode == 0) {
  //           setIsLoaded(true);
  //           setCartDetails(res?.data?.result);
  //           resolve(res?.data?.result);
  //         } else {
  //           reject(res?.data?.message);
  //           toast({
  //             title: "Error fetching cart",
  //             variant: "destructive",
  //             duration: 3000,
  //           });
  //         }
  //       })
  //       .catch((error) => {
  //         console.log("error in cart fetch",error);

  //         toast({
  //           title: "Error fetching cart",
  //           variant: "destructive",
  //           duration: 3000,
  //         });
  //       });
  //   });
  // };
  const getCartDetails = (state?: any, countryCode?: any) => {
    setIsLoaded(false);
    let statValue =
      checkoutFormData?.guestAddress?.state || defaultAddress?.state;
    let countryCodeVlaue =
      checkoutFormData?.guestAddress?.country || defaultAddress?.country;

    return new Promise((resolve, reject) => {
      api
        .post(endpoints.cart, {
          state: state || statValue,
          countryCode: countryCode || countryCodeVlaue,
          ...(props?.searchParams?.buynow ? { buynow: true } : {}),
        })
        .then((res) => {
          if (res?.data?.errorCode == 0) {
            setIsLoaded(true);
            setCartDetails(res?.data?.result);
            resolve(res?.data?.result);
          } else {
            reject(res?.data?.message);
            // toast({
            //   title: "Error fetching cart",
            //   variant: "destructive",
            //   duration: 3000,
            // });
          }
        })
        .catch((error) => {
          // toast({
          //   title: "Error fetching cart",
          //   variant: "destructive",
          //   duration: 3000,
          // });
        });
    });
  };

  const handlePlaceOrderClick = async () => {
    if (addressFormRef.current?.submitForm) {
      try {
        setIsSubmitting(true);
        await addressFormRef.current.submitForm();
      } catch (error) {
        console.error("Form submission failed", error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  // const onHandlePlaceOrder = async (data: any) => {
  //   return;
  //   if (
  //     checkoutFormData?.paymentType === "cod" &&
  //     !checkoutFormData?.isVerified
  //   ) {
  //     toast({
  //       title: "Please verify your email with OTP",
  //       variant: "destructive",
  //       duration: 3000,
  //     });
  //     return;
  //   }

  //   const cartResponse: any = await getCartDetails();

  //   if (!checkoutFormData?.email) {
  //     toast({
  //       title: "Please enter email",
  //       variant: "destructive",
  //       duration: 3000,
  //     });
  //     return;
  //   }
  //   if (!checkoutFormData?.guestAddress?.type && !defaultAddress?._id) {
  //     toast({
  //       title: "Please select address",
  //       variant: "destructive",
  //       duration: 3000,
  //     });
  //     return;
  //   }
  //   console.log(
  //     "===============CHECK======================",
  //     checkoutFormData?.payment_type
  //   );
  //   if (checkoutFormData?.paymentType === "card") {
  //     if (guestToken) {
  //       const body = {
  //         cart: cartResponse?.cart || cartDetails?.cart,
  //         guestAddress: {
  //           ...(checkoutFormData?.guestAddress || data),
  //           coordinates: {
  //             latitude:
  //               data?.latitude || checkoutFormData?.guestAddress?.latitude,
  //             longitude:
  //               data?.longitude || checkoutFormData?.guestAddress?.longitude,
  //           },
  //         },
  //         paymentMethod: "network-international",
  //         guest: guestToken,
  //         deliverynote:
  //           cartResponse?.summary?.deliveryNote ||
  //           cartDetails?.summary?.deliveryNote,
  //       };

  //       api
  //         .post(endpoints.placeOrder, body)
  //         .then((response: any) => {
  //           if (response.data?.errorCode == 0) {
  //             router.push(response?.data?.result?.paymentLink);
  //           }
  //         })
  //         .catch((error: any) => {
  //           toast({
  //             title: error?.message || "Something went wrong",
  //             variant: "destructive",
  //             duration: 3000,
  //           });
  //         });
  //     } else {
  //       api
  //         .post(endpoints.placeOrder, {
  //           cart: cartDetails?.cart,
  //           address: defaultAddress?._id,
  //           paymentMethod: "network-international",
  //           deliverynote: cartDetails?.summary?.deliveryNote,
  //         })
  //         .then((response: any) => {
  //           if (response.data?.errorCode == 0) {
  //             router.push(response?.data?.result?.paymentLink);
  //             toast({ description: "Placing Order.." });
  //             window.location.href = `/order-placed?orderId=${response?.data?.result?.orderNo?.slice(
  //               1
  //             )}`;
  //             toast({
  //               description: "Order placed Successfully",
  //               variant: "success",
  //             });
  //           }
  //         })
  //         .catch((error: any) => {
  //           // toast({
  //           //   title: "Something went wrong",
  //           //   variant: "destructive",
  //           //   duration: 3000,
  //           // });
  //         });
  //     }
  //   } else {
  //     if (guestToken) {
  //       console.log(
  //         "==========IF=====COD======================",
  //         checkoutFormData?.payment_type
  //       );
  //       api
  //         .post(endpoints.placeOrder, {
  //           cart: cartDetails?.cart,
  //           guestAddress: checkoutFormData?.guestAddress,
  //           paymentMethod: "COD",
  //           guest: guestToken,
  //         })
  //         .then((response: any) => {
  //           if (response.data?.errorCode == 0) {
  //             toast({ description: "Placing Order.." });
  //             window.location.href = `/order-placed?orderId=${response?.data?.result?.orderNo?.slice(
  //               1
  //             )}`;
  //             toast({
  //               description: "Order placed Successfully",
  //               variant: "success",
  //             });
  //           }
  //         })
  //         .catch((error: any) => {
  //           toast({
  //             title: "Something went wrong",
  //             variant: "destructive",
  //             duration: 3000,
  //           });
  //         });
  //     } else {
  //       console.log(
  //         "=========ELSE======COD======================",
  //         checkoutFormData?.payment_type
  //       );

  //       api
  //         .post(endpoints.placeOrder, {
  //           cart: cartDetails?.cart,
  //           address: defaultAddress?._id,
  //           paymentMethod: "COD",
  //           deliverynote: cartDetails?.summary?.deliveryNote,
  //         })
  //         .then((response: any) => {
  //           if (response.data?.errorCode == 0) {
  //             toast({ description: "Placing Order.." });
  //             window.location.href = `/order-placed?orderId=${response?.data?.result?.orderNo?.slice(
  //               1
  //             )}`;
  //             toast({
  //               description: "Order placed Successfully",
  //               variant: "success",
  //             });
  //           }
  //         })
  //         .catch((error: any) => {
  //           toast({
  //             title: "Something went wrong",
  //             variant: "destructive",
  //             duration: 3000,
  //           });
  //         });
  //     }
  //   }
  // };

  const getGiftWrapAmount = () => {
    api
      .get(endpoints.getGiftWrapDetails)
      .then((response: any) => {
        if (response.data?.errorCode == 0) {
          setGiftWrapAmount(response.data.result.giftCharge);
        } else {
        }
      })
      .catch((error: any) => {});
  };

  const handleGiftWrapChange = (enabled: boolean) => {
    // Toggle the local gift wrap state
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
          console.log("Gift wrap setting updated successfully");

          // Check if user is logged in (has address data)
          if (address && address.length > 0) {
            // User flow - use shipping address information
            const defaultShippingAddress = address.find(
              (address: any) => address.isDefaultShipping === true
            );

            // Extract country and state from default shipping address if it exists
            if (defaultShippingAddress) {
              const { country, state } = defaultShippingAddress;
              // Pass these values to getCartDetails function
              getCartDetails(state, country);
            } else {
              // No default shipping address found, call without parameters
              getCartDetails();
            }
          } else {
            // Guest flow - call getCartDetails without parameters
            getCartDetails();
          }
        } else {
          // Revert the local state if API call fails
          setHasGiftWrap((prev: any) => !prev);
          console.error("Failed to update gift wrap setting:", response.data);
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
    <section className="py-6">
      <div className="container max-w-full">
        <div className="lg:hidden mb-6">
          <h1 className="text-xl font-medium lg:text-2xl lg:font-semibold text-gray-800 mb-3">
            Check Out
          </h1>
          <Accordion.Root
            type="single"
            collapsible
            className="w-full"
            defaultValue="order-summary"
          >
            <Accordion.Item
              value="order-summary"
              className="border border-gray-200 rounded-md"
            >
              <Accordion.Header>
                <Accordion.Trigger className="group flex w-full items-center justify-between bg-[#F3F5F7] px-4 py-2 text-sm font-medium text-gray-700 hover:bg-[#e6e8ea] rounded-md transition-colors">
                  <span className="flex items-center gap-2">
                    Order Summary
                    <ChevronDown className="h-4 w-4 transform transition-transform duration-200 group-data-[state=open]:rotate-180" />
                  </span>
                  <p className="text-base font-bold">
                    {cartDetails?.summary?.wholeTotal?.text}
                  </p>
                </Accordion.Trigger>
              </Accordion.Header>

              <Accordion.Content className="px-4 py-3 bg-white border-t border-gray-200 animate-slide-down data-[state=closed]:animate-slide-up">
                <OrderSummary cartDetails={cartDetails} isLoaded={isLoaded} />
              </Accordion.Content>
            </Accordion.Item>
          </Accordion.Root>
        </div>

        <div className="grid grid-cols-9 md:mb-[66px]">
          <div className="col-span-9 md:col-span-5 md:pr-[53px]">
            {/* <UserDetails
              checkoutFormData={checkoutFormData}
              setCheckoutFormData={setCheckoutFormData}
              user={user}
              getUser={getUser}
              getAddress={getAddress}
              setIsEmail={setIsEmail}
            /> */}
            <div className="h-[1px] bg-[#D8D8D8] my-5 md:my-10"></div>
            {/* {checkoutFormData?.email ? ( */}
            <AddressForm
              ref={addressFormRef}
              guestDetails={guestDetails}
              getCartDetails={getCartDetails}
              user={user}
              address={address}
              getAddress={getAddress}
              email={checkoutFormData?.email}
              checkoutFormData={checkoutFormData}
              setCheckoutFormData={setCheckoutFormData}
            />
            <div className="flex flex-col ">
              <div className="w-full md:w-[48%]">
                <GiftWrapOption
                  onGiftWrapChange={handleGiftWrapChange}
                  cartDetails={cartDetails}
                  giftWrapAmount={giftWrapAmount}
                />
              </div>
              <div className="w-full md:w-[48%]">
                <DeliveryInstructionsOption
                  onDeliveryInstructionsChange={
                    handleDeliveryInstructionsChange
                  }
                  cartDetails={cartDetails}
                  existingInstructions={deliveryInstructions}
                />
              </div>
            </div>
            <div className="mt-10 mb-10">
              <PaymentMethods
                cartDetails={cartDetails}
                checkoutFormData={checkoutFormData}
                setCheckoutFormData={setCheckoutFormData}
                guestToken={guestToken}
              />
            </div>
            <Button
              disabled={!checkoutFormData?.paymentType || !isLoaded}
              onClick={handlePlaceOrderClick}
              className="bg-black gap-4 text-white h-[50px] mt-[30px] text-base hidden md:flex justify-center items-center rounded-none px-[64px] hover:bg-black uppercase"
            >
              <SecureLock />
              <span className="pt-1">
                {checkoutFormData?.paymentType === "cod"
                  ? "Place Order"
                  : "Secure Checkout"}
              </span>
            </Button>

            <div className="fixed bottom-[57px] left-1/2 transform -translate-x-1/2 w-full mt-5 block md:hidden !z-50 shadow-[0px_-13px_23px_1px_#dddddd9e]">
              {/* <Sheet>
                <SheetTrigger asChild>
                  <div className="bg-[#F3F5F7] h-9 flex items-center text-black justify-between px-5">
                    <p className="text-sm font-bold md:font-medium">
                      Order Summary
                    </p>
                    <svg
                      width="10"
                      height="10"
                      viewBox="0 0 10 10"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M4.99999 2.99998C5.29166 2.99998 5.58333 3.11248 5.80416 3.33332L8.52083 6.04998C8.64166 6.17082 8.64166 6.37082 8.52083 6.49165C8.39999 6.61248 8.19999 6.61248 8.07916 6.49165L5.36249 3.77498C5.16249 3.57498 4.83749 3.57498 4.63749 3.77498L1.92083 6.49165C1.79999 6.61248 1.59999 6.61248 1.47916 6.49165C1.35833 6.37082 1.35833 6.17082 1.47916 6.04998L4.19582 3.33332C4.41666 3.11248 4.70833 2.99998 4.99999 2.99998Z"
                        fill="black"
                      />
                    </svg>
                  </div>
                </SheetTrigger>
                <SheetContent className="w-full sm:max-w-2xl px-[15px] md:px-14 pt-5 md:pt-9 pb-11 md:pb-[49px] h-screen overflow-auto">
                  <OrderSummary cartDetails={cartDetails} isLoaded={isLoaded} />
                </SheetContent>
              </Sheet> */}
              <div className="bg-white px-5  py-3">
                <Button
                  disabled={!checkoutFormData?.paymentType || !isLoaded}
                  onClick={handlePlaceOrderClick}
                  className="w-full h-[50px] bg-black gap-4 text-white hover:bg-black md:text-white rounded-none text-[15px] font-medium uppercase flex justify-center items-center"
                >
                  <SecureLock />
                  <span className="md:hidden uppercase pt-1">
                    {checkoutFormData?.paymentType === "cod"
                      ? "Place Order"
                      : "Secure Checkout"}
                  </span>
                </Button>
              </div>
            </div>
          </div>
          <div className="col-span-9 md:col-span-4 max-md:hidden">
            <OrderSummary cartDetails={cartDetails} isLoaded={isLoaded} />
          </div>
        </div>

        <CheckoutSupportBanner />
      </div>
    </section>
  );
};

export default Checkout;
