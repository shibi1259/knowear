"use client";

// import { DialogWithDrawer } from "@/components/common";
// import { revalidate } from "@/fetcher/revalidate";
// import request from "@/lib/request";
// import { getScreenSize } from "@/lib/utils";
// import { clearCart } from "@/store/cart";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
// import { useDispatch } from "react-redux";
// import { useTranslation } from "react-i18next";
import Cookies from "js-cookie";
// import { LocalizedLink } from "@/components/common/LocalizedLink";

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

const FailedPopUp = () => {
  const guestToken = Cookies.get("guest-token");
  const router = useRouter();
  const [isOpen, setIsOpen] = React.useState(true);

//   const { t } = useTranslation();

  const handleNavigate=(e:any)=>{
    router.push("/cart");
  }

  return (
    // <DialogWithDrawer
    //   isOpen={isOpen}
    //   setIsOpen={(e: boolean) => handleNavigate(e)}
    // >
      <section className="flex flex-col items-center text-right text-black bg-white rounded-lg max-md:max-w-[600px] max-md:px-5">
        <div className="flex items-center overflow-hidden relative flex-col self-stretch md:px-9 pb-2 text-center max-md:mr-1 max-md:max-w-full">
          <div className={"mt-10"}>
            <h1 className="relative self-center text-xl md:text-2xl font-semibold">
              {" Your order has failed"}
            </h1>

            <p className="relative md:mt-6 mt-8 text-sm font-medium leading-5">
              {`We're sorry, but your order could not be processed at this time.`}
              {/* {getScreenSize() === "mobile" ? null : <br />} */}
              {/* {t("seller-registartion.tryAgainLater")} */}
            </p>
          </div>
        </div>
        {/* <LocalizedLink href="/" className="max-md:w-full"> */}
          <Button
            text="Back to Home"
            className={`justify-center items-center px-8 py-4 md:w-80 w-full text-sm font-medium leading-5 mb-5 rounded-lg border bg-black text-white mt-12
            border-solid max-md:px-5`}
          />
        {/* </LocalizedLink> */}
      </section>
    // </DialogWithDrawer>
  );
};

export default FailedPopUp;
