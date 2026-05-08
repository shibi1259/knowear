// import { CartDetails } from "@/types/providers";
// import Link from "next/link";
// import React from "react";
// import ApplyCoupon from "../cartList/ApplyCoupon";
// type Props = {
//   cartDetails: CartDetails;
//   availableCoupons: any[];
//   getCartDetails: () => void;
//   hasGiftWrap: boolean;
// };

// export default async function CartInfo({
//   cartDetails,
//   availableCoupons,
//   getCartDetails,
// }: Props) {

//   return (
//     <div className="w-full h-auto lg:px-[90px] lg:pb-[70px] lg:pt-8">
//       {/* <ApplyNote /> */}
//       <div className="w-full">
//         <ApplyCoupon
//           availableCoupons={availableCoupons}
//           cartDetails={cartDetails}
//           getCartDetails={getCartDetails}
//         />
//       </div>
//       <div className="mt-6 mb-8">
//         <hr className="border-[#D8D8D8] border-[1px]" />
//       </div>
//       <div className="text-lg">
//         <div className="flex items-center justify-between">
//           <div>Subtotal ( {cartDetails.products.length} items )</div>
//           <div>{cartDetails.summary.total.text}</div>
//         </div>
//         <div className="flex items-center justify-between my-3">
//           <div>Savings</div>
//           <div>- {cartDetails.summary.discount.text}</div>
//         </div>
//         {cartDetails.summary.giftWrap.enabled && (
//           <div className="flex items-center justify-between my-3">
//             <div>Gift Wrap</div>
//             <div>{cartDetails.summary.giftWrap.text}</div>
//           </div>
//         )}
//         {/* <div className="flex items-center justify-between">
//           <div>Shipping</div>
//           <div>{cartDetails.summary.deliveryFee.text}</div>
//         </div> */}
//         <div className="mt-4 mb-5">
//           <hr className="border-[#D8D8D8] border-[1px]" />{" "}
//         </div>
//         <div className="flex items-center justify-between font-semibold">
//           <div>Total</div>
//           <div>{cartDetails.summary.wholeTotal.text}</div>
//         </div>
//       </div>
//       <div className="max-md:mb-[29px]">
//         <Link href="/checkout">
//           <div className="w-full md:mt-12 mt-10 bg-[var(--primary)] text-white text-center py-4 text-[15px] md:text-lg font-medium max-md:uppercase">
//             Check Out
//           </div>
//         </Link>
//         <Link href="/products">
//           <div className="w-full mt-5 md:mt-8 border border-[var(--primary)] text-[var(--primary)] text-center py-4 text-[15px] md:text-lg font-medium max-md:uppercase">
//             Continue Shopping
//           </div>
//         </Link>
//       </div>
//     </div>
//   );
// }
import { CartDetails } from "@/types/providers";
import Link from "next/link";
import React from "react";
import ApplyCoupon from "../cartList/ApplyCoupon";

type Props = {
  cartDetails: CartDetails;
  availableCoupons: any[];
  getCartDetails: () => void;
  // hasGiftWrap: boolean;
  // deliveryInstructions: string;
};

export default function CartInfo({
  cartDetails,
  availableCoupons,
  getCartDetails,
}: // hasGiftWrap,
// deliveryInstructions,
Props) {
  return (
    <div className="w-full h-auto lg:px-[90px] lg:pb-[70px] lg:pt-8">
      {/* <ApplyNote /> */}
      <div className="w-full">
        <ApplyCoupon
          availableCoupons={availableCoupons}
          cartDetails={cartDetails}
          getCartDetails={getCartDetails}
        />
      </div>
      <div className="mt-6 mb-8">
        <hr className="border-[#D8D8D8] border-[1px]" />
      </div>
      {/* {deliveryInstructions && (
          <div className="flex flex-col my-3">
            <div className="font-medium mb-1">Delivery Instructions</div>
            <div className="text-sm bg-gray-50 p-3 rounded">{deliveryInstructions}</div>
          </div>
        )} */}
      <div className="text-lg">
        <div className="flex items-center justify-between">
          <div>Subtotal ( {cartDetails.products.length} items )</div>
          <div>{cartDetails.summary.total.text}</div>
        </div>
        <div className="flex items-center justify-between my-3">
          <div>Savings</div>
          <div>- {cartDetails.summary.discount.text}</div>
        </div>
        {/* {cartDetails.summary.giftWrap.enabled && (
          <div className="flex items-center justify-between my-3">
            <div>Gift Wrap</div>
            <div>{cartDetails.summary.giftWrap.text}</div>
          </div>
        )} */}
        <div className="flex items-center justify-between">
          <div>VAT(inclusive)</div>
          <div>{cartDetails.summary.tax.text}</div>
        </div>
        <div className="mt-4 mb-5">
          <hr className="border-[#D8D8D8] border-[1px]" />{" "}
        </div>
        <div className="flex items-center justify-between font-semibold">
          <div>Total</div>
          {cartDetails.summary.giftWrap.enabled ? (
            <div>
              {typeof cartDetails.summary.wholeTotal.value === "number" &&
              typeof cartDetails.summary.giftWrap.value === "number"
                ? `$${(
                    cartDetails.summary.wholeTotal.value -
                    cartDetails.summary.giftWrap.value
                  ).toFixed(2)}`
                : cartDetails.summary.wholeTotal.text}
            </div>
          ) : (
            <div>{cartDetails.summary.wholeTotal.text}</div>
          )}
        </div>
        <div className="flex items-center justify-between font-semibold text-lg">
          <p className="max-md:pt-1.5 text-xs md:text-sm font-normal">
            Shipping calculated at checkout
          </p>
        </div>
      </div>
      <div className="max-md:mb-[29px]">
        <Link href="/checkout">
          <div className="w-full md:mt-12 mt-10 bg-[var(--primary)] text-white text-center py-4 text-[15px] md:text-lg font-medium max-md:uppercase">
            Check Out
          </div>
        </Link>
        <Link href="/products">
          <div className="w-full mt-5 md:mt-8 border border-[var(--primary)] text-[var(--primary)] text-center py-4 text-[15px] md:text-lg font-medium max-md:uppercase">
            Continue Shopping
          </div>
        </Link>
      </div>
    </div>
  );
}
