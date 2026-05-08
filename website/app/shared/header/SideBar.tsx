"use client";
import {
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

const SideBar = ({
  menuData,
  setOpen,
}: {
  menuData: any;
  setOpen: (value: boolean) => void;
}) => {
  const [openMenus, setOpenMenus] = useState<any>({});
  const router = useRouter();

  const handleMenuClick = (menu: any) => {
    if (menu.subMenus.length > 0) {
      setOpenMenus((prev: any) => ({
        ...prev,
        [menu.title]: !prev[menu.title],
      }));
    } else {
      setOpenMenus(false);
      router.push(menu.redirection);
       setOpen(false);
    }
  };

   const handleSubmenuClick = () => {
     setOpen(false); // Close the sheet when clicking a submenu item
   };

  return (
    <SheetHeader className="">
      <SheetTitle></SheetTitle>
      <SheetDescription className="w-full">
        {menuData &&
          menuData?.length > 0 &&
          menuData?.map((menu: any) => (
            <div key={menu.title} className="w-full">
              <div
                className="flex justify-between items-center text-black pt-6 cursor-pointer"
                onClick={() => handleMenuClick(menu)}
              >
                <span
                  className={`font-normal text-base relative flex justify-between max-w-3/4 `}
                >
                  <h2
                    className={
                      openMenus[menu.title]
                        ? "after:absolute after:w-5 after:h-px after:bg-black after:bottom-[-4px] after:left-1/2 after:-translate-x-1/2 line-clamp-1"
                        : "line-clamp-1"
                    }
                  >
                    {menu.title}
                  </h2>
                </span>
                {menu?.subMenus?.length > 0 && (
                  <ChevronDown
                    className={`"ml-2 mt-1 size-5 ${
                      openMenus[menu.title] ? "rotate-180" : ""
                    } duration-500 text-gray-600`}
                  />
                )}
              </div>

              {menu?.subMenus &&
                menu.subMenus?.length > 0 &&
                openMenus[menu.title] && (
                  <div className="pl-4 mt-2">
                    {menu.subMenus.map((submenu: any) => (
                      <Link
                        key={submenu._id}
                        href={submenu.redirection}
                        className="block py-3 text-sm text-gray-600 hover:text-gray-900"
                        onClick={handleSubmenuClick}
                      >
                        {submenu.title}
                      </Link>
                    ))}
                  </div>
                )}
            </div>
          ))}
      </SheetDescription>
    </SheetHeader>
  );
};

export default SideBar;
