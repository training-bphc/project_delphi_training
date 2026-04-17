import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Folder, MoreVertical } from "lucide-react";

interface ResourceFolderNode {
  folder_id: number;
  folder_name: string;
  parent_folder_id: number | null;
  resources: any[];
  children: ResourceFolderNode[];
}

interface FolderCardProps {
  folder: ResourceFolderNode;
  canManage: boolean;
  onRenameFolder: (folderId: number, currentName: string) => void;
  onDeleteFolder: (folderId: number) => void;
  onFolderClick: (folder: ResourceFolderNode) => void;
}

function FolderCard({
  folder,
  canManage,
  onRenameFolder,
  onDeleteFolder,
  onFolderClick,
}: FolderCardProps) {
  return (
    <Card 
      className="hover:shadow-lg transition-all duration-200 cursor-pointer group border border-border rounded-lg overflow-hidden h-56"
      onClick={() => onFolderClick(folder)}
    >
      <CardContent className="p-8 h-full flex flex-col justify-between">
        {/* Top section with icon, title, and menu */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <Folder className="w-8 h-8 text-primary flex-shrink-0 group-hover:scale-110 transition-transform" />
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-foreground line-clamp-3 group-hover:text-primary transition-colors">
                {folder.folder_name}
              </h3>
            </div>
          </div>

          {canManage && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button 
                  variant="ghost" 
                  size="icon-sm"
                  className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                >
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onRenameFolder(folder.folder_id, folder.folder_name);
                  }}
                >
                  Rename
                </DropdownMenuItem>
                <DropdownMenuItem
                  variant="destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteFolder(folder.folder_id);
                  }}
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Bottom spacer for tile appearance */}
        <div className="text-sm text-muted-foreground">
          {folder.resources.length > 0 && (
            <p>{folder.resources.length} resource{folder.resources.length !== 1 ? 's' : ''}</p>
          )}
          {folder.children.length > 0 && (
            <p>{folder.children.length} folder{folder.children.length !== 1 ? 's' : ''}</p>
          )}
          {folder.resources.length === 0 && folder.children.length === 0 && (
            <p>Empty folder</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default FolderCard;