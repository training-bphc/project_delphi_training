import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function createFolderSlug(folderName: string, folderId: number): string {
  const slug = folderName
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
  return `${slug}-folderId:${folderId}`;
}

export function extractFolderIdFromSlug(slug: string): number | null {
  const match = slug.match(/folderId:(\d+)$/);
  if (!match) return null;
  const folderId = parseInt(match[1], 10);
  return isNaN(folderId) ? null : folderId;
}

