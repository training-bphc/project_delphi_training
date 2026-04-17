import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import styles from "./ResourceModal.module.css";

interface FolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: string) => void;
  title: string;
  placeholder?: string;
  defaultValue?: string;
  isDangerous?: boolean;
  isDeleteConfirmation?: boolean;
}

export default function FolderModal({
  isOpen,
  onClose,
  onSubmit,
  title,
  placeholder = "",
  defaultValue = "",
  isDangerous = false,
  isDeleteConfirmation = false,
}: FolderModalProps) {
  const [value, setValue] = useState(defaultValue);

  useEffect(() => {
    setValue(defaultValue);
  }, [defaultValue, isOpen]);

  const handleSubmit = () => {
    if (isDeleteConfirmation) {
      onSubmit("");
      onClose();
      return;
    }

    if (!value.trim()) return;
    if (value === defaultValue) return;

    onSubmit(value.trim());
    setValue(defaultValue);
    onClose();
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setValue(defaultValue);
      onClose();
    }
  };

  const isValid = isDeleteConfirmation ? true : value.trim() && value !== defaultValue;

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className={styles.dialogContent}>
        <DialogHeader className={styles.header}>
          <DialogTitle className={styles.title}>{title}</DialogTitle>
        </DialogHeader>

        <div className={styles.content}>
          {!isDeleteConfirmation && (
            <div className={styles.fieldGroup}>
              <Input
                placeholder={placeholder}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && isValid) handleSubmit();
                }}
                className={styles.input}
                autoFocus
              />
            </div>
          )}
          {isDeleteConfirmation && (
            <p className={styles.confirmationText}>
              Are you sure you want to delete this folder? It must be empty. This action cannot be undone.
            </p>
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
            className={isDangerous ? styles.buttonDangerous : styles.buttonSubmit}
          >
            {isDangerous ? "Delete Folder" : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
