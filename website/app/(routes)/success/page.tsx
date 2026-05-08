"use client";


import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import api from "@/config/api.interceptor";

interface ButtonProps {
  text: string;
  className: string;
  onClick?: () => void;
}

const Button: React.FC<ButtonProps> = ({ text, className, onClick }) => {
  return (
    <button className={className} onClick={onClick}>
      {text}
    </button>
  );
};

const SuccessPopUp = () => {
  const router = useRouter();
  const lang = Cookies.get("lang");
  const currency = Cookies.get("currency");
  const guestToken = Cookies.get("guest-token");
  const [isOpen, setIsOpen] = React.useState(false);
  const [orderDetails, setOrderDetails] = React.useState<any>();
  const [isLoaded, setIsloaded] = useState(false);
//   const dispatch = useDispatch();
  const searchParams = useSearchParams();
//   const { t } = useTranslation();

  useEffect(() => {
    setIsOpen(true);
    // revalidate("orders");
    // getCounts();
    // revalidate("cartlist");
    // dispatch(clearCart());
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (searchParams.get("orderId")) {
      const orderId = searchParams.get("orderId");
      getOrderDetails(orderId);
    }
  }, [searchParams.get("orderId")]);

  const getOrderDetails = async (orderNo: any) => {
    try {
      const resp = await api.post(
        `${process.env.NEXT_PUBLIC_API_URL}/order-details`,
        { order: `#${orderNo}` }
      );
      setOrderDetails(resp?.data);
      setIsloaded(true)
    } catch (error) {}
  };

  return (
    <>
      {/* <DialogWithDrawer
        isOpen={isOpen}
        setIsOpen={(e: boolean) => {
          // router.replace("/");
          router.replace(`/orders/${searchParams.get("orderId")}?success=true`);
        }}
      > */}
        <section className="flex flex-col items-center text-right text-black bg-white rounded-lg max-md:max-w-[600px] max-md:px-5">
          <div className="flex items-center overflow-hidden relative flex-col self-stretch md:px-9 pb-2 text-center max-md:mr-1 max-md:max-w-full">
            <Image
              loading="lazy"
              src="/success.gif"
              alt="Success"
              width={100}
              height={100}
              className="md:h-[326px] w-[434px] h-[209px] object-cover"
            />
            <div className={"md:mt-[-95px] mt-[-30px]"}>
              <h1 className="relative self-center text-xl md:text-2xl font-semibold">
                {"Your order is confirmed"}
              </h1>
              <p className="relative md:mt-6 mt-8 text-sm font-medium leading-5">
                {/* {t("seller-registartion.thanksForShoppingOrderNotShipped")} */}
                {/* {getScreenSize() === "mobile" ? null : <br />} */}
                {/* {t("seller-registartion.thanksForShopping")} */}
              </p>
            </div>
          </div>
          {!guestToken && (
            // <LocalizedLink
            //   href={`/orders/${searchParams.get("orderId")}?success=true`}
            //   className="max-md:w-full"
            // >
              <Button
                text="View Order"
                className="justify-center items-center px-8 py-4 mt-12 md:w-80 w-full text-sm font-medium leading-5 text-white bg-black rounded-lg max-md:px-5 max-md:mt-10"
              />
            // {/* </LocalizedLink> */}
          )}
          {/* <LocalizedLink href="/" className="max-md:w-full"> */}
            <Button
              text="Back to Home"
              className={`justify-center items-center px-8 py-4 md:w-80 w-full text-sm font-medium leading-5 mb-5 rounded-lg border 
               border-black mt-5 border-solid max-md:px-5`}
            />
          {/* </LocalizedLink> */}
        </section>
      {/* </DialogWithDrawer> */}
      {/* {orderDetails?.result?.id && (
        // <OrderGmtEvent
        //   isLoaded={isLoaded}
        //   setIsloaded={setIsloaded}
        //   orderDetails={orderDetails?.result}
        //   lang={lang}
        //   currency={currency}
        // />
      )} */}
    </>
  );
};

export default SuccessPopUp;
