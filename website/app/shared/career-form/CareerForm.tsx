"use client";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import api from "@/config/api.interceptor";
import { toast } from "@/hooks/use-toast";

type Props = {};

type FormValues = {
  firstname: string;
  lastname: string;
  resume: File | null;
  email: string;
  countryCode: string;
  phone: string;
  coverLetter: string;
  designation: string;
};

const CareerForm = (props: Props) => {
  const [file, setFile] = useState<File | null>(null);
  const form = useForm<FormValues>({
    defaultValues: {
      firstname: "",
      lastname: "",
      resume: null,
      email: "",
      countryCode: "+971",
      phone: "",
      coverLetter: "",
      designation: "",
    },
  });

  const onSubmit = async (data: any) => {
    const formData = new FormData();

    // Append form fields
    Object.keys(data).forEach((key) => {
      formData.append(key, data[key as keyof FormValues]);
    });

    await api
      .post("/submit-careerapplication", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((response: any) => {
        if (response.data.errorCode === 0) {
          form.reset();
          toast({ description: response.data.message, variant: "success" });
        } else {
          toast({ description: response.data.message, variant: "destructive" });
        }
      })
      .catch((error: any) => {
        toast({ description: error.message, variant: "destructive" });
      });
  };

  return (
    <div className="mt-10 md:mt-[60px] lg:px-[126px] ">
      <div className="text-xl font-medium uppercase mb-5 md:mb-[40px]">
        Join the team
      </div>
      <div>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="grid grid-cols-1 lg:grid-cols-2 gap-x-[32px] gap-y-[15px] md:gap-y-5"
          >
            <div className="col-span-2 lg:col-span-1">
              <FormField
                control={form.control}
                name="firstname"
                rules={{ required: "First name is required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-normal">
                      First Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        className="bg-[#F9F9F9] rounded-none py-6 px-5 border border-[#E8EAED]"
                        placeholder="First Name"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-base font-normal" />
                  </FormItem>
                )}
              />
            </div>

            <div className="col-span-2 lg:col-span-1">
              <FormField
                control={form.control}
                name="lastname"
                rules={{ required: "Last name is required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-normal">
                      Last Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        className="bg-[#F9F9F9] rounded-none py-6 px-5 border border-[#E8EAED]"
                        placeholder="Last Name"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-base font-normal" />
                  </FormItem>
                )}
              />
            </div>

            <div className="col-span-2 lg:col-span-1">
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
                  <FormItem>
                    <FormLabel className="text-base font-normal">
                      Email
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        className="bg-[#F9F9F9] rounded-none py-6 px-5 border border-[#E8EAED]"
                        placeholder="Email"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-base font-normal" />
                  </FormItem>
                )}
              />
            </div>

            <div className="col-span-2 lg:col-span-1">
              <FormField
                control={form.control}
                name="phone"
                rules={{
                  required: "Phone number is required",
                  pattern: {
                    value: /^[0-9]{10}$/,
                    message: "Invalid phone number",
                  },
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-normal">
                      Phone
                    </FormLabel>
                    <FormControl>
                      <Input
                        className="bg-[#F9F9F9] rounded-none py-6 px-5 border border-[#E8EAED]"
                        type="tel"
                        placeholder="Phone"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-base font-normal" />
                  </FormItem>
                )}
              />
            </div>

            <div className="col-span-2 lg:col-span-1">
              <FormField
                control={form.control}
                name="designation"
                rules={{ required: "Designation is required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-normal">
                      Designation
                    </FormLabel>
                    <FormControl>
                      <Input
                        className="bg-[#F9F9F9] rounded-none py-6 px-5 border border-[#E8EAED]"
                        placeholder="Designation"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-base font-normal" />
                  </FormItem>
                )}
              />
            </div>

            <div className="col-span-2 lg:col-span-1">
              <FormField
                control={form.control}
                name="resume"
                rules={{ required: "Resume is required" }}
                render={({ field: { value, onChange, ...field } }) => (
                  <FormItem>
                    <FormLabel className="text-base font-normal">
                      Resume
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <label
                          className={`bg-[#F9F9F9] rounded-none border text-sm py-3 px-5 border-[#E8EAED] flex items-center justify-between cursor-pointer ${
                            value ? "text-black" : "text-[#000000]/50"
                          }`}
                        >
                          <span>{value?.name || "Attach"}</span>
                          <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            className="ml-2"
                          >
                            <path
                              d="M12.3297 12.15L9.85969 14.62C8.48969 15.99 8.48969 18.2 9.85969 19.57C11.2297 20.94 13.4397 20.94 14.8097 19.57L18.6997 15.68C21.4297 12.95 21.4297 8.51004 18.6997 5.78004C15.9697 3.05004 11.5297 3.05004 8.79969 5.78004L4.55969 10.02C2.21969 12.36 2.21969 16.16 4.55969 18.51"
                              stroke="#292D32"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          <input
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            type="file"
                            accept=".pdf,.doc,.docx"
                            onChange={(e: any) => {
                              onChange(e.target.files[0]);
                            }}
                            {...field}
                          />
                        </label>
                      </div>
                    </FormControl>
                    <FormMessage className="text-base font-normal" />
                  </FormItem>
                )}
              />
            </div>

            <div className="col-span-2">
              <FormField
                control={form.control}
                name="coverLetter"
                rules={{ required: "Cover letter is required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-normal">
                      Cover Letter
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        className="bg-[#F9F9F9] rounded-none py-6 px-5 border border-[#E8EAED]"
                        placeholder="Cover Letter"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-base font-normal" />
                  </FormItem>
                )}
              />
            </div>

            <button
              className="col-span-2 lg:col-span-1 h-[50px] w-full  md:w-[200px] rounded-none text-[15px] font-medium max-md:uppercase md:text-lg md:font-normal px-5 bg-black text-white max-md:mt-[15px]"
              type="submit"
            >
              Submit...
            </button>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default CareerForm;
