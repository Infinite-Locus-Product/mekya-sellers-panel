import { authService } from "@/lib/auth/authService";

export interface Money {
  amount: number;
  currency: string;
}

export interface SellerAnalyticsKpis {
  total_orders: number;
  total_revenue: Money;
  /** status is Unfulfilled, Unconfirmed, or Partially Fulfilled */
  pending_orders: number;
  /** status is Fulfilled */
  delivered_orders: number;
  /** status is Cancelled or Expired */
  cancelled_orders: number;
  b2b_orders: number;
  b2c_orders: number;
}

export interface OrderStatusBreakdownEntry {
  status: string;
  count: number;
  /** count / total_orders * 100, rounded to 1 decimal */
  percentage: number;
}

export interface SellerAnalytics {
  kpis: SellerAnalyticsKpis;
  /** Sorted by count descending. Empty when there are no orders. */
  order_status_breakdown: OrderStatusBreakdownEntry[];
}

export interface GetSellerAnalyticsParams {
  channel?: "b2b" | "b2c";
  /** ISO 8601, inclusive. Omitting date_from/date_to returns lifetime stats. */
  date_from?: string;
  date_to?: string;
}

const EMPTY_ANALYTICS: SellerAnalytics = {
  kpis: {
    total_orders: 0,
    total_revenue: { amount: 0, currency: "SAR" },
    pending_orders: 0,
    delivered_orders: 0,
    cancelled_orders: 0,
    b2b_orders: 0,
    b2c_orders: 0,
  },
  order_status_breakdown: [],
};

/** GET /seller/analytics — aggregated order KPIs, not a paginated list. */
export async function getSellerAnalytics(
  params?: GetSellerAnalyticsParams,
): Promise<SellerAnalytics> {
  const query = new URLSearchParams();
  if (params?.channel) query.set("channel", params.channel);
  if (params?.date_from) query.set("date_from", params.date_from);
  if (params?.date_to) query.set("date_to", params.date_to);
  const qs = query.toString();
  const res = await authService.api.get<SellerAnalytics>(
    `/seller/analytics${qs ? `?${qs}` : ""}`,
  );
  return res.data ?? EMPTY_ANALYTICS;
}

// ─── GET /seller/analytics/sales-volume ────────────────────────────────────

export interface SalesVolumeWeekSummary {
  label: string;
  date_from: string;
  date_to: string;
  display_value: string;
}

export interface SalesVolumeSummary {
  this_week: SalesVolumeWeekSummary;
  last_week: SalesVolumeWeekSummary;
  change_percent: number | null;
  change_direction: "positive" | "negative" | "neutral";
  display_change: string;
}

export interface SalesTrendPoint {
  label: string;
  value: number;
}

export interface CategoryBreakdownItem {
  /** Top-level Saleor category — leaf categories are rolled up to their root, so
   *  "T-Shirts" is reported under "Topwear". */
  category: string;
  value: number;
  percentage: number;
  color: string;
}

export interface GenderBreakdownItem {
  /** Always includes Women/Men/Boys/Girls (even at zero), plus "Unspecified" when
   *  products carry no Gender attribute and no gendered category. */
  gender: string;
  value: number;
  percentage: number;
}

export interface RegionalPerformanceItem {
  region: string;
  sales: number;
  /** Mirrors `sales`; the regional drill-down UI reads this name. */
  revenue: number;
  growth: number;
  /** Whole-number share of this period's regional revenue, 0-100. */
  contribution: number;
  /** Per-state split of this region, highest revenue first. Empty when the orders in
   *  range carry no usable shipping state. */
  states: RegionalStateItem[];
  color: string;
}

export interface RegionalStateItem {
  name: string;
  revenue: number;
}

export interface ColorTrendItem {
  color: string;
  name: string;
  units: number;
  percentage: number;
  hex_code: string;
}

export interface SalesVolumeAnalytics {
  period: { date_from: string; date_to: string };
  summary: SalesVolumeSummary;
  sales_trends: {
    granularity: "hour" | "day" | "month";
    series: SalesTrendPoint[];
    note: string | null;
  };
  /** `available: false` means genuinely no data for this breakdown — never a fabricated fallback. */
  category_breakdown: { available: boolean; items: CategoryBreakdownItem[] };
  /** `available: false` means no sale resolved to a real gender bucket — the four rows
   *  are always present, so a non-empty `items` alone doesn't imply real data. */
  gender_breakdown: { available: boolean; items: GenderBreakdownItem[] };
  regional_performance: { available: boolean; items: RegionalPerformanceItem[] };
  color_trends: { available: boolean; items: ColorTrendItem[] };
  meta: {
    generated_at: string;
    currency: string;
    orders_in_period: number;
    orders_scanned: number;
    orders_truncated: boolean;
  };
}

// ─── GET /seller/analytics/total-orders ───────────────────────────────────────

export interface TotalOrdersPeriodSummary {
  label: string;
  date_from: string;
  date_to: string;
  value: number;
  display_value: string;
}

export interface OrderTypeSeriesPoint {
  label: string;
  b2b: number;
  b2c: number;
}

export interface CustomerTypeSeriesPoint {
  label: string;
  new: number;
  returning: number;
}

export interface OrderStatusItem {
  /** pending | completed | canceled | returned */
  type: string;
  label: string;
  orders: number;
  percentage: number;
  color: string;
}

export interface TotalOrdersAnalytics {
  period: { date_from: string; date_to: string };
  summary: {
    current: TotalOrdersPeriodSummary;
    previous: TotalOrdersPeriodSummary;
    change_percent: number | null;
    change_direction: "positive" | "negative" | "neutral";
    display_change: string;
  };
  historical_trends: {
    granularity: "hour" | "day" | "month";
    series: SalesTrendPoint[];
    note: string | null;
  };
  order_type: {
    available: boolean;
    granularity: string;
    series: OrderTypeSeriesPoint[];
    totals: { b2b: number; b2c: number };
  };
  order_status: { available: boolean; items: OrderStatusItem[] };
  customer_type: {
    available: boolean;
    granularity: string;
    series: CustomerTypeSeriesPoint[];
    totals: { new: number; returning: number };
  };
  meta: {
    orders_in_period: number;
    orders_scanned: number;
    orders_truncated: boolean;
  };
}

export interface GetTotalOrdersAnalyticsParams {
  /** Inclusive, YYYY-MM-DD. */
  date_from: string;
  /** Inclusive, YYYY-MM-DD. */
  date_to: string;
  channel?: "b2b" | "b2c";
}

export async function getTotalOrdersAnalytics(
  params: GetTotalOrdersAnalyticsParams,
): Promise<TotalOrdersAnalytics> {
  const query = new URLSearchParams();
  query.set("date_from", params.date_from);
  query.set("date_to", params.date_to);
  if (params.channel) query.set("channel", params.channel);
  const res = await authService.api.get<TotalOrdersAnalytics>(
    `/seller/analytics/total-orders?${query.toString()}`,
  );
  return res.data;
}

export interface GetSalesVolumeAnalyticsParams {
  /** Inclusive, YYYY-MM-DD. */
  date_from: string;
  /** Inclusive, YYYY-MM-DD. */
  date_to: string;
  channel?: "b2b" | "b2c";
}

export async function getSalesVolumeAnalytics(
  params: GetSalesVolumeAnalyticsParams,
): Promise<SalesVolumeAnalytics> {
  const query = new URLSearchParams();
  query.set("date_from", params.date_from);
  query.set("date_to", params.date_to);
  if (params.channel) query.set("channel", params.channel);
  const res = await authService.api.get<SalesVolumeAnalytics>(
    `/seller/analytics/sales-volume?${query.toString()}`,
  );
  return res.data;
}

// ─── GET /seller/analytics/aov ─────────────────────────────────────────────

export interface AovWeekSummary {
  label: string;
  date_from: string;
  date_to: string;
  display_value: string;
}

export interface AovSummary {
  this_week: AovWeekSummary;
  last_week: AovWeekSummary;
  change_percent: number | null;
  change_direction: "positive" | "negative" | "neutral";
  display_change: string;
}

export interface AovTrendPoint {
  label: string;
  value: number;
}

export interface AovOrderTypePoint {
  label: string;
  b2b: number;
  b2c: number;
}

export interface AovCustomerTypePoint {
  label: string;
  new: number;
  returning: number;
}

export interface AovAnalytics {
  period: { date_from: string; date_to: string };
  summary: AovSummary;
  historical_trends: {
    granularity: "hour" | "day" | "month";
    series: AovTrendPoint[];
    note: string | null;
  };
  order_type_trends: { series: AovOrderTypePoint[] };
  /** `note` clarifies this is a within-selected-period proxy, not lifetime
   *  customer history — see the backend's `aov_analytics` module docstring. */
  customer_type_trends: { series: AovCustomerTypePoint[]; note: string | null };
  meta: {
    generated_at: string;
    currency: string;
    orders_in_period: number;
    orders_scanned: number;
    orders_truncated: boolean;
  };
}

export interface GetAovAnalyticsParams {
  /** Inclusive, YYYY-MM-DD. */
  date_from: string;
  /** Inclusive, YYYY-MM-DD. */
  date_to: string;
  channel?: "b2b" | "b2c";
}

export async function getAovAnalytics(params: GetAovAnalyticsParams): Promise<AovAnalytics> {
  const query = new URLSearchParams();
  query.set("date_from", params.date_from);
  query.set("date_to", params.date_to);
  if (params.channel) query.set("channel", params.channel);
  const res = await authService.api.get<AovAnalytics>(
    `/seller/analytics/aov?${query.toString()}`,
  );
  return res.data;
}
