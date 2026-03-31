"use client"

import { useForm, Controller } from "react-hook-form"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AppSelect } from "@/components/shared/AppSelect"
import { Users } from "lucide-react"

interface OnboardUserModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit?: (data: OnboardUserFormData) => void
}

export interface OnboardUserFormData {
  name: string
  phoneNumber: string
  companyName: string
  email: string
  role: string
  gstNumber: string
  address: string
}

export function OnboardUserModal({ open, onOpenChange, onSubmit }: OnboardUserModalProps) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<OnboardUserFormData>({
    defaultValues: {
      name: "",
      phoneNumber: "",
      companyName: "",
      email: "",
      role: "",
      gstNumber: "",
      address: "",
    },
  })

  const onSubmitForm = (data: OnboardUserFormData) => {
    onSubmit?.(data)
    reset()
    onOpenChange(false)
  }

  const handleCancel = () => {
    reset()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          // Design @ 1920×1080: 580×623, radius 5px, top/left match centered frame (670 / 229)
          "flex max-w-none w-[min(520px,calc(100vw-1.5rem))] h-[min(560px,90dvh)] flex-col overflow-y-auto overflow-x-hidden overflow-y-hidden rounded-[5px] p-4 sm:p-6",
          "min-[1920px]:left-[670px] min-[1920px]:top-[229px] min-[1920px]:translate-x-0 min-[1920px]:translate-y-0"
        )}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-semibold">
            <Users className="h-5 w-5" />
            Onboard User
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmitForm)}>
          <div className="space-y-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    placeholder="Enter vendor name"
                    {...register("name", {
                      required: "Name is required",
                    })}
                    className={errors.name ? "border-red-500" : ""}
                  />
                  {errors.name && (
                    <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="tel"
                    placeholder="Enter phone number"
                    {...register("phoneNumber", {
                      required: "Phone number is required",
                    })}
                    className={errors.phoneNumber ? "border-red-500" : ""}
                  />
                  {errors.phoneNumber && (
                    <p className="mt-1 text-xs text-red-500">{errors.phoneNumber.message}</p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Company Name</label>
                  <Input
                    type="text"
                    placeholder="Enter company name"
                    {...register("companyName")}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="email"
                    placeholder="name@example.com"
                    {...register("email", {
                      required: "Email is required",
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: "Please enter a valid email address",
                      },
                    })}
                    className={errors.email ? "border-red-500" : ""}
                  />
                  {errors.email && (
                    <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Role <span className="text-red-500">*</span>
                  </label>
                  <Controller
                    name="role"
                    control={control}
                    rules={{ required: "Role is required" }}
                    render={({ field }) => (
                      <AppSelect
                        placeholder="Select role"
                        value={field.value}
                        onChange={field.onChange}
                        options={[
                          { label: "Brand", value: "Brand" },
                          { label: "Agent", value: "Agent" },
                          { label: "Retailer", value: "Retailer" },
                          {
                            label: "Institutional Buyer",
                            value: "Institutional Buyer",
                          },
                        ]}
                        className="w-full"
                      />
                    )}
                  />
                  {errors.role && (
                    <p className="mt-1 text-xs text-red-500">{errors.role.message}</p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">GST Number</label>
                  <Input type="text" placeholder="Enter gst number" {...register("gstNumber")} />
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="onboard-address" className="text-sm font-medium mb-2 block">
                Address <span className="text-red-500">*</span>
              </label>
              <textarea
                id="onboard-address"
                placeholder="Enter full address"
                rows={3}
                {...register("address", {
                  required: "Address is required",
                })}
                className={cn(
                  "flex w-full rounded-md border border-input bg-[#E8E9E8] px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none",
                  errors.address && "border-red-500"
                )}
              />
              {errors.address && (
                <p className="mt-1 text-xs text-red-500">{errors.address.message}</p>
              )}
            </div>

            <div className="flex justify-between gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                className="border-gray-300 bg-white text-gray-700 hover:bg-gray-50 w-full"
              >
                Cancel
              </Button>
              <Button type="submit" className="bg-gray-900 text-white hover:bg-gray-800 w-full">
                Onboard User
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
