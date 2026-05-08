import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import api from "@/config/api.interceptor";
import { endpoints } from "@/app/_constants/endpoints/endpoints";
interface GiftWrapOptionProps {
  onGiftWrapChange: (enabled: boolean) => void;
  cartDetails: any;
  giftWrapAmount: number;
}

const GiftWrapOption = ({
  onGiftWrapChange,
  cartDetails,
  giftWrapAmount,
}: GiftWrapOptionProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isGiftWrap, setIsGiftWrap] = useState(
    cartDetails?.summary?.giftWrap?.enabled
  );
  const [GiftWrapEnabled, setGiftWrapEnabled] = useState(false);

  // Update local state whenever hasGiftWrap prop changes
  useEffect(() => {
    // console.log(cartDetails.summary.giftWrap.enabled, "cart details");
    isGiftWrapEnabled();
    setIsGiftWrap(cartDetails?.summary?.giftWrap?.enabled);
  }, [cartDetails?.summary?.giftWrap?.enabled]);

  const handleCheckboxChange = () => {
    if (!isGiftWrap) {
      setIsOpen(true);
    } else {
      setIsGiftWrap(false);
      onGiftWrapChange(false);
    }
  };

  const handleAddGiftWrap = () => {
    setIsGiftWrap(true);
    setIsOpen(false);
    onGiftWrapChange(true);
  };

  const isGiftWrapEnabled = async () => {
    const response = await api.get(`${endpoints.getGiftWrapDetails}`);
    if (response.data.errorCode == 0) {
      setGiftWrapEnabled(response.data.result.isEnabled);
    }
  };

  return (
    <div className="my-0 sm:my-4">
      {GiftWrapEnabled && (
        <div className="flex items-center gap-2">
          {/* <input
          type="checkbox"
          id="giftWrap"
          checked={cartDetails?.summary?.giftWrap?.enabled}
          onChange={handleCheckboxChange}
          className="w-4 h-4 rounded border-gray-300"
        /> */}
          <Checkbox
            id="giftWrap"
            checked={cartDetails?.summary?.giftWrap?.enabled}
            onCheckedChange={handleCheckboxChange}
            className="data-[state=checked]:bg-black rounded-none"
          />
          <label
            htmlFor="giftWrap"
            className="text-sm font-medium leading-none cursor-pointer peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Add Gift Wrap
          </label>
        </div>
      )}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center mb-4">
              Do you want to gift wrap this order?
            </DialogTitle>
            <button
              onClick={() => setIsOpen(false)}
              className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
            >
              {/* <X size={20} /> */}
            </button>
          </DialogHeader>
          <div className="text-center mb-6">
            <p className="text-sm text-gray-600">
              Add a Gift Wrap to your order, For AED{" "}
              {giftWrapAmount?.toFixed(2)}
            </p>
          </div>
          <button
            onClick={handleAddGiftWrap}
            className="w-full bg-black text-white py-3 rounded hover:bg-gray-800 transition-colors"
          >
            Add a Gift Wrap
          </button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GiftWrapOption;
