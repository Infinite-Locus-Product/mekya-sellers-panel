"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useAuth } from "@/contexts/auth-context"
import {
  fetchUserProfile,
  updateUserProfile,
  presignAvatarUpload,
  changePassword,
  uploadFileToStorage,
  type UserProfileApiResponse,
} from "@/lib/api/profile"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import {
  Mail,
  Phone,
  Pencil,
  Save,
  UserCircle,
  Lock,
  Upload,
  LogOut,
  X,
  MapPin,
  AlertTriangle,
  Info,
  Check,
  ChevronDown,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  PasswordFieldConcealIcon,
  PasswordFieldRevealIcon,
} from "@/components/auth/password-visibility-icons"
import {
  ChangePasswordTabLockIcon,
  LogoutWarningIcon,
  PasswordMatchCircleCheckIcon,
  PasswordRequirementMetIcon,
  SuccessCheckCircleIcon,
} from "@/assets/icons/profile"
import { TabList } from "@/components/shared/TabList"
import type { ProfilePageData } from "@/lib/data"

type PersonalFormState = ProfilePageData["personal"]
type LocationRestrictionState = {
  isEnabled: boolean
  restrictedStates: string[]
}

const MAX_IMAGE_SIZE_MB = 5
const ACCEPTED_IMAGE_TYPES = new Set(["image/png", "image/jpeg", "image/jpg"])

const PASSWORD_REQUIREMENTS = [
  { id: "length", label: "Min. 8 characters", test: (s: string) => s.length >= 8 },
  { id: "upper", label: "Includes uppercase", test: (s: string) => /[A-Z]/.test(s) },
  { id: "lower", label: "Includes lowercase", test: (s: string) => /[a-z]/.test(s) },
  { id: "number", label: "Includes number", test: (s: string) => /\d/.test(s) },
  { id: "special", label: "special character (!@#$%^&*)", test: (s: string) => /[!@#$%^&*]/.test(s) },
] as const

type TabId = "profile" | "security" | "locationRestriction"

const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
] as const

export interface ProfileClientProps {
  initialData: ProfilePageData
}

function isPersonalDirty(form: PersonalFormState, saved: PersonalFormState): boolean {
  return (
    form.firstName !== saved.firstName ||
    form.lastName !== saved.lastName ||
    form.phoneCode !== saved.phoneCode ||
    form.phone !== saved.phone ||
    form.company !== saved.company ||
    form.gstin !== saved.gstin ||
    form.address !== saved.address
  )
}

function mapApiToState(data: UserProfileApiResponse): {
  profileData: import("@/lib/data").ProfilePageData["profile"]
  personalInfo: import("@/lib/data").ProfilePageData["personal"]
} {
  const fullName = [data.first_name, data.last_name].filter(Boolean).join(" ") || data.email
  return {
    profileData: {
      name: fullName,
      email: data.email,
      phone: data.phone ? `+91 ${data.phone}` : "",
      role: data.user_subtype ?? data.business_type ?? data.role ?? "Seller",
      companyName: data.company_name ?? undefined,
      profile_image_url: data.profile_image_url,
    },
    personalInfo: {
      firstName: data.first_name ?? "",
      lastName: data.last_name ?? "",
      email: data.email,
      phoneCode: "+91",
      phone: data.phone ?? "",
      company: data.company_name ?? "",
      address: data.company_address ?? "",
      gstin: data.gstin ?? "",
    },
  }
}

function isLocationRestrictionDirty(current: LocationRestrictionState, saved: LocationRestrictionState): boolean {
  if (current.isEnabled !== saved.isEnabled) return true
  if (current.restrictedStates.length !== saved.restrictedStates.length) return true
  return current.restrictedStates.some((state, index) => state !== saved.restrictedStates[index])
}

export function ProfileClient({ initialData }: Readonly<ProfileClientProps>) {
  const router = useRouter()
  const { logout } = useAuth()
  const { personal } = initialData
  const [profileData, setProfileData] = useState(initialData.profile)
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(
    initialData.profile.profile_image_url ?? null
  )
  const [activeTab, setActiveTab] = useState<TabId>("profile")
  const [savedPersonal, setSavedPersonal] = useState<PersonalFormState>(() => ({ ...personal }))
  const [personalForm, setPersonalForm] = useState<PersonalFormState>(() => ({ ...personal }))
  const [isPersonalEditing, setIsPersonalEditing] = useState(false)
  const [isSavingPersonal, setIsSavingPersonal] = useState(false)
  const [isSavingPassword, setIsSavingPassword] = useState(false)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const [successModalOpen, setSuccessModalOpen] = useState(false)
  const [logoutModalOpen, setLogoutModalOpen] = useState(false)
  const [discardModalOpen, setDiscardModalOpen] = useState(false)
  const [highRestrictionWarningOpen, setHighRestrictionWarningOpen] = useState(false)
  const [pendingTab, setPendingTab] = useState<TabId | null>(null)

  const personalIsDirty = useMemo(() => isPersonalDirty(personalForm, savedPersonal), [personalForm, savedPersonal])
  const [uploadImageOpen, setUploadImageOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isPasswordFormEnabled, setIsPasswordFormEnabled] = useState(false)
  const [isLocationRestrictionEnabled, setIsLocationRestrictionEnabled] = useState(false)
  const [restrictedStates, setRestrictedStates] = useState<string[]>([])
  const [savedLocationRestrictions, setSavedLocationRestrictions] = useState<LocationRestrictionState>({
    isEnabled: false,
    restrictedStates: [],
  })
  const [isStateDropdownOpen, setIsStateDropdownOpen] = useState(false)
  const stateDropdownRef = useRef<HTMLDivElement | null>(null)
  const locationRestrictionIsDirty = useMemo(
    () =>
      isLocationRestrictionDirty(
        { isEnabled: isLocationRestrictionEnabled, restrictedStates },
        savedLocationRestrictions
      ),
    [isLocationRestrictionEnabled, restrictedStates, savedLocationRestrictions]
  )

  const resetPasswordSection = useCallback(() => {
    setIsPasswordFormEnabled(false)
    setCurrentPassword("")
    setNewPassword("")
    setConfirmPassword("")
    setShowCurrentPassword(false)
    setShowNewPassword(false)
    setShowConfirmPassword(false)
  }, [])

  const passwordFormLocked = !isPasswordFormEnabled

  const isPasswordValid = useMemo(() => {
    if (!currentPassword.trim()) return false
    if (!PASSWORD_REQUIREMENTS.every(({ test }) => test(newPassword))) return false
    if (newPassword !== confirmPassword) return false
    return true
  }, [currentPassword, newPassword, confirmPassword])

  const handleUploadImageOpenChange = useCallback((open: boolean) => {
    setUploadImageOpen(open)
    if (!open) {
      setSelectedFile(null)
      setIsDragging(false)
    }
  }, [])

  const validateFile = useCallback((file: File): string | null => {
    if (!ACCEPTED_IMAGE_TYPES.has(file.type)) {
      return "Supported image formats: PNG, JPG"
    }
    if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
      return `Max file size: ${MAX_IMAGE_SIZE_MB}MB`
    }
    return null
  }, [])

  const handleFileSelect = useCallback(
    (file: File | null) => {
      if (!file) {
        setSelectedFile(null)
        return
      }
      const error = validateFile(file)
      if (error) return
      setSelectedFile(file)
    },
    [validateFile]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      const file = e.dataTransfer.files[0]
      if (file) handleFileSelect(file)
    },
    [handleFileSelect]
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleUploadSubmit = useCallback(async () => {
    if (!selectedFile) return
    setIsUploadingAvatar(true)
    try {
      const presign = await presignAvatarUpload(selectedFile.name, selectedFile.type, selectedFile.size)
      await uploadFileToStorage(presign.upload_url, selectedFile)
      await updateUserProfile({ profile_image_url: presign.profile_image_url })
      setProfileImageUrl(presign.profile_image_url)
      setUploadImageOpen(false)
      setSelectedFile(null)
      toast.success("Profile picture updated.")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed. Please try again.")
    } finally {
      setIsUploadingAvatar(false)
    }
  }, [selectedFile])

  const handleTabChange = useCallback(
    (next: TabId) => {
      if (next === activeTab) return
      if (activeTab === "profile" && isPersonalEditing && personalIsDirty) {
        setPendingTab(next)
        setDiscardModalOpen(true)
        return
      }
      if (activeTab === "locationRestriction" && locationRestrictionIsDirty) {
        setPendingTab(next)
        setDiscardModalOpen(true)
        return
      }
      if (activeTab === "security" && next !== "security") {
        resetPasswordSection()
      }
      setActiveTab(next)
    },
    [activeTab, isPersonalEditing, locationRestrictionIsDirty, personalIsDirty, resetPasswordSection]
  )

  const handleStartEditPersonal = useCallback(() => {
    setIsPersonalEditing(true)
  }, [])

  const handleSavePersonal = useCallback(async () => {
    setIsSavingPersonal(true)
    try {
      const updated = await updateUserProfile({
        first_name: personalForm.firstName || null,
        last_name: personalForm.lastName || null,
        phone: personalForm.phone || null,
        company_name: personalForm.company || null,
        company_address: personalForm.address || null,
        gstin: personalForm.gstin || null,
      })
      const { profileData: pd, personalInfo: pi } = mapApiToState(updated)
      setProfileData(pd)
      setProfileImageUrl(updated.profile_image_url ?? null)
      setSavedPersonal(pi)
      setPersonalForm(pi)
      setIsPersonalEditing(false)
      setSuccessModalOpen(true)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save changes.")
    } finally {
      setIsSavingPersonal(false)
    }
  }, [personalForm])

  const closeSuccessModal = useCallback(() => {
    setSuccessModalOpen(false)
  }, [])

  const closeLogoutModal = useCallback(() => {
    setLogoutModalOpen(false)
  }, [])

  const handleConfirmLogout = useCallback(async () => {
    setLogoutModalOpen(false)
    await logout()
    router.replace("/login")
  }, [logout, router])

  const confirmDiscardPersonal = useCallback(() => {
    if (activeTab === "profile") {
      setPersonalForm({ ...savedPersonal })
      setIsPersonalEditing(false)
    }
    if (activeTab === "locationRestriction") {
      setIsLocationRestrictionEnabled(savedLocationRestrictions.isEnabled)
      setRestrictedStates([...savedLocationRestrictions.restrictedStates])
      setIsStateDropdownOpen(false)
    }
    setDiscardModalOpen(false)
    if (pendingTab !== null) {
      setActiveTab(pendingTab)
      setPendingTab(null)
    }
  }, [activeTab, pendingTab, savedLocationRestrictions, savedPersonal])

  const cancelDiscardPersonal = useCallback(() => {
    setDiscardModalOpen(false)
    setPendingTab(null)
  }, [])

  const updatePersonalField = useCallback((key: keyof PersonalFormState, value: string) => {
    setPersonalForm((prev) => ({ ...prev, [key]: value }))
  }, [])

  const handleUpdatePassword = useCallback(async () => {
    if (passwordFormLocked || !isPasswordValid) return
    setIsSavingPassword(true)
    try {
      await changePassword({ old_password: currentPassword, new_password: newPassword })
      toast.success("Your password has been changed successfully.", { icon: "🎉" })
      resetPasswordSection()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to change password.")
    } finally {
      setIsSavingPassword(false)
    }
  }, [passwordFormLocked, isPasswordValid, currentPassword, newPassword, resetPasswordSection])

  const selectedStatesSummary = useMemo(() => {
    if (restrictedStates.length === 0) return "Select states to restrict visibility"
    if (restrictedStates.length === 1) return restrictedStates[0]
    return `${restrictedStates.length} states selected`
  }, [restrictedStates])
  const isHighRestrictionSelection = useMemo(
    () => isLocationRestrictionEnabled && restrictedStates.length / INDIAN_STATES.length > 0.8,
    [isLocationRestrictionEnabled, restrictedStates]
  )
  const handleAddRestrictedState = useCallback(
    (state: string) => {
      if (!state || restrictedStates.includes(state)) return
      if (restrictedStates.length >= INDIAN_STATES.length - 1) {
        toast.error("At least one state must remain unrestricted.")
        return
      }
      setRestrictedStates((prev) => [...prev, state])
    },
    [restrictedStates]
  )

  const handleRemoveRestrictedState = useCallback((state: string) => {
    setRestrictedStates((prev) => prev.filter((item) => item !== state))
  }, [])

  const handleToggleRestrictedState = useCallback(
    (state: string) => {
      if (restrictedStates.includes(state)) {
        handleRemoveRestrictedState(state)
        return
      }
      handleAddRestrictedState(state)
    },
    [handleAddRestrictedState, handleRemoveRestrictedState, restrictedStates]
  )

  const persistLocationRestrictions = useCallback(() => {
    setSavedLocationRestrictions({
      isEnabled: isLocationRestrictionEnabled,
      restrictedStates: [...restrictedStates],
    })
    toast.success("Location restrictions saved successfully.", { icon: "🎉" })
  }, [isLocationRestrictionEnabled, restrictedStates])

  const handleSaveLocationRestrictions = useCallback(() => {
    if (isHighRestrictionSelection) {
      setHighRestrictionWarningOpen(true)
      return
    }
    persistLocationRestrictions()
  }, [isHighRestrictionSelection, persistLocationRestrictions])

  const handleProceedWithHighRestrictionSave = useCallback(() => {
    setHighRestrictionWarningOpen(false)
    persistLocationRestrictions()
  }, [persistLocationRestrictions])

  const handleEditHighRestrictionSelection = useCallback(() => {
    setHighRestrictionWarningOpen(false)
  }, [])

  useEffect(() => {
    const handleDocumentClick = (event: MouseEvent) => {
      if (!stateDropdownRef.current) return
      if (!stateDropdownRef.current.contains(event.target as Node)) {
        setIsStateDropdownOpen(false)
      }
    }

    document.addEventListener("mousedown", handleDocumentClick)
    return () => {
      document.removeEventListener("mousedown", handleDocumentClick)
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    fetchUserProfile()
      .then((data) => {
        if (cancelled) return
        const { profileData: pd, personalInfo: pi } = mapApiToState(data)
        setProfileData(pd)
        setSavedPersonal(pi)
        setPersonalForm(pi)
        setProfileImageUrl(data.profile_image_url ?? null)
      })
      .catch(() => {
        toast.error("Failed to load profile data.")
      })
    return () => {
      cancelled = true
    }
  }, [])

  const breadcrumbSuffix = useMemo(() => {
    if (activeTab === "security") return "Security"
    if (activeTab === "locationRestriction") return "Location Restriction"
    return "Profile"
  }, [activeTab])
  const isSellerProfile = useMemo(() => /seller/i.test(profileData.role), [profileData.role])
  const sellerCompanyName = profileData.companyName ?? personalForm.company

  return (
    <div className="flex min-h-0 w-full flex-col px-4 py-6 sm:px-6 md:px-8 lg:px-10 xl:px-12">
      <div className="flex w-full flex-col space-y-6 md:space-y-8 lg:space-y-10">
        <nav className="mb-4 text-sm text-muted-foreground" aria-label="Breadcrumb">
          Seller Dashboard &gt; Profile Management &gt; {breadcrumbSuffix}
        </nav>
        <div className="flex flex-row items-center justify-between">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold text-foreground sm:text-2xl lg:text-2xl">Profile Management</h1>
            <p className="text-sm text-muted-foreground sm:text-base">
              Manage your profile account settings and preferences.
            </p>
          </div>
          <div className="flex flex-row items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setLogoutModalOpen(true)}
              className="flex flex-row items-center justify-end gap-2 rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background"
              aria-label="Log out"
            >
              <LogOut className="h-4 w-4 shrink-0" aria-hidden />
              Logout
            </button>
          </div>
        </div>

        <div className="flex flex-row items-center justify-between whitespace-nowrap">
          <TabList
            tabs={[
              { id: "profile", label: "Profile" },
              { id: "security", label: "Security" },
              { id: "locationRestriction", label: "Location Restriction" },
            ]}
            value={activeTab}
            onValueChange={(id) => handleTabChange(id as TabId)}
            variant="muted"
            className="w-full max-w-xs sm:max-w-sm"
            aria-label="Profile sections"
          />
          {activeTab === "security" && (
            <button
              type="button"
              onClick={() => setIsPasswordFormEnabled(true)}
              className={cn(
                "flex cursor-pointer flex-row items-center gap-1 rounded-md text-sm font-medium transition-colors",
                "text-foreground  focus-visible:outline-none",
                isPasswordFormEnabled && "text-muted-foreground"
              )}
              aria-expanded={isPasswordFormEnabled}
              aria-controls="change-password-section"
            >
              <ChangePasswordTabLockIcon className="shrink-0" />
              Change Password
            </button>
          )}
        </div>
        {activeTab === "profile" && (
          <div className="flex w-full flex-col gap-6 lg:gap-8">
            <Card className="w-full rounded-lg">
              <CardContent className="flex flex-col gap-5 bg-[#F9FAF9] p-6 sm:p-8">
                <div className="flex flex-row items-start justify-start gap-5">
                  <div className="relative shrink-0">
                    {profileImageUrl ? (
                      <img
                        src={profileImageUrl}
                        alt="Profile"
                        className="h-20 w-20 rounded-full border-2 border-background object-cover shadow-sm sm:h-24 sm:w-24"
                      />
                    ) : (
                      <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-background bg-sky-100 text-sky-800 shadow-sm sm:h-24 sm:w-24">
                        <span className="text-xl font-semibold sm:text-2xl">
                          {profileData.name
                            .split(" ")
                            .filter(Boolean)
                            .map((n) => n[0])
                            .join("")}
                        </span>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => setUploadImageOpen(true)}
                      className="absolute -bottom-0.5 -right-0.5 flex h-8 w-8 items-center justify-center rounded-full border-2 border-background bg-foreground text-background shadow-sm transition-colors hover:bg-foreground/90 sm:h-9 sm:w-9"
                      aria-label="Change profile image"
                    >
                      <Pencil className="h-4 w-4 sm:h-[18px] sm:w-[18px]" aria-hidden />
                    </button>
                  </div>
                  <div className="flex flex-col gap-2 text-start">
                    <h2 className="text-lg font-bold text-foreground sm:text-xl">{profileData.name}</h2>
                    {isSellerProfile && sellerCompanyName ? (
                      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground sm:text-sm">
                        <span>{sellerCompanyName}</span>
                      </div>
                    ) : null}
                    <div className="flex gap-4">
                      <span className="flex items-center justify-start gap-2 border-r border-black pr-4 text-sm text-muted-foreground">
                        <Mail className="h-4 w-4 shrink-0" aria-hidden />
                        <span className="truncate">{profileData.email}</span>
                      </span>
                      <span className="flex items-center justify-start gap-2 text-sm text-muted-foreground">
                        <Phone className="h-4 w-4 shrink-0" aria-hidden />
                        {profileData.phone}
                      </span>
                    </div>
                    <span className="mt-2 inline-flex w-fit items-center justify-start rounded-full bg-foreground px-3 py-1 text-sm font-medium text-background">
                      {profileData.role}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Dialog open={uploadImageOpen} onOpenChange={handleUploadImageOpenChange}>
              <DialogContent
                hideDefaultClose
                className="max-w-lg gap-0 overflow-hidden rounded-lg border border-[#E5E7EB] bg-white shadow-md sm:max-w-md sm:p-0"
              >
                <div className="flex items-center justify-between border-b border-[#E5E7EB] p-4">
                  <div className="flex items-center gap-2">
                    <Upload className="h-5 w-5 shrink-0 text-foreground" strokeWidth={2} aria-hidden />
                    <h2 className="text-base font-bold tracking-tight text-foreground sm:text-lg">Upload Image</h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleUploadImageOpenChange(false)}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-foreground transition-colors hover:bg-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    aria-label="Close"
                  >
                    <X className="h-5 w-5" strokeWidth={2} aria-hidden />
                  </button>
                </div>

                <div className="p-4">
                  <label
                    htmlFor="profile-image-upload"
                    className={cn(
                      "flex cursor-pointer flex-col items-center justify-center gap-4 rounded-md border-2 border-dashed border-[#D1D5DB] bg-white py-12 transition-colors",
                      isDragging ? "border-[#111827] bg-neutral-50" : "hover:border-[#9CA3AF] hover:bg-neutral-50/80"
                    )}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                  >
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/jpg"
                      className="sr-only"
                      id="profile-image-upload"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        handleFileSelect(file ?? null)
                      }}
                    />
                    <Upload className="h-14 w-14 shrink-0 text-[#9CA3AF]" strokeWidth={1.25} aria-hidden />
                    <div className="flex flex-col gap-2 text-center">
                      <span className="text-sm font-medium text-[#000000]">{"Choose an image or drag & drop it here"}</span>
                      <span className="text-xs leading-relaxed text-[#71717A] sm:text-sm">
                        Supported image formats: PNG, JPG
                      </span>
                      <span className="text-xs leading-relaxed text-[#71717A] sm:text-sm">
                        Max file size: {MAX_IMAGE_SIZE_MB}MB.
                      </span>
                    </div>
                    {selectedFile && <span className="text-xs font-medium text-[#111827]">{selectedFile.name}</span>}
                  </label>
                </div>

                <div className="flex justify-between gap-3 px-6 py-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="h-10 w-full rounded-md border border-black bg-white text-sm font-medium text-black shadow-none hover:bg-neutral-50 hover:text-black"
                    onClick={() => handleUploadImageOpenChange(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    className="h-10 w-full rounded-md bg-[#111827] text-sm font-medium text-white shadow-none hover:bg-[#111827]/90"
                    onClick={handleUploadSubmit}
                    disabled={!selectedFile || isUploadingAvatar}
                  >
                    {isUploadingAvatar ? "Uploading…" : "Upload Image"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Card className="w-full rounded-lg bg-[#F9FAF9]">
              <CardContent className="flex flex-col gap-6 p-6 sm:p-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
                  <div className="flex flex-col gap-1">
                    <h3 className="flex items-center gap-2 text-lg font-semibold text-foreground sm:text-xl">
                      <UserCircle className="h-5 w-5 shrink-0" aria-hidden />
                      Personal Information
                    </h3>
                    <p className="text-sm text-muted-foreground">Update your personal details and contact information.</p>
                  </div>
                  {isPersonalEditing ? null : (
                    <Button
                      type="button"
                      size="sm"
                      className="shrink-0 border-none bg-transparent text-foreground shadow-none hover:bg-transparent hover:text-foreground"
                      onClick={handleStartEditPersonal}
                    >
                      <Pencil className="mr-2 h-4 w-4 " aria-hidden />
                      Edit Details
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2">
                  <div className="flex flex-col gap-2">
                    <label htmlFor="first-name" className="text-sm font-medium text-foreground">
                      First Name
                    </label>
                    <Input
                      id="first-name"
                      value={personalForm.firstName}
                      onChange={(e) => updatePersonalField("firstName", e.target.value)}
                      disabled={!isPersonalEditing}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label htmlFor="last-name" className="text-sm font-medium text-foreground">
                      Last Name
                    </label>
                    <Input
                      id="last-name"
                      value={personalForm.lastName}
                      onChange={(e) => updatePersonalField("lastName", e.target.value)}
                      disabled={!isPersonalEditing}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label htmlFor="email" className="text-sm font-medium text-foreground">
                      Email
                    </label>
                    <Input
                      id="email"
                      type="email"
                      value={personalForm.email}
                      disabled
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label htmlFor="phone" className="text-sm font-medium text-foreground">
                      Phone Number
                    </label>
                    <div className="flex overflow-hidden rounded-md border border-[#E8E9E8]">
                      <Input
                        id="phone-code"
                        value={personalForm.phoneCode}
                        className="w-20 shrink-0 rounded-none"
                        aria-label="Country code"
                        disabled
                      />
                      <Input
                        id="phone"
                        value={personalForm.phone}
                        onChange={(e) => updatePersonalField("phone", e.target.value)}
                        className="min-w-0 flex-1 rounded-none"
                        aria-label="Phone number"
                        disabled={!isPersonalEditing}
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label htmlFor="company" className="text-sm font-medium text-foreground">
                      Company
                    </label>
                    <Input
                      id="company"
                      value={personalForm.company}
                      onChange={(e) => updatePersonalField("company", e.target.value)}
                      disabled={!isPersonalEditing}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label htmlFor="gstin" className="text-sm font-medium text-foreground">
                      GSTIN
                    </label>
                    <Input
                      id="gstin"
                      value={personalForm.gstin}
                      onChange={(e) => updatePersonalField("gstin", e.target.value.toUpperCase())}
                      placeholder="e.g. 22AAAAA0000A1Z5"
                      maxLength={15}
                      disabled={!isPersonalEditing}
                    />
                  </div>
                  <div className="flex flex-col gap-2 md:col-span-2">
                    <label htmlFor="address" className="text-sm font-medium text-foreground">
                      Address
                    </label>
                    <Input
                      id="address"
                      value={personalForm.address}
                      onChange={(e) => updatePersonalField("address", e.target.value)}
                      disabled={!isPersonalEditing}
                    />
                  </div>
                </div>

                <Button
                  type="button"
                  className="w-full sm:w-auto sm:min-w-[180px]"
                  size="lg"
                  disabled={!isPersonalEditing || !personalIsDirty || isSavingPersonal}
                  onClick={handleSavePersonal}
                >
                  <Save className="mr-2 h-4 w-4" aria-hidden />
                  {isSavingPersonal ? "Saving…" : "Save Changes"}
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "security" && (
          <Card
            id="change-password-section"
            className={cn("relative w-full rounded-lg bg-[#F9FAF9]", passwordFormLocked && "select-none")}
            aria-disabled={passwordFormLocked}
          >
            <CardContent className="flex flex-col gap-6 p-6 sm:p-8">
              <div className="flex flex-col gap-1 transition-colors">
                <h3
                  className={cn(
                    "flex items-center gap-2 text-lg font-semibold transition-colors sm:text-xl",
                    passwordFormLocked ? "text-muted-foreground opacity-70" : "text-foreground"
                  )}
                >
                  <Lock className="h-5 w-5 shrink-0" aria-hidden />
                  Change Password
                </h3>
                <p
                  className={cn(
                    "text-sm transition-colors",
                    passwordFormLocked ? "text-muted-foreground/70" : "text-muted-foreground"
                  )}
                >
                  Update your password to keep your account secure.
                </p>
              </div>

              <div className={cn("flex flex-col gap-5 transition-opacity", passwordFormLocked && "pointer-events-none opacity-50")}>
                <div className="flex flex-col gap-2">
                  <label htmlFor="current-password" className="text-sm font-medium text-foreground">
                    Current Password <span className="text-destructive">*</span>
                  </label>
                  <div className="relative">
                    <Input
                      id="current-password"
                      type={showCurrentPassword ? "text" : "password"}
                      placeholder="Enter current password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="bg-background pr-10"
                      autoComplete="current-password"
                      disabled={passwordFormLocked}
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword((v) => !v)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground disabled:pointer-events-none"
                      aria-label={showCurrentPassword ? "Hide password" : "Show password"}
                      disabled={passwordFormLocked}
                    >
                      {showCurrentPassword ? <PasswordFieldConcealIcon /> : <PasswordFieldRevealIcon />}
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="new-password" className="text-sm font-medium text-foreground">
                    New Password <span className="text-destructive">*</span>
                  </label>
                  <div className="relative">
                    <Input
                      id="new-password"
                      type={showNewPassword ? "text" : "password"}
                      placeholder="Create new password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="bg-background pr-10"
                      autoComplete="new-password"
                      disabled={passwordFormLocked}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword((v) => !v)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground disabled:pointer-events-none"
                      aria-label={showNewPassword ? "Hide password" : "Show password"}
                      disabled={passwordFormLocked}
                    >
                      {showNewPassword ? <PasswordFieldConcealIcon /> : <PasswordFieldRevealIcon />}
                    </button>
                  </div>
                  <ul className="flex flex-col gap-1.5 pt-1">
                    {PASSWORD_REQUIREMENTS.map(({ id, label, test }) => {
                      const met = test(newPassword)
                      return (
                        <li
                          key={id}
                          className={cn("flex items-center gap-2 text-xs", met ? "text-emerald-600" : "text-muted-foreground")}
                        >
                          {met ? (
                            <PasswordRequirementMetIcon className="shrink-0" />
                          ) : (
                            <span
                              className="flex h-4 w-4 shrink-0 items-center justify-center rounded border border-current"
                              aria-hidden
                            />
                          )}
                          {label}
                        </li>
                      )
                    })}
                  </ul>
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="confirm-password" className="text-sm font-medium text-foreground">
                    Confirm New Password <span className="text-destructive">*</span>
                  </label>
                  <div className="relative">
                    <Input
                      id="confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Re-enter new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="bg-background pr-10"
                      autoComplete="new-password"
                      disabled={passwordFormLocked}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((v) => !v)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground disabled:pointer-events-none"
                      aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                      disabled={passwordFormLocked}
                    >
                      {showConfirmPassword ? <PasswordFieldConcealIcon /> : <PasswordFieldRevealIcon />}
                    </button>
                  </div>
                  {confirmPassword.length > 0 && (
                    <p
                      className={cn(
                        "flex items-center gap-2 pt-1 text-xs",
                        newPassword === confirmPassword ? "text-emerald-600" : "text-destructive"
                      )}
                    >
                      {newPassword === confirmPassword ? (
                        <>
                          <PasswordMatchCircleCheckIcon className="shrink-0" />
                          Password Matched
                        </>
                      ) : (
                        "Passwords do not match"
                      )}
                    </p>
                  )}
                </div>
              </div>

              <Button
                type="button"
                className="w-full sm:w-auto sm:min-w-[200px]"
                size="lg"
                disabled={passwordFormLocked || !isPasswordValid || isSavingPassword}
                onClick={handleUpdatePassword}
              >
                <Lock className="mr-2 h-4 w-4" aria-hidden />
                {isSavingPassword ? "Updating…" : "Update Password"}
              </Button>
            </CardContent>
          </Card>
        )}

        {activeTab === "locationRestriction" && (
          <Card className="w-full rounded-lg bg-[#F9FAF9]">
            <CardContent className="p-0">
              <div className="flex flex-col gap-2 border-b border-[#E5E7EB] px-6 py-5">
                <h3 className="flex items-center gap-2 text-lg font-semibold text-foreground sm:text-xl">
                  <MapPin className="h-4 w-4 shrink-0" aria-hidden />
                  Location Restrictions
                </h3>
                <p className="text-sm text-muted-foreground">
                  Configure geographic restrictions for your product and content visibility
                </p>
              </div>

              <div className="space-y-4 px-6 py-5">
                <div className="flex items-center justify-between rounded-md border border-[#E5E7EB] px-4 py-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-foreground">Restrict product and content visibility by region</p>
                      <div className="group relative inline-flex">
                        <button
                          type="button"
                          aria-label="Buyers in selected states will not see your products or content."
                          className="inline-flex h-4 w-4 cursor-help items-center justify-center rounded-full text-muted-foreground outline-none"
                        >
                          <Info className="h-3.5 w-3.5" aria-hidden />
                        </button>
                        <div className="pointer-events-none absolute bottom-6 left-1/2 z-20 hidden w-max max-w-[360px] -translate-x-1/2 rounded-md bg-black px-3 py-2 text-md text-white shadow-sm group-hover:block group-focus-within:block">
                          <span className="block leading-snug whitespace-pre-wrap">Buyers in selected states will not see your products or content.</span>
                          <span
                            aria-hidden
                            className="absolute left-1/2 top-full h-0 w-0 -translate-x-1/2 border-l-[6px] border-r-[6px] border-t-[6px] border-l-transparent border-r-transparent border-t-black"
                          />
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      When enabled, buyers in selected states will not see your products or content
                    </p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={isLocationRestrictionEnabled}
                    onClick={() =>
                      setIsLocationRestrictionEnabled((prev) => {
                        const next = !prev
                        if (!next) {
                          setIsStateDropdownOpen(false)
                        }
                        return next
                      })
                    }
                    className={cn(
                      "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full p-0.5 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                      isLocationRestrictionEnabled ? "bg-[#121F2C]" : "bg-gray-300"
                    )}
                  >
                    <span
                      className={cn(
                        "pointer-events-none block h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200",
                        isLocationRestrictionEnabled ? "translate-x-5" : "translate-x-0"
                      )}
                    />
                  </button>
                </div>

                <div
                  className={cn("space-y-3", isLocationRestrictionEnabled ? "" : "pointer-events-none opacity-60")}
                >
                  <div className="space-y-2">
                    <label htmlFor="restricted-state" className="text-xs font-medium text-foreground">
                      Select states to restrict visibility
                    </label>
                    <div ref={stateDropdownRef} className="relative">
                      <button
                        id="restricted-state"
                        type="button"
                        disabled={!isLocationRestrictionEnabled}
                        aria-haspopup="listbox"
                        aria-expanded={isStateDropdownOpen}
                        onClick={() => setIsStateDropdownOpen((prev) => !prev)}
                        className="flex h-10 w-full items-center justify-between rounded-md border border-[#E5E7EB] bg-[#EFEFEF] px-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <span className={cn("truncate", restrictedStates.length === 0 ? "text-muted-foreground" : "")}>
                          {selectedStatesSummary}
                        </span>
                        <ChevronDown
                          className={cn(
                            "h-4 w-4 text-muted-foreground transition-transform",
                            isStateDropdownOpen ? "rotate-180" : ""
                          )}
                          aria-hidden
                        />
                      </button>

                      {isStateDropdownOpen && (
                        <div className="absolute left-0 top-full z-20 mt-1 max-h-60 w-full overflow-auto rounded-md border border-[#E5E7EB] bg-white py-1 shadow-md">
                          {INDIAN_STATES.map((state) => {
                            const isSelected = restrictedStates.includes(state)
                            return (
                              <button
                                key={state}
                                type="button"
                                aria-pressed={isSelected}
                                onClick={() => handleToggleRestrictedState(state)}
                                className="flex w-full items-center justify-between px-3 py-2 text-left text-sm text-foreground hover:bg-[#F3F4F6]"
                              >
                                <span>{state}</span>
                                <Check
                                  className={cn("h-4 w-4", isSelected ? "text-foreground" : "invisible")}
                                  aria-hidden
                                />
                              </button>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs font-medium text-foreground">Restricted States ({restrictedStates.length})</p>
                    <div className="flex min-h-10 flex-wrap gap-2 rounded-md border border-[#E5E7EB] bg-white px-2 py-2">
                      {restrictedStates.length === 0 ? (
                        <span className="text-xs text-muted-foreground">No states selected</span>
                      ) : (
                        restrictedStates.map((state) => (
                          <span
                            key={state}
                            className="inline-flex items-center gap-1 rounded bg-[#EFEFEF] px-2 py-1 text-xs text-foreground"
                          >
                            {state}
                            <button
                              type="button"
                              onClick={() => handleRemoveRestrictedState(state)}
                              className="text-muted-foreground hover:text-foreground"
                              aria-label={`Remove ${state}`}
                            >
                              <X className="h-3 w-3" aria-hidden />
                            </button>
                          </span>
                        ))
                      )}
                    </div>
                  </div>

                  <Button
                    type="button"
                    className="h-10 w-full rounded-md bg-[#121F2C] text-sm font-medium text-white shadow-none hover:bg-[#121F2C]/90"
                    onClick={handleSaveLocationRestrictions}
                  >
                    <Save className="mr-2 h-4 w-4" aria-hidden />
                    Save Restrictions
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Dialog
          open={successModalOpen}
          onOpenChange={(open) => {
            if (!open) closeSuccessModal()
          }}
        >
          <DialogContent
            hideDefaultClose
            className="max-w-md gap-0 overflow-hidden rounded-lg border border-[#E5E7EB] bg-white p-0 shadow-lg sm:max-w-md"
          >
            <div className="flex justify-end border-b border-transparent p-2 sm:p-3">
              <button
                type="button"
                onClick={closeSuccessModal}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-foreground transition-colors hover:bg-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                aria-label="Close"
              >
                <X className="h-5 w-5" strokeWidth={2} aria-hidden />
              </button>
            </div>
            <div className="flex flex-col items-center pb-2 pt-0">
              <div className="flex h-16 w-16 items-center justify-center" aria-hidden>
                <SuccessCheckCircleIcon className="h-full w-full shrink-0 text-[#00A14B]" />
              </div>
              <p className="mt-6 max-w-xs text-center text-base font-medium text-foreground">
                Changes have been saved successfully
              </p>
              <Button
                type="button"
                className="mt-8 h-11 w-full rounded-md bg-[#121F2C] text-sm font-medium text-white shadow-none hover:bg-[#121F2C]/90"
                onClick={closeSuccessModal}
              >
                Continue
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog
          open={logoutModalOpen}
          onOpenChange={(open) => {
            if (!open) closeLogoutModal()
          }}
        >
          <DialogContent
            hideDefaultClose
            className="max-w-md gap-0 overflow-hidden rounded-lg border border-neutral-900 bg-white p-0 shadow-lg sm:max-w-md"
          >
            <div className="flex justify-end border-b border-transparent p-2 sm:p-3">
              <button
                type="button"
                onClick={closeLogoutModal}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-foreground transition-colors hover:bg-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                aria-label="Close"
              >
                <X className="h-5 w-5" strokeWidth={2} aria-hidden />
              </button>
            </div>
            <div className="mx-2 flex flex-col items-center pb-2 pt-0">
              <LogoutWarningIcon className="h-16 w-16 shrink-0 text-[#962C2C]" aria-hidden />
              <p className="mt-6 text-center text-base font-medium text-foreground">Are you sure you want to Logout ?</p>
              <div className="mt-8 flex w-full gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 flex-1 rounded-md border border-neutral-900 bg-white text-sm font-medium text-foreground shadow-none hover:bg-neutral-50 hover:text-foreground"
                  onClick={closeLogoutModal}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  className="h-11 flex-1 rounded-md bg-[#121F2C] text-sm font-medium text-white shadow-none hover:bg-[#121F2C]/90"
                  onClick={() => void handleConfirmLogout()}
                >
                  Logout
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog
          open={highRestrictionWarningOpen}
          onOpenChange={(open) => {
            if (!open) handleEditHighRestrictionSelection()
          }}
        >
          <DialogContent
            hideDefaultClose
            className="max-w-md gap-0 overflow-hidden rounded-lg border border-[#E5E7EB] bg-white p-0 shadow-lg sm:max-w-md"
          >
            <div className="flex justify-end border-b border-transparent p-2 sm:p-3">
              <button
                type="button"
                onClick={handleEditHighRestrictionSelection}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-foreground transition-colors hover:bg-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                aria-label="Close"
              >
                <X className="h-5 w-5" strokeWidth={2} aria-hidden />
              </button>
            </div>
            <div className="flex flex-col items-center px-6 pb-8 pt-0 sm:px-8">
              <AlertTriangle className="h-16 w-16 shrink-0 text-[#F2C200]" strokeWidth={1.8} aria-hidden />
              <p className="mt-6 text-center text-base font-medium text-foreground">
                You are restricting visibility in over 80% of India.
              </p>
              <p className="mt-2 text-center text-sm text-muted-foreground sm:text-base">
                This may significantly reduce your product&apos;s reach.
              </p>
              <div className="mt-8 flex w-full gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 flex-1 rounded-md border border-black bg-white text-sm font-medium text-black shadow-none hover:bg-neutral-50 hover:text-black"
                  onClick={handleProceedWithHighRestrictionSave}
                >
                  Proceed Anyway
                </Button>
                <Button
                  type="button"
                  className="h-11 flex-1 rounded-md bg-[#121F2C] text-sm font-medium text-white shadow-none hover:bg-[#121F2C]/90"
                  onClick={handleEditHighRestrictionSelection}
                >
                  Edit Selection
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog
          open={discardModalOpen}
          onOpenChange={(open) => {
            if (!open) cancelDiscardPersonal()
          }}
        >
          <DialogContent
            hideDefaultClose
            className="max-w-md gap-0 overflow-hidden rounded-lg border border-[#E5E7EB] bg-white p-0 shadow-lg sm:max-w-md"
          >
            <div className="flex justify-end border-b border-transparent p-2 sm:p-3">
              <button
                type="button"
                onClick={cancelDiscardPersonal}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-foreground transition-colors hover:bg-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                aria-label="Close"
              >
                <X className="h-5 w-5" strokeWidth={2} aria-hidden />
              </button>
            </div>
            <div className="flex flex-col items-center px-6 pb-8 pt-0 sm:px-8">
              <div
                className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#E53935] text-3xl font-bold leading-none text-white"
                aria-hidden
              >
                !
              </div>
              <p className="mt-6 text-center text-base font-medium text-foreground">Unsaved changes will be lost</p>
              <div className="mt-8 flex w-full gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 flex-1 rounded-md border border-black bg-white text-sm font-medium text-black shadow-none hover:bg-neutral-50 hover:text-black"
                  onClick={confirmDiscardPersonal}
                >
                  Discard Changes
                </Button>
                <Button
                  type="button"
                  className="h-11 flex-1 rounded-md bg-[#121F2C] text-sm font-medium text-white shadow-none hover:bg-[#121F2C]/90"
                  onClick={cancelDiscardPersonal}
                >
                  Keep Editing
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
