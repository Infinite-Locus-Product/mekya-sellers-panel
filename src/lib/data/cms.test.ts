import { describe, it } from "vitest";
import type { CmsReel, ReelStatus } from "./cms";

describe("cms types", () => {
  it("CmsReel type has required fields", () => {
    const reel: CmsReel = {
      id: "test-001",
      title: "Test reel",
      duration: "0:45",
      status: "draft" as ReelStatus,
      uploadedAt: "2025-06-14",
      uploadDate: "14 Jun 2025, 10:30 am",
      views: null,
      engagement: { likes: null, saves: null, shares: null },
    };
    // just checks the type compiles correctly
    void reel;
  });
});
