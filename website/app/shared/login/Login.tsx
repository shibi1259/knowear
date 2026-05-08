"use client";
import React, { useContext, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import Cookies from "js-cookie";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { Suspense } from "react";
import EyeClose from "@/public/svgs/EyeClose";
import EyeOpen from "@/public/svgs/EyeOpen";
import { endpoints } from "@/app/_constants/endpoints/endpoints";
import api, { setToken } from "@/config/api.interceptor";
import { useRouter, useSearchParams } from "next/navigation";
import { StateContext } from "@/providers/state/StateContext";
import { useToast } from "@/hooks/use-toast";
import { firebaseCloudMessaging } from "@/config/firebase.config";

type LoginFormInputs = {
  email: string;
  password: string;
};

const Login = (props: any) => {
  const searchParams = useSearchParams();
  const redirection = searchParams.get("redirect");
  const params = new URLSearchParams(searchParams.toString());
  const router = useRouter();
  const { toast } = useToast();
  const { getUser } = useContext(StateContext);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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

  const form = useForm<LoginFormInputs>({
    values: {
      email: "",
      password: "",
    },
  });

  const handleResetClick = () => {
    props.setOpen(false);
    params.set("view", "forgot-password");
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  const onSubmit = (data: LoginFormInputs) => {
    api.post(endpoints.emailLogin, data, {
      headers: {
        firebaseToken: firebaseToken,
      }
    }).then((res) => {
      if (res.data.errorCode == 0) {
        setLoading(true);
        setToken(res.data?.result?.accessToken);
        Cookies.remove("guest_access_token");
        Cookies.set("access_token", res.data?.result?.accessToken, { expires: 7, secure: true, sameSite: "strict" });
        Cookies.set("is_logged_in", "true", { expires: 7, secure: true, sameSite: "strict" });
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
      }
    }).catch((error: any) => {
      console.log("error", error);
      toast({
        description: error.response.data.message,
        variant: "destructive",
      });

      if (error.response?.data?.result?.isImported) {
        return;
      }
    });
  };

  const passwordVisibilityToggle = () => {
    setShowPassword(!showPassword);
  };

  return (
    <>
      <Suspense>
        <Form {...form}>
          <form
            autoComplete="off"
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-[15px] md:space-y-[22px]"
          >
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
              render={({ field }: { field: any }) => (
                <FormItem>
                  <FormLabel className="text-black text-xs md:text-base font-normal leading-[17.34px] md:leading-[23.13px]">
                    Email*
                  </FormLabel>
                  <FormControl>
                    <Input
                      autoComplete="off"
                      placeholder="Email"
                      type="email"
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
              name="password"
              rules={{
                required: "Password is required",
                minLength: {
                  value: 6,
                  message: "Password must be at least 6 characters",
                },
              }}
              render={({ field }: { field: any }) => (
                <FormItem className="md:mt-[22px]">
                  <FormLabel className="text-black text-xs md:text-base font-normal leading-[17.34px] md:leading-[23.13px]">
                    Password*
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        autoComplete="off"
                        type={showPassword ? "text" : "password"}
                        placeholder="Password "
                        {...field}
                        className="bg-[#F9F9F9] text-black text-[13px]  md:text-sm font-normal placeholder:text-black/50 h-[45px] md:h-[50px] rounded-none border-[#E8EAED] !mt-1.5"
                      />

                      <Button
                        type="button"
                        variant="ghost"
                        onClick={passwordVisibilityToggle}
                        className="absolute right-3 top-1/2 w-[15.94px] h-[11.67px] -translate-y-1/2 p-0 hover:bg-transparent"
                      >
                        {!showPassword ? <EyeOpen /> : <EyeClose />}
                      </Button>
                    </div>
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              onClick={() => handleResetClick()}
              className="text-xs md:text-[13px] text-[#808080] font-normal table ml-auto pr-0 !mt-[15px] md:!mt-[17px] p-0 h-3.5"
              variant="ghost"
              type="button"
            >
              Forgot Password?
            </Button>
            <Button
              type="submit"
              className="w-full bg-black h-[45px] md:h-[50px] rounded-none text-white font-medium uppercase md:capitalize text-[15px] md:text-lg block !mt-10 md:!mt-[50px]  hover:bg-black"
            >
              {loading ? "Signing In..." : "Sign In"}
            </Button>
          </form>
        </Form>
      </Suspense>
    </>
  );
};

export default Login;