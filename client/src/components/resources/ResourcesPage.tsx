import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/auth.tsx";
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

interface ResourcesPageProps {
  canManage: boolean;
  title: string;
}

function ResourcesPage({ canManage, title }: ResourcesPageProps) {
  const { token } = useAuth();
  const [tree, setTree] = useState<ResourceFolderNode[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      await fetchTree();
    } catch (err: any) {
      alert(err.message || "Failed to create folder");
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
      await fetchTree();
    } catch (err: any) {
      alert(err.message || "Failed to rename folder");
    }
  };

  const deleteFolder = async (folderId: number) => {
    if (!window.confirm("Delete this folder? It must be empty.")) {
      return;
    }

    try {
      await apiCall(`/api/resources/folders/${folderId}`, { method: "DELETE" });
      await fetchTree();
    } catch (err: any) {
      alert(err.message || "Failed to delete folder");
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
      await fetchTree();
    } catch (err: any) {
      alert(err.message || "Failed to create resource");
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
      await fetchTree();
    } catch (err: any) {
      alert(err.message || "Failed to rename resource");
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
      await fetchTree();
    } catch (err: any) {
      alert(err.message || "Failed to update URL");
    }
  };

  const deleteResource = async (resourceId: number) => {
    if (!window.confirm("Delete this resource?")) {
      return;
    }

    try {
      await apiCall(`/api/resources/${resourceId}`, { method: "DELETE" });
      await fetchTree();
    } catch (err: any) {
      alert(err.message || "Failed to delete resource");
    }
  };

  const renderFolder = (node: ResourceFolderNode) => {
    return (
      <div key={node.folder_id}>
        <div className={styles.folderRow}>
          <span className={styles.folderName}>📁 {node.folder_name}</span>
          {canManage && (
            <div className={styles.folderActions}>
              <button
                className={styles.smallBtn}
                onClick={() => createFolder(node.folder_id)}
              >
                Add Subfolder
              </button>
              <button
                className={styles.smallBtn}
                onClick={() => addResource(node.folder_id)}
              >
                Add Link
              </button>
              <button
                className={styles.smallBtn}
                onClick={() => renameFolder(node.folder_id, node.folder_name)}
              >
                Rename
              </button>
              <button
                className={styles.smallBtn}
                onClick={() => deleteFolder(node.folder_id)}
              >
                Delete
              </button>
            </div>
          )}
        </div>

        {node.resources.length > 0 && (
          <ul className={styles.resourceList}>
            {node.resources.map((resource) => (
              <li key={resource.resource_id} className={styles.resourceItem}>
                <a
                  className={styles.resourceLink}
                  href={resource.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={resource.file_url}
                >
                  {resource.resource_name}
                </a>
                <span className={styles.resourceHost} title={resource.file_url}>
                  {getHostname(resource.file_url)}
                </span>
                {canManage && (
                  <>
                    <button
                      className={styles.smallBtn}
                      onClick={() =>
                        renameResource(
                          resource.resource_id,
                          resource.resource_name,
                        )
                      }
                    >
                      Rename
                    </button>
                    <button
                      className={styles.smallBtn}
                      onClick={() =>
                        updateResourceUrl(
                          resource.resource_id,
                          resource.file_url,
                        )
                      }
                    >
                      Update URL
                    </button>
                    <button
                      className={styles.smallBtn}
                      onClick={() => deleteResource(resource.resource_id)}
                    >
                      Delete
                    </button>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}

        {node.children.length > 0 && (
          <div className={styles.children}>
            {node.children.map((child) => renderFolder(child))}
          </div>
        )}
      </div>
    );
  };

  return (
    <section className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>{title}</h1>
        {canManage && (
          <button
            className={styles.actionBtn}
            onClick={() => createFolder(null)}
          >
            Add Root Folder
          </button>
        )}
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.tree}>
        {isLoading ? (
          <div className={styles.empty}>Loading resources...</div>
        ) : tree.length === 0 ? (
          <div className={styles.empty}>No resources available yet.</div>
        ) : (
          tree.map((node) => renderFolder(node))
        )}
      </div>
    </section>
  );
}

export default ResourcesPage;
