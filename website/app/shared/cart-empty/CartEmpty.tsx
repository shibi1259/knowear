import EmptyCart from "@/public/svgs/EmptyCart";
import Link from "next/link";
import React from "react";

function CartEmpty({ isCartPage }: { isCartPage?: boolean }) {
  return (
    <div className={`h-full flex flex-col justify-between items-center`}>
      <div className={`grow w-full flex justify-center  h-[80%] text-black $ ${isCartPage ? "items-center" : "mt-10"}`}>
        <div>
          <EmptyCart />
          <div className={`flex flex-col items-center justify-center pt-[43px] md:pt-14`}>
            <p className="font-medium md:font-semibold text-xl md:text-[25px]">
              Your cart is Empty
            </p>
            <p className="font-normal text-[13px] md:text-sm pt-5 md:pt-[5px]">
              Add something to make me happy :)
            </p>
          </div>
        </div>
      </div>
      <div
        className={`w-full flex justify-center ${isCartPage ? "py-10" : ""}`}
      >
        <Link href={"/products"} className="w-full flex justify-center bg-black  md:max-w-[400px]">
          <button className="h-[45px] md:h-[50px]  text-white text-center font-medium text-[15px] md:text-lg max-md:uppercase w-full">
            Continue Shopping
          </button>
        </Link>
      </div>
    </div>
  );
}

export default CartEmpty;
