import { ProductCardProps, ProductCartProps } from "@/types/productCard.types";
import { Attribute } from "@/types/productDetails.types";
import React, { useEffect } from "react";
import QuantitySelector from "../quantity-selector/QuantitySelector";
import api from "@/config/api.interceptor";
import { endpoints } from "@/app/_constants/endpoints/endpoints";
import Image from "next/image";
import Link from "next/link";
import WishlistButton from "../buttons/wishlist/WishlistButton";
import { toast } from "@/hooks/use-toast";
import Trash from "@/public/svgs/Trash";
import Trash3 from "@/public/svgs/Trash3";
import Trash2 from "@/public/svgs/Trash2";

type Props = {
  isCart?: boolean;
  product: ProductCartProps;
  getCartDetails: () => void;
  wishlistDetails: Array<ProductCardProps>;
  minicart?: boolean;
  productRemoveHandler?: (e: any) => void;
};

const CartProduct = ({
  product,
  isCart,
  wishlistDetails,
  getCartDetails,
  minicart,
  productRemoveHandler,
}: Props) => {
  const [quantity, setQuantity] = React.useState(String(product.quantity));
  const [isWishlisted, setIsWishlisted] = React.useState(false);

  useEffect(() => {
    const wishlistIds =
      wishlistDetails &&
      wishlistDetails?.map((wishlistItem: any) => {
        return wishlistItem.params.slug;
      });
    const isWishlisted = wishlistIds?.includes(product?.params?.slug) || false;
    setIsWishlisted(isWishlisted);
  }, [wishlistDetails]);

  useEffect(() => {
    if (Number(quantity) != product.quantity) {
      api
        .post(endpoints.addToCart, {
          product: product.params.slug,
          quantity: quantity,
        })
        .then((response) => {
          if (response.data?.errorCode == 0) {
            getCartDetails();
          } else {
            toast({
              description: response.data.message,
              variant: "destructive",
            });
            setQuantity(String(product.quantity));
          }
        })
        .catch((error: any) => {});
    }
  }, [quantity, product]);

  const removeFromCart = () => {
    api
      .post(endpoints.removeFromCart, {
        product: product.params.slug,
      })
      .then((response) => {
        if (response.data?.errorCode == 0) {
          getCartDetails();
        } else {
        }
      })
      .catch((error: any) => {});
  };

  return (
    <div
      className={`mb-[15px] border bg-white border-[#E5E7EB] flex items-stretch  ${
        minicart ? "last:mb-2.5" : "first:mt-5"
      } `}
    >
      <div
        className={`${
          minicart ? "w-[107px] md:w-[174px]" : "lg:w-[calc(260px)]"
        }  aspect-square h-auto relative`}
      >
        <Link href={`/p/${product.params.slug}`}>
          {minicart ? (
            <Image
              height={260}
              width={260}
              src={product.medias.thumbnail}
              alt={product?.name?.text}
              className="w-[107px] h-full md:h-full md:w-[174px] object-cover"
            />
          ) : (
            <Image
              height={260}
              width={260}
              src={product.medias.thumbnail}
              alt="Banner"
              className="object-cover w-[107px] h-[144px] md:w-full md:h-full"
            />
          )}
        </Link>
          <div className="absolute bottom-3 right-2 left-2 max-md:flex items-center justify-center gap-2.5 md:grid grid-cols-2 gap-x-4">
            <div className="h-[26px] md:h-11 w-[33px] md:w-full grid items-center border border-[#E8EAED] bg-white">
              <WishlistButton
                isWishlisted={isWishlisted}
                productSlug={product.params.slug}
                isCart
              />
            </div>
            <div
              onClick={removeFromCart}
              className="h-[26px] md:h-11 flex w-[33px] md:w-full justify-center items-center cursor-pointer border border-[#E8EAED] bg-white"
            >
              <Trash2 className="text-[#FF9C9C] max-md:hidden" />
              <Trash3 className="md:hidden" />
            </div>
          </div>
      </div>
      <div
        className={`flex-1 flex flex-col justify-between ${
          minicart
            ? "pl-[23px] md:pl-[11px] pr-3.5 pt-[14px] md:pt-[11px] md:pb-4 pb-[13px]"
            : "pl-[23px] md:pl-[16px] pr-[17px] md:pr-6 pt-[14px] md:pt-[15px] md:pb-2.5 pb-[13px]"
        }`}
      >
        <div className={minicart ? "flex justify-between" : ""}>
          <div className={minicart ? "w-3/4" : ""}>
            <div
              className={`text-base text-black font-bold  ${
                minicart ? "mb-0 line-clamp-1" : "mb-0 line-clamp-1"
              }`}
            >
              <Link href={`/p/${product.params.slug}`} className="md:leading-6 leading-[18px]">
                {product.name.text}
              </Link>
            </div>
            <div
              className={`text-sm text-[#808080] ${
                minicart ? "my-[5px] md:my-2.5" : "my-[5px] md:my-2.5 "
              }`}
            >
              {product.overview.text}
            </div>
            <div>
              {product.attributes.map((attribute: Attribute, index: number) => {
                return (
                  <div
                    key={index}
                    className={` text-black ${
                      minicart
                        ? "text-sm"
                        : "text-xs md:text-[13px] font-normal"
                    }`}
                  >
                    {attribute.title}:{" "}
                    {attribute?.title === "Color" ? (
                      <span
                        className="size-3 rounded-full inline-block"
                        style={{ backgroundColor: attribute.value }}
                      ></span>
                    ) : (
                      <span
                        className={
                          minicart
                            ? "font-medium"
                            : "text-xs md:text-[13px] font-medium"
                        }
                      >
                        {attribute.value}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between mt-1">
          <QuantitySelector
            isCart={true}
            quantity={quantity}
            setQuantity={setQuantity}
            miniCart={minicart}
          />
          <div
            className={`text-[13px] font-normal leading-[19.5px] min-w-[fit-content] ${
              minicart ? "text-black" : ""
            }`}
          >
            Price : <span className="font-bold">{product.price.text}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartProduct;
