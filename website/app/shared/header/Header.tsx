// "use client";
// import React, { useEffect, useState } from "react";
// import Link from "next/link";
// import Image from "next/image";
// import { Button } from "@/components/ui/button";
// import Logo from "../../../public/logo.svg";
// import Hamburger from "../../../public/icons/hamburger.svg";
// import Search from "../../../public/icons/search.svg";
// import userIcon from "../../../public/icons/user.svg";
// import heartIcon from "../../../public/icons/wishlist2.svg";
// import BagIcon from "../../../public/icons/cart.svg";
// import AuthSidebarProvider from "../auth-sidebar/AuthSidebar";
// import { StateContext } from "@/providers/state/StateContext";
// import { useRouter, useSearchParams } from "next/navigation";
// import { usePathname } from "next/navigation";
// import Cookies from "js-cookie";

// import ForgotPasswordPopUp from "../forgot-password-popup/ForgotPasswordPopUp";
// import {
//   Popover,
//   PopoverContent,
//   PopoverTrigger,
// } from "@/components/ui/popover";
// import SearchPopup from "./SearchPopup";
// import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
// import SideBar from "./SideBar";
// import ResetPassword from "../reset-password/ResetPassword";
// import api from "@/config/api.interceptor";
// import { endpoints } from "@/app/_constants/endpoints/endpoints";
// type Props = {
//   deviceType: string;
// };

// const Header = (props: Props) => {
//   const { loggedIn, cartDetails, wishlistDetails } =
//     React.useContext(StateContext);
//   const [open, setOpen] = React.useState(false);
//   const [open1, setOpen1] = React.useState(false);
//   const [popUpOpen, setPopUpOpen] = React.useState(false);
//   const [resetPopUp, setResetPopup] = React.useState(false);
//   const [searchPopUp, setSearchPopUp] = React.useState(false);
//   const [headerMenus, setHeaderMenus] = React.useState([]);
//   const [sideMenus, setSideMenus] = React.useState([]);
//   const searchParams = useSearchParams();
//   const router = useRouter();
//   const params = new URLSearchParams(searchParams.toString());
//   const dialogRef = React.useRef<HTMLDivElement>(null);
//   const pathname = usePathname();
//   const contentRef = React.useRef<any>(null);

//   React.useEffect(() => {
//     if (params.get("view") === "forgot-password") {
//       setPopUpOpen(true);
//     } else {
//       setPopUpOpen(false);
//     }
//   }, [params]);

//   React.useEffect(() => {
//     if (params.get("view") === "reset-password") {
//       setResetPopup(true);
//     } else {
//       setResetPopup(false);
//     }
//   }, [params]);

//   React.useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       if (
//         dialogRef.current &&
//         !dialogRef.current.contains(event.target as Node)
//       ) {
//         setPopUpOpen(false);
//         router.push("/"); // Clears the search parameters
//       }
//     };

//     if (popUpOpen) {
//       document.addEventListener("mousedown", handleClickOutside);
//     }

//     return () => {
//       document.removeEventListener("mousedown", handleClickOutside);
//     };
//   }, [popUpOpen, router]);

//   React.useEffect(() => {
//     if (searchPopUp) {
//       document.body.classList.add("overflow-hidden");
//     } else {
//       document.body.classList.remove("overflow-hidden");
//     }
//   }, [searchPopUp]);

//   React.useEffect(() => {
//     const handleClick = (event: any) => {
//       // Check if click is outside the content div
//       if (contentRef.current && !contentRef.current.contains(event.target)) {
//         // Check if the click is not on the trigger button
//         const triggerElement = document.querySelector('[data-trigger="true"]');
//         if (!triggerElement?.contains(event.target)) {
//           setSearchPopUp(false);
//         }
//       }
//     };

//     // Only add listener if popover is open
//     if (searchPopUp) {
//       document.addEventListener("mousedown", handleClick);
//     }

//     return () => {
//       document.removeEventListener("mousedown", handleClick);
//     };
//   }, [searchPopUp]);

//   useEffect(() => {
//     const fetchHeader = async () => {
//       try {
//         const response = await api.get(endpoints.getHeaderMenu);
//         setHeaderMenus(response.data.result?.featuredMenu || []);
//       } catch (error) {
//         console.error("Error fetching header menu:", error);
//       }
//     };

//     const fetchSideMenu = async () => {
//       try {
//         const response = await api.get(endpoints.getSideMenu);
//         setSideMenus(response.data?.result || []);
//       } catch (error) {
//         console.error("Error fetching header menu:", error);
//       }
//     };

//     fetchSideMenu();
//     fetchHeader();
//   }, []);

//   const getRedirectionPath = (menu: any) => {
//     switch (menu.menuType) {
//       case "category":
//         return `/products/${menu.redirection}`;
//       case "product":
//         return `/p/${menu.redirection}`;
//       case "cmsPages":
//         return `/${menu.redirection}`;
//       default:
//         return `/${menu.redirection}`;
//     }
//   };

//   const disableContainer =
//     pathname.includes("/add-address") ||
//     pathname.includes("/order-placed") ||
//     pathname.includes("/profile") ||
//     pathname.includes("/orders") ||
//     pathname.includes("/favourites")
//       ? "hidden md:block "
//       : "";

//   return (
//     <>
//       <header
//         className={`bg-white py-[18px] lg:pt-5 lg:pb-6 ${disableContainer} ${
//           pathname === "/" ? "" : "border-b-[1px] border-b-[#E5E7EB]"
//         }`}
//       >
//         <div className="container max-w-full">
//           <div className="flex justify-start items-center gap-1 xl:gap-0">
//             <Sheet open={open1} onOpenChange={setOpen1}>
//               <SheetTrigger>
//                 <Button
//                   variant="ghost"
//                   className="p-0 h-[24px] flex justify-end items-end"
//                 >
//                   <Image src={Hamburger} alt="Hamburger" className="w-6" />
//                 </Button>
//               </SheetTrigger>
//               <SheetContent
//                 showCloseIcon={false}
//                 side={"left"}
//                 className="px-[30px] w-[272px] sheet-content-custom-scrollbar"
//               >
//                 <SideBar menuData={sideMenus} setOpen={setOpen1} />
//               </SheetContent>
//             </Sheet>

//             <Link
//               href={"/"}
//               className="w-[132px] ml-auto xl:ml-[75px] table mr-auto xl:mr-[75px]"
//             >
//               <Image src={Logo} alt="Logo" />
//             </Link>
//             <nav className="hidden lg:block lg:mr-auto">
//               <ul className="flex justify-start  items-center gap-1">
//                 {headerMenus?.map((menu: any, index: number) => (
//                   <li key={index}  >
//                     <Link
//                       href={getRedirectionPath(menu)}
//                       className="py-2 px-4 text-black hover:text-white sm:text[0.8rem] xl:px-2  xl:text[0.8rem] font-normal z-10 relative
//                   before:content-[''] before:absolute before:block before:top-0 before:left-0 before:right-0
//                   before:bottom-0 before:m-auto before:w-full before:h-[1px] before:text-transparent
//                 before:bg-black before:invisible before:opacity-0 before:-z-10
//                   hover:before:visible hover:before:opacity-100  hover:before:h-full before:transition-all before:duration-500"
//                     >
//                       {menu.title}
//                     </Link>
//                   </li>
//                 ))}

//                 {/* <li>
//                   <Link
//                     href={"/"}
//                     className="py-2 px-4 text-black hover:text-white text-base font-normal z-10 relative 
//                   before:content-[''] before:absolute before:block before:top-0 before:left-0 before:right-0 
//                   before:bottom-0 before:m-auto before:w-full before:h-[1px] before:text-transparent 
//                 before:bg-black before:invisible before:opacity-0 before:-z-10 
//                   hover:before:visible hover:before:opacity-100  hover:before:h-full before:transition-all before:duration-500"
//                   >
//                     Womenswear
//                   </Link>
//                 </li> */}

//                 {/* <li>
//                   <Link
//                     href={"/"}
//                     className="py-2 px-4 text-black hover:text-white text-base font-normal z-10 relative 
//                   before:content-[''] before:absolute before:block before:top-0 before:left-0 before:right-0 
//                   before:bottom-0 before:m-auto before:w-full before:h-[1px] before:text-transparent 
//                 before:bg-black before:invisible before:opacity-0 before:-z-10 
//                   hover:before:visible hover:before:opacity-100  hover:before:h-full before:transition-all before:duration-500"
//                   >
//                     Accessories
//                   </Link>
//                 </li>
//                 <li>
//                   <Link
//                     href={"/about"}
//                     className="py-2 px-4 text-black hover:text-white text-base font-normal z-10 relative 
//                   before:content-[''] before:absolute before:block before:top-0 before:left-0 before:right-0 
//                   before:bottom-0 before:m-auto before:w-full before:h-[1px] before:text-transparent 
//                 before:bg-black before:invisible before:opacity-0 before:-z-10 
//                   hover:before:visible hover:before:opacity-100  hover:before:h-full before:transition-all before:duration-500"
//                   >
//                     About Us
//                   </Link>
//                 </li> */}
//               </ul>
//             </nav>
//             <div className="mr-8 xl:mr-0 xl:ml-auto xl:pr-[26px] xl:border-r xl:border-black-50 2xl:w-[170px]">
//               <Popover open={searchPopUp} onOpenChange={setSearchPopUp}>
//                 <PopoverTrigger asChild>
//                   <button className="relative xl:border-b xl:border-b-black xl:pl-8 xl:pt-0 xl:pb-1 xl:h-7 w-full block focus-visible:outline-none">
//                     <Image
//                       src={Search}
//                       alt="search"
//                       className="xl:absolute xl:top-1/2 xl:-translate-y-1/2 xl:left-0"
//                     />
//                     <span className="text-sm text-[#1E1E1E] font-normal hidden xl:block text-left pt-1">
//                       Search
//                     </span>
//                   </button>
//                 </PopoverTrigger>
//                 <PopoverContent
//                   className={`w-full ${
//                     searchPopUp ? "!mt-[-52px]" : "mt-[20px]"
//                   }  md:w-[100vw] md:h-[100vh] p-0 bg-black/50  rounded-none border-0 flex justify-end`}
//                 >
//                   <div
//                     ref={contentRef}
//                     className="md:w-[1200px] mt-[74px] max-md:h-[90vh] max-md:overflow-y-scroll"
//                   >
//                     <SearchPopup setSearchPopUp={setSearchPopUp} />
//                   </div>
//                 </PopoverContent>
//               </Popover>
//             </div>
//             <div className="">
//               <ul className="flex justify-end items-center w-full">
//                 <li className="hidden lg:flex justify-center items-center lg:h-6 lg:px-4 xl:px-7 lg:border-r lg:border-black-50 lg:py-[2px]">
//                   {loggedIn ? (
//                     <Link href="/profile">
//                       <Image
//                         src={userIcon}
//                         alt="user icon"
//                         className="size-6"
//                       />
//                     </Link>
//                   ) : (
//                     <AuthSidebarProvider open={open} setOpen={setOpen} />
//                   )}
//                 </li>
//                 <li className="lg:flex justify-center items-center lg:h-6  lg:px-4 xl:px-7 lg:border-r lg:border-black-50  lg:py-[2px]">
//                   <Link
//                     href={"/favourites"}
//                     className="flex items-center relative"
//                   >
//                     <Image src={heartIcon} alt="user icon" className="size-6" />
//                     <div className="absolute -top-2 left-3 size-[19px] bg-white rounded-full p-[2px]">
//                       <div className="bg-black rounded-full h-full w-full flex justify-center items-center text-white text-xs">
//                         <p className="truncate w-4 text-center">
//                           {wishlistDetails?.length || 0}
//                         </p>
//                       </div>
//                     </div>
//                   </Link>
//                 </li>
//                 <li className="hidden  lg:flex justify-center items-center lg:h-6  lg:px-4 xl:px-7 lg:pr-0 xl:pr-0 lg:border-r-0">
//                   <Link href={"/cart"} className="flex items-center relative">
//                     <Image src={BagIcon} alt="user icon" className="size-6" />
//                     <div className="absolute -top-2 left-3 size-[19px] bg-white rounded-full p-[2px]">
//                       <div className="bg-black rounded-full h-full w-full flex justify-center items-center text-white text-xs">
//                         <p className="truncate w-4 text-center">
//                           {cartDetails?.products?.length || 0}
//                         </p>
//                       </div>
//                     </div>
//                     <span className="text-[#1E1E1E] font-normal text-sm ml-[9px]">
//                       {cartDetails.summary?.wholeTotal?.text || "AED 0.00"}
//                     </span>
//                   </Link>
//                 </li>
//               </ul>
//             </div>
//           </div>
//         </div>
//       </header>
//       {/* Forgot pass dialog */}

//       <ForgotPasswordPopUp popUpOpen={popUpOpen} dialogRef={dialogRef} />
//       <ResetPassword resetPopUp={resetPopUp} setResetPopup={setResetPopup} />
//     </>
//   );
// };

// export default Header;
"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Logo from "../../../public/logo.svg";
import Hamburger from "../../../public/icons/hamburger.svg";
import Search from "../../../public/icons/search.svg";
import userIcon from "../../../public/icons/user.svg";
import heartIcon from "../../../public/icons/wishlist2.svg";
import BagIcon from "../../../public/icons/cart.svg";
import AuthSidebarProvider from "../auth-sidebar/AuthSidebar";
import { StateContext } from "@/providers/state/StateContext";
import { useRouter, useSearchParams } from "next/navigation";
import { usePathname } from "next/navigation";
import Cookies from "js-cookie";

import ForgotPasswordPopUp from "../forgot-password-popup/ForgotPasswordPopUp";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import SearchPopup from "./SearchPopup";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import SideBar from "./SideBar";
import ResetPassword from "../reset-password/ResetPassword";
import api from "@/config/api.interceptor";
import { endpoints } from "@/app/_constants/endpoints/endpoints";
type Props = {
  deviceType: string;
};

const Header = (props: Props) => {
  const { loggedIn, cartDetails, wishlistDetails } =
    React.useContext(StateContext);
  const [open, setOpen] = React.useState(false);
  const [open1, setOpen1] = React.useState(false);
  const [popUpOpen, setPopUpOpen] = React.useState(false);
  const [resetPopUp, setResetPopup] = React.useState(false);
  const [searchPopUp, setSearchPopUp] = React.useState(false);
  const [headerMenus, setHeaderMenus] = React.useState([]);
  const [sideMenus, setSideMenus] = React.useState([]);
  const [isSticky, setIsSticky] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);
  const searchParams = useSearchParams();
  const router = useRouter();
  const params = new URLSearchParams(searchParams.toString());
  const dialogRef = React.useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const contentRef = React.useRef<any>(null);
  const headerRef = React.useRef<HTMLElement>(null);

  // Handle scroll event for sticky header
  useEffect(() => {
    const handleScroll = () => {
      const currentPosition = window.scrollY;
      setScrollPosition(currentPosition);
      
      const scrollThreshold = 100; // Adjust this value as needed
      if (currentPosition > scrollThreshold && !isSticky) {
        setIsSticky(true);
      } else if (currentPosition <= scrollThreshold && isSticky) {
        setIsSticky(false);
      }
    };

    // Throttle scroll events for better performance
    let ticking = false;
    const scrollListener = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', scrollListener);
    return () => window.removeEventListener('scroll', scrollListener);
  }, [isSticky]);

  React.useEffect(() => {
    if (params.get("view") === "forgot-password") {
      setPopUpOpen(true);
    } else {
      setPopUpOpen(false);
    }
  }, [params]);

  React.useEffect(() => {
    if (params.get("view") === "reset-password") {
      setResetPopup(true);
    } else {
      setResetPopup(false);
    }
  }, [params]);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dialogRef.current &&
        !dialogRef.current.contains(event.target as Node)
      ) {
        setPopUpOpen(false);
        router.push("/"); // Clears the search parameters
      }
    };

    if (popUpOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [popUpOpen, router]);

  React.useEffect(() => {
    if (searchPopUp) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
  }, [searchPopUp]);

  React.useEffect(() => {
    const handleClick = (event: any) => {
      // Check if click is outside the content div
      if (contentRef.current && !contentRef.current.contains(event.target)) {
        // Check if the click is not on the trigger button
        const triggerElement = document.querySelector('[data-trigger="true"]');
        if (!triggerElement?.contains(event.target)) {
          setSearchPopUp(false);
        }
      }
    };

    // Only add listener if popover is open
    if (searchPopUp) {
      document.addEventListener("mousedown", handleClick);
    }

    return () => {
      document.removeEventListener("mousedown", handleClick);
    };
  }, [searchPopUp]);

  useEffect(() => {
    const fetchHeader = async () => {
      try {
        const response = await api.get(endpoints.getHeaderMenu);
        setHeaderMenus(response.data.result?.featuredMenu || []);
      } catch (error) {
        console.error("Error fetching header menu:", error);
      }
    };

    const fetchSideMenu = async () => {
      try {
        const response = await api.get(endpoints.getSideMenu);
        setSideMenus(response.data?.result || []);
      } catch (error) {
        console.error("Error fetching header menu:", error);
      }
    };

    fetchSideMenu();
    fetchHeader();
  }, []);

  const getRedirectionPath = (menu: any) => {
    switch (menu.menuType) {
      case "category":
        return `/products/${menu.redirection}`;
      case "product":
        return `/p/${menu.redirection}`;
      case "cmsPages":
        return `/${menu.redirection}`;
      default:
        return `/${menu.redirection}`;
    }
  };

  const disableContainer =
    pathname.includes("/add-address") ||
    pathname.includes("/order-placed") ||
    pathname.includes("/profile") ||
    pathname.includes("/orders") ||
    pathname.includes("/favourites")
      ? "hidden md:block "
      : "";

  return (
    <>
      <header
        ref={headerRef}
        className={`bg-white py-[18px] lg:pt-5 lg:pb-6 ${disableContainer} ${
          pathname === "/" ? "" : "border-b-[1px] border-b-[#E5E7EB]"
        } ${isSticky ? 'fixed top-0 left-0 right-0 z-50 shadow-md transition-transform duration-300 ease-in-out' : ''}`}
        style={{ 
          transform: isSticky ? 'translateY(0)' : '',
          willChange: 'transform',
        }}
      >
        <div className="container max-w-full">
          <div className="flex justify-start items-center gap-1 xl:gap-0">
            <Sheet open={open1} onOpenChange={setOpen1}>
              <SheetTrigger>
                <Button
                  variant="ghost"
                  className="p-0 h-[24px] flex justify-end items-end"
                >
                  <Image src={Hamburger} alt="Hamburger" className="w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent
                showCloseIcon={false}
                side={"left"}
                className="px-[30px] w-[272px] sheet-content-custom-scrollbar"
              >
                <SideBar menuData={sideMenus} setOpen={setOpen1} />
              </SheetContent>
            </Sheet>

            <Link
              href={"/"}
              className="w-[132px] ml-auto xl:ml-[75px] table mr-auto xl:mr-[75px]"
            >
              <Image src={Logo} alt="Logo" />
            </Link>
            <nav className="hidden lg:block lg:mr-auto">
              <ul className="flex justify-start  items-center gap-1">
                {headerMenus?.map((menu: any, index: number) => (
                  <li key={index}  >
                    <Link
                      href={getRedirectionPath(menu)}
                      className="py-2 px-4 text-black hover:text-white sm:text[0.8rem] xl:px-2  xl:text[0.8rem] font-normal z-10 relative
                  before:content-[''] before:absolute before:block before:top-0 before:left-0 before:right-0
                  before:bottom-0 before:m-auto before:w-full before:h-[1px] before:text-transparent
                before:bg-black before:invisible before:opacity-0 before:-z-10
                  hover:before:visible hover:before:opacity-100  hover:before:h-full before:transition-all before:duration-500"
                    >
                      {menu.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            <div className="mr-8 xl:mr-0 xl:ml-auto xl:pr-[26px] xl:border-r xl:border-black-50 2xl:w-[170px]">
              <Popover open={searchPopUp} onOpenChange={setSearchPopUp}>
                <PopoverTrigger asChild>
                  <button 
                    className="relative xl:border-b xl:border-b-black xl:pl-8 xl:pt-0 xl:pb-1 xl:h-7 w-full block focus-visible:outline-none"
                    data-trigger="true"
                  >
                    <Image
                      src={Search}
                      alt="search"
                      className="xl:absolute xl:top-1/2 xl:-translate-y-1/2 xl:left-0"
                    />
                    <span className="text-sm text-[#1E1E1E] font-normal hidden xl:block text-left pt-1">
                      Search
                    </span>
                  </button>
                </PopoverTrigger>
                <PopoverContent
                  className={`w-full ${
                    searchPopUp ? "!mt-[-52px]" : "mt-[20px]"
                  }  md:w-[100vw] md:h-[100vh] p-0 bg-black/50  rounded-none border-0 flex justify-end`}
                >
                  <div
                    ref={contentRef}
                    className="md:w-[1200px] mt-[74px] max-md:h-[90vh] max-md:overflow-y-scroll"
                  >
                    <SearchPopup setSearchPopUp={setSearchPopUp} />
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            <div className="">
              <ul className="flex justify-end items-center w-full">
                <li className="hidden lg:flex justify-center items-center lg:h-6 lg:px-4 xl:px-7 lg:border-r lg:border-black-50 lg:py-[2px]">
                  {loggedIn ? (
                    <Link href="/profile">
                      <Image
                        src={userIcon}
                        alt="user icon"
                        className="size-6"
                      />
                    </Link>
                  ) : (
                    <AuthSidebarProvider open={open} setOpen={setOpen} />
                  )}
                </li>
                <li className="lg:flex justify-center items-center lg:h-6  lg:px-4 xl:px-7 lg:border-r lg:border-black-50  lg:py-[2px]">
                  <Link
                    href={"/favourites"}
                    className="flex items-center relative"
                  >
                    <Image src={heartIcon} alt="user icon" className="size-6" />
                    <div className="absolute -top-2 left-3 size-[19px] bg-white rounded-full p-[2px]">
                      <div className="bg-black rounded-full h-full w-full flex justify-center items-center text-white text-xs">
                        <p className="truncate w-4 text-center">
                          {wishlistDetails?.length || 0}
                        </p>
                      </div>
                    </div>
                  </Link>
                </li>
                <li className="hidden  lg:flex justify-center items-center lg:h-6  lg:px-4 xl:px-7 lg:pr-0 xl:pr-0 lg:border-r-0">
                  <Link href={"/cart"} className="flex items-center relative">
                    <Image src={BagIcon} alt="user icon" className="size-6" />
                    <div className="absolute -top-2 left-3 size-[19px] bg-white rounded-full p-[2px]">
                      <div className="bg-black rounded-full h-full w-full flex justify-center items-center text-white text-xs">
                        <p className="truncate w-4 text-center">
                          {cartDetails?.products?.length || 0}
                        </p>
                      </div>
                    </div>
                    <span className="text-[#1E1E1E] font-normal text-sm ml-[9px]">
                      {cartDetails.summary?.wholeTotal?.text || "AED 0.00"}
                    </span>
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </header>
      {/* Spacer div to prevent content jump when header becomes fixed */}
      {isSticky && (
        <div 
          style={{ 
            height: headerRef.current ? headerRef.current.offsetHeight : 0,
          }}
        />
      )}
      {/* Forgot pass dialog */}

      <ForgotPasswordPopUp popUpOpen={popUpOpen} dialogRef={dialogRef} />
      <ResetPassword resetPopUp={resetPopUp} setResetPopup={setResetPopup} />
    </>
  );
};

export default Header;