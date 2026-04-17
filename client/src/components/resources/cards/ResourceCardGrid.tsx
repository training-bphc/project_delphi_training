import ResourceCard from "./ResourceCard";

interface ResourceRecord {
  resource_id: number;
  resource_name: string;
  resource_type: string;
  file_url: string;
  folder_id: number;
  uploaded_by: string;
}

interface ResourceCardGridProps {
  resources: ResourceRecord[];
  canManage: boolean;
  onRename: (resourceId: number, currentName: string) => void;
  onUpdateUrl: (resourceId: number, currentUrl: string) => void;
  onDelete: (resourceId: number) => void;
  getHostname: (url: string) => string;
}

function ResourceCardGrid({
  resources,
  canManage,
  onRename,
  onUpdateUrl,
  onDelete,
  getHostname,
}: ResourceCardGridProps) {
  if (resources.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {resources.map((resource) => (
        <ResourceCard
          key={resource.resource_id}
          resource={resource}
          canManage={canManage}
          onRename={onRename}
          onUpdateUrl={onUpdateUrl}
          onDelete={onDelete}
          getHostname={getHostname}
        />
      ))}
    </div>
  );
}

export default ResourceCardGrid;