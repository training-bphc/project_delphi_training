import {
  Card,
  CardHeader,
  CardTitle,
  CardFooter,
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
  onAddResource: (folderId: number) => void;
  onRenameFolder: (folderId: number, currentName: string) => void;
  onDeleteFolder: (folderId: number) => void;
  onFolderClick: (folder: ResourceFolderNode) => void;
}

function FolderCard({
  folder,
  canManage,
  onAddResource,
  onRenameFolder,
  onDeleteFolder,
  onFolderClick,
}: FolderCardProps) {
  return (
    <Card 
      className="hover:shadow-lg transition-all duration-200 cursor-pointer group flex flex-col h-full border-l-4 border-l-primary"
      onClick={() => onFolderClick(folder)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Folder className="w-5 h-5 text-primary flex-shrink-0 group-hover:scale-110 transition-transform" />
            <CardTitle className="text-base line-clamp-2 group-hover:text-primary transition-colors">
              {folder.folder_name}
            </CardTitle>
          </div>

          {canManage && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button 
                  variant="ghost" 
                  size="icon-sm"
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
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
      </CardHeader>

      {canManage && (
        <CardFooter className="pt-0 mt-auto">
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={(e) => {
              e.stopPropagation();
              onAddResource(folder.folder_id);
            }}
          >
            + Add Link
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}

export default FolderCard;