"use client";

import type { SVGProps } from "react";
import { useId } from "react";

/** Checkbox-style check for met password rules (12×12 viewBox); stroke uses currentColor */
export function PasswordRequirementMetIcon(props: SVGProps<SVGSVGElement>) {
  const clipId = useId().replace(/:/g, "");
  return (
    <svg width={16} height={16} viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden {...props}>
      <g clipPath={`url(#${clipId})`}>
        <path
          d="M9.78181 3.42383L4.89081 8.31483L2.44531 5.86933"
          stroke="currentColor"
          strokeWidth="1.22275"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <rect x="0.5" y="0.5" width="11" height="11" rx="1.5" stroke="currentColor" />
      <defs>
        <clipPath id={clipId}>
          <rect width="12" height="12" rx="2" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}
