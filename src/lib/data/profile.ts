/**
 * Profile data layer. API-ready: replace with fetch when backend is integrated.
 */

export interface ProfileData {
  name: string
  email: string
  phone: string
  role: string
}

export interface PersonalInfo {
  firstName: string
  lastName: string
  email: string
  phoneCode: string
  phone: string
  company: string
  designation: string
  address: string
  bio: string
}

export interface ProfilePageData {
  profile: ProfileData
  personal: PersonalInfo
}

const mockProfile: ProfileData = {
  name: "Seller Admin",
  email: "selleradmin@mekya.in",
  phone: "+91 9876543210",
  role: "Seller",
}

const mockPersonal: PersonalInfo = {
  firstName: "Seller",
  lastName: "Admin",
  email: "selleradmin@mekya.in",
  phoneCode: "+91",
  phone: "9876543210",
  company: "Mekya",
  designation: "Seller",
  address: "Ludhiana, Punjab, India",
  bio: "Experienced seller manager focused on catalog quality, orders, and customer satisfaction.",
}

export async function getProfile(): Promise<ProfilePageData> {
  return Promise.resolve({
    profile: mockProfile,
    personal: mockPersonal,
  })
}
