import Image from "next/image";
import Link from "next/link";
import React from "react";

const ProductItem = ({ product,thankyou }: any) => {
  return (
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
      <div className={`mt-[15px] md:mt-[43px] ${thankyou? 'ml-[23px] md:ml-[26px]':'ml-[15px] md:ml-[26px]'} mr-[11px] md:mr-[29px] mb-2 md:mb-[42px] flex-grow max-md:w-[60%]`}>
        <div>
          <Link href={`/p/${product?.params?.slug}`} className="relative ">
            <h3 className="font-bold text-base truncate">
              {product.name.text}
            </h3>
          </Link>
          <p className="pt-[5px] md:pt-2.5 font-normal text-xs md:text-[13px] text-[#808080]">
            {product?.overView?.text}
          </p>
          <div className="pt-[5px] md:pt-2.5">
            {product?.attributes?.map((attr: any, index: any) => (
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
            <div className="flex flex-row gap-1 text-xs md:text-[13px]">
              <p className="font-normal">Order Status:</p>
              <p className="font-medium ">{product.status.text}</p>
            </div>
          </div>
          <div className="flex flex-row justify-between max-md:items-end">
            <div className="flex flex-row gap-1 text-[13px] md:mt-[26px]">
              <p className="font-normal">Price :</p>
              <p className="font-bold">{product.price.text}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductItem;
