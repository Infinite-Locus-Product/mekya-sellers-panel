"use client"

import Image from "next/image"
import { useState } from "react"
import { ChevronDown, ChevronUp, Shirt } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { OrderDetailOrderItemsTitleIcon } from "@/assets/icons/order-management"
import type { B2BConfigurationDisplay, B2BFulfillmentStats, B2BOrderLineDisplay, B2BPartialColorRow } from "./types"
import { bundleKindLabel } from "./utils"

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
              className="inline-block h-4 w-4 shrink-0 rounded-full border border-black/10 shadow-sm"
              style={{ backgroundColor: row.colorHex }}
              aria-hidden
            />
            <span className="text-sm font-semibold text-foreground">{row.colorLabel}</span>
          </div>
          <div className="overflow-x-auto rounded-md border border-[#E0E0E0]">
            <table className="w-full min-w-[280px] border-collapse text-center text-sm">
              <thead>
                <tr className="border-b border-[#E0E0E0] bg-[#E8E9E8]">
                  {row.cells.map((c) => (
                    <th key={c.size} className="px-2 py-2 text-xs font-medium text-muted-foreground">
                      {c.size}
                    </th>
                  ))}
                  <th className="px-2 py-2 text-xs font-medium text-muted-foreground">QTY</th>
                  <th className="px-2 py-2 text-xs font-medium text-muted-foreground text-right">Total Price</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  {row.cells.map((c) => (
                    <td key={c.size} className="border-t border-[#E0E0E0] px-2 py-2 text-foreground">
                      {c.qty}
                    </td>
                  ))}
                  <td className="border-t border-[#E0E0E0] px-2 py-2 font-semibold text-foreground">{row.totalQty}</td>
                  <td className="border-t border-[#E0E0E0] px-2 py-2 text-right font-semibold text-foreground">
                    {formatCurrency(row.totalPrice)}
                  </td>
                </tr>
              </tbody>
            </table>
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
          <h4 className="text-sm font-semibold text-foreground">{config.title}</h4>
          <span className="inline-flex items-center gap-1 rounded-full bg-sky-100 px-2.5 py-0.5 text-[11px] font-medium text-sky-900">
            <Shirt className="h-3 w-3 shrink-0" aria-hidden />
            {config.itemsPerSet} Items/Set
          </span>
        </div>
        <span className="shrink-0 rounded-md border border-[#E0E0E0] bg-[#F7F7F7] px-2.5 py-1 text-[11px] font-medium text-foreground">
          {bundleKindLabel(config.bundleKind)}
        </span>
      </div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex min-w-0 flex-wrap items-center gap-3 text-sm">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-muted-foreground">{config.bundleKind === "set_purchase" ? "Set" : "Size"}</span>
            <div className="flex flex-wrap gap-1">
              {config.sizeLabels.map((size) => (
                <span
                  key={size}
                  className="inline-flex min-w-[1.75rem] items-center justify-center rounded border border-sky-200 bg-sky-50 px-2 py-0.5 text-xs font-medium text-sky-900"
                >
                  {size}
                </span>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-muted-foreground">
              {config.bundleKind === "single_size_bundle" && config.colorSwatches.length > 1
                ? "Color -"
                : `Color - ${config.colorLabel}`}
            </span>
            <span
              className="flex flex-wrap items-center gap-1"
              aria-label={
                config.colorSwatches.length > 1 ? "Selected colors" : `Color: ${config.colorLabel}`
              }
            >
              {config.colorSwatches.map((hex, i) => (
                <span
                  key={`${hex}-${i}`}
                  className="inline-block h-4 w-4 rounded-full border border-black/10 shadow-sm"
                  style={{ backgroundColor: hex }}
                  title={hex}
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
        <p className="mb-1.5 text-xs font-medium text-muted-foreground">Complete Set includes</p>
        <ul className="space-y-0.5 text-xs text-foreground">
          {config.includedLines.map((line) => (
            <li key={line.label}>• {line.label}</li>
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
  const [fulfillQtyInput, setFulfillQtyInput] = useState("")

  const parsedFulfillQty = Math.min(maxFulfill, Math.max(0, Number.parseInt(fulfillQtyInput, 10) || 0))
  const remainingAfterInput = Math.max(0, maxFulfill - parsedFulfillQty)

  const bumpFulfillQty = (delta: number) => {
    const next = Math.min(maxFulfill, Math.max(0, parsedFulfillQty + delta))
    setFulfillQtyInput(next === 0 ? "" : String(next))
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
        {fulfillmentSummary ? (
          <div className="rounded-md border border-[#E0E0E0] bg-[#FAFAFA] p-3 sm:p-4">
            <p className="mb-2 text-sm font-medium text-foreground">Fulfill Quantity</p>
            <div className="flex max-w-md items-stretch gap-1">
              <Input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="Enter Fulfilled Units"
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
                className="h-11 flex-1 rounded-md border-[#E0E0E0] bg-white pr-2"
                aria-label="Quantity to fulfill"
              />
              <div className="flex flex-col border border-l-0 border-[#E0E0E0] rounded-r-md bg-white">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-1/2 min-h-[22px] rounded-none rounded-tr-md px-2"
                  onClick={() => bumpFulfillQty(1)}
                  disabled={parsedFulfillQty >= maxFulfill}
                  aria-label="Increase fulfill quantity"
                >
                  <ChevronUp className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-1/2 min-h-[22px] rounded-none rounded-br-md border-t border-border px-2"
                  onClick={() => bumpFulfillQty(-1)}
                  disabled={parsedFulfillQty <= 0}
                  aria-label="Decrease fulfill quantity"
                >
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">{remainingAfterInput} Remaining</p>
          </div>
        ) : null}
      </CardHeader>
      <CardContent className="space-y-8 pt-0">
        {lines.map((line) => {
          const priceUnit = line.wholesalePriceUnitLabel ?? "per set"
          const partialRows = line.partialFulfillmentRows

          if (partialRows?.length) {
            return (
              <div
                key={`${line.sku}-${line.articleNumber}-partial`}
                className="space-y-4 rounded-md border border-[#E0E0E0] bg-[#FAFAFA] p-4 sm:p-5"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
                  <div className="flex shrink-0 flex-col gap-2 lg:w-[200px]">
                    <div className="relative aspect-[4/5] w-full max-w-[220px] overflow-hidden rounded-md border border-[#E0E0E0] bg-white lg:max-w-none">
                      <Image
                        src={line.mainImageSrc}
                        alt={line.productName}
                        fill
                        className="object-cover"
                        sizes="(max-width: 1024px) 220px, 200px"
                      />
                    </div>
                    <div className="flex gap-1.5">
                      {line.thumbnailSrcs.map((src, idx) => (
                        <div
                          key={`${src}-${idx}`}
                          className="relative h-12 w-12 shrink-0 overflow-hidden rounded border border-[#E0E0E0] bg-white"
                        >
                          <Image src={src} alt="" fill className="object-cover" sizes="48px" />
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <h3 className="text-base font-semibold leading-snug text-foreground">{line.productName}</h3>
                      {line.isCustomOrder ? (
                        <span className="shrink-0 rounded border border-[#E0E0E0] bg-white px-2 py-1 text-[11px] font-medium text-muted-foreground">
                          Custom order
                        </span>
                      ) : null}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span className="inline-flex rounded-full bg-sky-100 px-2.5 py-0.5 text-[11px] font-medium text-sky-900">
                        Article Number : {line.articleNumber}
                      </span>
                      <span className="inline-flex rounded-full bg-orange-100 px-2.5 py-0.5 text-[11px] font-medium text-orange-900">
                        SKU : {line.sku}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      WSP :{" "}
                      <span className="font-medium text-foreground">{formatCurrency(line.wholesalePricePerSet)}</span>{" "}
                      ({priceUnit})
                    </p>
                  </div>
                </div>
                <B2BPartialSizeGrid rows={partialRows} formatCurrency={formatCurrency} />
                <div className="flex flex-wrap justify-end gap-8 border-t border-[#E0E0E0] pt-3 text-sm">
                  <div>
                    <span className="text-muted-foreground">Item Qty - </span>
                    <span className="font-semibold text-foreground">{line.totalSets}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Item Amount - </span>
                    <span className="font-semibold text-foreground">{formatCurrency(line.lineTotalAmount)}</span>
                  </div>
                </div>
              </div>
            )
          }

          return (
            <div key={`${line.sku}-${line.articleNumber}`} className="space-y-4 rounded-md border border-[#E0E0E0] bg-[#FAFAFA] p-4 sm:p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
                <div className="flex shrink-0 flex-col gap-2 lg:w-[200px]">
                  <div className="relative aspect-[4/5] w-full max-w-[220px] overflow-hidden rounded-md border border-[#E0E0E0] bg-white lg:max-w-none">
                    <Image
                      src={line.mainImageSrc}
                      alt={line.productName}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 220px, 200px"
                    />
                  </div>
                  <div className="flex gap-1.5">
                    {line.thumbnailSrcs.map((src, idx) => (
                      <div
                        key={`${src}-${idx}`}
                        className="relative h-12 w-12 shrink-0 overflow-hidden rounded border border-[#E0E0E0] bg-white"
                      >
                        <Image src={src} alt="" fill className="object-cover" sizes="48px" />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="min-w-0 flex-1 space-y-2">
                  <h3 className="text-base font-semibold leading-snug text-foreground line-clamp-2">{line.productName}</h3>
                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex rounded-full bg-sky-100 px-2.5 py-0.5 text-[11px] font-medium text-sky-900">
                      Article Number : {line.articleNumber}
                    </span>
                    <span className="inline-flex rounded-full bg-orange-100 px-2.5 py-0.5 text-[11px] font-medium text-orange-900">
                      SKU : {line.sku}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    WSP :{" "}
                    <span className="font-medium text-foreground">{formatCurrency(line.wholesalePricePerSet)}</span>{" "}
                    (per set)
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                {line.configurations.map((config) => (
                  <B2BConfigurationCard key={config.id} config={config} formatCurrency={formatCurrency} />
                ))}
              </div>
              <div className="flex flex-wrap justify-end gap-8 border-t border-[#E0E0E0] pt-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Item Qty </span>
                  <span className="font-semibold text-foreground">{line.totalSets}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Item Amount </span>
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
