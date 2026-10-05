"use client";
import { openDB } from "idb";
export type Draft = {
  id: string;
  user: string;
  project: string;
  data: Record<string, unknown>;
  files: File[];
  updated: string;
};
async function db() {
  return openDB("pfm-drafts", 1, {
    upgrade(db) {
      db.createObjectStore("drafts", { keyPath: "id" });
    },
  });
}
export async function saveDraft(draft: Draft) {
  return (await db()).put("drafts", draft);
}
export async function drafts(user: string) {
  return ((await (await db()).getAll("drafts")) as Draft[]).filter(
    (d) => d.user === user,
  );
}
export async function deleteDraft(id: string) {
  return (await db()).delete("drafts", id);
}
export async function clearDrafts() {
  return (await db()).clear("drafts");
}
