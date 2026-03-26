import pool from '../config/db';

export interface ResourceFolderRow {
  folder_id: number;
  folder_name: string;
  parent_folder_id: number | null;
  domain_id: number | null;
  created_by: string;
}

export interface ResourceRow {
  resource_id: number;
  resource_name: string;
  resource_type: string;
  file_url: string;
  folder_id: number;
  uploaded_by: string;
}

export const findAllFolders = async (): Promise<ResourceFolderRow[]> => {
  const result = await pool.query<ResourceFolderRow>(
    `
      SELECT folder_id, folder_name, parent_folder_id, domain_id, created_by
      FROM resource_folders
      ORDER BY LOWER(folder_name) ASC
    `,
  );
  return result.rows;
};

export const findAllResources = async (): Promise<ResourceRow[]> => {
  const result = await pool.query<ResourceRow>(
    `
      SELECT resource_id, resource_name, resource_type, file_url, folder_id, uploaded_by
      FROM resources
      ORDER BY LOWER(resource_name) ASC
    `,
  );
  return result.rows;
};

export const findFolderById = async (folderId: number): Promise<ResourceFolderRow | null> => {
  const result = await pool.query<ResourceFolderRow>(
    `
      SELECT folder_id, folder_name, parent_folder_id, domain_id, created_by
      FROM resource_folders
      WHERE folder_id = $1
      LIMIT 1
    `,
    [folderId],
  );
  return result.rows[0] ?? null;
};

export const createFolder = async (
  folderName: string,
  parentFolderId: number | null,
  domainId: number | null,
  createdBy: string,
): Promise<ResourceFolderRow> => {
  const result = await pool.query<ResourceFolderRow>(
    `
      INSERT INTO resource_folders (folder_name, parent_folder_id, domain_id, created_by)
      VALUES ($1, $2, $3, $4)
      RETURNING folder_id, folder_name, parent_folder_id, domain_id, created_by
    `,
    [folderName, parentFolderId, domainId, createdBy],
  );
  return result.rows[0];
};

export const renameFolder = async (
  folderId: number,
  folderName: string,
): Promise<ResourceFolderRow | null> => {
  const result = await pool.query<ResourceFolderRow>(
    `
      UPDATE resource_folders
      SET folder_name = $2, updated_at = CURRENT_TIMESTAMP
      WHERE folder_id = $1
      RETURNING folder_id, folder_name, parent_folder_id, domain_id, created_by
    `,
    [folderId, folderName],
  );
  return result.rows[0] ?? null;
};

export const countChildFolders = async (folderId: number): Promise<number> => {
  const result = await pool.query<{ count: string }>(
    `
      SELECT COUNT(*)::text AS count
      FROM resource_folders
      WHERE parent_folder_id = $1
    `,
    [folderId],
  );
  return Number(result.rows[0]?.count ?? 0);
};

export const countResourcesInFolder = async (folderId: number): Promise<number> => {
  const result = await pool.query<{ count: string }>(
    `
      SELECT COUNT(*)::text AS count
      FROM resources
      WHERE folder_id = $1
    `,
    [folderId],
  );
  return Number(result.rows[0]?.count ?? 0);
};

export const deleteFolder = async (folderId: number): Promise<boolean> => {
  const result = await pool.query(
    `
      DELETE FROM resource_folders
      WHERE folder_id = $1
    `,
    [folderId],
  );
  return (result.rowCount ?? 0) > 0;
};

export const findResourceById = async (resourceId: number): Promise<ResourceRow | null> => {
  const result = await pool.query<ResourceRow>(
    `
      SELECT resource_id, resource_name, resource_type, file_url, folder_id, uploaded_by
      FROM resources
      WHERE resource_id = $1
      LIMIT 1
    `,
    [resourceId],
  );
  return result.rows[0] ?? null;
};

export const createResource = async (
  resourceName: string,
  fileUrl: string,
  folderId: number,
  uploadedBy: string,
): Promise<ResourceRow> => {
  const result = await pool.query<ResourceRow>(
    `
      INSERT INTO resources (resource_name, resource_type, file_url, folder_id, uploaded_by)
      VALUES ($1, 'external_link', $2, $3, $4)
      RETURNING resource_id, resource_name, resource_type, file_url, folder_id, uploaded_by
    `,
    [resourceName, fileUrl, folderId, uploadedBy],
  );
  return result.rows[0];
};

export const renameResource = async (
  resourceId: number,
  resourceName: string,
): Promise<ResourceRow | null> => {
  const result = await pool.query<ResourceRow>(
    `
      UPDATE resources
      SET resource_name = $2, updated_at = CURRENT_TIMESTAMP
      WHERE resource_id = $1
      RETURNING resource_id, resource_name, resource_type, file_url, folder_id, uploaded_by
    `,
    [resourceId, resourceName],
  );
  return result.rows[0] ?? null;
};

export const updateResourceUrl = async (
  resourceId: number,
  fileUrl: string,
): Promise<ResourceRow | null> => {
  const result = await pool.query<ResourceRow>(
    `
      UPDATE resources
      SET file_url = $2, updated_at = CURRENT_TIMESTAMP
      WHERE resource_id = $1
      RETURNING resource_id, resource_name, resource_type, file_url, folder_id, uploaded_by
    `,
    [resourceId, fileUrl],
  );
  return result.rows[0] ?? null;
};

export const deleteResource = async (resourceId: number): Promise<boolean> => {
  const result = await pool.query(
    `
      DELETE FROM resources
      WHERE resource_id = $1
    `,
    [resourceId],
  );
  return (result.rowCount ?? 0) > 0;
};
