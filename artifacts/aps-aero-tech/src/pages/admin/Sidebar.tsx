import { useLayoutEffect, useRef, type ComponentType } from "react"
import { Link, useLocation } from "wouter"
import { motion } from "framer-motion"
import gsap from "gsap"
import { LayoutDashboard, Users, Briefcase, FileText, Image, Settings, Layers, Box, Factory, Mail, Menu, Newspaper, Megaphone } from "lucide-react"
import { cn } from "@/lib/utils"
import { BrandLogo, prefersReducedMotion } from "./theme"

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
  { id: "menu-items", label: "Menu Items", icon: Menu },
  { id: "media", label: "Media Library", icon: Image },
]

export const ADMIN_PAGES = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/marketing", label: "Marketing Hub", icon: Megaphone },
  { href: "/admin/settings", label: "System Settings", icon: Settings },
]

/** Human title for the current admin route, used by the header and document title. */
export function adminPageTitle(location: string) {
  const page = ADMIN_PAGES.find((p) => p.href === location || (p.href !== "/admin" && location.startsWith(p.href)))
  if (page) return page.label
  const resource = ADMIN_RESOURCES.find((r) => location === `/admin/resources/${r.id}`)
  return resource?.label ?? "Admin"
}

function NavItem({ href, label, icon: Icon, active, layoutGroup, onNavigate }: {
  href: string
  label: string
  icon: ComponentType<{ className?: string }>
  active: boolean
  layoutGroup: string
  onNavigate?: () => void
}) {
  return (
    <Link href={href} onClick={onNavigate} data-nav-item className="block">
      <span
        className={cn(
          "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
          active ? "text-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground",
        )}
      >
        {active && (
          <motion.span
            layoutId={`${layoutGroup}-active`}
            className="absolute inset-0 rounded-lg bg-secondary/12 ring-1 ring-secondary/25"
            transition={{ type: "spring", stiffness: 500, damping: 38 }}
          >
            <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-secondary" />
          </motion.span>
        )}
        <Icon className={cn("relative h-4 w-4 transition-colors", active ? "text-secondary" : "group-hover:text-secondary")} />
        <span className="relative">{label}</span>
      </span>
    </Link>
  )
}

export function SidebarContent({ layoutGroup = "sidebar", onNavigate }: { layoutGroup?: string; onNavigate?: () => void }) {
  const [location] = useLocation()
  const list = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    if (!list.current || prefersReducedMotion()) return
    const ctx = gsap.context(() => {
      gsap.from("[data-nav-heading], [data-nav-item]", { x: -14, opacity: 0, duration: 0.45, ease: "power3.out", stagger: 0.025, clearProps: "all" })
    }, list)
    return () => ctx.revert()
  }, [])

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-[72px] shrink-0 items-center border-b border-border px-5">
        <Link href="/" onClick={onNavigate} className="flex h-10 items-center transition-opacity hover:opacity-80" aria-label="Open public website">
          <BrandLogo className="h-10" />
        </Link>
      </div>

      <div ref={list} className="admin-scroll flex-1 space-y-7 overflow-y-auto px-3 py-5">
        <div>
          <p data-nav-heading className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/80">Dashboard</p>
          <div className="space-y-0.5">
            {ADMIN_PAGES.map((page) => (
              <NavItem
                key={page.href}
                {...page}
                layoutGroup={layoutGroup}
                onNavigate={onNavigate}
                active={page.href === "/admin" ? location === "/admin" : location.startsWith(page.href)}
              />
            ))}
          </div>
        </div>

        <div>
          <p data-nav-heading className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/80">Content</p>
          <div className="space-y-0.5">
            {ADMIN_RESOURCES.map((res) => (
              <NavItem
                key={res.id}
                href={`/admin/resources/${res.id}`}
                label={res.label}
                icon={res.icon}
                layoutGroup={layoutGroup}
                onNavigate={onNavigate}
                active={location === `/admin/resources/${res.id}`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="shrink-0 border-t border-border p-4">
        <div className="flex h-1 overflow-hidden rounded-full" aria-hidden="true">
          <span className="flex-1 bg-secondary" />
          <span className="flex-1 bg-white ring-1 ring-inset ring-border" />
          <span className="flex-1 bg-accent" />
        </div>
        <p className="mt-3 text-xs text-muted-foreground">ASP Aertech Pvt. Ltd. · Admin</p>
      </div>
    </div>
  )
}

export function Sidebar() {
  return (
    <aside className="relative hidden h-screen w-64 shrink-0 border-r border-border bg-card md:block">
      <SidebarContent />
    </aside>
  )
}
