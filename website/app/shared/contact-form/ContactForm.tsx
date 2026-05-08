"use client";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import React from "react";
import { Input } from "@/components/ui/input";
import api from "@/config/api.interceptor";
import { endpoints } from "@/app/_constants/endpoints/endpoints";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  firstname: z.string().min(1, "First name is required"),
  lastname: z.string().min(1, "Last name is required"),
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  subject: z.string().min(1, "Subject is address"),
  message: z.string().min(1, "Message is required"),
});
// TypeScript type inference based on the schema
type ContactFormData = z.infer<typeof formSchema>;

type Props = {
  formTitle: string;
  formDescription: string;
};

const ContactForm = ({ formTitle, formDescription }: Props) => {
  const { toast } = useToast();
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstname: "",
      lastname: "",
      email: "",
      subject: "",
      message: "",
    },
  });

  const onSubmit = (data: ContactFormData) => {
    api
      .post(endpoints.addEnquiry, data)
      .then((response: any) => {
        if (response.data.errorCode == 0) {
          toast({ title: response.data.message, variant: "success" });
          form.reset();
        } else {
          toast({ title: "Something went wrong", variant: "destructive" });
        }
      })
      .catch((error: any) => {
        toast({ title: "Something went wrong", variant: "destructive" });
      });
  };

  return (
    <div>
      <div>
        <div className="text-lg font-medium lg:font-semibold lg:text-2xl mb-2.5">
          {formTitle}
        </div>
        <div className="md:text-[15px] text-[12px]">{formDescription}</div>
      </div>

      <Form {...form}>
        <form
          className="md:mt-[20px] mt-[15px]"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <div className="grid grid-cols-2 gap-x-8 mb-5">
            <div>
              <FormField
                control={form.control}
                name="firstname"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-normal md:text-[16px] text-[12px]">
                      First Name*
                    </FormLabel>
                    <FormControl>
                      <Input
                        className="bg-[#F9F9F9] rounded-none py-6 px-5 border border-[#E8EAED]"
                        placeholder="First name"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div>
              <FormField
                control={form.control}
                name="lastname"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-normal md:text-[16px] text-[12px]">
                      Last Name*
                    </FormLabel>
                    <FormControl>
                      <Input
                        className="bg-[#F9F9F9] rounded-none py-6 px-5 border border-[#E8EAED]"
                        placeholder="Last name"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
          <div className="mb-5">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-normal md:text-[16px] text-[12px]">
                    Email
                  </FormLabel>
                  <FormControl>
                    <Input
                      className="bg-[#F9F9F9] rounded-none py-6 px-5 border border-[#E8EAED]"
                      placeholder="Email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="mb-5">
            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-normal md:text-[16px] text-[12px]">
                    Subject
                  </FormLabel>
                  <FormControl>
                    <Input
                      className="bg-[#F9F9F9] rounded-none py-6 px-5 border border-[#E8EAED]"
                      placeholder="Subject"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="mb-10 md:mb-[70px]">
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-normal md:text-[16px] text-[12px]">
                    Your Message
                  </FormLabel>
                  <FormControl>
                    <Input
                      className="bg-[#F9F9F9] rounded-none py-6 px-5 border border-[#E8EAED]"
                      placeholder="Message"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <button
            type="submit"
            className="bg-black text-white py-3 px-12 w-full lg:w-max"
          >
            Send Message
          </button>
        </form>
      </Form>
    </div>
  );
};

export default ContactForm;
