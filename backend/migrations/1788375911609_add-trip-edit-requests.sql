-- Up Migration

CREATE TYPE trip_edit_request_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

CREATE TABLE trip_edit_requests (
  id                       UUID                      PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id                  UUID                      NOT NULL REFERENCES trips(id)     ON DELETE CASCADE,
  company_id               UUID                      NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  requested_by             UUID                      NOT NULL REFERENCES users(id)     ON DELETE CASCADE,
  status                   trip_edit_request_status  NOT NULL DEFAULT 'PENDING',
  proposed_transport_type  transport_type            NOT NULL,
  proposed_fuel_type       fuel_type,
  proposed_distance_km     NUMERIC(10, 2)            NOT NULL,
  proposed_passenger_count INT                       NOT NULL DEFAULT 1,
  proposed_date            DATE                      NOT NULL,
  created_at               TIMESTAMPTZ               NOT NULL DEFAULT NOW(),
  updated_at               TIMESTAMPTZ               NOT NULL DEFAULT NOW(),

  CONSTRAINT chk_ter_distance_positive   CHECK (proposed_distance_km > 0),
  CONSTRAINT chk_ter_passengers_positive CHECK (proposed_passenger_count > 0),
  CONSTRAINT chk_ter_date_not_future     CHECK (proposed_date <= CURRENT_DATE),
  CONSTRAINT chk_ter_car                 CHECK (proposed_transport_type <> 'CAR' OR proposed_fuel_type IS NOT NULL),
  CONSTRAINT chk_ter_non_car_no_fuel     CHECK (proposed_transport_type = 'CAR' OR proposed_fuel_type IS NULL)
);

CREATE INDEX idx_trip_edit_requests_company_status ON trip_edit_requests(company_id, status);

-- At most one PENDING proposal per trip at a time.
CREATE UNIQUE INDEX idx_trip_edit_requests_one_pending_per_trip
  ON trip_edit_requests(trip_id) WHERE status = 'PENDING';

-- Down Migration

DROP TABLE IF EXISTS trip_edit_requests;
DROP TYPE IF EXISTS trip_edit_request_status;
