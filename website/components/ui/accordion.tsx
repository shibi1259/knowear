"use client";

import * as React from "react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";
import PLus from "@/public/svgs/PLus";
import Minus from "@/public/svgs/Minus";

const Accordion = AccordionPrimitive.Root;

const AccordionItem = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(({ className, ...props }, ref) => (
  <AccordionPrimitive.Item
    ref={ref}
    className={cn("border-b", className)}
    {...props}
  />
));
AccordionItem.displayName = "AccordionItem";

const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger> & {
    buttonType?: string;
  }
>(({ className, children, buttonType, ...props }, ref) => (
  <AccordionPrimitive.Header className="flex">
    <AccordionPrimitive.Trigger
      ref={ref}
      className={cn(
        "flex flex-1 items-center justify-between py-4 font-medium transition-all  [&[data-state=open]>svg]:rotate-180",
        className
      )}
      {...props}
    >
      {children}
      {buttonType === "plus" ? (
        <>
          <PLus className="shrink-0 transition-transform duration-200 group-data-[data-state=open]:hidden" />
          <Minus className="shrink-0 transition-transform duration-200 group-data-[data-state=open]:hidden" />
        </>
      ) : (
        // <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
        <svg
          width="13"
          height="7"
          viewBox="0 0 13 7"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M5.91548 0.285265L0.733665 5.37618C0.370028 5.73981 0.370028 6.28527 0.733665 6.6489C1.0973 7.01254 1.64276 7.01254 2.00639 6.6489L6.46094 2.19436L10.9155 6.6489C11.0973 6.83072 11.2791 6.92163 11.5518 6.92163C12.0973 6.92163 12.4609 6.55799 12.4609 6.01254C12.4609 5.73981 12.37 5.55799 12.1882 5.37618L7.00639 0.194355C6.82457 -0.0783718 6.27912 -0.0783718 5.91548 0.285265Z"
            fill="black"
          />
        </svg>
      )}
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
));
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName;

const AccordionContent = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Content
    ref={ref}
    className="overflow-hidden text-sm transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
    {...props}
  >
    <div className={cn("pb-4 pt-0", className)}>{children}</div>
  </AccordionPrimitive.Content>
));

AccordionContent.displayName = AccordionPrimitive.Content.displayName;

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
