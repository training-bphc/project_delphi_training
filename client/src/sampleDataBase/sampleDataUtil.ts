// Utility to load and filter sampleData.json for different tabs
// Usage: import { getAllRows, getPendingRows, getVerifiedRows } from "../../sampleDataBase/sampleDataUtil";

export async function getAllRows() {
  const res = await fetch("/src/sampleDataBase/sampleData.json");
  return res.json();
}

export async function getPendingRows() {
  const all = await getAllRows();
  return all.filter((row: any) => row.verification_status === "Pending");
}

export async function getVerifiedRows() {
  const all = await getAllRows();
  return all.filter((row: any) => row.verification_status === "Verified");
}
