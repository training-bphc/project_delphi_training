-- Resources schema

CREATE TABLE IF NOT EXISTS resource_folders (
  folder_id         SERIAL PRIMARY KEY,
  folder_name       VARCHAR(255) NOT NULL,
  parent_folder_id  INTEGER,
  domain_id         INTEGER,
  created_by        VARCHAR(255) NOT NULL,
  created_at        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT resource_folders_parent_fk
    FOREIGN KEY (parent_folder_id)
    REFERENCES resource_folders(folder_id)
    ON DELETE RESTRICT,
  CONSTRAINT resource_folders_created_by_fk
    FOREIGN KEY (created_by)
    REFERENCES admins(email)
    ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_resource_folders_parent
  ON resource_folders(parent_folder_id);

CREATE UNIQUE INDEX IF NOT EXISTS uq_resource_folders_sibling_name
  ON resource_folders (COALESCE(parent_folder_id, 0), LOWER(folder_name));

CREATE TABLE IF NOT EXISTS resources (
  resource_id     SERIAL PRIMARY KEY,
  resource_name   VARCHAR(255) NOT NULL,
  resource_type   VARCHAR(50) NOT NULL DEFAULT 'external_link',
  file_url        TEXT NOT NULL,
  folder_id       INTEGER NOT NULL,
  uploaded_by     VARCHAR(255) NOT NULL,
  created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT resources_folder_fk
    FOREIGN KEY (folder_id)
    REFERENCES resource_folders(folder_id)
    ON DELETE RESTRICT,
  CONSTRAINT resources_uploaded_by_fk
    FOREIGN KEY (uploaded_by)
    REFERENCES admins(email)
    ON DELETE RESTRICT,
  CONSTRAINT resources_file_url_https_chk
    CHECK (file_url ~* '^https://')
);

CREATE INDEX IF NOT EXISTS idx_resources_folder
  ON resources(folder_id);

CREATE UNIQUE INDEX IF NOT EXISTS uq_resources_sibling_name
  ON resources (folder_id, LOWER(resource_name));
