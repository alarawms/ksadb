"use client";
export interface CollectionItem {
  accession: string;
  type: "run";
  fastq_ftp: string | null;
  fastq_md5: string | null;
  fastq_bytes: number;
  organism: string | null;
  country: string | null;
}
const KEY = "ksadb-collection-v2";
export function loadCollection(): CollectionItem[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(window.localStorage.getItem(KEY) ?? "[]"); } catch { return []; }
}
export function saveCollection(items: CollectionItem[]): void {
  window.localStorage.setItem(KEY, JSON.stringify(items));
}
export function toggleItem(items: CollectionItem[], item: CollectionItem): CollectionItem[] {
  return items.some((i) => i.accession === item.accession)
    ? items.filter((i) => i.accession !== item.accession)
    : [...items, item];
}
// Add-only accumulation: append items whose accession is not already present,
// never remove (used by "Add all runs to collection").
export function addItems(items: CollectionItem[], toAdd: CollectionItem[]): CollectionItem[] {
  const present = new Set(items.map((i) => i.accession));
  return [...items, ...toAdd.filter((i) => !present.has(i.accession))];
}
export function collectionBytes(items: CollectionItem[]): number {
  return items.reduce((n, i) => n + (i.fastq_bytes || 0), 0);
}
