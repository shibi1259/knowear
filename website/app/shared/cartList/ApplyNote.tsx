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
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { SubmitHandler, useForm } from "react-hook-form";
import api from "@/config/api.interceptor";
import { endpoints } from "@/app/_constants/endpoints/endpoints";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import Note from "@/public/svgs/Note";

type Inputs = {
  note: string;
};

export default function ApplyNote(props: any) {
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
    // api
    //   .post(endpoints.forgotPassword, { ...formData })
    //   .then((res) => {
    //     if (res.data.errorCode == 0) {
    //       toast({ description: res.data.message, variant: "success" });
    //       reset();
    //     }
    //   })
    //   .catch((error) => {
    //     setError(true);
    //     toast({
    //       description: error.response.data.message || "something went wrong",
    //       variant: "destructive",
    //     });
    //   });
  };
  return (
    <>
      <Dialog open={popUpOpen}>
        <DialogTrigger className="pb-2.5">
          <div className="flex gap-x-[9px] items-center">
            <Note />
            <p className="text-xs md:text-sm font-normal">Add Note</p>
          </div>
        </DialogTrigger>
        <DialogContent className="px-[100px] max-w-[625px]" ref={dialogRef}>
          <DialogHeader>
            <DialogTitle className="font-medium md:font-bold text-xl md:text-[25px]">
              Special Instructions
            </DialogTitle>
            <p className="text-xs md:text-sm font-normal pt-2 md:pt-[5px]">
              Shop sustainably, make an impact!
            </p>
          </DialogHeader>

          {/* Form for Forgot Password */}
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col pb-5">
              <Textarea
                id="note"
                placeholder="Enter the text here..."
                className="rounded-none bg-[#F9F9F9]"
                {...register("note", {
                  required: "Special instructions is required",
                })}
              />
              {/* Show validation errors */}
              {errors.note && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.note.message}
                </p>
              )}
            </div>

            <DialogFooter>
              <div className="flex flex-col w-full font-medium">
                <Button
                  className="w-full rounded-none bg-black tex-white hover:bg-black h-[45px] md:h-[50px]"
                  type="submit"
                >
                  Send
                </Button>
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <div className="bg-[#F9F9F9] pt-[15px] pl-5 pr-3.5 pb-[11px] mb-2.5">
        Lorem Ipsum is simply dummy text of the printing and typesetting
        industry. Lorem Ipsum has been the industry standard dummy text .
      </div>
    </>
  );
}
