import { useEffect, useState } from "react"
import {
  getGetAdminSessionQueryKey,
  getVerifyAdminResetTokenQueryKey,
  useResetAdminPassword,
  useVerifyAdminResetToken,
} from "@workspace/api-client-react"
import { useQueryClient } from "@tanstack/react-query"
import { AnimatePresence, motion } from "framer-motion"
import { Link, useLocation, useSearch } from "wouter"
import { ArrowLeft, Check, Clock, Loader2, Lock, ShieldAlert, ShieldCheck } from "lucide-react"
import { AuthCard, AuthLayout } from "./AuthLayout"
import { FormError, PasswordField, PasswordStrength, SubmitButton, apiErrorMessage, stagger } from "./authUi"

function SuccessMark() {
  return (
    <motion.svg viewBox="0 0 52 52" className="h-20 w-20" initial="hidden" animate="show">
      <motion.circle cx="26" cy="26" r="24" fill="none" className="stroke-accent" strokeWidth="3"
        variants={{ hidden: { pathLength: 0 }, show: { pathLength: 1, transition: { duration: 0.6, ease: "easeOut" } } }} />
      <motion.path d="M15 27 l7 7 l15 -16" fill="none" className="stroke-accent" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"
        variants={{ hidden: { pathLength: 0 }, show: { pathLength: 1, transition: { delay: 0.5, duration: 0.4, ease: "easeOut" } } }} />
    </motion.svg>
  )
}

export function AdminResetPassword() {
  const search = useSearch()
  const token = new URLSearchParams(search).get("token") ?? ""
  const [, setLocation] = useLocation()
  const queryClient = useQueryClient()
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [errorMsg, setErrorMsg] = useState("")
  const [done, setDone] = useState(false)

  const status = useVerifyAdminResetToken({ token }, {
    query: { queryKey: getVerifyAdminResetTokenQueryKey({ token }), enabled: Boolean(token), retry: false, staleTime: Infinity },
  })
  const reset = useResetAdminPassword()

  useEffect(() => {
    if (!done) return
    const timer = setTimeout(() => {
      queryClient.invalidateQueries({ queryKey: getGetAdminSessionQueryKey() })
      setLocation("/admin")
    }, 1800)
    return () => clearTimeout(timer)
  }, [done, queryClient, setLocation])

  const submit = () => {
    setErrorMsg("")
    if (password.length < 8) { setErrorMsg("Use at least 8 characters."); return }
    if (password !== confirm) { setErrorMsg("The two passwords don't match."); return }
    reset.mutate({ data: { token, password } }, {
      onSuccess: () => setDone(true),
      onError: (err) => setErrorMsg(apiErrorMessage(err, "We couldn't update your password. Request a new link and try again.")),
    })
  }

  const valid = status.data?.valid
  const expiresAt = status.data?.expiresAt ? new Date(status.data.expiresAt) : null
  const state = done ? "done" : !token || (status.isSuccess && !valid) || status.isError ? "invalid" : status.isLoading ? "loading" : "form"

  return (
    <AuthLayout>
      <AnimatePresence mode="wait">
        <motion.div key={state} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.3 }}>
          {state === "loading" && (
            <AuthCard title="Checking your link…" subtitle="One moment while we verify the reset link.">
              <div className="flex justify-center py-6"><Loader2 className="h-8 w-8 animate-spin text-secondary" /></div>
            </AuthCard>
          )}

          {state === "invalid" && (
            <AuthCard icon={<ShieldAlert className="h-6 w-6" />} title="This link can't be used" subtitle="Reset links work once and expire after 30 minutes. Requesting a new link cancels older ones.">
              <Link href="/admin/forgot-password" className="flex h-12 w-full items-center justify-center rounded-xl bg-primary text-[15px] font-semibold text-primary-foreground shadow-lg shadow-primary/20">
                Request a new link
              </Link>
              <Link href="/admin" className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-4 w-4" /> Back to sign in
              </Link>
            </AuthCard>
          )}

          {state === "form" && (
            <AuthCard
              icon={<ShieldCheck className="h-6 w-6" />}
              title="Choose a new password"
              subtitle={<>Resetting the password for <span className="font-semibold text-foreground">{status.data?.username}</span>. You'll be signed out everywhere else.</>}
            >
              <motion.form variants={stagger.container} initial="hidden" animate="show" onSubmit={(e) => { e.preventDefault(); submit() }} className="space-y-5">
                <motion.div variants={stagger.item} className="space-y-3">
                  <PasswordField label="New password" icon={Lock} placeholder="At least 8 characters" autoComplete="new-password" autoFocus value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
                  <PasswordStrength password={password} />
                </motion.div>
                <motion.div variants={stagger.item}>
                  <PasswordField
                    label="Confirm new password"
                    icon={Lock}
                    placeholder="Type it again"
                    autoComplete="new-password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    aria-invalid={Boolean(confirm) && confirm !== password}
                    required
                    hint={confirm && confirm === password ? <p className="flex items-center gap-1 text-xs font-medium text-accent"><Check className="h-3.5 w-3.5" /> Passwords match</p> : null}
                  />
                </motion.div>
                <FormError message={errorMsg} />
                <motion.div variants={stagger.item}>
                  <SubmitButton pending={reset.isPending} pendingLabel="Saving…">Update password & sign in</SubmitButton>
                </motion.div>
                {expiresAt && (
                  <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" /> Link valid until {expiresAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                )}
              </motion.form>
            </AuthCard>
          )}

          {state === "done" && (
            <AuthCard title="Password updated" subtitle="You're signed in. Taking you to the console…">
              <div className="flex justify-center py-4"><SuccessMark /></div>
            </AuthCard>
          )}
        </motion.div>
      </AnimatePresence>
    </AuthLayout>
  )
}
