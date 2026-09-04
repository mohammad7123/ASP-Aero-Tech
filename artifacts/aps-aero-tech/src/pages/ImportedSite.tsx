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

const primary = "#F47E20"; // Saffron Orange
const orange = "#F47E20"; // Saffron Orange
const navy = "#0B203D"; // Deep Navy
const green = "#138808"; // Indian Green

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
  { icon: Network, title: "Avionics Integration", text: "Flight computers, navigation, datalinks, telemetry, and redundant subsystems integrated as one dependable platform.", color: green },
  { icon: Target, title: "Payload Integration", text: "EO/IR, mapping, LiDAR, multispectral, and application-specific payloads configured for useful aerial intelligence.", color: primary },
  { icon: ShieldCheck, title: "Flight Testing & Validation", text: "Structured ground and flight-test programs that verify endurance, range, control, safety, and mission performance.", color: "#167C80" },
  { icon: Workflow, title: "Autonomy & Mission Software", text: "Mission planning, waypoint navigation, fleet visibility, and intelligent automation for repeatable operations.", color: "#7455B8" },
  { icon: Headphones, title: "Training & Lifecycle Support", text: "Operator training, maintenance planning, spares, upgrades, and technical support throughout the aircraft lifecycle.", color: "#2E8B57" },
];

const productItems = [
  { icon: ShieldCheck, label: "ISR PLATFORM", title: "VTOL Drone", text: "A mission-configurable VTOL platform for persistent surveillance, reconnaissance, and rapid situational awareness.", color: orange, link: "/products/vtol-drone" },
  { icon: Target, label: "TACTICAL UAS", title: "FPV Drone", text: "Agile, operator-focused FPV aircraft designed for close-range observation, training, and tactical field missions.", color: green, link: "/products/fpv-drone" },
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
      <div className="hidden bg-[#0B203D] text-white sm:block">
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
            <img src="/asp-logo.png" alt="ASP Aero Tech" className="h-14 sm:h-16 w-auto object-contain py-1" />
          </Link>

          <nav className="hidden items-center gap-7 lg:flex">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className={`relative py-7 text-sm font-semibold transition-colors ${location === item.href ? "text-[#0B203D]" : "text-gray-500 hover:text-[#0B203D]"}`}>
                {item.label}
                {location === item.href && <span className="absolute bottom-0 left-0 right-0 h-[3px] rounded-t-full" style={{ backgroundColor: primary }} />}
              </Link>
            ))}
            <div className="group relative">
              <button className="flex items-center gap-1 py-7 text-sm font-semibold text-gray-500 transition-colors hover:text-[#0B203D]">
                More <ChevronDown size={14} />
              </button>
              <div className="invisible absolute right-0 top-[62px] w-52 translate-y-2 rounded-xl border border-gray-100 bg-white p-2 opacity-0 shadow-xl transition-all group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                {moreNavItems.map((item) => (
                  <Link key={item.href} href={item.href} className="block rounded-lg px-3 py-2.5 text-sm text-gray-600 hover:bg-orange-50 hover:text-[#F47E20]">
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
            <Link href="/contact" className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-bold text-white shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg" style={{ backgroundColor: primary }}>
              Let&apos;s talk <ArrowRight size={15} />
            </Link>
          </nav>

          <button aria-label="Open navigation" className="rounded-lg p-2 text-[#0B203D] lg:hidden" onClick={() => setOpen((value) => !value)}>
            {open ? <X /> : <Menu />}
          </button>
        </div>
        {open && (
          <nav className="border-t border-gray-100 bg-white px-5 py-3 lg:hidden">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} onClick={() => setOpen(false)} className={`block border-b border-gray-100 py-3 text-sm font-semibold ${location === item.href ? "text-[#F47E20]" : "text-gray-600"}`}>
                {item.label}
              </Link>
            ))}
            {moreNavItems.slice(0, 2).map((item) => (
              <Link key={item.href} href={item.href} onClick={() => setOpen(false)} className={`block border-b border-gray-100 py-3 text-sm font-semibold ${location === item.href ? "text-[#F47E20]" : "text-gray-600"}`}>
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
          <div className="mb-6">
            <img src="/asp-logo.png" alt="ASP Aero Tech" className="h-16 w-auto object-contain" />
          </div>
          <p className="max-w-xs text-sm leading-relaxed text-gray-600">We design and manufacture mission-ready unmanned aerial systems for defence, industry, public safety, and critical infrastructure.</p>
          <div className="mt-5 flex gap-2">
            {["in", "f", "𝕏"].map((network) => <span key={network} className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 text-xs font-bold text-gray-500">{network}</span>)}
          </div>
        </div>
        <div>
          <h3 className="mb-4 text-xs font-black uppercase tracking-[0.18em]" style={{ color: green }}>Quick links</h3>
          <div className="space-y-2.5 text-sm text-gray-600">{navItems.map((item) => <Link key={item.href} href={item.href} className="block transition-colors hover:text-[#F47E20]">{item.label}</Link>)}</div>
        </div>
        <div>
          <h3 className="mb-4 text-xs font-black uppercase tracking-[0.18em]" style={{ color: green }}>What we do</h3>
          <div className="space-y-2.5 text-sm text-gray-600"><Link href="/services" className="block hover:text-[#F47E20]">UAS engineering</Link><Link href="/products" className="block hover:text-[#F47E20]">Drone platforms</Link><Link href="/industries" className="block hover:text-[#F47E20]">Mission applications</Link><Link href="/contact" className="block hover:text-[#F47E20]">Request a briefing</Link></div>
        </div>
        <div>
          <h3 className="mb-4 text-xs font-black uppercase tracking-[0.18em]" style={{ color: green }}>Get in touch</h3>
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
    <section className="relative overflow-hidden bg-[#0B203D]">
      <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "linear-gradient(120deg, transparent 0%, rgba(212,146,12,.45) 100%)" }} />
      <div className="absolute -right-28 -top-28 h-80 w-80 rounded-full border border-white/10" />
      <div className="absolute -bottom-32 left-1/3 h-80 w-80 rounded-full border border-white/10" />
      <div className="relative mx-auto grid max-w-[1440px] items-center gap-10 px-5 py-16 sm:px-8 md:py-20 lg:grid-cols-[1.15fr_.85fr] lg:py-24">
        <div>
          <span className="mb-4 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.22em]" style={{ color: primary }}><span className="h-0.5 w-7" style={{ backgroundColor: primary }} /> {eyebrow}</span>
          <h1 className="max-w-3xl text-4xl font-black leading-[1.05] text-white sm:text-5xl lg:text-6xl">{title}</h1>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/70 sm:text-lg">{subtitle}</p>
        </div>
        {image && <div className="relative hidden overflow-hidden rounded-2xl border border-white/10 shadow-2xl lg:block"><img src={image} alt="" className="h-72 w-full object-cover opacity-80" /><div className="absolute inset-0 bg-gradient-to-tr from-[#0B203D]/70 to-transparent" /></div>}
      </div>
    </section>
  );
}

function SectionHeading({ eyebrow, title, text, light = false }: { eyebrow: string; title: string; text?: string; light?: boolean }) {
  return <div className="mb-10 max-w-2xl"><span className="mb-3 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em]" style={{ color: primary }}><span className="h-0.5 w-6" style={{ backgroundColor: primary }} /> {eyebrow}</span><h2 className={`text-3xl font-black leading-tight sm:text-4xl ${light ? "text-white" : "text-[#0B203D]"}`}>{title}</h2>{text && <p className={`mt-4 text-base leading-relaxed ${light ? "text-white/65" : "text-gray-600"}`}>{text}</p>}</div>;
}

function HomePage() {
  return (
    <>
      <DynamicHero />

      <section className="border-b border-gray-100 bg-white py-12"><div className="mx-auto grid max-w-[1440px] gap-8 px-5 sm:px-8 md:grid-cols-3"><div className="flex gap-4"><div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-50" style={{ color: orange }}><Target size={22} /></div><div><h3 className="font-bold text-[#0B203D]">Mission configured</h3><p className="mt-1 text-sm leading-relaxed text-gray-500">Aircraft and payloads tailored to operational objectives.</p></div></div><div className="flex gap-4"><div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-50" style={{ color: green }}><ShieldCheck size={22} /></div><div><h3 className="font-bold text-[#0B203D]">Validated in flight</h3><p className="mt-1 text-sm leading-relaxed text-gray-500">Structured testing for safety, endurance, control, and reliability.</p></div></div><div className="flex gap-4"><div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-50" style={{ color: primary }}><Zap size={22} /></div><div><h3 className="font-bold text-[#0B203D]">Ready to deploy</h3><p className="mt-1 text-sm leading-relaxed text-gray-500">Training, support, spares, and lifecycle planning included.</p></div></div></div></section>

      <section className="bg-[#FAFAF8] py-20"><div className="mx-auto max-w-[1440px] px-5 sm:px-8"><SectionHeading eyebrow="Engineering capabilities" title="From requirement to flight-ready system." text="We bring airframe design, avionics, payloads, autonomy, testing, manufacturing, and operator support together under one program." /><div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{serviceItems.map((item) => <ServiceCard key={item.title} {...item} />)}</div><Link href="/services" className="mt-9 inline-flex items-center gap-2 text-sm font-bold" style={{ color: orange }}>Explore all capabilities <ArrowRight size={15} /></Link></div></section>

      <section className="bg-white py-20"><div className="mx-auto max-w-[1440px] px-5 sm:px-8"><SectionHeading eyebrow="Our UAS portfolio" title="Aerial platforms built around the mission." text="Modular unmanned systems for surveillance, tactical awareness, industrial inspection, and autonomous field operations." /><div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">{productItems.map((item) => <ProductCard key={item.title} {...item} />)}</div></div></section>

      <section className="bg-[#0B203D] py-20"><div className="mx-auto grid max-w-[1440px] gap-12 px-5 sm:px-8 lg:grid-cols-[.8fr_1.2fr] lg:items-center"><div><SectionHeading eyebrow="Mission applications" title="One platform architecture. Multiple operational roles." text="ASP Aero Tech configures each UAS around the environment, payload, endurance, communications, and data needs of the mission." light /><Link href="/industries" className="inline-flex items-center gap-2 rounded-lg border border-white/25 px-5 py-3 text-sm font-bold text-white hover:bg-white/10">Explore applications <ArrowRight size={15} /></Link></div><div className="grid grid-cols-2 gap-3 sm:grid-cols-3">{industryItems.map((item) => <Link href="/industries" key={item.title} className="rounded-xl border border-white/10 bg-white/[.04] p-4 transition-colors hover:border-[#F47E20]/60 hover:bg-white/[.08]"><item.icon size={21} style={{ color: primary }} /><span className="mt-4 block text-sm font-bold text-white">{item.title}</span></Link>)}</div></div></section>

      <section className="bg-white py-20"><div className="mx-auto max-w-[1440px] px-5 sm:px-8"><div className="relative overflow-hidden rounded-2xl bg-[#F6F1E8] px-7 py-12 sm:px-14"><div className="absolute -right-12 -top-20 h-60 w-60 rounded-full border-[28px] border-white/50" /><div className="relative max-w-2xl"><span className="text-xs font-black uppercase tracking-[0.2em]" style={{ color: orange }}>Define the mission</span><h2 className="mt-3 text-3xl font-black text-[#0B203D] sm:text-4xl">Let&apos;s configure the right aerial system.</h2><p className="mt-4 max-w-xl text-gray-600">Share your range, endurance, payload, operating environment, and deployment needs. Our engineering team will map a practical path forward.</p><Link href="/contact" className="mt-7 inline-flex items-center gap-2 rounded-lg px-5 py-3 text-sm font-bold text-white" style={{ backgroundColor: orange }}>Request a technical briefing <ArrowRight size={15} /></Link></div></div></div></section>
    </>
  );
}

function ServiceCard({ icon: Icon, title, text, color }: { icon: typeof Globe2; title: string; text: string; color: string }) {
  return <div className="group rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"><div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl" style={{ backgroundColor: `${color}16`, color }}><Icon size={22} /></div><h3 className="text-lg font-bold text-[#0B203D]">{title}</h3><p className="mt-2 text-sm leading-relaxed text-gray-500">{text}</p><span className="mt-5 inline-flex items-center gap-1 text-xs font-black uppercase tracking-wider opacity-0 transition-opacity group-hover:opacity-100" style={{ color }}>Learn more <ArrowRight size={13} /></span></div>;
}

function ProductCard({ icon: Icon, label, title, text, color, link = "/products" }: { icon: typeof Workflow; label: string; title: string; text: string; color: string; link?: string }) {
  return <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"><div className="flex items-center justify-between"><div className="flex h-12 w-12 items-center justify-center rounded-xl" style={{ backgroundColor: `${color}16`, color }}><Icon size={23} /></div><span className="text-[9px] font-black tracking-[0.18em]" style={{ color }}>{label}</span></div><h3 className="mt-5 text-lg font-bold text-[#0B203D]">{title}</h3><p className="mt-2 text-sm leading-relaxed text-gray-500">{text}</p><Link href={link} className="mt-5 inline-flex items-center gap-1 text-sm font-bold" style={{ color }}>View platform <ChevronRight size={15} /></Link></div>;
}

function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About ASP Aero Tech"
        title={
          <>Engineering the Future of <br className="hidden sm:block" />
          <span style={{ color: primary }}>Indian Aerospace.</span></>
        }
        subtitle="An Indian technology and manufacturing company focused on the development of unmanned aerial systems, aerospace electronics, embedded systems, and mission-oriented solutions."
        image="/product-images/fixed-wing.jpg"
      />

      <section className="bg-white py-20 lg:py-32">
        <div className="mx-auto grid max-w-[1440px] gap-16 px-5 sm:px-8 lg:grid-cols-2 lg:items-center">
          <div>
            <SectionHeading
              eyebrow="Technology & Mission"
              title="Where technology meets the mission."
              text="Modern aerospace and defence systems are no longer built around hardware alone. They require the integration of Software, Electronics, Aerospace Engineering, AI, Communication, and Mission Intelligence. ASP Aero Tech brings these capabilities together under one technology ecosystem."
            />
            <div className="mt-8 grid grid-cols-2 gap-6 border-t border-gray-100 pt-8 sm:grid-cols-3">
              {[
                ["Performance", "Engineered for extremes"],
                ["Reliability", "Mission-critical focus"],
                ["Indigenous", "Built for India"]
              ].map(([title, label]) => (
                <div key={title}>
                  <strong className="block text-xl font-black text-[#0B203D]">{title}</strong>
                  <span className="mt-1 block text-xs font-bold uppercase tracking-wide text-gray-500">{label}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="absolute -bottom-6 -left-6 h-48 w-48 rounded-2xl" style={{ backgroundColor: `${primary}22` }} />
            <div className="absolute -top-6 -right-6 h-48 w-48 rounded-2xl" style={{ backgroundColor: `${green}22` }} />
            <img src="/product-images/surveillance.jpg" alt="Surveillance Drone" className="relative h-[420px] w-full rounded-2xl object-cover shadow-2xl" />
          </div>
        </div>
      </section>

      <section className="bg-[#FAFAF8] py-20 lg:py-32">
        <div className="mx-auto max-w-[1440px] px-5 sm:px-8">
          <SectionHeading
            eyebrow="Our Foundation"
            title="The pillars of our capability."
            text="ASP Aero Tech combines digital capabilities, operational field experience, and deep technical engineering to develop systems that are deployable and mission-ready."
          />
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              [Code2, "Software-Driven Technology", "We approach drone systems as integrated digital platforms. From embedded flight-control to AI automation and secure command systems, our software-first approach allows hardware to become smarter, more connected, and highly adaptable."],
              [ShieldCheck, "Defence Experience", "Guided by an Advisory Board of senior defence professionals. Their understanding of operational environments, field challenges, and mission realities ensures we build what a mission actually requires, not just what technology can do."],
              [Lightbulb, "IIT Alumni & Engineering", "Supported by IIT alumni and experienced engineering professionals across aerospace, electronics, embedded systems, and robotics. We combine academic excellence with practical industry experience to convert complex challenges into deployable solutions."]
            ].map(([Icon, title, text]) => (
              <div key={title as string} className="group rounded-2xl border border-gray-100 bg-white p-8 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl">
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-orange-50 transition-colors group-hover:bg-[#F47E20]" style={{ color: orange }}>
                  <Icon size={26} className="transition-colors group-hover:text-white" />
                </div>
                <h3 className="text-xl font-bold text-[#0B203D]">{title as string}</h3>
                <p className="mt-4 text-sm leading-relaxed text-gray-600">{text as string}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-20 lg:py-32">
        <div className="mx-auto max-w-[1440px] px-5 sm:px-8">
          <SectionHeading
            eyebrow="What We Build"
            title="A comprehensive aerospace ecosystem."
            text="ASP Aero Tech is developing capabilities across the broader Drone, Aerospace & Electronics ecosystem to provide integrated solutions designed around specific operational requirements."
          />
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              [Rocket, "Unmanned Aerial Systems", "Advanced drone platforms designed for surveillance, inspection, mapping, logistics, and specialized tactical missions.", orange],
              [Network, "Aerospace Electronics", "Electronic systems, control electronics, communication modules, sensors, and mission-oriented aerospace subsystems.", green],
              [Workflow, "Embedded & Intelligent Systems", "Hardware-software systems combining embedded computing, automation, artificial intelligence, sensors, and real-time data processing.", navy],
              [Target, "Command & Control", "Technology platforms and ground-control stations for monitoring, managing, communicating with, and operating unmanned aerial systems.", "#167C80"],
              [Award, "Mission Technologies", "Integrated solutions configured for specific field operations and outcomes, avoiding generic one-size-fits-all hardware constraints.", "#7455B8"]
            ].map(([Icon, title, text, color]) => (
              <div key={title as string} className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl" style={{ backgroundColor: `${color as string}15`, color: color as string }}>
                  <Icon size={22} />
                </div>
                <h3 className="text-lg font-bold text-[#0B203D]">{title as string}</h3>
                <p className="mt-3 text-sm leading-relaxed text-gray-500">{text as string}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#0B203D] py-20 lg:py-32 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "linear-gradient(120deg, transparent 0%, rgba(212,146,12,.5) 100%)" }} />
        <div className="relative mx-auto max-w-[1440px] px-5 sm:px-8">
          <div className="mb-16">
            <span className="mb-3 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em]" style={{ color: primary }}><span className="h-0.5 w-6" style={{ backgroundColor: primary }} /> Our Approach</span>
            <h2 className="text-3xl font-black leading-tight text-white sm:text-4xl">Design. Engineer. Integrate. Deploy.</h2>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/70">We believe successful aerospace technology comes from the tight integration of multiple disciplines.</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              ["01", "Understand", "We begin by understanding the operational requirement, environment, constraints, and specific mission objectives."],
              ["02", "Design", "Our multidisciplinary teams develop the architecture, electronics, software, and mechanical systems required."],
              ["03", "Engineer", "We transform concepts into engineered prototypes through structured, iterative development, testing, and refinement."],
              ["04", "Integrate", "Hardware, software, communication, sensors, and mission systems are combined into a single unified platform."],
              ["05", "Validate", "Systems are rigorously evaluated against defined performance, reliability, and operational requirements."],
              ["06", "Deploy", "Delivering practical, scalable technology capable of moving out of the laboratory and into real-world applications."]
            ].map(([num, title, text]) => (
              <div key={title} className="relative rounded-2xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur-sm transition-all hover:bg-white/[0.06]">
                <span className="absolute -top-5 right-6 text-6xl font-black opacity-10" style={{ color: primary }}>{num}</span>
                <h3 className="text-xl font-bold text-white"><span style={{ color: primary }} className="mr-2">{num} —</span>{title}</h3>
                <p className="mt-4 text-sm leading-relaxed text-white/60">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-20 lg:py-32">
        <div className="mx-auto grid max-w-[1440px] gap-12 px-5 sm:px-8 lg:grid-cols-2 lg:items-center">
          <div className="order-2 lg:order-1 relative">
            <div className="absolute -bottom-4 -right-4 h-full w-full rounded-2xl" style={{ backgroundColor: `${green}15` }} />
            <img src="/product-images/vtol.jpg" alt="VTOL Drone Platform" className="relative h-[500px] w-full rounded-2xl object-cover shadow-xl" />
          </div>
          <div className="order-1 lg:order-2">
            <SectionHeading
              eyebrow="India's Future"
              title="Built in India. Designed for the Future."
              text="ASP Aero Tech is committed to contributing to India's growing indigenous aerospace, drone, electronics, and defence technology ecosystem."
            />
            <p className="mt-4 text-base leading-relaxed text-gray-600">We believe India has the engineering talent, scientific capability, manufacturing potential, and entrepreneurial energy required to become a global technology leader.</p>
            <div className="mt-8 rounded-2xl border-l-4 bg-gray-50 p-6 sm:p-8" style={{ borderColor: orange }}>
              <Quote size={28} className="mb-4 opacity-50" style={{ color: orange }} />
              <p className="text-lg font-bold italic leading-relaxed text-[#0B203D]">
                "Our role is to contribute by building Indian intellectual property, Indian engineering capabilities, and Indian technology products. From concept to capability—we are building technology for India's next generation of aerospace and defence systems."
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#FAFAF8] py-20 lg:py-32">
        <div className="mx-auto max-w-[1000px] px-5 text-center sm:px-8">
          <div className="mb-8 inline-flex h-16 w-16 items-center justify-center rounded-2xl" style={{ backgroundColor: `${primary}15`, color: primary }}>
            <Award size={32} />
          </div>
          <h2 className="text-3xl font-black text-[#0B203D] sm:text-4xl lg:text-5xl">Engineering the Future.</h2>
          <p className="mt-6 text-lg leading-relaxed text-gray-600 sm:text-xl">To develop reliable, intelligent, and indigenous technology platforms that solve complex real-world problems across aerospace, defence, security, industrial, and commercial applications.</p>

          <div className="mt-12 flex flex-wrap justify-center gap-3">
            {["Innovation", "Engineering Excellence", "Indigenization", "Reliability", "Security", "Mission Focus"].map((tag) => (
              <span key={tag} className="rounded-full border border-gray-200 bg-white px-5 py-2.5 text-sm font-bold text-[#0B203D] shadow-sm">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

function ServicesPage() {
  return <><PageHero eyebrow="Engineering capabilities" title={<>Complete UAS development, <span style={{ color: primary }}>integration, and support.</span></>} subtitle="From an operational requirement to a validated aircraft and trained crew, ASP Aero Tech supports the complete unmanned-system lifecycle." image="https://images.unsplash.com/photo-1487887235947-a955ef187fcc?auto=format&fit=crop&w=1200&q=85" /><section className="bg-[#FAFAF8] py-20"><div className="mx-auto max-w-[1440px] px-5 sm:px-8"><SectionHeading eyebrow="Capabilities" title="Every discipline required to put a dependable aircraft in the field." text="Engage us for a focused integration need or a complete development and manufacturing program." /><div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{serviceItems.map((item) => <ServiceCard key={item.title} {...item} />)}</div></div></section><section className="bg-white py-20"><div className="mx-auto grid max-w-[1440px] gap-12 px-5 sm:px-8 lg:grid-cols-2 lg:items-center"><div className="rounded-2xl bg-[#0B203D] p-8 sm:p-10"><span className="text-xs font-black uppercase tracking-[0.2em]" style={{ color: primary }}>Development process</span><h2 className="mt-4 text-3xl font-black text-white">Requirement. Prototype. Validate. Deploy.</h2><p className="mt-4 text-sm leading-relaxed text-white/65">A gated engineering process keeps mission goals, airworthiness, manufacturability, and operator needs aligned from the first system definition through field deployment.</p><div className="mt-8 space-y-5">{["Define mission and system requirements", "Engineer and integrate the aircraft", "Validate, train, and support deployment"].map((step, index) => <div key={step} className="flex items-center gap-4"><span className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-black text-white" style={{ backgroundColor: index === 1 ? orange : primary }}>{index + 1}</span><span className="text-sm font-bold text-white">{step}</span></div>)}</div></div><div><SectionHeading eyebrow="Built around operations" title="Engineering that starts with the mission profile." text="Every deployment environment is different. We balance endurance, payload, communications, portability, autonomy, maintenance, and total lifecycle cost." /><div className="space-y-4">{["Mission-configurable airframe and payload architecture", "Ground and flight validation against defined requirements", "Operator training, maintenance, spares, and upgrades"].map((line) => <div key={line} className="flex items-center gap-3 text-sm font-semibold text-gray-700"><Check size={18} style={{ color: orange }} /> {line}</div>)}</div><Link href="/contact" className="mt-8 inline-flex items-center gap-2 rounded-lg px-5 py-3 text-sm font-bold text-white" style={{ backgroundColor: orange }}>Discuss your mission <ArrowRight size={15} /></Link></div></div></section></>;
}

function IndustriesPage() {
  const [selected, setSelected] = useState<string | null>(null);
  const current = industryItems.find((item) => item.title === selected);
  return <><PageHero eyebrow="Mission applications" title={<>Aerial capability for <span style={{ color: primary }}>complex operating environments.</span></>} subtitle="Configure the aircraft, payload, datalink, and mission software around the intelligence or action your team needs from the air." image="https://images.unsplash.com/photo-1521405924368-64c5b84bec60?auto=format&fit=crop&w=1200&q=85" /><section className="bg-[#FAFAF8] py-20"><div className="mx-auto max-w-[1440px] px-5 sm:px-8"><SectionHeading eyebrow="Operational sectors" title="Different missions. One disciplined engineering approach." text="Explore where ASP Aero Tech platforms can improve reach, speed, safety, data quality, and operational awareness." /><div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{industryItems.map((item) => <button key={item.title} onClick={() => setSelected(item.title)} className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-7 text-left shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"><div className="absolute right-0 top-0 h-24 w-24 rounded-bl-full bg-indigo-50 transition-colors group-hover:bg-orange-50" /><div className="relative"><div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-[#138808] transition-colors group-hover:bg-orange-50 group-hover:text-[#F47E20]"><item.icon size={23} /></div><h3 className="mt-6 text-lg font-bold text-[#0B203D]">{item.title}</h3><p className="mt-2 text-sm leading-relaxed text-gray-500">{item.text}</p><span className="mt-6 inline-flex items-center gap-1 text-xs font-black uppercase tracking-wider" style={{ color: orange }}>View application <ArrowRight size={13} /></span></div></button>)}</div></div></section>{current && <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0B203D]/60 p-5" onClick={() => setSelected(null)}><div className="w-full max-w-lg rounded-2xl bg-white p-7 shadow-2xl" onClick={(event) => event.stopPropagation()}><div className="flex items-start justify-between"><div><span className="text-xs font-black uppercase tracking-[0.2em]" style={{ color: orange }}>Mission application</span><h2 className="mt-2 text-2xl font-black text-[#0B203D]">{current.title}</h2></div><button aria-label="Close industry details" className="rounded-lg p-2 text-gray-400 hover:bg-gray-100" onClick={() => setSelected(null)}><X size={19} /></button></div><p className="mt-5 text-sm leading-relaxed text-gray-600">{current.text} Our engineers can assess the mission profile and recommend an airframe, payload, communications, and support configuration for the deployment environment.</p><Link href="/contact" onClick={() => setSelected(null)} className="mt-7 inline-flex items-center gap-2 rounded-lg px-5 py-3 text-sm font-bold text-white" style={{ backgroundColor: orange }}>Discuss the mission <ArrowRight size={15} /></Link></div></div>}</>;
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
  return <><PageHero eyebrow="Request a technical briefing" title={<>Tell us about the <span style={{ color: primary }}>mission.</span></>} subtitle="Share the operating environment, range, endurance, payload, communications, and deployment objectives. Our engineering team will review the requirement." /><section className="bg-white py-20"><div className="mx-auto grid max-w-[1100px] gap-12 px-5 sm:px-8 lg:grid-cols-[.75fr_1.25fr]"><div><SectionHeading eyebrow="Engage ASP Aero Tech" title="Start with the operating requirement." text="Contact us for product information, a technical briefing, platform configuration, integration support, training, or a demonstration discussion." /><div className="space-y-4 text-sm text-gray-600"><span className="flex items-center gap-3"><MessageSquare size={18} style={{ color: primary }} /> Technical and mission enquiries</span><span className="flex items-center gap-3"><Headphones size={18} style={{ color: primary }} /> Training and lifecycle support</span><span className="flex items-center gap-3"><MapPin size={18} style={{ color: primary }} /> India</span></div></div><div className="rounded-2xl border border-gray-100 bg-[#FAFAF8] p-6 sm:p-8">{sent ? <div className="flex min-h-[360px] flex-col items-center justify-center text-center"><div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600"><Check size={26} /></div><h2 className="mt-5 text-2xl font-black text-[#0B203D]">Requirement received.</h2><p className="mt-2 max-w-sm text-sm leading-relaxed text-gray-500">Thank you. An ASP Aero Tech representative will review your enquiry and respond shortly.</p><button className="mt-6 text-sm font-bold" style={{ color: orange }} onClick={() => setSent(false)}>Send another enquiry</button></div> : <form onSubmit={submit} className="space-y-5"><div className="grid gap-5 sm:grid-cols-2"><Field label="Full name" name="name" required /><Field label="Email address" name="email" type="email" required /></div><div className="grid gap-5 sm:grid-cols-2"><Field label="Organization" name="organization" /><label className="block"><span className="mb-2 block text-xs font-black uppercase tracking-wider text-gray-500">Area of interest</span><select name="interest" required className="w-full rounded-lg border border-gray-200 bg-white px-3 py-3 text-sm text-gray-700 outline-none focus:border-[#F47E20]"><option value="">Select one</option><option value="defence-isr">Defence & ISR</option><option value="industrial-inspection">Industrial inspection</option><option value="survey-mapping">Surveying & mapping</option><option value="emergency-response">Emergency response</option><option value="payload-integration">Payload integration</option><option value="training-support">Training & support</option><option value="other">Other requirement</option></select></label></div><label className="block"><span className="mb-2 block text-xs font-black uppercase tracking-wider text-gray-500">Mission requirement</span><textarea name="message" required minLength={10} rows={5} className="w-full resize-none rounded-lg border border-gray-200 bg-white px-3 py-3 text-sm text-gray-700 outline-none focus:border-[#F47E20]" placeholder="Operating environment, payload, range, endurance, deployment schedule, or other requirements..." /></label>{error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}<button disabled={createInquiry.isPending} className="inline-flex w-full items-center justify-center gap-2 rounded-lg py-3.5 text-sm font-bold text-white disabled:opacity-60" style={{ backgroundColor: orange }}>{createInquiry.isPending ? "Sending..." : "Submit requirement"} <ArrowRight size={15} /></button></form>}</div></div></section></>;
}

function Field({ label, name, type = "text", required = false }: { label: string; name: string; type?: string; required?: boolean }) {
  return <label className="block"><span className="mb-2 block text-xs font-black uppercase tracking-wider text-gray-500">{label}</span><input name={name} type={type} required={required} className="w-full rounded-lg border border-gray-200 bg-white px-3 py-3 text-sm text-gray-700 outline-none focus:border-[#F47E20]" /></label>;
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