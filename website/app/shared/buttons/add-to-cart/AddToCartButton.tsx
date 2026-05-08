"use client";
import React from "react";
import { trackAddToCart } from "@/config/fpixel";
import { trackSnapAddToCart } from "@/config/snapPixel";

// Define a more specific type for cartDetails
type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
};

type Props = {
  addToCart: () => void;
  setOpen: (item: boolean) => void;
  cartDetails: CartItem; // More specific type
};

const AddToCartButton = (props: Props) => {
  const { addToCart, cartDetails } = props;

  const handleAddToCart = () => {
    // Now you can safely access properties of cartDetails
    // console.log("Adding to cart:", {
    //   id: cartDetails.id,
    //   name: cartDetails.name,
    //   price: cartDetails.price,
    //   quantity: cartDetails.quantity,
    // });
    
    // Track add to cart event
    trackAddToCart({
      content_ids: cartDetails.id,
      content_name: cartDetails.name,
      content_type: "product",
      value: cartDetails.price,
      currency: "AED",
    });
    trackSnapAddToCart(cartDetails);
  };

  return (
    <div>
      <button
        onClick={() => {
          props.setOpen(true);
          addToCart();
          handleAddToCart();
        }}
        className="bg-white font-medium text-base text-black h-[50px] py-[14px] w-full max-md:w-full text-center flex items-center justify-center gap-2.5 border border-black"
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 22 22"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M8.9375 17.8765C9.3172 17.8765 9.625 17.5687 9.625 17.189C9.625 16.8093 9.3172 16.5015 8.9375 16.5015C8.5578 16.5015 8.25 16.8093 8.25 17.189C8.25 17.5687 8.5578 17.8765 8.9375 17.8765Z"
            stroke="black"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M17.1875 17.8765C17.5672 17.8765 17.875 17.5687 17.875 17.189C17.875 16.8093 17.5672 16.5015 17.1875 16.5015C16.8078 16.5015 16.5 16.8093 16.5 17.189C16.5 17.5687 16.8078 17.8765 17.1875 17.8765Z"
            stroke="black"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M2.75 2.75146H5.75L7.76 12.5706C7.82858 12.9082 8.01643 13.2114 8.29066 13.4273C8.56489 13.6431 8.90802 13.7578 9.26 13.7512H16.55C16.902 13.7578 17.2451 13.6431 17.5193 13.4273C17.7936 13.2114 17.9814 12.9082 18.05 12.5706L19.25 6.41804H6.5"
            stroke="black"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Add to Cart
      </button>
    </div>
  );
};

export default AddToCartButton;
