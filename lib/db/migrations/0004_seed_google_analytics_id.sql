-- Seed the Google Analytics (GA4) Measurement ID. It stays editable in the admin
-- console under Settings -> Analytics. Run once with psql "$DATABASE_URL" -f this file.
-- Only fills the value when none is set, so it never overwrites an admin's choice.
INSERT INTO site_settings (analytics_id)
SELECT 'G-JXQ94YWZ40' WHERE NOT EXISTS (SELECT 1 FROM site_settings);

UPDATE site_settings
SET analytics_id = 'G-JXQ94YWZ40', updated_at = now()
WHERE analytics_id IS NULL OR analytics_id = '';
