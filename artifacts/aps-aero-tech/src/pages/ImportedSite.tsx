import { FormEvent, ReactNode, useState } from "react";
import { Link, useLocation, useParams } from "wouter";
import { ProductsPage, ProductDetailPage } from "./Catalog";
import { BlogDetailPage, BlogPage, CareersPage } from "./PublicContent";
import { DynamicHero } from "@/components/DynamicHero";
import {
  ArrowRight,
  Award,
  BarChart3,
  Building2,
  Check,
  ChevronDown,
  ChevronRight,
  Cloud,
  Code2,
  Factory,
  Globe2,
  Headphones,
  HeartHandshake,
  Lightbulb,
  Mail,
  MapPin,
  Menu,
  MessageSquare,
  Network,
  Package,
  Palette,
  Phone,
  Quote,
  Rocket,
  ShieldCheck,
  ShoppingBag,
  Smartphone,
  Sparkles,
  Target,
  Users,
  Workflow,
  X,
  Zap,
} from "lucide-react";
import { useCreateInquiry } from "@workspace/api-client-react";

const primary = "#D4920C";
const orange = "#E84821";
const navy = "#1A1F36";
const blue = "#3D4FA0";

const navItems = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Services", href: "/services" },
  { label: "Products", href: "/products" },
  { label: "Industries", href: "/industries" },
];

const moreNavItems = [
  { label: "Insights", href: "/blog" },
  { label: "Careers", href: "/careers" },
  { label: "Contact", href: "/contact" },
];

const serviceItems = [
  { icon: Rocket, title: "UAS Design & Engineering", text: "Airframes, propulsion, power systems, and control architecture engineered around real mission requirements.", color: orange },
  { icon: Network, title: "Avionics Integration", text: "Flight computers, navigation, datalinks, telemetry, and redundant subsystems integrated as one dependable platform.", color: blue },
  { icon: Target, title: "Payload Integration", text: "EO/IR, mapping, LiDAR, multispectral, and application-specific payloads configured for useful aerial intelligence.", color: primary },
  { icon: ShieldCheck, title: "Flight Testing & Validation", text: "Structured ground and flight-test programs that verify endurance, range, control, safety, and mission performance.", color: "#167C80" },
  { icon: Workflow, title: "Autonomy & Mission Software", text: "Mission planning, waypoint navigation, fleet visibility, and intelligent automation for repeatable operations.", color: "#7455B8" },
  { icon: Headphones, title: "Training & Lifecycle Support", text: "Operator training, maintenance planning, spares, upgrades, and technical support throughout the aircraft lifecycle.", color: "#2E8B57" },
];

const productItems = [
  { icon: ShieldCheck, label: "ISR PLATFORM", title: "VTOL Drone", text: "A mission-configurable VTOL platform for persistent surveillance, reconnaissance, and rapid situational awareness.", color: orange, link: "/products/vtol-drone" },
  { icon: Target, label: "TACTICAL UAS", title: "FPV Drone", text: "Agile, operator-focused FPV aircraft designed for close-range observation, training, and tactical field missions.", color: blue, link: "/products/fpv-drone" },
  { icon: Factory, label: "INDUSTRIAL UAS", title: "Tethered Drone", text: "A stable aerial inspection platform for utilities, infrastructure, mining, solar, and difficult-to-access assets.", color: primary, link: "/products/tethered-drone" },
  { icon: Sparkles, label: "AUTONOMOUS SYSTEM", title: "Surveillance Drone", text: "Mission planning, live telemetry, payload control, and fleet intelligence in one secure ground-control environment.", color: "#167C80", link: "/products/surveillance-drone" },
];

const industryItems = [
  { icon: ShieldCheck, title: "Defence & Homeland Security", text: "Persistent ISR, perimeter awareness, route reconnaissance, and rapid-response aerial capability." },
  { icon: Building2, title: "Critical Infrastructure", text: "Repeatable inspection of bridges, towers, pipelines, rail corridors, and hard-to-reach assets." },
  { icon: Factory, title: "Energy & Mining", text: "Safer aerial inspection, stockpile measurement, thermal surveys, and wide-area site intelligence." },
  { icon: Package, title: "Agriculture", text: "Crop health mapping, multispectral data capture, field assessment, and precision application support." },
  { icon: HeartHandshake, title: "Emergency Response", text: "Fast situational awareness for search, rescue, disaster assessment, and incident command." },
  { icon: Globe2, title: "Surveying & Mapping", text: "High-resolution geospatial data for land surveys, construction progress, and digital-twin workflows." },
];

function LegacyLayout({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [location] = useLocation();

  return (
    <div className="legacy-site min-h-screen bg-white text-[#1C1917]">
      <div className="hidden bg-[#1A1F36] text-white sm:block">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between px-5 py-2 text-xs">
          <span className="tracking-wide text-white/75">Indigenous unmanned aerial systems • Engineered and manufactured in India</span>
          <div className="flex items-center gap-5 text-white/75">
            <span>Defence</span>
            <span>Industrial</span>
            <span>Autonomous Systems</span>
          </div>
        </div>
      </div>

      <header className="sticky top-0 z-40 border-b border-gray-100 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-[76px] max-w-[1440px] items-center justify-between px-5 sm:px-8">
          <Link href="/" className="flex items-center gap-3" onClick={() => setOpen(false)}>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#1A1F36] shadow-sm">
              <span className="text-lg font-black italic text-white">ASP</span>
            </div>
            <div className="leading-none">
              <span className="block text-lg font-black tracking-tight text-[#1A1F36]">ASP Aero Tech</span>
              <span className="block text-[9px] font-bold uppercase tracking-[0.26em]" style={{ color: primary }}>Unmanned Aerial Systems</span>
            </div>
          </Link>

          <nav className="hidden items-center gap-7 lg:flex">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className={`relative py-7 text-sm font-semibold transition-colors ${location === item.href ? "text-[#1A1F36]" : "text-gray-500 hover:text-[#1A1F36]"}`}>
                {item.label}
                {location === item.href && <span className="absolute bottom-0 left-0 right-0 h-[3px] rounded-t-full" style={{ backgroundColor: primary }} />}
              </Link>
            ))}
            <div className="group relative">
              <button className="flex items-center gap-1 py-7 text-sm font-semibold text-gray-500 transition-colors hover:text-[#1A1F36]">
                More <ChevronDown size={14} />
              </button>
              <div className="invisible absolute right-0 top-[62px] w-52 translate-y-2 rounded-xl border border-gray-100 bg-white p-2 opacity-0 shadow-xl transition-all group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                {moreNavItems.map((item) => (
                  <Link key={item.href} href={item.href} className="block rounded-lg px-3 py-2.5 text-sm text-gray-600 hover:bg-orange-50 hover:text-[#D4920C]">
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
            <Link href="/contact" className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-bold text-white shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg" style={{ backgroundColor: primary }}>
              Let&apos;s talk <ArrowRight size={15} />
            </Link>
          </nav>

          <button aria-label="Open navigation" className="rounded-lg p-2 text-[#1A1F36] lg:hidden" onClick={() => setOpen((value) => !value)}>
            {open ? <X /> : <Menu />}
          </button>
        </div>
        {open && (
          <nav className="border-t border-gray-100 bg-white px-5 py-3 lg:hidden">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} onClick={() => setOpen(false)} className={`block border-b border-gray-100 py-3 text-sm font-semibold ${location === item.href ? "text-[#D4920C]" : "text-gray-600"}`}>
                {item.label}
              </Link>
            ))}
            {moreNavItems.slice(0, 2).map((item) => (
              <Link key={item.href} href={item.href} onClick={() => setOpen(false)} className={`block border-b border-gray-100 py-3 text-sm font-semibold ${location === item.href ? "text-[#D4920C]" : "text-gray-600"}`}>
                {item.label}
              </Link>
            ))}
            <Link href="/contact" onClick={() => setOpen(false)} className="mt-3 block rounded-lg py-3 text-center text-sm font-bold text-white" style={{ backgroundColor: primary }}>Let&apos;s talk</Link>
          </nav>
        )}
      </header>

      <main>{children}</main>
      <LegacyFooter />
    </div>
  );
}

function LegacyFooter() {
  return (
    <footer className="border-t border-gray-100 bg-[#FAFAF8]">
      <div className="mx-auto grid max-w-[1440px] gap-10 px-5 py-14 sm:px-8 md:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-1">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1A1F36] text-sm font-black italic text-white">ASP</div>
            <div><strong className="block text-[#1A1F36]">ASP Aero Tech</strong><span className="text-[9px] font-bold uppercase tracking-[0.2em]" style={{ color: primary }}>Unmanned Aerial Systems</span></div>
          </div>
          <p className="max-w-xs text-sm leading-relaxed text-gray-600">We design and manufacture mission-ready unmanned aerial systems for defence, industry, public safety, and critical infrastructure.</p>
          <div className="mt-5 flex gap-2">
            {["in", "f", "𝕏"].map((network) => <span key={network} className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 text-xs font-bold text-gray-500">{network}</span>)}
          </div>
        </div>
        <div>
          <h3 className="mb-4 text-xs font-black uppercase tracking-[0.18em]" style={{ color: blue }}>Quick links</h3>
          <div className="space-y-2.5 text-sm text-gray-600">{navItems.map((item) => <Link key={item.href} href={item.href} className="block transition-colors hover:text-[#D4920C]">{item.label}</Link>)}</div>
        </div>
        <div>
          <h3 className="mb-4 text-xs font-black uppercase tracking-[0.18em]" style={{ color: blue }}>What we do</h3>
          <div className="space-y-2.5 text-sm text-gray-600"><Link href="/services" className="block hover:text-[#D4920C]">UAS engineering</Link><Link href="/products" className="block hover:text-[#D4920C]">Drone platforms</Link><Link href="/industries" className="block hover:text-[#D4920C]">Mission applications</Link><Link href="/contact" className="block hover:text-[#D4920C]">Request a briefing</Link></div>
        </div>
        <div>
          <h3 className="mb-4 text-xs font-black uppercase tracking-[0.18em]" style={{ color: blue }}>Get in touch</h3>
          <div className="space-y-3 text-sm text-gray-600"><span className="flex items-center gap-2"><MessageSquare size={15} style={{ color: primary }} /> Technical and mission enquiries</span><span className="flex items-center gap-2"><Headphones size={15} style={{ color: primary }} /> Operator training and support</span><span className="flex items-start gap-2"><MapPin size={15} className="mt-0.5 shrink-0" style={{ color: primary }} /> India</span></div>
          <Link href="/contact" className="mt-5 inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-bold text-white" style={{ backgroundColor: primary }}>Request briefing <ArrowRight size={14} /></Link>
        </div>
      </div>
      <div className="mx-auto flex max-w-[1440px] flex-col items-center justify-between gap-3 border-t border-gray-100 px-5 py-5 text-xs text-gray-500 sm:flex-row sm:px-8"><span>© {new Date().getFullYear()} ASP Aero Tech. All rights reserved.</span><span>Engineered for mission readiness.</span></div>
    </footer>
  );
}

function PageHero({ eyebrow, title, subtitle, image }: { eyebrow: string; title: ReactNode; subtitle: string; image?: string }) {
  return (
    <section className="relative overflow-hidden bg-[#1A1F36]">
      <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "linear-gradient(120deg, transparent 0%, rgba(212,146,12,.45) 100%)" }} />
      <div className="absolute -right-28 -top-28 h-80 w-80 rounded-full border border-white/10" />
      <div className="absolute -bottom-32 left-1/3 h-80 w-80 rounded-full border border-white/10" />
      <div className="relative mx-auto grid max-w-[1440px] items-center gap-10 px-5 py-16 sm:px-8 md:py-20 lg:grid-cols-[1.15fr_.85fr] lg:py-24">
        <div>
          <span className="mb-4 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.22em]" style={{ color: primary }}><span className="h-0.5 w-7" style={{ backgroundColor: primary }} /> {eyebrow}</span>
          <h1 className="max-w-3xl text-4xl font-black leading-[1.05] text-white sm:text-5xl lg:text-6xl">{title}</h1>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/70 sm:text-lg">{subtitle}</p>
        </div>
        {image && <div className="relative hidden overflow-hidden rounded-2xl border border-white/10 shadow-2xl lg:block"><img src={image} alt="" className="h-72 w-full object-cover opacity-80" /><div className="absolute inset-0 bg-gradient-to-tr from-[#1A1F36]/70 to-transparent" /></div>}
      </div>
    </section>
  );
}

function SectionHeading({ eyebrow, title, text, light = false }: { eyebrow: string; title: string; text?: string; light?: boolean }) {
  return <div className="mb-10 max-w-2xl"><span className="mb-3 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em]" style={{ color: primary }}><span className="h-0.5 w-6" style={{ backgroundColor: primary }} /> {eyebrow}</span><h2 className={`text-3xl font-black leading-tight sm:text-4xl ${light ? "text-white" : "text-[#1A1F36]"}`}>{title}</h2>{text && <p className={`mt-4 text-base leading-relaxed ${light ? "text-white/65" : "text-gray-600"}`}>{text}</p>}</div>;
}

function HomePage() {
  return (
    <>
      <DynamicHero />

      <section className="border-b border-gray-100 bg-white py-12"><div className="mx-auto grid max-w-[1440px] gap-8 px-5 sm:px-8 md:grid-cols-3"><div className="flex gap-4"><div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-50" style={{ color: orange }}><Target size={22} /></div><div><h3 className="font-bold text-[#1A1F36]">Mission configured</h3><p className="mt-1 text-sm leading-relaxed text-gray-500">Aircraft and payloads tailored to operational objectives.</p></div></div><div className="flex gap-4"><div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-50" style={{ color: blue }}><ShieldCheck size={22} /></div><div><h3 className="font-bold text-[#1A1F36]">Validated in flight</h3><p className="mt-1 text-sm leading-relaxed text-gray-500">Structured testing for safety, endurance, control, and reliability.</p></div></div><div className="flex gap-4"><div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-50" style={{ color: primary }}><Zap size={22} /></div><div><h3 className="font-bold text-[#1A1F36]">Ready to deploy</h3><p className="mt-1 text-sm leading-relaxed text-gray-500">Training, support, spares, and lifecycle planning included.</p></div></div></div></section>

      <section className="bg-[#FAFAF8] py-20"><div className="mx-auto max-w-[1440px] px-5 sm:px-8"><SectionHeading eyebrow="Engineering capabilities" title="From requirement to flight-ready system." text="We bring airframe design, avionics, payloads, autonomy, testing, manufacturing, and operator support together under one program." /><div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{serviceItems.map((item) => <ServiceCard key={item.title} {...item} />)}</div><Link href="/services" className="mt-9 inline-flex items-center gap-2 text-sm font-bold" style={{ color: orange }}>Explore all capabilities <ArrowRight size={15} /></Link></div></section>

      <section className="bg-white py-20"><div className="mx-auto max-w-[1440px] px-5 sm:px-8"><SectionHeading eyebrow="Our UAS portfolio" title="Aerial platforms built around the mission." text="Modular unmanned systems for surveillance, tactical awareness, industrial inspection, and autonomous field operations." /><div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">{productItems.map((item) => <ProductCard key={item.title} {...item} />)}</div></div></section>

      <section className="bg-[#1A1F36] py-20"><div className="mx-auto grid max-w-[1440px] gap-12 px-5 sm:px-8 lg:grid-cols-[.8fr_1.2fr] lg:items-center"><div><SectionHeading eyebrow="Mission applications" title="One platform architecture. Multiple operational roles." text="ASP Aero Tech configures each UAS around the environment, payload, endurance, communications, and data needs of the mission." light /><Link href="/industries" className="inline-flex items-center gap-2 rounded-lg border border-white/25 px-5 py-3 text-sm font-bold text-white hover:bg-white/10">Explore applications <ArrowRight size={15} /></Link></div><div className="grid grid-cols-2 gap-3 sm:grid-cols-3">{industryItems.map((item) => <Link href="/industries" key={item.title} className="rounded-xl border border-white/10 bg-white/[.04] p-4 transition-colors hover:border-[#D4920C]/60 hover:bg-white/[.08]"><item.icon size={21} style={{ color: primary }} /><span className="mt-4 block text-sm font-bold text-white">{item.title}</span></Link>)}</div></div></section>

      <section className="bg-white py-20"><div className="mx-auto max-w-[1440px] px-5 sm:px-8"><div className="relative overflow-hidden rounded-2xl bg-[#F6F1E8] px-7 py-12 sm:px-14"><div className="absolute -right-12 -top-20 h-60 w-60 rounded-full border-[28px] border-white/50" /><div className="relative max-w-2xl"><span className="text-xs font-black uppercase tracking-[0.2em]" style={{ color: orange }}>Define the mission</span><h2 className="mt-3 text-3xl font-black text-[#1A1F36] sm:text-4xl">Let&apos;s configure the right aerial system.</h2><p className="mt-4 max-w-xl text-gray-600">Share your range, endurance, payload, operating environment, and deployment needs. Our engineering team will map a practical path forward.</p><Link href="/contact" className="mt-7 inline-flex items-center gap-2 rounded-lg px-5 py-3 text-sm font-bold text-white" style={{ backgroundColor: orange }}>Request a technical briefing <ArrowRight size={15} /></Link></div></div></div></section>
    </>
  );
}

function ServiceCard({ icon: Icon, title, text, color }: { icon: typeof Globe2; title: string; text: string; color: string }) {
  return <div className="group rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"><div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl" style={{ backgroundColor: `${color}16`, color }}><Icon size={22} /></div><h3 className="text-lg font-bold text-[#1A1F36]">{title}</h3><p className="mt-2 text-sm leading-relaxed text-gray-500">{text}</p><span className="mt-5 inline-flex items-center gap-1 text-xs font-black uppercase tracking-wider opacity-0 transition-opacity group-hover:opacity-100" style={{ color }}>Learn more <ArrowRight size={13} /></span></div>;
}

function ProductCard({ icon: Icon, label, title, text, color, link = "/products" }: { icon: typeof Workflow; label: string; title: string; text: string; color: string; link?: string }) {
  return <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"><div className="flex items-center justify-between"><div className="flex h-12 w-12 items-center justify-center rounded-xl" style={{ backgroundColor: `${color}16`, color }}><Icon size={23} /></div><span className="text-[9px] font-black tracking-[0.18em]" style={{ color }}>{label}</span></div><h3 className="mt-5 text-lg font-bold text-[#1A1F36]">{title}</h3><p className="mt-2 text-sm leading-relaxed text-gray-500">{text}</p><Link href={link} className="mt-5 inline-flex items-center gap-1 text-sm font-bold" style={{ color }}>View platform <ChevronRight size={15} /></Link></div>;
}

function AboutPage() {
  return <><PageHero eyebrow="About ASP Aero Tech" title={<>Indian engineering for <span style={{ color: primary }}>unmanned flight.</span></>} subtitle="ASP Aero Tech is a drone manufacturing company developing reliable, mission-configurable unmanned aerial systems for demanding defence and civil applications." image="https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&w=1200&q=85" /><section className="bg-white py-20"><div className="mx-auto grid max-w-[1440px] gap-12 px-5 sm:px-8 lg:grid-cols-2 lg:items-center"><div><SectionHeading eyebrow="Who we are" title="An engineering company with flight at its core." text="We unite aerostructures, propulsion, avionics, embedded systems, payload integration, autonomy, manufacturing, and field support. The result is a complete UAS program shaped around the operating environment—not a generic airframe looking for a mission." /><div className="grid grid-cols-2 gap-5 border-t border-gray-100 pt-7 sm:grid-cols-4">{[["UAS", "Focused engineering"], ["360°", "System integration"], ["India", "Design & manufacture"], ["1", "Lifecycle partner"]].map(([number, label]) => <div key={label}><strong className="block text-2xl font-black" style={{ color: orange }}>{number}</strong><span className="mt-1 block text-xs font-bold uppercase tracking-wide text-gray-500">{label}</span></div>)}</div></div><div className="relative"><div className="absolute -bottom-5 -left-5 h-36 w-36 rounded-2xl" style={{ backgroundColor: `${primary}22` }} /><img src="https://images.unsplash.com/photo-1506947411487-a56738267384?auto=format&fit=crop&w=1000&q=85" alt="Drone engineering and field operations" className="relative h-[390px] w-full rounded-2xl object-cover shadow-xl" /></div></div></section><section className="bg-[#FAFAF8] py-20"><div className="mx-auto max-w-[1440px] px-5 sm:px-8"><SectionHeading eyebrow="What drives us" title="Designed for the conditions that matter." /><div className="grid gap-5 md:grid-cols-3">{[[Target, "Mission first", "Range, endurance, payload, communications, terrain, and operator workflow define every system decision."], [ShieldCheck, "Reliability by design", "We engineer for predictable flight behaviour, maintainability, redundancy, and disciplined validation."], [Award, "Indigenous capability", "Local engineering and manufacturing strengthen supply resilience, customization, and lifecycle control."]].map(([Icon, title, text]) => <div key={title as string} className="rounded-2xl border border-gray-100 bg-white p-7"><div className="mb-5 flex h-11 w-11 items-center justify-center rounded-full bg-orange-50" style={{ color: orange }}><Icon size={20} /></div><h3 className="text-lg font-bold text-[#1A1F36]">{title as string}</h3><p className="mt-2 text-sm leading-relaxed text-gray-500">{text as string}</p></div>)}</div></div></section><section className="bg-white py-20"><div className="mx-auto max-w-3xl px-5 text-center sm:px-8"><Quote className="mx-auto mb-5" size={30} style={{ color: primary }} /><p className="text-2xl font-bold leading-relaxed text-[#1A1F36] sm:text-3xl">“Mission readiness begins long before take-off—with disciplined engineering, testing, manufacturing, and operator preparation.”</p><p className="mt-5 text-sm font-bold uppercase tracking-widest text-gray-500">ASP Aero Tech</p></div></section></>;
}

function ServicesPage() {
  return <><PageHero eyebrow="Engineering capabilities" title={<>Complete UAS development, <span style={{ color: primary }}>integration, and support.</span></>} subtitle="From an operational requirement to a validated aircraft and trained crew, ASP Aero Tech supports the complete unmanned-system lifecycle." image="https://images.unsplash.com/photo-1487887235947-a955ef187fcc?auto=format&fit=crop&w=1200&q=85" /><section className="bg-[#FAFAF8] py-20"><div className="mx-auto max-w-[1440px] px-5 sm:px-8"><SectionHeading eyebrow="Capabilities" title="Every discipline required to put a dependable aircraft in the field." text="Engage us for a focused integration need or a complete development and manufacturing program." /><div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{serviceItems.map((item) => <ServiceCard key={item.title} {...item} />)}</div></div></section><section className="bg-white py-20"><div className="mx-auto grid max-w-[1440px] gap-12 px-5 sm:px-8 lg:grid-cols-2 lg:items-center"><div className="rounded-2xl bg-[#1A1F36] p-8 sm:p-10"><span className="text-xs font-black uppercase tracking-[0.2em]" style={{ color: primary }}>Development process</span><h2 className="mt-4 text-3xl font-black text-white">Requirement. Prototype. Validate. Deploy.</h2><p className="mt-4 text-sm leading-relaxed text-white/65">A gated engineering process keeps mission goals, airworthiness, manufacturability, and operator needs aligned from the first system definition through field deployment.</p><div className="mt-8 space-y-5">{["Define mission and system requirements", "Engineer and integrate the aircraft", "Validate, train, and support deployment"].map((step, index) => <div key={step} className="flex items-center gap-4"><span className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-black text-white" style={{ backgroundColor: index === 1 ? orange : primary }}>{index + 1}</span><span className="text-sm font-bold text-white">{step}</span></div>)}</div></div><div><SectionHeading eyebrow="Built around operations" title="Engineering that starts with the mission profile." text="Every deployment environment is different. We balance endurance, payload, communications, portability, autonomy, maintenance, and total lifecycle cost." /><div className="space-y-4">{["Mission-configurable airframe and payload architecture", "Ground and flight validation against defined requirements", "Operator training, maintenance, spares, and upgrades"].map((line) => <div key={line} className="flex items-center gap-3 text-sm font-semibold text-gray-700"><Check size={18} style={{ color: orange }} /> {line}</div>)}</div><Link href="/contact" className="mt-8 inline-flex items-center gap-2 rounded-lg px-5 py-3 text-sm font-bold text-white" style={{ backgroundColor: orange }}>Discuss your mission <ArrowRight size={15} /></Link></div></div></section></>;
}

function IndustriesPage() {
  const [selected, setSelected] = useState<string | null>(null);
  const current = industryItems.find((item) => item.title === selected);
  return <><PageHero eyebrow="Mission applications" title={<>Aerial capability for <span style={{ color: primary }}>complex operating environments.</span></>} subtitle="Configure the aircraft, payload, datalink, and mission software around the intelligence or action your team needs from the air." image="https://images.unsplash.com/photo-1521405924368-64c5b84bec60?auto=format&fit=crop&w=1200&q=85" /><section className="bg-[#FAFAF8] py-20"><div className="mx-auto max-w-[1440px] px-5 sm:px-8"><SectionHeading eyebrow="Operational sectors" title="Different missions. One disciplined engineering approach." text="Explore where ASP Aero Tech platforms can improve reach, speed, safety, data quality, and operational awareness." /><div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{industryItems.map((item) => <button key={item.title} onClick={() => setSelected(item.title)} className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-7 text-left shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"><div className="absolute right-0 top-0 h-24 w-24 rounded-bl-full bg-indigo-50 transition-colors group-hover:bg-orange-50" /><div className="relative"><div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-[#3D4FA0] transition-colors group-hover:bg-orange-50 group-hover:text-[#E84821]"><item.icon size={23} /></div><h3 className="mt-6 text-lg font-bold text-[#1A1F36]">{item.title}</h3><p className="mt-2 text-sm leading-relaxed text-gray-500">{item.text}</p><span className="mt-6 inline-flex items-center gap-1 text-xs font-black uppercase tracking-wider" style={{ color: orange }}>View application <ArrowRight size={13} /></span></div></button>)}</div></div></section>{current && <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1A1F36]/60 p-5" onClick={() => setSelected(null)}><div className="w-full max-w-lg rounded-2xl bg-white p-7 shadow-2xl" onClick={(event) => event.stopPropagation()}><div className="flex items-start justify-between"><div><span className="text-xs font-black uppercase tracking-[0.2em]" style={{ color: orange }}>Mission application</span><h2 className="mt-2 text-2xl font-black text-[#1A1F36]">{current.title}</h2></div><button aria-label="Close industry details" className="rounded-lg p-2 text-gray-400 hover:bg-gray-100" onClick={() => setSelected(null)}><X size={19} /></button></div><p className="mt-5 text-sm leading-relaxed text-gray-600">{current.text} Our engineers can assess the mission profile and recommend an airframe, payload, communications, and support configuration for the deployment environment.</p><Link href="/contact" onClick={() => setSelected(null)} className="mt-7 inline-flex items-center gap-2 rounded-lg px-5 py-3 text-sm font-bold text-white" style={{ backgroundColor: orange }}>Discuss the mission <ArrowRight size={15} /></Link></div></div>}</>;
}

function ContactPage() {
  const createInquiry = useCreateInquiry();
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const data = { name: String(form.get("name") ?? ""), email: String(form.get("email") ?? ""), organization: String(form.get("organization") ?? ""), interest: String(form.get("interest") ?? ""), message: String(form.get("message") ?? "") };
    setError("");
    createInquiry.mutate({ data }, { onSuccess: () => { setSent(true); event.currentTarget.reset(); }, onError: () => setError("We could not send your message. Please try again.") });
  };
  return <><PageHero eyebrow="Request a technical briefing" title={<>Tell us about the <span style={{ color: primary }}>mission.</span></>} subtitle="Share the operating environment, range, endurance, payload, communications, and deployment objectives. Our engineering team will review the requirement." /><section className="bg-white py-20"><div className="mx-auto grid max-w-[1100px] gap-12 px-5 sm:px-8 lg:grid-cols-[.75fr_1.25fr]"><div><SectionHeading eyebrow="Engage ASP Aero Tech" title="Start with the operating requirement." text="Contact us for product information, a technical briefing, platform configuration, integration support, training, or a demonstration discussion." /><div className="space-y-4 text-sm text-gray-600"><span className="flex items-center gap-3"><MessageSquare size={18} style={{ color: primary }} /> Technical and mission enquiries</span><span className="flex items-center gap-3"><Headphones size={18} style={{ color: primary }} /> Training and lifecycle support</span><span className="flex items-center gap-3"><MapPin size={18} style={{ color: primary }} /> India</span></div></div><div className="rounded-2xl border border-gray-100 bg-[#FAFAF8] p-6 sm:p-8">{sent ? <div className="flex min-h-[360px] flex-col items-center justify-center text-center"><div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600"><Check size={26} /></div><h2 className="mt-5 text-2xl font-black text-[#1A1F36]">Requirement received.</h2><p className="mt-2 max-w-sm text-sm leading-relaxed text-gray-500">Thank you. An ASP Aero Tech representative will review your enquiry and respond shortly.</p><button className="mt-6 text-sm font-bold" style={{ color: orange }} onClick={() => setSent(false)}>Send another enquiry</button></div> : <form onSubmit={submit} className="space-y-5"><div className="grid gap-5 sm:grid-cols-2"><Field label="Full name" name="name" required /><Field label="Email address" name="email" type="email" required /></div><div className="grid gap-5 sm:grid-cols-2"><Field label="Organization" name="organization" /><label className="block"><span className="mb-2 block text-xs font-black uppercase tracking-wider text-gray-500">Area of interest</span><select name="interest" required className="w-full rounded-lg border border-gray-200 bg-white px-3 py-3 text-sm text-gray-700 outline-none focus:border-[#D4920C]"><option value="">Select one</option><option value="defence-isr">Defence & ISR</option><option value="industrial-inspection">Industrial inspection</option><option value="survey-mapping">Surveying & mapping</option><option value="emergency-response">Emergency response</option><option value="payload-integration">Payload integration</option><option value="training-support">Training & support</option><option value="other">Other requirement</option></select></label></div><label className="block"><span className="mb-2 block text-xs font-black uppercase tracking-wider text-gray-500">Mission requirement</span><textarea name="message" required minLength={10} rows={5} className="w-full resize-none rounded-lg border border-gray-200 bg-white px-3 py-3 text-sm text-gray-700 outline-none focus:border-[#D4920C]" placeholder="Operating environment, payload, range, endurance, deployment schedule, or other requirements..." /></label>{error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}<button disabled={createInquiry.isPending} className="inline-flex w-full items-center justify-center gap-2 rounded-lg py-3.5 text-sm font-bold text-white disabled:opacity-60" style={{ backgroundColor: orange }}>{createInquiry.isPending ? "Sending..." : "Submit requirement"} <ArrowRight size={15} /></button></form>}</div></div></section></>;
}

function Field({ label, name, type = "text", required = false }: { label: string; name: string; type?: string; required?: boolean }) {
  return <label className="block"><span className="mb-2 block text-xs font-black uppercase tracking-wider text-gray-500">{label}</span><input name={name} type={type} required={required} className="w-full rounded-lg border border-gray-200 bg-white px-3 py-3 text-sm text-gray-700 outline-none focus:border-[#D4920C]" /></label>;
}

export function ImportedSite() {
  const [location] = useLocation();
  const params = useParams();

  let page: ReactNode = <HomePage />;
  if (location === "/about") page = <AboutPage />;
  else if (location === "/services") page = <ServicesPage />;
  else if (location === "/products") page = <ProductsPage />;
  else if (location.startsWith("/products/") && params.slug) page = <ProductDetailPage slug={params.slug} />;
  else if (location === "/industries") page = <IndustriesPage />;
  else if (location === "/careers") page = <CareersPage />;
  else if (location === "/blog") page = <BlogPage />;
  else if (location.startsWith("/blog/") && params.slug) page = <BlogDetailPage slug={params.slug} />;
  else if (location === "/contact") page = <ContactPage />;
  return <LegacyLayout>{page}</LegacyLayout>;
}