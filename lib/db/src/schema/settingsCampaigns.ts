import { boolean, integer, jsonb, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const siteSettingsTable = pgTable("site_settings", {
  id: serial("id").primaryKey(),
  siteName: text("site_name").notNull().default("ASP Aero Tech"),
  tagline: text("tagline"), description: text("description"), logoUrl: text("logo_url"), faviconUrl: text("favicon_url"),
  contactEmail: text("contact_email"), contactPhone: text("contact_phone"), contactPhone2: text("contact_phone2"), address: text("address"),
  whatsappNumber: text("whatsapp_number"), whatsappGreeting: text("whatsapp_greeting"),
  linkedinUrl: text("linkedin_url"), twitterUrl: text("twitter_url"), facebookUrl: text("facebook_url"), instagramUrl: text("instagram_url"), youtubeUrl: text("youtube_url"),
  primaryColor: text("primary_color"), secondaryColor: text("secondary_color"), accentColor: text("accent_color"), theme: text("theme"), backgroundColor: text("background_color"), fontFamily: text("font_family"),
  chatbotEnabled: boolean("chatbot_enabled").notNull().default(false), chatbotName: text("chatbot_name"), chatbotGreeting: text("chatbot_greeting"),
  bannerHeight: integer("banner_height"), bannerSpeed: integer("banner_speed"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const campaignsTable = pgTable("campaigns", {
  id: serial("id").primaryKey(), name: text("name").notNull(), type: text("type").notNull(), subject: text("subject").default(""),
  body: text("body").notNull().default(""), status: text("status").notNull().default("draft"),
  audienceFilter: jsonb("audience_filter").notNull().default({}), stats: jsonb("stats").notNull().default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(), sentAt: timestamp("sent_at", { withTimezone: true }),
});
export const campaignRecipientsTable = pgTable("campaign_recipients", {
  id: serial("id").primaryKey(), campaignId: integer("campaign_id").notNull().references(() => campaignsTable.id, { onDelete: "cascade" }),
  name: text("name").default(""), email: text("email").default(""), phone: text("phone").default(""), status: text("status").notNull().default("pending"),
  sentAt: timestamp("sent_at", { withTimezone: true }), errorMsg: text("error_msg"), link: text("link"),
});