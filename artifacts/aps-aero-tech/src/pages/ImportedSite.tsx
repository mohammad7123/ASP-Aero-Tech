import { FormEvent, ReactNode, useState } from "react";
import { Link, useLocation } from "wouter";
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

const serviceItems = [
  { icon: Globe2, title: "Web Development", text: "Modern websites and web applications that turn every digital touchpoint into business momentum.", color: orange },
  { icon: Smartphone, title: "Mobile Applications", text: "Intuitive iOS and Android products designed for the way your customers and teams work.", color: blue },
  { icon: Cloud, title: "Cloud Solutions", text: "Secure, scalable cloud infrastructure that keeps your organization ready for what is next.", color: primary },
  { icon: ShieldCheck, title: "Cybersecurity", text: "Practical security programs that protect data, systems, people, and reputation.", color: "#167C80" },
  { icon: Lightbulb, title: "IT Consulting", text: "Clear technology strategy, architecture, and delivery guidance tied to measurable outcomes.", color: "#7455B8" },
  { icon: BarChart3, title: "Digital Marketing", text: "Data-informed campaigns and content that build visibility, trust, and qualified demand.", color: "#2E8B57" },
];

const productItems = [
  { icon: Workflow, label: "WMS 360", title: "Total Warehouse Intelligence", text: "Control stock, people, orders, and fulfilment from a single operational view.", color: orange },
  { icon: Network, label: "ERP", title: "SAP Business One", text: "Bring finance, sales, purchasing, inventory, and operations together in one system.", color: blue },
  { icon: Users, label: "HR PLATFORM", title: "MyHR One", text: "A smarter employee experience with connected HR workflows and actionable insight.", color: primary },
  { icon: Sparkles, label: "AI SOLUTIONS", title: "Intelligent Automation", text: "Use practical AI to remove repetitive work and make better decisions faster.", color: "#167C80" },
];

const industryItems = [
  { icon: Factory, title: "Manufacturing", text: "Connected planning, production, quality, and inventory for resilient operations." },
  { icon: ShoppingBag, title: "Retail & Distribution", text: "Customer, channel, stock, and fulfilment visibility from one connected platform." },
  { icon: Building2, title: "Construction", text: "Project, procurement, workforce, and cost control for every stage of delivery." },
  { icon: Package, title: "Food & Beverage", text: "Traceability, batch management, compliance, and expiry-aware warehouse control." },
  { icon: HeartHandshake, title: "Professional Services", text: "Project profitability, resource planning, timesheets, and billing in sync." },
  { icon: Rocket, title: "Engineering", text: "BOM, MRP, service, and project manufacturing systems built around complexity." },
];

function LegacyLayout({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [location] = useLocation();

  return (
    <div className="legacy-site min-h-screen bg-white text-[#1C1917]">
      <div className="hidden bg-[#1A1F36] text-white sm:block">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between px-5 py-2 text-xs">
          <span className="tracking-wide text-white/75">Technology partner for ambitious businesses</span>
          <div className="flex items-center gap-5 text-white/75">
            <a href="mailto:Info@ctrlatechsolutions.com" className="transition-colors hover:text-white">Info@ctrlatechsolutions.com</a>
            <a href="tel:+919310775007" className="transition-colors hover:text-white">+91 93107 75007</a>
          </div>
        </div>
      </div>

      <header className="sticky top-0 z-40 border-b border-gray-100 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-[76px] max-w-[1440px] items-center justify-between px-5 sm:px-8">
          <Link href="/" className="flex items-center gap-3" onClick={() => setOpen(false)}>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#1A1F36] shadow-sm">
              <span className="text-xl font-black italic text-white">C</span>
            </div>
            <div className="leading-none">
              <span className="block text-lg font-black tracking-tight text-[#1A1F36]">CtrlA</span>
              <span className="block text-[9px] font-bold uppercase tracking-[0.26em]" style={{ color: primary }}>Tech Solutions</span>
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
                {["/portfolio", "/contact"].map((href) => (
                  <Link key={href} href={href} className="block rounded-lg px-3 py-2.5 text-sm text-gray-600 hover:bg-orange-50 hover:text-[#D4920C]">
                    {href.slice(1).replace("-", " ").replace(/^\w/, (c) => c.toUpperCase())}
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
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1A1F36] text-lg font-black italic text-white">C</div>
            <div><strong className="block text-[#1A1F36]">CtrlA</strong><span className="text-[9px] font-bold uppercase tracking-[0.2em]" style={{ color: primary }}>Tech Solutions</span></div>
          </div>
          <p className="max-w-xs text-sm leading-relaxed text-gray-600">We help businesses across India and the UK scale, automate, and lead with technology that works.</p>
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
          <div className="space-y-2.5 text-sm text-gray-600"><Link href="/services" className="block hover:text-[#D4920C]">Digital transformation</Link><Link href="/products" className="block hover:text-[#D4920C]">ERP & business platforms</Link><Link href="/industries" className="block hover:text-[#D4920C]">Industry solutions</Link><Link href="/contact" className="block hover:text-[#D4920C]">Talk to an expert</Link></div>
        </div>
        <div>
          <h3 className="mb-4 text-xs font-black uppercase tracking-[0.18em]" style={{ color: blue }}>Get in touch</h3>
          <div className="space-y-3 text-sm text-gray-600"><a href="mailto:Info@ctrlatechsolutions.com" className="flex items-center gap-2 hover:text-[#D4920C]"><Mail size={15} style={{ color: primary }} /> Info@ctrlatechsolutions.com</a><a href="tel:+919310775007" className="flex items-center gap-2 hover:text-[#D4920C]"><Phone size={15} style={{ color: primary }} /> +91 93107 75007</a><span className="flex items-start gap-2"><MapPin size={15} className="mt-0.5 shrink-0" style={{ color: primary }} /> India &amp; United Kingdom</span></div>
          <Link href="/contact" className="mt-5 inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-bold text-white" style={{ backgroundColor: primary }}>Contact us <ArrowRight size={14} /></Link>
        </div>
      </div>
      <div className="mx-auto flex max-w-[1440px] flex-col items-center justify-between gap-3 border-t border-gray-100 px-5 py-5 text-xs text-gray-500 sm:flex-row sm:px-8"><span>© {new Date().getFullYear()} CtrlA Tech Solutions. All rights reserved.</span><span>Built for progress. Designed for people.</span></div>
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
      <section className="relative overflow-hidden bg-[#1A1F36]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_40%,rgba(212,146,12,.26),transparent_30%),linear-gradient(115deg,#1A1F36_0%,#252C51_65%,#3D4FA0_100%)]" />
        <div className="relative mx-auto grid max-w-[1440px] items-center gap-12 px-5 py-16 sm:px-8 md:py-24 lg:grid-cols-[1.02fr_.98fr] lg:py-28">
          <div>
            <span className="mb-5 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em]" style={{ color: primary }}><span className="h-0.5 w-8" style={{ backgroundColor: primary }} /> Your technology partner</span>
            <h1 className="max-w-3xl text-5xl font-black leading-[.98] tracking-tight text-white sm:text-6xl lg:text-[76px]">Technology that <span style={{ color: primary }}>moves</span> business forward.</h1>
            <p className="mt-7 max-w-xl text-base leading-relaxed text-white/70 sm:text-lg">From modern digital experiences to intelligent ERP, we connect the systems, people, and ideas that help ambitious organizations grow.</p>
            <div className="mt-8 flex flex-wrap gap-3"><Link href="/contact" className="inline-flex items-center gap-2 rounded-lg px-6 py-3.5 text-sm font-bold text-white shadow-lg transition-all hover:-translate-y-0.5" style={{ backgroundColor: orange }}>Start a conversation <ArrowRight size={16} /></Link><Link href="/about" className="inline-flex items-center gap-2 rounded-lg border border-white/25 px-6 py-3.5 text-sm font-bold text-white transition-colors hover:bg-white/10">Discover CtrlA <ChevronRight size={16} /></Link></div>
            <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-xs font-bold uppercase tracking-wider text-white/50"><span className="flex items-center gap-2"><Check size={14} style={{ color: primary }} /> India &amp; UK delivery</span><span className="flex items-center gap-2"><Check size={14} style={{ color: primary }} /> 15+ years of expertise</span></div>
          </div>
          <div className="relative">
            <div className="absolute -inset-3 rounded-[28px] border border-white/10" />
            <div className="relative overflow-hidden rounded-2xl bg-white/10 shadow-2xl"><img src="https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1200&q=85" alt="CtrlA team collaborating around a table" className="h-[360px] w-full object-cover opacity-85 sm:h-[440px]" /><div className="absolute inset-0 bg-gradient-to-t from-[#1A1F36] via-transparent to-transparent" /><div className="absolute bottom-0 left-0 p-6"><div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/65"><span className="h-2 w-2 rounded-full bg-emerald-400" /> Connected by design</div><p className="max-w-xs text-lg font-bold text-white">One partner. Every step of your transformation.</p></div></div>
          </div>
        </div>
      </section>

      <section className="border-b border-gray-100 bg-white py-12"><div className="mx-auto grid max-w-[1440px] gap-8 px-5 sm:px-8 md:grid-cols-3"><div className="flex gap-4"><div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-50" style={{ color: orange }}><Target size={22} /></div><div><h3 className="font-bold text-[#1A1F36]">Outcome focused</h3><p className="mt-1 text-sm leading-relaxed text-gray-500">Technology chosen for business impact, not complexity.</p></div></div><div className="flex gap-4"><div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-50" style={{ color: blue }}><Users size={22} /></div><div><h3 className="font-bold text-[#1A1F36]">Human at heart</h3><p className="mt-1 text-sm leading-relaxed text-gray-500">Experienced people who make change feel achievable.</p></div></div><div className="flex gap-4"><div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-50" style={{ color: primary }}><Zap size={22} /></div><div><h3 className="font-bold text-[#1A1F36]">Built to scale</h3><p className="mt-1 text-sm leading-relaxed text-gray-500">Platforms and practices ready for your next chapter.</p></div></div></div></section>

      <section className="bg-[#FAFAF8] py-20"><div className="mx-auto max-w-[1440px] px-5 sm:px-8"><SectionHeading eyebrow="Our capabilities" title="Make technology your competitive advantage." text="We bring strategy, design, engineering, and operations together so every investment works harder." /><div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{serviceItems.map((item) => <ServiceCard key={item.title} {...item} />)}</div><Link href="/services" className="mt-9 inline-flex items-center gap-2 text-sm font-bold" style={{ color: orange }}>Explore all services <ArrowRight size={15} /></Link></div></section>

      <section className="bg-white py-20"><div className="mx-auto max-w-[1440px] px-5 sm:px-8"><SectionHeading eyebrow="Our platforms" title="Products that make complex work simple." text="Purpose-built business platforms that connect your teams, data, and decisions." /><div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">{productItems.map((item) => <ProductCard key={item.title} {...item} />)}</div></div></section>

      <section className="bg-[#1A1F36] py-20"><div className="mx-auto grid max-w-[1440px] gap-12 px-5 sm:px-8 lg:grid-cols-[.8fr_1.2fr] lg:items-center"><div><SectionHeading eyebrow="Across industries" title="Context matters. We know yours." text="Our teams pair technology expertise with real operational understanding, so solutions fit the way your organization actually works." light /><Link href="/industries" className="inline-flex items-center gap-2 rounded-lg border border-white/25 px-5 py-3 text-sm font-bold text-white hover:bg-white/10">See industry solutions <ArrowRight size={15} /></Link></div><div className="grid grid-cols-2 gap-3 sm:grid-cols-3">{industryItems.map((item) => <Link href="/industries" key={item.title} className="rounded-xl border border-white/10 bg-white/[.04] p-4 transition-colors hover:border-[#D4920C]/60 hover:bg-white/[.08]"><item.icon size={21} style={{ color: primary }} /><span className="mt-4 block text-sm font-bold text-white">{item.title}</span></Link>)}</div></div></section>

      <section className="bg-white py-20"><div className="mx-auto max-w-[1440px] px-5 sm:px-8"><div className="relative overflow-hidden rounded-2xl bg-[#F6F1E8] px-7 py-12 sm:px-14"><div className="absolute -right-12 -top-20 h-60 w-60 rounded-full border-[28px] border-white/50" /><div className="relative max-w-2xl"><span className="text-xs font-black uppercase tracking-[0.2em]" style={{ color: orange }}>Ready when you are</span><h2 className="mt-3 text-3xl font-black text-[#1A1F36] sm:text-4xl">Let&apos;s turn your next challenge into progress.</h2><p className="mt-4 max-w-xl text-gray-600">Tell us what you are trying to achieve. We will bring the right people and a clear next step.</p><Link href="/contact" className="mt-7 inline-flex items-center gap-2 rounded-lg px-5 py-3 text-sm font-bold text-white" style={{ backgroundColor: orange }}>Start a conversation <ArrowRight size={15} /></Link></div></div></div></section>
    </>
  );
}

function ServiceCard({ icon: Icon, title, text, color }: { icon: typeof Globe2; title: string; text: string; color: string }) {
  return <div className="group rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"><div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl" style={{ backgroundColor: `${color}16`, color }}><Icon size={22} /></div><h3 className="text-lg font-bold text-[#1A1F36]">{title}</h3><p className="mt-2 text-sm leading-relaxed text-gray-500">{text}</p><span className="mt-5 inline-flex items-center gap-1 text-xs font-black uppercase tracking-wider opacity-0 transition-opacity group-hover:opacity-100" style={{ color }}>Learn more <ArrowRight size={13} /></span></div>;
}

function ProductCard({ icon: Icon, label, title, text, color }: { icon: typeof Workflow; label: string; title: string; text: string; color: string }) {
  return <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"><div className="flex items-center justify-between"><div className="flex h-12 w-12 items-center justify-center rounded-xl" style={{ backgroundColor: `${color}16`, color }}><Icon size={23} /></div><span className="text-[9px] font-black tracking-[0.18em]" style={{ color }}>{label}</span></div><h3 className="mt-5 text-lg font-bold text-[#1A1F36]">{title}</h3><p className="mt-2 text-sm leading-relaxed text-gray-500">{text}</p><Link href="/products" className="mt-5 inline-flex items-center gap-1 text-sm font-bold" style={{ color }}>View platform <ChevronRight size={15} /></Link></div>;
}

function AboutPage() {
  return <><PageHero eyebrow="About CtrlA" title={<>Technology with a <span style={{ color: primary }}>human point of view.</span></>} subtitle="We are a technology partner for organizations that want to work smarter, serve better, and build a more resilient future." image="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=85" /><section className="bg-white py-20"><div className="mx-auto grid max-w-[1440px] gap-12 px-5 sm:px-8 lg:grid-cols-2 lg:items-center"><div><SectionHeading eyebrow="Who we are" title="A partner for the whole journey." text="CtrlA Tech Solutions brings together the strategy, skills, and systems needed to turn ambitious plans into everyday progress. From our teams in India and the UK, we help growing organizations make technology useful, practical, and human." /><div className="grid grid-cols-2 gap-5 border-t border-gray-100 pt-7 sm:grid-cols-4">{[["15+", "Years expertise"], ["500+", "Businesses helped"], ["2", "Delivery regions"], ["1", "Connected partner"]].map(([number, label]) => <div key={label}><strong className="block text-3xl font-black" style={{ color: orange }}>{number}</strong><span className="mt-1 block text-xs font-bold uppercase tracking-wide text-gray-500">{label}</span></div>)}</div></div><div className="relative"><div className="absolute -bottom-5 -left-5 h-36 w-36 rounded-2xl" style={{ backgroundColor: `${primary}22` }} /><img src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1000&q=85" alt="Team workshop" className="relative h-[390px] w-full rounded-2xl object-cover shadow-xl" /></div></div></section><section className="bg-[#FAFAF8] py-20"><div className="mx-auto max-w-[1440px] px-5 sm:px-8"><SectionHeading eyebrow="What we value" title="The principles behind the work." /><div className="grid gap-5 md:grid-cols-3">{[[Lightbulb, "Stay curious", "We ask better questions, keep learning, and look for the simplest path to a meaningful outcome."], [HeartHandshake, "Be a true partner", "We work alongside your people, communicate clearly, and take ownership from first conversation to go-live."], [Award, "Raise the standard", "We care about craft, reliability, and the details that turn a solution into something people trust."]].map(([Icon, title, text]) => <div key={title as string} className="rounded-2xl border border-gray-100 bg-white p-7"><div className="mb-5 flex h-11 w-11 items-center justify-center rounded-full bg-orange-50" style={{ color: orange }}><Icon size={20} /></div><h3 className="text-lg font-bold text-[#1A1F36]">{title as string}</h3><p className="mt-2 text-sm leading-relaxed text-gray-500">{text as string}</p></div>)}</div></div></section><section className="bg-white py-20"><div className="mx-auto max-w-3xl px-5 text-center sm:px-8"><Quote className="mx-auto mb-5" size={30} style={{ color: primary }} /><p className="text-2xl font-bold leading-relaxed text-[#1A1F36] sm:text-3xl">“The best technology is not the most complicated. It is the technology that helps people do their best work.”</p><p className="mt-5 text-sm font-bold uppercase tracking-widest text-gray-500">The CtrlA team</p></div></section></>;
}

function ServicesPage() {
  return <><PageHero eyebrow="Our services" title={<>From strategy to <span style={{ color: primary }}>scale.</span></>} subtitle="End-to-end technology services that connect business ambition to reliable delivery." image="https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&w=1200&q=85" /><section className="bg-[#FAFAF8] py-20"><div className="mx-auto max-w-[1440px] px-5 sm:px-8"><SectionHeading eyebrow="Capabilities" title="The right expertise at every stage." text="Choose the capability you need today, or bring us in to shape the complete transformation roadmap." /><div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{serviceItems.map((item) => <ServiceCard key={item.title} {...item} />)}</div></div></section><section className="bg-white py-20"><div className="mx-auto grid max-w-[1440px] gap-12 px-5 sm:px-8 lg:grid-cols-2 lg:items-center"><div className="rounded-2xl bg-[#1A1F36] p-8 sm:p-10"><span className="text-xs font-black uppercase tracking-[0.2em]" style={{ color: primary }}>How we work</span><h2 className="mt-4 text-3xl font-black text-white">Clarity first. Momentum always.</h2><p className="mt-4 text-sm leading-relaxed text-white/65">Our delivery model is designed to reduce uncertainty. We align on the outcome, create a practical path, and keep the people who use the solution involved at every step.</p><div className="mt-8 space-y-5">{["Understand the opportunity", "Design the right solution", "Build, launch, and learn"].map((step, index) => <div key={step} className="flex items-center gap-4"><span className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-black text-white" style={{ backgroundColor: index === 1 ? orange : primary }}>{index + 1}</span><span className="text-sm font-bold text-white">{step}</span></div>)}</div></div><div><SectionHeading eyebrow="Built around you" title="Expertise that fits your reality." text="No two organizations start from the same place. We balance proven frameworks with the flexibility to work within your people, processes, and priorities." /><div className="space-y-4">{["Senior, accountable delivery teams", "Practical recommendations over jargon", "A clear handover and long-term support"].map((line) => <div key={line} className="flex items-center gap-3 text-sm font-semibold text-gray-700"><Check size={18} style={{ color: orange }} /> {line}</div>)}</div><Link href="/contact" className="mt-8 inline-flex items-center gap-2 rounded-lg px-5 py-3 text-sm font-bold text-white" style={{ backgroundColor: orange }}>Discuss your needs <ArrowRight size={15} /></Link></div></div></section></>;
}

function ProductsPage() {
  return <><PageHero eyebrow="Our products" title={<>Business platforms built for <span style={{ color: primary }}>real work.</span></>} subtitle="Connected products that give your teams the insight, automation, and control to move faster with confidence." image="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=85" /><section className="bg-white py-20"><div className="mx-auto max-w-[1440px] px-5 sm:px-8"><SectionHeading eyebrow="The CtrlA platform" title="One connected view of your business." text="Our products are designed to work with your existing operation and grow with your next one." /><div className="grid gap-5 md:grid-cols-2">{productItems.map((item) => <div key={item.title} className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-[#FAFAF8] p-7 transition-all hover:-translate-y-1 hover:shadow-lg"><div className="absolute right-0 top-0 h-28 w-28 rounded-bl-full opacity-20" style={{ backgroundColor: item.color }} /><div className="relative"><div className="flex items-center justify-between"><div className="flex h-12 w-12 items-center justify-center rounded-xl" style={{ backgroundColor: `${item.color}18`, color: item.color }}><item.icon size={23} /></div><span className="text-[10px] font-black tracking-[0.2em]" style={{ color: item.color }}>{item.label}</span></div><h3 className="mt-8 text-2xl font-black text-[#1A1F36]">{item.title}</h3><p className="mt-3 max-w-lg text-sm leading-relaxed text-gray-600">{item.text}</p><ul className="mt-6 grid gap-2 sm:grid-cols-2">{["Connected data", "Actionable insight", "Simple workflows", "Ready to scale"].map((feature) => <li key={feature} className="flex items-center gap-2 text-xs font-semibold text-gray-600"><Check size={14} style={{ color: item.color }} />{feature}</li>)}</ul><Link href="/contact" className="mt-7 inline-flex items-center gap-2 text-sm font-bold" style={{ color: item.color }}>Explore this product <ArrowRight size={15} /></Link></div></div>)}</div></div></section><section className="bg-[#F6F1E8] py-20"><div className="mx-auto flex max-w-[1440px] flex-col items-start justify-between gap-7 px-5 sm:px-8 md:flex-row md:items-center"><div><span className="text-xs font-black uppercase tracking-[0.2em]" style={{ color: orange }}>Need a tailored solution?</span><h2 className="mt-2 text-3xl font-black text-[#1A1F36]">Let&apos;s find your best starting point.</h2><p className="mt-3 text-sm text-gray-600">Our team can map your priorities to the right platform and next step.</p></div><Link href="/contact" className="inline-flex shrink-0 items-center gap-2 rounded-lg px-5 py-3 text-sm font-bold text-white" style={{ backgroundColor: orange }}>Talk to an expert <ArrowRight size={15} /></Link></div></section></>;
}

function IndustriesPage() {
  const [selected, setSelected] = useState<string | null>(null);
  const current = industryItems.find((item) => item.title === selected);
  return <><PageHero eyebrow="Industries we serve" title={<>Solutions that understand your <span style={{ color: primary }}>world.</span></>} subtitle="We combine sector context with technology depth to solve the challenges that matter most to your operation." image="https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1200&q=85" /><section className="bg-[#FAFAF8] py-20"><div className="mx-auto max-w-[1440px] px-5 sm:px-8"><SectionHeading eyebrow="Your context matters" title="Technology is stronger when it speaks your language." text="Explore the ways CtrlA helps teams make better decisions, serve customers, and build resilient operations." /><div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{industryItems.map((item) => <button key={item.title} onClick={() => setSelected(item.title)} className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-7 text-left shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"><div className="absolute right-0 top-0 h-24 w-24 rounded-bl-full bg-indigo-50 transition-colors group-hover:bg-orange-50" /><div className="relative"><div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-[#3D4FA0] transition-colors group-hover:bg-orange-50 group-hover:text-[#E84821]"><item.icon size={23} /></div><h3 className="mt-6 text-lg font-bold text-[#1A1F36]">{item.title}</h3><p className="mt-2 text-sm leading-relaxed text-gray-500">{item.text}</p><span className="mt-6 inline-flex items-center gap-1 text-xs font-black uppercase tracking-wider" style={{ color: orange }}>View solutions <ArrowRight size={13} /></span></div></button>)}</div></div></section>{current && <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1A1F36]/60 p-5" onClick={() => setSelected(null)}><div className="w-full max-w-lg rounded-2xl bg-white p-7 shadow-2xl" onClick={(event) => event.stopPropagation()}><div className="flex items-start justify-between"><div><span className="text-xs font-black uppercase tracking-[0.2em]" style={{ color: orange }}>Industry solutions</span><h2 className="mt-2 text-2xl font-black text-[#1A1F36]">{current.title}</h2></div><button aria-label="Close industry details" className="rounded-lg p-2 text-gray-400 hover:bg-gray-100" onClick={() => setSelected(null)}><X size={19} /></button></div><p className="mt-5 text-sm leading-relaxed text-gray-600">{current.text} Our specialists can help connect planning, delivery, data, and customer experience around the priorities that drive your results.</p><Link href="/contact" onClick={() => setSelected(null)} className="mt-7 inline-flex items-center gap-2 rounded-lg px-5 py-3 text-sm font-bold text-white" style={{ backgroundColor: orange }}>Discuss your operation <ArrowRight size={15} /></Link></div></div>}</>;
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
  return <><PageHero eyebrow="Let&apos;s talk" title={<>Your next step starts with a <span style={{ color: primary }}>conversation.</span></>} subtitle="Tell us what you are working toward. We will bring the right people and a clear, practical next step." /><section className="bg-white py-20"><div className="mx-auto grid max-w-[1100px] gap-12 px-5 sm:px-8 lg:grid-cols-[.75fr_1.25fr]"><div><SectionHeading eyebrow="Get in touch" title="We are ready to listen." text="Whether you are exploring a new idea, replacing a legacy system, or need extra delivery capacity, start here." /><div className="space-y-4 text-sm text-gray-600"><a className="flex items-center gap-3 hover:text-[#D4920C]" href="mailto:Info@ctrlatechsolutions.com"><Mail size={18} style={{ color: primary }} /> Info@ctrlatechsolutions.com</a><a className="flex items-center gap-3 hover:text-[#D4920C]" href="tel:+919310775007"><Phone size={18} style={{ color: primary }} /> +91 93107 75007</a><span className="flex items-center gap-3"><MapPin size={18} style={{ color: primary }} /> India &amp; United Kingdom</span></div></div><div className="rounded-2xl border border-gray-100 bg-[#FAFAF8] p-6 sm:p-8">{sent ? <div className="flex min-h-[360px] flex-col items-center justify-center text-center"><div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600"><Check size={26} /></div><h2 className="mt-5 text-2xl font-black text-[#1A1F36]">Message received.</h2><p className="mt-2 max-w-sm text-sm leading-relaxed text-gray-500">Thanks for reaching out. A CtrlA specialist will be in touch shortly.</p><button className="mt-6 text-sm font-bold" style={{ color: orange }} onClick={() => setSent(false)}>Send another message</button></div> : <form onSubmit={submit} className="space-y-5"><div className="grid gap-5 sm:grid-cols-2"><Field label="Full name" name="name" required /><Field label="Email address" name="email" type="email" required /></div><div className="grid gap-5 sm:grid-cols-2"><Field label="Organization" name="organization" /><label className="block"><span className="mb-2 block text-xs font-black uppercase tracking-wider text-gray-500">Area of interest</span><select name="interest" required className="w-full rounded-lg border border-gray-200 bg-white px-3 py-3 text-sm text-gray-700 outline-none focus:border-[#D4920C]"><option value="">Select one</option><option value="digital-transformation">Digital transformation</option><option value="erp">ERP & business platforms</option><option value="industry-solutions">Industry solutions</option><option value="other">Something else</option></select></label></div><label className="block"><span className="mb-2 block text-xs font-black uppercase tracking-wider text-gray-500">How can we help?</span><textarea name="message" required minLength={10} rows={5} className="w-full resize-none rounded-lg border border-gray-200 bg-white px-3 py-3 text-sm text-gray-700 outline-none focus:border-[#D4920C]" placeholder="Tell us a little about your goals..." /></label>{error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}<button disabled={createInquiry.isPending} className="inline-flex w-full items-center justify-center gap-2 rounded-lg py-3.5 text-sm font-bold text-white disabled:opacity-60" style={{ backgroundColor: orange }}>{createInquiry.isPending ? "Sending..." : "Send inquiry"} <ArrowRight size={15} /></button></form>}</div></div></section></>;
}

function Field({ label, name, type = "text", required = false }: { label: string; name: string; type?: string; required?: boolean }) {
  return <label className="block"><span className="mb-2 block text-xs font-black uppercase tracking-wider text-gray-500">{label}</span><input name={name} type={type} required={required} className="w-full rounded-lg border border-gray-200 bg-white px-3 py-3 text-sm text-gray-700 outline-none focus:border-[#D4920C]" /></label>;
}

export function ImportedSite() {
  const [location] = useLocation();
  let page: ReactNode = <HomePage />;
  if (location === "/about") page = <AboutPage />;
  else if (location === "/services") page = <ServicesPage />;
  else if (location === "/products") page = <ProductsPage />;
  else if (location === "/industries") page = <IndustriesPage />;
  else if (location === "/contact") page = <ContactPage />;
  return <LegacyLayout>{page}</LegacyLayout>;
}