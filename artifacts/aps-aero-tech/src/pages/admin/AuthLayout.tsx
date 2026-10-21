import { useLayoutEffect, useRef, type ReactNode } from "react"
import { motion } from "framer-motion"
import gsap from "gsap"
import { MotionPathPlugin } from "gsap/MotionPathPlugin"
import { Link } from "wouter"
import { Lock, ShieldCheck } from "lucide-react"
import { BrandLogo, ThemeToggle, prefersReducedMotion } from "./theme"

gsap.registerPlugin(MotionPathPlugin)

const FLIGHT_PATH = "M 30 520 C 170 470, 250 310, 370 262 S 530 150, 590 70"
const CENTER = { x: 330, y: 300 }

function BrandPanel() {
  const root = useRef<HTMLDivElement>(null)
  const radar = useRef<SVGGElement>(null)

  useLayoutEffect(() => {
    const el = root.current
    if (!el) return
    const reduced = prefersReducedMotion()
    const ctx = gsap.context(() => {
      const trails = gsap.utils.toArray<SVGPathElement>("[data-trail]")
      trails.forEach((path) => {
        const length = path.getTotalLength()
        gsap.set(path, { strokeDasharray: length, strokeDashoffset: reduced ? 0 : length })
      })
      if (reduced) return

      const intro = gsap.timeline({ defaults: { ease: "power3.out" } })
      intro
        .from("[data-ring]", { scale: 0.6, opacity: 0, svgOrigin: `${CENTER.x} ${CENTER.y}`, duration: 1.1, stagger: 0.12 })
        .to(trails, { strokeDashoffset: 0, duration: 1.6, ease: "power2.inOut", stagger: 0.08 }, 0.3)
        .from("[data-reveal]", { y: 28, opacity: 0, duration: 0.8, stagger: 0.1 }, 0.2)
        .from("[data-chip]", { y: 12, opacity: 0, duration: 0.5, stagger: 0.08 }, 0.9)

      gsap.to("[data-sweep]", { rotation: 360, svgOrigin: `${CENTER.x} ${CENTER.y}`, duration: 6, ease: "none", repeat: -1 })
      gsap.to("[data-blip]", {
        opacity: 1, scale: 1.6, transformOrigin: "50% 50%", duration: 0.5, yoyo: true, repeat: -1,
        repeatDelay: 1.6, stagger: { each: 0.9, from: "random" },
      })
      gsap.to("[data-drone]", {
        motionPath: { path: "#asp-flight-path", align: "#asp-flight-path", alignOrigin: [0.5, 0.5], autoRotate: true },
        duration: 9, ease: "none", repeat: -1, delay: 1.4,
      })

      const readouts: Array<[string, number, number]> = [["ALT", 1180, 1460], ["SPD", 72, 96], ["HDG", 38, 74]]
      readouts.forEach(([label, from, to]) => {
        const node = el.querySelector(`[data-readout="${label}"]`)
        if (!node) return
        const state = { value: from }
        gsap.to(state, {
          value: to, duration: gsap.utils.random(3, 5), ease: "sine.inOut", yoyo: true, repeat: -1,
          onUpdate: () => { node.textContent = Math.round(state.value).toString().padStart(3, "0") },
        })
      })

      // subtle parallax that follows the pointer
      const xTo = gsap.quickTo(radar.current, "x", { duration: 0.8, ease: "power3" })
      const yTo = gsap.quickTo(radar.current, "y", { duration: 0.8, ease: "power3" })
      const onMove = (event: PointerEvent) => {
        const rect = el.getBoundingClientRect()
        xTo(((event.clientX - rect.left) / rect.width - 0.5) * -24)
        yTo(((event.clientY - rect.top) / rect.height - 0.5) * -24)
      }
      el.addEventListener("pointermove", onMove)
      return () => el.removeEventListener("pointermove", onMove)
    }, el)
    return () => ctx.revert()
  }, [])

  return (
    <div ref={root} className="relative hidden overflow-hidden bg-[#06101f] text-white lg:flex lg:flex-col">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(37,99,235,0.28),transparent_55%),radial-gradient(ellipse_at_80%_90%,rgba(244,126,32,0.18),transparent_50%)]" />
      <div className="absolute inset-0 opacity-[0.07] [background-image:linear-gradient(#fff_1px,transparent_1px),linear-gradient(90deg,#fff_1px,transparent_1px)] [background-size:48px_48px]" />

      <svg viewBox="0 0 640 600" className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <defs>
          <linearGradient id="asp-sweep" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#60a5fa" stopOpacity="0" />
            <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.35" />
          </linearGradient>
        </defs>
        <g ref={radar}>
          {[70, 140, 210, 280].map((r) => (
            <circle key={r} data-ring cx={CENTER.x} cy={CENTER.y} r={r} fill="none" stroke="rgba(148,197,255,0.16)" strokeDasharray={r === 280 ? "4 8" : undefined} />
          ))}
          <line x1={CENTER.x - 290} y1={CENTER.y} x2={CENTER.x + 290} y2={CENTER.y} stroke="rgba(148,197,255,0.08)" />
          <line x1={CENTER.x} y1={CENTER.y - 290} x2={CENTER.x} y2={CENTER.y + 290} stroke="rgba(148,197,255,0.08)" />
          <path data-sweep d={`M ${CENTER.x} ${CENTER.y} L ${CENTER.x + 280} ${CENTER.y} A 280 280 0 0 0 ${CENTER.x + 242} ${CENTER.y - 140} Z`} fill="url(#asp-sweep)" />
          {[[420, 210], [250, 390], [480, 360], [210, 230]].map(([cx, cy]) => (
            <circle key={`${cx}-${cy}`} data-blip cx={cx} cy={cy} r={3} fill="#93c5fd" opacity={0.25} />
          ))}
        </g>
        <path id="asp-flight-path" d={FLIGHT_PATH} fill="none" stroke="none" />
        <path data-trail d={FLIGHT_PATH} fill="none" stroke="#F47E20" strokeWidth={4} strokeLinecap="round" />
        <path data-trail d={FLIGHT_PATH} transform="translate(0 5)" fill="none" stroke="#ffffff" strokeWidth={3} strokeLinecap="round" opacity={0.9} />
        <path data-trail d={FLIGHT_PATH} transform="translate(0 10)" fill="none" stroke="#138808" strokeWidth={4} strokeLinecap="round" />
        <g data-drone>
          <circle r={14} fill="rgba(244,126,32,0.18)" />
          <path d="M -9 0 L 9 0 M 0 -9 L 0 9" stroke="#fff" strokeWidth={2} strokeLinecap="round" />
          <circle r={3.5} fill="#F47E20" />
        </g>
      </svg>

      <div className="relative z-10 flex flex-1 flex-col justify-between p-10 xl:p-14">
        <Link href="/" className="inline-flex w-fit" aria-label="Back to website">
          <img src={`${import.meta.env.BASE_URL}brand/asp-logo-reversed.png`} alt="ASP Aero Tech" className="h-14 w-auto" draggable={false} />
        </Link>

        <div className="max-w-md">
          <p data-reveal className="mb-4 font-mono text-xs uppercase tracking-[0.3em] text-orange-300/90">Admin console</p>
          <h2 data-reveal className="font-display text-4xl font-bold leading-tight xl:text-5xl">
            Run the ASP Aero Tech website from one place.
          </h2>
          <p data-reveal className="mt-4 text-base text-blue-100/70">
            Products, inquiries, campaigns and site settings, behind an encrypted, signed session.
          </p>
        </div>

        <div className="flex flex-wrap items-end justify-between gap-6">
          <dl className="grid grid-cols-3 gap-6 font-mono">
            {[["ALT", "m"], ["SPD", "km/h"], ["HDG", "°"]].map(([label, unit]) => (
              <div key={label} data-chip>
                <dt className="text-[10px] tracking-[0.25em] text-blue-200/50">{label}</dt>
                <dd className="mt-1 text-xl font-semibold tabular-nums">
                  <span data-readout={label}>000</span>
                  <span className="ml-1 text-xs text-blue-200/50">{unit}</span>
                </dd>
              </div>
            ))}
          </dl>
          <div data-chip className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-blue-100/80 backdrop-blur">
            <ShieldCheck className="h-3.5 w-3.5 text-green-400" /> HTTP-only signed session
          </div>
        </div>
      </div>
    </div>
  )
}

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-screen bg-background text-foreground lg:grid-cols-[1.05fr_1fr]">
      <BrandPanel />
      <div className="relative flex min-h-screen flex-col overflow-hidden">
        <div className="admin-grid-bg pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]" />
        <div className="pointer-events-none absolute -right-32 -top-32 h-80 w-80 rounded-full bg-secondary/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 -left-24 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />

        <header className="relative z-10 flex items-center justify-between px-6 py-5 sm:px-10">
          <Link href="/" className="h-10 lg:invisible" aria-label="Back to website">
            <BrandLogo className="h-10" />
          </Link>
          <ThemeToggle />
        </header>

        <main className="relative z-10 flex flex-1 items-center justify-center px-5 pb-10 sm:px-10">
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-[420px]"
          >
            {children}
          </motion.div>
        </main>

        <footer className="relative z-10 flex items-center justify-center gap-2 px-6 pb-6 text-xs text-muted-foreground">
          <Lock className="h-3 w-3" /> Authorised personnel only · © {new Date().getFullYear()} ASP Aertech Pvt. Ltd.
        </footer>
      </div>
    </div>
  )
}

/** Card + heading used by every auth screen. */
export function AuthCard({ icon, title, subtitle, children }: { icon?: ReactNode; title: string; subtitle?: ReactNode; children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card/90 p-7 shadow-[0_20px_60px_-25px_hsl(var(--foreground)/0.35)] backdrop-blur-xl sm:p-9">
      <div className="mb-7">
        {icon && (
          <motion.div
            initial={{ scale: 0.4, rotate: -20, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.15 }}
            className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-secondary/12 text-secondary ring-1 ring-secondary/25"
          >
            {icon}
          </motion.div>
        )}
        <h1 className="font-display text-2xl font-bold tracking-tight sm:text-[1.7rem]">{title}</h1>
        {subtitle && <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{subtitle}</p>}
      </div>
      {children}
    </div>
  )
}
