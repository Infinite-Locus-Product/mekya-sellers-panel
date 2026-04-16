/**
 * Converts #rgb / #rrggbb to rgb() for SVG gradient stops (reliable stopOpacity).
 */
export function colorForLineAreaFill(color: string): string {
  const trimmed = color.trim()
  const m = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(trimmed)
  if (!m) return trimmed
  let hex = m[1]
  if (hex.length === 3) {
    hex = hex
      .split("")
      .map((ch) => ch + ch)
      .join("")
  }
  const n = Number.parseInt(hex, 16)
  const r = (n >> 16) & 255
  const g = (n >> 8) & 255
  const b = n & 255
  return `rgb(${r}, ${g}, ${b})`
}

interface LineChartAreaGradientProps {
  readonly id: string
  readonly lineColor: string
}

/** Vertical fade from line color to transparent under the series. */
export function LineChartAreaGradient({ id, lineColor }: LineChartAreaGradientProps) {
  const c = colorForLineAreaFill(lineColor)
  return (
    <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor={c} stopOpacity={0.42} />
      <stop offset="55%" stopColor={c} stopOpacity={0.14} />
      <stop offset="100%" stopColor={c} stopOpacity={0} />
    </linearGradient>
  )
}
