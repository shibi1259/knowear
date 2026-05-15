"use client";

import { ArrowRight } from "lucide-react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { endpoints } from "@/app/_constants/endpoints/endpoints";
import api from "@/config/api.interceptor";
import { toast } from "@/hooks/use-toast";

type NewsLetterFormInputs = {
  email: string;
};

const FooterNewsletterForm = () => {
  const form = useForm<NewsLetterFormInputs>({
    defaultValues: { email: "" },
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
          description: err?.response?.data?.message || "Something went wrong",
          variant: "destructive",
        });
      });
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="flex">
      <div className="bg-black flex items-center rounded-sm w-full">
        <Input
          placeholder="Email address"
          type="email"
          {...form.register("email", {
            required: "Email is required",
            pattern: {
              value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
              message: "Please enter a valid email address",
            },
          })}
          className="flex-1 min-w-0 rounded-sm border-gray-300 text-sm h-[50px]"
        />
        <Button
          type="submit"
          aria-label="Subscribe"
          className="hover:bg-gray-800 text-white rounded-sm px-4 h-[50px] shrink-0"
        >
          <ArrowRight size={16} />
        </Button>
      </div>
    </form>
  );
};

export default FooterNewsletterForm;
