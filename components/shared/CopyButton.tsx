"use client"

import * as React from "react"
import { Check, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface CopyButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string
  label?: string
}

export function CopyButton({ value, label, className, ...props }: CopyButtonProps) {
  const [hasCopied, setHasCopied] = React.useState(false)

  React.useEffect(() => {
    if (hasCopied) {
      const timeout = setTimeout(() => setHasCopied(false), 1500)
      return () => clearTimeout(timeout)
    }
  }, [hasCopied])

  return (
    <Button
      size="icon"
      variant="ghost"
      className={cn("h-6 w-6 text-muted-foreground hover:bg-transparent hover:text-foreground", className)}
      onClick={() => {
        navigator.clipboard.writeText(value)
        setHasCopied(true)
      }}
      {...props}
      title={label ?? "Copy to clipboard"}
    >
      {hasCopied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
      <span className="sr-only">Copy</span>
    </Button>
  )
}
