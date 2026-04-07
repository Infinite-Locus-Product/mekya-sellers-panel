"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import { cn } from "@/lib/utils"
import { DialogCloseIcon } from "@/assets/icons"

interface DialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
}

interface DialogContextValue {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const DialogContext = React.createContext<DialogContextValue | undefined>(undefined)

const DialogPortal = ({ children }: { children: React.ReactNode }) => {
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return createPortal(children, document.body)
}

function useDialogContext() {
  const context = React.useContext(DialogContext)
  if (!context) {
    throw new Error("Dialog components must be used within Dialog")
  }
  return context
}

const Dialog = ({ open = false, onOpenChange, children }: DialogProps) => {
  const [internalOpen, setInternalOpen] = React.useState(open)

  const isControlled = onOpenChange !== undefined
  const isOpen = isControlled ? open : internalOpen
  const setIsOpen = isControlled ? onOpenChange : setInternalOpen

  // Only sync internal state when uncontrolled and `open` prop changes
  React.useEffect(() => {
    if (!isControlled) {
      setInternalOpen(open)
    }
  }, [isControlled, open])

  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [isOpen])

  return (
    <DialogContext.Provider value={{ open: isOpen, onOpenChange: setIsOpen }}>
      {children}
    </DialogContext.Provider>
  )
}

const DialogTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean }
>(({ children, onClick, asChild, ...props }, ref) => {
  const { onOpenChange } = useDialogContext()
  return (
    <button
      ref={ref}
      onClick={(e) => {
        onOpenChange(true)
        onClick?.(e)
      }}
      {...props}
    >
      {children}
    </button>
  )
})
DialogTrigger.displayName = "DialogTrigger"

const DialogOverlay = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const { open, onOpenChange } = useDialogContext()
    if (!open) return null

    return (
      <div
        ref={ref}
        className={cn(
          "fixed inset-0 z-40 h-screen w-screen bg-black/60 animate-in fade-in-0",
          className
        )}
        onClick={() => onOpenChange(false)}
        {...props}
      />
    )
  }
)
DialogOverlay.displayName = "DialogOverlay"

const DIALOG_CLOSE_BUTTON_CLASS =
  "rounded-full  transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 flex items-center justify-center"

interface DialogContentProps extends React.HTMLAttributes<HTMLDivElement> {
  hideDefaultClose?: boolean
}

const DialogContent = React.forwardRef<HTMLDivElement, DialogContentProps>(
  ({ className, children, hideDefaultClose, ...props }, ref) => {
    const { open, onOpenChange } = useDialogContext()
    if (!open) return null

    return (
      <DialogPortal>
        <DialogOverlay />
        <div
          ref={ref}
          className={cn(
            "fixed left-[50%] top-[50%] z-50 w-[calc(100vw-1.5rem)] max-w-3xl max-h-[min(90vh,90dvh)] translate-x-[-50%] translate-y-[-50%] border bg-background p-4 shadow-lg rounded-lg overflow-y-auto overflow-x-hidden animate-in fade-in-0 zoom-in-95 sm:p-2",
            className
          )}
          onClick={(e) => e.stopPropagation()}
          {...props}
        >
          {children}
          {!hideDefaultClose && (
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className={cn(
                "absolute right-2 top-2 z-10 flex h-9 w-9 shrink-0 items-center justify-center p-0 sm:right-4",
                DIALOG_CLOSE_BUTTON_CLASS
              )}
            >
              <DialogCloseIcon className="h-4 w-4 text-foreground" />
              <span className="sr-only">Close</span>
            </button>
          )}
        </div>
      </DialogPortal>
    )
  }
)
DialogContent.displayName = "DialogContent"

const DialogCloseButton = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, onClick, ...props }, ref) => {
  const { onOpenChange } = useDialogContext()
  return (
    <button
      ref={ref}
      type="button"
      onClick={(e) => {
        onOpenChange(false)
        onClick?.(e)
      }}
      className={cn("h-8 w-8 shrink-0", DIALOG_CLOSE_BUTTON_CLASS, className)}
      {...props}
    >
      <DialogCloseIcon className="h-4 w-4 text-foreground" />
      <span className="sr-only">Close</span>
    </button>
  )
})
DialogCloseButton.displayName = "DialogCloseButton"

const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-1.5 border-b border-border pb-4 mb-4",
      className
    )}
    {...props}
  />
)
DialogHeader.displayName = "DialogHeader"

const DialogTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h2
      ref={ref}
      className={cn("text-lg font-semibold leading-none tracking-tight", className)}
      {...props}
    />
  )
)
DialogTitle.displayName = "DialogTitle"

const DialogDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
))
DialogDescription.displayName = "DialogDescription"

export {
  Dialog,
  DialogTrigger,
  DialogOverlay,
  DialogContent,
  DialogCloseButton,
  DialogHeader,
  DialogTitle,
  DialogDescription,
}
