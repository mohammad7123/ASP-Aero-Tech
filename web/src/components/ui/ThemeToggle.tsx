"use client";

import { Moon, Sun } from "lucide-react";
import { toggleTheme, useTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";

/** Light / dark switch. Shows the mode you will switch TO. */
export function ThemeToggle({ className, tabIndex }: { className?: string; tabIndex?: number }) {
  const theme = useTheme();
  const toLight = theme === "dark";
  return (
    <button
      type="button"
      onClick={toggleTheme}
      tabIndex={tabIndex}
      aria-label={toLight ? "Switch to bright mode" : "Switch to dark mode"}
      data-cursor={toLight ? "Bright" : "Dark"}
      suppressHydrationWarning
      className={cn("grid size-11 place-items-center rounded-full border border-line-strong text-fg-muted transition-colors hover:border-cyan hover:text-fg", className)}
    >
      {toLight ? <Sun size={18} aria-hidden /> : <Moon size={18} aria-hidden />}
    </button>
  );
}
