-- Up Migration

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TYPE user_role AS ENUM ('ADMIN', 'USER');

CREATE TYPE transport_type AS ENUM ('CAR', 'BUS', 'TRAIN', 'FLIGHT');

CREATE TYPE fuel_type AS ENUM (
  'PETROL',
  'DIESEL',
  'HYBRID',
  'ELECTRIC'
);

CREATE TABLE companies (
  id         UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  name       VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

  CONSTRAINT chk_companies_name_not_empty
    CHECK (TRIM(name) <> '')
);

CREATE TABLE users (
  id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id    UUID         NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  email         VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  first_name    VARCHAR(255) NOT NULL,
  last_name     VARCHAR(255) NOT NULL,
  role          user_role    NOT NULL DEFAULT 'USER',
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

  CONSTRAINT chk_users_email_format
    CHECK (email ~* '^[^@]+@[^@]+\.[^@]+$'),

  CONSTRAINT chk_users_first_name_not_empty
    CHECK (TRIM(first_name) <> ''),

  CONSTRAINT chk_users_last_name_not_empty
    CHECK (TRIM(last_name) <> '')
);

CREATE TABLE trips (
  id               UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID           NOT NULL REFERENCES users(id)     ON DELETE CASCADE,
  company_id       UUID           NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

  transport_type   transport_type NOT NULL,
  fuel_type        fuel_type,

  distance_km      NUMERIC(10, 2) NOT NULL,
  passenger_count  INT            NOT NULL DEFAULT 1,
  co2e_kg          NUMERIC(10, 4) NOT NULL,

  date             DATE           NOT NULL,
  created_at       TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ    NOT NULL DEFAULT NOW(),

  CONSTRAINT chk_trips_distance_positive
    CHECK (distance_km > 0),

  CONSTRAINT chk_trips_passengers_positive
    CHECK (passenger_count > 0),

  CONSTRAINT chk_trips_co2e_non_negative
    CHECK (co2e_kg >= 0),

  CONSTRAINT chk_trips_date_not_future
    CHECK (date <= CURRENT_DATE),

  CONSTRAINT chk_trips_car
    CHECK (
      transport_type <> 'CAR'
      OR fuel_type IS NOT NULL
    ),

  CONSTRAINT chk_trips_non_car_no_fuel
    CHECK (
      transport_type = 'CAR'
      OR fuel_type IS NULL
    )
);

CREATE INDEX idx_users_company_id     ON users(company_id);
CREATE INDEX idx_trips_company_id     ON trips(company_id);
CREATE INDEX idx_trips_user_id        ON trips(user_id);
CREATE INDEX idx_trips_date           ON trips(date);
CREATE INDEX idx_trips_date_company   ON trips(company_id, date);
CREATE INDEX idx_trips_transport_type ON trips(transport_type);

-- Down Migration

DROP TABLE IF EXISTS trips;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS companies;

DROP TYPE IF EXISTS fuel_type;
DROP TYPE IF EXISTS transport_type;
DROP TYPE IF EXISTS user_role;
