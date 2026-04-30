"use client"

import Image from "next/image"
import { useState, type SVGProps } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { OrderDetailOrderItemsTitleIcon } from "@/assets/icons/order-management"
import type { B2BConfigurationDisplay, B2BFulfillmentStats, B2BOrderLineDisplay, B2BPartialColorRow } from "./types"
import { bundleKindLabel } from "./utils"

function FulfillQtySpinnerArrowUp({ className, ...props }: Readonly<SVGProps<SVGSVGElement>>) {
  return (
    <svg
      viewBox="0 0 10 6"
      width={10}
      height={6}
      aria-hidden
      className={cn("text-foreground", className)}
      {...props}
    >
      <path d="M5 0 L10 6 H0 Z" fill="currentColor" />
    </svg>
  )
}

function FulfillQtySpinnerArrowDown({ className, ...props }: Readonly<SVGProps<SVGSVGElement>>) {
  return (
    <svg
      viewBox="0 0 10 6"
      width={10}
      height={6}
      aria-hidden
      className={cn("text-foreground", className)}
      {...props}
    >
      <path d="M5 6 L10 0 H0 Z" fill="currentColor" />
    </svg>
  )
}

function B2BPartialSizeGrid({
  rows,
  formatCurrency,
}: Readonly<{
  rows: B2BPartialColorRow[]
  formatCurrency: (amount: number) => string
}>) {
  return (
    <div className="space-y-4">
      {rows.map((row) => (
        <div key={row.colorLabel} className="space-y-2">
          <div className="flex items-center gap-2">
            <span
              className="inline-block h-4 w-4 shrink-0 rounded-full border border-black/10 shadow-sm ring-1 ring-[#8B8B8B] ring-offset-2 ring-offset-white"
              style={{ backgroundColor: row.colorHex }}
              aria-hidden
            />
            <span className="text-sm font-semibold text-foreground">{row.colorLabel}</span>
          </div>
          <div className="overflow-hidden rounded-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[280px] text-center text-sm">
                <thead>
                  <tr className="bg-[#D5D5D5]">
                    {row.cells.map((c) => (
                      <th key={c.size} className="w-[46px] px-0 py-2 pl-4 text-left text-xs font-medium text-[#515151]">
                        {c.size}
                      </th>
                    ))}
                    <th className="px-3 py-2 pr-3 text-right text-xs font-medium text-[#515151]">QTY</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    {row.cells.map((c) => (
                      <td key={c.size} className="w-[46px] px-0 py-2 text-center text-foreground">
                        <span className="inline-flex h-[24px] w-[24px] items-center justify-center rounded-xs border border-[#C6C6C6] text-sm font-medium leading-none">
                          {c.qty}
                        </span>
                      </td>
                    ))}
                    <td className="px-3 py-2 pr-3 text-right font-medium text-foreground">
                      {row.totalQty}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-end px-3 py-2">
              <div className="text-right">
                <p className="text-sm font-medium text-foreground">{formatCurrency(row.totalPrice)}</p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function B2BConfigurationCard({
  config,
  formatCurrency,
}: Readonly<{
  config: B2BConfigurationDisplay
  formatCurrency: (amount: number) => string
}>) {
  return (
    <div className="rounded-md border border-[#E0E0E0] bg-white p-4 space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
          <h4 className="text-sm font-normal text-foreground">{config.title}</h4>
          <span className="inline-flex items-center gap-1 rounded-sm bg-[#DEF8FF] px-2.5 py-0.5 text-[11px] font-medium text-[#004B5E]">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8.00002 2.99951C7.79315 2.9995 7.59137 3.06364 7.42248 3.1831C7.25359 3.30256 7.1259 3.47145 7.05702 3.66651C7.00966 3.78733 6.91718 3.88499 6.79914 3.93888C6.68109 3.99276 6.54672 3.99865 6.42442 3.95528C6.30212 3.91192 6.20146 3.8227 6.14373 3.70649C6.08599 3.59028 6.0757 3.45618 6.11502 3.33251C6.21673 3.04521 6.38277 2.78496 6.60043 2.57163C6.8181 2.3583 7.08164 2.19754 7.37092 2.10163C7.66021 2.00571 7.96759 1.97718 8.26959 2.01821C8.57159 2.05924 8.86022 2.16874 9.11343 2.33836C9.36665 2.50799 9.57774 2.73323 9.7306 2.9969C9.88346 3.26057 9.97404 3.55569 9.99542 3.85971C10.0168 4.16373 9.96841 4.46862 9.85395 4.75109C9.7395 5.03356 9.562 5.28613 9.33502 5.48951L9.29402 5.52651C9.07402 5.72351 8.87502 5.90051 8.72402 6.09251C8.56402 6.29051 8.50102 6.45151 8.50102 6.59551C8.50102 6.81451 8.62102 7.01551 8.81402 7.11951L14.16 9.99951C14.4723 10.1683 14.7194 10.4364 14.8622 10.7614C15.005 11.0864 15.0354 11.4498 14.9486 11.794C14.8617 12.1382 14.6626 12.4436 14.3827 12.662C14.1027 12.8803 13.758 12.9991 13.403 12.9995H2.59502C2.23973 12.9995 1.89462 12.8809 1.61441 12.6625C1.3342 12.4441 1.13494 12.1383 1.04823 11.7938C0.961523 11.4492 0.992329 11.0856 1.13577 10.7606C1.2792 10.4355 1.52706 10.1677 1.84002 9.99951L6.26302 7.61951C6.37927 7.56138 6.51359 7.55081 6.63751 7.59003C6.76143 7.62925 6.8652 7.71518 6.92684 7.82961C6.98848 7.94404 7.00313 8.07798 6.9677 8.20303C6.93226 8.32809 6.84952 8.43443 6.73702 8.49951L2.31302 10.8795C2.19578 10.942 2.10285 11.042 2.04902 11.1635C1.9952 11.285 1.98358 11.4209 2.01602 11.5498C2.04846 11.6786 2.12309 11.7929 2.22803 11.8744C2.33296 11.9559 2.46215 12 2.59502 11.9995H13.405C13.5374 11.9991 13.6659 11.9546 13.7702 11.873C13.8745 11.7914 13.9487 11.6774 13.981 11.549C14.0133 11.4206 14.002 11.2851 13.9488 11.1639C13.8955 11.0427 13.8034 10.9426 13.687 10.8795L8.34002 7.99951C8.08662 7.86274 7.87483 7.66011 7.72699 7.413C7.57915 7.16589 7.50073 6.88347 7.50002 6.59551C7.50002 6.13351 7.71202 5.75651 7.94002 5.46951C8.14802 5.20851 8.40802 4.97651 8.61402 4.79251L8.66802 4.74451C8.81892 4.60939 8.92524 4.43163 8.97289 4.23476C9.02054 4.03788 9.00728 3.83118 8.93486 3.64201C8.86245 3.45283 8.73429 3.29011 8.56735 3.17538C8.40042 3.06065 8.20258 2.99932 8.00002 2.99951Z" fill="#004B5E" />
            </svg>

            {config.itemsPerSet} Items/Set
          </span>
        </div>
        <span className="shrink-0 rounded-sm border border-[#E0E0E0] px-2.5 py-1 text-[11px] font-medium text-foreground">
          {bundleKindLabel(config.bundleKind)}
        </span>
      </div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex min-w-0 flex-wrap items-center gap-3 text-sm">
          <div className="flex flex-wrap items-center gap-1.5">
            <span><svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8.65375 1.72264C9.5203 1.38933 10.4797 1.38933 11.3462 1.72264L17.5487 4.10764C17.9024 4.2438 18.2064 4.48389 18.4209 4.79629C18.6353 5.10869 18.75 5.47873 18.75 5.85764V14.1401C18.75 14.5191 18.6353 14.8891 18.4209 15.2015C18.2064 15.5139 17.9024 15.754 17.5487 15.8901L11.3462 18.2764C10.4797 18.6097 9.5203 18.6097 8.65375 18.2764L2.4525 15.8901C2.09866 15.7542 1.79434 15.5142 1.57966 15.2018C1.36499 14.8893 1.25005 14.5192 1.25 14.1401V5.85764C1.25005 5.47858 1.36499 5.10844 1.57966 4.79602C1.79434 4.48361 2.09866 4.2436 2.4525 4.10764L8.65375 1.72264ZM10.8975 2.88889C10.3198 2.66668 9.6802 2.66668 9.1025 2.88889L7.3725 3.55514L14.36 6.20014L16.795 5.15764L10.8975 2.88889ZM17.5 6.21389L10.625 9.16264V17.1976C10.7167 17.1743 10.8075 17.1451 10.8975 17.1101L17.1 14.7251C17.2179 14.6797 17.3192 14.5995 17.3906 14.4953C17.462 14.3911 17.5001 14.2677 17.5 14.1414V6.21389ZM9.375 17.1964V9.16264L2.5 6.21514V14.1401C2.49987 14.2665 2.53802 14.3899 2.60943 14.4941C2.68083 14.5983 2.78214 14.6784 2.9 14.7239L9.1025 17.1089C9.19167 17.1439 9.2825 17.1731 9.375 17.1964ZM3.205 5.15764L10 8.07014L12.705 6.91014L5.62125 4.22764L3.205 5.15764Z" fill="black" />
            </svg>
            </span>
            <span className="">{config.bundleKind === "set_purchase" ? "Set" : "Size"}</span>
            <div className="flex flex-wrap gap-1">
              {config.sizeLabels.map((size) => (
                <span
                  key={size}
                  className="inline-flex min-w-[1.75rem] items-center justify-center rounded border border-[#4A97AA] bg-[#DEF8FF] px-2 py-0.5 text-xs font-medium text-sky-900"
                >
                  {size}
                </span>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span><svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9.9974 18.3307C5.40573 18.3307 1.66406 14.5891 1.66406 9.9974C1.66406 5.40573 5.40573 1.66406 9.9974 1.66406C14.5891 1.66406 18.3307 5.03073 18.3307 9.16406C18.3307 11.9224 16.0891 14.1641 13.3307 14.1641H11.8557C11.6224 14.1641 11.4391 14.3474 11.4391 14.5807C11.4391 14.6807 11.4807 14.7724 11.5474 14.8557C11.8891 15.2474 12.0807 15.7391 12.0807 16.2474C12.0807 16.7999 11.8612 17.3298 11.4705 17.7205C11.0798 18.1112 10.5499 18.3307 9.9974 18.3307ZM9.9974 3.33073C6.3224 3.33073 3.33073 6.3224 3.33073 9.9974C3.33073 13.6724 6.3224 16.6641 9.9974 16.6641C10.2307 16.6641 10.4141 16.4807 10.4141 16.2474C10.4115 16.1393 10.3701 16.0358 10.2974 15.9557C9.95573 15.5724 9.7724 15.0807 9.7724 14.5807C9.7724 14.0282 9.99189 13.4983 10.3826 13.1076C10.7733 12.7169 11.3032 12.4974 11.8557 12.4974H13.3307C15.1724 12.4974 16.6641 11.0057 16.6641 9.16406C16.6641 5.9474 13.6724 3.33073 9.9974 3.33073Z" fill="black" />
              <path d="M5.41406 10.8359C6.10442 10.8359 6.66406 10.2763 6.66406 9.58594C6.66406 8.89558 6.10442 8.33594 5.41406 8.33594C4.72371 8.33594 4.16406 8.89558 4.16406 9.58594C4.16406 10.2763 4.72371 10.8359 5.41406 10.8359Z" fill="black" />
              <path d="M7.91406 7.5C8.60442 7.5 9.16406 6.94036 9.16406 6.25C9.16406 5.55964 8.60442 5 7.91406 5C7.22371 5 6.66406 5.55964 6.66406 6.25C6.66406 6.94036 7.22371 7.5 7.91406 7.5Z" fill="black" />
              <path d="M12.0859 7.5C12.7763 7.5 13.3359 6.94036 13.3359 6.25C13.3359 5.55964 12.7763 5 12.0859 5C11.3956 5 10.8359 5.55964 10.8359 6.25C10.8359 6.94036 11.3956 7.5 12.0859 7.5Z" fill="black" />
              <path d="M14.5859 10.8359C15.2763 10.8359 15.8359 10.2763 15.8359 9.58594C15.8359 8.89558 15.2763 8.33594 14.5859 8.33594C13.8956 8.33594 13.3359 8.89558 13.3359 9.58594C13.3359 10.2763 13.8956 10.8359 14.5859 10.8359Z" fill="black" />
            </svg>
            </span>
            <span className="">
              {config.bundleKind === "single_size_bundle" && config.colorSwatches.length > 1
                ? "Color -"
                : `Color - ${config.colorLabel}`}
            </span>
            <span
              className="flex items-center -space-x-2"
              aria-label={
                config.colorSwatches.length > 1 ? "Selected colors" : `Color: ${config.colorLabel}`
              }
            >
              {config.colorSwatches.map((hex, i) => (
                <span
                  key={`${hex}-${i}`}
                  className="relative inline-block h-6 w-6 rounded-full border border-black/20 ring-2 ring-[#EEEEEE] shadow-sm"
                  style={{ backgroundColor: hex }}
                  title={hex}
                  aria-hidden
                />
              ))}
            </span>
          </div>
        </div>
        <p className="text-sm font-medium text-foreground whitespace-nowrap">
          {config.setsOrdered} Sets({formatCurrency(config.lineTotal)})
        </p>
      </div>
      <div className="rounded-md bg-[#F0F0F0] px-3 py-2.5">
        <p className="mb-1.5 text-xs font-normal">Complete Set includes</p>
        <ul className="flex flex-nowrap items-center gap-2 overflow-x-auto whitespace-nowrap text-xs text-foreground">
          {config.includedLines.map((line) => (
            <li key={line.label} className="shrink-0">
              <span className="inline-flex items-center gap-1">
                <span className=""><svg width="8" height="8" viewBox="0 0 8 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="8" height="8" rx="4" fill="#004B5E" />
                </svg>
                </span>
                <span className="text-foreground">{line.label}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export function B2BOrderLinesSection({
  lines,
  formatCurrency,
  fulfillmentSummary,
}: Readonly<{
  lines: B2BOrderLineDisplay[]
  formatCurrency: (amount: number) => string
  fulfillmentSummary?: B2BFulfillmentStats
}>) {
  const configurationCount = lines.reduce((sum, line) => sum + line.configurations.length, 0)
  const productCount = lines.length
  const isPartialLayout = Boolean(fulfillmentSummary)
  const maxFulfill = fulfillmentSummary?.pending ?? 0
  const [fulfillQtyInput, setFulfillQtyInput] = useState(() => {
    if (!fulfillmentSummary) return ""
    const demo = Math.min(10, fulfillmentSummary.pending)
    return demo > 0 ? String(demo) : ""
  })
  const [selectedThumbnailByLine, setSelectedThumbnailByLine] = useState<Record<string, number>>({})

  const parsedFulfillQty = Math.min(maxFulfill, Math.max(0, Number.parseInt(fulfillQtyInput, 10) || 0))
  const remainingAfterInput = Math.max(0, maxFulfill - parsedFulfillQty)

  const bumpFulfillQty = (delta: number) => {
    const next = Math.min(maxFulfill, Math.max(0, parsedFulfillQty + delta))
    setFulfillQtyInput(next === 0 ? "" : String(next))
  }

  const getLineGallery = (line: B2BOrderLineDisplay, lineId: string) => {
    const selectedThumbnailIndex = selectedThumbnailByLine[lineId]
    const hasValidSelection =
      Number.isInteger(selectedThumbnailIndex) &&
      selectedThumbnailIndex >= 0 &&
      selectedThumbnailIndex < line.thumbnailSrcs.length

    if (!hasValidSelection) {
      return {
        mainImageSrc: line.mainImageSrc,
        thumbnailSrcs: [...line.thumbnailSrcs],
      }
    }

    const activeIndex = selectedThumbnailIndex as number
    const swappedThumbnails = [...line.thumbnailSrcs]
    swappedThumbnails[activeIndex] = line.mainImageSrc

    return {
      mainImageSrc: line.thumbnailSrcs[activeIndex],
      thumbnailSrcs: swappedThumbnails,
    }
  }

  const subtitle = isPartialLayout
    ? `${productCount} Product${productCount === 1 ? "" : "s"} in this order`
    : `${configurationCount} item(s) in this order`

  return (
    <Card className="border border-[#E0E0E0] bg-white shadow-none">
      <CardHeader className="space-y-2 pb-2">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 space-y-1">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <OrderDetailOrderItemsTitleIcon />
              Order Item
            </CardTitle>
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          </div>
          {fulfillmentSummary ? (
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <span className="inline-flex rounded-full bg-[#E8E9E8] px-3 py-1 text-xs font-medium text-foreground">
                {fulfillmentSummary.fulfilled} / {fulfillmentSummary.totalItems} Fulfilled
              </span>
              <span className="inline-flex rounded-full bg-[#E8E9E8] px-3 py-1 text-xs font-medium text-foreground">
                {fulfillmentSummary.pending} Pending
              </span>
            </div>
          ) : null}
        </div>
        <hr
          className="-mx-6 my-2 w-auto border-0 border-t border-[#E0E0E0]"
          aria-hidden
        />
        {fulfillmentSummary ? (
          <div className=" border border-[#E0E0E0] bg-[#FBFBFB] p-3 sm:p-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end  item-center sm:justify-between">
              <div className="min-w-0 flex-1">
                <p className="mb-2 text-sm font-medium text-foreground">Fulfill Quantity</p>
                <div className="flex h-11 max-w-xs overflow-hidden rounded-sm bg-[#E8E9E8]">
                  <Input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder="Enter units"
                    value={fulfillQtyInput}
                    onChange={(e) => {
                      const raw = e.target.value.replaceAll(/\D/g, "")
                      if (raw === "") {
                        setFulfillQtyInput("")
                        return
                      }
                      const n = Number.parseInt(raw, 10)
                      if (Number.isNaN(n)) return
                      setFulfillQtyInput(String(Math.min(maxFulfill, n)))
                    }}
                    className="h-11 min-w-0 flex-1 rounded-none border-0 bg-[#E8E9E8] px-3 text-foreground shadow-none placeholder:text-muted-foreground focus:outline-none disabled:cursor-not-allowed"
                    aria-label="Quantity to fulfill"
                    disabled={parsedFulfillQty >= maxFulfill}
                  />
                  <div className="flex h-full w-10 shrink-0 flex-col">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-1/2 min-h-0 flex-1 items-end rounded-none px-0 disabled:cursor-not-allowed pb-1 cursor-pointer"
                      onClick={() => bumpFulfillQty(1)}
                      disabled={parsedFulfillQty >= maxFulfill}
                      aria-label="Increase fulfill quantity"
                    >
                      <FulfillQtySpinnerArrowUp />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-1/2 min-h-0 flex-1 items-start rounded-none border-0 px-0 disabled:cursor-not-allowed pt-1 cursor-pointer"
                      onClick={() => bumpFulfillQty(-1)}
                      disabled={parsedFulfillQty <= 0}
                      aria-label="Decrease fulfill quantity"
                    >
                      <FulfillQtySpinnerArrowDown />
                    </Button>
                  </div>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">{remainingAfterInput} Remaining</p>
              </div>
              <div className="shrink-0 self-center text-left sm:text-right flex flex-col items-center gap-1">
                <p className="text-sm font-normal text-foreground">Preview</p>
                <p className="text-sm font-normal text-[#004C5E]">
                  +{parsedFulfillQty} unit{parsedFulfillQty === 1 ? "" : "s"}
                </p>
              </div>
            </div>
          </div>
        ) : null}
      </CardHeader>
      <CardContent className="space-y-8 pt-0">
        {lines.map((line) => {
          const lineId = `${line.sku}-${line.articleNumber}`
          const gallery = getLineGallery(line, lineId)
          const priceUnit = line.wholesalePriceUnitLabel ?? "per set"
          const partialRows = line.partialFulfillmentRows

          if (partialRows?.length) {
            return (
              <div
                key={`${lineId}-partial`}
                className="border border-[#E0E0E0] bg-[#FAFAFA] p-4 sm:p-5"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
                  <div className="flex shrink-0 flex-col gap-2 lg:w-[200px]">
                    <div className="relative aspect-[4/5] w-full max-w-[220px] overflow-hidden rounded-md border border-[#E0E0E0] bg-white lg:max-w-none">
                      <Image
                        src={gallery.mainImageSrc}
                        alt={line.productName}
                        fill
                        className="object-cover"
                        sizes="(max-width: 1024px) 220px, 200px"
                      />
                    </div>
                    <div className="flex gap-1.5">
                      {gallery.thumbnailSrcs.map((src, idx) => (
                        <button
                          key={`${lineId}-thumb-${idx}-${src}`}
                          type="button"
                          className="relative h-12 w-12 shrink-0 overflow-hidden rounded border border-[#E0E0E0] bg-white"
                          onClick={() =>
                            setSelectedThumbnailByLine((prev) => ({ ...prev, [lineId]: idx }))
                          }
                          aria-label={`Show image ${idx + 1} for ${line.productName}`}
                        >
                          <Image src={src} alt="" fill className="object-cover" sizes="48px" />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="min-w-0 flex-1 space-y-4 ml-4">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <h3 className="text-base font-semibold leading-snug text-foreground">{line.productName}</h3>
                        {line.isCustomOrder ? (
                          <span className="shrink-0 rounded border border-[#E0E0E0] px-2 py-1 text-[11px] font-medium">
                            Custom order
                          </span>
                        ) : null}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <span className="inline-flex rounded-xs bg-[#DEF8FF] px-2.5 py-0.5 text-[11px] font-normal text-[#004B5E]">
                          Article Number : {line.articleNumber}
                        </span>
                        <span className="border border-[#004B5EB2]"></span>
                        <span className="inline-flex rounded-xs bg-[#FFCEAF] px-2.5 py-0.5 text-[11px] font-normal text-[#552000]">
                          SKU : {line.sku}
                        </span>
                      </div>
                      <p className="text-sm">
                        WSP :{" "}
                        <span className="font-medium">{formatCurrency(line.wholesalePricePerSet)}</span>{" "}
                        <span className="text-[#757575]">(per set)</span>
                      </p>
                    </div>
                    <B2BPartialSizeGrid rows={partialRows} formatCurrency={formatCurrency} />
                  </div>
                </div>
                <div className="flex flex-col justify-end gap-2 border-t border-[#E0E0E0] -mx-5 pt-3 text-sm">
                  <div className="mx-6 flex justify-end gap-1">
                    <span className="">Item Qty - </span>
                    <span className="font-semibold text-foreground">{line.totalSets}</span>
                  </div>
                  <div className="mx-6 flex justify-end gap-1">
                    <span className="">Item Amount - </span>
                    <span className="font-semibold text-foreground">{formatCurrency(line.lineTotalAmount)}</span>
                  </div>
                </div>
              </div>
            )
          }

          return (
            <div key={lineId} className="space-y-4 rounded-md border border-[#E0E0E0] bg-[#FAFAFA] p-4 sm:p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
                <div className="flex shrink-0 flex-col gap-2 lg:w-[200px]">
                  <div className="relative aspect-[4/5] w-full max-w-[220px] overflow-hidden rounded-md border border-[#E0E0E0] bg-white lg:max-w-none">
                    <Image
                      src={gallery.mainImageSrc}
                      alt={line.productName}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 220px, 200px"
                    />
                  </div>
                  <div className="flex gap-1.5">
                    {gallery.thumbnailSrcs.map((src, idx) => (
                      <button
                        key={`${lineId}-thumb-${idx}-${src}`}
                        type="button"
                        className="relative h-12 w-12 shrink-0 overflow-hidden rounded border border-[#E0E0E0] bg-white"
                        onClick={() =>
                          setSelectedThumbnailByLine((prev) => ({ ...prev, [lineId]: idx }))
                        }
                        aria-label={`Show image ${idx + 1} for ${line.productName}`}
                      >
                        <Image src={src} alt="" fill className="object-cover" sizes="48px" />
                      </button>
                    ))}
                  </div>
                </div>
                <div className="min-w-0 flex-1 space-y-3">
                  <div className="space-y-2">
                    <h3 className="text-base font-medium leading-snug text-foreground line-clamp-2">{line.productName}</h3>
                    <div className="flex flex-wrap gap-2">
                      <span className="inline-flex rounded-xs bg-[#DEF8FF] px-2.5 py-0.5 text-[11px] font-normal text-[#004B5E]">
                        Article Number : {line.articleNumber}
                      </span>
                      <span className="border border-[#004B5EB2]"></span>
                      <span className="inline-flex rounded-xs bg-[#FFCEAF] px-2.5 py-0.5 text-[11px] font-normal text-[#552000]">
                        SKU : {line.sku}
                      </span>
                    </div>
                    <p className="text-sm">
                      WSP :{" "}
                      <span className="font-medium">{formatCurrency(line.wholesalePricePerSet)}</span>{" "}
                      <span className="text-[#757575]">(per set)</span>
                    </p>
                  </div>
                  <div className="space-y-3">
                    {line.configurations.map((config) => (
                      <B2BConfigurationCard key={config.id} config={config} formatCurrency={formatCurrency} />
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex flex-col justify-end gap-2 border-t border-[#E0E0E0] -mx-5 pt-3 text-sm">
                <div className="mx-6 flex justify-end gap-1">
                  <span className="">Item Qty - </span>
                  <span className="font-semibold text-foreground">{line.totalSets}</span>
                </div>
                <div className="mx-6 flex justify-end gap-1">
                  <span className="">Item Amount - </span>
                  <span className="font-semibold text-foreground">{formatCurrency(line.lineTotalAmount)}</span>
                </div>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
