import { useMemo, useState } from "react"
import {
  getListAdminJobApplicationsQueryKey,
  useListAdminJobApplications,
  useUpdateAdminResource,
  type AdminJobApplication,
} from "@workspace/api-client-react"
import { useQueryClient } from "@tanstack/react-query"
import { AnimatePresence, motion } from "framer-motion"
import { ChevronDown, Download, FileText, Inbox, Loader2, Mail, Phone, Search, Users } from "lucide-react"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

const STATUSES = [
  { id: "new", label: "New", tone: "bg-sky-500/12 text-sky-700 ring-sky-500/30 dark:text-sky-300" },
  { id: "reviewing", label: "Reviewing", tone: "bg-amber-500/12 text-amber-700 ring-amber-500/30 dark:text-amber-300" },
  { id: "shortlisted", label: "Shortlisted", tone: "bg-violet-500/12 text-violet-700 ring-violet-500/30 dark:text-violet-300" },
  { id: "hired", label: "Hired", tone: "bg-emerald-500/12 text-emerald-700 ring-emerald-500/30 dark:text-emerald-300" },
  { id: "rejected", label: "Rejected", tone: "bg-rose-500/12 text-rose-700 ring-rose-500/30 dark:text-rose-300" },
] as const

const statusTone = (status: string) => STATUSES.find((s) => s.id === status)?.tone ?? "bg-muted text-muted-foreground ring-border"
const formatDate = (value: string | Date) => new Date(value).toLocaleString([], { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
const cvUrl = (id: number) => `/api/admin/applications/${id}/cv`

function ApplicationRow({ application, onSave, saving }: {
  application: AdminJobApplication
  onSave: (id: number, values: { status?: string; notes?: string }) => void
  saving: boolean
}) {
  const [open, setOpen] = useState(false)
  const [notes, setNotes] = useState(application.notes ?? "")
  return (
    <motion.li layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:p-5">
        <button type="button" onClick={() => setOpen((v) => !v)} className="flex min-w-0 flex-1 items-center gap-4 text-left" aria-expanded={open}>
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-secondary/12 font-display text-sm font-bold text-secondary">
            {application.name.split(/\s+/).map((p) => p[0]).slice(0, 2).join("").toUpperCase()}
          </span>
          <span className="min-w-0">
            <span className="block truncate font-semibold">{application.name}</span>
            <span className="block truncate text-sm text-muted-foreground">
              {application.jobTitle ?? `Job #${application.jobId}`} · {formatDate(application.createdAt)}
            </span>
          </span>
          <ChevronDown className={cn("ml-auto h-4 w-4 shrink-0 text-muted-foreground transition-transform sm:hidden", open && "rotate-180")} />
        </button>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={application.status}
            onChange={(e) => onSave(application.id, { status: e.target.value })}
            disabled={saving}
            aria-label={`Status for ${application.name}`}
            className={cn("h-9 rounded-full border-0 px-3 text-xs font-semibold ring-1 focus:outline-none focus:ring-2 focus:ring-ring", statusTone(application.status))}
          >
            {STATUSES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
            {!STATUSES.some((s) => s.id === application.status) && <option value={application.status}>{application.status}</option>}
          </select>
          {application.hasCv && (
            <a href={cvUrl(application.id)} className="inline-flex h-9 items-center gap-1.5 rounded-full border border-border px-3 text-xs font-semibold transition-colors hover:border-secondary hover:text-secondary">
              <Download className="h-3.5 w-3.5" /> CV
            </a>
          )}
          <button type="button" onClick={() => setOpen((v) => !v)} className="hidden h-9 w-9 items-center justify-center rounded-full text-muted-foreground hover:bg-muted sm:inline-flex" aria-label={open ? "Hide details" : "Show details"}>
            <ChevronDown className={cn("h-4 w-4 transition-transform", open && "rotate-180")} />
          </button>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}>
            <div className="grid gap-5 border-t border-border p-4 sm:p-5 lg:grid-cols-[1fr_320px]">
              <div className="space-y-4">
                <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
                  <a href={`mailto:${application.email}`} className="inline-flex items-center gap-2 text-secondary hover:underline"><Mail className="h-4 w-4" /> {application.email}</a>
                  {application.phone && <a href={`tel:${application.phone}`} className="inline-flex items-center gap-2 hover:underline"><Phone className="h-4 w-4 text-muted-foreground" /> {application.phone}</a>}
                  {application.cvFilename && <span className="inline-flex items-center gap-2 text-muted-foreground"><FileText className="h-4 w-4" /> {application.cvFilename}</span>}
                </div>
                <div>
                  <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Cover letter</p>
                  <p className="whitespace-pre-line rounded-lg bg-muted/60 p-3 text-sm leading-relaxed">{application.coverLetter || "No cover letter provided."}</p>
                </div>
              </div>
              <div>
                <label htmlFor={`notes-${application.id}`} className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Internal notes</label>
                <textarea
                  id={`notes-${application.id}`}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={5}
                  placeholder="Interview feedback, next steps…"
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20"
                />
                <button
                  type="button"
                  disabled={saving || notes === (application.notes ?? "")}
                  onClick={() => onSave(application.id, { notes })}
                  className="mt-2 inline-flex h-9 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground disabled:opacity-50"
                >
                  {saving && <Loader2 className="h-4 w-4 animate-spin" />} Save notes
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.li>
  )
}

export function AdminApplications() {
  const { data, isLoading, error } = useListAdminJobApplications()
  const update = useUpdateAdminResource()
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState<string>("all")
  const [role, setRole] = useState<string>("all")
  const [showLegacy, setShowLegacy] = useState(false)

  const applications = data?.applications ?? []
  const roles = useMemo(() => Array.from(new Set(applications.map((a) => a.jobTitle ?? `Job #${a.jobId}`))).sort(), [applications])
  const counts = useMemo(() => {
    const byStatus: Record<string, number> = {}
    for (const a of applications) byStatus[a.status] = (byStatus[a.status] ?? 0) + 1
    return byStatus
  }, [applications])
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return applications.filter((a) =>
      (status === "all" || a.status === status) &&
      (role === "all" || (a.jobTitle ?? `Job #${a.jobId}`) === role) &&
      (!q || [a.name, a.email, a.phone, a.jobTitle].some((v) => v?.toLowerCase().includes(q))),
    )
  }, [applications, search, status, role])

  const save = (id: number, values: { status?: string; notes?: string }) => {
    update.mutate({ resource: "applications", id, data: { values } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListAdminJobApplicationsQueryKey() })
        toast({ title: values.status ? "Status updated" : "Notes saved" })
      },
      onError: () => toast({ title: "Could not save", description: "Try again in a moment.", variant: "destructive" }),
    })
  }

  if (isLoading) return <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
  if (error || !data) return <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">Unable to load job applications.</div>

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">Job Applications</h1>
          <p className="mt-1 text-sm text-muted-foreground">{applications.length} application{applications.length === 1 ? "" : "s"} received through the careers page.</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name, email, role…" className="h-10 w-full rounded-lg border border-input bg-card pl-9 pr-3 text-sm outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20" />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {[{ id: "all", label: "All" }, ...STATUSES].map((s) => {
          const count = s.id === "all" ? applications.length : counts[s.id] ?? 0
          const active = status === s.id
          return (
            <button key={s.id} type="button" onClick={() => setStatus(s.id)} className={cn("relative rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors", active ? "text-secondary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground")}>
              {active && <motion.span layoutId="application-status-pill" className="absolute inset-0 rounded-full bg-secondary" transition={{ type: "spring", stiffness: 500, damping: 38 }} />}
              <span className="relative">{s.label} <span className="opacity-70">{count}</span></span>
            </button>
          )
        })}
        {roles.length > 1 && (
          <select value={role} onChange={(e) => setRole(e.target.value)} aria-label="Filter by role" className="ml-auto h-9 rounded-lg border border-input bg-card px-3 text-sm">
            <option value="all">All roles</option>
            {roles.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center rounded-xl border border-dashed border-border px-6 py-14 text-center">
          <Inbox className="h-9 w-9 text-muted-foreground" strokeWidth={1.4} />
          <p className="mt-4 font-semibold">{applications.length ? "No applications match these filters" : "No applications yet"}</p>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            {applications.length ? "Try a different status, role or search." : "Applications sent from the careers page on the website will appear here."}
          </p>
        </div>
      ) : (
        <motion.ul layout className="space-y-3">
          <AnimatePresence initial={false}>
            {filtered.map((application) => (
              <ApplicationRow key={application.id} application={application} onSave={save} saving={update.isPending} />
            ))}
          </AnimatePresence>
        </motion.ul>
      )}

      {data.contactApplications.length > 0 && (
        <div className="rounded-xl border border-border bg-card">
          <button type="button" onClick={() => setShowLegacy((v) => !v)} className="flex w-full items-center gap-3 p-4 text-left sm:p-5" aria-expanded={showLegacy}>
            <Users className="h-5 w-5 text-muted-foreground" />
            <span className="flex-1">
              <span className="block font-semibold">Earlier applications via the contact form ({data.contactApplications.length})</span>
              <span className="block text-sm text-muted-foreground">Sent before the careers form existed. They also stay under Inquiries.</span>
            </span>
            <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", showLegacy && "rotate-180")} />
          </button>
          <AnimatePresence initial={false}>
            {showLegacy && (
              <motion.ul initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="divide-y divide-border overflow-hidden border-t border-border">
                {data.contactApplications.map((c) => (
                  <li key={c.id} className="space-y-1 p-4 text-sm sm:px-5">
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                      <span className="font-semibold">{c.name}</span>
                      <a href={`mailto:${c.email}`} className="text-secondary hover:underline">{c.email}</a>
                      {c.phone && <span className="text-muted-foreground">{c.phone}</span>}
                      <span className="ml-auto text-xs text-muted-foreground">{formatDate(c.createdAt)}</span>
                    </div>
                    {c.message && <p className="whitespace-pre-line text-muted-foreground">{c.message}</p>}
                  </li>
                ))}
              </motion.ul>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
