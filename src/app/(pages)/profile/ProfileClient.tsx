"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  Mail,
  Phone,
  Pencil,
  Save,
  UserCircle,
  Lock,
  Eye,
  EyeOff,
  Upload,
  LogOut,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  ChangePasswordTabLockIcon,
  LogoutWarningIcon,
  PasswordMatchCircleCheckIcon,
  PasswordRequirementMetIcon,
  SuccessCheckCircleIcon,
} from "@/assets/icons/profile";
import { TabList } from "@/components/shared/TabList";
import type { ProfilePageData } from "@/lib/data";

type PersonalFormState = ProfilePageData["personal"];

const MAX_IMAGE_SIZE_MB = 5;
const ACCEPTED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/jpg"];

const PASSWORD_REQUIREMENTS = [
  { id: "length", label: "Min. 8 characters", test: (s: string) => s.length >= 8 },
  { id: "upper", label: "Includes uppercase", test: (s: string) => /[A-Z]/.test(s) },
  { id: "lower", label: "Includes lowercase", test: (s: string) => /[a-z]/.test(s) },
  { id: "number", label: "Includes number", test: (s: string) => /\d/.test(s) },
  { id: "special", label: "special character (!@#$%^&*)", test: (s: string) => /[!@#$%^&*]/.test(s) },
] as const;

type TabId = "profile" | "security";

export interface ProfileClientProps {
  initialData: ProfilePageData;
  onLogout?: () => void | Promise<void>;
}

function isPersonalDirty(form: PersonalFormState, saved: PersonalFormState): boolean {
  return (
    form.firstName !== saved.firstName ||
    form.lastName !== saved.lastName ||
    form.email !== saved.email ||
    form.phoneCode !== saved.phoneCode ||
    form.phone !== saved.phone ||
    form.company !== saved.company ||
    form.designation !== saved.designation ||
    form.address !== saved.address ||
    form.bio !== saved.bio
  );
}

export function ProfileClient({ initialData, onLogout }: ProfileClientProps) {
  const router = useRouter();
  const { profile, personal } = initialData;
  const [activeTab, setActiveTab] = useState<TabId>("profile");
  const [savedPersonal, setSavedPersonal] = useState<PersonalFormState>(() => ({ ...personal }));
  const [personalForm, setPersonalForm] = useState<PersonalFormState>(() => ({ ...personal }));
  const [isPersonalEditing, setIsPersonalEditing] = useState(false);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [discardModalOpen, setDiscardModalOpen] = useState(false);
  const [pendingTab, setPendingTab] = useState<TabId | null>(null);

  const personalIsDirty = useMemo(
    () => isPersonalDirty(personalForm, savedPersonal),
    [personalForm, savedPersonal]
  );
  const [uploadImageOpen, setUploadImageOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isPasswordFormEnabled, setIsPasswordFormEnabled] = useState(false);

  const resetPasswordSection = useCallback(() => {
    setIsPasswordFormEnabled(false);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
  }, []);

  const passwordFormLocked = !isPasswordFormEnabled;

  const isPasswordValid = useMemo(() => {
    if (!currentPassword.trim()) return false;
    if (!PASSWORD_REQUIREMENTS.every(({ test }) => test(newPassword))) return false;
    if (newPassword !== confirmPassword) return false;
    return true;
  }, [currentPassword, newPassword, confirmPassword]);

  const handleUploadImageOpenChange = useCallback((open: boolean) => {
    setUploadImageOpen(open);
    if (!open) {
      setSelectedFile(null);
      setIsDragging(false);
    }
  }, []);

  const validateFile = useCallback((file: File): string | null => {
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      return "Supported image formats: PNG, JPG";
    }
    if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
      return `Max file size: ${MAX_IMAGE_SIZE_MB}MB`;
    }
    return null;
  }, []);

  const handleFileSelect = useCallback(
    (file: File | null) => {
      if (!file) {
        setSelectedFile(null);
        return;
      }
      const error = validateFile(file);
      if (error) return;
      setSelectedFile(file);
    },
    [validateFile]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFileSelect(file);
    },
    [handleFileSelect]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleUploadSubmit = useCallback(() => {
    if (selectedFile) {
      setUploadImageOpen(false);
      setSelectedFile(null);
    }
  }, [selectedFile]);

  const handleTabChange = useCallback(
    (next: TabId) => {
      if (next === activeTab) return;
      if (activeTab === "profile" && isPersonalEditing && personalIsDirty) {
        setPendingTab(next);
        setDiscardModalOpen(true);
        return;
      }
      if (activeTab === "security" && next !== "security") {
        resetPasswordSection();
      }
      setActiveTab(next);
    },
    [activeTab, isPersonalEditing, personalIsDirty, resetPasswordSection]
  );

  const handleStartEditPersonal = useCallback(() => {
    setIsPersonalEditing(true);
  }, []);

  const handleSavePersonal = useCallback(() => {
    setSavedPersonal({ ...personalForm });
    setIsPersonalEditing(false);
    setSuccessModalOpen(true);
  }, [personalForm]);

  const closeSuccessModal = useCallback(() => {
    setSuccessModalOpen(false);
  }, []);

  const closeLogoutModal = useCallback(() => {
    setLogoutModalOpen(false);
  }, []);

  const handleConfirmLogout = useCallback(async () => {
    setLogoutModalOpen(false);
    if (onLogout) {
      await onLogout();
      return;
    }
    router.push("/");
  }, [onLogout, router]);

  const confirmDiscardPersonal = useCallback(() => {
    setPersonalForm({ ...savedPersonal });
    setIsPersonalEditing(false);
    setDiscardModalOpen(false);
    if (pendingTab !== null) {
      setActiveTab(pendingTab);
      setPendingTab(null);
    }
  }, [pendingTab, savedPersonal]);

  const cancelDiscardPersonal = useCallback(() => {
    setDiscardModalOpen(false);
    setPendingTab(null);
  }, []);

  const updatePersonalField = useCallback((key: keyof PersonalFormState, value: string) => {
    setPersonalForm((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleUpdatePassword = useCallback(() => {
    if (passwordFormLocked || !isPasswordValid) return;
    toast.success("Your password has been changed successfully.", { icon: "🎉" });
    resetPasswordSection();
  }, [passwordFormLocked, isPasswordValid, resetPasswordSection]);

  return (
    <div className="flex min-h-0 w-full flex-col px-4 py-6 sm:px-6 md:px-8 lg:px-10 xl:px-12">
      <div className="flex w-full flex-col space-y-6 md:space-y-8 lg:space-y-10">
        <nav className="text-sm text-muted-foreground mb-4" aria-label="Breadcrumb">
          Seller Dashboard &gt; Profile
        </nav>
        <div className="flex flex-row justify-between items-center">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold text-foreground sm:text-2xl lg:text-2xl">
              Profile Management
            </h1>
            <p className="text-sm text-muted-foreground sm:text-base">
              Manage your profile account settings and preferences.
            </p>
          </div>
          <div className="flex flex-row justify-end items-center gap-2">
            <button
              type="button"
              onClick={() => setLogoutModalOpen(true)}
              className="flex flex-row justify-end items-center gap-2 bg-foreground text-background px-4 py-2 rounded-md text-sm font-medium"
              aria-label="Log out"
            >
              <LogOut className="h-4 w-4 shrink-0" aria-hidden />
              Logout
            </button>
          </div>
        </div>

        <div className="flex flex-row justify-between items-center">
          <TabList
            tabs={[
              { id: "profile", label: "Profile" },
              { id: "security", label: "Security" },
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
                "flex flex-row items-center gap-1 rounded-md text-sm font-medium transition-colors",
                "text-foreground  focus-visible:outline-none cursor-pointer",
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
            <Card className="rounded-lg w-full">
              <CardContent className="flex bg-[#F9FAF9] flex-col gap-5 p-6 sm:p-8">
                <div className="flex flex-row justify-start items-start gap-5">
                  <div className="relative shrink-0">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-background bg-sky-100 text-sky-800 shadow-sm sm:h-24 sm:w-24">
                      <span className="text-xl font-semibold sm:text-2xl">
                        {profile.name.split(" ").map((n) => n[0]).join("")}
                      </span>
                    </div>
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
                    <h2 className="text-lg font-bold text-foreground sm:text-xl">
                      {profile.name}
                    </h2>
                    <div className="flex gap-4">
                      <span className="flex items-center justify-start gap-2 text-sm text-muted-foreground border-r border-black pr-4">
                        <Mail className="h-4 w-4 shrink-0" aria-hidden />
                        <span className="truncate">{profile.email}</span>
                      </span>
                      <span className="flex items-center justify-start gap-2 text-sm text-muted-foreground">
                        <Phone className="h-4 w-4 shrink-0" aria-hidden />
                        {profile.phone}
                      </span>
                    </div>
                    <span className="inline-flex items-center justify-start w-fit rounded-full bg-foreground px-3 py-1 mt-2 text-sm font-medium text-background">
                      {profile.role}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Dialog open={uploadImageOpen} onOpenChange={handleUploadImageOpenChange}>
              <DialogContent
                hideDefaultClose
                className="max-w-lg gap-0 overflow-hidden rounded-lg border border-[#E5E7EB] bg-white sm:p-0 shadow-md sm:max-w-md"
              >
                <div className="flex items-center justify-between border-b border-[#E5E7EB] p-4">
                  <div className="flex items-center gap-2">
                    <Upload className="h-5 w-5 shrink-0 text-foreground" strokeWidth={2} aria-hidden />
                    <h2 className="text-base font-bold tracking-tight text-foreground sm:text-lg">
                      Upload Image
                    </h2>
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
                      isDragging
                        ? "border-[#111827] bg-neutral-50"
                        : "hover:border-[#9CA3AF] hover:bg-neutral-50/80"
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
                        const file = e.target.files?.[0];
                        handleFileSelect(file ?? null);
                      }}
                    />
                    <Upload
                      className="h-14 w-14 shrink-0 text-[#9CA3AF]"
                      strokeWidth={1.25}
                      aria-hidden
                    />
                    <div className="flex flex-col gap-2 text-center">
                      <span className="text-sm font-medium text-[#000000]">
                        {"Choose an image or drag & drop it here"}
                      </span>
                      <span className="text-xs leading-relaxed text-[#71717A] sm:text-sm">
                        Supported image formats: PNG, JPG
                      </span>
                      <span className="text-xs leading-relaxed text-[#71717A] sm:text-sm">
                        Max file size: {MAX_IMAGE_SIZE_MB}MB.
                      </span>
                    </div>
                    {selectedFile && (
                      <span className="text-xs font-medium text-[#111827]">{selectedFile.name}</span>
                    )}
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
                  >
                    Upload Image
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Card className="rounded-lg bg-[#F9FAF9] w-full">
              <CardContent className="flex flex-col gap-6 p-6 sm:p-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
                  <div className="flex flex-col gap-1">
                    <h3 className="flex items-center gap-2 text-lg font-semibold text-foreground sm:text-xl">
                      <UserCircle className="h-5 w-5 shrink-0" aria-hidden />
                      Personal Information
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Update your personal details and contact information.
                    </p>
                  </div>
                  {!isPersonalEditing ? (
                    <Button
                      type="button"
                      size="sm"
                      className="shrink-0 bg-transparent border-none text-foreground shadow-none hover:bg-transparent hover:text-foreground"
                      onClick={handleStartEditPersonal}
                    >
                      <Pencil className="h-4 w-4 mr-2 " aria-hidden />
                      Edit Details
                    </Button>
                  ) : null}
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
                      onChange={(e) => updatePersonalField("email", e.target.value)}
                      disabled={!isPersonalEditing}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label htmlFor="phone" className="text-sm font-medium text-foreground">
                      Phone Number
                    </label>
                    <div className="flex border border-[#E8E9E8] rounded-md overflow-hidden">
                      <Input
                        id="phone-code"
                        value={personalForm.phoneCode}
                        onChange={(e) => updatePersonalField("phoneCode", e.target.value)}
                        className="w-20 shrink-0 rounded-none"
                        aria-label="Country code"
                        disabled={!isPersonalEditing}
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
                    <label htmlFor="designation" className="text-sm font-medium text-foreground">
                      Designation
                    </label>
                    <Input
                      id="designation"
                      value={personalForm.designation}
                      onChange={(e) => updatePersonalField("designation", e.target.value)}
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
                  <div className="flex flex-col gap-2 md:col-span-2">
                    <label htmlFor="bio" className="text-sm font-medium text-foreground">
                      Bio
                    </label>
                    <textarea
                      id="bio"
                      rows={4}
                      value={personalForm.bio}
                      onChange={(e) => updatePersonalField("bio", e.target.value)}
                      disabled={!isPersonalEditing}
                      className="w-full min-w-0 resize-none rounded-md border border-input bg-[#E8E9E8] px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>
                </div>

                <Button
                  type="button"
                  className="w-full sm:w-auto sm:min-w-[180px]"
                  size="lg"
                  disabled={!isPersonalEditing || !personalIsDirty}
                  onClick={handleSavePersonal}
                >
                  <Save className="h-4 w-4 mr-2" aria-hidden />
                  Save Changes
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
                    "flex items-center gap-2 text-lg font-semibold sm:text-xl transition-colors",
                    passwordFormLocked
                      ? "text-muted-foreground opacity-70"
                      : "text-foreground"
                  )}
                >
                  <Lock className="h-5 w-5 shrink-0" aria-hidden />
                  Change Password
                </h3>
                <p
                  className={cn(
                    "text-sm transition-colors",
                    passwordFormLocked
                      ? "text-muted-foreground/70"
                      : "text-muted-foreground"
                  )}
                >
                  Update your password to keep your account secure.
                </p>
              </div>

              <div
                className={cn(
                  "flex flex-col gap-5 transition-opacity",
                  passwordFormLocked && "pointer-events-none opacity-50"
                )}
              >
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
                      {showCurrentPassword ? <EyeOff className="h-4 w-4" aria-hidden /> : <Eye className="h-4 w-4" aria-hidden />}
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
                      {showNewPassword ? <EyeOff className="h-4 w-4" aria-hidden /> : <Eye className="h-4 w-4" aria-hidden />}
                    </button>
                  </div>
                  <ul className="flex flex-col gap-1.5 pt-1">
                    {PASSWORD_REQUIREMENTS.map(({ id, label, test }) => {
                      const met = test(newPassword);
                      return (
                        <li
                          key={id}
                          className={cn("flex items-center gap-2 text-xs", met ? "text-emerald-600" : "text-muted-foreground")}
                        >
                          {met ? (
                            <PasswordRequirementMetIcon className="shrink-0" />
                          ) : (
                            <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded border border-current" aria-hidden />
                          )}
                          {label}
                        </li>
                      );
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
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" aria-hidden /> : <Eye className="h-4 w-4" aria-hidden />}
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
                disabled={passwordFormLocked || !isPasswordValid}
                onClick={handleUpdatePassword}
              >
                <Lock className="h-4 w-4 mr-2" aria-hidden />
                Update Password
              </Button>
            </CardContent>
          </Card>
        )}

        <Dialog
          open={successModalOpen}
          onOpenChange={(open) => {
            if (!open) closeSuccessModal();
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
              <div
                className="flex h-16 w-16 items-center justify-center"
                aria-hidden
              >
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
            if (!open) closeLogoutModal();
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
            <div className="flex flex-col items-center mx-2 pb-2 pt-0">
              <LogoutWarningIcon
                className="h-16 w-16 shrink-0 text-[#962C2C]"
                aria-hidden
              />
              <p className="mt-6 text-center text-base font-medium text-foreground">
                Are you sure you want to Logout ?
              </p>
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
          open={discardModalOpen}
          onOpenChange={(open) => {
            if (!open) cancelDiscardPersonal();
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
              <p className="mt-6 text-center text-base font-medium text-foreground">Discard changes?</p>
              <div className="mt-8 flex w-full gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 flex-1 rounded-md border border-black bg-white text-sm font-medium text-black shadow-none hover:bg-neutral-50 hover:text-black"
                  onClick={confirmDiscardPersonal}
                >
                  Yes
                </Button>
                <Button
                  type="button"
                  className="h-11 flex-1 rounded-md bg-[#121F2C] text-sm font-medium text-white shadow-none hover:bg-[#121F2C]/90"
                  onClick={cancelDiscardPersonal}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
