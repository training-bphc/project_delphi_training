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
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="pt-6 pb-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <a
              href={resource.file_url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-sm text-primary hover:underline break-words line-clamp-2"
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

          {canManage && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon-xs"
                  onClick={(e) => e.stopPropagation()}
                >
                  ⋮
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