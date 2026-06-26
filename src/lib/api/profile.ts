import { authService } from "@/lib/auth/authService"

export interface UserProfileApiResponse {
  id: string
  saleor_id: string
  email: string
  first_name: string | null
  last_name: string | null
  phone: string | null
  company_name: string | null
  company_address: string | null
  gstin: string | null
  role: string | null
  business_type: string | null
  profile_image_url: string | null
  current_pincode: string | null
  is_active: boolean
}

export interface AvatarPresignResponse {
  upload_url: string
  profile_image_url: string
  content_type: string
  expires_in: number
}

export async function fetchUserProfile(): Promise<UserProfileApiResponse> {
  const res = await authService.api.get<UserProfileApiResponse>("/B2B/user/profile")
  return res.data
}

export async function updateUserProfile(payload: {
  first_name?: string | null
  last_name?: string | null
  phone?: string | null
  company_name?: string | null
  company_address?: string | null
  gstin?: string | null
  profile_image_url?: string | null
}): Promise<UserProfileApiResponse> {
  const res = await authService.api.patch<UserProfileApiResponse>("/B2B/user/profile", payload)
  return res.data
}

export async function presignAvatarUpload(
  filename: string,
  content_type: string,
  file_size_bytes: number,
): Promise<AvatarPresignResponse> {
  const res = await authService.api.post<AvatarPresignResponse>(
    "/B2B/user/profile/avatar/presign",
    { filename, content_type, file_size_bytes },
  )
  return res.data
}

export async function changePassword(payload: {
  old_password: string
  new_password: string
}): Promise<void> {
  await authService.api.post("/B2B/auth/change-password", payload)
}

export async function uploadFileToStorage(uploadUrl: string, file: File): Promise<void> {
  const res = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type || "application/octet-stream" },
    body: file,
  })
  if (!res.ok) throw new Error(`Upload failed (${res.status})`)
}
