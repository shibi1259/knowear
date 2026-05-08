"use client";
import { ProductCardProps } from "@/types/productCard.types";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import AppLoader from "../app-loader/AppLoader";
import { endpoints } from "@/app/_constants/endpoints/endpoints";
import api from "@/config/api.interceptor";

type Props = {
  cartDetails: any;
  isLoaded: boolean;
};

const OrderSummary = ({ cartDetails, isLoaded = true }: Props) => {
  const [GiftWrapEnabled, setGiftWrapEnabled] = useState(false);

  useEffect(() => {
    isGiftWrapEnabled();
  }, []);

  const isGiftWrapEnabled = async () => {
    const response = await api.get(`${endpoints.getGiftWrapDetails}`);
    if (response.data.errorCode == 0) {
      setGiftWrapEnabled(response.data.result.isEnabled);
    }
  };
  return (
    <div className="md:pl-14 md:border-l border-[#D8D8D8]  h-full">
      <div className="text-xl font-medium md:font-semibold mb-5">
        {/* Order Summary */}
      </div>
      <div>
        {cartDetails?.products && (
          <>
            <div className="flex flex-row md:flex-col  gap-x-5 items-start justify-between overflow-x-auto">
              {cartDetails?.products?.map(
                (product: ProductCardProps, index: number) => {
                  return (
                    <div
                      className="flex items-start justify-between md:pb-5 mb-5 last:mb-0 border md:border-t-0 border-l-0 md:border-r-0 md:border-b border-[#D8D8D8] min-w-[340px] sm:min-w-[400px]"
                      key={index}
                    >
                      <div className="flex items-start gap-x-6 relative">
                        <Link href={`/p/${product?.params?.slug}`}>
                          <Image
                            height={100}
                            width={100}
                            className="w-[107px] h-[142px] md:h-[100px] md:w-[100px] object-cover"
                            src={product.medias.thumbnail}
                            alt={product.name.text}
                          />
                        </Link>
                        <div className="w-60 max-md:mt-3.5 ">
                          <Link href={`/p/${product?.params?.slug}`}>
                            <div className="font-semibold truncate">
                              {product.name.text}product
                            </div>
                          </Link>
                          <div className="text-[#808080] text-sm">
                            {product.overview.text}
                          </div>
                          {product.attributes.map(
                            (attribute: any, index: number) => {
                              return (
                                <div
                                  className="flex items-center justify-startg gap-1"
                                  key={index}
                                >
                                  <div>{attribute.title} :</div>
                                  {attribute.title === "Color" ? (
                                    <div
                                      className="w-5 h-5 rounded-full"
                                      style={{
                                        backgroundColor: attribute.value,
                                      }}
                                    ></div>
                                  ) : (
                                    <div className="font-medium">
                                      {attribute.value}
                                    </div>
                                  )}
                                </div>
                              );
                            }
                          )}
                          <div className="font-bold md:hidden absolute bottom-3">
                            {product.price.text}
                          </div>
                        </div>
                      </div>
                      <div className="font-bold max-md:hidden">
                        {product.price.text}
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          </>
        )}
      </div>
      {cartDetails.products ? (
        <div className="mt-4 md:mt-10">
          {/* <div>ShippingNote :     {cartDetails.summary.deliveryNote.text} </div> */}

          {cartDetails?.summary?.deliveryNote?.text && (
            <div className="flex items-center justify-between my-3">
              <div>Shipping Note</div>
              <div className="max-w-[200px] text-right">
                {cartDetails?.summary?.deliveryNote?.text.length > 0
                  ? `${cartDetails.summary.deliveryNote.text.substring(
                      0,
                      28
                    )}...`
                  : cartDetails?.summary?.deliveryNote?.text}
              </div>
            </div>
          )}
          <div className="text-lg">
            <div className="flex items-center justify-between">
              <p className="text-base font-medium">
                Subtotal ( {cartDetails.products.length || 0} items )
              </p>
              <p className="text-base font-medium">
                {cartDetails?.summary?.total?.text}
              </p>
            </div>
            <div className="flex items-center justify-between my-1">
              <p className="text-base font-medium">Savings</p>
              <p className="text-base font-medium">
                - {cartDetails?.summary?.discount?.text}
              </p>
            </div>
            {cartDetails?.summary?.giftWrap?.enabled && GiftWrapEnabled && (
              <div className="flex items-center justify-between my-1">
                <p className="text-base font-medium ">Gift Wrap</p>
                <p className="text-base font-medium">
                  {cartDetails.summary.giftWrap.text}
                </p>
              </div>
            )}
            <div className="flex items-center justify-between">
              <p className="text-base font-medium">Shipping</p>
              <p className="text-base font-medium">
                {" "}
                {!isLoaded ? (
                  <AppLoader width="50" height="50" />
                ) : (
                  cartDetails?.summary?.deliveryFee?.text
                )}
              </p>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-base font-medium">VAT 5%</p>
              <p className="text-base font-medium">
                {cartDetails?.summary?.tax.text}
              </p>
            </div>
            <div className="my-3">
              <hr />
            </div>
            <div className="flex items-center justify-between font-semibold text-lg">
              <p className="text-base font-medium">Total</p>
              <p className="text-base font-bold">
                {/* {cartDetails?.summary?.tax.text} */}
                {cartDetails?.summary?.wholeTotal?.text}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <AppLoader />
      )}
    </div>
  );
};

export default OrderSummary;
