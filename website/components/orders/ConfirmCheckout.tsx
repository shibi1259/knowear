import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";

const AddressConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  addressData 
}: any) => {
  if (!addressData) return null;

  const formatAddress = () => {
    const parts = [];
    if (addressData.additionalAddress) parts.push(addressData.additionalAddress);
    if (addressData.deliveryAddress) parts.push(addressData.deliveryAddress);
    // if (addressData.aptSuiteUnit) parts.push(addressData.aptSuiteUnit);
  
    // if (addressData.city) parts.push(addressData.city);
    if (addressData.state) parts.push(addressData.state);
    // if (addressData.country) parts.push(addressData.country);
    if (addressData.countryName) parts.push(addressData.countryName);``

    // if (addressData.postalCode) parts.push(addressData.postalCode);
    
    return parts.join(", ");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-center">Confirm  Address</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="flex items-start gap-4">
            <MapPin className="h-5 w-5 text-gray-500 mt-1" />
            <div className="flex-1 space-y-1">
              <p className="font-medium">
            <span className="text-black">Name:</span>   {addressData.firstname} {addressData.lastname}
              </p>
              <p className="text-base text-black">
                <span className="font-medium">Email:</span> {addressData.email}
              </p>
              <p className="text-base text-black">
                <span className="font-medium">Phone:</span> {addressData.countryCode} {addressData.mobile}
              </p>
              <p className="text-base text-black">
                <span className="font-medium">Address:</span> {formatAddress()}
              </p>
            </div>
          </div>

          {addressData.deliveryInstruction && (
            <div className="bg-gray-50 p-3 rounded-md">
              <p className="text-sm font-medium">Delivery Instructions:</p>
              <p className="text-sm text-gray-600">{addressData.deliveryInstruction}</p>
            </div>
          )}
        </div>

        <DialogFooter className="flex justify-between gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 border-gray-300 hover:bg-gray-100 hover:text-gray-900"
          >
            Cancel
          </Button>
          <Button 
            onClick={onConfirm}
            className="flex-1 bg-black hover:bg-gray-800 text-white"
          >
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddressConfirmationModal;