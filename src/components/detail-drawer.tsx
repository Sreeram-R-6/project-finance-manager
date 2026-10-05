"use client";
import * as Dialog from "@radix-ui/react-dialog";
import { useEffect, useState } from "react";
import Link from "next/link";
import { X, ArrowUpRight, FileText } from "lucide-react";
import type { Row } from "@/lib/domain";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { tables } from "@/lib/sections";
import { StatusBadge, MoneyAmount } from "./design-system";
import { recordTitle, fieldLabel, sourceLabels } from "./page-copy";
export function DetailDrawer({
  row,
  base,
  currency,
  onClose,
}: {
  row: Row | null;
  base: string;
  currency: string;
  onClose: () => void;
}) {
  const [details, setDetails] = useState<{
    items: Row[];
    documents: Row[];
    position: Record<string, unknown>;
  } | null>(null);
  const [error, setError] = useState("");
  const project = base.split("/")[3];
  const section = base.split("/")[4];
  useEffect(() => {
    if (!row) return;
    let active = true;
    const c = supabaseBrowser();
    Promise.all([
      c.rpc("project_records", {
        p_project: project,
        p_table: section === "bills" ? "bill_items" : "purchase_items",
        p_search: String(row.id),
        p_limit: 50,
      }),
      c
        .from("documents")
        .select("id,original_filename,storage_bucket,storage_path,status")
        .eq("project_id", project)
        .eq("entity_id", row.id),
      ["purchases", "bills", "reimbursements", "advances"].includes(section)
        ? c.rpc("record_position", {
            p_project: project,
            p_table: tables[section],
            p_id: row.id,
          })
        : Promise.resolve({ data: {}, error: null }),
    ]).then(([items, documents, position]) => {
      if (active) {
        setDetails({
          items: items.data?.rows || [],
          documents: documents.data || [],
          position: position.data || {},
        });
        setError(
          documents.error || position.error
            ? "Some details could not be loaded. Open the full record to retry."
            : "",
        );
      }
    });
    return () => {
      active = false;
    };
  }, [row, project, section]);
  return (
    <Dialog.Root
      open={!!row}
      onOpenChange={(open) => {
        if (!open) {
          setDetails(null);
          onClose();
        }
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay" />
        <Dialog.Content className="dialog-content drawer-content">
          <Dialog.Close asChild>
            <button
              className="icon-button dialog-close"
              aria-label="Close details"
            >
              <X size={19} />
            </button>
          </Dialog.Close>
          <div className="eyebrow">Quick look</div>
          <Dialog.Title className="dialog-title" style={{ marginTop: 12 }}>
            {row ? recordTitle(row) : "Record"}
          </Dialog.Title>
          <Dialog.Description className="dialog-description">
            A few useful details, without leaving your place.
          </Dialog.Description>
          {row && (
            <>
              <StatusBadge status={String(row.status || "Record")} />
              {(row.transaction_total_minor ||
                row.total_minor ||
                row.requested_minor ||
                row.amount_minor ||
                row.estimated_minor) && (
                <div className="drawer-amount">
                  <MoneyAmount
                    value={String(
                      row.transaction_total_minor ||
                        row.total_minor ||
                        row.requested_minor ||
                        row.amount_minor ||
                        row.estimated_minor,
                    )}
                    currency={currency}
                  />
                </div>
              )}
              <dl>
                {[
                  "vendor_name",
                  "payer_label",
                  "purchase_date",
                  "due_date",
                  "event_date",
                  "invoice_number",
                ]
                  .filter((k) => row[k])
                  .map((k) => (
                    <div key={k}>
                      <dt>
                        {k === "vendor_name"
                          ? "Vendor"
                          : k === "payer_label"
                            ? "Who paid"
                            : fieldLabel(k)}
                      </dt>
                      <dd>{String(row[k])}</dd>
                    </div>
                  ))}
              </dl>
              {details ? (
                <div className="stack" style={{ marginTop: 24 }}>
                  {details.items.length > 0 && (
                    <section>
                      <h3>What was bought</h3>
                      {details.items.map((i) => (
                        <div className="timeline-row" key={String(i.id)}>
                          <span>
                            <strong>{String(i.description)}</strong>
                            <small>Quantity {String(i.quantity)}</small>
                          </span>
                          <MoneyAmount
                            value={String(i.line_total_minor || "0")}
                            currency={currency}
                          />
                        </div>
                      ))}
                    </section>
                  )}
                  {Array.isArray(details.position.allocations) && (
                    <section>
                      <h3>Who paid</h3>
                      {(details.position.allocations as Row[]).map((a) => (
                        <div
                          className="row between"
                          style={{ padding: "10px 0" }}
                          key={String(a.id)}
                        >
                          <span>
                            {sourceLabels[String(a.source_type)] ||
                              String(a.source_type)}
                          </span>
                          <MoneyAmount
                            value={String(a.amount_minor)}
                            currency={currency}
                          />
                        </div>
                      ))}
                    </section>
                  )}
                  <section>
                    <h3>Receipts & documents</h3>
                    {details.documents
                      .filter((d) => d.status === "ready")
                      .map((d) => (
                        <button
                          className="row"
                          key={String(d.id)}
                          style={{ marginTop: 10 }}
                          onClick={async () => {
                            const result = await supabaseBrowser()
                              .storage.from(String(d.storage_bucket))
                              .createSignedUrl(String(d.storage_path), 60);
                            if (result.data)
                              window.open(
                                result.data.signedUrl,
                                "_blank",
                                "noopener",
                              );
                            else setError("This document could not be opened.");
                          }}
                        >
                          <FileText size={16} />
                          {String(d.original_filename)}
                        </button>
                      ))}
                    {!details.documents.some((d) => d.status === "ready") && (
                      <p
                        className="muted"
                        style={{ fontSize: 12, marginTop: 8 }}
                      >
                        No uploaded documents yet.
                      </p>
                    )}
                  </section>
                </div>
              ) : (
                <div
                  className="skeleton"
                  style={{ height: 160, marginTop: 24 }}
                />
              )}
              {error && (
                <p role="alert" className="error" style={{ marginTop: 20 }}>
                  {error}
                </p>
              )}
              <Link
                className="button primary"
                style={{ marginTop: 30 }}
                href={`${base}/${row.id}`}
                onClick={onClose}
              >
                Open full record
                <ArrowUpRight size={16} />
              </Link>
            </>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
