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

const ProductSheet = (props: Props) => {
  return (
    <>
      <div className="w-full ">
        <Sheet>
          <SheetTrigger className="flex justify-between items-center w-full pb-5 border-b border-[#E5E7EB]">
            <span className="text-[#2E343D] text-base font-medium">Product Details</span>
            <Image src={RightIcon} alt="Right Icon" width={13} height={7} className="w-[13px] h-[12px]" />
          </SheetTrigger>
          <SheetContent className="sheetSide w-fit md:max-w-[50%] max-w-[480px] overflow-y-scroll">
            <SheetHeader>
              <div className="flex flex-col items-start mx-auto w-full text-black pt-[13px]">
                <SheetTitle className="text-xl font-medium">
                  Product Details
                </SheetTitle>
                <SheetDescription className="pt-[21px]">
                  <div dangerouslySetInnerHTML={{ __html: props.description }}></div>
                </SheetDescription>
              </div>
            </SheetHeader>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
};
export default ProductSheet;
