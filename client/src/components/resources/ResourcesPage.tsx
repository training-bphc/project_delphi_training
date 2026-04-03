import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "../../contexts/auth.tsx";
import ResourcesLayout from "./layout/ResourcesLayout";
import FolderCardGrid from "./cards/FolderCardGrid";
import ResourceCardGrid from "./cards/ResourceCardGrid";
import styles from "./resources.module.css";

interface ResourceRecord {
  resource_id: number;
  resource_name: string;
  resource_type: string;
  file_url: string;
  folder_id: number;
  uploaded_by: string;
}

interface ResourceFolderNode {
  folder_id: number;
  folder_name: string;
  parent_folder_id: number | null;
  resources: ResourceRecord[];
  children: ResourceFolderNode[];
}

interface BreadcrumbItem {
  folderId: number | null;
  folderName: string;
}

interface ResourcesPageProps {
  canManage: boolean;
  title: string;
}

function ResourcesPage({ canManage, title }: ResourcesPageProps) {
  const { token } = useAuth();
  const [tree, setTree] = useState<ResourceFolderNode[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([
    { folderId: null, folderName: "Resources" },
  ]);
  const [currentFolder, setCurrentFolder] = useState<ResourceFolderNode | null>(
    null
  );

  const getHostname = (url: string) => {
    try {
      return new URL(url).hostname;
    } catch {
      return url;
    }
  };

  const apiCall = async (path: string, options: RequestInit = {}) => {
    const response = await fetch(path, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...(options.headers || {}),
      },
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data?.message || `Request failed: ${response.status}`);
    }

    return data;
  };

  const fetchTree = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiCall("/api/resources/tree");
      const payload = Array.isArray(data.data) ? data.data : [];
      setTree(payload);
    } catch (err: any) {
      setError(err.message || "Failed to load resources");
      setTree([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      void fetchTree();
    }
  }, [token]);

  const findFolderById = (
    folders: ResourceFolderNode[],
    folderId: number
  ): ResourceFolderNode | null => {
    for (const folder of folders) {
      if (folder.folder_id === folderId) {
        return folder;
      }
      const found = findFolderById(folder.children, folderId);
      if (found) {
        return found;
      }
    }
    return null;
  };

  const handleFolderClick = (folder: ResourceFolderNode) => {
    setCurrentFolder(folder);
    setBreadcrumbs([
      ...breadcrumbs,
      { folderId: folder.folder_id, folderName: folder.folder_name },
    ]);
  };

  const handleBreadcrumbClick = (index: number) => {
    if (index === 0) {
      // Go back to root
      setCurrentFolder(null);
      setBreadcrumbs([{ folderId: null, folderName: "Resources" }]);
    } else {
      // Go to specific folder
      const targetFolder = breadcrumbs[index];
      if (targetFolder.folderId !== null) {
        const folder = findFolderById(tree, targetFolder.folderId);
        setCurrentFolder(folder);
      }
      setBreadcrumbs(breadcrumbs.slice(0, index + 1));
    }
  };

  const createFolder = async (parentFolderId: number | null) => {
    const folderName = window.prompt("Folder name");
    if (!folderName) {
      return;
    }

    try {
      await apiCall("/api/resources/folders", {
        method: "POST",
        body: JSON.stringify({
          folder_name: folderName,
          parent_folder_id: parentFolderId,
        }),
      });
      toast.success("Folder created successfully");
      await fetchTree();
    } catch (err: any) {
      toast.error(err.message || "Failed to create folder");
    }
  };

  const renameFolder = async (folderId: number, currentName: string) => {
    const folderName = window.prompt("Rename folder", currentName);
    if (!folderName || folderName === currentName) {
      return;
    }

    try {
      await apiCall(`/api/resources/folders/${folderId}`, {
        method: "PATCH",
        body: JSON.stringify({ folder_name: folderName }),
      });
      toast.success("Folder renamed successfully");
      await fetchTree();
    } catch (err: any) {
      toast.error(err.message || "Failed to rename folder");
    }
  };

  const deleteFolder = async (folderId: number) => {
    if (!window.confirm("Delete this folder? It must be empty.")) {
      return;
    }

    try {
      await apiCall(`/api/resources/folders/${folderId}`, { method: "DELETE" });
      toast.success("Folder deleted successfully");
      await fetchTree();
      // If we deleted the current folder, go back
      if (currentFolder?.folder_id === folderId) {
        handleBreadcrumbClick(breadcrumbs.length - 2);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to delete folder");
    }
  };

  const addResource = async (folderId: number) => {
    const resourceName = window.prompt("Resource name");
    if (!resourceName) {
      return;
    }

    const fileUrl = window.prompt("Resource URL (https://...)");
    if (!fileUrl) {
      return;
    }

    try {
      await apiCall("/api/resources", {
        method: "POST",
        body: JSON.stringify({
          resource_name: resourceName,
          file_url: fileUrl,
          folder_id: folderId,
        }),
      });
      toast.success("Resource added successfully");
      await fetchTree();
    } catch (err: any) {
      toast.error(err.message || "Failed to create resource");
    }
  };

  const renameResource = async (resourceId: number, currentName: string) => {
    const resourceName = window.prompt("Rename resource", currentName);
    if (!resourceName || resourceName === currentName) {
      return;
    }

    try {
      await apiCall(`/api/resources/${resourceId}/rename`, {
        method: "PATCH",
        body: JSON.stringify({ resource_name: resourceName }),
      });
      toast.success("Resource renamed successfully");
      await fetchTree();
    } catch (err: any) {
      toast.error(err.message || "Failed to rename resource");
    }
  };

  const updateResourceUrl = async (resourceId: number, currentUrl: string) => {
    const fileUrl = window.prompt("Update resource URL", currentUrl);
    if (!fileUrl || fileUrl === currentUrl) {
      return;
    }

    try {
      await apiCall(`/api/resources/${resourceId}/url`, {
        method: "PATCH",
        body: JSON.stringify({ file_url: fileUrl }),
      });
      toast.success("Resource URL updated successfully");
      await fetchTree();
    } catch (err: any) {
      toast.error(err.message || "Failed to update URL");
    }
  };

  const deleteResource = async (resourceId: number) => {
    if (!window.confirm("Delete this resource?")) {
      return;
    }

    try {
      await apiCall(`/api/resources/${resourceId}`, { method: "DELETE" });
      toast.success("Resource deleted successfully");
      await fetchTree();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete resource");
    }
  };

  const displayFolders = currentFolder ? currentFolder.children : tree;
  const displayResources = currentFolder ? currentFolder.resources : [];
  const currentFolderName = currentFolder ? currentFolder.folder_name : title;

  return (
    <ResourcesLayout>
      <section className={styles.container}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>{currentFolderName}</h1>
            {breadcrumbs.length > 1 && (
              <div className={styles.breadcrumbs}>
                {breadcrumbs.map((crumb, index) => (
                  <div key={index}>
                    <button
                      className={`${styles.breadcrumbItem} ${
                        index === breadcrumbs.length - 1 ? styles.active : ""
                      }`}
                      onClick={() => handleBreadcrumbClick(index)}
                    >
                      {crumb.folderName}
                    </button>
                    {index < breadcrumbs.length - 1 && (
                      <span className={styles.breadcrumbSeparator}>/</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          {canManage && (
            <div className={styles.headerActions}>
              <button
                className={styles.actionBtn}
                onClick={() =>
                  createFolder(currentFolder?.folder_id ?? null)
                }
              >
                + Add Subfolder
              </button>
            </div>
          )}
        </div>

        {error && <div className={styles.error}>{error}</div>}

        {isLoading ? (
          <div className={styles.loading}>Loading resources...</div>
        ) : displayFolders.length === 0 && displayResources.length === 0 ? (
          <div className={styles.empty}>
            {canManage
              ? "No content yet. Create a folder or add a link to get started!"
              : "No resources available yet."}
          </div>
        ) : (
          <>
            {displayResources.length > 0 && (
              <div className={styles.resourcesContainer}>
                <h2 className={styles.sectionLabel}>Resources</h2>
                <ResourceCardGrid
                  resources={displayResources}
                  canManage={canManage}
                  onRename={renameResource}
                  onUpdateUrl={updateResourceUrl}
                  onDelete={deleteResource}
                  getHostname={getHostname}
                />
                {canManage && (
                  <button
                    className={styles.smallBtn}
                    onClick={() =>
                      addResource(
                        currentFolder?.folder_id ?? (null as any as number)
                      )
                    }
                  >
                    + Add Link
                  </button>
                )}
              </div>
            )}

            {displayFolders.length > 0 && (
              <div>
                <h2 className={styles.sectionLabel}>Folders</h2>
                <FolderCardGrid
                  folders={displayFolders}
                  canManage={canManage}
                  onRenameFolder={renameFolder}
                  onDeleteFolder={deleteFolder}
                  onFolderClick={handleFolderClick}
                />
              </div>
            )}
          </>
        )}
      </section>
    </ResourcesLayout>
  );
}

export default ResourcesPage;