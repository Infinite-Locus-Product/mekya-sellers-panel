import type { SVGProps } from "react"

export function CurrentWeekKpiIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width={30} height={30} viewBox="0 0 42 42" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden {...props}>
      <g filter="url(#filter0_i_current_week)">
        <rect width="42" height="42" rx="21" fill="url(#paint0_linear_current_week)" />
        <path d="M11.7006 26.6252C11.5006 26.4252 11.4046 26.1878 11.4126 25.9132C11.4206 25.6385 11.5166 25.4092 11.7006 25.2252L16.9756 19.8752C17.3589 19.4918 17.8339 19.3002 18.4006 19.3002C18.9672 19.3002 19.4422 19.4918 19.8256 19.8752L22.4006 22.4752L27.6006 17.3252H26.0006C25.7172 17.3252 25.4799 17.2292 25.2886 17.0372C25.0972 16.8452 25.0012 16.6082 25.0006 16.3262C24.9999 16.0442 25.0959 15.8068 25.2886 15.6142C25.4812 15.4215 25.7186 15.3255 26.0006 15.3262H30.0006C30.2839 15.3262 30.5216 15.4222 30.7136 15.6142C30.9056 15.8062 31.0012 16.0435 31.0006 16.3262V20.3262C31.0006 20.6095 30.9046 20.8472 30.7126 21.0392C30.5206 21.2312 30.2832 21.3268 30.0006 21.3262C29.7179 21.3255 29.4806 21.2298 29.2886 21.0392C29.0966 20.8485 29.0006 20.6108 29.0006 20.3262V18.7262L23.8256 23.9002C23.4422 24.2835 22.9672 24.4752 22.4006 24.4752C21.8339 24.4752 21.3589 24.2835 20.9756 23.9002L18.4006 21.3252L13.1006 26.6252C12.9172 26.8085 12.6839 26.9002 12.4006 26.9002C12.1172 26.9002 11.8839 26.8085 11.7006 26.6252Z" fill="black" />
      </g>
      <defs>
        <filter id="filter0_i_current_week" x="0" y="0" width="42" height="46" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
          <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
          <feOffset dy="4" />
          <feGaussianBlur stdDeviation="2" />
          <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
          <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
          <feBlend mode="normal" in2="shape" result="effect1_innerShadow_current_week" />
        </filter>
        <linearGradient id="paint0_linear_current_week" x1="21" y1="0" x2="21" y2="42" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F9F9F9" />
          <stop offset="1" stopColor="#BDBDBD" stopOpacity="0.73" />
        </linearGradient>
      </defs>
    </svg>
  )
}

/** Previous Week - calendar (42×42 circle with gradient) */
export function PreviousWeekKpiIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width={42} height={42} viewBox="0 0 42 42" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden {...props}>
      <g filter="url(#filter0_i_previous_week)">
        <rect width="42" height="42" rx="21" fill="url(#paint0_linear_previous_week)" />
        <path d="M19.75 21.75L22 24L19.75 26.25M12.25 18H28.75M24.25 15V12M16.75 15V12M13.75 30H27.25C27.6478 30 28.0294 29.842 28.3107 29.5607C28.592 29.2794 28.75 28.8978 28.75 28.5V15C28.75 14.6022 28.592 14.2206 28.3107 13.9393C28.0294 13.658 27.6478 13.5 27.25 13.5H13.75C13.3522 13.5 12.9706 13.658 12.6893 13.9393C12.408 14.2206 12.25 14.6022 12.25 15V28.5C12.25 28.8978 12.408 29.2794 12.6893 29.5607C12.9706 29.842 13.3522 30 13.75 30Z" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <defs>
        <filter id="filter0_i_previous_week" x="0" y="0" width="42" height="46" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
          <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
          <feOffset dy="4" />
          <feGaussianBlur stdDeviation="2" />
          <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
          <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
          <feBlend mode="normal" in2="shape" result="effect1_innerShadow_previous_week" />
        </filter>
        <linearGradient id="paint0_linear_previous_week" x1="21" y1="0" x2="21" y2="42" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F9F9F9" />
          <stop offset="1" stopColor="#C5C5C5" stopOpacity="0.73" />
        </linearGradient>
      </defs>
    </svg>
  )
}

/** Week over Week - trending (42×42 circle with gradient) */
export function WeekOverWeekKpiIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width={42} height={42} viewBox="0 0 42 42" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden {...props}>
      <g filter="url(#filter0_i_week_over_week)">
        <rect width="42" height="42" rx="21" fill="url(#paint0_linear_week_over_week)" />
        <path d="M18 24.5H28V11.5" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M24 19.5H14V30.5M31 14.5L28 11.5L25 14.5" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M17 27.5L14 30.5L11 27.5" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <defs>
        <filter id="filter0_i_week_over_week" x="0" y="0" width="42" height="46" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
          <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
          <feOffset dy="4" />
          <feGaussianBlur stdDeviation="2" />
          <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
          <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
          <feBlend mode="normal" in2="shape" result="effect1_innerShadow_week_over_week" />
        </filter>
        <linearGradient id="paint0_linear_week_over_week" x1="21" y1="0" x2="21" y2="42" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F9F9F9" />
          <stop offset="1" stopColor="#DDDDDD" stopOpacity="0.73" />
        </linearGradient>
      </defs>
    </svg>
  )
}
