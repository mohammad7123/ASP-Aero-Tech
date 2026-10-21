import { useEffect, useState, type ComponentType } from "react"
import { useRequestAdminPasswordReset } from "@workspace/api-client-react"
import { AnimatePresence, motion } from "framer-motion"
import { Link, useLocation } from "wouter"
import { ArrowLeft, ChevronRight, ExternalLink, KeyRound, Link2, LifeBuoy, Mail, MailCheck, User } from "lucide-react"
import { cn } from "@/lib/utils"
import { AuthCard, AuthLayout } from "./AuthLayout"
import { AuthField, FormError, SubmitButton, apiErrorMessage, stagger } from "./authUi"

type Step = "choose" | "email" | "sent" | "code" | "help"

const slide = {
  initial: { opacity: 0, x: 24 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] as const } },
  exit: { opacity: 0, x: -24, transition: { duration: 0.2 } },
}

function OptionCard({ icon: Icon, title, description, onClick }: { icon: ComponentType<{ className?: string }>; title: string; description: string; onClick: () => void }) {
  return (
    <motion.button
      type="button"
      variants={stagger.item}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      className="group flex w-full items-center gap-4 rounded-xl border border-border bg-background/60 p-4 text-left transition-colors hover:border-secondary/50 hover:bg-secondary/5"
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground transition-colors group-hover:bg-secondary group-hover:text-secondary-foreground">
        <Icon className="h-5 w-5" />
      </span>
      <span className="flex-1">
        <span className="block text-[15px] font-semibold">{title}</span>
        <span className="mt-0.5 block text-sm text-muted-foreground">{description}</span>
      </span>
      <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-secondary" />
    </motion.button>
  )
}

function BackButton({ onClick, label = "All recovery options" }: { onClick: () => void; label?: string }) {
  return (
    <button type="button" onClick={onClick} className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
      <ArrowLeft className="h-4 w-4" /> {label}
    </button>
  )
}

/** Accepts either a full reset URL or the bare token. */
export function extractResetToken(input: string) {
  const value = input.trim()
  try {
    const url = new URL(value)
    return url.searchParams.get("token") ?? ""
  } catch {
    return value.replace(/^token=/, "")
  }
}

export function AdminForgotPassword() {
  const [, setLocation] = useLocation()
  const [step, setStep] = useState<Step>("choose")
  const [identifier, setIdentifier] = useState("")
  const [code, setCode] = useState("")
  const [errorMsg, setErrorMsg] = useState("")
  const [devResetUrl, setDevResetUrl] = useState<string | null>(null)
  const [cooldown, setCooldown] = useState(0)
  const request = useRequestAdminPasswordReset()

  useEffect(() => {
    if (cooldown <= 0) return
    const timer = setTimeout(() => setCooldown((s) => s - 1), 1000)
    return () => clearTimeout(timer)
  }, [cooldown])

  const go = (next: Step) => {
    setErrorMsg("")
    setStep(next)
  }

  const sendLink = () => {
    setErrorMsg("")
    request.mutate({ data: { identifier: identifier.trim() } }, {
      onSuccess: (result) => {
        setDevResetUrl(result.devResetUrl)
        setCooldown(30)
        setStep("sent")
      },
      onError: (err) => setErrorMsg(apiErrorMessage(err, "We couldn't send the reset link. Try again in a moment.")),
    })
  }

  const openCode = () => {
    const token = extractResetToken(code)
    if (!token) { setErrorMsg("Paste the full link from the email, or the code after token="); return }
    setLocation(`/admin/reset-password?token=${encodeURIComponent(token)}`)
  }

  const devPath = devResetUrl ? `/admin/reset-password?token=${encodeURIComponent(extractResetToken(devResetUrl))}` : null

  return (
    <AuthLayout>
      <AnimatePresence mode="wait">
        <motion.div key={step} {...slide}>
          {step === "choose" && (
            <AuthCard icon={<LifeBuoy className="h-6 w-6" />} title="Forgot your password?" subtitle="Choose how you'd like to get back into the admin console.">
              <motion.div variants={stagger.container} initial="hidden" animate="show" className="space-y-3">
                <OptionCard icon={Mail} title="Email me a reset link" description="Sent to the recovery email on your account" onClick={() => go("email")} />
                <OptionCard icon={Link2} title="I already have a reset link" description="Paste the link or code from your email" onClick={() => go("code")} />
                <OptionCard icon={User} title="No access to your email?" description="Other ways to recover the account" onClick={() => go("help")} />
              </motion.div>
              <Link href="/admin" className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
                <ArrowLeft className="h-4 w-4" /> Back to sign in
              </Link>
            </AuthCard>
          )}

          {step === "email" && (
            <AuthCard icon={<Mail className="h-6 w-6" />} title="Reset by email" subtitle="Enter your username or recovery email. If it matches an administrator, we'll email a link that works once and expires in 30 minutes.">
              <form onSubmit={(e) => { e.preventDefault(); sendLink() }} className="space-y-5">
                <AuthField label="Username or email" icon={User} placeholder="admin or you@company.com" autoComplete="username" autoFocus value={identifier} onChange={(e) => setIdentifier(e.target.value)} required />
                <FormError message={errorMsg} />
                <SubmitButton pending={request.isPending} pendingLabel="Sending…">Send reset link</SubmitButton>
              </form>
              <BackButton onClick={() => go("choose")} />
            </AuthCard>
          )}

          {step === "sent" && (
            <AuthCard
              icon={<MailCheck className="h-6 w-6" />}
              title="Check your inbox"
              subtitle={<>If <span className="font-semibold text-foreground">{identifier}</span> matches an administrator with a recovery email, a reset link is on its way. It expires in 30 minutes.</>}
            >
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.15 }} className="space-y-4">
                <ul className="space-y-2 rounded-xl bg-muted/60 p-4 text-sm text-muted-foreground">
                  <li>• Check spam or junk folders.</li>
                  <li>• Only the most recent link works.</li>
                  <li>• No email? The account may not have a recovery email yet.</li>
                </ul>
                {devPath && (
                  <div className="rounded-xl border border-dashed border-secondary/50 bg-secondary/5 p-4">
                    <p className="text-sm font-semibold">Development mode</p>
                    <p className="mt-1 text-sm text-muted-foreground">Email may not be configured, so here's the link the server generated. This is never shown in production.</p>
                    <button type="button" onClick={() => setLocation(devPath)} className="mt-3 inline-flex items-center gap-2 rounded-lg bg-secondary px-3 py-2 text-sm font-semibold text-secondary-foreground">
                      <ExternalLink className="h-4 w-4" /> Open reset link
                    </button>
                  </div>
                )}
                <button
                  type="button"
                  disabled={cooldown > 0 || request.isPending}
                  onClick={sendLink}
                  className="w-full rounded-xl border border-border py-3 text-sm font-semibold transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {cooldown > 0 ? `Resend available in ${cooldown}s` : "Resend link"}
                </button>
                <FormError message={errorMsg} />
              </motion.div>
              <BackButton onClick={() => go("choose")} />
            </AuthCard>
          )}

          {step === "code" && (
            <AuthCard icon={<KeyRound className="h-6 w-6" />} title="Use your reset link" subtitle="Paste the whole link from the email (or just the code after token=).">
              <form onSubmit={(e) => { e.preventDefault(); openCode() }} className="space-y-5">
                <AuthField label="Reset link or code" icon={Link2} placeholder="https://…/admin/reset-password?token=…" autoFocus value={code} onChange={(e) => setCode(e.target.value)} required />
                <FormError message={errorMsg} />
                <SubmitButton pending={false} pendingLabel="">Continue</SubmitButton>
              </form>
              <BackButton onClick={() => go("choose")} />
            </AuthCard>
          )}

          {step === "help" && (
            <AuthCard icon={<LifeBuoy className="h-6 w-6" />} title="Other ways back in" subtitle="Reset links can only go to the recovery email saved on the account.">
              <motion.ol variants={stagger.container} initial="hidden" animate="show" className="space-y-3">
                {[
                  ["Ask another administrator", "They can sign in and help you regain access, or confirm which email is on your account."],
                  ["Ask your developer or host", "Whoever runs the server can restore access for you."],
                  ["Set a recovery email afterwards", "Once you're back in, add one under Account & Security so email reset works next time."],
                ].map(([title, text], index) => (
                  <motion.li key={title} variants={stagger.item} className="flex gap-3 rounded-xl border border-border bg-background/60 p-4">
                    <span className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold", index === 2 ? "bg-accent text-accent-foreground" : "bg-muted text-foreground")}>{index + 1}</span>
                    <span>
                      <span className="block text-sm font-semibold">{title}</span>
                      <span className="mt-0.5 block text-sm text-muted-foreground">{text}</span>
                    </span>
                  </motion.li>
                ))}
              </motion.ol>
              <BackButton onClick={() => go("choose")} />
            </AuthCard>
          )}
        </motion.div>
      </AnimatePresence>
    </AuthLayout>
  )
}
