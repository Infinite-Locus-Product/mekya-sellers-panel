import type { SVGProps } from "react"

const kpi24 = { width: 24, height: 24, viewBox: "0 0 24 24" } as const

/** Dashboard: Total sale volume */
export function KpiSaleTrendIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...kpi24} fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden {...props}>
      <path
        d="M2.69959 17.6252C2.49959 17.4252 2.40359 17.1878 2.41159 16.9132C2.41959 16.6385 2.51559 16.4092 2.69959 16.2252L7.97459 10.8752C8.35793 10.4918 8.83293 10.3002 9.39959 10.3002C9.96626 10.3002 10.4413 10.4918 10.8246 10.8752L13.3996 13.4752L18.5996 8.32517H16.9996C16.7163 8.32517 16.4789 8.22917 16.2876 8.03717C16.0963 7.84517 16.0003 7.60818 15.9996 7.32618C15.9989 7.04418 16.0949 6.80684 16.2876 6.61417C16.4803 6.42151 16.7176 6.32551 16.9996 6.32618H20.9996C21.2829 6.32618 21.5206 6.42217 21.7126 6.61417C21.9046 6.80617 22.0003 7.04351 21.9996 7.32618V11.3262C21.9996 11.6095 21.9036 11.8472 21.7116 12.0392C21.5196 12.2312 21.2823 12.3268 20.9996 12.3262C20.7169 12.3255 20.4796 12.2298 20.2876 12.0392C20.0956 11.8485 19.9996 11.6108 19.9996 11.3262V9.72617L14.8246 14.9002C14.4413 15.2835 13.9663 15.4752 13.3996 15.4752C12.8329 15.4752 12.3579 15.2835 11.9746 14.9002L9.39959 12.3252L4.09959 17.6252C3.91626 17.8085 3.68293 17.9002 3.39959 17.9002C3.11626 17.9002 2.88293 17.8085 2.69959 17.6252Z"
        fill="black"
      />
    </svg>
  )
}

/** Dashboard KPI: total orders */
export function KpiOrdersBagIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...kpi24} fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden {...props}>
      <path
        d="M4.00361 17.9998V7.09983L2.45361 3.74983C2.33694 3.49983 2.32861 3.2455 2.42861 2.98683C2.52861 2.72817 2.70361 2.54083 2.95361 2.42483C3.20361 2.30883 3.45794 2.2965 3.71661 2.38783C3.97527 2.47917 4.16261 2.64983 4.27861 2.89983L6.20361 7.04983H17.8036L19.7286 2.89983C19.8453 2.64983 20.0329 2.47483 20.2916 2.37483C20.5503 2.27483 20.8043 2.2915 21.0536 2.42483C21.3036 2.5415 21.4786 2.72917 21.5786 2.98783C21.6786 3.2465 21.6703 3.5005 21.5536 3.74983L20.0036 7.09983V17.9998C20.0036 18.5498 19.8079 19.0208 19.4166 19.4128C19.0253 19.8048 18.5543 20.0005 18.0036 19.9998H6.00361C5.45361 19.9998 4.98294 19.8042 4.59161 19.4128C4.20027 19.0215 4.00427 18.5505 4.00361 17.9998ZM10.0036 12.9998H14.0036C14.2869 12.9998 14.5246 12.9038 14.7166 12.7118C14.9086 12.5198 15.0043 12.2825 15.0036 11.9998C15.0029 11.7172 14.9069 11.4798 14.7156 11.2878C14.5243 11.0958 14.2869 10.9998 14.0036 10.9998H10.0036C9.72027 10.9998 9.48294 11.0958 9.29161 11.2878C9.10027 11.4798 9.00427 11.7172 9.00361 11.9998C9.00294 12.2825 9.09894 12.5202 9.29161 12.7128C9.48427 12.9055 9.72161 13.0012 10.0036 12.9998ZM6.00361 17.9998H18.0036V9.04983H6.00361V17.9998Z"
        fill="black"
      />
    </svg>
  )
}

/** Dashboard KPI: return orders */
export function KpiReturnUndoIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...kpi24} fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden {...props}>
      <path
        d="M6.5 20L3 17L6.5 13.5"
        stroke="black"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M3 17H14.497C17.9385 17 20.861 14.19 20.995 10.75C21.137 7.115 18.1335 4 14.497 4H5.999"
        stroke="black"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/** Order management KPI: total revenue */
export function KpiTotalRevenueIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...kpi24} fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden {...props}>
      <path
        d="M12 3v18M7 8h10M7 12h6M7 16h8"
        stroke="black"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M7 8l2-3h6l2 3" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/** Order management KPI: pending orders */
export function KpiPendingOrdersIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...kpi24} fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden {...props}>
      <circle cx="12" cy="12" r="9" stroke="black" strokeWidth="2" />
      <path d="M12 7v6l4 2" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/** Order management KPI: delivered */
export function KpiDeliveredOrdersIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...kpi24} fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden {...props}>
      <path
        d="M3 7h13v10H3V7zM16 9h3l2 2v6h-5V9z"
        stroke="black"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <circle cx="7.5" cy="19" r="1.5" fill="black" />
      <circle cx="17" cy="19" r="1.5" fill="black" />
    </svg>
  )
}

/** Order row: open detailed view */
export function OrderViewIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...kpi24} fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden {...props}>
      <path
        d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
    </svg>
  )
}

/** Order row: invoice action */
export function OrderInvoiceIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...kpi24} fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden {...props}>
      <path
        d="M7 3h7l3 3v15H7V3zM14 3v4h4M9 12h6M9 16h6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
