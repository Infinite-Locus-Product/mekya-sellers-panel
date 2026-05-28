import { describe, expect, it } from "vitest";
import { getCmsAnalyticsKpis, getCmsReels, getCmsViewsOverTime } from "./cms";

describe("cms dummy data", () => {
  it("getCmsReels returns rows with statuses and engagement rules", () => {
    const reels = getCmsReels();
    expect(reels.length).toBeGreaterThan(0);
    for (const r of reels) {
      expect(r.uploadedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
    const published = reels.find((r) => r.status === "published");
    expect(published?.views).not.toBeNull();
    expect(published?.engagement.likes).not.toBeNull();
    const draft = reels.find((r) => r.status === "draft");
    expect(draft?.views).toBeNull();
  });

  it("getCmsAnalyticsKpis returns engagement rate in 0-100", () => {
    const k = getCmsAnalyticsKpis();
    expect(k.engagementRatePercent).toBeGreaterThan(0);
    expect(k.engagementRatePercent).toBeLessThanOrEqual(100);
  });

  it("getCmsViewsOverTime returns 7 points", () => {
    expect(getCmsViewsOverTime()).toHaveLength(7);
  });
});
