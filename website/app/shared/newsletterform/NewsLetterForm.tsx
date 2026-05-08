'use client';
import { endpoints } from "@/app/_constants/endpoints/endpoints";
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
import api from "@/config/api.interceptor";
import { toast } from "@/hooks/use-toast";
import React from "react";
import { useForm } from "react-hook-form";

type NewsLetterFormInputs = {
  email: string;
};

const NewsLetterForm = (props: any) => {
  const form = useForm<NewsLetterFormInputs>({
    defaultValues: {
      email: "",
    },
  });
  const onSubmit = (data: NewsLetterFormInputs) => {
    api
      .post(endpoints.subscribe, data)
      .then((res) => {
        if (res.data.errorCode == 0) {
          toast({ description: "Subscribed successfully", variant: "success" });
          form.reset();
        } else {
          toast({ description: res.data.message, variant: "success" });
        }
      })
      .catch((err) => {
        toast({
          description: err.response.data.message,
          variant: "destructive",
        });
      });
  };
  return (
    <>
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex justify-start items-center"
      >
        <div className="w-[calc(100%_-_124px)]">
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
              <FormItem>
                <FormControl>
                  <Input
                    placeholder="Enter email address"
                    {...field}
                    className="bg-[#ffffff] text-black text-[13px] md:text-sm font-normal placeholder:text-black/50 h-[45px] md:h-[55px] rounded-none border-[#E8EAED]"
                  />
                </FormControl>
                <FormMessage className="absolute"/>
              </FormItem>
            )}
          />
        </div>
        <Button
          type="submit"
          className="bg-black hover:bg-black font-medium text-[15px] text-white rounded-none w-[124px] h-[45px] md:h-[55px] uppercase md:capitalize"
        >
          Join
        </Button>
      </form>
    </Form>
  </> 
  );
};

export default NewsLetterForm;
