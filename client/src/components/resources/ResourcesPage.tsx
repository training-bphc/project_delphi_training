import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "../../contexts/auth.tsx";
import ResourcesLayout from "./layout/ResourcesLayout";
import FolderCardGrid from "./cards/FolderCardGrid";
import ResourceCardGrid from "./cards/ResourceCardGrid";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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

type DialogMode = "folder" | "resource" | "url";

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

  // Dialog states
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<DialogMode>("folder");
  const [dialogValue, setDialogValue] = useState("");
  const [dialogFolderId, setDialogFolderId] = useState<number | null>(null);
  const [dialogResourceId, setDialogResourceId] = useState<number | null>(null);
  const [resourceNameForUrl, setResourceNameForUrl] = useState("");

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

  // Create/Rename Folder
  const createFolder = async (parentFolderId: number | null) => {
    setDialogMode("folder");
    setDialogValue("");
    setDialogFolderId(parentFolderId);
    setDialogResourceId(null);
    setDialogOpen(true);
  };

  const handleFolderDialogSubmit = async () => {
    const folderName = dialogValue.trim();
    if (!folderName) {
      toast.error("Folder name cannot be empty");
      return;
    }

    try {
      await apiCall("/api/resources/folders", {
        method: "POST",
        body: JSON.stringify({
          folder_name: folderName,
          parent_folder_id: dialogFolderId,
        }),
      });
      toast.success("Folder created successfully");
      await fetchTree();
      setDialogOpen(false);
      setDialogValue("");
    } catch (err: any) {
      toast.error(err.message || "Failed to create folder");
    }
  };

  const renameFolder = async (folderId: number, currentName: string) => {
    setDialogMode("folder");
    setDialogValue(currentName);
    setDialogFolderId(folderId);
    setDialogResourceId(null);
    setDialogOpen(true);
  };

  const handleRenameFolderDialogSubmit = async () => {
    const folderName = dialogValue.trim();
    if (!folderName) {
      toast.error("Folder name cannot be empty");
      return;
    }

    if (folderName === dialogValue) {
      setDialogOpen(false);
      return;
    }

    try {
      await apiCall(`/api/resources/folders/${dialogFolderId}`, {
        method: "PATCH",
        body: JSON.stringify({ folder_name: folderName }),
      });
      toast.success("Folder renamed successfully");
      await fetchTree();
      setDialogOpen(false);
      setDialogValue("");
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

  // Add Resource (2-step: name then URL)
  const addResource = async (folderId: number) => {
    setDialogMode("resource");
    setDialogValue("");
    setResourceNameForUrl("");
    setDialogFolderId(folderId);
    setDialogResourceId(null);
    setDialogOpen(true);
  };

  const handleAddResourceStep = async () => {
    if (dialogMode === "resource") {
      const resourceName = dialogValue.trim();
      if (!resourceName) {
        toast.error("Resource name cannot be empty");
        return;
      }
      // Move to URL step
      setResourceNameForUrl(resourceName);
      setDialogMode("url");
      setDialogValue("");
    } else if (dialogMode === "url") {
      const fileUrl = dialogValue.trim();
      if (!fileUrl) {
        toast.error("URL cannot be empty");
        return;
      }
      if (!fileUrl.startsWith("https://")) {
        toast.error("Please enter a valid HTTPS URL");
        return;
      }

      try {
        await apiCall("/api/resources", {
          method: "POST",
          body: JSON.stringify({
            resource_name: resourceNameForUrl,
            file_url: fileUrl,
            folder_id: dialogFolderId,
          }),
        });
        toast.success("Resource added successfully");
        await fetchTree();
        setDialogOpen(false);
        setDialogValue("");
        setResourceNameForUrl("");
      } catch (err: any) {
        toast.error(err.message || "Failed to create resource");
      }
    }
  };

  // Rename Resource
  const renameResource = async (resourceId: number, currentName: string) => {
    setDialogMode("resource");
    setDialogValue(currentName);
    setResourceNameForUrl(currentName);
    setDialogResourceId(resourceId);
    setDialogFolderId(null);
    setDialogOpen(true);
  };

  const handleRenameResourceDialogSubmit = async () => {
    const resourceName = dialogValue.trim();
    if (!resourceName) {
      toast.error("Resource name cannot be empty");
      return;
    }

    try {
      await apiCall(`/api/resources/${dialogResourceId}/rename`, {
        method: "PATCH",
        body: JSON.stringify({ resource_name: resourceName }),
      });
      toast.success("Resource renamed successfully");
      await fetchTree();
      setDialogOpen(false);
      setDialogValue("");
    } catch (err: any) {
      toast.error(err.message || "Failed to rename resource");
    }
  };

  // Update Resource URL
  const updateResourceUrl = async (resourceId: number, currentUrl: string) => {
    setDialogMode("url");
    setDialogValue(currentUrl);
    setResourceNameForUrl("");
    setDialogResourceId(resourceId);
    setDialogFolderId(null);
    setDialogOpen(true);
  };

  const handleUpdateUrlDialogSubmit = async () => {
    const fileUrl = dialogValue.trim();
    if (!fileUrl) {
      toast.error("URL cannot be empty");
      return;
    }
    if (!fileUrl.startsWith("https://")) {
      toast.error("Please enter a valid HTTPS URL");
      return;
    }

    try {
      await apiCall(`/api/resources/${dialogResourceId}/url`, {
        method: "PATCH",
        body: JSON.stringify({ file_url: fileUrl }),
      });
      toast.success("Resource URL updated successfully");
      await fetchTree();
      setDialogOpen(false);
      setDialogValue("");
    } catch (err: any) {
      toast.error(err.message || "Failed to update URL");
    }
  };

  // Delete Resource
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

  const handleDialogSubmit = () => {
    if (dialogMode === "folder") {
      // Check if renaming (dialogFolderId will be set) or creating
      if (dialogFolderId && !Array.isArray(displayFolders.find(f => f.folder_id === dialogFolderId))) {
        handleRenameFolderDialogSubmit();
      } else {
        handleFolderDialogSubmit();
      }
    } else if (dialogMode === "resource") {
      handleAddResourceStep();
    } else if (dialogMode === "url") {
      // Check if updating URL or adding new resource
      if (dialogResourceId && resourceNameForUrl === "") {
        handleUpdateUrlDialogSubmit();
      } else if (resourceNameForUrl) {
        handleAddResourceStep();
      } else {
        handleUpdateUrlDialogSubmit();
      }
    }
  };

  const getDialogTitle = () => {
    if (dialogMode === "folder") {
      return dialogFolderId && !Array.isArray(displayFolders.find(f => f.folder_id === dialogFolderId)) ? "Rename Folder" : "Create Folder";
    } else if (dialogMode === "resource") {
      return "Add Resource";
    } else {
      return "Add URL";
    }
  };

  const getDialogPlaceholder = () => {
    if (dialogMode === "folder") {
      return "Folder name";
    } else if (dialogMode === "resource") {
      return "Resource name";
    } else {
      return "https://example.com";
    }
  };

  return (
    <ResourcesLayout>
      <section className="container mx-auto px-4 py-6">
        <div className="flex flex-col gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold">{currentFolderName}</h1>
            {breadcrumbs.length > 1 && (
              <div className="flex items-center gap-2 mt-2 text-sm">
                {breadcrumbs.map((crumb, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <button
                      className={`${
                        index === breadcrumbs.length - 1
                          ? "text-muted-foreground cursor-default"
                          : "text-primary hover:underline"
                      }`}
                      onClick={() => handleBreadcrumbClick(index)}
                      disabled={index === breadcrumbs.length - 1}
                    >
                      {crumb.folderName}
                    </button>
                    {index < breadcrumbs.length - 1 && (
                      <span className="text-muted-foreground">/</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          {canManage && (
            <div>
              <Button
                onClick={() =>
                  createFolder(currentFolder?.folder_id ?? null)
                }
              >
                + Add Subfolder
              </Button>
            </div>
          )}
        </div>

        {error && (
          <div className="mb-4 p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="text-center text-muted-foreground py-8">
            Loading resources...
          </div>
        ) : displayFolders.length === 0 && displayResources.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            {canManage
              ? "No content yet. Create a folder or add a link to get started!"
              : "No resources available yet."}
          </div>
        ) : (
          <>
            {displayResources.length > 0 && (
              <div className="mb-8">
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                  Resources
                </h2>
                <ResourceCardGrid
                  resources={displayResources}
                  canManage={canManage}
                  onRename={renameResource}
                  onUpdateUrl={updateResourceUrl}
                  onDelete={deleteResource}
                  getHostname={getHostname}
                />
                {canManage && (
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() =>
                      addResource(
                        currentFolder?.folder_id ?? (null as any as number)
                      )
                    }
                  >
                    + Add Link
                  </Button>
                )}
              </div>
            )}

            {displayFolders.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                  Folders
                </h2>
                <FolderCardGrid
                  folders={displayFolders}
                  canManage={canManage}
                  onAddResource={addResource}
                  onRenameFolder={renameFolder}
                  onDeleteFolder={deleteFolder}
                  onFolderClick={handleFolderClick}
                />
              </div>
            )}
          </>
        )}
      </section>

      {/* Dialog for Folder/Resource/URL input */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{getDialogTitle()}</DialogTitle>
            {(dialogMode === "resource" || dialogMode === "url") && (
              <DialogDescription>
                {dialogMode === "resource"
                  ? "Enter the name of the resource"
                  : "Enter the HTTPS URL for the resource"}
              </DialogDescription>
            )}
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Input
              placeholder={getDialogPlaceholder()}
              value={dialogValue}
              onChange={(e) => setDialogValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleDialogSubmit();
                }
              }}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDialogOpen(false);
                setDialogValue("");
                setResourceNameForUrl("");
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleDialogSubmit}>
              {dialogMode === "resource" && dialogValue
                ? "Next"
                : dialogMode === "url" && resourceNameForUrl
                  ? "Create"
                  : "Submit"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ResourcesLayout>
  );
}

export default ResourcesPage;