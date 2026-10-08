/**
 * Engineering services. Titles and descriptions come from the previous site;
 * the bullet points restate the same sentence as scannable chips.
 */
export type ServiceIcon = "design" | "avionics" | "payload" | "testing" | "autonomy" | "support";

export type Service = {
  slug: string;
  title: string;
  text: string;
  bullets: string[];
  icon: ServiceIcon;
};

export const services: Service[] = [
  {
    slug: "uas-design-engineering",
    title: "UAS Design & Engineering",
    text: "Airframes, propulsion, power systems, and control architecture engineered around real mission requirements.",
    bullets: ["Airframes", "Propulsion", "Power systems", "Control architecture"],
    icon: "design",
  },
  {
    slug: "avionics-integration",
    title: "Avionics Integration",
    text: "Flight computers, navigation, datalinks, telemetry, and redundant subsystems integrated as one dependable platform.",
    bullets: ["Flight computers", "Navigation", "Datalinks & telemetry", "Redundant subsystems"],
    icon: "avionics",
  },
  {
    slug: "payload-integration",
    title: "Payload Integration",
    text: "EO/IR, mapping, LiDAR, multispectral, and application-specific payloads configured for useful aerial intelligence.",
    bullets: ["EO/IR", "Mapping & LiDAR", "Multispectral", "Application-specific payloads"],
    icon: "payload",
  },
  {
    slug: "flight-testing-validation",
    title: "Flight Testing & Validation",
    text: "Structured ground and flight-test programs that verify endurance, range, control, safety, and mission performance.",
    bullets: ["Endurance & range", "Control & safety", "Mission performance", "Ground & flight test"],
    icon: "testing",
  },
  {
    slug: "autonomy-mission-software",
    title: "Autonomy & Mission Software",
    text: "Mission planning, waypoint navigation, fleet visibility, and intelligent automation for repeatable operations.",
    bullets: ["Mission planning", "Waypoint navigation", "Fleet visibility", "Intelligent automation"],
    icon: "autonomy",
  },
  {
    slug: "training-lifecycle-support",
    title: "Training & Lifecycle Support",
    text: "Operator training, maintenance planning, spares, upgrades, and technical support throughout the aircraft lifecycle.",
    bullets: ["Operator training", "Maintenance planning", "Spares & upgrades", "Technical support"],
    icon: "support",
  },
];

export const servicesIntro = {
  eyebrow: "Engineering capabilities",
  title: "From requirement to flight-ready system.",
  text: "We bring airframe design, avionics, payloads, autonomy, testing, manufacturing, and operator support together under one program.",
};

export const servicesPage = {
  hero: {
    eyebrow: "Engineering capabilities",
    title: "Complete UAS development, integration, and support.",
    text: "From an operational requirement to a validated aircraft and trained crew, ASP Aero Tech supports the complete unmanned-system lifecycle.",
  },
  capabilities: {
    eyebrow: "Capabilities",
    title: "Every discipline required to put a dependable aircraft in the field.",
    text: "Engage us for a focused integration need or a complete development and manufacturing program.",
  },
  process: {
    eyebrow: "Development process",
    title: "Requirement. Prototype. Validate. Deploy.",
    text: "A gated engineering process keeps mission goals, airworthiness, manufacturability, and operator needs aligned from the first system definition through field deployment.",
    steps: ["Define mission and system requirements", "Engineer and integrate the aircraft", "Validate, train, and support deployment"],
  },
  operations: {
    eyebrow: "Built around operations",
    title: "Engineering that starts with the mission profile.",
    text: "Every deployment environment is different. We balance endurance, payload, communications, portability, autonomy, maintenance, and total lifecycle cost.",
    checklist: [
      "Mission-configurable airframe and payload architecture",
      "Ground and flight validation against defined requirements",
      "Operator training, maintenance, spares, and upgrades",
    ],
  },
};
