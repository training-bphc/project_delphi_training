import {
  Card,
  CardHeader,
  CardTitle,
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
      className="hover:shadow-lg transition-all duration-200 cursor-pointer group flex flex-col justify-between h-48 border-l-4 border-l-primary hover:border-foreground/30"
      onClick={() => onFolderClick(folder)}
    >
      <CardHeader className="flex flex-row items-start justify-between gap-2 pb-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <Folder className="w-6 h-6 text-primary flex-shrink-0 group-hover:scale-110 transition-transform" />
          <CardTitle className="text-lg line-clamp-3 group-hover:text-primary transition-colors">
            {folder.folder_name}
          </CardTitle>
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
      </CardHeader>

      {/* Bottom spacer to push content up */}
      <div className="flex-1" />
    </Card>
  );
}

export default FolderCard;