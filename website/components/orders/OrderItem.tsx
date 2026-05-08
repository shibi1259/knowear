import { formatDateToLocale } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import React from "react";

const OrderItem = ({ order }: any) => {
  const product = order.products[0];

  return (
    <div>
      <div className="pt-3.5 md:pt-[26px] px-[11px] md:px-[47px] pb-5 md:pb-7 bg-[#F3F5F7]">
        <div className="flex justify-between items-center">
          <h3 className="text-base md:text-xl font-medium ">
            Order no: {order.orderNo?.text}
          </h3>
          <Link
            target="_blank"
            href={`${
              process.env.NEXT_PUBLIC_API_URL
            }invoice-details/${order.orderNo?.text?.replace("#", "")}`}
          >
            <button className="underline text-[13px] font-normal text-[#808080]">
              Download Invoice
            </button>
          </Link>
        </div>
        <div className="flex justify-between mt-[7px] md:mt-[9px] items-center">
          <div>
            <div className="flex flex-row text-[13px] md:text-sm font-normal gap-x-1">
              <p className=" text-[#808080]">Order Date : </p>
              <p>{formatDateToLocale(order.orderDate?.text)}</p>
            </div>
            <div className="flex flex-row text-[13px] md:text-sm font-normal gap-x-1">
              {/* <p className=" text-[#808080]">Estimated Delivery Date : </p> */}
              {/* <p>8 June 2023</p> */}
            </div>
          </div>
          <div className="hidden md:block">
            <div className="flex flex-row text-[13px] md:text-sm font-normal gap-x-1 justify-end">
              <p className=" text-[#808080]">Order Status : </p>
              <p className="capitalize ">{order.orderStatus?.text}</p>
            </div>
            <div className="flex flex-row text-[13px] md:text-sm font-normal gap-x-1 justify-end">
              <p className=" text-[#808080]">Payment Method : </p>
              <p>{order?.paymentMethod?.text}</p>
            </div>
          </div>
        </div>
      </div>
      <div className="border border-[##E5E7EB] flex">
        <Link href={`/p/${product?.params?.slug}`} className="relative">
          <Image
            width={858}
            height={1317}
            src={product.thumbnail.text}
            alt={product.name.text}
            className="object-cover h-[150px] md:h-60 w-[107px] md:w-60"
          />
        </Link>
        <div className="mt-[15px] md:mt-[43px] ml-[15px] md:ml-[26px] mr-[11px] md:mr-[29px] mb-2 md:mb-[42px] flex-grow">
          <div>
            <Link href={`/p/${product?.params?.slug}`} className="relative">
              <h3 className="font-bold text-base">{product.name.text}</h3>
            </Link>
            <p className="pt-[5px] md:pt-2.5 font-normal text-xs md:text-[13px] text-[#808080]">
              {product?.overview?.text}
            </p>
            <div className="pt-[5px] md:pt-2.5">
              {product?.attributes?.map((attr: any, index: number) => (
                <div
                  key={index}
                  className="flex flex-row gap-1 text-xs md:text-[13px]"
                >
                  <p className="font-normal">{attr?.title} :</p>
                  {attr?.title === "Color" ? (
                    <div
                      style={{ background: attr?.value }}
                      className="size-4 rounded-full"
                    ></div>
                  ) : (
                    <p className="font-medium">{attr?.value}</p>
                  )}
                </div>
              ))}
              <div className="flex flex-row gap-1 text-xs md:text-[13px]">
                <p className="font-normal">Qty :</p>
                <p className="font-medium ">{product.quantity.text}</p>
              </div>
            </div>
            <div className="flex flex-row justify-between max-md:items-end">
              <div className="flex flex-row gap-1 text-[13px] md:mt-[26px]">
                <p className="font-normal">Price :</p>
                <p className="font-bold">{product.price.text}</p>
              </div>
              <Link
                href={`/orders/${order.orderNo?.text?.replace("#", "")}`}
                className="flex items-center justify-center w-[76px] md:w-[157px] h-[23px] md:h-[47px] bg-[#F3F5F7] font-normal text-xs md:text-base"
              >
                <p className="max-md:mt-1">View Details</p>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderItem;
