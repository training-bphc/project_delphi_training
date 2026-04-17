import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import styles from "./AddResourceModal.module.css";

interface AddResourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; url?: string }) => void;
  title: string;
  isFolder?: boolean;
}

function AddResourceModal({
  isOpen,
  onClose,
  onSubmit,
  title,
  isFolder = false,
}: AddResourceModalProps) {
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");

  const handleSubmit = () => {
    if (!name.trim()) return;
    if (!isFolder && !url.trim()) return;

    onSubmit({
      name: name.trim(),
      url: url.trim() || undefined,
    });

    setName("");
    setUrl("");
    onClose();
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setName("");
      setUrl("");
      onClose();
    }
  };

  const isValid = name.trim() && (isFolder || url.trim());

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className={styles.dialogContent}>
        <DialogHeader className={styles.header}>
          <DialogTitle className={styles.title}>{title}</DialogTitle>
        </DialogHeader>

        <div className={styles.content}>
          <div className={styles.fieldGroup}>
            <label className={styles.label}>
              {isFolder ? "Folder Name" : "Resource Name"}
            </label>
            <Input
              placeholder={
                isFolder ? "Enter folder name" : "Enter resource name"
              }
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && isValid) handleSubmit();
              }}
              className={styles.input}
              autoFocus
            />
          </div>

          {!isFolder && (
            <div className={styles.fieldGroup}>
              <label className={styles.label}>
                Resource URL
              </label>
              <Input
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && isValid) handleSubmit();
                }}
                className={styles.input}
              />
            </div>
          )}
        </div>

        <DialogFooter className={styles.footer}>
          <Button
            variant="outline"
            onClick={onClose}
            className={styles.buttonCancel}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!isValid}
            className={styles.buttonSubmit}
          >
            {isFolder ? "Create Folder" : "Add Resource"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default AddResourceModal;

