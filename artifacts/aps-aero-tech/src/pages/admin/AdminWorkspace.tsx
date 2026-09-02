import { Route, Switch, useLocation } from "wouter"
import { AdminOverview } from "./AdminOverview"
import { AdminResourceView } from "./AdminResourceView"
import { Sidebar } from "./Sidebar"
import { Shield, LogOut } from "lucide-react"
import { useAdminLogout, getGetAdminSessionQueryKey } from "@workspace/api-client-react"
import { useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"

export function AdminWorkspace() {
  const queryClient = useQueryClient()
  const logout = useAdminLogout()
  const [, setLocation] = useLocation()

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetAdminSessionQueryKey() })
        setLocation("/")
      }
    })
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex overflow-hidden">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        
        {/* Top Navbar */}
        <header className="h-16 border-b border-border bg-card flex items-center justify-between px-6 shrink-0 z-10 relative">
          <div className="absolute inset-0 pointer-events-none opacity-10"
            style={{ backgroundImage: 'linear-gradient(90deg, var(--primary) 1px, transparent 1px)', backgroundSize: '100px 100%' }}
          />
          <div className="flex items-center gap-4 z-10">
            <h2 className="font-display font-bold tracking-widest text-lg uppercase text-muted-foreground hidden sm:block">Command Console</h2>
            <div className="flex items-center gap-2 font-mono text-xs text-primary px-3 py-1 bg-primary/10 border border-primary/20 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              SECURE CONNECTION
            </div>
          </div>

          <div className="flex items-center gap-4 z-10">
            <Button variant="ghost" size="sm" onClick={handleLogout} className="text-muted-foreground hover:text-destructive hover:bg-destructive/10">
              <LogOut className="w-4 h-4 mr-2" />
              TERMINATE
            </Button>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-auto p-6 md:p-8 bg-background relative">
          <div className="max-w-7xl mx-auto w-full">
            <Switch>
              <Route path="/admin" component={AdminOverview} />
              <Route path="/admin/resources/:resource" component={AdminResourceView} />
            </Switch>
          </div>
        </main>
      </div>
    </div>
  )
}
