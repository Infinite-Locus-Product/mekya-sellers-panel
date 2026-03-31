/**
 * Profile data layer. API-ready: replace with fetch when backend is integrated.
 */

export interface ProfileData {
  name: string;
  email: string;
  phone: string;
  role: string;
}

export interface PersonalInfo {
  firstName: string;
  lastName: string;
  email: string;
  phoneCode: string;
  phone: string;
  company: string;
  designation: string;
  address: string;
  bio: string;
}

export interface ProfilePageData {
  profile: ProfileData;
  personal: PersonalInfo;
}

const mockProfile: ProfileData = {
  name: "Shubham Sharma",
  email: "shubhamsharma@mekya.in",
  phone: "+91 8920851538",
  role: "Super Admin",
};

const mockPersonal: PersonalInfo = {
  firstName: "Shubham",
  lastName: "Sharma",
  email: "Shubhamsharma@mekya.in",
  phoneCode: "+91",
  phone: "8920851547",
  company: "Mekya",
  designation: "Super Admin",
  address: "Ludhiana, Punjab, India",
  bio: "Experienced platform administrator with 10+ years in e-commerce operations and user management.",
};

export async function getProfile(): Promise<ProfilePageData> {
  return Promise.resolve({
    profile: mockProfile,
    personal: mockPersonal,
  });
}
