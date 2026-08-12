/**
 * Shared look for the compact filter controls that sit together in page and modal
 * headers — currently the channel select and the date-range button.
 *
 * They render as two different elements (a Radix select trigger and a plain button),
 * so height, background and typography have to come from one place; when each owned
 * its own copy they drifted apart and the pair rendered at different heights and in
 * different greys. Callers add only what is genuinely per-control, such as width.
 */
export const FILTER_CONTROL_CLASS =
  "h-8 rounded-[4px] border border-border bg-[#E8E9E8] px-2 py-1 text-xs text-[#000000] shadow-xs " +
  "min-[1920px]:h-10 min-[1920px]:px-3 min-[1920px]:py-2 min-[1920px]:text-sm"
