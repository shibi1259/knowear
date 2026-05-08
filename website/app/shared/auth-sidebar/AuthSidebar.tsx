"use client";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTrigger,
} from "@/components/ui/sheet";
import userIcon from "../../../public/icons/user.svg";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import React, { act, Suspense, useContext, useEffect, useState } from "react";
import Login from "../login/Login";
import SocialMediaLogin from "../socialmedia-login/SocialMediaLogin";
import Register from "../register/Register";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { StateContext } from "@/providers/state/StateContext";

const AuthSidebar = (props: any) => {
  const { open, setOpen } = props.props;
  const { loggedIn } = useContext(StateContext);
  const [activeTab, setActiveTab] = useState("SignIn");
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loggedIn) {
      router.replace("/", { scroll: false });
      return;
    }
  }, [loggedIn, router]);

  useEffect(() => {
    const viewParam = searchParams.get("view");
    if (viewParam === "signin") {
      setActiveTab("SignIn");
      setOpen(true);
    } else if (viewParam === "signup") {
      setActiveTab("SignUp");
      setOpen(true);
    }
  }, [searchParams, setOpen, activeTab]);

  const handleSheetOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      const params = new URLSearchParams(searchParams.toString());
      params.set("view", activeTab === "SignIn" ? "signin" : "signup");
      router.replace(`?${params.toString()}`, { scroll: false });
    } else {
      router.replace(pathname, { scroll: false });
    }
    setOpen(isOpen);
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    const params = new URLSearchParams(searchParams.toString());
    params.set("view", value === "SignIn" ? "signin" : "signup");
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  return (
    <>
      <Sheet open={open} onOpenChange={handleSheetOpenChange}>
        <SheetTrigger>
          <Image src={userIcon} alt="user icon" className="size-6" />
        </SheetTrigger>
        <SheetContent className="w-full sm:max-w-2xl px-[15px] md:px-14 pt-5 md:pt-9 pb-11 md:pb-[49px] h-screen overflow-auto">
          <SheetHeader className="">
            <h5 className="text-black font-medium md:font-semibold text-xl md:text-[25px] leading-[28.9px] md:leading-[36.13px]">
              {activeTab === "SignIn"
                ? "Hallo! Let's get started"
                : "Create your account"}
            </h5>
          </SheetHeader>

          <SheetDescription>
            <Tabs
              onValueChange={handleTabChange}
              defaultValue={activeTab}
              className="w-full mt-[26px] md:mt-5"
            >
              <TabsList className="flex h-[46px] p-0 border border-[#E5E7EB] rounded-none">
                <TabsTrigger
                  value="SignIn"
                  className="flex w-1/2 h-full rounded-none bg-white data-[state=active]:bg-[#F3F5F7] text-sm font-medium text-black uppercase "
                >
                  Sign In
                </TabsTrigger>
                <TabsTrigger
                  value="SignUp"
                  className="flex w-1/2  h-full rounded-none  bg-white data-[state=active]:bg-[#F3F5F7] text-sm font-medium text-black uppercase "
                >
                  Sign Up
                </TabsTrigger>
              </TabsList>
              <TabsContent value="SignIn" className="mt-5">
                <Login setOpen={setOpen} />
                <div className="text-center md:mt-[20px] mt-5 relative before:absolute before:content-[''] before:w-full before:h-[1px] before:bg-[#D8D8D8] before:top-1/2 before:left-1/2 before:transform before:-translate-y-1/2 before:-translate-x-1/2">
                  <span className="text-black text-[15px] md:text-lg font-normal z-10 bg-white px-[14px] py-[2px] relative leading-5">
                    or
                  </span>
                </div>
                <SocialMediaLogin />
              </TabsContent>
              <TabsContent value="SignUp" className="mt-5">
                <Register setOpen={setOpen} />
                <div className="text-center md:mt-[20px] mt-5 relative before:absolute before:content-[''] before:w-full before:h-[1px] before:bg-[#D8D8D8] before:top-1/2 before:left-1/2 before:transform before:-translate-y-1/2 before:-translate-x-1/2">
                  <span className="text-black text-[15px] md:text-lg  font-normal z-10 bg-white px-[14px] py-[2px] relative leading-5">
                    or
                  </span>
                </div>
                <SocialMediaLogin />
              </TabsContent>
            </Tabs>
          </SheetDescription>
        </SheetContent>
      </Sheet>
    </>
  );
};

const AuthSidebarProvider = (props: any) => {
  return (
    <Suspense>
      <AuthSidebar props={props} />
    </Suspense>
  );
};

export default AuthSidebarProvider;
