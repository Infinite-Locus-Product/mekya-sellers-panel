import { describe, it, expect } from "vitest"
import { getOrderStatusFilterOptions } from "./constants"
import { getOrderManagementTabs } from "./viewCopy"

const values = (subtab: Parameters<typeof getOrderStatusFilterOptions>[0], seg: "b2c" | "b2b") =>
    getOrderStatusFilterOptions(subtab, seg).map((o) => o.value)

describe("getOrderStatusFilterOptions", () => {
    it("offers no returned statuses on B2B", () => {
        // The B2B section has no Returns tab, so a seller cannot raise or work a return
        // there and the options led nowhere.
        for (const subtab of ["all", "pending", "processing", "ready", "shipped", "delivered"] as const) {
            const v = values(subtab, "b2b")
            expect(v, `subtab ${subtab}`).not.toContain("Returned")
            expect(v, `subtab ${subtab}`).not.toContain("Partially Returned")
        }
    })

    it("keeps them on B2C, which does have a Returns tab", () => {
        expect(values("delivered", "b2c")).toContain("Returned")
        expect(values("delivered", "b2c")).toContain("Partially Returned")
    })

    it("removes only the returned pair, nothing else", () => {
        const b2c = values("delivered", "b2c")
        const b2b = values("delivered", "b2b")
        const dropped = b2c.filter((v) => !b2b.includes(v))
        expect(dropped.sort()).toEqual(["Partially Returned", "Returned"])
    })

    it("defaults to the B2C list when no segment is given", () => {
        expect(getOrderStatusFilterOptions("delivered").map((o) => o.value)).toEqual(
            values("delivered", "b2c")
        )
    })

    it("stays consistent with the tabs each segment actually has", () => {
        // The justification for hiding these is that B2B has no Returns tab. If that ever
        // changes, this test fails and the filter should be revisited rather than silently
        // continuing to hide statuses the seller can now reach.
        const b2bTabs = getOrderManagementTabs("b2b").map((t) => t.id)
        expect(b2bTabs).not.toContain("returns")
        expect(getOrderManagementTabs("b2c").map((t) => t.id)).toContain("returns")
    })

    it("still labels Ready for Pickup as Packed", () => {
        const opt = getOrderStatusFilterOptions("ready", "b2b").find((o) => o.value === "Ready for Pickup")
        expect(opt?.label).toBe("Packed")
    })
})
