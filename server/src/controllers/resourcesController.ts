import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import {
  createFolderRecord,
  createResourceRecord,
  deleteFolderRecord,
  deleteResourceRecord,
  getResourcesTree,
  renameFolderRecord,
  renameResourceRecord,
  updateResourceUrlRecord,
} from '../services/resourcesService';

const isUniqueViolation = (error: unknown): boolean => {
  return !!(
    error &&
    typeof error === 'object' &&
    'code' in error &&
    (error as { code?: string }).code === '23505'
  );
};

export const getResourcesTreeHandler = asyncHandler(async (_req: Request, res: Response) => {
  const tree = await getResourcesTree();
  res.status(200).json({ success: true, data: tree });
});

export const createFolderHandler = asyncHandler(async (req: Request, res: Response) => {
  const { folder_name, parent_folder_id, domain_id } = req.body as {
    folder_name?: string;
    parent_folder_id?: number | null;
    domain_id?: number | null;
  };

  if (!folder_name || typeof folder_name !== 'string') {
    res.status(400).json({ success: false, message: 'folder_name is required' });
    return;
  }

  const actorEmail = req.user?.email;
  if (!actorEmail) {
    res.status(401).json({ success: false, message: 'Authenticated user email not found' });
    return;
  }

  try {
    const folder = await createFolderRecord(
      folder_name,
      parent_folder_id ?? null,
      domain_id ?? null,
      actorEmail,
    );
    res.status(201).json({ success: true, data: folder });
  } catch (error) {
    if (error instanceof Error && error.message === 'Parent folder not found') {
      res.status(404).json({ success: false, message: error.message });
      return;
    }

    if (error instanceof Error && error.message.includes('Name')) {
      res.status(400).json({ success: false, message: error.message });
      return;
    }

    if (isUniqueViolation(error)) {
      res.status(409).json({ success: false, message: 'Folder name already exists in this location' });
      return;
    }

    throw error;
  }
});

export const renameFolderHandler = asyncHandler(async (req: Request, res: Response) => {
  const folderId = Number(req.params.folderId);
  const { folder_name } = req.body as { folder_name?: string };

  if (!Number.isInteger(folderId) || folderId <= 0) {
    res.status(400).json({ success: false, message: 'Invalid folder ID' });
    return;
  }

  if (!folder_name || typeof folder_name !== 'string') {
    res.status(400).json({ success: false, message: 'folder_name is required' });
    return;
  }

  try {
    const folder = await renameFolderRecord(folderId, folder_name);
    if (!folder) {
      res.status(404).json({ success: false, message: 'Folder not found' });
      return;
    }

    res.status(200).json({ success: true, data: folder });
  } catch (error) {
    if (error instanceof Error && error.message.includes('Name')) {
      res.status(400).json({ success: false, message: error.message });
      return;
    }

    if (isUniqueViolation(error)) {
      res.status(409).json({ success: false, message: 'Folder name already exists in this location' });
      return;
    }

    throw error;
  }
});

export const deleteFolderHandler = asyncHandler(async (req: Request, res: Response) => {
  const folderId = Number(req.params.folderId);

  if (!Number.isInteger(folderId) || folderId <= 0) {
    res.status(400).json({ success: false, message: 'Invalid folder ID' });
    return;
  }

  try {
    const deleted = await deleteFolderRecord(folderId);

    if (!deleted) {
      res.status(404).json({ success: false, message: 'Folder not found' });
      return;
    }

    res.status(200).json({ success: true, message: 'Folder deleted' });
  } catch (error) {
    if (error instanceof Error && error.message === 'Folder is not empty') {
      res.status(409).json({ success: false, message: error.message });
      return;
    }

    throw error;
  }
});

export const createResourceHandler = asyncHandler(async (req: Request, res: Response) => {
  const { resource_name, file_url, folder_id } = req.body as {
    resource_name?: string;
    file_url?: string;
    folder_id?: number;
  };

  if (!resource_name || typeof resource_name !== 'string') {
    res.status(400).json({ success: false, message: 'resource_name is required' });
    return;
  }

  if (!file_url || typeof file_url !== 'string') {
    res.status(400).json({ success: false, message: 'file_url is required' });
    return;
  }

  if (!Number.isInteger(folder_id) || Number(folder_id) <= 0) {
    res.status(400).json({ success: false, message: 'folder_id must be a positive integer' });
    return;
  }

  const actorEmail = req.user?.email;
  if (!actorEmail) {
    res.status(401).json({ success: false, message: 'Authenticated user email not found' });
    return;
  }

  try {
    const resource = await createResourceRecord(resource_name, file_url, Number(folder_id), actorEmail);
    res.status(201).json({ success: true, data: resource });
  } catch (error) {
    if (
      error instanceof Error &&
      (error.message === 'Folder not found' ||
        error.message === 'Invalid URL' ||
        error.message === 'Only HTTPS URLs are allowed' ||
        error.message.includes('Name'))
    ) {
      const status = error.message === 'Folder not found' ? 404 : 400;
      res.status(status).json({ success: false, message: error.message });
      return;
    }

    if (isUniqueViolation(error)) {
      res.status(409).json({ success: false, message: 'Resource name already exists in this folder' });
      return;
    }

    throw error;
  }
});

export const renameResourceHandler = asyncHandler(async (req: Request, res: Response) => {
  const resourceId = Number(req.params.resourceId);
  const { resource_name } = req.body as { resource_name?: string };

  if (!Number.isInteger(resourceId) || resourceId <= 0) {
    res.status(400).json({ success: false, message: 'Invalid resource ID' });
    return;
  }

  if (!resource_name || typeof resource_name !== 'string') {
    res.status(400).json({ success: false, message: 'resource_name is required' });
    return;
  }

  try {
    const resource = await renameResourceRecord(resourceId, resource_name);
    if (!resource) {
      res.status(404).json({ success: false, message: 'Resource not found' });
      return;
    }

    res.status(200).json({ success: true, data: resource });
  } catch (error) {
    if (error instanceof Error && error.message.includes('Name')) {
      res.status(400).json({ success: false, message: error.message });
      return;
    }

    if (isUniqueViolation(error)) {
      res.status(409).json({ success: false, message: 'Resource name already exists in this folder' });
      return;
    }

    throw error;
  }
});

export const updateResourceUrlHandler = asyncHandler(async (req: Request, res: Response) => {
  const resourceId = Number(req.params.resourceId);
  const { file_url } = req.body as { file_url?: string };

  if (!Number.isInteger(resourceId) || resourceId <= 0) {
    res.status(400).json({ success: false, message: 'Invalid resource ID' });
    return;
  }

  if (!file_url || typeof file_url !== 'string') {
    res.status(400).json({ success: false, message: 'file_url is required' });
    return;
  }

  try {
    const resource = await updateResourceUrlRecord(resourceId, file_url);
    if (!resource) {
      res.status(404).json({ success: false, message: 'Resource not found' });
      return;
    }

    res.status(200).json({ success: true, data: resource });
  } catch (error) {
    if (
      error instanceof Error &&
      (error.message === 'Invalid URL' || error.message === 'Only HTTPS URLs are allowed')
    ) {
      res.status(400).json({ success: false, message: error.message });
      return;
    }

    throw error;
  }
});

export const deleteResourceHandler = asyncHandler(async (req: Request, res: Response) => {
  const resourceId = Number(req.params.resourceId);

  if (!Number.isInteger(resourceId) || resourceId <= 0) {
    res.status(400).json({ success: false, message: 'Invalid resource ID' });
    return;
  }

  const deleted = await deleteResourceRecord(resourceId);
  if (!deleted) {
    res.status(404).json({ success: false, message: 'Resource not found' });
    return;
  }

  res.status(200).json({ success: true, message: 'Resource deleted' });
});
