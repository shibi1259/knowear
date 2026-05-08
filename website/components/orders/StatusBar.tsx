import { formatDateToLocale } from "@/lib/utils";
import React from "react";

const StatusBar = ({
  status = "DELIVERED",
  lastUpdate = "8 June 2023 3:40 PM",
  message = "Your order has been successfully verified.",
}) => {
  const normalStatuses = ["Order Placed", "Inprogress", "Shipped", "Out For Delivery", "Delivered"];

  // Map backend status to display status
  const getDisplayStatus = (backendStatus: string) => {
    if (["PENDING", "PLACED"].includes(backendStatus)) {
      return "Order Placed";
    } else if (backendStatus === "PACKED" || backendStatus === "PARTIAL PROCESSED" || backendStatus=="ACCEPTED") {
      return "Inprogress";
    } else if (backendStatus === "SHIPPED") {
      return "Shipped";
    } else if (backendStatus === "OUT FOR DELIVERY") {
      return "Out For Delivery";
    } else if (["COLLECTED", "DELIVERED"].includes(backendStatus)) {
      return "Delivered";
    }
    return "";
  };

  const getDisplayMessage = (backendStatus: string) => {
    if (["PENDING", "PLACED", "ACCEPTED"].includes(backendStatus)) {
      return "Your order has been successfully placed.";
    } else if (backendStatus === "PACKED") {
      return "Your order has been successfully packed.";
    } else if (backendStatus === "SHIPPED") {
      return "Your order has been successfully shipped";
    } else if (backendStatus === "OUT FOR DELIVERY") {
      return "Your order is out for delivery";
    } else if (["COLLECTED", "DELIVERED"].includes(backendStatus)) {
      return "Your order has been successfully delivered";
    }
    return "";
  };

  const isTerminalState = status === "CANCELLED" || status === "FAILED";
  const currentDisplayStatus = getDisplayStatus(status);
  const statusIndex = normalStatuses.indexOf(currentDisplayStatus);

  const getStatusStyle = (index: number) => {
    if (isTerminalState) {
      return index <= statusIndex ? "bg-red-500" : "bg-gray-200";
    }
    if (index === statusIndex) return "bg-[#CFCFCF]";
    return index <= statusIndex ? "bg-black" : "bg-gray-200";
  };

  const formatStatusText = (text: string) => {
    return text
      .split(" ")
      .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
      .join(" ");
  };

  const getPointerPosition = () => {
    if (statusIndex === 0) return "7%";
    if (statusIndex === 1) return "30%";
    if (statusIndex === 2) return "53%";
    if (statusIndex === 3) return "76%";
    if (statusIndex === 4) return "95%";
    if (statusIndex < 0) return "10%";
    return `${(statusIndex / (normalStatuses.length - 1)) * 100}%`;
  };

  return (
    <div>
      <div className="relative md:w-[66%]">
        {/* Progress Line Container */}
        <div className="absolute top-2.5 left-[8%] md:left-[5%] right-[7%] md:right-[5%] mx-auto">
          {/* Background Line */}
          <div className="absolute h-0.5 w-full bg-gray-200" />

          {/* Colored Progress Line add color if needed */}
          <div
            className={`absolute h-0.5 transition-all duration-500 ${
              isTerminalState ? "bg-red-500" : "bg-gray-200"
            }`}
            style={{
              width: `${(statusIndex / (normalStatuses.length - 1)) * 100}%`,
              display: statusIndex < 0 ? "none" : "block",
            }}
          />
        </div>

        {/* Status Points */}
        <div className="relative flex justify-between px-0">
          {normalStatuses.map((statusItem, index) => (
            <div key={statusItem} className="flex flex-col items-center">
              {/* Status Circle */}
              <div
                className={`size-[22px] rounded-full ${getStatusStyle(index)} 
                                flex items-center justify-center relative z-10 transition-colors duration-300`}
              >
                <div
                  className={`size-3.5 rounded-full ${
                    index <= statusIndex ? "bg-black" : "bg-gray-200"
                  }`}
                />
              </div>

              {/* Status Label */}
              <p
                className={`mt-2 text-[13px] md:text-sm text-center max-w-[100px] 
                            ${
                              index <= statusIndex
                                ? (isTerminalState
                                    ? "text-red-600"
                                    : "text-black") + " font-medium"
                                : "text-gray-500"
                            }`}
              >
                {formatStatusText(statusItem)}
              </p>
            </div>
          ))}
        </div>
      </div>
      {statusIndex >= 0 && (
        <div className="relative mt-4 bg-[#BCFFD1] bg-opacity-20 border border-[#40c369]">
          <div
            className="flex gap-[13px] md:gap-[25px] relative md:w-[66%] px-1 py-1.5 md:p-2 md:pl-[30px] rounded text-xs md:text-sm  
      before:content-[''] before:absolute before:top-0 before:left-[calc(var(--pointer-position)-8px)] 
      before:w-4 before:h-4 before:bg-[#f2fff6]  before:border-l before:border-t 
      before:border-[#40c369] before:transform before:-translate-y-1/2 before:rotate-45 
      before:z-10"
            style={
              {
                ["--pointer-position" as string]: getPointerPosition(),
              } as React.CSSProperties
            }
          >
            <p className="text-black text-opacity-50 text-nowrap">
              {formatDateToLocale(lastUpdate)}
            </p>

            {getDisplayMessage(status)}
          </div>
        </div>
      )}
    </div>
  );
};

export default StatusBar;