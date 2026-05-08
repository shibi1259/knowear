"use client";
import { endpoints } from "@/app/_constants/endpoints/endpoints";
import ProductItem from "@/components/orders/ProductItem";
import StatusBar from "@/components/orders/StatusBar";
import api from "@/config/api.interceptor";
import { formatDateToLocale } from "@/lib/utils";
import ArrowLeft from "@/public/svgs/ArrowLeft";
import Link from "next/link";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";

type Props = {};

const OrderDetails = (props: Props) => {
  const params = useParams();
  const [order, setOrder] = useState<any>({});
  const orderId = params?.slug;

  useEffect(() => {
    getOrderDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  const getOrderDetail = () => {
    api
      .post(endpoints.orderDetails, { order: "#" + orderId })
      .then((res) => {
        if (res.data.errorCode == 0) {
          setOrder(res.data?.result);
         
        }
      })
      .catch((err: any) => {
        // router.push("/404");
      });
  };
  console.log("order", order);
  const isTerminalState =
    order?.orderStatus?.text === "CANCELLED" ||
    order?.orderStatus?.text === "FAILED";
  return (
    <div>
      <div className="flex gap-x-[9px] items-center">
        <Link href="/orders">
          <ArrowLeft />
        </Link>
        <h1 className="text-black  text-xl lg:text-[35px] font-medium lg:font-semibold leading-[28.9px] md:leading-[50.58px]">
          Order Details
        </h1>
      </div>
      <div className="mt-[22px] md:mt-[30px]">
        <div className="flex justify-between items-center bg-[#F3F5F7] pl-[11px] pr-[15px] pt-[14px] pb-[19px] md:pt-[26px] md:pb-[27px] md:pl-[46px] md:pr-10">
          <div>
            <h3 className="font-medium text-base md:text-xl">
              Order no: {order?.orderNo?.text}
            </h3>
            <p className="pt-[5px] flex gap-1 text-xs md:text-sm font-normal">
              <p className=" text-[#808080]">Placed on : </p>
              <p className=" ">{formatDateToLocale(order?.orderDate?.text)}</p>
            </p>
            {isTerminalState ? (
              <div className="text-xs md:text-[13px] text-red-500 font-normal pt-[5px]">
                Order Cancelled
                <span className="text-[#808080] pl-1">
                  ({formatDateToLocale(order?.updatedTime?.text)})
                </span>
              </div>
            ) : (
              <></>
            )}
          </div>
          <div>
            <p className="text-xs md:text-[13px] text-[#808080] font-normal">
              Total
            </p>
            <p className="text-sm md:text-base font-bold">
              {order?.orderPrice?.wholetotal?.text}
            </p>
          </div>
        </div>
      </div>

      <div className="pt-[17px] md:pt-[31px] pb-[17px] md:pb-[35px]">
        <StatusBar
          status={order?.orderStatus?.text || "PENDING"}
          lastUpdate={order?.updatedTime?.text}
        />
      </div>
      {order?.products?.map((product: any, index: number) => (
        <div
          key={index}
          className={`pb-5 ${order?.products?.length !== index + 1 ? "" : ""}`}
        >
          <ProductItem key={product?._id} product={product}  />
        </div>
      ))}
    </div>
  );
};

export default OrderDetails;
