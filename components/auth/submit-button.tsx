"use client"

import type * as React from "react"
import { useFormStatus } from "react-dom"
import { Button, buttonVariants } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import type { VariantProps } from "class-variance-authority"

interface SubmitButtonProps
  extends React.ComponentProps<"button">,
    VariantProps<typeof buttonVariants> {
  pendingText?: string
}

export function SubmitButton({ children, pendingText, disabled, ...props }: SubmitButtonProps) {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" disabled={pending || disabled} {...props}>
      {pending && <Spinner className="mr-2" />}
      {pending ? pendingText ?? children : children}
    </Button>
  )
}
