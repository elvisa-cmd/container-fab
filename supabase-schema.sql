-- ============================================================
-- Container Fabricators Kenya — Supabase Schema
-- Run this entire file in the Supabase SQL Editor once.
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── HERO CONTENT ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS hero_content (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  headline_line1  TEXT NOT NULL DEFAULT 'Built from',
  headline_line2  TEXT NOT NULL DEFAULT 'Designed for you.',
  headline_accent TEXT NOT NULL DEFAULT 'steel.',
  subtext         TEXT NOT NULL DEFAULT 'We transform shipping containers into bespoke offices, homes, storage units, and commercial spaces.',
  stat_years      TEXT NOT NULL DEFAULT '10+',
  stat_projects   TEXT NOT NULL DEFAULT '200+',
  stat_warranty   TEXT NOT NULL DEFAULT '1yr',
  image_url       TEXT NOT NULL DEFAULT '',
  slides          JSONB NOT NULL DEFAULT '[]',
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
INSERT INTO hero_content DEFAULT VALUES ON CONFLICT DO NOTHING;

-- ── ABOUT CONTENT ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS about_content (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  heading       TEXT NOT NULL DEFAULT 'BUILT ON STEEL. DRIVEN BY PURPOSE.',
  paragraph1    TEXT NOT NULL DEFAULT '',
  paragraph2    TEXT NOT NULL DEFAULT '',
  badge_number  TEXT NOT NULL DEFAULT '10+',
  badge_label   TEXT NOT NULL DEFAULT 'Years of Excellence',
  image_url     TEXT NOT NULL DEFAULT '',
  pillar1_title TEXT NOT NULL DEFAULT 'Quality First',
  pillar1_text  TEXT NOT NULL DEFAULT '',
  pillar2_title TEXT NOT NULL DEFAULT 'On-Time Delivery',
  pillar2_text  TEXT NOT NULL DEFAULT '',
  pillar3_title TEXT NOT NULL DEFAULT 'Custom Solutions',
  pillar3_text  TEXT NOT NULL DEFAULT '',
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
INSERT INTO about_content DEFAULT VALUES ON CONFLICT DO NOTHING;

-- ── REEFER CONTENT ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reefer_content (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  heading     TEXT NOT NULL DEFAULT 'REEFER CONTAINERS',
  subheading  TEXT NOT NULL DEFAULT 'Cold Chain Solutions',
  description TEXT NOT NULL DEFAULT '',
  feature1    TEXT NOT NULL DEFAULT '',
  feature2    TEXT NOT NULL DEFAULT '',
  feature3    TEXT NOT NULL DEFAULT '',
  feature4    TEXT NOT NULL DEFAULT '',
  image_url   TEXT NOT NULL DEFAULT '',
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
INSERT INTO reefer_content DEFAULT VALUES ON CONFLICT DO NOTHING;

-- ── SERVICES ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS services (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  number           TEXT NOT NULL DEFAULT '01',
  icon             TEXT NOT NULL DEFAULT '📦',
  title            TEXT NOT NULL,
  slug             TEXT NOT NULL UNIQUE,
  description      TEXT NOT NULL DEFAULT '',
  full_description TEXT NOT NULL DEFAULT '',
  features         JSONB NOT NULL DEFAULT '[]',
  process          TEXT NOT NULL DEFAULT '',
  starting_price   TEXT NOT NULL DEFAULT '',
  delivery_time    TEXT NOT NULL DEFAULT '',
  cover_image      TEXT NOT NULL DEFAULT '',
  gallery          JSONB NOT NULL DEFAULT '[]',
  active           BOOLEAN NOT NULL DEFAULT TRUE,
  order_index      INT NOT NULL DEFAULT 0,
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── PROJECTS ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS projects (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title       TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  category    TEXT NOT NULL DEFAULT 'General',
  cover_image TEXT NOT NULL DEFAULT '',
  gallery     JSONB NOT NULL DEFAULT '[]',
  description TEXT NOT NULL DEFAULT '',
  location    TEXT NOT NULL DEFAULT 'Nairobi, Kenya',
  year        TEXT NOT NULL DEFAULT '',
  client      TEXT NOT NULL DEFAULT '',
  status      TEXT NOT NULL DEFAULT 'Completed',
  featured    BOOLEAN NOT NULL DEFAULT FALSE,
  order_index INT NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── CUSTOMERS ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS customers (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  logo        TEXT NOT NULL DEFAULT '',
  featured    BOOLEAN NOT NULL DEFAULT TRUE,
  order_index INT NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── MESSAGES ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS messages (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name       TEXT NOT NULL,
  email      TEXT NOT NULL,
  phone      TEXT NOT NULL DEFAULT '',
  service    TEXT NOT NULL DEFAULT '',
  message    TEXT NOT NULL,
  read       BOOLEAN NOT NULL DEFAULT FALSE,
  replied    BOOLEAN NOT NULL DEFAULT FALSE,
  reply_text TEXT NOT NULL DEFAULT '',
  replied_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── PAGE VIEWS ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS page_views (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  page       TEXT NOT NULL DEFAULT '/',
  referrer   TEXT NOT NULL DEFAULT '',
  user_agent TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── LOCATION ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS location_data (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lat            FLOAT NOT NULL DEFAULT -1.3031934,
  lng            FLOAT NOT NULL DEFAULT 36.7731693,
  address        TEXT NOT NULL DEFAULT 'National Park East Gate Rd, Nairobi',
  city           TEXT NOT NULL DEFAULT 'Nairobi',
  country        TEXT NOT NULL DEFAULT 'Kenya',
  phone1         TEXT NOT NULL DEFAULT '+254 715 296324',
  phone2         TEXT NOT NULL DEFAULT '+254 713 971 394',
  email          TEXT NOT NULL DEFAULT 'info@containerfabricators.co.ke',
  hours_weekday  TEXT NOT NULL DEFAULT 'Mon – Fri: 8:00 AM – 5:00 PM',
  hours_saturday TEXT NOT NULL DEFAULT 'Saturday: 8:00 AM – 1:00 PM',
  hours_sunday   TEXT NOT NULL DEFAULT 'Sunday: Closed',
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
INSERT INTO location_data DEFAULT VALUES ON CONFLICT DO NOTHING;

-- ════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY
-- ════════════════════════════════════════════════════════════

ALTER TABLE hero_content   ENABLE ROW LEVEL SECURITY;
ALTER TABLE about_content  ENABLE ROW LEVEL SECURITY;
ALTER TABLE reefer_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE services       ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects       ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers      ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages       ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_views     ENABLE ROW LEVEL SECURITY;
ALTER TABLE location_data  ENABLE ROW LEVEL SECURITY;

-- Public read
CREATE POLICY "Public read hero"      ON hero_content   FOR SELECT USING (true);
CREATE POLICY "Public read about"     ON about_content  FOR SELECT USING (true);
CREATE POLICY "Public read reefer"    ON reefer_content FOR SELECT USING (true);
CREATE POLICY "Public read services"  ON services       FOR SELECT USING (true);
CREATE POLICY "Public read projects"  ON projects       FOR SELECT USING (true);
CREATE POLICY "Public read customers" ON customers      FOR SELECT USING (true);
CREATE POLICY "Public read location"  ON location_data  FOR SELECT USING (true);

-- Public insert (contact form + analytics)
CREATE POLICY "Public insert messages"  ON messages   FOR INSERT WITH CHECK (true);
CREATE POLICY "Public insert pageviews" ON page_views FOR INSERT WITH CHECK (true);

-- Service role full access
CREATE POLICY "Service full hero"      ON hero_content   FOR ALL USING (true);
CREATE POLICY "Service full about"     ON about_content  FOR ALL USING (true);
CREATE POLICY "Service full reefer"    ON reefer_content FOR ALL USING (true);
CREATE POLICY "Service full services"  ON services       FOR ALL USING (true);
CREATE POLICY "Service full projects"  ON projects       FOR ALL USING (true);
CREATE POLICY "Service full customers" ON customers      FOR ALL USING (true);
CREATE POLICY "Service full messages"  ON messages       FOR ALL USING (true);
CREATE POLICY "Service full pageviews" ON page_views     FOR ALL USING (true);
CREATE POLICY "Service full location"  ON location_data  FOR ALL USING (true);

-- ════════════════════════════════════════════════════════════
-- STORAGE — public bucket for all site images
-- ════════════════════════════════════════════════════════════

INSERT INTO storage.buckets (id, name, public)
VALUES ('site-images', 'site-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public read images"
  ON storage.objects FOR SELECT USING (bucket_id = 'site-images');

CREATE POLICY "Anyone upload images"
  ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'site-images');

CREATE POLICY "Anyone update images"
  ON storage.objects FOR UPDATE USING (bucket_id = 'site-images');

CREATE POLICY "Anyone delete images"
  ON storage.objects FOR DELETE USING (bucket_id = 'site-images');
