"use client";
import { Button } from "@/components/ui/button";
import React, { useContext, useEffect, useState } from "react";
import google from "../../../public/icons/google.svg";
import fb from "../../../public/icons/fb.svg";
import Image from "next/image";
import { endpoints } from "@/app/_constants/endpoints/endpoints";
import api, { setToken } from "@/config/api.interceptor";
import Cookies from "js-cookie";
import { StateContext } from "@/providers/state/StateContext";
import { useRouter, useSearchParams } from "next/navigation";
import {
  FacebookAuthProvider,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { useToast } from "@/hooks/use-toast";
import { Suspense } from "react";
import { auth, firebaseCloudMessaging } from "@/config/firebase.config";


const SocialMediaLogin = (props: any) => {
  const searchParams = useSearchParams();
  const redirection = searchParams.get("redirect");  
  const { getUser, redirect, setRedirect } = useContext(StateContext);
  const router = useRouter();
  const { toast } = useToast();
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

const facebookSignIn = async () => {
  try {
    const provider = new FacebookAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const credential = FacebookAuthProvider.credentialFromResult(result);
    if (credential) {
      const token = credential.accessToken;
      const res = await api.post(endpoints.facebookLogin, {
        referral: "",
        accessToken: token,
      },{
        headers: {
          firebaseToken: firebaseToken, // Pass firebaseToken in the headers
        },
      });
      setToken(res.data?.result?.accessToken);
        Cookies.remove("guest_access_token");
        Cookies.set("access_token", res.data?.result?.accessToken);
        Cookies.set("is_logged_in", "true");
        toast({ title: res.data.message, variant: "success" });
        if (res.data?.result?.accessToken) {
          getUser(true).then((res: any) => {
            if (redirect) {
              router.push(redirect);
              props.setOpen(true);
              setRedirect(null);
            } else {
              router.push("/");
              props.setOpen(true);
            }
          });
        }
      }
  } catch (error:any) {
    console.error("Facebook Sign-In Error: ", error);
    toast({
      title: error?.response?.data?.message || "An error occurred",
      variant: "destructive",
    });
  }
};

  const googleSignIn = async () => {   
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (credential) {
        const token = credential.accessToken;
        const res = await api.post(
          endpoints.googleLogin,
          {
            referral: "",
            accessToken: token,
          },
          {
            headers: {
              firebaseToken: firebaseToken, // Pass firebaseToken in the headers
            },
          }
        );
        setToken(res.data?.result?.accessToken);
        Cookies.remove("guest_access_token");
        Cookies.set("access_token", res.data?.result?.accessToken);
        Cookies.set("is_logged_in", "true");
        toast({ title: res.data.message, variant: "success" });
        if (res.data?.result?.accessToken) {
          getUser(true).then((res: any) => {
            if (redirect) {
              router.push(redirect);
              props.setOpen(true);
              setRedirect(null);
            } else {
              router.push("/");
              props.setOpen(true);
            }
          });
        }
      }
    } catch (error:any) {
      console.error("Google Sign-In Error: ", error);
      toast({
        title: error?.response?.data?.message || "An error occurred",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <ul className="grid grid-cols-2 md:gap-x-1.5 gap-[15px] md:mt-[20px] mt-4">
        <li className="col-span-1">
          <Button
            onClick={googleSignIn}
            variant="outline"
            className="w-full h-[45px] rounded-none gap-3"
            type="button"
          >
            <span className="text-sm font-normal text-black md:order-2">
              Continue With <span className="hidden md:inline">Google</span>{" "}
            </span>
            <Image
              src={google}
              alt="Google Icon"
              width={20}
              height={20}
              className=" md:order-1"
            />
          </Button>
        </li>
        <li className="col-span-1">
          <Button
            onClick={facebookSignIn}
            variant="outline"
            className="w-full h-[45px] rounded-none gap-3"
          >
            <span className="text-sm font-normal text-black  md:order-2">
              Continue With <span className="hidden md:inline">Facebook</span>
            </span>
            <Image
              src={fb}
              alt="Facebook Icon"
              width={20}
              height={20}
              className=" md:order-1"
            />
          </Button>
        </li>
      </ul>
    </>
  );
};

export default SocialMediaLogin;
