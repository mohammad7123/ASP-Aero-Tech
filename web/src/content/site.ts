/**
 * Company-wide content and fallbacks.
 *
 * Contact details, socials and the WhatsApp number are managed in the admin
 * console (Settings → Contact Info / Social Media) and read from the API at
 * request time — see src/lib/api.ts. The values below are ONLY used when the
 * API is not configured or unreachable, so fill them in if you deploy the site
 * without the API server.
 */
export const site = {
  name: "ASP Aero Tech",
  shortName: "ASP",
  expansion: "Advance System Platform",
  tagline: "Indigenous unmanned aerial systems • Engineered and manufactured in India",
  description:
    "ASP Aero Tech designs and manufactures mission-configurable unmanned aerial systems for defence, industrial inspection, mapping, emergency response, and autonomous operations.",
  shortDescription:
    "Indian-engineered drone platforms for defence, industry, public safety, and critical infrastructure.",
  footerDescription:
    "We design and manufacture mission-ready unmanned aerial systems for defence, industry, public safety, and critical infrastructure.",
  positioning: "Drone & Aerospace | Electronics | Embedded Systems | AI | Intelligent Platforms",
  slogan: "Building Indigenous Technology. Engineering the Future.",
  locale: "en_IN",

  contact: {
    email: "", // TODO: e.g. "info@your-domain.in"
    phone: "", // TODO: e.g. "+91 98xxx xxxxx"
    phone2: "",
    address: "India",
    whatsappNumber: "", // digits with country code, e.g. "9198xxxxxxxx"
    whatsappGreeting: "Hello ASP Aero Tech, I would like to discuss a mission requirement.",
  },

  socials: {
    linkedin: "",
    twitter: "",
    facebook: "",
    instagram: "",
    youtube: "",
  },

  /**
   * Feature switches for the heavier experience layers.
   * bootLoader: the "SYSTEMS CHECK…" intro on the first visit of a session.
   */
  features: {
    bootLoader: true,
  },
} as const;

export type NavItem = { label: string; href: string };

export const mainNav: NavItem[] = [
  { label: "About", href: "/about" },
  { label: "Platforms", href: "/products" },
  { label: "Services", href: "/services" },
  { label: "Industries", href: "/industries" },
  { label: "Training", href: "/training" },
  { label: "Gallery", href: "/gallery" },
];

export const secondaryNav: NavItem[] = [
  { label: "Insights", href: "/blog" },
  { label: "Careers", href: "/careers" },
  { label: "Contact", href: "/contact" },
];

/** Options for the inquiry form — values match what the admin console already stores. */
export const inquiryInterests = [
  { value: "defence-isr", label: "Defence & ISR" },
  { value: "industrial-inspection", label: "Industrial inspection" },
  { value: "survey-mapping", label: "Surveying & mapping" },
  { value: "emergency-response", label: "Emergency response" },
  { value: "payload-integration", label: "Payload integration" },
  { value: "training-support", label: "Training & support" },
  { value: "other", label: "Other requirement" },
] as const;

/** Home hero copy (mirrors the admin "hero slide" fallback of the previous site). */
export const heroContent = {
  eyebrow: "Indigenous unmanned aerial systems",
  badge: "Mission ready",
  title: "Built to fly. Engineered for the mission.",
  subtitle:
    "ASP Aero Tech designs and manufactures mission-configurable drones for intelligence, surveillance, inspection, mapping, emergency response, and autonomous operations.",
  primaryCta: { label: "Request a briefing", href: "/contact" },
  secondaryCta: { label: "Explore platforms", href: "/products" },
  checks: ["Designed & manufactured in India", "Mission-configurable architecture", "Training and lifecycle support"],
};

/** Three-up assurance strip from the previous home page. */
export const assurances = [
  { title: "Mission configured", text: "Aircraft and payloads tailored to operational objectives." },
  { title: "Validated in flight", text: "Structured testing for safety, endurance, control, and reliability." },
  { title: "Ready to deploy", text: "Training, support, spares, and lifecycle planning included." },
];

export const ctaContent = {
  eyebrow: "Define the mission",
  title: "Let's configure the right aerial system.",
  text: "Share your range, endurance, payload, operating environment, and deployment needs. Our engineering team will map a practical path forward.",
  cta: { label: "Request a technical briefing", href: "/contact" },
};
