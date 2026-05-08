"use client";
import { endpoints } from "@/app/_constants/endpoints/endpoints";
import { Button } from "@/components/ui/button";
import api from "@/config/api.interceptor";
import { toast } from "@/hooks/use-toast";
import Link from "next/link";
import React, { useState } from "react";

type Props = {
  name: string;
  phone: string;
  address: string;
  isDefault?: boolean;
  id: string;
  type?: string;
  getAddress: () => Promise<any>;
  email?: string;
};

const AddressCard = ({
  id,
  type,
  name,
  phone,
  address,
  isDefault = false,
  getAddress,
}: Props) => {
  const handleSetDefault = async (item: boolean) => {
    api
      .post(endpoints.updateAddress, { isDefaultShipping: item, refid: id })
      .then((response: any) => {
        if (response.data?.errorCode == 0) {
          getAddress();
        } else {
          toast({
            description: response.data.message || "Something went wrong",
            variant: "destructive",
          });
        }
      })
      .catch((error: any) => {});
  };

  const handleDeleteAddress = async () => {
    api
      .post(endpoints.deleteAddress, { refid: id })
      .then((response: any) => {
        if (response.data?.errorCode == 0) {
          getAddress();
          window.location.reload();
          toast({
            description:"Address deleted successfully",
            variant: "success",
          })
        } else {
          toast({
            description: response.data.message || "Something went wrong",
            variant: "destructive",
          });
        }
      })
      .catch((error: any) => {});
  };
  
  return (
    <>
      <div
        className={`relative p-[14px] lg:pt-[25px] lg:pb-[21px] lg:pl-[43px] lg:pr-[37px] h-full   ${
          isDefault
            ? "bg-[#F3F5F7] border-[#F3F5F7]"
            : "bg-[#F3F5F7] border-[#EBEBEB]"
        }`}
      >
        <h5 className="text-black font-medium text-[15px] lg:text-xl mb-[5px] lg:mb-[15px]">
          {name}
        </h5>
        <h6 className="text-sm lg:text-base text-[#808080] font-normal mb-[5px] lg:mb-4">
          {phone}
        </h6>
        <p className="text-sm lg:text-base text-[#808080] font-normal mb-[13px] lg:mb-[15px]">
          {address}
        </p>
        <ul className="flex justify-start  flex-wrap items-center gap-3 lg:mb-4">
          <li>
            <div className="rounded-none bg-transparent border border-[#808080] h-[33px] md:h-[37px] text-[#808080] font-normal text-[13px] md:text-base grid place-items-center px-[19px]">
              {type}
            </div>
          </li>
          <li>
            {isDefault ? (
              <Button
                variant="default"
                onClick={() => handleSetDefault(false)}
                className="rounded-none bg-black border border-black h-[33px] md:h-[37px] text-white font-normal text-[13px] md:text-base hover:bg-black px-[19px]"
              > 
                Default Address
              </Button>
            ) : (
              <Button
                variant="secondary"
                onClick={() => handleSetDefault(true)}
                className="text-[#808080] rounded-none bg-transparent border border-[#808080] h-[33px] md:h-[37px]  font-normal text-[13px] md:text-base px-[19px]"
              >
                Set as Default Address
              </Button>
            )}
          </li>
        </ul>
        <ul className="absolute lg:relative top-[14px] lg:top-[unset] right-5 lg:right-[unset] flex justify-start items-center gap-[10px]">
          <li>
            <Button
              onClick={handleDeleteAddress}
              variant="link"
              className="text-black text-sm md:text-base font-semibold p-0 h-[unset]"
            >
              Remove
            </Button>
          </li>
          <li>
            <span className="w-[1px] h-[19px] bg-[#D9D9D9] block"></span>
          </li>
          <li>
            <Link href={`/add-address?id=${id}`}>
              <Button
                variant="link"
                className="text-black text-sm md:text-base font-semibold p-0 h-[unset]"
              >
                Edit
              </Button>
            </Link>
          </li>
        </ul>
      </div>
    </>
  );
};

export default AddressCard;
