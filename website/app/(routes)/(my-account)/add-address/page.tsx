"use client";
import React, { useContext, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import closePop from "../../../../public/icons/closemobile.svg";
import arrowIcon from "../../../../public/icons/backArrow.svg";
import AddressForm from "@/app/shared/address-form/AddressForm";
import { StateContext } from "@/providers/state/StateContext";
import api from "@/config/api.interceptor";
import { endpoints } from "@/app/_constants/endpoints/endpoints";
import ArrowLeft from "@/public/svgs/ArrowLeft";
import Cross3 from "@/public/svgs/Cross3";
type Props = {};

const AddAddress = (props: Props) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { getAddress, user } = useContext(StateContext);
  const [address, setAddress] = React.useState<any>({});

  useEffect(() => {
    if (searchParams.get("id")) {
      getAddressDetails();
    }
    // eslint-disable-next-line
  }, [searchParams]);

  const getAddressDetails = async (): Promise<any> => {
    api
      .post(endpoints.addressDetails, { refid: searchParams.get("id") })
      .then((res) => {
        if (res?.data?.errorCode == 0) {
          setAddress(res?.data?.result);
        }
      });
  };

  const handleBackClick = () => {
    router.back();
  };

  return (
    <>
      <div className=" md:mb-[46px] max-md:mb-[160px]">
        <div className="flex justify-start items-center gap-[9px] mb-[21px] lg:mb-[30px]">
          <h1 className="text-black text-xl lg:text-[35px] font-medium lg:font-semibold flex items-center">
            <Button
              variant="ghost"
              className="p-0 h-[unset] mr-4 hidden md:inline-block"
              onClick={handleBackClick}
            >
              <ArrowLeft />
            </Button>
            <span className="leading-[50.58px]">
              {searchParams.get("id") ? "Update Address" : "Add New Address"}
            </span>
          </h1>

          <Button
            variant="ghost"
            className="p-0 h-[unset] ml-auto md:hidden"
            onClick={handleBackClick}
          >
            <Cross3/>
          </Button>
        </div>
        {searchParams.get("id")?
        address?.refid &&
        <AddressForm
          key={address?.refid}
          user={user}
          address={address}
          getAddress={getAddress}
        />:
        <AddressForm
          key={user?.name}
          user={user}
          address={address}
          getAddress={getAddress}
        />
}
      </div>
    </>
  );
};

export default AddAddress;
