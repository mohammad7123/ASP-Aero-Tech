"use client";

import { Moon, Sun } from "lucide-react";
import { toggleTheme, useTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";

/** Light / dark switch. Shows the mode you will switch TO; the icons roll past each other on change. */
export function ThemeToggle({ className, tabIndex }: { className?: string; tabIndex?: number }) {
  const theme = useTheme();
  const toLight = theme === "dark";
  return (
    <button
      type="button"
      onClick={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        toggleTheme({ x: r.left + r.width / 2, y: r.top + r.height / 2 });
      }}
      tabIndex={tabIndex}
      aria-label={toLight ? "Switch to bright mode" : "Switch to dark mode"}
      data-cursor={toLight ? "Bright" : "Dark"}
      suppressHydrationWarning
      className={cn(
        "relative grid size-11 place-items-center overflow-hidden rounded-full border border-line-strong text-fg-muted transition-[color,border-color,box-shadow] duration-300 hover:border-cyan hover:text-fg hover:shadow-[0_0_24px_-6px_var(--color-cyan)]",
        className,
      )}
    >
      <Sun
        size={18}
        aria-hidden
        className={cn("absolute transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]", toLight ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-50 opacity-0")}
      />
      <Moon
        size={18}
        aria-hidden
        className={cn("absolute transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]", toLight ? "rotate-90 scale-50 opacity-0" : "rotate-0 scale-100 opacity-100")}
      />
    </button>
  );
}
