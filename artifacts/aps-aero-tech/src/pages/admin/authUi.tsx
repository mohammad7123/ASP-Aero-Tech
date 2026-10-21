import { forwardRef, useId, useState, type ComponentType, type InputHTMLAttributes, type KeyboardEvent, type ReactNode } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { AlertCircle, ArrowRight, Eye, EyeOff, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

/** Pulls the server's `{ error }` message out of an ApiError, falling back to a friendly default. */
export function apiErrorMessage(error: unknown, fallback: string) {
  const data = (error as { data?: { error?: unknown } } | null)?.data
  return typeof data?.error === "string" && data.error ? data.error : fallback
}

type FieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string
  icon: ComponentType<{ className?: string }>
  trailing?: ReactNode
  hint?: ReactNode
}

export const AuthField = forwardRef<HTMLInputElement, FieldProps>(function AuthField({ label, icon: Icon, trailing, hint, className, id, ...props }, ref) {
  const autoId = useId()
  const inputId = id ?? autoId
  return (
    <div className="space-y-2">
      <label htmlFor={inputId} className="text-sm font-medium text-foreground/90">{label}</label>
      <div className="group relative">
        <Icon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-secondary" />
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "h-12 w-full rounded-xl border border-input bg-background/60 pl-10 pr-11 text-[15px] text-foreground shadow-sm outline-none transition-all placeholder:text-muted-foreground/70",
            "focus:border-secondary focus:bg-background focus:ring-4 focus:ring-secondary/15 aria-[invalid=true]:border-destructive",
            className,
          )}
          {...props}
        />
        {trailing && <div className="absolute right-1.5 top-1/2 -translate-y-1/2">{trailing}</div>}
      </div>
      {hint}
    </div>
  )
})

export function PasswordField(props: Omit<FieldProps, "type" | "trailing">) {
  const [visible, setVisible] = useState(false)
  const [capsLock, setCapsLock] = useState(false)
  const checkCaps = (event: KeyboardEvent<HTMLInputElement>) => setCapsLock(event.getModifierState?.("CapsLock") ?? false)
  return (
    <AuthField
      {...props}
      type={visible ? "text" : "password"}
      onKeyUp={checkCaps}
      onKeyDown={checkCaps}
      onBlur={() => setCapsLock(false)}
      trailing={
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label={visible ? "Hide password" : "Show password"}
        >
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      }
      hint={
        <>
          {props.hint}
          <AnimatePresence>
            {capsLock && (
              <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="text-xs font-medium text-secondary">
                Caps Lock is on
              </motion.p>
            )}
          </AnimatePresence>
        </>
      }
    />
  )
}

export function passwordScore(password: string) {
  let score = 0
  if (password.length >= 8) score++
  if (password.length >= 12) score++
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++
  if (/\d/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++
  return Math.min(4, score)
}

const strengthLabels = ["Too short", "Weak", "Fair", "Good", "Strong"]
const strengthColors = ["bg-destructive", "bg-destructive", "bg-secondary", "bg-primary", "bg-accent"]

export function PasswordStrength({ password }: { password: string }) {
  const score = password.length < 8 ? 0 : Math.max(1, passwordScore(password))
  if (!password) return null
  return (
    <div className="space-y-1.5" aria-live="polite">
      <div className="flex gap-1.5">
        {[1, 2, 3, 4].map((step) => (
          <div key={step} className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
            <motion.div
              className={cn("h-full rounded-full", strengthColors[score])}
              initial={false}
              animate={{ width: score >= step ? "100%" : "0%" }}
              transition={{ duration: 0.35, ease: "easeOut" }}
            />
          </div>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        Strength: <span className="font-semibold text-foreground">{strengthLabels[score]}</span>
        {score < 3 && " · use 12+ characters with mixed case, numbers and symbols"}
      </p>
    </div>
  )
}

export function FormError({ message }: { message: string }) {
  return (
    <AnimatePresence mode="wait">
      {message && (
        <motion.div
          key={message}
          role="alert"
          initial={{ opacity: 0, x: 0 }}
          animate={{ opacity: 1, x: [0, -8, 8, -5, 5, 0] }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-start gap-2.5 rounded-xl border border-destructive/30 bg-destructive/10 px-3.5 py-3 text-sm text-destructive"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export function SubmitButton({ pending, children, pendingLabel, disabled }: { pending: boolean; children: ReactNode; pendingLabel: string; disabled?: boolean }) {
  return (
    <motion.button
      type="submit"
      disabled={pending || disabled}
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.98 }}
      className="group relative flex h-12 w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-primary text-[15px] font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-opacity disabled:cursor-not-allowed disabled:opacity-60"
    >
      <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
      {pending ? pendingLabel : children}
      {!pending && <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />}
    </motion.button>
  )
}

/** Wraps form children so they cascade in one after another. */
export const stagger = {
  container: { hidden: {}, show: { transition: { staggerChildren: 0.07, delayChildren: 0.15 } } },
  item: { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const } } },
}
