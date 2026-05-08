"use client";
import React, { useContext, useState } from "react";
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
import { StateContext } from "@/providers/state/StateContext";
import api from "@/config/api.interceptor";
import { endpoints } from "@/app/_constants/endpoints/endpoints";
import { useToast } from "@/hooks/use-toast";

const PersonalInfoForm = () => {
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();
  const { user, getUser } = useContext(StateContext)

  const form = useForm({
    values: {
      name: user?.name,
      email: user?.email,
      mobile: user?.mobile,
      password: ""
    },
    mode: "onBlur",
  });

  const onSubmit = (data: any) => {
    setIsEditing(false);
    let payload:any={
      name:data?.name,
      mobile:data?.mobile,
      email:data?.email,
    }
    if(data.password){
     payload.password= data.password
    }
    api.post(endpoints.updateProfile, { ...payload, type: "1" }).then((res) => {
      if (res?.data?.errorCode == 0) {
        getUser();
        toast({ title: "Profile updated successfully", variant: "success" });
        form.reset()
      } else {
        toast({ title: "Profile update failed", variant: "destructive" });
      }
    }).catch((err: any) => {
      toast({ title: "Profile update failed", variant: "destructive" });
    })
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
              <FormLabel className="text-xs lg:text-lg  text-[#808080] font-normal !mb-[6px] lg:mb-1 leading-[26px]">
                Your Name
              </FormLabel>
              <FormControl className="!mt-0">
                <div className="relative">
                  <Input
                    {...field}
                    className="border-x-0 border-t-0 border-b-[1px] pt-0 border-b-[#D8D8D8] rounded-none pb-[13px] md:pb-5 pl-0 text-black text-sm lg:text-lg font-medium bg-white"
                  />
                  <Button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    variant="ghost"
                    className="absolute top-[34%] right-2 -translate-y-1/2 p-0 h-[unset] bg-white max-md:text-xs max-md:font-normal md:-mt-1 "
                  >
                    Change
                  </Button>
                </div>
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
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: "Invalid email address",
            },
          }}
          render={({ field }) => (
            <FormItem className="!mt-[25px] md:!mt-10">
              <FormLabel className="leading-[26px] text-xs lg:text-lg  text-[#808080] font-normal mb-[6px] lg:mb-1">
                Email Address
              </FormLabel>
              <FormControl className="!mt-0">
                <div className="relative">
                  <Input
                    {...field}
                    type="email"
                    className="border-x-0 pt-0 border-t-0 border-b-[1px] border-b-[#D8D8D8] rounded-none pb-[13px] lg:pb-[18px] pl-0 text-black text-sm lg:text-lg font-medium bg-white"
                  />
                  <Button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    variant="ghost"
                    className="absolute top-[34%] right-2 -translate-y-1/2 p-0 h-[unset] bg-white max-md:text-xs max-md:font-normal md:-mt-1 "
                  >
                    Change
                  </Button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="mobile"
          rules={{
            required: "Phone number is required",
            pattern: {
              value: /^\+?[1-9]\d{1,14}$/,
              message: "Invalid phone number",
            }, 
            validate: (value) =>
              value?.length === 9 || "Phone number must be exactly 9 digits",
          }}
          render={({ field }) => (
            <FormItem className="!mt-[25px] md:!mt-10">
              <FormLabel className="leading-[26px] text-xs lg:text-lg  text-[#808080] font-normal mb-[6px] lg:mb-1">
                Phone Number
              </FormLabel>
              <FormControl className="!mt-0">
                <div className="relative">
                  <Input
                    {...field}
                    maxLength={9}
                    type="tel"
                    className="border-x-0 pt-0 border-t-0 border-b-[1px] border-b-[#D8D8D8] rounded-none pb-[13px] lg:pb-[18px] pl-0 text-black text-sm lg:text-lg font-medium bg-white"
                  />
                  <Button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    variant="ghost"
                    className="absolute top-[34%] right-2 -translate-y-1/2 p-0 h-[unset] bg-white max-md:text-xs max-md:font-normal md:-mt-1 "
                  >
                    Change
                  </Button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          rules={{
            validate: (value) => {
              if (value && value.length < 8) {
                return "Password must be at least 8 characters";
              }
              return true ;
            },
          }}
          render={({ field }) => (
            <FormItem className="!mt-[25px] md:!mt-10">
              <FormLabel className="leading-[26px] text-xs lg:text-lg  text-[#808080] font-normal mb-[6px] lg:mb-1">
                Password
              </FormLabel>
              <FormControl className="!mt-0">
                <div className="relative">
                  <Input
                    {...field}
                    className="border-x-0 pt-0 border-t-0 border-b-[1px] border-b-[#D8D8D8] rounded-none pb-[13px] lg:pb-[18px] pl-0 text-black text-sm lg:text-lg font-medium bg-white placeholder:text-black"
                    placeholder={isEditing?"":"****************"}
                  />
                  <Button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    variant="ghost"
                    className="absolute top-[34%] right-2 -translate-y-1/2 p-0 h-[unset] bg-white max-md:text-xs max-md:font-normal md:-mt-1 "
                  >
                    Change
                  </Button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {
          isEditing && (
            <Button type="submit" className="mt-4 bg-black hover:bg-black rounded-none">
              Save Changes
            </Button>
          )
        }
      </form>
    </Form>
  );
};

export default PersonalInfoForm;
