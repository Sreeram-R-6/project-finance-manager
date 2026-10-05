"use client";
import { format } from "date-fns";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { parseMoney, lineTotal, moneyInput, formatMoney } from "@/lib/money";
import type { Row } from "@/lib/domain";
import { tables } from "@/lib/sections";
import { saveDraft } from "@/lib/offline";
import { uploadDocument } from "@/lib/storage";
import { purchasePayload } from "@/lib/purchase-input";
import { schema } from "@/lib/entry-schema";
import { ItemFields } from "./item-fields";
import { ReceiptUpload } from "./receipt-upload";
import { PersonChip, MoneyAmount } from "./design-system";
import { Check, LoaderCircle, Wallet, UserRound, Users } from "lucide-react";
type Values = z.infer<typeof schema>;
export async function operation(
  project: string,
  action: string,
  data: Record<string, unknown>,
) {
  const response = await fetch(`/api/projects/${project}/mutate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, data }),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || "Unable to save.");
  return result.id as string;
}
export function EntryForm({
  project,
  section,
  currency,
  lookups,
  user,
  initial,
  recordId,
  recordVersion,
}: {
  project: string;
  section: string;
  currency: string;
  lookups: Record<string, Row[]>;
  user: string;
  initial?: Partial<Values>;
  recordId?: string;
  recordVersion?: number;
}) {
  const router = useRouter();
  const [commandKey] = useState(() => crypto.randomUUID());
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const {
    register,
    control,
    handleSubmit,
    getValues,
    setValue,
    formState: { isSubmitting },
  } = useForm<z.input<typeof schema>, unknown, Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      date: format(new Date(), "yyyy-MM-dd"),
      amount: "0",
      member_user_id: user,
      purchased_by_user_id: user,
      source_type: "PROJECT_ACCOUNT",
      type: "FUNDING",
      items: [
        {
          description: "",
          quantity: "1",
          price: "0",
          tax: "0",
          discount: "0",
          asset: false,
        },
      ],
      allocations: [
        {
          source_type: "PROJECT_ACCOUNT",
          target: String(
            lookups.financial_accounts?.find((a) => a.account_type === "BANK")
              ?.id || "",
          ),
          amount: "0",
        },
      ],
      ...initial,
    },
  });
  const items = useFieldArray({ control, name: "items" });
  const splits = useFieldArray({ control, name: "allocations" });
  const values = useWatch({ control }) as Values;
  let total = 0n;
  try {
    total = (values.items || []).reduce(
      (sum, i) =>
        sum +
        lineTotal(
          i.quantity,
          parseMoney(i.price),
          parseMoney(i.tax),
          parseMoney(i.discount),
        ),
      0n,
    );
  } catch {}
  useEffect(() => {
    if (section === "purchases" && splits.fields.length === 1 && !recordId) {
      try {
        setValue(
          "allocations.0.amount",
          moneyInput(total + parseMoney(values.shipping || "0")),
        );
      } catch {}
    }
  }, [
    section,
    total,
    values.shipping,
    splits.fields.length,
    recordId,
    setValue,
  ]);
  const choices = (table: string) => lookups[table] || [];
  const options = (table: string, filter?: (r: Row) => boolean) =>
    (filter ? choices(table).filter(filter) : choices(table)).map((r) => (
      <option
        key={String(r.id)}
        value={String(table === "project_members" ? r.user_id : r.id)}
      >
        {String(
          (table === "purchase_funding_allocations"
            ? `${lookups.purchase_items?.find((item) => item.purchase_id === r.purchase_id)?.description || "Personal purchase"} - ${formatMoney(String(r.amount_minor || "0"), currency)}`
            : "") ||
            r.name ||
            r.title ||
            r.purpose ||
            r.full_name ||
            lookups.profiles?.find((p) => p.id === r.user_id)?.full_name ||
            r.user_id ||
            r.source_type ||
            r.id,
        )}
      </option>
    ));
  async function submit(v: Values) {
    setError("");
    try {
      let id: string;
      const clean = (o: Record<string, unknown>) =>
        Object.fromEntries(
          Object.entries(o).filter(([, value]) => value !== ""),
        );
      if (section === "purchases") {
        const data = {
          ...purchasePayload(v),
          ...(recordId ? { id: recordId, version: recordVersion } : {}),
        };
        id = await operation(project, "purchase", data);
      } else if (section === "transactions") {
        id = await operation(
          project,
          "post",
          clean({
            type: v.type,
            idempotency_key: commandKey,
            amount_minor: parseMoney(v.amount).toString(),
            account_id: v.type === "ADJUSTMENT" ? undefined : v.account_id,
            source_id: v.source_id,
            description: v.description,
            reason: v.notes,
            ...(v.type === "ADJUSTMENT"
              ? {
                  entries: [
                    {
                      account_id: v.account_id,
                      direction: "DEBIT",
                      amount_minor: parseMoney(v.amount).toString(),
                    },
                    {
                      account_id: v.advance_id,
                      direction: "CREDIT",
                      amount_minor: parseMoney(v.amount).toString(),
                    },
                  ],
                }
              : {}),
            category_id: v.category_id,
            member_user_id: v.member_user_id,
            date: v.date,
            destination_account_id: v.advance_id,
          }),
        );
      } else {
        let data: Record<string, unknown> = clean({
          ...v,
          ...(recordId ? { id: recordId } : {}),
          total_minor: parseMoney(v.amount).toString(),
          estimated_minor: parseMoney(v.amount).toString(),
          sanctioned_amount_minor: parseMoney(v.amount).toString(),
          name: v.name || v.title || v.description,
          reason: v.notes,
          items: undefined,
          allocations: undefined,
        });
        if (section === "bills" && v.items.some((i) => i.description.trim())) {
          const lines = v.items.filter((i) => i.description.trim());
          data.total_minor = lines
            .reduce(
              (n, i) =>
                n +
                lineTotal(
                  i.quantity,
                  parseMoney(i.price),
                  parseMoney(i.tax),
                  parseMoney(i.discount),
                ),
              0n,
            )
            .toString();
          data.tax_minor = lines
            .reduce((n, i) => n + parseMoney(i.tax), 0n)
            .toString();
          data.items = lines.map((i) => ({
            description: i.description,
            quantity: i.quantity,
            unit_price_minor: parseMoney(i.price).toString(),
            tax_minor: parseMoney(i.tax).toString(),
            discount_minor: parseMoney(i.discount).toString(),
          }));
        }
        if (section === "reimbursements")
          data = {
            member_user_id: v.member_user_id,
            notes: v.notes,
            items: v.allocations.map((a) => ({
              allocation_id: a.target,
              amount_minor: parseMoney(a.amount).toString(),
            })),
          };
        if (section === "budgets")
          data = {
            name: v.name,
            start_date: v.start_date,
            end_date: v.end_date,
            lines: [
              {
                category_id: v.category_id,
                planned_minor: parseMoney(v.amount).toString(),
              },
            ],
          };
        id = await operation(project, tables[section], data);
      }
      for (const file of files)
        await uploadDocument(project, tables[section], id, file, "receipt");
      router.push(`/app/projects/${project}/${section}/${id}`);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to save.");
    }
  }
  const money = (
    <label>
      Amount ({currency})
      <input {...register("amount")} inputMode="decimal" required />
    </label>
  );
  return (
    <form className="panel entry-form" onSubmit={handleSubmit(submit)}>
      {section === "purchases" ? (
        <>
          <div className="form-section">
            <div>
              <div className="form-step">01 / The purchase</div>
              <h2>What did you spend it on?</h2>
            </div>
            <ItemFields
              register={register}
              fields={items.fields}
              add={() =>
                items.append({
                  description: "",
                  quantity: "1",
                  price: "0",
                  tax: "0",
                  discount: "0",
                  asset: false,
                })
              }
              remove={items.remove}
            />
            <div className="row between">
              <span className="muted">Items total</span>
              <MoneyAmount
                value={total}
                currency={currency}
                className="metric"
              />
            </div>
          </div>
          <div className="form-section">
            <div>
              <div className="form-step">02 / Who paid</div>
              <h2>Where did the money come from?</h2>
            </div>
            <div className="purchase-choices">
              {[
                { type: "PROJECT_ACCOUNT", label: "Project", icon: Wallet },
                { type: "MEMBER", label: "Me", icon: UserRound },
                { type: "OTHER_MEMBER", label: "Someone else", icon: Users },
              ].map(({ type, label, icon: Icon }) => (
                <button
                  type="button"
                  key={type}
                  className={
                    splits.fields.length === 1 &&
                    values.allocations?.[0]?.source_type ===
                      (type === "OTHER_MEMBER" ? "MEMBER" : type) &&
                    (type !== "MEMBER" ||
                      values.allocations?.[0]?.target === user) &&
                    (type !== "OTHER_MEMBER" ||
                      values.allocations?.[0]?.target !== user)
                      ? "selected"
                      : ""
                  }
                  onClick={() => {
                    const target =
                      type === "PROJECT_ACCOUNT"
                        ? String(
                            lookups.financial_accounts?.find(
                              (a) => a.account_type === "BANK",
                            )?.id || "",
                          )
                        : type === "MEMBER"
                          ? user
                          : String(
                              lookups.project_members?.find(
                                (m) => m.user_id !== user,
                              )?.user_id || "",
                            );
                    let value = "0";
                    try {
                      value = moneyInput(
                        total + parseMoney(values.shipping || "0"),
                      );
                    } catch {}
                    splits.replace([
                      {
                        source_type: type === "OTHER_MEMBER" ? "MEMBER" : type,
                        target,
                        amount: value,
                      },
                    ]);
                  }}
                >
                  <Icon size={15} />
                  {label}
                </button>
              ))}
            </div>
            <details className="disclosure" open={splits.fields.length > 1}>
              <summary>Adjust payer or split payment</summary>
              {splits.fields.map((f, i) => (
                <div
                  className="formgrid"
                  key={f.id}
                  style={{ marginBottom: 18 }}
                >
                  <label>
                    Funding source
                    <select
                      {...register(`allocations.${i}.source_type`)}
                      onChange={(e) => {
                        setValue(
                          `allocations.${i}.source_type`,
                          e.target.value,
                        );
                        setValue(
                          `allocations.${i}.target`,
                          e.target.value === "MEMBER"
                            ? user
                            : e.target.value === "PROJECT_ACCOUNT"
                              ? String(
                                  lookups.financial_accounts?.find(
                                    (a) => a.account_type === "BANK",
                                  )?.id || "",
                                )
                              : "",
                        );
                      }}
                    >
                      <option value="PROJECT_ACCOUNT">Project funds</option>
                      <option value="MEMBER">Paid personally</option>
                      <option value="ADVANCE">Advance funds</option>
                      <option value="EXTERNAL">Sponsor paid directly</option>
                    </select>
                  </label>
                  <label>
                    Payer / source
                    <select {...register(`allocations.${i}.target`)}>
                      <option value="">Choose payer</option>
                      {options(
                        values.allocations[i]?.source_type === "MEMBER"
                          ? "project_members"
                          : values.allocations[i]?.source_type === "ADVANCE"
                            ? "advances"
                            : values.allocations[i]?.source_type === "EXTERNAL"
                              ? "funding_sources"
                              : "financial_accounts",
                        values.allocations[i]?.source_type === "PROJECT_ACCOUNT"
                          ? (r) =>
                              ["BANK", "CASH", "WALLET"].includes(
                                String(r.account_type),
                              )
                          : undefined,
                      )}
                    </select>
                  </label>
                  <label>
                    Split amount
                    <input
                      {...register(`allocations.${i}.amount`)}
                      inputMode="decimal"
                      required
                    />
                  </label>
                  {i > 0 && (
                    <button type="button" onClick={() => splits.remove(i)}>
                      Remove split
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() =>
                  splits.append({
                    source_type: "MEMBER",
                    target: user,
                    amount: "0",
                  })
                }
              >
                Split between payers
              </button>
            </details>
            {values.allocations?.some((a) => a.source_type === "MEMBER") && (
              <div className="personal-notice">
                <PersonChip
                  name={String(
                    lookups.profiles?.find(
                      (p) =>
                        p.id ===
                        values.allocations.find(
                          (a) => a.source_type === "MEMBER",
                        )?.target,
                    )?.full_name || "Team member",
                  )}
                />
                <div>
                  <small>The project will owe this person when completed</small>
                  <MoneyAmount
                    value={(() => {
                      try {
                        return values.allocations
                          .filter(
                            (a) =>
                              a.source_type === "MEMBER" &&
                              a.target ===
                                values.allocations.find(
                                  (a) => a.source_type === "MEMBER",
                                )?.target,
                          )
                          .reduce(
                            (n, a) => n + parseMoney(a.amount || "0"),
                            0n,
                          );
                      } catch {
                        return 0n;
                      }
                    })()}
                    currency={currency}
                  />
                </div>
              </div>
            )}
          </div>
          <div className="form-section">
            <div>
              <div className="form-step">03 / The receipt</div>
              <h2>Keep the proof with the purchase</h2>
            </div>
            <ReceiptUpload files={files} onChange={setFiles} />
          </div>
          <details className="disclosure">
            <summary>More details</summary>
            <div className="stack">
              <div className="formgrid">
                <label>
                  Vendor
                  <select {...register("vendor_id")}>
                    <option value="">Choose vendor</option>
                    {options("vendors")}
                  </select>
                </label>
                <label>
                  Purchase date
                  <input type="date" {...register("date")} />
                </label>
                <label>
                  Invoice number
                  <input {...register("invoice_number")} />
                </label>
                <label>
                  Category
                  <select {...register("category_id")}>
                    <option value="">Choose category</option>
                    {options("categories")}
                  </select>
                </label>
              </div>
              <label>
                Shipping ({currency})
                <input {...register("shipping")} inputMode="decimal" />
              </label>
              <label>
                Purpose
                <input {...register("purpose")} />
              </label>
              <label>
                Tags (comma separated)
                <input {...register("tags")} />
              </label>
              <div className="formgrid">
                <label>
                  Purchased by
                  <select {...register("purchased_by_user_id")}>
                    {options("project_members")}
                  </select>
                </label>
                <label>
                  Payment method
                  <select {...register("payment_method")}>
                    <option value="">Choose method</option>
                    {["UPI", "Bank transfer", "Cash", "Card", "Other"].map(
                      (m) => (
                        <option key={m}>{m}</option>
                      ),
                    )}
                  </select>
                </label>
                <label>
                  Transaction reference
                  <input {...register("transaction_reference")} />
                </label>
              </div>
              <label>
                Approved purchase request
                <select {...register("linked_request_id")}>
                  <option value="">No linked request</option>
                  {options("purchase_requests", (r) => r.status === "approved")}
                </select>
              </label>
            </div>
          </details>
        </>
      ) : section === "transactions" ? (
        <>
          <label>
            What happened?
            <select {...register("type")}>
              <option value="FUNDING">Funding received</option>
              <option value="TRANSFER">
                Transfer between project accounts
              </option>
              <option value="RECOVERY">Member recovery returned</option>
              <option value="ADJUSTMENT">
                Audited balanced adjustment (Owner / Admin)
              </option>
            </select>
          </label>
          <label>
            Description
            <input {...register("description")} required />
          </label>
          {money}
          <label>
            Funding source
            <select {...register("source_id")}>
              <option value="">Choose source</option>
              {options("funding_sources")}
            </select>
          </label>
          <label>
            {values.type === "ADJUSTMENT"
              ? "Debit account"
              : "Project cash account"}
            <select {...register("account_id")}>
              <option value="">Choose account</option>
              {options(
                "financial_accounts",
                (r) =>
                  values.type === "ADJUSTMENT" ||
                  ["BANK", "CASH", "WALLET"].includes(String(r.account_type)),
              )}
            </select>
          </label>
          {["TRANSFER", "ADJUSTMENT"].includes(values.type || "") && (
            <label>
              Destination / credit account
              <select {...register("advance_id")}>
                <option value="">Choose destination</option>
                {options(
                  "financial_accounts",
                  (r) =>
                    values.type === "ADJUSTMENT" ||
                    ["BANK", "CASH", "WALLET"].includes(String(r.account_type)),
                )}
              </select>
            </label>
          )}
          {values.type === "RECOVERY" && (
            <label>
              Member
              <select {...register("member_user_id")}>
                {options("project_members")}
              </select>
            </label>
          )}
          <label>
            Date
            <input type="date" {...register("date")} />
          </label>
        </>
      ) : section === "reimbursements" ? (
        <>
          <label>
            Who are you reimbursing?
            <select {...register("member_user_id")}>
              {options("project_members")}
            </select>
          </label>
          {splits.fields.map((f, i) => (
            <div className="formgrid" key={f.id}>
              <label>
                Expense to include
                <select {...register(`allocations.${i}.target`)}>
                  <option value="">Choose expense</option>
                  {options(
                    "purchase_funding_allocations",
                    (r) =>
                      r.source_type === "MEMBER" &&
                      r.member_user_id === values.member_user_id,
                  )}
                </select>
              </label>
              <label>
                Amount to reimburse
                <input
                  {...register(`allocations.${i}.amount`)}
                  inputMode="decimal"
                />
              </label>
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              splits.append({ source_type: "MEMBER", target: "", amount: "0" })
            }
          >
            Add another expense
          </button>
        </>
      ) : (
        <>
          <label>
            {section === "advances"
              ? "Purpose"
              : section === "requests"
                ? "Request title"
                : "Name / description"}
            <input
              {...register(
                section === "advances"
                  ? "purpose"
                  : section === "requests"
                    ? "title"
                    : "name",
              )}
              required
            />
          </label>
          {["bills", "requests", "budgets", "advances"].includes(section) &&
            money}
          {section === "bills" && (
            <details>
              <summary>Itemize this bill (optional)</summary>
              <p className="muted">
                If items are entered, their exact total replaces the amount
                above.
              </p>
              <ItemFields
                register={register}
                fields={items.fields}
                assets={false}
                add={() =>
                  items.append({
                    description: "",
                    quantity: "1",
                    price: "0",
                    tax: "0",
                    discount: "0",
                    asset: false,
                  })
                }
                remove={items.remove}
              />
            </details>
          )}
          {section === "bills" && (
            <>
              <label>
                Vendor
                <select {...register("vendor_id")}>
                  <option value="">Choose vendor</option>
                  {options("vendors")}
                </select>
              </label>
              <label>
                Due date
                <input type="date" {...register("due_date")} required />
              </label>
              <details className="disclosure">
                <summary>More bill details</summary>
                <div className="formgrid">
                  {" "}
                  <label>
                    Approved purchase request
                    <select {...register("linked_request_id")}>
                      <option value="">No request</option>
                      {options(
                        "purchase_requests",
                        (r) => r.status === "approved",
                      )}
                    </select>
                  </label>
                  <label>
                    Invoice number
                    <input {...register("invoice_number")} />
                  </label>
                  <label>
                    Issue date
                    <input type="date" {...register("date")} required />
                  </label>
                </div>
              </details>
            </>
          )}
          {["bills", "budgets", "requests"].includes(section) && (
            <label>
              Category
              <select {...register("category_id")}>
                <option value="">Choose category</option>
                {options("categories")}
              </select>
            </label>
          )}
          {section === "advances" && (
            <label>
              Member
              <select {...register("member_user_id")}>
                {options("project_members")}
              </select>
            </label>
          )}
          {section === "budgets" && (
            <div className="formgrid">
              <label>
                Start date
                <input type="date" {...register("start_date")} required />
              </label>
              <label>
                End date
                <input type="date" {...register("end_date")} required />
              </label>
            </div>
          )}
        </>
      )}
      {["purchases", "bills"].includes(section) && (
        <details className="disclosure">
          <summary>Correct a previous transaction</summary>
          <label>
            Corrects a reversed event (optional)
            <select {...register("corrects_event_id")}>
              <option value="">New financial record</option>
              {options(
                "financial_events",
                (e) =>
                  e.status === "REVERSED" &&
                  e.event_type ===
                    (section === "purchases" ? "PURCHASE" : "BILL"),
              )}
            </select>
            <small>
              Enter the correction reason in Notes. Posted corrections retain
              the link to the original event.
            </small>
          </label>
        </details>
      )}
      <label>
        Notes
        <textarea {...register("notes")} rows={3} />
      </label>
      {error && (
        <div role="alert" className="error">
          {error}
        </div>
      )}
      {notice && (
        <div role="status" className="success">
          {notice}
        </div>
      )}
      <div className="form-footer">
        <button className="primary" disabled={isSubmitting}>
          {isSubmitting ? (
            <LoaderCircle className="loading-icon" size={16} />
          ) : (
            <Check size={16} />
          )}
          {section === "transactions" ? "Complete transaction" : "Save draft"}
        </button>
        {section === "purchases" && (
          <button
            type="button"
            onClick={async () => {
              try {
                await saveDraft({
                  id: crypto.randomUUID(),
                  user,
                  project,
                  data: getValues(),
                  files,
                  updated: new Date().toISOString(),
                });
                setNotice(
                  "Draft saved on this device. Review it online before posting.",
                );
              } catch {
                setError("Device storage is unavailable or full.");
              }
            }}
          >
            Save on device
          </button>
        )}
      </div>
    </form>
  );
}
