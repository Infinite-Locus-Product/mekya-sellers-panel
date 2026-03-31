import { describe, it, expect } from "vitest";
import { getUsers } from "./users";

describe("users data layer", () => {
  it("getUsers returns a non-empty array", async () => {
    const users = await getUsers();
    expect(Array.isArray(users)).toBe(true);
    expect(users.length).toBeGreaterThan(0);
  });

  it("getUsers returns users with required fields", async () => {
    const users = await getUsers();
    const first = users[0];
    expect(first).toHaveProperty("id");
    expect(first).toHaveProperty("vendor");
    expect(first).toHaveProperty("email");
    expect(first).toHaveProperty("role");
    expect(first).toHaveProperty("status");
    expect(first).toHaveProperty("onboardingdate");
  });
});
