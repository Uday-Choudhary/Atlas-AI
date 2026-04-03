import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-body text-[15px] font-semibold transition-all active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--color-ocean-600)] text-white shadow-blue hover:bg-[var(--color-ocean-700)] hover:-translate-y-0.5",
        ai:
          "bg-[var(--color-lime-400)] text-[var(--color-gray-900)] shadow-ai hover:bg-[var(--color-lime-300)] hover:-translate-y-0.5 font-bold",
        destructive:
          "bg-[var(--color-danger)] text-white hover:bg-[var(--color-danger)]/90",
        outline:
          "border-[1.5px] border-[var(--color-ocean-600)] bg-transparent text-[var(--color-ocean-600)] hover:bg-[var(--color-ocean-50)]",
        secondary:
          "bg-[var(--color-ocean-50)] text-[var(--color-ocean-600)] shadow-xs hover:bg-[var(--color-ocean-100)]",
        ghost:
          "bg-[var(--color-gray-100)] text-[var(--color-gray-700)] font-medium hover:bg-[var(--color-gray-200)]",
        link: "text-[var(--color-ocean-600)] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-[50px] px-[28px] py-[14px]",
        sm: "h-[40px] px-4",
        lg: "h-[56px] px-8 text-lg",
        icon: "size-10 shadow-sm hover:shadow-md",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
