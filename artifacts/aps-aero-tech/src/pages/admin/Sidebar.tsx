import { Link, useLocation } from "wouter"
import { LayoutDashboard, Users, MessageSquare, Briefcase, FileText, Image, Settings, Layers, Box, Factory, Mail, Menu, Newspaper, Target } from "lucide-react"
import { cn } from "@/components/ui/button"

export const ADMIN_RESOURCES = [
  { id: "inquiries", label: "Inquiries", icon: Mail },
  { id: "hero-slides", label: "Hero Slides", icon: Image },
  { id: "services", label: "Services", icon: Briefcase },
  { id: "products", label: "Products", icon: Box },
  { id: "industries", label: "Industries", icon: Factory },
  { id: "pages", label: "Pages", icon: Layers },
  { id: "content-blocks", label: "Content Blocks", icon: FileText },
  { id: "portfolio", label: "Portfolio", icon: Image },
  { id: "clients", label: "Clients", icon: Users },
  { id: "jobs", label: "Jobs", icon: Briefcase },
  { id: "applications", label: "Applications", icon: FileText },
  { id: "blog-categories", label: "Blog Categories", icon: Layers },
  { id: "blog-posts", label: "Blog Posts", icon: Newspaper },
  { id: "campaigns", label: "Campaigns", icon: Target },
  { id: "menu-items", label: "Menu Items", icon: Menu },
  { id: "media", label: "Media Library", icon: Image },
  { id: "settings", label: "System Settings", icon: Settings },
]

export function Sidebar() {
  const [location] = useLocation()

  return (
    <aside className="w-64 border-r border-border bg-card shrink-0 flex flex-col h-screen overflow-hidden hidden md:flex relative">
      <div className="absolute top-0 right-0 w-px h-full bg-gradient-to-b from-primary/50 to-transparent pointer-events-none" />
      
      <div className="h-20 border-b border-border flex items-center px-6 shrink-0 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/5" />
        <Link href="/" className="relative z-10 flex items-center h-full">
          <img src="/asp-logo.png" alt="ASP Aero Tech" className="h-10 w-auto object-contain hover:opacity-80 transition-opacity" />
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto py-6 px-4 space-y-8 scrollbar-thin">
        <div>
          <div className="px-2 mb-3 text-xs font-mono text-muted-foreground uppercase tracking-wider font-bold">
            Telemetry
          </div>
          <Link href="/admin">
            <span className={cn(
              "flex items-center gap-3 px-3 py-2 text-sm font-medium transition-colors cursor-pointer group clip-edges",
              location === "/admin" 
                ? "bg-primary/20 text-primary border border-primary/30" 
                : "text-muted-foreground hover:bg-white/5 hover:text-foreground border border-transparent"
            )}>
              <LayoutDashboard className={cn("w-4 h-4", location === "/admin" ? "text-primary" : "group-hover:text-primary")} />
              Overview
            </span>
          </Link>
        </div>

        <div>
          <div className="px-2 mb-3 text-xs font-mono text-muted-foreground uppercase tracking-wider font-bold">
            Data Modules
          </div>
          <div className="space-y-1">
            {ADMIN_RESOURCES.map(res => {
              const isActive = location === `/admin/resources/${res.id}`
              const Icon = res.icon
              return (
                <Link key={res.id} href={`/admin/resources/${res.id}`}>
                  <span className={cn(
                    "flex items-center gap-3 px-3 py-2 text-sm font-medium transition-colors cursor-pointer group clip-edges",
                    isActive 
                      ? "bg-primary/20 text-primary border border-primary/30" 
                      : "text-muted-foreground hover:bg-white/5 hover:text-foreground border border-transparent"
                  )}>
                    <Icon className={cn("w-4 h-4", isActive ? "text-primary" : "group-hover:text-primary")} />
                    {res.label}
                  </span>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </aside>
  )
}
