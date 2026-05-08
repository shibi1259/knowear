"use client";
import Bag from "@/public/svgs/Bag";
import Category from "@/public/svgs/Category";
import House from "@/public/svgs/House";
import UserFi from "@/public/svgs/UserFi";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import Cookies from "js-cookie";
import { StateContext } from "@/providers/state/StateContext";

type Props = {
  token: any;
};

function MobileFooter({ token }: Props) {
  const pathname = usePathname();
  const accesToken = Cookies.get('access_token')
   const { loggedIn, cartDetails, wishlistDetails } =
      React.useContext(StateContext);

  const navItems = [
    { href: "/", label: "Home", Icon: House },
    { href: "/categories", label: "Category", Icon: Category },
    { href: "/cart", label: "Cart", Icon: Bag },
    {
      href: accesToken ? "/account" : "?view=signin",
      label: "My Account",
      Icon: UserFi,
    },
  ];

  const disableContainer =
    pathname.includes("/add-address") ||
    pathname.includes("/order-placed") ||
    pathname.includes("/profile") ||
    pathname.includes("/orders")||
    pathname.includes("/favourites")
      ? "hidden md:block "
      : "";

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 w-full bg-white md:hidden z-30  ${disableContainer}`}
    >
      <ul className="flex justify-start items-center">
        {navItems.map((item) => { 
          const isActive = pathname === item.href;
          return (
            <li key={item.href} className="w-1/4">
              <Link
                href={item.href}
                className={`pt-[10px] pb-[7px] text-center flex justify-center items-center flex-col ${
                  isActive ? "text-blue-500" : "text-black/50"
                }`}
              >
                <div className="relative">
                  <item.Icon
                  // fill={isActive ? '#000' : ''}
                  // stroke={isActive ? '#fff' : '#808080'}
                  />
                  {item.label === "Cart" && (
                    <div className="absolute -top-2 left-3 size-[19px] bg-white rounded-full p-[2px]">
                      <div className="bg-black rounded-full h-full w-full flex justify-center items-center text-white text-xs">
                        <p className="truncate w-4 text-center">
                          {cartDetails?.products?.length || 0}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
                <span
                  className={`text-xs ${
                    isActive
                      ? "text-black font-semibold"
                      : "text-black/50 font-normal "
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default MobileFooter;
