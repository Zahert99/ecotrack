-- Up Migration

CREATE TABLE emission_factors (
  id               UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  transport_type   transport_type NOT NULL,
  fuel_type        fuel_type,
  factor_kg_per_km NUMERIC(10, 4) NOT NULL,
  created_at       TIMESTAMPTZ    NOT NULL DEFAULT NOW(),

  CONSTRAINT chk_emission_factors_positive
    CHECK (factor_kg_per_km > 0)
);

-- Plain UNIQUE(transport_type, fuel_type) would let NULL fuel_type rows (BUS/TRAIN/FLIGHT)
-- duplicate freely, since Postgres never treats two NULLs as equal. Two partial indexes
-- cover both cases instead.
CREATE UNIQUE INDEX idx_emission_factors_with_fuel_unique
  ON emission_factors (transport_type, fuel_type) WHERE fuel_type IS NOT NULL;

CREATE UNIQUE INDEX idx_emission_factors_no_fuel_unique
  ON emission_factors (transport_type) WHERE fuel_type IS NULL;

-- Placeholder seed values (kg CO2e per vehicle-km); refine with sourced figures later.
INSERT INTO emission_factors (transport_type, fuel_type, factor_kg_per_km) VALUES
  ('CAR', 'PETROL', 0.1920),
  ('CAR', 'DIESEL', 0.1710),
  ('CAR', 'HYBRID', 0.1110),
  ('CAR', 'ELECTRIC', 0.0530),
  ('BUS', NULL, 0.1050),
  ('TRAIN', NULL, 0.0410),
  ('FLIGHT', NULL, 0.2550);

-- Down Migration

DROP TABLE IF EXISTS emission_factors;
