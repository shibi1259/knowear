"use client";
import React from "react";
import ProductEnquiryForm from "./ProductEnquiryForm";
import { Attribute, Product } from "@/types/productDetails.types";
import Image from "next/image";
import api from "@/config/api.interceptor";
import { endpoints } from "@/app/_constants/endpoints/endpoints";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";

type Props = {
  productDetails: Product;
};

const ProductEnquiry = ({ productDetails }: Props) => {
  const router = useRouter();
  const [isSubmitted, setIsSubmitted] = React.useState(false);

  const onSubmit = (data: any) => {
    api
      .post(endpoints.submitProductEnquiry, {
        ...data,
        product: productDetails.params._id,
      })
      .then((response: any) => {
        if (response.data.errorCode == 0) {
          //   router.push("/");
          toast({
            title: "Product enquiry submitted successfully",
            variant: "success",
          });

          setIsSubmitted(true);
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
    <section className="pt-5 lg:pt-[74px] pb-12 lg:pb-[100px]">
      <div className="container max-w-full">
        <div className="grid grid-cols-5">
          <div className="col-span-5 lg:col-span-3">
            <ProductEnquiryForm isSubmitted={isSubmitted} onSubmit={onSubmit} />
          </div>
          <div className="col-span-5 lg:col-span-2 mt-12 lg:mt-0">
            <div className="lg:pl-14 lg:border-[#D8D8D8] lg:border-l">
              <div className="text-xl md:none font-semibold">
                Product Details
              </div>
              <div>
                <div className="aspect-sqaure w-full my-5">
                  <Image
                    className="w-full h-full"
                    src={productDetails?.thumbnail}
                    alt={productDetails.name.text}
                    height={459}
                    width={459}
                  />
                </div>
                <div>
                  <div className="text-lg mb-2 font-semibold">
                    {productDetails.name.text}
                  </div>
                  <div className="flex my-1 items-center justify-start gap-1">
                    <div>Was :</div>
                    <div className="line-through mx-1 text-lg text-[#9A9AB0]">
                      {productDetails.actualPrice.text}
                    </div>
                  </div>
                  <div className="flex items-center my-2 justify-start gap-1">
                    <div>Now :</div>
                    <div className="mx-4 text-2xl font-medium">
                      {productDetails.price.text}
                    </div>
                    <div className="text-[#808080]">Inclusive of all taxes</div>
                  </div>
                  {productDetails.save.text && (
                    <div className="flex items-center justify-start gap-1">
                      <div>Saving :</div>
                      <div className="mx-4 font-medium">
                        {productDetails.save.text}
                      </div>
                      <div className="bg-[#D4D4D4] text-black p-1 text-xs font-medium">
                        {productDetails.percentageOff.text}
                      </div>
                    </div>
                  )}
                  {productDetails.attributes.map(
                    (attribute: Attribute, index: number) => (
                      <div
                        key={index}
                        className="flex my-2 last:mt-0 last:mb-0 items-center justify-start gap-1"
                      >
                        <div>{attribute.title} :</div>
                        <div className="mx-4 font-medium">
                          {attribute.value}
                        </div>
                      </div>
                    )
                  )}
                  <hr className="mb-5 mt-7" />
                  <div className="flex items-center justify-between">
                    <div className="text-lg font-medium">Total</div>
                    <div className="text-lg font-bold">
                      {productDetails.price.text}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductEnquiry;
