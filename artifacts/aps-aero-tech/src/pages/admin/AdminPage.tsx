import { useGetAdminSession } from "@workspace/api-client-react"
import { MotionConfig, motion } from "framer-motion"
import { useState } from "react"
import { useLocation } from "wouter"
import { AdminLogin } from "./AdminLogin"
import { AdminSetup } from "./AdminSetup"
import { AdminWorkspace } from "./AdminWorkspace"
import { AdminForgotPassword } from "./AdminForgotPassword"
import { AdminResetPassword } from "./AdminResetPassword"
import { AdminThemeProvider, BrandLogo } from "./theme"

function AdminGate() {
  const { data: session, isLoading } = useGetAdminSession()
  const [wantsSetup, setWantsSetup] = useState(false)
  const [location] = useLocation()

  // Recovery screens work whether or not someone is signed in.
  if (location === "/admin/forgot-password") return <AdminForgotPassword />
  if (location === "/admin/reset-password") return <AdminResetPassword />

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center gap-6">
          <BrandLogo className="h-16" />
          <div className="h-1 w-40 overflow-hidden rounded-full bg-muted">
            <motion.div
              className="h-full w-1/3 rounded-full bg-gradient-to-r from-secondary via-white to-accent"
              animate={{ x: ["-100%", "300%"] }}
              transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
        </motion.div>
      </div>
    )
  }

  if (!session?.authenticated) {
    if (wantsSetup && session?.setupAvailable) {
      return <AdminSetup onCancel={() => setWantsSetup(false)} />
    }
    return (
      <AdminLogin
        onWantsSetup={() => setWantsSetup(true)}
        setupAvailable={Boolean(session?.setupAvailable)}
        testLoginEnabled={Boolean(session?.testLoginEnabled)}
      />
    )
  }

  return <AdminWorkspace />
}

export default function AdminPage() {
  return (
    <AdminThemeProvider>
      <MotionConfig reducedMotion="user">
        <AdminGate />
      </MotionConfig>
    </AdminThemeProvider>
  )
}
