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
import { useRouter, useSearchParams } from "next/navigation";

type Inputs = {
  password: string;
  confirmPassword: string;
};

export default function ResetPassword(props: any) {
  const { resetPopUp, setResetPopup } = props;
  const router = useRouter()
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [error, setError] = React.useState(false);
  const {
    register,
    reset,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<Inputs>();

  const onSubmit: SubmitHandler<Inputs> = (formData: any) => {
    api
      .post(endpoints.resetPassword, { ...formData, token: searchParams.get("token") })
      .then((res) => {
        if (res.data.errorCode == 0) {
          toast({ description: res.data.message, variant: "success" });
          reset();
          router.push(`/?view=signin`)
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
    <Dialog open={resetPopUp} onOpenChange={()=>{
      // setResetPopup(false)
      router.push("/?view=signin")
    }}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Reset Password</DialogTitle>
        </DialogHeader>

        {/* Form for Forgot Password */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col pb-5">
            <Label htmlFor="password" className="pb-1">
              Password
            </Label>
            <Input
              id="password"
              placeholder="Password"
              className="col-span-3"
              {...register("password", {
                required: "Password is required",
              })}
            />
            {/* Show validation errors */}
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          <div className="flex flex-col pb-5">
            <Label htmlFor="password" className="pb-1">
              Confirm Password
            </Label>
            <Input
              id="confirmPassword"
              placeholder="Confirm password"
              className="col-span-3"
              {...register("confirmPassword", {
                required: "Confirm password is required",
                validate: (value) =>
                  value === watch("password") || "Passwords do not match",
              })}
            />
            {errors.confirmPassword && (
              <p className="text-red-500 text-xs mt-1">
                {errors.confirmPassword.message}
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
