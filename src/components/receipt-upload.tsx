"use client";
import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { Camera, FileText, Check, Upload, Trash2 } from "lucide-react";
function ReceiptPreview({
  file,
  replace,
  remove,
}: {
  file: File;
  replace: () => void;
  remove: () => void;
}) {
  const [url, setUrl] = useState("");
  useEffect(() => {
    const reader = new FileReader();
    reader.onload = () => setUrl(String(reader.result));
    reader.readAsDataURL(file);
    return () => {
      reader.onload = null;
      if (reader.readyState === FileReader.LOADING) reader.abort();
    };
  }, [file]);
  return (
    <div className="receipt-preview motion-scale-in">
      {file.type.startsWith("image/") && url ? (
        <Image
          unoptimized
          src={url}
          alt={`Selected receipt: ${file.name}`}
          width={136}
          height={80}
        />
      ) : (
        <FileText size={26} />
      )}
      <strong>{file.name}</strong>
      <small className="row" style={{ color: "var(--positive)" }}>
        <Check size={13} />
        Ready to upload
      </small>
      <div className="row">
        {url && (
          <a className="button" href={url} target="_blank" rel="noopener">
            View
          </a>
        )}
        <button type="button" onClick={replace}>
          Replace
        </button>
        <button
          type="button"
          aria-label={`Remove ${file.name}`}
          onClick={remove}
        >
          <Trash2 size={12} />
        </button>
      </div>
    </div>
  );
}
export function ReceiptUpload({
  files,
  onChange,
}: {
  files: File[];
  onChange: (files: File[]) => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  const replacement = useRef<number | null>(null);
  return (
    <>
      <label className="receipt-upload">
        <Camera size={24} />
        <strong>Add a receipt</strong>
        <small>Take a photo or upload a file. No automatic extraction.</small>
        <input
          ref={input}
          aria-label="Receipt or invoice"
          type="file"
          accept="image/jpeg,image/png,image/webp,application/pdf"
          capture="environment"
          multiple
          onChange={(e) => {
            const selected = Array.from(e.target.files || []);
            if (!selected.length) return;
            onChange(
              replacement.current === null
                ? selected
                : files.map((file, index) =>
                    index === replacement.current ? selected[0] : file,
                  ),
            );
            replacement.current = null;
            e.target.value = "";
          }}
        />
        <span className="row">
          <Upload size={14} />
          <span style={{ fontSize: 11 }}>
            JPEG, PNG, WebP or PDF · up to 20 MiB
          </span>
        </span>
      </label>
      {files.length > 0 && (
        <div className="receipt-preview-list">
          {files.map((f, i) => (
            <ReceiptPreview
              file={f}
              key={f.name + i}
              replace={() => {
                replacement.current = i;
                input.current?.click();
              }}
              remove={() => onChange(files.filter((_, j) => j !== i))}
            />
          ))}
        </div>
      )}
    </>
  );
}
