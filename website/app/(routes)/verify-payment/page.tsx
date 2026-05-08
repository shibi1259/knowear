"use client";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import api from "@/config/api.interceptor";
import { toast } from "@/hooks/use-toast";

interface ButtonProps {
  text: string;
  className: string;
  onClick?: () => void;
}

const Button: React.FC<ButtonProps> = ({ text, className, onClick }) => {
  return (
    <button className={className} onClick={onClick}>
      {text}
    </button>
  );
};

const VerifyPayment = () => {
  const guestToken = Cookies.get("guest-token");
  const router = useRouter();
  const [isOpen, setIsOpen] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);

  const searchParams = useSearchParams();
  const [orderId, setOrderId] = useState("");

  const verifyPayment = async () => {
    try {
      const resp = await api.post("/verify-payment", {
        order: searchParams.get("orderId"),
      });
      setOrderId(resp?.data?.result?.order);

      toast({ description: "Placing Order.." });
      window.location.href = `/order-placed?orderId=${searchParams.get("orderId")}`;
    } catch (error) {
      router.push("/verification-failed");
    }
  };
  
  useEffect(() => {
    if (searchParams.get("orderId")) {
      verifyPayment();
    }
    // eslint-disable-next-line
  }, [searchParams]);

  return (
    <div className="flex flex-col items-center justify-center py-10">
      <h3 className="text-lg font-semibold">Verifying Payment ....</h3>
    </div>
  );
};

export default VerifyPayment;
