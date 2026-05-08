import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

interface DeliveryInstructionsOptionProps {
  onDeliveryInstructionsChange: (instructions: string) => void;
  cartDetails: any;
  existingInstructions?: string;
}

const DeliveryInstructionsOption: React.FC<DeliveryInstructionsOptionProps> = ({
  onDeliveryInstructionsChange,
  cartDetails,
  existingInstructions = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasDeliveryInstructions, setHasDeliveryInstructions] = useState(false);
  const [instructions, setInstructions] = useState("");

  useEffect(() => {
    // Check if delivery note exists in cartDetails
    if (cartDetails?.summary?.deliveryNote?.text) {
      setHasDeliveryInstructions(true);
      setInstructions(cartDetails.summary.deliveryNote.text);
    } else if (
      cartDetails?.summary?.deliveryNote?.text &&
      cartDetails?.summary?.deliveryNote?.text !== ""
    ) {
      setHasDeliveryInstructions(true);
      setInstructions(existingInstructions);
    }
  }, [cartDetails, cartDetails?.summary?.deliveryNote?.text]);

  const handleCheckboxChange = (checked: boolean) => {
    if (checked) {
      setIsOpen(true);
    } else {
      // When unchecking, we're removing the instructions
      setHasDeliveryInstructions(false);
      onDeliveryInstructionsChange(""); // Empty string indicates removal
      setInstructions("");
    }
  };

  const handleSave = () => {
    const trimmedInstructions = instructions.trim();
    if (trimmedInstructions) {
      setHasDeliveryInstructions(true);
      onDeliveryInstructionsChange(trimmedInstructions);
      setIsOpen(false);
    }
  };

  const handleClose = () => {
    // If we were adding new instructions but canceled, restore previous state
    if (!hasDeliveryInstructions) {
      setInstructions(
        cartDetails?.summary?.deliveryNote?.text || existingInstructions || ""
      );
    }
    setIsOpen(false);
  };

  return (
    <div className="flex items-start gap-2 mt-2">
      <Checkbox
        id="delivery-instructions"
        checked={hasDeliveryInstructions}
        onCheckedChange={handleCheckboxChange}
        className="data-[state=checked]:bg-black rounded-none"
      />
      <div className="grid gap-1.5 leading-none">
        <label
          htmlFor="delivery-instructions"
          className="text-sm font-medium leading-none cursor-pointer peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Add Delivery Instructions
        </label>
        {/* {hasDeliveryInstructions && instructions && (
          <p className="text-sm text-gray-500 mt-1 max-w-[200px]">{instructions}</p>
        )} */}
      </div>

      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-center">
              Delivery Instructions
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <p className="text-center text-sm text-gray-600">
              Add any special delivery instructions here
            </p>
            <Textarea
              placeholder="Enter delivery instructions here..."
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              className="min-h-[100px] resize-none"
            />
            <Button
              onClick={handleSave}
              className="w-full bg-black text-white hover:bg-gray-800"
              disabled={!instructions.trim()}
            >
              Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DeliveryInstructionsOption;
