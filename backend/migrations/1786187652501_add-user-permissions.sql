-- Up Migration

ALTER TABLE users
  ADD COLUMN can_view_company_data BOOLEAN NOT NULL DEFAULT false;

CREATE TYPE permission_request_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

CREATE TABLE permission_requests (
  id         UUID                      PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID                      NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  user_id    UUID                      NOT NULL REFERENCES users(id)     ON DELETE CASCADE,
  status     permission_request_status NOT NULL DEFAULT 'PENDING',
  created_at TIMESTAMPTZ               NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ               NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_permission_requests_company_status ON permission_requests(company_id, status);

-- At most one PENDING request per user at a time. This is the actual race-safe
-- guarantee (not just an app-level pre-check) against duplicate submissions.
CREATE UNIQUE INDEX idx_permission_requests_one_pending_per_user
  ON permission_requests(user_id) WHERE status = 'PENDING';

-- Down Migration

DROP TABLE IF EXISTS permission_requests;
DROP TYPE IF EXISTS permission_request_status;

ALTER TABLE users
  DROP COLUMN IF EXISTS can_view_company_data;
