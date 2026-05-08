"use client";
import React from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import Image from "next/image";
import RightIcon from "../../../public/icons/arrowright.svg";

type Props = {
  description: string;
};

const ProductPrivacySheet = (props: Props) => {
  return (
    <>
      <div className="w-full ">
        <Sheet>
          <SheetTrigger className="flex justify-between items-center w-full pt-5 pb-5 border-b border-[#E5E7EB]">
            <span className="text-[#2E343D] text-base font-medium">
              Free Returns and Shipping Policy
            </span>
            <Image
              src={RightIcon}
              alt="Right Icon"
              width={13}
              height={7}
              className="w-[13px] h-[12px]"
            />
          </SheetTrigger>
          <SheetContent className="sheetSide w-[100vw] md:max-w-[50%] max-w-[480px] overflow-y-scroll">
            <SheetHeader>
              <div className="flex flex-col items-start mx-auto w-full text-black pt-[13px]">
                <SheetTitle className="text-xl font-medium leading-7 mb-6 lg:text-[25px] lg:font-semibold lg:leading-[36.13px]">
                  Free Returns and Shipping Policy
                </SheetTitle>
                <SheetDescription>
                  <div
                    dangerouslySetInnerHTML={{ __html: props.description }}
                  ></div>
                </SheetDescription>
              </div>
            </SheetHeader>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
};
export default ProductPrivacySheet;
