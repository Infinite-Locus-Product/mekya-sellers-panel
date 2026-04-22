"use client"

import { Clock } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  orderFulfillmentTimelineIcons,
  OrderDetailFulfillmentTimelineTitleIcon,
} from "@/assets/icons/order-management"
import type { OrderType } from "@/lib/tableTypes"
import type { FulfillmentTimelineItem } from "./types"
import { filterFulfillmentTimeline, READY_FOR_DISPATCH } from "./utils"

export function FulfillmentTimelineSection({
  timeline,
  orderType,
}: Readonly<{
  timeline: FulfillmentTimelineItem[]
  orderType: OrderType
}>) {
  const segmentHint =
    orderType === "B2B"
      ? "Wholesale order lifecycle and dispatch milestones."
      : "Consumer order from placement through delivery."

  return (
    <section aria-labelledby="order-detail-fulfillment-heading" className="contents">
      <Card className="flex flex-col overflow-hidden rounded-[5px] border border-border bg-[#E8E9E8]/30 shadow-none min-[1920px]:min-h-[341px]">
        <CardHeader className="shrink-0 space-y-0 pb-0">
          <CardTitle
            id="order-detail-fulfillment-heading"
            className="flex items-center gap-2 text-base sm:text-lg"
          >
            <OrderDetailFulfillmentTimelineTitleIcon />
            Fulfillment Timeline
          </CardTitle>
          <p className="mt-2 text-xs text-muted-foreground sm:text-sm">{segmentHint}</p>
          <hr className="mt-4 border-0 border-t border-border" />
        </CardHeader>
        <CardContent className="min-h-0 flex-1 overflow-x-hidden overflow-y-visible pt-0 pb-4 sm:pb-6">
          <div className="relative w-full min-w-0 px-3 pt-4 sm:px-4 sm:pt-5 md:px-6 lg:px-10 xl:px-14 2xl:px-20">
            <div className="flex w-full min-w-0 flex-nowrap items-start justify-between gap-1 pb-6 sm:gap-2 md:gap-3 lg:gap-4">
              {filterFulfillmentTimeline(timeline).map((item, index, arr) => {
                const Icon =
                  orderFulfillmentTimelineIcons[item.stage as keyof typeof orderFulfillmentTimelineIcons] || Clock
                const isLast = index === arr.length - 1
                const isCompleted = item.completed
                const isCurrent = item.current
                const showReadyForDispatchRing = isCurrent && item.stage === READY_FOR_DISPATCH
                const segmentToNextIsComplete = isCompleted

                return (
                  <div
                    key={`${item.stage}-${index}`}
                    className="relative flex min-w-0 flex-1 basis-0 flex-col items-center"
                  >
                    <p className="mb-1 w-full max-w-full truncate px-0.5 text-center text-[10px] font-medium leading-tight sm:text-xs md:text-sm lg:text-base">
                      {item.stage}
                    </p>
                    <div className="relative flex h-12 w-full min-w-0 items-center justify-center overflow-visible sm:h-[3.75rem] min-[1920px]:h-[88px]">
                      {!isLast && (
                        <div
                          className={`absolute left-1/2 top-1/2 z-0 h-0.5 w-full -translate-y-1/2 ${segmentToNextIsComplete ? "bg-[#5BD387]" : "bg-gray-300"
                            }`}
                          aria-hidden
                        />
                      )}
                      {isCurrent && showReadyForDispatchRing ? (
                        <div className="relative z-10 box-border rounded-full border-2 border-green-500 bg-white p-0.5 sm:p-1 min-[1920px]:p-1.5" aria-current="step">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#5BD387] sm:h-12 sm:w-12 min-[1920px]:h-[68px] min-[1920px]:w-[68px]">
                            <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center sm:h-5 sm:w-5 min-[1920px]:h-[28px] min-[1920px]:w-[28px] [&>svg]:block [&>svg]:h-3.5 [&>svg]:w-3.5 sm:[&>svg]:h-5 sm:[&>svg]:w-5 min-[1920px]:[&>svg]:h-[28px] min-[1920px]:[&>svg]:w-[28px]">
                              <Icon className="text-gray-900" aria-hidden />
                            </span>
                          </div>
                        </div>
                      ) : isCurrent ? (
                        <div className="relative z-10 rounded-full border border-[#5BD387] p-0.5 sm:p-1 min-[1920px]:p-1">
                          <div
                            className="relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#5BD387] sm:h-12 sm:w-12 min-[1920px]:h-[68px] min-[1920px]:w-[68px]"
                            aria-current="step"
                          >
                            <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center sm:h-5 sm:w-5 min-[1920px]:h-[28px] min-[1920px]:w-[28px] [&>svg]:block [&>svg]:h-3.5 [&>svg]:w-3.5 sm:[&>svg]:h-5 sm:[&>svg]:w-5 min-[1920px]:[&>svg]:h-[28px] min-[1920px]:[&>svg]:w-[28px]">
                              <Icon className="text-gray-900" aria-hidden />
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div
                          className={`relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full sm:h-12 sm:w-12 min-[1920px]:h-[68px] min-[1920px]:w-[68px] ${isCompleted ? "bg-[#5BD387]" : "bg-[#E8E9E8]"
                            }`}
                        >
                          <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center sm:h-5 sm:w-5 min-[1920px]:h-[28px] min-[1920px]:w-[28px] [&>svg]:block [&>svg]:h-3.5 [&>svg]:w-3.5 sm:[&>svg]:h-5 sm:[&>svg]:w-5 min-[1920px]:[&>svg]:h-[28px] min-[1920px]:[&>svg]:w-[28px]">
                            <Icon className={isCompleted ? "text-white" : "text-gray-400"} aria-hidden />
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="mt-1.5 w-full min-w-0 text-center sm:mt-2">
                      <p className="truncate text-[10px] text-muted-foreground sm:text-xs">{item.date?.trim() ? item.date : "—"}</p>
                      <p className="truncate text-[10px] text-muted-foreground sm:text-xs">{item.time?.trim() ? item.time : "—"}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  )
}
