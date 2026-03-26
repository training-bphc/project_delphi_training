import {
  countChildFolders,
  countResourcesInFolder,
  createFolder,
  createResource,
  deleteFolder,
  deleteResource,
  findAllFolders,
  findAllResources,
  findFolderById,
  findResourceById,
  renameFolder,
  renameResource,
  ResourceFolderRow,
  ResourceRow,
  updateResourceUrl,
} from '../repositories/resourcesRepository';

export interface ResourceTreeNode {
  folder_id: number;
  folder_name: string;
  parent_folder_id: number | null;
  resources: ResourceRow[];
  children: ResourceTreeNode[];
}

const validateName = (name: string): string => {
  const normalized = name.trim();
  if (!normalized) {
    throw new Error('Name is required');
  }
  if (normalized.length > 255) {
    throw new Error('Name must be at most 255 characters');
  }
  return normalized;
};

const validateHttpsUrl = (url: string): string => {
  const normalized = url.trim();
  let parsed: URL;
  try {
    parsed = new URL(normalized);
  } catch {
    throw new Error('Invalid URL');
  }

  if (parsed.protocol !== 'https:') {
    throw new Error('Only HTTPS URLs are allowed');
  }

  return normalized;
};

export const getResourcesTree = async (): Promise<ResourceTreeNode[]> => {
  const [folders, resources] = await Promise.all([
    findAllFolders(),
    findAllResources(),
  ]);

  const folderMap = new Map<number, ResourceTreeNode>();
  for (const folder of folders) {
    folderMap.set(folder.folder_id, {
      folder_id: folder.folder_id,
      folder_name: folder.folder_name,
      parent_folder_id: folder.parent_folder_id,
      resources: [],
      children: [],
    });
  }

  for (const resource of resources) {
    const folderNode = folderMap.get(resource.folder_id);
    if (folderNode) {
      folderNode.resources.push(resource);
    }
  }

  const roots: ResourceTreeNode[] = [];
  for (const folder of folders) {
    const node = folderMap.get(folder.folder_id);
    if (!node) {
      continue;
    }

    if (folder.parent_folder_id === null) {
      roots.push(node);
      continue;
    }

    const parent = folderMap.get(folder.parent_folder_id);
    if (parent) {
      parent.children.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
};

export const createFolderRecord = async (
  folderName: string,
  parentFolderId: number | null,
  domainId: number | null,
  actorEmail: string,
): Promise<ResourceFolderRow> => {
  const normalizedName = validateName(folderName);

  if (parentFolderId !== null) {
    const parent = await findFolderById(parentFolderId);
    if (!parent) {
      throw new Error('Parent folder not found');
    }
  }

  return createFolder(normalizedName, parentFolderId, domainId, actorEmail);
};

export const renameFolderRecord = async (
  folderId: number,
  folderName: string,
): Promise<ResourceFolderRow | null> => {
  const normalizedName = validateName(folderName);
  return renameFolder(folderId, normalizedName);
};

export const deleteFolderRecord = async (folderId: number): Promise<boolean> => {
  const folder = await findFolderById(folderId);
  if (!folder) {
    return false;
  }

  const [childFolderCount, resourceCount] = await Promise.all([
    countChildFolders(folderId),
    countResourcesInFolder(folderId),
  ]);

  if (childFolderCount > 0 || resourceCount > 0) {
    throw new Error('Folder is not empty');
  }

  return deleteFolder(folderId);
};

export const createResourceRecord = async (
  resourceName: string,
  fileUrl: string,
  folderId: number,
  actorEmail: string,
): Promise<ResourceRow> => {
  const normalizedName = validateName(resourceName);
  const normalizedUrl = validateHttpsUrl(fileUrl);

  const folder = await findFolderById(folderId);
  if (!folder) {
    throw new Error('Folder not found');
  }

  return createResource(normalizedName, normalizedUrl, folderId, actorEmail);
};

export const renameResourceRecord = async (
  resourceId: number,
  resourceName: string,
): Promise<ResourceRow | null> => {
  const normalizedName = validateName(resourceName);

  const resource = await findResourceById(resourceId);
  if (!resource) {
    return null;
  }

  return renameResource(resourceId, normalizedName);
};

export const updateResourceUrlRecord = async (
  resourceId: number,
  fileUrl: string,
): Promise<ResourceRow | null> => {
  const normalizedUrl = validateHttpsUrl(fileUrl);

  const resource = await findResourceById(resourceId);
  if (!resource) {
    return null;
  }

  return updateResourceUrl(resourceId, normalizedUrl);
};

export const deleteResourceRecord = async (resourceId: number): Promise<boolean> => {
  const resource = await findResourceById(resourceId);
  if (!resource) {
    return false;
  }

  return deleteResource(resourceId);
};
