"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Orders from "@/public/svgs/Orders";
import ProfileWishlist from "@/public/svgs/ProfileWishlist";
import SignOut from "@/public/svgs/SignOut";
import User from "@/public/svgs/User";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useContext } from "react";
import Cookies from "js-cookie";
import { StateContext } from "@/providers/state/StateContext";
import api from "@/config/api.interceptor";
import { endpoints } from "@/app/_constants/endpoints/endpoints";
import { toast } from "@/hooks/use-toast";
type Props = {};

const ProfileSidebar = (props: Props) => {
  const { user } = useContext(StateContext);
  const pathname = usePathname();
  const useremail = user?.email;
  console.log(user?.email,"user eta")
  const logout = () => {
   
    api
    .post(endpoints.updateCustomerLogoutTime, { useremail })
    .then((response: any) => {
      if (response.data?.errorCode == 0) {
        // getAddress();
      } else {
        toast({
          description: response.data.message || "Something went wrong",
          variant: "destructive",
        });
      }
    })
    .catch((error: any) => {});
    Cookies.remove("access_token");
    Cookies.remove("refresh_token");
   
   
    window.location.href = "/";

  };

  return (
    <div>
      <h3 className="text-2xl font-semibold border-l-[6px] border-[var(--primary)] pl-[23px] line-clamp-1">Hello 
        <span className="pl-1">{user?.name}</span></h3>
      <p className="text-sm pl-[30px]">Welcome to your Account</p>
      <ul className="grid gap-y-[30px] mt-5">
        <li>
          <Link
            href={"/profile"}
            className={`flex items-center justify-start gap-3 md:gap-[17px] text-lg md:pl-[34px] ${pathname === "/profile"
                ? `text-[var(--primary)] border-l-2 border-[var(--primary)] bg-[#F3F5F7] py-[11px] font-semibold`
                : " text-slate-950"
              }`}
          >
            <User  />
            Personal Info
          </Link>
        </li>
        <li>
          <Link
            href={"/orders"}
            className={`flex items-center justify-start gap-3 md:gap-[17px] text-lg md:pl-[34px] ${pathname === "/orders"
              ? `text-[var(--primary)] border-l-2 border-[var(--primary)] bg-[#F3F5F7] py-[11px] font-semibold`
              : " text-slate-950"
            }`}
          >
            <Orders />
            My Orders
          </Link>
        </li>
        <li>
          <Link
            href={"/favourites"}
            className={`flex items-center justify-start gap-3 md:gap-[17px] text-lg md:pl-[34px] ${pathname === "/favourites"
              ? `text-[var(--primary)] border-l-2 border-[var(--primary)] bg-[#F3F5F7] py-[11px] font-semibold`
              : " text-slate-950"
            }`}
          >
            <ProfileWishlist />
            Wishlist
          </Link>
        </li>
        <li>
          <Dialog>
            <DialogTrigger asChild>
              <p className="flex items-center justify-start gap-3 md:gap-[17px] text-lg md:pl-[34px] text-slate-950 cursor-pointer">
                <SignOut />
                Logout
              </p>
            </DialogTrigger>
            <DialogContent className="lg:py-14 max-md:w-[90%]">
              <DialogHeader>
                <DialogTitle className="flex justify-center items-center text-sm md:text-lg">
                  Do you want to logout?
                </DialogTitle>
                <DialogDescription className="flex justify-center items-center gap-2 ">
                  <DialogClose asChild>
                    <Button
                      type="button"
                      variant="secondary"
                      className={`border border-[var(--primary)] text-[var(--primary)]`}
                    >
                      Cancel
                    </Button>
                  </DialogClose>
                  <Button
                    onClick={logout}
                    variant="secondary"
                    className={`border bg-[var(--primary)] text-white hover:bg-white border-[var(--primary)] hover:text-[var(--primary)]`}
                  >
                    Logout
                  </Button>
                </DialogDescription>
              </DialogHeader>
            </DialogContent>
          </Dialog>
        </li>
      </ul>
    </div>
  );
};

export default ProfileSidebar;
