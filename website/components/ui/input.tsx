import * as React from "react";

import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
    left?: React.ReactNode;
    checkout?:boolean;
  }

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className,left,checkout, type, ...props }, ref) => {
    return (
      <div className="relative">
        {left && <div className={`absolute ${checkout?'top-[29%]':'top-[29%]'} left-2 text-sm text-gray-400`}>{left}</div>}

        <input
          type={type}
          className={cn(
            "flex h-10 w-full placeholder:text-[13px] md:placeholder:text-[14px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
          ref={ref}
          {...props}
        />
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
