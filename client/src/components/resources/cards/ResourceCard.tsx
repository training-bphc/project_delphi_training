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
import { Link as LinkIcon, MoreVertical } from "lucide-react";

interface ResourceRecord {
  resource_id: number;
  resource_name: string;
  resource_type: string;
  file_url: string;
  folder_id: number;
  uploaded_by: string;
}

interface ResourceCardProps {
  resource: ResourceRecord;
  canManage: boolean;
  onRename: (resourceId: number, currentName: string) => void;
  onUpdateUrl: (resourceId: number, currentUrl: string) => void;
  onDelete: (resourceId: number) => void;
  getHostname: (url: string) => string;
}

function ResourceCard({
  resource,
  canManage,
  onRename,
  onUpdateUrl,
  onDelete,
  getHostname,
}: ResourceCardProps) {
  return (
    <Card className="hover:shadow-md transition-all duration-200 group border-l-4 border-l-blue-500 h-48 flex flex-col justify-between">
      <CardContent className="pt-6 pb-4 flex flex-col h-full">
        <div className="flex items-start justify-between gap-3 flex-1">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <LinkIcon className="w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
            <div className="flex-1 min-w-0">
              <a
                href={resource.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-base text-primary hover:underline break-words line-clamp-3 block"
                title={resource.resource_name}
              >
                {resource.resource_name}
              </a>
              <p
                className="text-xs text-muted-foreground mt-2 truncate"
                title={resource.file_url}
              >
                {getHostname(resource.file_url)}
              </p>
            </div>
          </div>

          {canManage && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon-xs"
                  className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                >
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() =>
                    onRename(resource.resource_id, resource.resource_name)
                  }
                >
                  Rename
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    onUpdateUrl(resource.resource_id, resource.file_url)
                  }
                >
                  Update URL
                </DropdownMenuItem>
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => onDelete(resource.resource_id)}
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default ResourceCard;