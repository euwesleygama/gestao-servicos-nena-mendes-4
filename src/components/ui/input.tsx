import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const inputVariants = cva(
  "flex h-10 w-full rounded-md px-3 py-2 text-base file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-beauty-primary/60 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 transition-colors duration-150 [font-size:16px]",
  {
    variants: {
      variant: {
        default: "border border-neutral-300 bg-beauty-secondary text-beauty-primary focus-visible:ring-2 focus-visible:ring-beauty-primary/20",
        elegant: "border-2 border-neutral-300 bg-beauty-neutral text-beauty-primary focus-visible:ring-2 focus-visible:ring-beauty-primary/20 hover:border-beauty-primary/50",
        minimal: "border-0 border-b-2 border-neutral-300 bg-transparent text-beauty-primary focus-visible:ring-0 rounded-none px-0",
        filled: "border-0 bg-beauty-secondary text-beauty-primary focus-visible:ring-2 focus-visible:ring-beauty-primary/20",
        noFocus: "border border-neutral-300 bg-beauty-secondary text-beauty-primary outline-none ring-0 ring-offset-0 focus:outline-none focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:outline-none focus-visible:ring-offset-0"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
)

export interface InputProps
  extends React.ComponentProps<"input">,
    VariantProps<typeof inputVariants> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(inputVariants({ variant }), className)}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input, inputVariants }
