"use client";
import { endpoints } from "@/app/_constants/endpoints/endpoints";
import api from "@/config/api.interceptor";
import React, { use, useContext, useEffect, useState } from "react";
import { StateContext } from "./StateContext";
import Cookies from "js-cookie";
import { Addresses, CartDetails, User } from "@/types/providers";
import { ThemeContext } from "../theme/ThemeContext";
import { useToast } from "@/hooks/use-toast";

export const StateProvider = ({ children }: { children: React.ReactNode }) => {
  const { toast } = useToast();
  const guestToken = Cookies.get("guest_access_token");
  const themeData = useContext(ThemeContext);
  const [cartDetails, setCartDetails] = useState<any>({});
  const [wishlistDetails, setWishlistDetails] = useState<any>([]);
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState(null as any);
  const [coverImages, setCoverImages] = useState([]);
  const [redirect, setRedirect] = useState<any>(null);
  const [guestDetails, setGuestDetails] = useState(null as any);
  const [address, setAddress] = useState(null as any);
  const [refetchNotifications, setRefetchNotifications] = useState<any>(
    Date.now()
  );
  const [counts, setCounts] = useState({
    cart: 0,
    wishlist: 0,
    total: "AED 0",
    deliveryFee: 0,
  });

  //Cart Cache
  const getCartDetails = (): Promise<CartDetails> => {
    return new Promise((resolve, reject) => {
      api
        .post(endpoints.cart)
        .then((res) => {
          if (res?.data?.errorCode == 0) {
            setCartDetails(res?.data?.result);
            resolve(res?.data?.result);
          } else {
            reject(res?.data?.message);
          }
        })
        .catch((error) => {});
    });
  };

  useEffect(() => {
    getCartDetails();
  }, []);

  //Wishlist Cache
  const getWishlistDetails = () => {
    api.get(endpoints.wishlist).then((res) => {
      if (res?.data?.errorCode == 0) {
        setWishlistDetails(res?.data?.result);
      }
    }).catch(() => {});
  };

  useEffect(() => {
    getWishlistDetails();
  }, []);

  const updateCounts = (dt?: string) => {
    api
      .get(endpoints.count, {
        headers: {
          DeviceToken: Cookies.get("device_token") || dt,
        },
      })
      .then((res) => {
        if (res?.data?.ErrorCode == 0) setCounts(res?.data?.Data?.counts);
      });
  };

  const getUser = async (login: boolean = false): Promise<User | null> => {
    return new Promise((resolve, reject) => {
      api.get(endpoints.userProfile).then((res) => {
        if (res.data.errorCode == 0) {
          setUser(res.data.result);
          setLoggedIn(true);
          if (login) {
            toast({
              title: `Welcome to the store!`,
              variant: "success",
            });
          }
          resolve(res.data.result as User);
        } else {
          reject(res.data.message as String);
        }
      });
      updateCounts();
    });
  };

  const getGuestUser = async (login: boolean = false): Promise<User | null> => {
    return new Promise((resolve, reject) => {
      api.get(`${endpoints.guestCustomerDetails}/${guestToken}`).then((res) => {
        if (res.data.errorCode == 0) {
          setGuestDetails(res.data.result);
          resolve(res.data.result);
        } else {
          reject(res.data.message);
        }
      });
      updateCounts();
    });
  };

  useEffect(() => {
    // Check if user is logged in and fetch user details if not already fetched from server
    if (Cookies.get("access_token") && user == null) {
      getUser();
    }
  }, []);

  useEffect(() => {
    if (guestToken) {
      getGuestUser();
    }
  }, []);

  // user addresses
  const getAddress = async (): Promise<any> => {
    api.get(endpoints.address).then((res) => {
      if (res?.data?.errorCode == 0) {
        setAddress(res?.data?.result);
      }
    });
  };

  useEffect(() => {
    if (Cookies.get("access_token")) {
      getAddress();
    }
  }, []);

  return (
    <StateContext.Provider
      value={{
        loggedIn,
        setLoggedIn,
        getUser,
        getGuestUser,
        user,
        setUser,
        counts,
        setCounts,
        address,
        getAddress,
        coverImages,
        redirect,
        setRedirect,
        refetchNotifications,
        setRefetchNotifications,
        wishlistDetails,
        getWishlistDetails,
        guestDetails,
        setGuestDetails,
        getCartDetails,
        cartDetails,
        setCartDetails,
        updateCounts,
      }}
    >
      {children}
    </StateContext.Provider>
  );
};
