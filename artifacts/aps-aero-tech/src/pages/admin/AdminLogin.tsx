import { useState } from "react"
import { useAdminLogin, getGetAdminSessionQueryKey } from "@workspace/api-client-react"
import { useQueryClient } from "@tanstack/react-query"
import { Shield, Lock, User, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function AdminLogin({ onWantsSetup }: { onWantsSetup: () => void }) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [errorMsg, setErrorMsg] = useState("")
  
  const queryClient = useQueryClient()
  const login = useAdminLogin()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg("")
    login.mutate({ data: { username, password } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetAdminSessionQueryKey() })
      },
      onError: (err: any) => {
        setErrorMsg(err?.error || "Authentication failed. Access denied.")
      }
    })
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center relative p-6">
      <div className="absolute inset-0 pointer-events-none opacity-20"
        style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, var(--primary) 1px, transparent 1px)', backgroundSize: '40px 40px' }}
      />
      
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-10">
          <img src="/asp-logo.png" alt="ASP Aero Tech" className="h-24 mx-auto mb-6 object-contain" />
          <h1 className="text-3xl font-display font-bold tracking-widest text-foreground uppercase mb-2">Command Center</h1>
          <p className="text-muted-foreground font-mono text-sm">IDENTIFY YOURSELF TO PROCEED</p>
        </div>

        <div className="bg-card border border-border clip-edges p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  className="pl-10 h-12 bg-background/50 border-primary/20 focus-visible:border-primary focus-visible:ring-primary/50 text-base"
                  placeholder="USERNAME / CALLSIGN"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="password"
                  className="pl-10 h-12 bg-background/50 border-primary/20 focus-visible:border-primary focus-visible:ring-primary/50 text-base"
                  placeholder="PASSWORD / CLEARANCE CODE"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {errorMsg && (
              <div className="text-destructive font-mono text-xs p-3 border border-destructive/30 bg-destructive/10">
                {errorMsg}
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full h-12 text-base font-bold tracking-widest gap-2"
              disabled={login.isPending}
            >
              {login.isPending ? "VERIFYING..." : "AUTHORIZE UPLINK"}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-border text-center">
            <button 
              onClick={onWantsSetup}
              className="text-xs font-mono text-muted-foreground hover:text-primary transition-colors uppercase tracking-wider"
            >
              Initialize First Administrator
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
