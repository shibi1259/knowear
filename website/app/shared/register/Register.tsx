"use client";
import React, { useContext, useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
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
import EyeOpen from "@/public/svgs/EyeOpen";
import EyeClose from "@/public/svgs/EyeClose";
import { useRouter, useSearchParams } from "next/navigation";
import { StateContext } from "@/providers/state/StateContext";
import Cookies from "js-cookie";
import api, { setToken } from "@/config/api.interceptor";
import { endpoints } from "@/app/_constants/endpoints/endpoints";
import { toast } from "@/hooks/use-toast";
import { Suspense } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { firebaseCloudMessaging } from "@/config/firebase.config";

type RegisterFormInputs = {
  email: string;
  password: string;
  name: string;
  mobile: string;
  countryCode: string;
};

const Register = (props: any) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
   const searchParams = useSearchParams();
    const redirection = searchParams.get("redirect");
 
    const params = new URLSearchParams(searchParams.toString());
  const { getUser, redirect, setRedirect } = useContext(StateContext);
  const [isConsented, setIsConsented] = useState(false);
  const [firebaseToken, setFirebaseToken] = useState("");

  const getToken = async () => {
    try {
      const token = await firebaseCloudMessaging.init();

      if (token) {
        setFirebaseToken(token);
        await firebaseCloudMessaging.getMessage();
        // setFirebaseToken(token);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.addEventListener("message", (event) =>
        console.log("event for the service worker", event)
      );
    }
    async function setToken() {
      await getToken();
    }
    setToken();
  }, []);

  const form = useForm<RegisterFormInputs>({
    defaultValues: {
      email: "",
      name: "",
      password: "",
      mobile: "",
      countryCode: "+971",
    },
  });

  const onSubmit = (data: RegisterFormInputs) => {
    setIsSubmitting(true);

    api
      .post(endpoints.register, {
        ...data,
        source: "website",
      }, {
        headers: {
          firebaseToken: firebaseToken,
        }
      })
      .then((res) => {
        setToken(res.data?.result?.accessToken);
        Cookies.remove("guest_access_token");
        Cookies.set("access_token", res.data?.result?.accessToken);
        Cookies.set("is_logged_in", "true");
        toast({ title: res.data.message, variant: "success" });
        // if (res.data?.result?.accessToken) {
        //   getUser(true).then((res: any) => {
        //     if (redirect) {
        //       router.push(redirect);
        //       props.setOpen(true);
        //       setRedirect(null);
        //     } else {
        //       router.push("/");
        //       props.setOpen(true);
        //     }
        //   });
        // }
        if (res.data?.result?.accessToken) {
          getUser(true).then((res: any) => {
            // Fixed redirection logic - always redirect to checkout when coming from cart
            if (redirection === "/cart" || redirection === "cart" || 
                (typeof redirection === 'string' && redirection.toLowerCase().includes("cart"))) {
              router.push("/checkout");
              props.setOpen(false); // Close the login modal after successful login
            } else if (redirection) {
              router.push(redirection);
              props.setOpen(false); // Close the login modal after successful login
            } else {
              router.push("/"); // Default fallback
              props.setOpen(false); // Close the login modal after successful login
            }
          });
        }
      })
      .catch((error) => {
        toast({
          title: error?.response?.data?.message || "An error occurred",
          variant: "destructive",
        });
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  const formatPhoneNumber = (value: string) => {
    const digits = value.replace(/\D/g, "");
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6, 9)}`;
  };

  const [showPassword, setShowPassword] = useState(false);

  const passwordVisibilityToggle = () => {
    setShowPassword(!showPassword);
  };

  return (
    <>
      <Suspense>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-[15px] md:space-y-[22px]"
          >
            <FormField
              control={form.control}
              name="name"
              rules={{
                required: "Name is required",
                minLength: {
                  value: 2,
                  message: "Name must be at least 2 characters",
                },
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-black text-xs md:text-base font-normal leading-[17.34px] md:leading-[23.13px]">
                    Full Name*
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Full Name "
                      {...field}
                      className="bg-[#F9F9F9] text-black text-[13px] md:text-sm font-normal placeholder:text-black/50 h-[45px] md:h-[50px] rounded-none border-[#E8EAED] !mt-1.5"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              rules={{
                required: "Email is required",
                pattern: {
                  value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
                  message: "Please enter a valid email address",
                },
              }}
              render={({ field }) => (
                <FormItem className="!mt-3.5">
                  <FormLabel className="text-black text-xs md:text-base font-normal leading-[17.34px] md:leading-[23.13px]">
                    Email*
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Email "
                      {...field}
                      className="bg-[#F9F9F9] text-black text-[13px] md:text-sm font-normal placeholder:text-black/50 h-[45px] md:h-[50px] rounded-none border-[#E8EAED] !mt-1.5"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="mobile"
              render={({ field }) => (
                <FormItem className="relative !mt-3.5">
                  <FormLabel className="text-black text-xs md:text-base font-normal leading-[17.34px] md:leading-[23.13px]">
                    Phone Number
                  </FormLabel>
                  <div className="flex relative !mt-1.5">
                    <FormField
                      control={form.control}
                      name="countryCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl className="relative">
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <SelectTrigger className="w-[75px] ltr:border-r-0 rtl:border-r-[1px] ltr:rounded-tr-none ltr:rounded-br-none  rtl:border-l-0 ltr:border-l-[1px] rtl:rounded-tl-none rtl:rounded-bl-none bg-[#F9F9F9] text-black text-[13px] md:text-sm font-normal placeholder:text-black/50 h-[45px] md:h-[50px] rounded-none border-[#E8EAED]">
                                <SelectValue
                                  placeholder="+971"
                                  defaultValue="+971"
                                />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectGroup>
                                  <SelectItem value="+971">+971</SelectItem>
                                </SelectGroup>
                              </SelectContent>
                            </Select>
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormControl>
                      <Input
                        {...field}
                        type="text"
                        id="mobile"
                        placeholder="000-0000"
                        className="w-full ltr:border-l-0 ltr:rounded-tl-none ltr:rounded-bl-none ltr:pl-0  rtl:border-r-0 rtl:rounded-tr-none rtl:rounded-br-none rtl:pr-0 bg-[#F9F9F9] text-black text-[13px] md:text-sm font-normal placeholder:text-black/50 h-[45px] md:h-[50px] rounded-none border-[#E8EAED]"
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, "");
                          const formattedValue = formatPhoneNumber(value);
                          e.target.value = formattedValue;
                          field.onChange(value);
                          form.trigger("mobile");
                        }}
                      />
                    </FormControl>
                  </div>
                  <FormMessage className="text-xs mt-1">
                    {form.formState.errors.mobile?.message}
                  </FormMessage>
                </FormItem>
              )}
              rules={{
                required: "Phone number is required",
                pattern: {
                  value: /^[0-9]{9}$/,
                  message: "Phone number must be 9 digits",
                },
              }}
            />
            <FormField
              control={form.control}
              name="password"
              rules={{
                required: "Password is required",
                minLength: {
                  value: 6,
                  message: "Password must be at least 6 characters",
                },
              }}
              render={({ field }) => (
                <FormItem className="!mt-3.5">
                  <FormLabel className="text-black text-xs md:text-base font-normal leading-[17.34px] md:leading-[23.13px]">
                    Password*
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Password "
                        {...field}
                        className="bg-[#F9F9F9] text-black text-[13px]  md:text-sm font-normal placeholder:text-black/50 h-[45px] md:h-[50px] rounded-none border-[#E8EAED] !mt-1.5"
                      />

                      <Button
                        type="button"
                        variant="ghost"
                        onClick={passwordVisibilityToggle}
                        className="absolute right-3 w-[15px] h-[15px] top-1/2 -translate-y-1/2 p-0"
                      >
                        {showPassword ? <EyeOpen /> : <EyeClose />}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="w-full bg-black h-[45px] md:h-[50px] rounded-none text-white font-medium uppercase md:capitalize text-[15px] md:text-lg block !mt-10 md:!mt-[50px] hover:bg-black"
            >
              Sign Up
            </Button>
          </form>
        </Form>
      </Suspense>
    </>
  );
};

export default Register;
