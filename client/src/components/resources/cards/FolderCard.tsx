import { useState, useRef, useEffect } from "react";
import styles from "../resources.module.css";

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
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showMenu]);

  const handleFolderNameClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFolderClick(folder);
  };

  return (
    <div className={styles.folderCard}>
      <div className={styles.folderCardHeader}>
        <div className={styles.folderNameWrapper} onClick={handleFolderNameClick}>
          <span className={styles.folderName}>{folder.folder_name}</span>
        </div>

        {canManage && (
          <div className={styles.folderMenu} ref={menuRef}>
            <button
              className={styles.iconBtn}
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              title="More options"
            >
              ⋮
            </button>

            {showMenu && (
              <div className={styles.contextMenu}>
                <button
                  className={styles.contextMenuItem}
                  onClick={(e) => {
                    e.stopPropagation();
                    onRenameFolder(folder.folder_id, folder.folder_name);
                    setShowMenu(false);
                  }}
                >
                  Rename
                </button>
                <button
                  className={`${styles.contextMenuItem} ${styles.destructive}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteFolder(folder.folder_id);
                    setShowMenu(false);
                  }}
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default FolderCard;