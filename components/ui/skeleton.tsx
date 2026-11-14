import { cn } from "@/lib/utils"

/**
 * Skeleton placeholder that mirrors real content shapes while data loads.
 * Uses a soft pulse; respects the global reduced-motion rule in
 * app/globals.css.
 */
function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  )
}

export { Skeleton }
