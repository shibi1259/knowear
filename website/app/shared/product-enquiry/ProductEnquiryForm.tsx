import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { formatPhoneNumber } from '@/lib/utils';

const formSchema = z.object({
  firstname: z.string().min(1, "First name is required"),
  lastname: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  mobile: z.string().min(9, "Phone is required and must be 9 digits"),
  countryCode: z.string().min(1, "Country code is required"),
  country: z.string().min(1, "Country is required"),
  street: z.string().min(1, "Street address is required"),
  apartment: z.string().min(1, "Apartment details is required"),
  city: z.string().min(1, "City is required"),
  emirate: z.string().min(1, "Emirate is required"),
});

const emirates = [
    'Abu Dhabi',
    'Dubai',
    'Sharjah',
    'Ajman',
    'Umm Al Quwain',
    'Ras Al Khaimah',
    'Fujairah',
];

type Props = {
    onSubmit: (data: any) => void;
    isSubmitted: boolean;
}

export default function ProductEnquiryForm({ onSubmit, isSubmitted }: Props) {
    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            firstname: '',
            lastname: '',
            email: '',
            countryCode: '+971',
            mobile: '',
            country: '',
            street: '',
            apartment: '',
            city: '',
            emirate: '',
        },
    });

    const handleSubmit = (data: z.infer<typeof formSchema>) => {
        onSubmit(data);
    }

    useEffect(() => {
        if (isSubmitted == true) {
            form.reset();
        }
    }, [isSubmitted])

    return (
      <div className="lg:pr-14">
        <div className="text-xl font-medium lg:text-2xl lg:font-semibold">
          Product Enquiry Form
        </div>
        <p className="mt-2 mb-7">Leave us a message for further information.</p>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-8"
          >
            <div className="grid grid-cols-2 gap-x-8 gap-y-6">
              <div className="col-span-2 lg:col-span-1">
                <FormField
                  control={form.control}
                  name="firstname"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-normal">
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
              <div className="col-span-2 lg:col-span-1">
                <FormField
                  control={form.control}
                  name="lastname"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-normal">
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
              <div className="col-span-2">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-normal">
                        Email*
                      </FormLabel>
                      <FormControl>
                        <Input
                          className="bg-[#F9F9F9] rounded-none py-6 px-5 border border-[#E8EAED]"
                          type="email"
                          placeholder="Email"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="col-span-2">
                <FormField
                  control={form.control}
                  name="mobile"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-normal">
                        Phone Number*
                      </FormLabel>
                      {/* <FormControl>
                        <Input
                          maxLength={9}
                          className="bg-[#F9F9F9] rounded-none py-6 px-5 border border-[#E8EAED]"
                          placeholder="Phone number"
                          {...field}
                          onChange={(e) => {
                            const numericValue = e.target.value.replace(
                              /[^0-9]/g,
                              ""
                            );
                            form.setValue("mobile", numericValue);
                            form.trigger("mobile");
                          }}
                        />
                      </FormControl> */}
                      <div className="flex relative !mt-1.5">
                        <FormField
                          control={form.control}
                          name="countryCode"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl className="relative">
                                <Select
                                  onValueChange={field.onChange}
                                  value={field.value}
                                >
                                  <SelectTrigger className="w-[75px] ltr:border-r-0 rtl:border-r-[1px] ltr:rounded-tr-none ltr:rounded-br-none  rtl:border-l-0 ltr:border-l-[1px] rtl:rounded-tl-none rtl:rounded-bl-none bg-[#F9F9F9] text-black text-[13px] md:text-sm font-normal placeholder:text-black/50 h-[45px] md:h-[50px] rounded-none border-[#E8EAED]">
                                    <SelectValue
                                      placeholder="+971"
                                      defaultValue="+971"
                                    />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectGroup>
                                      <SelectItem value="+971">+971</SelectItem>
                                    </SelectGroup>
                                  </SelectContent>
                                </Select>
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormControl>
                          <Input
                            {...field}
                            type="text"
                            id="mobile"
                            placeholder="000-0000"
                            className="w-full ltr:border-l-0 ltr:rounded-tl-none ltr:rounded-bl-none ltr:pl-0  rtl:border-r-0 rtl:rounded-tr-none rtl:rounded-br-none rtl:pr-0 bg-[#F9F9F9] text-black text-[13px] md:text-sm font-normal placeholder:text-black/50 h-[45px] md:h-[50px] rounded-none border-[#E8EAED]"
                            onChange={(e) => {
                              const value = e.target.value.replace(/\D/g, "");
                              const formattedValue = formatPhoneNumber(value);
                              e.target.value = formattedValue;
                              field.onChange(value);
                              form.trigger("mobile");
                            }}
                          />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="col-span-2">
                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-normal">
                        Country / Region*
                      </FormLabel>
                      <FormControl>
                        <Input
                          className="bg-[#F9F9F9] rounded-none py-6 px-5 border border-[#E8EAED]"
                          placeholder="Country / Region"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="col-span-2 lg:col-span-1">
                <FormField
                  control={form.control}
                  name="street"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-normal">
                        Street Address*
                      </FormLabel>
                      <FormControl>
                        <Input
                          className="bg-[#F9F9F9] rounded-none py-6 px-5 border border-[#E8EAED]"
                          placeholder="House number and street name"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="col-span-2 lg:col-span-1">
                <FormField
                  control={form.control}
                  name="apartment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-normal">
                        Apt, suite, unit *
                      </FormLabel>
                      <FormControl>
                        <Input
                          className="bg-[#F9F9F9] rounded-none py-6 px-5 border border-[#E8EAED]"
                          placeholder="Apartment, suite, unit, etc. (optional)"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-normal">
                      City*
                    </FormLabel>
                    <FormControl>
                      <Input
                        className="bg-[#F9F9F9] rounded-none py-6 px-5 border border-[#E8EAED]"
                        placeholder="Town / City"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="emirate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-normal">
                      Emirate*
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-[#F9F9F9] rounded-none py-6 px-5 border border-[#E8EAED]">
                          <SelectValue placeholder="Select an emirate" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {emirates.map((emirate) => (
                          <SelectItem key={emirate} value={emirate}>
                            {emirate}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <button
              className="h-[50px] w-[200px] rounded-none text-lg font-normal px-5 bg-black text-white"
              type="submit"
            >
              Submit
            </button>
          </form>
        </Form>
      </div>
    );
}