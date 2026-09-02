import { useGetAdminSession } from "@workspace/api-client-react"
import { AdminLogin } from "./AdminLogin"
import { AdminSetup } from "./AdminSetup"
import { AdminWorkspace } from "./AdminWorkspace"
import { useState } from "react"
import { Shield } from "lucide-react"

export default function AdminPage() {
  const { data: session, isLoading, error } = useGetAdminSession()
  const [wantsSetup, setWantsSetup] = useState(false)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-primary animate-pulse">
          <Shield className="w-12 h-12" />
          <p className="font-mono text-sm tracking-widest">INITIALIZING SECURE UPLINK...</p>
        </div>
      </div>
    )
  }

  if (!session?.authenticated) {
    if (wantsSetup) {
      return <AdminSetup onCancel={() => setWantsSetup(false)} />
    }
    return <AdminLogin onWantsSetup={() => setWantsSetup(true)} />
  }

  return <AdminWorkspace />
}
