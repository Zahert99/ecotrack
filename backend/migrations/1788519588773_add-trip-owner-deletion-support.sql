-- Up Migration

-- Allows a user to be deleted without losing their trip history: user_id
-- becomes nullable and switches from ON DELETE CASCADE to ON DELETE SET
-- NULL, while deleted_user_id/deleted_user_name preserve a permanent
-- snapshot of who originally logged the trip (deleted_user_id is a plain
-- column, not a FK, since the referenced users row won't exist anymore).
ALTER TABLE trips ADD COLUMN deleted_user_id UUID;
ALTER TABLE trips ADD COLUMN deleted_user_name TEXT;

ALTER TABLE trips ALTER COLUMN user_id DROP NOT NULL;

ALTER TABLE trips DROP CONSTRAINT trips_user_id_fkey;
ALTER TABLE trips ADD CONSTRAINT trips_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;

-- Down Migration

ALTER TABLE trips DROP CONSTRAINT trips_user_id_fkey;
ALTER TABLE trips ADD CONSTRAINT trips_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE trips ALTER COLUMN user_id SET NOT NULL;

ALTER TABLE trips DROP COLUMN IF EXISTS deleted_user_name;
ALTER TABLE trips DROP COLUMN IF EXISTS deleted_user_id;
