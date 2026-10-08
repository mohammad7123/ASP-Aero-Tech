/**
 * Mission applications. `categories` links each industry to the product
 * catalogue's mission categories so the site can recommend platforms.
 */
export type IndustryIcon = "defence" | "infrastructure" | "energy" | "agriculture" | "emergency" | "mapping";

export type Industry = {
  slug: string;
  title: string;
  text: string;
  applications: string[];
  categories: string[];
  icon: IndustryIcon;
};

export const industries: Industry[] = [
  {
    slug: "defence-homeland-security",
    title: "Defence & Homeland Security",
    text: "Persistent ISR, perimeter awareness, route reconnaissance, and rapid-response aerial capability.",
    applications: ["Persistent ISR", "Perimeter awareness", "Route reconnaissance", "Rapid-response aerial capability"],
    categories: ["Military & Defense", "Surveillance"],
    icon: "defence",
  },
  {
    slug: "critical-infrastructure",
    title: "Critical Infrastructure",
    text: "Repeatable inspection of bridges, towers, pipelines, rail corridors, and hard-to-reach assets.",
    applications: ["Bridges & towers", "Pipelines", "Rail corridors", "Hard-to-reach assets"],
    categories: ["Inspection"],
    icon: "infrastructure",
  },
  {
    slug: "energy-mining",
    title: "Energy & Mining",
    text: "Safer aerial inspection, stockpile measurement, thermal surveys, and wide-area site intelligence.",
    applications: ["Aerial inspection", "Stockpile measurement", "Thermal surveys", "Wide-area site intelligence"],
    categories: ["Inspection", "Mapping & Surveying"],
    icon: "energy",
  },
  {
    slug: "agriculture",
    title: "Agriculture",
    text: "Crop health mapping, multispectral data capture, field assessment, and precision application support.",
    applications: ["Crop health mapping", "Multispectral data capture", "Field assessment", "Precision application support"],
    categories: ["Agriculture"],
    icon: "agriculture",
  },
  {
    slug: "emergency-response",
    title: "Emergency Response",
    text: "Fast situational awareness for search, rescue, disaster assessment, and incident command.",
    applications: ["Search & rescue", "Disaster assessment", "Incident command", "Situational awareness"],
    categories: ["Search & Rescue"],
    icon: "emergency",
  },
  {
    slug: "surveying-mapping",
    title: "Surveying & Mapping",
    text: "High-resolution geospatial data for land surveys, construction progress, and digital-twin workflows.",
    applications: ["Land surveys", "Construction progress", "Digital-twin workflows", "High-resolution geospatial data"],
    categories: ["Mapping & Surveying"],
    icon: "mapping",
  },
];

export const industriesIntro = {
  eyebrow: "Mission applications",
  title: "One platform architecture. Multiple operational roles.",
  text: "ASP Aero Tech configures each UAS around the environment, payload, endurance, communications, and data needs of the mission.",
};

export const industriesPage = {
  hero: {
    eyebrow: "Mission applications",
    title: "Aerial capability for complex operating environments.",
    text: "Configure the aircraft, payload, datalink, and mission software around the intelligence or action your team needs from the air.",
  },
  sectors: {
    eyebrow: "Operational sectors",
    title: "Different missions. One disciplined engineering approach.",
    text: "Explore where ASP Aero Tech platforms can improve reach, speed, safety, data quality, and operational awareness.",
  },
  advisory:
    "Our engineers can assess the mission profile and recommend an airframe, payload, communications, and support configuration for the deployment environment.",
};
