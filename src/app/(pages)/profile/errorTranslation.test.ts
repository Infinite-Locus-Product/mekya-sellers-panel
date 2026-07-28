import { describe, expect, it } from "vitest"
import { ApiError } from "@/lib/auth/apiClient"
import {
  friendlyAvatarError,
  friendlyPasswordError,
  friendlyProfileUpdateError,
} from "./ProfileClient"

describe("friendlyProfileUpdateError", () => {
  it("translates a phone pattern violation via the structured field, not message text", () => {
    const err = new ApiError("String should match pattern '^\\d{10}$'", 422, "phone", "VALIDATION_FAILED")
    expect(friendlyProfileUpdateError(err)).toBe("Please enter a valid 10-digit phone number.")
  })

  it("falls back to a generic message for any other 422, regardless of wording", () => {
    const err = new ApiError("String should have at least 1 character", 422, "first_name", "VALIDATION_FAILED")
    expect(friendlyProfileUpdateError(err)).toBe("Please check your details and try again.")
  })

  it("falls back to a generic message for a 422 with no field at all", () => {
    const err = new ApiError("Update failed", 422, undefined, "VALIDATION_FAILED")
    expect(friendlyProfileUpdateError(err)).toBe("Please check your details and try again.")
  })

  it("passes through a non-validation error message (e.g. network/timeout) unchanged", () => {
    const err = new Error("Request timed out. Please try again.")
    expect(friendlyProfileUpdateError(err)).toBe("Request timed out. Please try again.")
  })

  it("uses a default message for a non-Error throw", () => {
    expect(friendlyProfileUpdateError("not an error")).toBe("Failed to save changes.")
  })
})

describe("friendlyAvatarError", () => {
  const AVATAR_MESSAGE = "Invalid file. Please upload a JPG, JPEG, or PNG image under 5 MB."

  it("translates the HTTPS/ownership backend message via status code", () => {
    const err = new ApiError("profile_image_url must be an HTTPS URL", 422, undefined, "VALIDATION_FAILED")
    expect(friendlyAvatarError(err)).toBe(AVATAR_MESSAGE)
  })

  it("translates the ownership-check message the same way", () => {
    const err = new ApiError("profile_image_url is not from the Mekya media store.", 422, undefined, "INVALID_IMAGE_URL")
    expect(friendlyAvatarError(err)).toBe(AVATAR_MESSAGE)
  })

  it("translates a presign filename validation error the same way", () => {
    const err = new ApiError(
      "Value error, Filename must end in .jpg, .jpeg, .png, or .webp",
      422,
      "filename",
      "VALIDATION_FAILED"
    )
    expect(friendlyAvatarError(err)).toBe(AVATAR_MESSAGE)
  })

  it("translates a presign file-size validation error the same way", () => {
    const err = new ApiError("Input should be less than or equal to 5242880", 422, "file_size_bytes", "VALIDATION_FAILED")
    expect(friendlyAvatarError(err)).toBe(AVATAR_MESSAGE)
  })

  it("passes through a non-validation failure (network/S3 error) unchanged", () => {
    const err = new Error("Upload failed (503)")
    expect(friendlyAvatarError(err)).toBe("Upload failed (503)")
  })

  it("uses a default message for a non-Error throw", () => {
    expect(friendlyAvatarError("nope")).toBe("Upload failed. Please try again.")
  })
})

describe("friendlyPasswordError", () => {
  it("shows Saleor's own wrong-current-password message as-is", () => {
    const err = new ApiError("Old password isn't valid.", 422, undefined, "INVALID_CREDENTIALS")
    expect(friendlyPasswordError(err)).toBe("Old password isn't valid.")
  })

  it("translates an empty-current-password rejection via field", () => {
    const err = new ApiError("String should have at least 1 character", 422, "old_password", "VALIDATION_FAILED")
    expect(friendlyPasswordError(err)).toBe("Please enter your current password.")
  })

  it("translates a new-password strength violation via field, regardless of wording", () => {
    const err = new ApiError("Value error, Password must contain an uppercase letter", 422, "new_password", "VALIDATION_FAILED")
    expect(friendlyPasswordError(err)).toBe("Please enter a new password that meets all the requirements above.")
  })

  it("translates the same-password (reuse) rejection, which has no field", () => {
    const err = new ApiError(
      "Value error, New password cannot be the same as the current password.",
      422,
      undefined,
      "VALIDATION_FAILED"
    )
    expect(friendlyPasswordError(err)).toBe("New password cannot be the same as the current password.")
  })

  it("never shows the raw Pydantic 'Value error,' prefix to the user", () => {
    const err = new ApiError("Value error, New password cannot be the same as the current password.", 422, undefined, "VALIDATION_FAILED")
    expect(friendlyPasswordError(err)).not.toContain("Value error")
  })

  it("passes through a non-validation error message unchanged", () => {
    const err = new Error("Request timed out. Please try again.")
    expect(friendlyPasswordError(err)).toBe("Request timed out. Please try again.")
  })

  it("uses a default message for a non-Error throw", () => {
    expect(friendlyPasswordError("nope")).toBe("Failed to change password.")
  })
})
