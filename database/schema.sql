-- ============================================================
-- AgroSmartHub 3.0 — PostgreSQL Database Schema
-- ============================================================

-- ─── USERS ───────────────────────────────────────────────────
CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id     VARCHAR(20) UNIQUE,
  name          VARCHAR(100) NOT NULL,
  email         VARCHAR(150) UNIQUE NOT NULL,
  mobile        VARCHAR(15) UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role          VARCHAR(20) NOT NULL CHECK (role IN ('farmer','buyer','expert','admin','delivery')),
  gender        VARCHAR(10),
  date_of_birth DATE,
  aadhaar       VARCHAR(14),
  state         VARCHAR(50),
  district      VARCHAR(50),
  address       TEXT,
  is_verified   BOOLEAN DEFAULT FALSE,
  is_active     BOOLEAN DEFAULT TRUE,
  otp           VARCHAR(6),
  otp_expires   TIMESTAMP,
  last_login    TIMESTAMP,
  created_at    TIMESTAMP DEFAULT NOW(),
  updated_at    TIMESTAMP DEFAULT NOW()
);

-- ─── FARMS ───────────────────────────────────────────────────
CREATE TABLE farms (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id       UUID REFERENCES users(id) ON DELETE CASCADE,
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
  created_at      TIMESTAMP DEFAULT NOW()
);

-- ─── PRODUCTS ────────────────────────────────────────────────
CREATE TABLE products (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id       UUID REFERENCES users(id) ON DELETE CASCADE,
  farm_id         UUID REFERENCES farms(id),
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
  created_at      TIMESTAMP DEFAULT NOW(),
  updated_at      TIMESTAMP DEFAULT NOW()
);

-- ─── AI SCANS ─────────────────────────────────────────────────
CREATE TABLE ai_scans (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id       UUID REFERENCES users(id) ON DELETE CASCADE,
  farm_id         UUID REFERENCES farms(id),
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
  created_at      TIMESTAMP DEFAULT NOW()
);

-- ─── CERTIFICATES ─────────────────────────────────────────────
CREATE TABLE certificates (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cert_id         VARCHAR(30) UNIQUE NOT NULL,
  farmer_id       UUID REFERENCES users(id),
  product_id      UUID REFERENCES products(id),
  scan_id         UUID REFERENCES ai_scans(id),
  crop_name       VARCHAR(100),
  crop_variety    VARCHAR(100),
  harvest_date    DATE,
  quality_grade   VARCHAR(5),
  health_score    DECIMAL(5,2),
  disease_status  VARCHAR(100),
  ai_confidence   DECIMAL(5,2),
  temperature_range VARCHAR(50),
  expert_id       UUID REFERENCES users(id),
  expert_notes    TEXT,
  blockchain_id   VARCHAR(128) UNIQUE,
  qr_code_url     VARCHAR(500),
  pdf_url         VARCHAR(500),
  status          VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending','certified','rejected')),
  issued_at       TIMESTAMP DEFAULT NOW(),
  expires_at      TIMESTAMP,
  created_at      TIMESTAMP DEFAULT NOW()
);

-- ─── ORDERS ───────────────────────────────────────────────────
CREATE TABLE orders (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id        VARCHAR(30) UNIQUE NOT NULL,
  buyer_id        UUID REFERENCES users(id),
  farmer_id       UUID REFERENCES users(id),
  product_id      UUID REFERENCES products(id),
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
  created_at      TIMESTAMP DEFAULT NOW(),
  updated_at      TIMESTAMP DEFAULT NOW()
);

-- ─── DELIVERIES ───────────────────────────────────────────────
CREATE TABLE deliveries (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id        UUID REFERENCES orders(id),
  delivery_partner_id UUID REFERENCES users(id),
  pickup_otp      VARCHAR(6),
  delivery_otp    VARCHAR(6),
  pickup_time     TIMESTAMP,
  delivery_time   TIMESTAMP,
  current_lat     DECIMAL(10,8),
  current_lng     DECIMAL(11,8),
  status          VARCHAR(20) DEFAULT 'assigned',
  proof_image     VARCHAR(500),
  notes           TEXT,
  created_at      TIMESTAMP DEFAULT NOW()
);

-- ─── IOT READINGS ─────────────────────────────────────────────
CREATE TABLE iot_readings (
  id              BIGSERIAL PRIMARY KEY,
  farm_id         UUID REFERENCES farms(id),
  device_id       VARCHAR(50),
  temperature     DECIMAL(5,2),
  humidity        DECIMAL(5,2),
  soil_moisture   DECIMAL(5,2),
  soil_ph         DECIMAL(4,2),
  light_intensity DECIMAL(10,2),
  rainfall        DECIMAL(6,2),
  wind_speed      DECIMAL(6,2),
  water_tank      DECIMAL(5,2),
  co2_level       DECIMAL(8,2),
  air_quality     DECIMAL(6,2),
  raw_data        JSONB,
  recorded_at     TIMESTAMP DEFAULT NOW()
);

-- ─── IoT ALERTS ───────────────────────────────────────────────
CREATE TABLE iot_alerts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id         UUID REFERENCES farms(id),
  sensor_name     VARCHAR(50),
  sensor_value    DECIMAL(10,2),
  threshold       DECIMAL(10,2),
  alert_type      VARCHAR(20),
  message         TEXT,
  is_resolved     BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMP DEFAULT NOW()
);

-- ─── PAYMENTS ─────────────────────────────────────────────────
CREATE TABLE payments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id        UUID REFERENCES orders(id),
  buyer_id        UUID REFERENCES users(id),
  farmer_id       UUID REFERENCES users(id),
  gateway         VARCHAR(20),
  gateway_order_id VARCHAR(100),
  gateway_payment_id VARCHAR(100),
  amount          DECIMAL(12,2),
  currency        VARCHAR(5) DEFAULT 'INR',
  status          VARCHAR(20) DEFAULT 'pending',
  gst_number      VARCHAR(20),
  invoice_number  VARCHAR(30),
  created_at      TIMESTAMP DEFAULT NOW()
);

-- ─── NOTIFICATIONS ────────────────────────────────────────────
CREATE TABLE notifications (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
  type            VARCHAR(30),
  title           VARCHAR(200),
  message         TEXT,
  data            JSONB,
  is_read         BOOLEAN DEFAULT FALSE,
  sent_push       BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMP DEFAULT NOW()
);

-- ─── COMMUNITY POSTS ──────────────────────────────────────────
CREATE TABLE community_posts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id       UUID REFERENCES users(id) ON DELETE CASCADE,
  content         TEXT NOT NULL,
  images          TEXT[],
  tags            TEXT[],
  likes           INTEGER DEFAULT 0,
  replies_count   INTEGER DEFAULT 0,
  is_expert_answer BOOLEAN DEFAULT FALSE,
  is_pinned       BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMP DEFAULT NOW(),
  updated_at      TIMESTAMP DEFAULT NOW()
);

-- ─── MARKET PRICES ────────────────────────────────────────────
CREATE TABLE market_prices (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crop_name       VARCHAR(100) NOT NULL,
  state           VARCHAR(50),
  market          VARCHAR(100),
  price           DECIMAL(10,2),
  unit            VARCHAR(20) DEFAULT 'quintal',
  change_pct      DECIMAL(5,2),
  recorded_date   DATE DEFAULT CURRENT_DATE,
  source          VARCHAR(100),
  created_at      TIMESTAMP DEFAULT NOW()
);

-- ─── INDEXES ──────────────────────────────────────────────────
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_mobile ON users(mobile);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_products_farmer ON products(farmer_id);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_certified ON products(is_certified);
CREATE INDEX idx_ai_scans_farmer ON ai_scans(farmer_id);
CREATE INDEX idx_certificates_farmer ON certificates(farmer_id);
CREATE INDEX idx_certificates_status ON certificates(status);
CREATE INDEX idx_orders_buyer ON orders(buyer_id);
CREATE INDEX idx_orders_farmer ON orders(farmer_id);
CREATE INDEX idx_orders_status ON orders(order_status);
CREATE INDEX idx_iot_readings_farm ON iot_readings(farm_id);
CREATE INDEX idx_iot_readings_time ON iot_readings(recorded_at DESC);
CREATE INDEX idx_notifications_user ON notifications(user_id, is_read);
CREATE INDEX idx_market_prices_crop ON market_prices(crop_name, recorded_date);

-- ─── TRIGGERS ─────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER products_updated BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER orders_updated BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_timestamp();

COMMENT ON TABLE users IS 'All users: farmers, buyers, experts, admins, delivery partners';
COMMENT ON TABLE farms IS 'Farm details linked to farmer users';
COMMENT ON TABLE ai_scans IS 'AI crop health scan results from YOLOv8 model';
COMMENT ON TABLE certificates IS 'Digital quality certificates with blockchain verification';
COMMENT ON TABLE iot_readings IS 'Time-series IoT sensor data from farm devices';
