"use client";
import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

type Props = {
  faqItems: any;
};

interface FaqItem {
  question: string;
  answer: string;
}

const FaqItems = ({ faqItems }: Props) => {
  return (
    <div>
      {faqItems?.result?.map((item: FaqItem, index: number) => {
        return (
          <Accordion type="single" collapsible className="w-full" key={index}>
            <AccordionItem
              value={`item-${index}`}
              className={`${index != 0 ? "md:py-[30px] py-5" : "md:pb-[30px] pb-5"} border-[#D8D8D8] ${index+1 == faqItems?.result?.length ? "border-b-0" : ""}`}
            >
              <AccordionTrigger
                className={`text-[15px] lg:text-xl font-medium text-left py-0 ${
                  index == 0 ? "pt-0" : ""
                }`}
                // buttonType={'plus'}
              >
                {item?.question}
              </AccordionTrigger>
              <AccordionContent className="text-sm p-0 pt-2.5">
                {/* {item.answer} */}
                <div dangerouslySetInnerHTML={{ __html: item?.answer }} />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        );
      })}
    </div>
  );
};

export default FaqItems;
