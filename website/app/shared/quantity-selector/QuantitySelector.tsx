import React, { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

type Props = {
  quantity: string;
  isCart?: boolean;
  setQuantity: (quantity: string) => void;
  miniCart?: boolean;
};

const QuantitySelector = (props: Props) => {
  const { quantity, setQuantity, miniCart } = props;

  const handleQuantityChange = (value: string) => {
    setQuantity(value);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    if (/^\d*$/.test(value)) {
      setQuantity(value);
    }
  };

  const isInputField = parseInt(quantity) > 9;

  return (
    <>
      {isInputField ? (
        <Input
          type="text"
          value={quantity}
          onChange={handleInputChange}
          className={`${
            miniCart
              ? "w-[72px] h-[27px] md:w-[71px] md:h-[33px]"
              : props.isCart
              ? "w-[72px] h-[27px] md:w-24 md:h-[46px]"
              : "w-[66px] h-[50px]"
          } border border-[#E8EAED] rounded-none text-center`}
        />
      ) : (
        <Select value={quantity} onValueChange={handleQuantityChange}>
          <SelectTrigger
            className={`${
              miniCart
                ? "w-[72px] h-[27px] md:w-[71px] md:h-[33px]"
                : props.isCart
                ? "w-[72px] h-[27px] md:w-24 md:h-[46px]"
                : "w-[66px] h-[50px]"
            }  rounded-none`}
          >
            <SelectValue />
            <div className="border-r h-5 w-px border-[#E5E7EB] " />
          </SelectTrigger>
          <SelectContent>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
              <SelectItem key={num} value={num.toString()}>
                <p className="font-bold text-[13px] text-black">{num}</p>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </>
  );
};

export default QuantitySelector;
