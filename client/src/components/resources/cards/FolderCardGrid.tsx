import FolderCard from "./FolderCard";
import styles from "../resources.module.css";

interface ResourceFolderNode {
  folder_id: number;
  folder_name: string;
  parent_folder_id: number | null;
  resources: any[];
  children: ResourceFolderNode[];
}

interface FolderCardGridProps {
  folders: ResourceFolderNode[];
  canManage: boolean;
  onRenameFolder: (folderId: number, currentName: string) => void;
  onDeleteFolder: (folderId: number) => void;
  onFolderClick: (folder: ResourceFolderNode) => void;
}

function FolderCardGrid({
  folders,
  canManage,
  onRenameFolder,
  onDeleteFolder,
  onFolderClick,
}: FolderCardGridProps) {
  if (folders.length === 0) {
    return null;
  }

  return (
    <div className={styles.cardGrid}>
      {folders.map((folder) => (
        <FolderCard
          key={folder.folder_id}
          folder={folder}
          canManage={canManage}
          onRenameFolder={onRenameFolder}
          onDeleteFolder={onDeleteFolder}
          onFolderClick={onFolderClick}
        />
      ))}
    </div>
  );
}

export default FolderCardGrid;