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
    <Card className="flex flex-col h-full hover:shadow-lg transition-shadow cursor-pointer">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle
          className="text-lg hover:opacity-80 transition-opacity"
          onClick={() => onFolderClick(folder)}
        >
          {folder.folder_name}
        </CardTitle>

        {canManage && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon-sm"
                onClick={(e) => e.stopPropagation()}
              >
                ⋮
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() =>
                  onRenameFolder(folder.folder_id, folder.folder_name)
                }
              >
                Rename
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                onClick={() => onDeleteFolder(folder.folder_id)}
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </CardHeader>

      {canManage && (
        <CardFooter className="pt-0 mt-auto">
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => onAddResource(folder.folder_id)}
          >
            + Add Link
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}

export default FolderCard;