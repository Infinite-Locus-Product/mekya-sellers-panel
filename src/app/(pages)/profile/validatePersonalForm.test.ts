import { describe, expect, it } from "vitest"
import { validatePersonalForm } from "./ProfileClient"
import type { ProfilePageData } from "@/lib/data"

type PersonalFormState = ProfilePageData["personal"]

function personal(overrides: Partial<PersonalFormState> = {}): PersonalFormState {
  return {
    firstName: "Local",
    lastName: "Seller",
    email: "seller@example.com",
    phoneCode: "+91",
    phone: "7088777287",
    company: "Local Seller Co",
    address: "",
    gstin: "",
    ...overrides,
  }
}

describe("validatePersonalForm", () => {
  it("passes when all required fields are filled and phone is valid", () => {
    const saved = personal()
    expect(validatePersonalForm(personal(), saved)).toEqual({})
  })

  it("blocks actively clearing a required field that currently holds a value", () => {
    const saved = personal({ firstName: "Local" })
    const form = personal({ firstName: "" })
    expect(validatePersonalForm(form, saved)).toEqual({ firstName: "First Name is required." })
  })

  it("blocks actively clearing phone the same way", () => {
    const saved = personal({ phone: "7088777287" })
    const form = personal({ phone: "" })
    expect(validatePersonalForm(form, saved)).toEqual({ phone: "Phone Number is required." })
  })

  it("blocks actively clearing company the same way", () => {
    const saved = personal({ company: "Local Seller Co" })
    const form = personal({ company: "" })
    expect(validatePersonalForm(form, saved)).toEqual({ company: "Company Name is required." })
  })

  it("does NOT block saving an unrelated field when a required field was already blank and untouched", () => {
    // Account onboarded before these fields were required — company was
    // already blank in the saved state, and the user isn't touching it here,
    // only editing the address. This must not be blocked (PR #11 review).
    const saved = personal({ company: "", address: "" })
    const form = personal({ company: "", address: "12 MG Road" })
    expect(validatePersonalForm(form, saved)).toEqual({})
  })

  it("does NOT block an unrelated save when firstName/phone were already blank too", () => {
    const saved = personal({ firstName: "", phone: "", company: "", address: "" })
    const form = personal({ firstName: "", phone: "", company: "", address: "New Address" })
    expect(validatePersonalForm(form, saved)).toEqual({})
  })

  it("still validates phone FORMAT even if phone was previously blank and is now being filled in badly", () => {
    const saved = personal({ phone: "" })
    const form = personal({ phone: "12345" })
    expect(validatePersonalForm(form, saved)).toEqual({
      phone: "Please enter a valid 10-digit phone number.",
    })
  })

  it("allows backfilling a previously-blank required field with a valid value", () => {
    const saved = personal({ company: "" })
    const form = personal({ company: "New Company" })
    expect(validatePersonalForm(form, saved)).toEqual({})
  })

  it("rejects an invalid (non-10-digit) phone regardless of saved state", () => {
    const saved = personal({ phone: "7088777287" })
    const form = personal({ phone: "12345" })
    expect(validatePersonalForm(form, saved)).toEqual({
      phone: "Please enter a valid 10-digit phone number.",
    })
  })

  it("can report multiple errors at once when multiple required fields are actively cleared", () => {
    const saved = personal({ firstName: "Local", company: "Local Seller Co" })
    const form = personal({ firstName: "", company: "" })
    expect(validatePersonalForm(form, saved)).toEqual({
      firstName: "First Name is required.",
      company: "Company Name is required.",
    })
  })
})
