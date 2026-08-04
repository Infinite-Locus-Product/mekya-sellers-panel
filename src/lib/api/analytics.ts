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
