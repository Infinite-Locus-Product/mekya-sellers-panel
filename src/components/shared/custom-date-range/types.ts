export type DateRangePreset =
  | "today"
  | "yesterday"
  | "last7"
  | "last30"
  | "month"
  | "year"
  | "custom";

export interface DateRangeValue {
  startDate: Date;
  endDate: Date;
}

export interface DateRangeApiPayload {
  start_date: string;
  end_date: string;
}

export interface CustomDateRangeSelectorProps {
  value: DateRangeValue;
  onChange: (range: DateRangeValue, payload: DateRangeApiPayload) => void;
  className?: string;
  /** Hide Today / Yesterday / Last 7 / Last 30 — only Month, Year, Custom */
  pickerMode?: "full" | "month-year-forward";
}
