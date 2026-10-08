/** Theme constants. Kept out of lib/theme.ts ("use client") so server components can import them. */
export type Theme = "light" | "dark";

export const THEME_KEY = "asp-theme";
/** Used on a first visit, before the visitor has picked a theme. */
export const DEFAULT_THEME: Theme = "light";
export const THEME_COLOR: Record<Theme, string> = { light: "#f5f8fc", dark: "#040a15" };
