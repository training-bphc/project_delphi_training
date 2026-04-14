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

  return (
    <div className={styles.resourceCard}>
      <div className={styles.resourceHeader}>
        <div className={styles.resourceLinkWrapper}>
          <a
            className={styles.resourceLink}
            href={resource.file_url}
            target="_blank"
            rel="noopener noreferrer"
            title={resource.resource_name}
          >
            �� {resource.resource_name}
          </a>
          <span className={styles.resourceHost} title={resource.file_url}>
            {getHostname(resource.file_url)}
          </span>
        </div>

        {canManage && (
          <div className={styles.relative} ref={menuRef}>
            <button
              className={styles.iconBtn}
              onClick={() => setShowMenu(!showMenu)}
              title="More options"
            >
              ⋮
            </button>

            {showMenu && (
              <div className={styles.contextMenu}>
                <button
                  className={styles.contextMenuItem}
                  onClick={() => {
                    onRename(resource.resource_id, resource.resource_name);
                    setShowMenu(false);
                  }}
                >
                  Rename
                </button>
                <button
                  className={styles.contextMenuItem}
                  onClick={() => {
                    onUpdateUrl(resource.resource_id, resource.file_url);
                    setShowMenu(false);
                  }}
                >
                  Update URL
                </button>
                <button
                  className={`${styles.contextMenuItem} ${styles.destructive}`}
                  onClick={() => {
                    onDelete(resource.resource_id);
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

export default ResourceCard;