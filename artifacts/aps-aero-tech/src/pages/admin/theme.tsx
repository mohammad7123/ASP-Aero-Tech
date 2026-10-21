import { createContext, useCallback, useContext, useEffect, useState, type MouseEvent, type ReactNode } from "react"
import { flushSync } from "react-dom"
import { AnimatePresence, motion } from "framer-motion"
import { Moon, Sun } from "lucide-react"
import { cn } from "@/lib/utils"

export type ThemePreference = "light" | "dark" | "system"
type ThemeContextValue = {
  preference: ThemePreference
  resolved: "light" | "dark"
  setPreference: (next: ThemePreference, origin?: { x: number; y: number }) => void
}

const STORAGE_KEY = "asp-admin-theme"
const ThemeContext = createContext<ThemeContextValue | null>(null)

const readPreference = (): ThemePreference => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === "light" || stored === "dark" || stored === "system") return stored
  } catch {
    // storage can be unavailable (private mode); fall back to the OS setting
  }
  return "system"
}

const systemPrefersDark = () => window.matchMedia("(prefers-color-scheme: dark)").matches
export const prefersReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches

/** Owns light/dark mode for the admin console. Adds html.admin-ui (+ .dark) while mounted and removes them on unmount. */
export function AdminThemeProvider({ children }: { children: ReactNode }) {
  const [preference, setPreferenceState] = useState<ThemePreference>(readPreference)
  const [systemDark, setSystemDark] = useState(systemPrefersDark)
  const resolved = preference === "system" ? (systemDark ? "dark" : "light") : preference

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)")
    const onChange = () => setSystemDark(media.matches)
    media.addEventListener("change", onChange)
    return () => media.removeEventListener("change", onChange)
  }, [])

  useEffect(() => {
    const root = document.documentElement
    root.classList.add("admin-ui")
    root.classList.toggle("dark", resolved === "dark")
  }, [resolved])

  useEffect(() => () => {
    document.documentElement.classList.remove("admin-ui", "dark")
  }, [])

  const setPreference = useCallback((next: ThemePreference, origin?: { x: number; y: number }) => {
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // non-persistent preference is fine
    }
    const doc = document as Document & { startViewTransition?: (cb: () => void) => { ready: Promise<void> } }
    if (!doc.startViewTransition || prefersReducedMotion()) {
      setPreferenceState(next)
      return
    }
    const x = origin?.x ?? window.innerWidth - 40
    const y = origin?.y ?? 40
    const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y))
    const transition = doc.startViewTransition(() => flushSync(() => setPreferenceState(next)))
    transition.ready.then(() => {
      document.documentElement.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
        { duration: 550, easing: "cubic-bezier(.4,0,.2,1)", pseudoElement: "::view-transition-new(root)" },
      )
    }).catch(() => undefined)
  }, [])

  return <ThemeContext.Provider value={{ preference, resolved, setPreference }}>{children}</ThemeContext.Provider>
}

export function useAdminTheme() {
  const value = useContext(ThemeContext)
  if (!value) throw new Error("useAdminTheme must be used inside AdminThemeProvider")
  return value
}

export function ThemeToggle({ className }: { className?: string }) {
  const { resolved, setPreference } = useAdminTheme()
  const isDark = resolved === "dark"
  const toggle = (event: MouseEvent<HTMLButtonElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    setPreference(isDark ? "light" : "dark", { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 })
  }
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Light mode" : "Dark mode"}
      className={cn(
        "relative inline-flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-border bg-card text-foreground shadow-sm transition-colors hover:border-secondary/60 hover:text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={isDark ? "moon" : "sun"}
          initial={{ y: 18, rotate: -90, opacity: 0 }}
          animate={{ y: 0, rotate: 0, opacity: 1 }}
          exit={{ y: -18, rotate: 90, opacity: 0 }}
          transition={{ type: "spring", stiffness: 420, damping: 26 }}
          className="flex"
        >
          {isDark ? <Moon className="h-[18px] w-[18px]" /> : <Sun className="h-[18px] w-[18px]" />}
        </motion.span>
      </AnimatePresence>
    </button>
  )
}

/** The ASP logo with navy lettering in light mode and reversed lettering in dark mode. */
export function BrandLogo({ className }: { className?: string }) {
  const base = import.meta.env.BASE_URL
  return (
    <span className={cn("relative inline-flex", className)}>
      <img src={`${base}brand/asp-logo.png`} alt="ASP Aero Tech" className="h-full w-auto object-contain dark:hidden" draggable={false} />
      <img src={`${base}brand/asp-logo-reversed.png`} alt="ASP Aero Tech" className="hidden h-full w-auto object-contain dark:block" draggable={false} />
    </span>
  )
}
