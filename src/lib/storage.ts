"use client";
import { supabaseBrowser } from "@/lib/supabase/browser";
export async function uploadDocument(
  project: string,
  entity: string,
  id: string,
  file: File,
  type: string,
) {
  if (
    file.size > 20 * 1024 * 1024 ||
    !["application/pdf", "image/jpeg", "image/png", "image/webp"].includes(
      file.type,
    )
  )
    throw new Error("Use a PDF, JPEG, PNG or WebP file under 20 MiB.");
  const bytes = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  const valid =
    file.type === "application/pdf"
      ? String.fromCharCode(...bytes.slice(0, 5)) === "%PDF-"
      : file.type === "image/jpeg"
        ? bytes[0] === 255 && bytes[1] === 216
        : file.type === "image/png"
          ? bytes[0] === 137 && bytes[1] === 80 && bytes[2] === 78
          : String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" &&
            String.fromCharCode(...bytes.slice(8, 12)) === "WEBP";
  if (!valid) throw new Error("The file content does not match its type.");
  const c = supabaseBrowser();
  const { data: meta, error } = await c.rpc("begin_upload", {
    p_project: project,
    p_entity_type: entity,
    p_entity_id: id,
    p_document_type: type,
    p_filename: file.name,
    p_mime: file.type,
    p_size: file.size,
  });
  if (error) throw new Error("You cannot upload to this record.");
  const uploaded = await c.storage
    .from("project-documents")
    .upload(meta.path, file, { upsert: false, contentType: file.type });
  if (uploaded.error)
    throw new Error(
      "Upload failed. Your record is saved; retry the receipt upload from its page.",
    );
  const finished = await c.rpc("finish_upload", { p_id: meta.id });
  if (finished.error) throw new Error("Upload verification failed.");
  return meta.id as string;
}
