import { describe, it, expect } from "vitest"
import { EXCHANGE_STATUS_LABEL, getExchangeStatusFilterOptions } from "./constants"
import type { ExchangeOrderStatus } from "@/lib/api/orders"

/**
 * The Exchange tab's Status badge used to render `row.status` itself, so it printed the raw
 * enum code: a replacement at the pickup stage read "ready", lowercase, while the Orders tab
 * beside it called the very same stage "Ready for Pickup". Nothing was broken underneath —
 * the badge simply never had a label to show.
 */

/** The five values `exchange_order.status` is allowed to hold, enforced by
 *  ck_exchange_order_status in the database. */
const DB_ENUM: readonly ExchangeOrderStatus[] = [
    "pending",
    "processing",
    "ready",
    "shipped",
    "delivered",
    "cancelled",
]

describe("EXCHANGE_STATUS_LABEL", () => {
    it("names the pickup stage the way the rest of the portal does", () => {
        expect(EXCHANGE_STATUS_LABEL.ready).toBe("Ready for Pickup")
    })

    it("covers every status the database can store", () => {
        // A missing entry renders an empty badge, which is worse than the raw code it
        // replaced — the row would look like it had no status at all.
        for (const status of DB_ENUM) {
            expect(EXCHANGE_STATUS_LABEL[status], status).toBeTruthy()
        }
        expect(Object.keys(EXCHANGE_STATUS_LABEL).sort()).toEqual([...DB_ENUM].sort())
    })

    it("never shows a raw enum code", () => {
        // The defect itself: every label must differ from the code, and read as prose.
        for (const status of DB_ENUM) {
            const label = EXCHANGE_STATUS_LABEL[status]
            expect(label, status).not.toBe(status)
            expect(label[0], status).toBe(label[0]?.toUpperCase())
            expect(label, status).not.toMatch(/_/)
        }
    })

    it("matches the Orders vocabulary rather than inventing a third one", () => {
        expect(EXCHANGE_STATUS_LABEL).toMatchObject({
            pending: "Pending",
            processing: "Processing",
            ready: "Ready for Pickup",
            shipped: "Shipped",
            delivered: "Delivered",
            cancelled: "Cancelled",
        })
    })
})

describe("a cancelled exchange", () => {
    it("is offered on the Completed tab, not left in Pending", () => {
        // The defect: cancelling every line of a replacement order retired the exchange, but
        // it stayed in the seller's Pending queue as work still owed. "Completed" already
        // means every terminal outcome for Orders — delivered, cancelled and returned alike.
        const completed = getExchangeStatusFilterOptions("delivered").map((o) => o.value)
        const pending = getExchangeStatusFilterOptions("pending").map((o) => o.value)

        expect(completed).toContain("cancelled")
        expect(pending).not.toContain("cancelled")
    })

    it("is reachable from the All tab too", () => {
        expect(getExchangeStatusFilterOptions("all").map((o) => o.value)).toContain("cancelled")
    })
})

describe("the filter control keeps its own wording", () => {
    it('still says "Packed", as the Orders filter does', () => {
        // Deliberately not unified with the badge: the filter mirrors ORDER_STATUS_DISPLAY_LABEL,
        // where the pickup stage is offered as "Packed". Only the label differs — the value
        // sent to the API is the real code.
        const ready = getExchangeStatusFilterOptions("all").find((o) => o.value === "ready")

        expect(ready?.label).toBe("Packed")
        expect(ready?.value).toBe("ready")
    })

    it("sends real status codes as values, whatever the labels say", () => {
        const values = getExchangeStatusFilterOptions("all").map((o) => o.value)

        expect([...values].sort()).toEqual([...DB_ENUM].sort())
    })
})
