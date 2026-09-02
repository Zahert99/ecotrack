-- Up Migration

CREATE TYPE permission_request_type AS ENUM ('VIEW_COMPANY_DATA', 'ADMIN_ROLE');

ALTER TABLE permission_requests
  ADD COLUMN request_type permission_request_type NOT NULL DEFAULT 'VIEW_COMPANY_DATA';

DROP INDEX idx_permission_requests_one_pending_per_user;

-- At most one PENDING request per (user, type) at a time, so a pending
-- VIEW_COMPANY_DATA request no longer blocks also requesting ADMIN_ROLE.
CREATE UNIQUE INDEX idx_permission_requests_one_pending_per_user_type
  ON permission_requests(user_id, request_type) WHERE status = 'PENDING';

-- Down Migration

DROP INDEX IF EXISTS idx_permission_requests_one_pending_per_user_type;

CREATE UNIQUE INDEX idx_permission_requests_one_pending_per_user
  ON permission_requests(user_id) WHERE status = 'PENDING';

ALTER TABLE permission_requests
  DROP COLUMN IF EXISTS request_type;

DROP TYPE IF EXISTS permission_request_type;
