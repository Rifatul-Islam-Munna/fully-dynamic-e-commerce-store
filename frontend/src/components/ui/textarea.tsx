import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-16 w-full rounded-[22px] border border-input/80 bg-white/78 px-4 py-3 text-base shadow-[0_12px_30px_-24px_rgba(15,23,42,0.28)] transition-[color,box-shadow,border-color,background-color] outline-none placeholder:text-muted-foreground/85 focus-visible:border-ring focus-visible:bg-white focus-visible:ring-[4px] focus-visible:ring-ring/12 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:aria-invalid:ring-destructive/40",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
