/**
 * Profile data layer. Provides an empty skeleton for SSR; ProfileClient fetches real data on mount.
 */

export interface ProfileData {
  name: string
  email: string
  phone: string
  role: string
  companyName?: string
  profile_image_url?: string | null
}

export interface PersonalInfo {
  firstName: string
  lastName: string
  email: string
  phoneCode: string
  phone: string
  company: string
  address: string
  gstin: string
}

export interface ProfilePageData {
  profile: ProfileData
  personal: PersonalInfo
}

export async function getProfile(): Promise<ProfilePageData> {
  return {
    profile: {
      name: "",
      email: "",
      phone: "",
      role: "",
      profile_image_url: null,
    },
    personal: {
      firstName: "",
      lastName: "",
      email: "",
      phoneCode: "+91",
      phone: "",
      company: "",
      address: "",
      gstin: "",
    },
  }
}
