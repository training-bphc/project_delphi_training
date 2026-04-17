import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "../../contexts/auth.tsx";
import { Button } from "../ui/button.tsx";
import { Card } from "../ui/card.tsx";
import { MoreVertical, Folder } from "lucide-react";
import { createFolderSlug, extractFolderIdFromSlug } from "../../lib/utils.ts";
import AddResourceModal from "./AddResourceModal.tsx";
import ResourceModal from "./ResourceModal.tsx";
import FolderModal from "./FolderModal.tsx";
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
  const { folderSlug } = useParams<{ folderSlug?: string }>();
  const navigate = useNavigate();
  const [tree, setTree] = useState<ResourceFolderNode[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([
    { folderId: null, folderName: "Resources" },
  ]);
  const [currentFolder, setCurrentFolder] = useState<ResourceFolderNode | null>(
    null,
  );
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    type: "folder" | "resource" | null;
    parentFolderId: number | null;
  }>({
    isOpen: false,
    type: null,
    parentFolderId: null,
  });
  const [resourceOpModal, setResourceOpModal] = useState<{
    isOpen: boolean;
    type: "rename" | "url" | "delete" | null;
    resourceId: number | null;
    currentValue: string;
  }>(
    {
    isOpen: false,
    type: null,
    resourceId: null,
    currentValue: "",
  });

  const [folderOpModal, setFolderOpModal] = useState<{
    isOpen: boolean;
    type: "rename" | "delete" | null;
    folderId: number | null;
    currentValue: string;
  }>({
    isOpen: false,
    type: null,
    folderId: null,
    currentValue: "",
  });

  // Extract folderId from slug
  const currentFolderId = folderSlug
    ? extractFolderIdFromSlug(folderSlug)
    : null;

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

  useEffect(() => {
    // Update currentFolder based on URL parameter
    if (currentFolderId) {
      const folder = findFolderById(tree, currentFolderId);
      if (folder) {
        setCurrentFolder(folder);
        // Rebuild breadcrumbs by traversing up
        const newBreadcrumbs: BreadcrumbItem[] = [
          { folderId: null, folderName: "Resources" },
        ];
        // Build breadcrumb path
        const buildPath = (
          folders: ResourceFolderNode[],
          targetId: number,
          path: BreadcrumbItem[],
        ): BreadcrumbItem[] | null => {
          for (const f of folders) {
            if (f.folder_id === targetId) {
              return [
                ...path,
                { folderId: f.folder_id, folderName: f.folder_name },
              ];
            }
            const result = buildPath(f.children, targetId, [
              ...path,
              { folderId: f.folder_id, folderName: f.folder_name },
            ]);
            if (result) return result;
          }
          return null;
        };
        const path = buildPath(tree, currentFolderId, newBreadcrumbs);
        if (path) {
          setBreadcrumbs(path);
        }
      }
    } else {
      setCurrentFolder(null);
      setBreadcrumbs([{ folderId: null, folderName: "Resources" }]);
    }
  }, [currentFolderId, tree]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-menu-trigger]")) {
        setOpenMenuId(null);
      }
    };

    if (openMenuId !== null) {
      document.addEventListener("click", handleClickOutside);
    }

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [openMenuId]);

  const findFolderById = (
    folders: ResourceFolderNode[],
    folderId: number,
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
    // Navigate to folder using slug
    const basePath = canManage ? "/admin/resources" : "/student/resources";
    const slug = createFolderSlug(folder.folder_name, folder.folder_id);
    navigate(`${basePath}/${slug}`);
  };

  const handleBreadcrumbClick = (index: number) => {
    const basePath = canManage ? "/admin/resources" : "/student/resources";
    if (index === 0) {
      // Go back to root
      navigate(basePath);
    } else {
      // Go to specific folder
      const targetFolder = breadcrumbs[index];
      if (targetFolder.folderId !== null) {
        const slug = createFolderSlug(
          targetFolder.folderName,
          targetFolder.folderId,
        );
        navigate(`${basePath}/${slug}`);
      }
    }
  };

  const createFolder = async (parentFolderId: number | null) => {
    setModalState({
      isOpen: true,
      type: "folder",
      parentFolderId,
    });
  };

  const handleCreateFolder = async (data: { name: string }) => {
    try {
      await apiCall("/api/resources/folders", {
        method: "POST",
        body: JSON.stringify({
          folder_name: data.name,
          parent_folder_id: modalState.parentFolderId,
        }),
      });
      toast.success("Folder created successfully!");
      await fetchTree();
    } catch (err: any) {
      toast.error(err.message || "Failed to create folder.");
    }
  };

  const renameFolder = async (folderId: number, currentName: string) => {
    setFolderOpModal({
      isOpen: true,
      type: "rename",
      folderId,
      currentValue: currentName,
    });
  };

  const handleRenameFolderSubmit = async (newName: string) => {
    if (!folderOpModal.folderId) return;
    try {
      await apiCall(`/api/resources/folders/${folderOpModal.folderId}`, {
        method: "PATCH",
        body: JSON.stringify({ folder_name: newName }),
      });
      toast.success("Folder renamed successfully");
      await fetchTree();
    } catch (err: any) {
      toast.error(err.message || "Failed to rename folder");
    }
  };

  const deleteFolder = async (folderId: number) => {
    setFolderOpModal({
      isOpen: true,
      type: "delete",
      folderId,
      currentValue: "",
    });
  };

  const handleDeleteFolderSubmit = async () => {
    if (!folderOpModal.folderId) return;
    try {
      await apiCall(`/api/resources/folders/${folderOpModal.folderId}`, {
        method: "DELETE",
      });
      toast.success("Folder deleted successfully");
      await fetchTree();
      // If we deleted the current folder, go back
      if (currentFolder?.folder_id === folderOpModal.folderId) {
        const basePath = canManage ? "/admin/resources" : "/student/resources";
        navigate(basePath);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to delete folder");
    }
  };

  const addResource = async (folderId: number) => {
    setModalState({
      isOpen: true,
      type: "resource",
      parentFolderId: folderId,
    });
  };

  const handleAddResource = async (data: {
    name: string;
    url?: string | undefined;
  }) => {
    try {
      await apiCall("/api/resources", {
        method: "POST",
        body: JSON.stringify({
          resource_name: data.name,
          file_url: data.url,
          folder_id: modalState.parentFolderId,
        }),
      });
      toast.success("Resource added successfully!");
      await fetchTree();
    } catch (err: any) {
      toast.error(err.message || "Failed to create resource");
    }
  };
  const renameResource = async (resourceId: number, currentName: string) => {
    setResourceOpModal({
      isOpen: true,
      type: "rename",
      resourceId,
      currentValue: currentName,
    });
  };

  const handleRenameResource = async (newName: string) => {
    if (!resourceOpModal.resourceId) return;
    try {
      await apiCall(`/api/resources/${resourceOpModal.resourceId}/rename`, {
        method: "PATCH",
        body: JSON.stringify({ resource_name: newName }),
      });
      toast.success("Resource renamed successfully");
      await fetchTree();
    } catch (err: any) {
      toast.error(err.message || "Failed to rename resource");
    }
  };

  const updateResourceUrl = async (resourceId: number, currentUrl: string) => {
    setResourceOpModal({
      isOpen: true,
      type: "url",
      resourceId,
      currentValue: currentUrl,
    });
  };

  const handleUpdateResourceUrl = async (newUrl: string) => {
    if (!resourceOpModal.resourceId) return;
    try {
      await apiCall(`/api/resources/${resourceOpModal.resourceId}/url`, {
        method: "PATCH",
        body: JSON.stringify({ file_url: newUrl }),
      });
      toast.success("Resource URL updated successfully");
      await fetchTree();
    } catch (err: any) {
      toast.error(err.message || "Failed to update URL");
    }
  };

  const deleteResource = async (resourceId: number) => {
    setResourceOpModal({
      isOpen: true,
      type: "delete",
      resourceId,
      currentValue: "",
    });
  };

  const handleDeleteResource = async () => {
    if (!resourceOpModal.resourceId) return;
    try {
      await apiCall(`/api/resources/${resourceOpModal.resourceId}`, {
        method: "DELETE",
      });
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
    <div className={styles.mainContent}>
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
              <Button
                onClick={() => createFolder(currentFolder?.folder_id ?? null)}
              >
                + Add Subfolder
              </Button>
              <Button
                onClick={() =>
                  addResource(
                    currentFolder?.folder_id ?? (null as any as number),
                  )
                }
              >
                + Add Link
              </Button>
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
            {displayFolders.length > 0 && (
              <div>
                <h2 className={styles.sectionLabel}>Folders</h2>
                <div className={styles.cardGrid}>
                  {displayFolders.map((folder) => (
                    <Card
                      key={folder.folder_id}
                      className={styles.folderCard}
                      onClick={() => handleFolderClick(folder)}
                    >
                      <div className={styles.folderCardHeader}>
                        <div className={styles.folderNameWrapper}>
                          <Folder className="size-4" />
                          <span className={styles.folderName}>
                            {folder.folder_name}
                          </span>
                        </div>

                        {canManage && (
                          <div
                            style={{ position: "relative", zIndex: 50 }}
                            data-menu-trigger
                          >
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              className={styles.optionsButton}
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenMenuId(
                                  openMenuId === folder.folder_id
                                    ? null
                                    : folder.folder_id,
                                );
                              }}
                            >
                              <MoreVertical className="size-4" />
                            </Button>
                            {openMenuId === folder.folder_id && (
                              <div
                                className={styles.popoverMenu}
                                onClick={(e) => e.stopPropagation()}
                              >
                                <button
                                  className={styles.popoverMenuItem}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    renameFolder(
                                      folder.folder_id,
                                      folder.folder_name,
                                    );
                                    setOpenMenuId(null);
                                  }}
                                >
                                  Rename
                                </button>
                                <button
                                  className={`${styles.popoverMenuItem} ${styles.destructive}`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteFolder(folder.folder_id);
                                    setOpenMenuId(null);
                                  }}
                                >
                                  Delete
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {displayResources.length > 0 && (
              <div className={styles.resourcesContainer}>
                <h2 className={styles.sectionLabel}>Resources</h2>
                <div className={styles.resourceCardGrid}>
                  {displayResources.map((resource) => (
                    <Card
                      key={resource.resource_id}
                      className={styles.resourceCard}
                      onClick={() => {
                        window.open(resource.file_url, "_blank");
                      }}
                    >
                      {canManage && (
                        <div
                          style={{
                            position: "absolute",
                            top: "8px",
                            right: "8px",
                            zIndex: 50,
                          }}
                          data-menu-trigger
                        >
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            className={styles.optionsButton}
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenuId(
                                openMenuId === resource.resource_id
                                  ? null
                                  : resource.resource_id,
                              );
                            }}
                          >
                            <MoreVertical className="size-4" />
                          </Button>
                          {openMenuId === resource.resource_id && (
                            <div
                              className={styles.popoverMenu}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                className={styles.popoverMenuItem}
                                onClick={() => {
                                  renameResource(
                                    resource.resource_id,
                                    resource.resource_name,
                                  );
                                  setOpenMenuId(null);
                                }}
                              >
                                Rename
                              </button>
                              <button
                                className={styles.popoverMenuItem}
                                onClick={() => {
                                  updateResourceUrl(
                                    resource.resource_id,
                                    resource.file_url,
                                  );
                                  setOpenMenuId(null);
                                }}
                              >
                                Update URL
                              </button>
                              <button
                                className={`${styles.popoverMenuItem} ${styles.destructive}`}
                                onClick={() => {
                                  deleteResource(resource.resource_id);
                                  setOpenMenuId(null);
                                }}
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                      <div className={styles.resourceHeader}>
                        <div className={styles.resourceLinkWrapper}>
                          <a
                            className={styles.resourceLink}
                            href={resource.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            title={resource.resource_name}
                          >
                            {resource.resource_name}
                          </a>
                          <span
                            className={styles.resourceHost}
                            title={resource.file_url}
                          >
                            {getHostname(resource.file_url)}
                          </span>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </section>
      <AddResourceModal
        isOpen={modalState.isOpen}
        onClose={() =>
          setModalState({
            isOpen: false,
            type: null,
            parentFolderId: null,
          })
        }
        onSubmit={
          modalState.type === "folder" ? handleCreateFolder : handleAddResource
        }
        title={
          modalState.type === "folder"
            ? "Create New Folder"
            : "Add Resource Link"
        }
        isFolder={modalState.type === "folder"}
      />
      <ResourceModal
        isOpen={resourceOpModal.isOpen}
        onClose={() =>
          setResourceOpModal({
            isOpen: false,
            type: null,
            resourceId: null,
            currentValue: "",
          })
        }
        onSubmit={
          resourceOpModal.type === "rename"
            ? handleRenameResource
            : resourceOpModal.type === "url"
              ? handleUpdateResourceUrl
              : handleDeleteResource
        }
        title={
          resourceOpModal.type === "rename"
            ? "Rename Resource"
            : resourceOpModal.type === "url"
              ? "Update Resource URL"
              : "Delete Resource"
        }
        placeholder={
          resourceOpModal.type === "rename"
            ? "New resource name"
            : resourceOpModal.type === "url"
              ? "New URL"
              : undefined
        }
        defaultValue={
          resourceOpModal.type === "delete"
            ? ""
            : resourceOpModal.currentValue || ""
        }
        isDangerous={resourceOpModal.type === "delete"}
        isDeleteConfirmation={resourceOpModal.type === "delete"}
      />
      <FolderModal
        isOpen={folderOpModal.isOpen}
        onClose={() =>
          setFolderOpModal({
            isOpen: false,
            type: null,
            folderId: null,
            currentValue: "",
          })
        }
        onSubmit={
          folderOpModal.type === "rename"
            ? handleRenameFolderSubmit
            : handleDeleteFolderSubmit
        }
        title={
          folderOpModal.type === "rename"
            ? "Rename Folder"
            : "Delete Folder"
        }
        placeholder={
          folderOpModal.type === "rename" ? "New folder name" : undefined
        }
        defaultValue={folderOpModal.currentValue || ""}
        isDangerous={folderOpModal.type === "delete"}
        isDeleteConfirmation={folderOpModal.type === "delete"}
      />
    </div>
  );
}

export default ResourcesPage;
