"use client"

import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"

interface DeactivateUserConfirmationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userName?: string
  onConfirm: () => void
}

export function DeactivateUserConfirmationModal({
  open,
  onOpenChange,
  userName,
  onConfirm,
}: DeactivateUserConfirmationModalProps) {
  const handleConfirm = () => {
    onConfirm()
    onOpenChange(false)
  }

  const handleCancel = () => {
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <div className="flex flex-col items-center justify-center pt-4">
          <div className="mb-4 flex h-12 w-12 items-center justify-center">
            <AlertCircle className="h-full w-full text-[#962C2C]" />
          </div>

          <p className="mb-6 text-center text-base font-medium text-gray-700">
            Are you sure you want to deactivate this user?
          </p>

          <div className="flex w-full gap-3">
            <Button
              variant="outline"
              onClick={handleCancel}
              className="flex-1 border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              className="flex-1 w-full bg-gray-900 text-white hover:bg-gray-800"
            >
              Deactivate
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
