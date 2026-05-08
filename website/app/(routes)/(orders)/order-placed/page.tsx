"use client";
import { endpoints } from "@/app/_constants/endpoints/endpoints";
import ProductItem from "@/components/orders/ProductItem";
import { Button } from "@/components/ui/button";
import api from "@/config/api.interceptor";
import { trackPurchase } from "@/config/fpixel";
import { toast } from "@/hooks/use-toast";
import { StateContext } from "@/providers/state/StateContext";
import Cross3 from "@/public/svgs/Cross3";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { useContext, useEffect } from "react";

type Props = {};

const OrderPlaced = (props: Props) => {
  const searchParam = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const orderId = searchParam.get("orderId");
  const [orderDetails, setOrderDetails] = React.useState<any>({});
  const orderTriggeredRef = React.useRef(false);
  const [confirmationState, setConfirmationState] =
    React.useState("processing");
  const { user, updateCounts, setCounts, getCartDetails } =
    useContext(StateContext);

  const getOrderDetail = () => {
    api
      .post(endpoints.orderDetails, { order: "#" + orderId })
      .then((res) => {
        if (res.data.errorCode == 0) {
          const order = res.data?.result;
          setOrderDetails(order);
          getCartDetails();
          // Fire pixel AFTER order data is available
          if (typeof window !== "undefined" && typeof window.fbq === "function") {
            trackPurchase(order);
            // trackPurchase({
            //   value: order?.wholeTotal,
            //   currency: 'AED',
            //   content_type: 'product'
            // });
          }
        }
      })
      .catch((err: any) => {
        // router.push("/404");
      });
  };

  React.useEffect(() => {
    pathname === "/order-placed"
      ? setConfirmationState("success")
      : setConfirmationState("failed");
    if (confirmationState == "success") {
      toast({ description: "Order placed Successfully", variant: "success" });
      updateCounts();
      setCounts((prevCounts: any) => ({ ...prevCounts, cart: 0 }));
    }

    if (!orderTriggeredRef.current) {
      orderTriggeredRef.current = true;
      getOrderDetail();
    }
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, orderTriggeredRef]);

  return (
    <section className="pt-6 pb-[51px] md:pb-[188px]">
      <div className="relative container max-w-full max-md:h-[81vh] max-md:overflow-y-auto">
        <div>
          <div className="flex justify-between items-center">
            <h1 className="text-xl md:text-4xl font-medium md:font-semibold">
              Thank you for your purchase
            </h1>
            <Link className="md:hidden" href="/products">
              <Cross3 />
            </Link>
          </div>
          <div className="mt-px md:mt-3 mb-1 text-[13px] md:text-sm">
            Your order reference is{" "}
            <span className="font-semibold">{orderDetails?.orderNo?.text}</span>
          </div>
          <div className="text-[13px] md:text-sm">
            You will receive a confirmation email in a moment
          </div>
        </div>
        <div className="mt-3.5 md:mt-6">
          <div className="flex items-center justify-between md:border-b border-[#E5E7EB]  h-[20px] md:pb-1">
            {/* <div className="text-xl font-medium md:font-semibold">
              Order Summary
            </div> */}
            <div className="text-2xl font-bold md:text-xl md:font-semibold text-gray-900 shadow-md p-2 shadow-[0px_-13px_23px_1px_#dddddd9e]">
              Order Summary
            </div>

            <Link
              href={`${
                process.env.NEXT_PUBLIC_API_URL
              }invoice-details/${orderDetails?.orderNo?.text?.replace(
                "#",
                ""
              )}`}
              target="_blank"
              className="text-[#808080] underline text-[13px]"
            >
              Download Invoice
            </Link>
          </div>
          <div className="flex gap-6 md:gap-5 flex-col md:flex-row mt-5">
            <div className="md:basis-1/2 flex flex-col gap-[15px] md:gap-5">
              {orderDetails?.products?.map((product: any, index: number) => (
                <ProductItem key={index} product={product} thankyou />
              ))}
            </div>
            <div className="md:basis-1/2 md:border border-[#E5E7EB] md:pt-[43px] flex justify-center pb-[62px] md:pb-[81px]">
              <div className="md:ml-[85px] md:mr-[97px] w-full">
                <h4 className="font-semibold text-sm md:text-xl md:pb-2.5">
                  Shipping Address
                </h4>
                <p className="max-md:text-[13px] max-md:font-normal">
                  <p className="max-md:text-[13px] max-md:font-normal">
                    {/* {orderDetails?.delivery?.address?.type}, */}
                    {orderDetails?.delivery?.additionalAddress?.text
                      ? orderDetails?.delivery?.deliveryAddress?.text + ", "
                      : ""}
                    {orderDetails?.delivery?.address?.lane?.text}{" "}
                    {/* {orderDetails?.delivery?.address?.city?.text}{" "} */}
                    {orderDetails?.delivery?.address?.state?.text
                      ? ", " + orderDetails?.delivery?.address?.state?.text
                      : ""}
                  </p>
                </p>
                <div className="h-px w-full bg-[#D8D8D8] mt-[15px] mb-3.5 md:mt-5 md:mb-10" />
                <h4 className="font-semibold text-sm md:text-xl md:pb-2.5">
                  Mobile Number
                </h4>
                <p className="max-md:text-[13px] max-md:font-normal">
                  {orderDetails?.delivery?.customer?.mobile?.text ||
                    orderDetails?.delivery?.address?.mobile?.text}
                </p>
                <div className="h-px w-full bg-[#D8D8D8] mt-[15px] mb-[15px] md:mt-5 md:mb-10" />
                <h4 className="font-semibold text-sm md:text-xl md:pb-5">
                  Order Details
                </h4>
                <div className="flex justify-between gap-2 font-normal text-sm md:text-lg max-md:mt-[9px]">
                  <p>{`Subtotal ( ${orderDetails?.products?.length} items )`}</p>
                  <p>{orderDetails?.orderPrice?.total?.text}</p>
                </div>
                <div className="flex justify-between gap-2 my-[11px] md:my-[17px] font-normal text-sm md:text-lg">
                  <p>{`Shipping Charge`}</p>
                  <p>{orderDetails?.orderPrice?.shipping?.text}</p>
                </div>
                <div className="flex justify-between gap-2 my-[11px] md:my-[17px] font-normal text-sm md:text-lg">
                  <p>{`Savings`}</p>
                  <p>- {orderDetails?.orderPrice?.discount?.text}</p>
                </div>
                <div className="flex justify-between gap-2 my-[11px] md:my-[17px] font-normal text-sm md:text-lg">
                  <p>{`VAT (Inclusive)`}</p>
                  <p>{orderDetails?.orderPrice?.tax?.text}</p>
                </div>
                {orderDetails?.orderPrice?.giftWrapTotal?.enabled && (
                  <div className="flex justify-between gap-2 my-[11px] md:my-[17px] font-normal text-sm md:text-lg">
                    <p>{`Gift Wrap`}</p>
                    <p>{orderDetails?.orderPrice?.giftWrapTotal?.text}</p>
                  </div>
                )}
                {/* <div className="flex justify-between gap-2 my-[11px] md:my-[17px] font-normal text-sm md:text-lg">
                  <p>{`Shipping`}</p>
                  <p>{orderDetails?.orderPrice?.additionalCharge?.text}</p>
                </div> */}
                <div className="h-px w-full bg-[#D8D8D8] mt-[22px] mb-5 md:mt-4" />
                <div className="flex justify-between gap-2 my-[11px] md:my-[17px]">
                  <p className="font-semibold text-sm md:text-lg">{`Total`}</p>
                  <p className="font-semibold text-sm md:text-lg">
                    {orderDetails?.orderPrice?.wholetotal?.text}
                  </p>
                </div>
                <Link href={"/products"}>
                  <Button className="max-md:hidden h-[50px] mt-[51px] w-full rounded-none p-0 flex items-center justify-center bg-black hover:bg-black text-white font-medium text-lg">
                    Continue Shopping
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
        <Link
          href={"/products"}
          className="md:hidden fixed bottom-[45px] left-0 h-[50px] mt-[51px] w-full rounded-none p-0 flex items-center justify-center  text-lg px-3.5"
        >
          <Button className="bg-black uppercase p-0 h-[45px] w-full hover:bg-black text-white font-medium rounded-none">
            Continue Shopping
          </Button>
        </Link>
      </div>
    </section>
  );
};

export default OrderPlaced;
