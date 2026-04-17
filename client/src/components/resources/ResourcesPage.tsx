import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "../../contexts/auth.tsx";
import { Card, CardContent } from "@/components/ui/card";
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
import { ChevronLeft, Plus } from "lucide-react";
import FolderCardGrid from "./cards/FolderCardGrid";
import ResourceCardGrid from "./cards/ResourceCardGrid";

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
  const [showBrowser, setShowBrowser] = useState(false);

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
      setCurrentFolder(null);
      setBreadcrumbs([{ folderId: null, folderName: "Resources" }]);
    } else {
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
  const isRootLevel = currentFolder === null;

  const handleDialogSubmit = () => {
    if (dialogMode === "folder") {
      if (dialogFolderId && !Array.isArray(displayFolders.find(f => f.folder_id === dialogFolderId))) {
        handleRenameFolderDialogSubmit();
      } else {
        handleFolderDialogSubmit();
      }
    } else if (dialogMode === "resource") {
      handleAddResourceStep();
    } else if (dialogMode === "url") {
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

  // LANDING PAGE - Show single card at root level when no folders/resources exist
  if (isRootLevel && !isLoading && displayFolders.length === 0 && displayResources.length === 0 && canManage && !showBrowser) {
    return (
      <main className="w-full flex flex-col gap-8 py-6">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground">
            Resources
          </h1>
          <p className="text-muted-foreground mt-2">
            Organize and manage your training resources
          </p>
        </div>

        <div className="max-w-xl">
          <Card 
            className="border border-border rounded-lg overflow-hidden transition-all duration-200 hover:shadow-lg hover:border-foreground/30 cursor-pointer"
            onClick={() => setShowBrowser(true)}
          >
            <CardContent className="p-12 flex flex-col justify-center min-h-64">
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                Browse & Manage Resources
              </h2>
              <p className="text-base text-muted-foreground">
                Create folders and organize your training resources. Build a structured library of links and documents for your students.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  // BROWSER VIEW - Show traditional folder/resource browser
  return (
    <main className="w-full">
      <div className="flex flex-col gap-8 py-6">
        {/* Back Button - Show when in browser view and nested */}
        {!isRootLevel && (
          <Button
            variant="outline"
            onClick={() => handleBreadcrumbClick(breadcrumbs.length - 2)}
            className="w-fit gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </Button>
        )}

        {/* Back to Landing Button - Show when at root but came from landing */}
        {isRootLevel && showBrowser && canManage && displayFolders.length === 0 && displayResources.length === 0 && (
          <Button
            variant="outline"
            onClick={() => setShowBrowser(false)}
            className="w-fit gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Landing
          </Button>
        )}

        {/* Title Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-foreground">
              {currentFolderName}
            </h1>
            {breadcrumbs.length > 1 && (
              <div className="flex items-center gap-2 mt-3 text-sm flex-wrap">
                {breadcrumbs.map((crumb, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <button
                      className={`transition-colors ${
                        index === breadcrumbs.length - 1
                          ? "text-muted-foreground"
                          : "text-primary hover:text-primary/80 hover:underline"
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
        </div>

        {/* Error State */}
        {error && (
          <div className="p-4 bg-destructive/10 text-destructive rounded-lg text-sm border border-destructive/20">
            {error}
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading resources...</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && displayFolders.length === 0 && displayResources.length === 0 && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <p className="text-lg text-muted-foreground">
                {canManage
                  ? "No resources yet. Create a folder to get started!"
                  : "No resources available yet."}
              </p>
            </div>
          </div>
        )}

        {/* Content */}
        {!isLoading && (displayFolders.length > 0 || displayResources.length > 0) && (
          <div className="space-y-10">
            {/* Resources Section */}
            {displayResources.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-xl font-semibold text-foreground">Resources</h2>
                  <span className="text-sm text-muted-foreground">{displayResources.length} items</span>
                </div>
                <ResourceCardGrid
                  resources={displayResources}
                  canManage={canManage}
                  onRename={renameResource}
                  onUpdateUrl={updateResourceUrl}
                  onDelete={deleteResource}
                  getHostname={getHostname}
                />
              </div>
            )}

            {/* Folders Grid - No title, no count */}
            {displayFolders.length > 0 && (
              <div>
                {/* Action Buttons Only - Moved to the right */}
                <div className="flex justify-end gap-2 mb-5">
                  {canManage && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={() => createFolder(currentFolder?.folder_id ?? null)}
                      >
                        <Plus className="w-4 h-4" />
                        Add Folder
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={() => addResource(currentFolder?.folder_id ?? (null as any as number))}
                      >
                        <Plus className="w-4 h-4" />
                        Add Resource
                      </Button>
                    </>
                  )}
                </div>
                <FolderCardGrid
                  folders={displayFolders}
                  canManage={canManage}
                  onRenameFolder={renameFolder}
                  onDeleteFolder={deleteFolder}
                  onFolderClick={handleFolderClick}
                />
              </div>
            )}

            {/* Add Buttons when only resources exist (no folders) */}
            {displayResources.length > 0 && displayFolders.length === 0 && canManage && (
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={() => createFolder(currentFolder?.folder_id ?? null)}
                >
                  <Plus className="w-4 h-4" />
                  Add Folder
                </Button>
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={() => addResource(currentFolder?.folder_id ?? (null as any as number))}
                >
                  <Plus className="w-4 h-4" />
                  Add Resource
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Dialog for Folder/Resource/URL input */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
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
          <DialogFooter className="gap-2">
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
    </main>
  );
}

export default ResourcesPage;