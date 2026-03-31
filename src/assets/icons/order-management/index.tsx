import type { SVGProps } from "react"
import { cn } from "@/lib/utils"

export function TotalCustomOrdersIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width={42} height={42} viewBox="0 0 42 42" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden {...props}>
      <g filter="url(#filter0_i_custom_total)">
        <rect width="42" height="42" rx="21" fill="url(#paint0_linear_custom_total)" />
        <path d="M25.525 12.5H28C28.2652 12.5 28.5196 12.6054 28.7071 12.7929C28.8946 12.9804 29 13.2348 29 13.5V30C29 30.2652 28.8946 30.5196 28.7071 30.7071C28.5196 30.8946 28.2652 31 28 31H14C13.7348 31 13.4804 30.8946 13.2929 30.7071C13.1054 30.5196 13 30.2652 13 30V13.5C13 13.2348 13.1054 12.9804 13.2929 12.7929C13.4804 12.6054 13.7348 12.5 14 12.5H17.5V14H24.5V12.5H25.525Z" stroke="black" strokeWidth="2" strokeLinejoin="round" />
        <path d="M22.5 18.5L18.5 22.5005H23.502L19.5 26.5005M17.5 11H24.5V14H17.5V11Z" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <defs>
        <filter id="filter0_i_custom_total" x="0" y="0" width="42" height="46" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
          <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
          <feOffset dy="4" />
          <feGaussianBlur stdDeviation="2" />
          <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
          <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
          <feBlend mode="normal" in2="shape" result="effect1_innerShadow_custom_total" />
        </filter>
        <linearGradient id="paint0_linear_custom_total" x1="21" y1="0" x2="21" y2="42" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F9F9F9" />
          <stop offset="1" stopColor="#BDBDBD" stopOpacity="0.73" />
        </linearGradient>
      </defs>
    </svg>
  )
}

export function InProcessOrderIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width={42} height={42} viewBox="0 0 42 42" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden {...props}>
      <g filter="url(#filter0_i_custom_inprocess)">
        <rect width="42" height="42" rx="21" fill="url(#paint0_linear_custom_inprocess)" />
        <path d="M20 31C19.182 31 18.4 30.67 16.837 30.01C12.946 28.366 11 27.543 11 26.16V16M20 31V20.355M20 31C20.34 31 20.646 30.943 21 30.828M29 16V20.5M27 27L27.906 26.095M14 21L16 22M25 13L15 18M31 27C31 25.9391 30.5786 24.9217 29.8284 24.1716C29.0783 23.4214 28.0609 23 27 23C25.9391 23 24.9217 23.4214 24.1716 24.1716C23.4214 24.9217 23 25.9391 23 27C23 28.0609 23.4214 29.0783 24.1716 29.8284C24.9217 30.5786 25.9391 31 27 31C28.0609 31 29.0783 30.5786 29.8284 29.8284C30.5786 29.0783 31 28.0609 31 27ZM16.326 18.691L13.405 17.278C11.802 16.502 11 16.114 11 15.5C11 14.886 11.802 14.498 13.405 13.722L16.325 12.309C18.13 11.436 19.03 11 20 11C20.97 11 21.871 11.436 23.674 12.309L26.595 13.722C28.198 14.498 29 14.886 29 15.5C29 16.114 28.198 16.502 26.595 17.278L23.675 18.691C21.87 19.564 20.97 20 20 20C19.03 20 18.129 19.564 16.326 18.691Z" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <defs>
        <filter id="filter0_i_custom_inprocess" x="0" y="0" width="42" height="46" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
          <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
          <feOffset dy="4" />
          <feGaussianBlur stdDeviation="2" />
          <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
          <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
          <feBlend mode="normal" in2="shape" result="effect1_innerShadow_custom_inprocess" />
        </filter>
        <linearGradient id="paint0_linear_custom_inprocess" x1="21" y1="0" x2="21" y2="42" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F9F9F9" />
          <stop offset="1" stopColor="#C5C5C5" stopOpacity="0.73" />
        </linearGradient>
      </defs>
    </svg>
  )
}

export function FulfilledOrdersIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width={42} height={42} viewBox="0 0 42 42" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden {...props}>
      <g filter="url(#filter0_i_custom_fulfilled)">
        <rect width="42" height="42" rx="21" fill="url(#paint0_linear_custom_fulfilled)" />
        <path d="M13 16.5V25.5L21 30V21M13 16.5L21 12L29 16.5M13 16.5L21 21M29 16.5V21M29 16.5L21 21M24 27H31M31 27L28 24M31 27L28 30" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <defs>
        <filter id="filter0_i_custom_fulfilled" x="0" y="0" width="42" height="46" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
          <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
          <feOffset dy="4" />
          <feGaussianBlur stdDeviation="2" />
          <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
          <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
          <feBlend mode="normal" in2="shape" result="effect1_innerShadow_custom_fulfilled" />
        </filter>
        <linearGradient id="paint0_linear_custom_fulfilled" x1="21" y1="0" x2="21" y2="42" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F9F9F9" />
          <stop offset="1" stopColor="#DDDDDD" stopOpacity="0.73" />
        </linearGradient>
      </defs>
    </svg>
  )
}

export function CustomizationRequestsIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width={20} height={20} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden {...props}>
      <path
        d="M11.2448 6.66667H9.99479V10.8333L13.5615 12.95L14.1615 11.9417L11.2448 10.2083V6.66667ZM10.8281 2.5C8.839 2.5 6.93135 3.29018 5.52482 4.6967C4.1183 6.10322 3.32812 8.01088 3.32812 10H0.828125L4.12812 13.3583L7.49479 10H4.99479C4.99479 8.4529 5.60937 6.96917 6.70334 5.87521C7.7973 4.78125 9.28103 4.16667 10.8281 4.16667C12.3752 4.16667 13.859 4.78125 14.9529 5.87521C16.0469 6.96917 16.6615 8.4529 16.6615 10C16.6615 11.5471 16.0469 13.0308 14.9529 14.1248C13.859 15.2188 12.3752 15.8333 10.8281 15.8333C9.21979 15.8333 7.76146 15.175 6.71146 14.1167L5.52812 15.3C6.22113 16.0004 7.04674 16.5556 7.95673 16.9334C8.86672 17.3111 9.84286 17.5037 10.8281 17.5C12.8172 17.5 14.7249 16.7098 16.1314 15.3033C17.5379 13.8968 18.3281 11.9891 18.3281 10C18.3281 8.01088 17.5379 6.10322 16.1314 4.6967C14.7249 3.29018 12.8172 2.5 10.8281 2.5Z"
        fill="currentColor"
      />
    </svg>
  )
}

/** Return details / filters: return request (14×14) */
export function ReturnTypeIcon({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width={14}
      height={14}
      viewBox="0 0 14 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("inline-block shrink-0 text-foreground", className)}
      aria-hidden
      {...props}
    >
      <path
        d="M3.79161 2.33301L1.75 4.08301L3.79161 6.12467"
        stroke="currentColor"
        strokeWidth={1.25}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M1.75 4.08301H8.45653C10.4641 4.08301 12.1689 5.72229 12.2472 7.72884C12.3299 9.84914 10.5779 11.6663 8.45653 11.6663H3.49953"
        stroke="currentColor"
        strokeWidth={1.25}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/** Return details / filters: exchange request (14×14) */
export function ExchangeTypeIcon({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width={14}
      height={14}
      viewBox="0 0 14 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("inline-block shrink-0 text-foreground", className)}
      aria-hidden
      {...props}
    >
      <path
        d="M2.05469 6.69071V7.92621C2.05461 8.25067 2.11845 8.57198 2.24257 8.87177C2.36669 9.17156 2.54864 9.44397 2.77805 9.67343C3.00746 9.90289 3.27982 10.0849 3.57958 10.2091C3.87934 10.3333 4.20064 10.3972 4.5251 10.3972H11.9364M2.05469 3.60254H9.46594C9.79046 3.60246 10.1118 3.66632 10.4116 3.79048C10.7115 3.91463 10.9839 4.09664 11.2134 4.32611C11.4428 4.55558 11.6248 4.82801 11.749 5.12784C11.8732 5.42767 11.937 5.74902 11.9369 6.07354V7.30846"
        stroke="currentColor"
        strokeWidth={1.25}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10.0843 8.54408L11.9375 10.3967L10.0843 12.25M3.90794 5.45592L2.05469 3.60267L3.90794 1.75"
        stroke="currentColor"
        strokeWidth={1.25}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function PendingInfoIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width={42} height={42} viewBox="0 0 42 42" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden {...props}>
      <g filter="url(#filter0_i_custom_pending)">
        <rect width="42" height="42" rx="21" fill="url(#paint0_linear_custom_pending)" />
        <path d="M12 19C12 15.229 12 13.343 13.172 12.172C14.344 11.001 16.229 11 20 11H22C25.771 11 27.657 11 28.828 12.172C29.999 13.344 30 15.229 30 19V23C30 26.771 30 28.657 28.828 29.828C27.656 30.999 25.771 31 22 31H20C16.229 31 14.343 31 13.172 29.828C12.001 28.656 12 26.771 12 23V19Z" stroke="black" strokeWidth="2" />
        <path d="M17 19H25M17 23H22" stroke="black" strokeWidth="1.5" strokeLinecap="round" />
      </g>
      <defs>
        <filter id="filter0_i_custom_pending" x="0" y="0" width="42" height="46" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
          <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
          <feOffset dy="4" />
          <feGaussianBlur stdDeviation="2" />
          <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
          <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
          <feBlend mode="normal" in2="shape" result="effect1_innerShadow_custom_pending" />
        </filter>
        <linearGradient id="paint0_linear_custom_pending" x1="21" y1="0" x2="21" y2="42" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F9F9F9" />
          <stop offset="1" stopColor="#C5C5C5" stopOpacity="0.73" />
        </linearGradient>
      </defs>
    </svg>
  )
}
