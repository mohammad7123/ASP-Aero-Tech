import { useState } from "react"
import { useSetupAdmin, getGetAdminSessionQueryKey } from "@workspace/api-client-react"
import { useQueryClient } from "@tanstack/react-query"
import { Shield, Lock, User, ArrowLeft, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

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
    setup.mutate({ data: { username, password, email: email || undefined } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetAdminSessionQueryKey() })
      },
      onError: (err: any) => {
        setErrorMsg(err?.error || "Setup failed. Check constraints.")
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
          <Shield className="w-16 h-16 text-primary mx-auto mb-6" />
          <h1 className="text-3xl font-display font-bold tracking-widest text-foreground uppercase mb-2">System Genesis</h1>
          <p className="text-muted-foreground font-mono text-sm">INITIALIZE PRIMARY OVERSEER</p>
        </div>

        <div className="bg-card border border-border clip-edges p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  className="pl-10 h-12 bg-background/50 border-primary/20"
                  placeholder="NEW USERNAME (Min 3 chars)"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  minLength={3}
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="password"
                  className="pl-10 h-12 bg-background/50 border-primary/20"
                  placeholder="MASTER PASSWORD (Min 8 chars)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                />
              </div>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="email"
                  className="pl-10 h-12 bg-background/50 border-primary/20"
                  placeholder="RECOVERY EMAIL (Optional)"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
              className="w-full h-12 text-base font-bold tracking-widest"
              disabled={setup.isPending}
            >
              {setup.isPending ? "INITIALIZING..." : "EXECUTE GENESIS PROTOCOL"}
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-border text-center">
            <button 
              onClick={onCancel}
              className="flex items-center justify-center w-full gap-2 text-xs font-mono text-muted-foreground hover:text-primary transition-colors uppercase tracking-wider"
            >
              <ArrowLeft className="w-4 h-4" />
              Abort Sequence
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
