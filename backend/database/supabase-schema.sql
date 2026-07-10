-- ============================================================
-- AgroSmartHub 3.0 — Supabase PostgreSQL Database Schema
-- ============================================================
-- Run this in your Supabase SQL Editor

-- ─── USERS (Linked to Supabase Auth) ─────────────────────────
CREATE TABLE public.users (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  farmer_id     VARCHAR(20) UNIQUE,
  name          VARCHAR(100) NOT NULL,
  email         VARCHAR(150) UNIQUE NOT NULL,
  mobile        VARCHAR(15) UNIQUE,
  role          VARCHAR(20) NOT NULL CHECK (role IN ('farmer','buyer','expert','admin','delivery')),
  gender        VARCHAR(10),
  date_of_birth DATE,
  aadhaar       VARCHAR(14),
  state         VARCHAR(50),
  district      VARCHAR(50),
  address       TEXT,
  is_active     BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at    TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- ─── FARMS ───────────────────────────────────────────────────
CREATE TABLE public.farms (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id       UUID REFERENCES public.users(id) ON DELETE CASCADE,
  farm_name       VARCHAR(150) NOT NULL,
  total_land      DECIMAL(10,2),
  land_unit       VARCHAR(10) DEFAULT 'acres',
  soil_type       VARCHAR(50),
  irrigation_type VARCHAR(50),
  water_source    VARCHAR(50),
  primary_crop    VARCHAR(50),
  farming_type    VARCHAR(30) DEFAULT 'Traditional',
  latitude        DECIMAL(10,8),
  longitude       DECIMAL(11,8),
  gps_location    VARCHAR(100),
  land_cert_url   VARCHAR(500),
  farmer_photo    VARCHAR(500),
  is_organic      BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- ─── PRODUCTS ────────────────────────────────────────────────
CREATE TABLE public.products (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id       UUID REFERENCES public.users(id) ON DELETE CASCADE,
  farm_id         UUID REFERENCES public.farms(id),
  name            VARCHAR(150) NOT NULL,
  category        VARCHAR(50) NOT NULL,
  variety         VARCHAR(100),
  description     TEXT,
  price           DECIMAL(10,2) NOT NULL,
  unit            VARCHAR(20) DEFAULT 'kg',
  quantity        DECIMAL(10,2) NOT NULL,
  min_order       DECIMAL(10,2) DEFAULT 1,
  quality_grade   VARCHAR(5),
  is_certified    BOOLEAN DEFAULT FALSE,
  certificate_id  UUID,
  images          TEXT[],
  harvest_date    DATE,
  expiry_date     DATE,
  is_organic      BOOLEAN DEFAULT FALSE,
  is_available    BOOLEAN DEFAULT TRUE,
  views           INTEGER DEFAULT 0,
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at      TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- ─── AI SCANS ─────────────────────────────────────────────────
CREATE TABLE public.ai_scans (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id       UUID REFERENCES public.users(id) ON DELETE CASCADE,
  farm_id         UUID REFERENCES public.farms(id),
  image_url       VARCHAR(500),
  disease_name    VARCHAR(100),
  confidence      DECIMAL(5,2),
  health_score    DECIMAL(5,2),
  severity        VARCHAR(20),
  affected_area   VARCHAR(20),
  medicine        TEXT,
  fertilizer      TEXT,
  water_req       TEXT,
  yield_loss      VARCHAR(20),
  recovery_time   VARCHAR(100),
  future_risk     TEXT,
  model_version   VARCHAR(20) DEFAULT 'YOLOv8',
  raw_output      JSONB,
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- ─── CERTIFICATES ─────────────────────────────────────────────
CREATE TABLE public.certificates (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cert_id         VARCHAR(30) UNIQUE NOT NULL,
  farmer_id       UUID REFERENCES public.users(id),
  product_id      UUID REFERENCES public.products(id),
  scan_id         UUID REFERENCES public.ai_scans(id),
  crop_name       VARCHAR(100),
  crop_variety    VARCHAR(100),
  harvest_date    DATE,
  quality_grade   VARCHAR(5),
  health_score    DECIMAL(5,2),
  disease_status  VARCHAR(100),
  ai_confidence   DECIMAL(5,2),
  temperature_range VARCHAR(50),
  expert_id       UUID REFERENCES public.users(id),
  expert_notes    TEXT,
  blockchain_id   VARCHAR(128) UNIQUE,
  qr_code_url     VARCHAR(500),
  pdf_url         VARCHAR(500),
  status          VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending','certified','rejected')),
  issued_at       TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  expires_at      TIMESTAMP,
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- ─── ORDERS ───────────────────────────────────────────────────
CREATE TABLE public.orders (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id        VARCHAR(30) UNIQUE NOT NULL,
  buyer_id        UUID REFERENCES public.users(id),
  farmer_id       UUID REFERENCES public.users(id),
  product_id      UUID REFERENCES public.products(id),
  quantity        DECIMAL(10,2),
  unit_price      DECIMAL(10,2),
  total_amount    DECIMAL(12,2),
  gst_amount      DECIMAL(10,2),
  delivery_charge DECIMAL(8,2) DEFAULT 0,
  delivery_address TEXT,
  delivery_type   VARCHAR(20) DEFAULT 'standard',
  payment_method  VARCHAR(20),
  payment_status  VARCHAR(20) DEFAULT 'pending',
  payment_id      VARCHAR(100),
  order_status    VARCHAR(30) DEFAULT 'placed',
  estimated_delivery TIMESTAMP,
  notes           TEXT,
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at      TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Disable Row Level Security temporarily so your Express backend can read/write without complex policies
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.farms DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_scans DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders DISABLE ROW LEVEL SECURITY;
