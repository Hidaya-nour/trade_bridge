/**
 * Centralized color scheme matching the frontend design.
 * Frontend primary color: 250 60% 55% (purple) → #8B5CF6
 * Light theme is default; dark theme can be enabled via ThemeContext.
 */

export const colors = {
  // Primary (Purple - matching frontend)
  primary: "#8B5CF6",
  primaryLight: "#EDE9FE",
  primaryDark: "#6D28D9",
  primaryForeground: "#FFFFFF",

  // Secondary
  secondary: "#F3F4F6",
  secondaryForeground: "#0F172A",

  // Background
  background: "#F9FAFB",
  backgroundCard: "#FFFFFF",

  // Foreground / Text
  foreground: "#0F172A",
  foregroundMuted: "#64748B",
  foregroundLight: "#94A3B8",

  // Sidebar
  sidebar: "#F3F4F6",
  sidebarForeground: "#0F172A",

  // Borders
  border: "#E5E7EB",
  borderLight: "#F3F4F6",
  borderDark: "#D1D5DB",

  // Status colors
  success: "#10B981",
  successLight: "#D1FAE5",
  warning: "#F59E0B",
  warningLight: "#FEF3C7",
  error: "#EF4444",
  errorLight: "#FEE2E2",
  info: "#3B82F6",
  infoLight: "#DBEAFE",

  // Status tones
  statusAssigned: {
    bg: "#EDE9FE",
    text: "#6D28D9",
    border: "#DDD6FE",
  },
  statusPickedUp: {
    bg: "#EDE9FE",
    text: "#6D28D9",
    border: "#DDD6FE",
  },
  statusDelivered: {
    bg: "#D1FAE5",
    text: "#065F46",
    border: "#A7F3D0",
  },
  statusPending: {
    bg: "#FEF3C7",
    text: "#B45309",
    border: "#FCD34D",
  },
  statusFailed: {
    bg: "#FEE2E2",
    text: "#DC2626",
    border: "#FCA5A5",
  },
  statusCancelled: {
    bg: "#FEE2E2",
    text: "#DC2626",
    border: "#FCA5A5",
  },

  // Utility
  transparent: "transparent",
  white: "#FFFFFF",
  black: "#000000",
  overlay: "rgba(15, 23, 42, 0.28)",

  // Route map colors
  routeStart: "#16A34A",
  routeCurrent: "#8B5CF6",
  routeEnd: "#DC2626",
  routeLine: "#8B5CF6",
  routeLineRemaining: "#D8B4FE",

  // Badge colors
  badgeSuccess: "#DCFCE7",
  badgeSuccessText: "#166534",
  badgeMuted: "#E2E8F0",
  badgeMutedText: "#475569",

  // Avatar
  avatarBg: "#EDE9FE",
  avatarText: "#6D28D9",
};

export const darkColors = {
  // Primary
  primary: "#A78BFA",
  primaryLight: "#6D28D9",
  primaryDark: "#C4B5FD",
  primaryForeground: "#0F172A",

  // Secondary
  secondary: "#334155",
  secondaryForeground: "#F8FAFC",

  // Background
  background: "#0F172A",
  backgroundCard: "#1E293B",

  // Foreground / Text
  foreground: "#F8FAFC",
  foregroundMuted: "#CBD5E1",
  foregroundLight: "#94A3B8",

  // Sidebar
  sidebar: "#1E293B",
  sidebarForeground: "#F8FAFC",

  // Borders
  border: "#334155",
  borderLight: "#475569",
  borderDark: "#1E293B",

  // Status colors
  success: "#10B981",
  successLight: "#064E3B",
  warning: "#F59E0B",
  warningLight: "#78350F",
  error: "#EF4444",
  errorLight: "#7F1D1D",
  info: "#3B82F6",
  infoLight: "#0C2340",

  // Status tones
  statusAssigned: {
    bg: "#312E81",
    text: "#C4B5FD",
    border: "#4C1D95",
  },
  statusPickedUp: {
    bg: "#312E81",
    text: "#C4B5FD",
    border: "#4C1D95",
  },
  statusDelivered: {
    bg: "#064E3B",
    text: "#A7F3D0",
    border: "#065F46",
  },
  statusPending: {
    bg: "#78350F",
    text: "#FCD34D",
    border: "#92400E",
  },
  statusFailed: {
    bg: "#7F1D1D",
    text: "#FCA5A5",
    border: "#991B1B",
  },
  statusCancelled: {
    bg: "#7F1D1D",
    text: "#FCA5A5",
    border: "#991B1B",
  },

  // Utility
  transparent: "transparent",
  white: "#FFFFFF",
  black: "#000000",
  overlay: "rgba(0, 0, 0, 0.5)",

  // Route map colors
  routeStart: "#22C55E",
  routeCurrent: "#A78BFA",
  routeEnd: "#F87171",
  routeLine: "#A78BFA",
  routeLineRemaining: "#6D28D9",

  // Badge colors
  badgeSuccess: "#14532D",
  badgeSuccessText: "#BBF7D0",
  badgeMuted: "#334155",
  badgeMutedText: "#CBD5E1",

  // Avatar
  avatarBg: "#4C1D95",
  avatarText: "#EDE9FE",
};

/**
 * Get color by key from the current theme.
 * Only returns string-based colors.
 */
type ColorKeys = {
  [K in keyof typeof colors]: typeof colors[K] extends string ? K : never;
}[keyof typeof colors];

export const getColor = (colorKey: ColorKeys): string => {
  return colors[colorKey];
};