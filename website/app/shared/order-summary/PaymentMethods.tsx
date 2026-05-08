import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import React, { useEffect, useState } from "react";
import UserDetails from "./UserDetails";
import { trackCheckout } from "@/config/fpixel";
import { trackPaymentInfo } from "@/config/fpixel";

type PaymentMethodsProps = {
  checkoutFormData: {
    email: string;
    paymentType: string;
    cardNo: string;
    cardName: string;
    expiryDate: string;
    cvv: string;
  };
  setCheckoutFormData: (data: any) => void;
  cartDetails: any;
  guestToken?: string;
};

const PaymentMethods = ({
  checkoutFormData,
  setCheckoutFormData,
  cartDetails,
  guestToken,
}: PaymentMethodsProps) => {
  const [showUserDetails, setShowUserDetails] = useState(false);

  // console.log(cartDetails,"cartDetails123");
  // useEffect(() => {
  //   // Show UserDetails if COD is selected
  //   if (checkoutFormData?.paymentType === "cod") {
  //     setShowUserDetails(true);
  //   } else {
  //     setShowUserDetails(false);
  //   }
  // }, [checkoutFormData?.paymentType]);
  useEffect(() => {
    switch (checkoutFormData?.paymentType) {
      case "cod":
        setShowUserDetails(true);
        trackPaymentInfo({
          payment_method: "cash_on_delivery",
          cart_total: cartDetails?.total || 0,
          cart_items_count: cartDetails?.items?.length || 0,
          payment_type: "cod",
        });
        break;
      case "card":
        setShowUserDetails(false);
        trackPaymentInfo({
          payment_method: "credit_debit_card",
          cart_total: cartDetails?.total || 0,
          cart_items_count: cartDetails?.items?.length || 0,
          payment_type: "card",
        });
        break;
      default:
        setShowUserDetails(false);
    }
  }, [checkoutFormData?.paymentType, cartDetails]);

  return (
    <div>
      <h4 className="font-medium md:font-semibold text-xl md:text-[22px]">
        Payment Method
      </h4>
      <p className="font-normal text-base md:text-xs pt-0 md:pt-2.5">
        All transactions are secure and encrypted.
      </p>
      <RadioGroup
        className="pt-5"
        value={checkoutFormData?.paymentType}
        onValueChange={(e) => {
          setCheckoutFormData({ ...checkoutFormData, paymentType: e });
        }}
      >
        <div className="flex gap-x-[9px]">
          <RadioGroupItem className="mt-1" value="card" />
          <div>
            <Label
              htmlFor="option-two"
              className="font-medium text-base md:text-xl"
            >
              Credit/Debit Card
            </Label>
            <p className="font-medium text-xs md:text-base">
              We accept all major cards.
            </p>
          </div>
        </div>

        {/* {checkoutFormData?.paymentType === "card" && (
          <div className="grid grid-cols-2 gap-x-10 gap-y-5 mb-5 pt-[15px] md:pt-[29px]">
            <div>
              <Label>Card Number*</Label>
              <Input
                className="bg-[#F9F9F9] rounded-none py-6 px-5 border border-[#E8EAED]"
                placeholder="Card number"
                value={checkoutFormData?.cardNo}
                onChange={(e) =>
                  setCheckoutFormData({
                    ...checkoutFormData,
                    cardNo: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <Label>Name on Card*</Label>
              <Input
                className="bg-[#F9F9F9] rounded-none py-6 px-5 border border-[#E8EAED]"
                placeholder="Name on card"
                value={checkoutFormData?.cardName}
                onChange={(e) =>
                  setCheckoutFormData({
                    ...checkoutFormData,
                    cardName: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <Label>Expiry date*</Label>
              <Input
                className="!bg-[#F9F9F9] rounded-none py-6 px-5 border border-[#E8EAED]"
                placeholder="MM/YY"
                name="date"
                value={checkoutFormData?.expiryDate}
                onChange={(e) =>
                  setCheckoutFormData({
                    ...checkoutFormData,
                    expiryDate: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <Label>CVV*</Label>
              <Input
                type="password"
                className="!bg-[#F9F9F9] rounded-none py-6 px-5 border border-[#E8EAED]"
                placeholder="***"
                value={checkoutFormData?.cvv}
                onChange={(e) =>
                  setCheckoutFormData({
                    ...checkoutFormData,
                    cvv: e.target.value,
                  })
                }
              />
            </div>
          </div>
        )} */}
        <div className="flex gap-x-[9px] items-start">
          <RadioGroupItem className="mt-1" value="cod" />
          <div className="w-full">
            <Label
              htmlFor="option-two"
              className="font-medium text-base md:text-xl"
            >
              Cash on Delivery
            </Label>
            <p className="font-medium text-xs md:text-base mb-4">
              Pay with cash upon delivery.
            </p>

        
          </div>
        </div>
      </RadioGroup>
    </div>
  );
};

export default PaymentMethods;
