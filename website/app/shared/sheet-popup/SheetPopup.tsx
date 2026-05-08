import { Button } from "@/components/ui/button";
import Cross from "@/public/svgs/Cross";
import React, { useEffect, useRef } from "react";

type SheetPopupTypes = {
  open: boolean;
  setOpen: (open: boolean) => void;
  title: string;
  description: string;
  onSuccess: (item: any) => void;
  onClose: () => void;
};

const SheetPopup = ({
  open,
  title,
  description,
  onSuccess,
  onClose,
}: SheetPopupTypes) => {

    const popupRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
          onClose();
        }
      };
  
      if (open) {
        document.addEventListener('mousedown', handleClickOutside);
        // Prevent body scroll when popup is open
        document.body.style.overflow = 'hidden';
      }
  
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        // Restore body scroll when popup is closed
        document.body.style.overflow = 'unset';
      };
    }, [open, onClose]);
  
    if (!open) return null;

  return open ? (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" />
      <div ref={popupRef} className="absolute z-40 w-full md:bottom-0  max-md:px-5 max-md:top-[40%] max-md:transform -max-md:translate-y-1/2  text-black">
        <div className="relative px-[15px] md:px-14 pb-[25px] md:pb-[31px] max-md:border max-md:pt-[25px]  md:pt-9 bg-white">
          <button
            className="absolute top-0 right-0 md:right-3"
            onClick={onClose}
          >
            <Cross />
          </button>
          <h3 className="font-medium md:font-semibold text-xl md:text-[25px]">
            {title}
          </h3>
          <p className="font-normal text-[13px] pt-3 md:text-sm max-md:pt-5">
            {description}
          </p>
          <div className="flex gap-x-7 pt-10 md:pt-[65px]">
            <Button
              onClick={onClose}
              className="bg-white border border-black text-black h-[50px] rounded-none w-full hover:bg-white"
            >
              No
            </Button>
            <Button
              onClick={onSuccess}
              className="bg-black border border-black text-white h-[50px] rounded-none w-full hover:bg-black"
            >
              Yes
            </Button>
          </div>
        </div>
      </div>
    </>
  ) : (
    <></>
  );
};

export default SheetPopup;
