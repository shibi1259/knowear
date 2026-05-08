"use client";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import React, { useContext } from "react";
import { useRouter } from "next/navigation";
import arrowIcon from "../../../../public/icons/backArrow.svg";
import PersonalInfoForm from "./PersonalInfoForm";
import Link from "next/link";
import AddressCard from "@/app/shared/address-card/AddressCard";
import { StateContext } from "@/providers/state/StateContext";
import ArrowLeft from "@/public/svgs/ArrowLeft";

type Props = {};

const Profile = (props: Props) => {
  const router = useRouter();
  const { user, address, getAddress } = useContext(StateContext);

  const handleBackClick = () => {
    router.back();
  };

  return (
    <>
      <div>
        <h1 className="text-black text-xl lg:text-[35px] font-medium lg:font-semibold mb-[21px] lg:mb-[30px] flex items-center">
          <Button
            variant="ghost"
            className="p-0 h-[unset] mr-[9px] lg:hidden"
            onClick={handleBackClick}
          >
            <ArrowLeft />
          </Button>
          <span className="leading-[28.9px] md:leading-[50.58px]">Personal Info</span>
        </h1>
        <PersonalInfoForm />
        <div className="mt-[35px] md:mt-[60px]">
          <div className="flex justify-between items-center">
            <h6 className="text-black text-xl lg:text-[22px] font-medium lg:font-semibold">
              Address
            </h6>
            <Link
              href="/add-address"
              className="font-normal md:font-medium text-[13px] md:text-lg text-black underline"
            >
              Add New
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-[15px] lg:gap-x-[18px] lg:gap-y-[21px] mt-[15px] lg:mt-[30px]">
            {address?.map((address: any, index: number) => {
              const addressFormat = address?.deliveryAddress? address?.deliveryAddress :
                `${address?.streetAddress},` +
                " " +
                `${address?.aptSuiteUnit ? `${address?.aptSuiteUnit},` : ""}` +
                " " +
                `${address?.city},` +
                " " +
                address?.state;
              return (
                <div className="col-span-2 md:col-span-1" key={index}>
                  <AddressCard
                    type={address?.type}
                    name={address?.firstname}
                    phone={`${address?.countryCode} ${address?.mobile || user?.mobile || ""
                      }`}
                    address={addressFormat}
                    isDefault={address?.isDefaultShipping}
                    id={address?.refid}
                    getAddress={getAddress}
                  />
                </div>
              );
            })}
          </div>
          {(!address || address?.length === 0) && <div className="text-black text-opacity-50 tex-sm text-center ">No address found. Please add one to proceed.</div>}
        </div>
      </div>
    </>
  );
};

export default Profile;
