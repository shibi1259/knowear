import { ProductCardProps, ProductCartProps } from "@/types/productCard.types";
import Link from "next/link";
import React from "react";
import CartProduct from "./CartProduct";

type Props = {
  products: Array<ProductCartProps>;
  getCartDetails: () => void;
  wishlistDetails: Array<ProductCardProps>;
  isCart: boolean;
};

export default function CartList({
  products,
  isCart,
  wishlistDetails,
  getCartDetails,
}: Props) {
  return (
    <div>
      {products.map((product: ProductCartProps, index: number) => {
        return (
          <CartProduct
            key={index}
            wishlistDetails={wishlistDetails}
            getCartDetails={getCartDetails}
            product={product}
            isCart={isCart}
          />
        );
      })}
    </div>
  );
}
