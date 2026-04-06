export const COLORS = {
  success: {
    light: "#DBFCE7",
    dark: "#016630",
  },

  error: {
    light: "#FCDBDB",
    dark: "#660101",
  },

  warning: {
    light: "#FEF9C2",
    dark: "#894B3E",
  },

  info: {
    light: "#DBEAFE",
    dark: "#2C4FBF",
  },

  neutral: {
    light: "#E8E9E8",
    dark: "#2A2A2A",
  },

  accent: {
    light: "#FCDBF2",
    dark: "#720050",
  },
} as const

export const COLOR_PALETTE = {
  green: {
    50: COLORS.success.light,
    900: COLORS.success.dark,
  },
  red: {
    50: COLORS.error.light,
    900: COLORS.error.dark,
  },
  yellow: {
    50: COLORS.warning.light,
    900: COLORS.warning.dark,
  },
  blue: {
    50: COLORS.info.light,
    900: COLORS.info.dark,
  },
  gray: {
    50: COLORS.neutral.light,
    900: COLORS.neutral.dark,
  },
  pink: {
    50: COLORS.accent.light,
    900: COLORS.accent.dark,
  },
} as const

export type ColorKey = keyof typeof COLORS
export type ColorVariant = "light" | "dark"
