-- Up Migration

ALTER TABLE emission_factors ADD COLUMN unit VARCHAR(20) NOT NULL DEFAULT 'vehicle_km';
ALTER TABLE emission_factors ADD COLUMN source VARCHAR(255);

-- Swedish sourced emission factors (Naturvårdsverket's guidance on transport
-- climate impact + Trafikverket's passenger-travel input data, Nordic
-- electricity mix for EVs). CAR is calculated per vehicle-km; BUS/TRAIN/
-- FLIGHT are calculated per passenger-km.
UPDATE emission_factors SET factor_kg_per_km = 0.1650, unit = 'vehicle_km',   source = 'Naturvårdsverket / Trafikverket' WHERE transport_type = 'CAR'    AND fuel_type = 'PETROL';
UPDATE emission_factors SET factor_kg_per_km = 0.1550, unit = 'vehicle_km',   source = 'Naturvårdsverket / Trafikverket' WHERE transport_type = 'CAR'    AND fuel_type = 'DIESEL';
UPDATE emission_factors SET factor_kg_per_km = 0.0950, unit = 'vehicle_km',   source = 'Naturvårdsverket / Trafikverket' WHERE transport_type = 'CAR'    AND fuel_type = 'HYBRID';
UPDATE emission_factors SET factor_kg_per_km = 0.0250, unit = 'vehicle_km',   source = 'Naturvårdsverket / Trafikverket' WHERE transport_type = 'CAR'    AND fuel_type = 'ELECTRIC';
UPDATE emission_factors SET factor_kg_per_km = 0.0350, unit = 'passenger_km', source = 'Naturvårdsverket / Trafikverket' WHERE transport_type = 'BUS'    AND fuel_type IS NULL;
UPDATE emission_factors SET factor_kg_per_km = 0.0070, unit = 'passenger_km', source = 'Naturvårdsverket / Trafikverket' WHERE transport_type = 'TRAIN'  AND fuel_type IS NULL;
UPDATE emission_factors SET factor_kg_per_km = 0.1360, unit = 'passenger_km', source = 'Naturvårdsverket / Trafikverket' WHERE transport_type = 'FLIGHT' AND fuel_type IS NULL;

-- Clear out old test trips (and anything referencing them, e.g. trip_edit_requests).
TRUNCATE TABLE trips CASCADE;

-- Seed a few realistic test trips against the oldest existing company/user, if any exist.
DO $$
DECLARE
  v_company_id UUID;
  v_user_id UUID;
BEGIN
  SELECT id INTO v_company_id FROM companies ORDER BY created_at LIMIT 1;
  IF v_company_id IS NOT NULL THEN
    SELECT id INTO v_user_id FROM users WHERE company_id = v_company_id ORDER BY created_at LIMIT 1;
  END IF;

  IF v_company_id IS NOT NULL AND v_user_id IS NOT NULL THEN
    INSERT INTO trips (user_id, company_id, transport_type, fuel_type, distance_km, passenger_count, co2e_kg, date) VALUES
      (v_user_id, v_company_id, 'CAR',    'PETROL', 120, 1, 19.8000,  CURRENT_DATE - 5),
      (v_user_id, v_company_id, 'TRAIN',  NULL,     300, 1, 2.1000,   CURRENT_DATE - 4),
      (v_user_id, v_company_id, 'FLIGHT', NULL,     500, 2, 136.0000, CURRENT_DATE - 3),
      (v_user_id, v_company_id, 'BUS',    NULL,     45,  3, 4.7250,   CURRENT_DATE - 2);
  END IF;
END $$;

-- Down Migration

UPDATE emission_factors SET factor_kg_per_km = 0.1920 WHERE transport_type = 'CAR'    AND fuel_type = 'PETROL';
UPDATE emission_factors SET factor_kg_per_km = 0.1710 WHERE transport_type = 'CAR'    AND fuel_type = 'DIESEL';
UPDATE emission_factors SET factor_kg_per_km = 0.1110 WHERE transport_type = 'CAR'    AND fuel_type = 'HYBRID';
UPDATE emission_factors SET factor_kg_per_km = 0.0530 WHERE transport_type = 'CAR'    AND fuel_type = 'ELECTRIC';
UPDATE emission_factors SET factor_kg_per_km = 0.1050 WHERE transport_type = 'BUS'    AND fuel_type IS NULL;
UPDATE emission_factors SET factor_kg_per_km = 0.0410 WHERE transport_type = 'TRAIN'  AND fuel_type IS NULL;
UPDATE emission_factors SET factor_kg_per_km = 0.2550 WHERE transport_type = 'FLIGHT' AND fuel_type IS NULL;

ALTER TABLE emission_factors DROP COLUMN source;
ALTER TABLE emission_factors DROP COLUMN unit;
