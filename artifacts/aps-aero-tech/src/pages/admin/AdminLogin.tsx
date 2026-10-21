import { useState } from "react"
import { useAdminLogin, getGetAdminSessionQueryKey } from "@workspace/api-client-react"
import { useQueryClient } from "@tanstack/react-query"
import { motion } from "framer-motion"
import { Link } from "wouter"
import { FlaskConical, KeyRound, Lock, Sparkles, User } from "lucide-react"
import { AuthCard, AuthLayout } from "./AuthLayout"
import { AuthField, FormError, PasswordField, SubmitButton, apiErrorMessage, stagger } from "./authUi"

export function AdminLogin({ onWantsSetup, setupAvailable, testLoginEnabled }: {
  onWantsSetup: () => void
  setupAvailable: boolean
  testLoginEnabled: boolean
}) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [errorMsg, setErrorMsg] = useState("")

  const queryClient = useQueryClient()
  const login = useAdminLogin()

  const signIn = (credentials: { username: string; password: string }) => {
    setErrorMsg("")
    login.mutate({ data: credentials }, {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetAdminSessionQueryKey() }),
      onError: (err) => setErrorMsg(apiErrorMessage(err, "Sign-in failed. Check your connection and try again.")),
    })
  }

  const signInWithTestAccount = () => {
    setUsername("admin")
    setPassword("admin")
    signIn({ username: "admin", password: "admin" })
  }

  return (
    <AuthLayout>
      <AuthCard
        icon={<KeyRound className="h-6 w-6" />}
        title="Welcome back"
        subtitle="Sign in to manage products, inquiries and site settings."
      >
        <motion.form
          variants={stagger.container}
          initial="hidden"
          animate="show"
          onSubmit={(e) => { e.preventDefault(); signIn({ username: username.trim(), password }) }}
          className="space-y-5"
        >
          <motion.div variants={stagger.item}>
            <AuthField
              label="Username"
              icon={User}
              placeholder="Enter your username"
              autoComplete="username"
              autoFocus
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              aria-invalid={Boolean(errorMsg)}
              required
            />
          </motion.div>
          <motion.div variants={stagger.item} className="space-y-2">
            <PasswordField
              label="Password"
              icon={Lock}
              placeholder="Enter your password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-invalid={Boolean(errorMsg)}
              required
            />
            <div className="flex justify-end">
              <Link href="/admin/forgot-password" className="text-sm font-medium text-secondary underline-offset-4 hover:underline">
                Forgot password?
              </Link>
            </div>
          </motion.div>

          <FormError message={errorMsg} />

          <motion.div variants={stagger.item}>
            <SubmitButton pending={login.isPending} pendingLabel="Signing in…">Sign in</SubmitButton>
          </motion.div>
        </motion.form>

        {testLoginEnabled && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-6 rounded-xl border border-dashed border-secondary/40 bg-secondary/5 p-4"
          >
            <div className="flex items-start gap-3">
              <FlaskConical className="mt-0.5 h-4 w-4 shrink-0 text-secondary" />
              <div className="flex-1 text-sm">
                <p className="font-semibold">Test account available</p>
                <p className="mt-0.5 text-muted-foreground">
                  Username <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-foreground">admin</code> · password{" "}
                  <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-foreground">admin</code>
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={signInWithTestAccount}
              disabled={login.isPending}
              className="mt-3 w-full rounded-lg border border-secondary/40 py-2 text-sm font-semibold text-secondary transition-colors hover:bg-secondary hover:text-secondary-foreground disabled:opacity-50"
            >
              Sign in with test account
            </button>
          </motion.div>
        )}

        {setupAvailable && (
          <div className="mt-6 border-t border-border pt-5 text-center">
            <button onClick={onWantsSetup} className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-secondary">
              <Sparkles className="h-4 w-4" /> First time here? Create the first administrator
            </button>
          </div>
        )}
      </AuthCard>
    </AuthLayout>
  )
}
