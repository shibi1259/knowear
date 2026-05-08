import React from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { SubmitHandler, useForm } from "react-hook-form";
import api from "@/config/api.interceptor";
import { endpoints } from "@/app/_constants/endpoints/endpoints";
import { useToast } from "@/hooks/use-toast";

type Inputs = {
  email: string;
};

export default function ForgotPasswordPopUp(props: any) {
  const { popUpOpen, dialogRef } = props;
  const { toast } = useToast();
  const [error, setError] = React.useState(false);
  const {
    register,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>();

  const onSubmit: SubmitHandler<Inputs> = (formData: any) => {
    api
      .post(endpoints.forgotPassword, { ...formData })
      .then((res) => {
        if (res.data.errorCode == 0) {
          toast({ description: res.data.message, variant: "success" });
          reset();
          
        }
      })
      .catch((error) => {
        setError(true);
        toast({
          description: error.response.data.message || "something went wrong",
          variant: "destructive",
        });
      });
  };
  return (
    <Dialog open={popUpOpen}>
      <DialogContent className="sm:max-w-[425px]" ref={dialogRef}>
        <DialogHeader>
          <DialogTitle>Forgot Password</DialogTitle>
        </DialogHeader>

        {/* Form for Forgot Password */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col pb-5">
            <Label htmlFor="email" className="pb-1">
              Email
            </Label>
            <Input
              id="email"
              placeholder="Email"
              className="col-span-3"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/,
                  message: "Invalid email address",
                },
              })}
            />
            {/* Show validation errors */}
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          <DialogFooter>
            <div className="flex flex-col w-full font-medium">
              <Button className="w-full rounded-none text-white bg-black hover:bg-black" type="submit">
                Send
              </Button>
              <p className="text-center text-xs text-[#808080] pt-2">
                Back to{" "}
                <Link className="text-black" href="/?view=signin">
                  Sign In
                </Link>
              </p>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
