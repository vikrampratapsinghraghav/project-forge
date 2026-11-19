/**
 * Design tokens — the ONLY place raw colour/size values may live.
 * Components import `theme` (semantic tokens), never `palette` directly.
 * Replace the example values with the approved direction from /design-system.
 */

export const palette = {
  neutral: { 0: '#ffffff', 50: '#f7f7f8', 100: '#ececef', 300: '#c4c4cc', 500: '#7a7a85', 700: '#3f3f46', 900: '#18181b' },
  brand: { 100: '#e0e7ff', 500: '#4f46e5', 600: '#4338ca', 700: '#3730a3' },
  red: { 500: '#dc2626' },
  green: { 500: '#16a34a' },
} as const;

export const space = { 0: 0, 1: 4, 2: 8, 3: 12, 4: 16, 5: 20, 6: 24, 8: 32, 10: 40, 12: 48, 16: 64 } as const;
export const radius = { sm: 4, md: 8, lg: 12, xl: 16, full: 9999 } as const;
export const font = {
  family: { body: 'Inter', heading: 'Inter', mono: 'JetBrains Mono' },
  size: { xs: 12, sm: 14, md: 16, lg: 18, xl: 20, '2xl': 24, '3xl': 30, '4xl': 36 },
  weight: { regular: '400', medium: '500', semibold: '600', bold: '700' },
  lineHeight: { tight: 1.2, normal: 1.5 },
} as const;
export const motion = { fast: 120, normal: 200, slow: 320 } as const;

const light = {
  bg: palette.neutral[0],
  surface: palette.neutral[50],
  text: palette.neutral[900],
  textMuted: palette.neutral[500],
  border: palette.neutral[100],
  primary: palette.brand[600],
  onPrimary: palette.neutral[0],
  danger: palette.red[500],
  success: palette.green[500],
  focus: palette.brand[500],
} as const;

const dark: Record<keyof typeof light, string> = {
  bg: palette.neutral[900],
  surface: palette.neutral[700],
  text: palette.neutral[50],
  textMuted: palette.neutral[300],
  border: palette.neutral[700],
  primary: palette.brand[500],
  onPrimary: palette.neutral[0],
  danger: palette.red[500],
  success: palette.green[500],
  focus: palette.brand[100],
};

export const themes = { light, dark } as const;
export type ThemeName = keyof typeof themes;
export type SemanticColor = keyof typeof light;

export const theme = (name: ThemeName = 'light') => ({
  color: themes[name],
  space,
  radius,
  font,
  motion,
});
