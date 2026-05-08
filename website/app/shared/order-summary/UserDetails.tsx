import React, { useEffect, useState } from "react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import api from "@/config/api.interceptor";
import { endpoints } from "@/app/_constants/endpoints/endpoints";
import { toast } from "@/hooks/use-toast";
import Cookies from "js-cookie";

type FormInputs = {
  email: string;
  otp: string;
};

type UserDetailsProps = {
  checkoutFormData: {
    email: string;
  };
  setCheckoutFormData: (data: any) => void;
  cartDetails: any;
};

const UserDetails = ({
  checkoutFormData,
  setCheckoutFormData,
  cartDetails,
}: UserDetailsProps) => {
  const [otpSent, setOtpSent] = useState(false);

  const form = useForm<FormInputs>({
    defaultValues: {
      email: checkoutFormData?.email || "",
      otp: "",
    },
  });

  console.log(cartDetails, "the cart details");

  // Reset to initial state when component mounts
  useEffect(() => {
    // Always start with the Send OTP form
    setOtpSent(false);
    form.reset({
      email: checkoutFormData?.email || "",
      otp: "",
    });
    console.log(checkoutFormData, "checkoutFormData");
  }, [checkoutFormData, form]); // Added proper dependencies

  const validateEmail = async (email: string) => {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    if (!email) {
      toast({ title: "Please enter email", variant: "destructive" });
      return false;
    }
    if (!emailPattern.test(email)) {
      toast({ title: "Please enter valid email", variant: "destructive" });
      return false;
    }
    return true;
  };

  const onSubmitEmail = async (data: FormInputs) => {
    if (!(await validateEmail(data.email))) return;

    try {
      // Validate email
      await api.post(endpoints.validateEmail, {
        email: data.email,
      });

      // Store email in checkout form data
      setCheckoutFormData({
        ...checkoutFormData,
        email: data.email,
      });

      // Send OTP to email
      await api.post(endpoints.verifyEmailaddress, {
        email: data.email,
      });

      toast({
        title: "OTP sent",
        description: "Please check your email for the verification code",
      });

      // Update the form instead of resetting it to keep the email value
      form.setValue("email", "");
      form.setValue("otp", "");

      setOtpSent(true);
    } catch (err: any) {
      console.error("Error:", err);
      toast({
        title: "Failed to send OTP",
        description: err.response?.data?.message || "Please try again",
        variant: "destructive",
      });
    }
  };

  const verifyOtp = async (data: FormInputs) => {
    if (!data.otp) {
      toast({ title: "Please enter OTP", variant: "destructive" });
      return;
    }

    try {
      const response = await api.post(endpoints.varifyEmailOtp, {
        cart: cartDetails?.cart,
        email: checkoutFormData?.email,
        otp: data.otp,
      });

      if (response.data.errorCode === 0) {
        // Set token in cookies
        Cookies.set(
          "guest_access_token",
          response?.data?.result?.output?.token,
          {
            expires: 7,
            secure: true,
            sameSite: "strict",
          }
        );

        toast({
          title: "Email verified successfully",
        });
        setOtpSent(false);

        // Clear the OTP field after successful verification
        form.setValue("otp", "");
        setCheckoutFormData({
          ...checkoutFormData,
          cart: cartDetails?.cart,

          isVerified: true,
        });
      }
    } catch (error: any) {
      console.error("OTP verification error:", error);
      toast({
        title: "OTP verification failed",
        description:
          error.response?.data?.message || "Please try again with correct OTP",
        variant: "destructive",
      });
    }
  };

  return (
    <div>
      <Form {...form}>
        <form
          autoComplete="off"
          onSubmit={form.handleSubmit(otpSent ? verifyOtp : onSubmitEmail)}
          className="space-y-4"
        >
          {!otpSent ? (
            <div className="flex gap-x-2 items-end">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel className="text-black text-xs md:text-base font-normal">
                      Email*
                    </FormLabel>
                    <FormControl>
                      <Input
                        autoComplete="off"
                        placeholder="username@knowear.ae"
                        type="email"
                        {...field}
                        className="bg-[#F9F9F9] text-black text-[13px] md:text-sm font-normal placeholder:text-black/50 h-[45px] md:h-[50px] rounded-none border-[#E8EAED]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="bg-white border border-gray-300 h-[45px] md:h-[50px] rounded-none text-black font-medium text-[15px] block px-4"
              >
                Send OTP
              </Button>
            </div>
          ) : (
            <div className="flex gap-x-2 items-end">
              <FormField
                control={form.control}
                name="otp"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel className="text-black text-xs md:text-base font-normal">
                      OTP*
                    </FormLabel>
                    <FormControl>
                      <Input
                        className="bg-[#F9F9F9] text-black text-[13px] md:text-sm font-normal placeholder:text-black/50 h-[45px] md:h-[50px] rounded-none border-[#E8EAED]"
                        placeholder="Enter OTP received on email"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="bg-white border border-gray-300 h-[45px] md:h-[50px] rounded-none text-black font-medium text-[15px] block px-4"
              >
                Verify OTP
              </Button>
            </div>
          )}
        </form>
      </Form>
    </div>
  );
};

export default UserDetails;
