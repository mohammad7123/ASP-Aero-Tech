-- Safe additive migration for ASP Aero Tech. Run with psql "$DATABASE_URL" -f this file.
ALTER TABLE contact_inquiries ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE contact_inquiries ADD COLUMN IF NOT EXISTS organization TEXT;
ALTER TABLE contact_inquiries ADD COLUMN IF NOT EXISTS interest TEXT;
ALTER TABLE contact_inquiries ADD COLUMN IF NOT EXISTS marketing_consent BOOLEAN NOT NULL DEFAULT false;

CREATE TABLE IF NOT EXISTS site_settings (
  id SERIAL PRIMARY KEY,
  site_name TEXT NOT NULL DEFAULT 'ASP Aero Tech', tagline TEXT, description TEXT,
  logo_url TEXT, favicon_url TEXT, contact_email TEXT, contact_phone TEXT, contact_phone2 TEXT,
  address TEXT, whatsapp_number TEXT, whatsapp_greeting TEXT,
  linkedin_url TEXT, twitter_url TEXT, facebook_url TEXT, instagram_url TEXT, youtube_url TEXT,
  primary_color TEXT, secondary_color TEXT, accent_color TEXT, theme TEXT, background_color TEXT, font_family TEXT,
  chatbot_enabled BOOLEAN NOT NULL DEFAULT false, chatbot_name TEXT, chatbot_greeting TEXT,
  banner_height INTEGER, banner_speed INTEGER, updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS description TEXT, ADD COLUMN IF NOT EXISTS secondary_color TEXT, ADD COLUMN IF NOT EXISTS theme TEXT;

CREATE TABLE IF NOT EXISTS campaigns (
  id SERIAL PRIMARY KEY, name TEXT NOT NULL, type TEXT NOT NULL, subject TEXT DEFAULT '', body TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'draft', audience_filter JSONB NOT NULL DEFAULT '{}'::jsonb, stats JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now(), sent_at TIMESTAMPTZ
);
CREATE TABLE IF NOT EXISTS campaign_recipients (
  id SERIAL PRIMARY KEY, campaign_id INTEGER NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  name TEXT DEFAULT '', email TEXT DEFAULT '', phone TEXT DEFAULT '', status TEXT NOT NULL DEFAULT 'pending',
  sent_at TIMESTAMPTZ, error_msg TEXT, link TEXT
);