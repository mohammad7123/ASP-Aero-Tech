import { useState } from "react"
import { useSetupAdmin, getGetAdminSessionQueryKey } from "@workspace/api-client-react"
import { useQueryClient } from "@tanstack/react-query"
import { motion } from "framer-motion"
import { ArrowLeft, Lock, Mail, Sparkles, User } from "lucide-react"
import { AuthCard, AuthLayout } from "./AuthLayout"
import { AuthField, FormError, PasswordField, PasswordStrength, SubmitButton, apiErrorMessage, stagger } from "./authUi"

export function AdminSetup({ onCancel }: { onCancel: () => void }) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [email, setEmail] = useState("")
  const [errorMsg, setErrorMsg] = useState("")

  const queryClient = useQueryClient()
  const setup = useSetupAdmin()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg("")
    setup.mutate({ data: { username: username.trim(), password, email: email.trim() || undefined } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetAdminSessionQueryKey() })
      },
      onError: (err) => setErrorMsg(apiErrorMessage(err, "Setup failed. Check the details and try again.")),
    })
  }

  return (
    <AuthLayout>
      <AuthCard icon={<Sparkles className="h-6 w-6" />} title="Create the first administrator" subtitle="This one-time setup is only available while no administrator exists.">
        <motion.form variants={stagger.container} initial="hidden" animate="show" onSubmit={handleSubmit} className="space-y-5">
          <motion.div variants={stagger.item}>
            <AuthField label="Username" icon={User} placeholder="At least 3 characters" autoComplete="username" autoFocus value={username} onChange={(e) => setUsername(e.target.value)} required minLength={3} />
          </motion.div>
          <motion.div variants={stagger.item} className="space-y-3">
            <PasswordField label="Password" icon={Lock} placeholder="At least 8 characters" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
            <PasswordStrength password={password} />
          </motion.div>
          <motion.div variants={stagger.item}>
            <AuthField
              label="Recovery email (recommended)"
              icon={Mail}
              type="email"
              placeholder="you@company.com"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              hint={<p className="text-xs text-muted-foreground">Needed to reset your password by email.</p>}
            />
          </motion.div>

          <FormError message={errorMsg} />

          <motion.div variants={stagger.item}>
            <SubmitButton pending={setup.isPending} pendingLabel="Creating…">Create administrator</SubmitButton>
          </motion.div>
        </motion.form>

        <button onClick={onCancel} className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to sign in
        </button>
      </AuthCard>
    </AuthLayout>
  )
}
