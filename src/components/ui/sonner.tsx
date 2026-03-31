"use client"

import { Toaster as Sonner } from "sonner"

export function Toaster() {
  return (
    <Sonner
      position="top-right"
      closeButton
      toastOptions={{
        classNames: {
          toast:
            "group toast bg-white text-foreground border border-border/50 shadow-lg rounded-xl",
          title: "text-foreground font-medium",
          description: "text-muted-foreground",
          closeButton:
            "absolute right-2 top-2 border-0 bg-transparent text-muted-foreground hover:text-foreground",
        },
      }}
    />
  )
}
