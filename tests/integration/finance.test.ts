import { beforeAll, describe, it, expect } from "vitest";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { loadEnvFile } from "node:process";
try {
  loadEnvFile(".env.local");
} catch {}
const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "http://127.0.0.1:54321";
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
let owner: SupabaseClient;
let member: SupabaseClient;
let viewer: SupabaseClient;
let outsider: SupabaseClient;
let project: string;
let account: string;
let category: string;
async function login(email: string) {
  const c = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { error } = await c.auth.signInWithPassword({
    email,
    password: "LocalDemo-Only-2026!",
  });
  if (error) throw error;
  return c;
}
async function rpc(
  c: SupabaseClient,
  name: string,
  args: Record<string, unknown>,
) {
  const { data, error } = await c.rpc(name, args);
  if (error) throw new Error(name + ": " + error.message);
  return data;
}
async function post(
  type: string,
  source: string,
  amount?: string,
  extra: Record<string, unknown> = {},
) {
  return rpc(owner, "post_financial", {
    p_project: project,
    p_command: {
      type,
      source_id: source,
      idempotency_key: crypto.randomUUID(),
      ...(amount ? { amount_minor: amount, account_id: account } : {}),
      ...extra,
    },
  });
}
async function summary() {
  return rpc(owner, "project_summary", { p_project: project });
}
async function purchase(
  allocations: Record<string, unknown>[],
  total = "10000",
) {
  return rpc(owner, "save_purchase", {
    p_project: project,
    p_data: {
      category_id: category,
      items: [
        {
          description: "Integration item",
          quantity: "1",
          unit_price_minor: total,
        },
      ],
      allocations,
    },
  });
}
describe("real PostgreSQL/RLS financial flows", () => {
  beforeAll(async () => {
    if (!key)
      throw new Error(
        "Start/reset local Supabase and run node scripts/local-env.mjs.",
      );
    [owner, member, viewer, outsider] = await Promise.all(
      ["alex", "rahul", "viewer", "outside"].map((n) =>
        login(n + "@example.test"),
      ),
    );
    project = await rpc(owner, "create_project", {
      p_name: "Integration " + crypto.randomUUID(),
      p_code: "TEST",
      p_opening: "1000000",
    });
    const rows = await rpc(owner, "project_records", {
      p_project: project,
      p_table: "financial_accounts",
    });
    account = rows.rows.find(
      (r: { account_type: string }) => r.account_type === "BANK",
    ).id;
    const cats = await rpc(owner, "project_records", {
      p_project: project,
      p_table: "categories",
    });
    category = cats.rows[0].id;
    for (const [c, role] of [
      [member, "MEMBER"],
      [viewer, "VIEWER"],
    ] as const) {
      const user = (await c.auth.getUser()).data.user!;
      const token = await rpc(owner, "invite_member", {
        p_project: project,
        p_email: user.email,
        p_role: role,
      });
      expect(await rpc(c, "accept_invite", { p_token: token })).toBe(project);
      const again = await c.rpc("accept_invite", { p_token: token });
      expect(again.error).not.toBeNull();
    }
  }, 60000);
  it("isolates projects through direct API and RPC", async () => {
    const { data } = await outsider
      .from("projects")
      .select("id")
      .eq("id", project);
    expect(data).toEqual([]);
    expect(
      (await outsider.rpc("project_summary", { p_project: project })).error,
    ).not.toBeNull();
  });
  it("denies viewer mutation and member posting/escalation", async () => {
    expect(
      (
        await viewer.rpc("save_record", {
          p_project: project,
          p_table: "vendors",
          p_data: { name: "Forbidden" },
        })
      ).error,
    ).not.toBeNull();
    expect(
      (
        await member.rpc("post_financial", {
          p_project: project,
          p_command: { type: "FUNDING", idempotency_key: crypto.randomUUID() },
        })
      ).error,
    ).not.toBeNull();
    expect(
      (
        await member.rpc("change_member", {
          p_project: project,
          p_user: (await member.auth.getUser()).data.user!.id,
          p_role: "OWNER",
        })
      ).error,
    ).not.toBeNull();
  });
  it("posts project-funded purchase and reverses without losing history", async () => {
    const before = await summary();
    const p = await purchase([
      {
        source_type: "PROJECT_ACCOUNT",
        project_account_id: account,
        amount_minor: "10000",
      },
    ]);
    const event = await post("PURCHASE", p);
    const after = await summary();
    expect(BigInt(after.cash)).toBe(BigInt(before.cash) - 10000n);
    expect(BigInt(after.expense)).toBe(BigInt(before.expense) + 10000n);
    await post("REVERSAL", event, undefined, {
      reason: "Integration correction",
    });
    expect((await summary()).cash).toBe(before.cash);
    const { data } = await owner
      .from("financial_events")
      .select("status")
      .eq("id", event);
    expect(data?.[0].status).toBe("REVERSED");
    const replacement = await rpc(owner, "save_purchase", {
      p_project: project,
      p_data: {
        corrects_event_id: event,
        notes: "Corrected purchase amount",
        items: [
          {
            description: "Replacement",
            quantity: "1",
            unit_price_minor: "8000",
          },
        ],
        allocations: [
          {
            source_type: "PROJECT_ACCOUNT",
            project_account_id: account,
            amount_minor: "8000",
          },
        ],
      },
    });
    const corrected = await post("PURCHASE", replacement);
    const link = await owner
      .from("financial_events")
      .select("corrects_event_id")
      .eq("id", corrected)
      .single();
    expect(link.data?.corrects_event_id).toBe(event);
    await post("REVERSAL", corrected, undefined, {
      reason: "Restore test cash",
    });
  });
  it("makes personal entitlement and pays only the partial reimbursement", async () => {
    const user = (await member.auth.getUser()).data.user!.id;
    const before = await summary();
    const p = await purchase(
      [{ source_type: "MEMBER", member_user_id: user, amount_minor: "620000" }],
      "620000",
    );
    await post("PURCHASE", p);
    expect((await summary()).cash).toBe(before.cash);
    const entitlements = await rpc(owner, "member_entitlements", {
      p_project: project,
    });
    const ent = entitlements.find(
      (r: { purchase_id: string }) => r.purchase_id === p,
    );
    expect(ent.outstanding_minor).toBe("620000");
    const claim = await rpc(member, "save_record", {
      p_project: project,
      p_table: "reimbursement_claims",
      p_data: { items: [{ allocation_id: ent.id, amount_minor: "620000" }] },
    });
    await rpc(member, "submit_approval", {
      p_project: project,
      p_table: "reimbursement_claims",
      p_id: claim,
    });
    await post("REIMBURSEMENT", claim, "400000");
    const after = await summary();
    expect(BigInt(after.cash)).toBe(BigInt(before.cash) - 400000n);
    expect(BigInt(after.payable)).toBe(BigInt(before.payable) + 220000n);
    expect(
      (
        await owner.rpc("post_financial", {
          p_project: project,
          p_command: {
            type: "REIMBURSEMENT",
            source_id: claim,
            amount_minor: "220001",
            account_id: account,
            idempotency_key: crypto.randomUUID(),
          },
        })
      ).error,
    ).not.toBeNull();
  });
  it("recognizes a bill once and permits partial payment", async () => {
    const before = await summary();
    const b = await rpc(owner, "save_record", {
      p_project: project,
      p_table: "bills",
      p_data: {
        total_minor: "120000",
        due_date: "2026-12-01",
        category_id: category,
      },
    });
    await post("BILL", b);
    expect((await summary()).cash).toBe(before.cash);
    const expense = (await summary()).expense;
    await post("BILL_PAYMENT", b, "40000");
    const after = await summary();
    expect(after.expense).toBe(expense);
    expect(BigInt(after.bills)).toBe(BigInt(before.bills) + 80000n);
  });
  it("supports exact mixed allocation and rejects invalid posting atomically", async () => {
    const user = (await member.auth.getUser()).data.user!.id;
    const before = await summary();
    const p = await purchase(
      [
        {
          source_type: "PROJECT_ACCOUNT",
          project_account_id: account,
          amount_minor: "12000",
        },
        { source_type: "MEMBER", member_user_id: user, amount_minor: "8000" },
      ],
      "20000",
    );
    await post("PURCHASE", p);
    expect(BigInt((await summary()).cash)).toBe(BigInt(before.cash) - 12000n);
    const invalid = await purchase(
      [
        {
          source_type: "PROJECT_ACCOUNT",
          project_account_id: account,
          amount_minor: "99",
        },
      ],
      "100",
    );
    const snapshot = await summary();
    expect(
      (
        await owner.rpc("post_financial", {
          p_project: project,
          p_command: {
            type: "PURCHASE",
            source_id: invalid,
            idempotency_key: crypto.randomUUID(),
          },
        })
      ).error?.message,
    ).toContain("ALLOCATION_MISMATCH");
    expect(await summary()).toEqual(snapshot);
  });
  it("issues, reconciles and returns an advance", async () => {
    const user = (await member.auth.getUser()).data.user!.id;
    const before = await summary();
    const a = await rpc(owner, "save_record", {
      p_project: project,
      p_table: "advances",
      p_data: { purpose: "Integration advance", member_user_id: user },
    });
    await post("ADVANCE", a, "100000");
    const p = await purchase(
      [{ source_type: "ADVANCE", advance_id: a, amount_minor: "70000" }],
      "70000",
    );
    await post("PURCHASE", p);
    await post("ADVANCE_RETURN", a, "30000");
    const after = await summary();
    expect(after.advances).toBe(before.advances);
    expect(BigInt(after.cash)).toBe(BigInt(before.cash) - 70000n);
  });
  it("posts linked refund and retains gross purchase", async () => {
    const p = await purchase([
      {
        source_type: "PROJECT_ACCOUNT",
        project_account_id: account,
        amount_minor: "10000",
      },
    ]);
    await post("PURCHASE", p);
    const before = await summary();
    await post("REFUND", p, "1500", {
      allocations: [
        {
          destination: "PROJECT_ACCOUNT",
          account_id: account,
          amount_minor: "1500",
        },
      ],
    });
    const after = await summary();
    expect(BigInt(after.cash)).toBe(BigInt(before.cash) + 1500n);
    expect(BigInt(after.expense)).toBe(BigInt(before.expense) - 1500n);
  });
  it("serializes retries and returns the same event", async () => {
    const p = await purchase([
      {
        source_type: "PROJECT_ACCOUNT",
        project_account_id: account,
        amount_minor: "10000",
      },
    ]);
    const command = {
      type: "PURCHASE",
      source_id: p,
      idempotency_key: crypto.randomUUID(),
    };
    const [a, b] = await Promise.all([
      rpc(owner, "post_financial", { p_project: project, p_command: command }),
      rpc(owner, "post_financial", { p_project: project, p_command: command }),
    ]);
    expect(a).toBe(b);
  });
  it("blocks concurrent bill overpayment", async () => {
    const b = await rpc(owner, "save_record", {
      p_project: project,
      p_table: "bills",
      p_data: { total_minor: "10000", due_date: "2026-12-01" },
    });
    await post("BILL", b);
    const results = await Promise.allSettled([
      post("BILL_PAYMENT", b, "7000"),
      post("BILL_PAYMENT", b, "7000"),
    ]);
    expect(results.filter((r) => r.status === "fulfilled")).toHaveLength(1);
  });
  it("enforces sequential assigned approvals and rejects nullable assignee bypass", async () => {
    const user = (await member.auth.getUser()).data.user!.id;
    await rpc(owner, "save_record", {
      p_project: project,
      p_table: "approval_policies",
      p_data: {
        name: "Requests require owner",
        entity_type: "purchase_requests",
        priority: 1,
        rule_json: {
          minimum_minor: "0",
          steps: [{ role: "OWNER" }, { role: "FINANCE_MANAGER" }],
        },
      },
    });
    const token = await rpc(owner, "invite_member", {
      p_project: project,
      p_email: "maya@example.test",
      p_role: "FINANCE_MANAGER",
    });
    const finance = await login("maya@example.test");
    await rpc(finance, "accept_invite", { p_token: token });
    const request = await rpc(member, "save_record", {
      p_project: project,
      p_table: "purchase_requests",
      p_data: { title: "Approval regression", estimated_minor: "1000" },
    });
    const instance = await rpc(member, "submit_approval", {
      p_project: project,
      p_table: "purchase_requests",
      p_id: request,
    });
    const { data: steps } = await owner
      .from("approval_steps")
      .select("*")
      .eq("approval_instance_id", instance)
      .order("step_order");
    expect(
      (
        await member.rpc("decide_approval", {
          p_step: steps![0].id,
          p_decision: "approved",
        })
      ).error,
    ).not.toBeNull();
    expect(
      (
        await finance.rpc("decide_approval", {
          p_step: steps![1].id,
          p_decision: "approved",
        })
      ).error?.message,
    ).toContain("PREVIOUS_APPROVAL_REQUIRED");
    await rpc(owner, "decide_approval", {
      p_step: steps![0].id,
      p_decision: "approved",
    });
    await rpc(finance, "decide_approval", {
      p_step: steps![1].id,
      p_decision: "approved",
    });
    expect(user).toBeTruthy();
  });
  it("protects private storage and validates metadata project ownership", async () => {
    const bytes = new TextEncoder().encode("%PDF-1.4\n%%EOF");
    const record = await rpc(member, "begin_upload", {
      p_project: project,
      p_entity_type: "projects",
      p_entity_id: project,
      p_document_type: "receipt",
      p_filename: "test.pdf",
      p_mime: "application/pdf",
      p_size: bytes.length,
    });
    const uploaded = await member.storage
      .from("project-documents")
      .upload(record.path, bytes, { contentType: "application/pdf" });
    expect(uploaded.error).toBeNull();
    await rpc(member, "finish_upload", { p_id: record.id });
    expect(
      (await viewer.storage.from("project-documents").download(record.path))
        .error,
    ).toBeNull();
    expect(
      (await outsider.storage.from("project-documents").download(record.path))
        .error,
    ).not.toBeNull();
    expect(
      (
        await outsider.storage
          .from("project-documents")
          .upload("projects/" + project + "/receipt/forged.pdf", bytes, {
            contentType: "application/pdf",
          })
      ).error,
    ).not.toBeNull();
    expect(
      (
        await viewer.rpc("begin_upload", {
          p_project: project,
          p_entity_type: "projects",
          p_entity_id: project,
          p_document_type: "receipt",
          p_filename: "forbidden.pdf",
          p_mime: "application/pdf",
          p_size: bytes.length,
        })
      ).error,
    ).not.toBeNull();
    expect(
      (
        await member.rpc("begin_upload", {
          p_project: project,
          p_entity_type: "projects",
          p_entity_id: "20000000-0000-0000-0000-000000000002",
          p_document_type: "receipt",
          p_filename: "cross.pdf",
          p_mime: "application/pdf",
          p_size: bytes.length,
        })
      ).error,
    ).not.toBeNull();
  });
  it("honors hard-stop budgets and closed projects", async () => {
    const isolated = await rpc(owner, "create_project", {
      p_name: "Closure checks",
      p_code: "CLOSE",
    });
    const cats = await rpc(owner, "project_records", {
      p_project: isolated,
      p_table: "categories",
    });
    const accounts = await rpc(owner, "project_records", {
      p_project: isolated,
      p_table: "financial_accounts",
    });
    await rpc(owner, "save_record", {
      p_project: isolated,
      p_table: "budgets",
      p_data: {
        name: "Hard limit",
        start_date: "2020-01-01",
        end_date: "2035-01-01",
        lines: [
          {
            category_id: cats.rows[0].id,
            planned_minor: "100",
            hard_stop: true,
          },
        ],
      },
    });
    const p = await rpc(owner, "save_purchase", {
      p_project: isolated,
      p_data: {
        category_id: cats.rows[0].id,
        items: [
          { description: "Too much", quantity: "1", unit_price_minor: "200" },
        ],
        allocations: [
          {
            source_type: "PROJECT_ACCOUNT",
            project_account_id: accounts.rows.find(
              (a: { account_type: string }) => a.account_type === "BANK",
            ).id,
            amount_minor: "200",
          },
        ],
      },
    });
    expect(
      (
        await owner.rpc("post_financial", {
          p_project: isolated,
          p_command: {
            type: "PURCHASE",
            source_id: p,
            idempotency_key: crypto.randomUUID(),
          },
        })
      ).error?.message,
    ).toContain("BUDGET_EXCEEDED");
    await rpc(owner, "close_project", { p_project: isolated });
    expect(
      (
        await owner.rpc("post_financial", {
          p_project: isolated,
          p_command: {
            type: "PURCHASE",
            source_id: p,
            idempotency_key: crypto.randomUUID(),
          },
        })
      ).error?.message,
    ).toContain("PROJECT_CLOSED");
  });
  it("invites require matching verified email and cannot be reused", async () => {
    const token = await rpc(owner, "invite_member", {
      p_project: project,
      p_email: "outside@example.test",
      p_role: "VIEWER",
    });
    expect(
      (await member.rpc("accept_invite", { p_token: token })).error?.message,
    ).toContain("INVITE_INVALID");
    expect(await rpc(outsider, "accept_invite", { p_token: token })).toBe(
      project,
    );
    expect(
      (await outsider.rpc("accept_invite", { p_token: token })).error?.message,
    ).toContain("INVITE_INVALID");
  });
  it("draft edits keep identity and posted bills cannot be edited", async () => {
    const bill = await rpc(owner, "save_record", {
      p_project: project,
      p_table: "bills",
      p_data: { total_minor: "300", due_date: "2026-12-01", notes: "Draft" },
    });
    expect(
      await rpc(owner, "save_record", {
        p_project: project,
        p_table: "bills",
        p_data: {
          id: bill,
          total_minor: "400",
          due_date: "2026-12-01",
          notes: "Edited",
        },
      }),
    ).toBe(bill);
    await post("BILL", bill);
    expect(
      (
        await owner.rpc("save_record", {
          p_project: project,
          p_table: "bills",
          p_data: { id: bill, total_minor: "500" },
        })
      ).error?.message,
    ).toContain("DRAFT_REQUIRED");
  });
  it("advance refunds restore allocatable funds and returns settle them", async () => {
    const pr = await rpc(owner, "create_project", {
      p_name: "Advance refund",
      p_code: "AR",
      p_opening: "1000",
    });
    const accounts = await rpc(owner, "project_records", {
      p_project: pr,
      p_table: "financial_accounts",
    });
    const bank = accounts.rows.find(
      (a: { account_type: string }) => a.account_type === "BANK",
    ).id;
    const advance = await rpc(owner, "save_record", {
      p_project: pr,
      p_table: "advances",
      p_data: { purpose: "Refund lifecycle", requested_minor: "500" },
    });
    const command = async (
      type: string,
      source: string,
      amount?: string,
      extra: Record<string, unknown> = {},
    ) =>
      rpc(owner, "post_financial", {
        p_project: pr,
        p_command: {
          type,
          source_id: source,
          idempotency_key: crypto.randomUUID(),
          amount_minor: amount,
          account_id: bank,
          ...extra,
        },
      });
    await command("ADVANCE", advance, "500");
    const purchase = await rpc(owner, "save_purchase", {
      p_project: pr,
      p_data: {
        items: [
          {
            description: "Returned advance goods",
            quantity: "1",
            unit_price_minor: "400",
          },
        ],
        allocations: [
          { source_type: "ADVANCE", advance_id: advance, amount_minor: "400" },
        ],
      },
    });
    await command("PURCHASE", purchase);
    await command("REFUND", purchase, "150", {
      allocations: [
        { destination: "ADVANCE", advance_id: advance, amount_minor: "150" },
      ],
    });
    await command("ADVANCE_RETURN", advance, "250");
    expect(
      (await rpc(owner, "project_summary", { p_project: pr })).advances,
    ).toBe("0");
    expect(
      (await rpc(owner, "project_summary", { p_project: pr })).expense,
    ).toBe("250");
  });
  it("an approved but unposted bill cannot be paid", async () => {
    const id = await rpc(owner, "save_record", {
      p_project: project,
      p_table: "bills",
      p_data: { total_minor: "100", due_date: "2026-12-01" },
    });
    await rpc(owner, "submit_approval", {
      p_project: project,
      p_table: "bills",
      p_id: id,
    });
    expect(
      (
        await owner.rpc("post_financial", {
          p_project: project,
          p_command: {
            type: "BILL_PAYMENT",
            source_id: id,
            amount_minor: "100",
            account_id: account,
            idempotency_key: crypto.randomUUID(),
          },
        })
      ).error?.message,
    ).toContain("PAYMENT_EXCEEDS_OUTSTANDING");
  });
  it("refund settles an approved claim without another expense or stale remaining amount", async () => {
    const pr = await rpc(owner, "create_project", {
      p_name: "Claim refund",
      p_code: "CR",
      p_opening: "1000",
    });
    const p = await rpc(owner, "save_purchase", {
      p_project: pr,
      p_data: {
        items: [
          {
            description: "Returned personal goods",
            quantity: "1",
            unit_price_minor: "400",
          },
        ],
        allocations: [
          {
            source_type: "MEMBER",
            member_user_id: "10000000-0000-0000-0000-000000000001",
            amount_minor: "400",
          },
        ],
      },
    });
    const command = async (
      type: string,
      source: string,
      extra: Record<string, unknown> = {},
    ) =>
      rpc(owner, "post_financial", {
        p_project: pr,
        p_command: {
          type,
          source_id: source,
          idempotency_key: crypto.randomUUID(),
          ...extra,
        },
      });
    await command("PURCHASE", p);
    const alloc = (
      await rpc(owner, "project_records", {
        p_project: pr,
        p_table: "purchase_funding_allocations",
      })
    ).rows[0].id;
    const claim = await rpc(owner, "save_record", {
      p_project: pr,
      p_table: "reimbursement_claims",
      p_data: { items: [{ allocation_id: alloc, amount_minor: "400" }] },
    });
    await rpc(owner, "submit_approval", {
      p_project: pr,
      p_table: "reimbursement_claims",
      p_id: claim,
    });
    await command("REFUND", p, {
      amount_minor: "400",
      allocations: [
        { destination: "MEMBER", allocation_id: alloc, amount_minor: "400" },
      ],
    });
    const report = await rpc(owner, "report_data", {
      p_project: pr,
      p_report: "reimbursement_claims",
    });
    expect(report[0].remaining_minor).toBe("0");
    expect(report[0].status).toBe("paid");
    expect(report[0].refund_adjustment_minor).toBe("400");
    expect(
      (await rpc(owner, "project_summary", { p_project: pr })).payable,
    ).toBe("0");
  });
  it("advance approval is consumed and issued top-up drafts cannot be deleted", async () => {
    const pr = await rpc(owner, "create_project", {
      p_name: "Consumed approval",
      p_code: "CA",
      p_opening: "2000",
    });
    const token = await rpc(owner, "invite_member", {
      p_project: pr,
      p_email: "rahul@example.test",
      p_role: "APPROVER",
    });
    await rpc(member, "accept_invite", { p_token: token });
    await rpc(owner, "save_record", {
      p_project: pr,
      p_table: "approval_policies",
      p_data: {
        name: "Advance approval",
        entity_type: "advances",
        rule_json: { minimum_minor: "1", steps: [{ role: "APPROVER" }] },
      },
    });
    const adv = await rpc(owner, "save_record", {
      p_project: pr,
      p_table: "advances",
      p_data: { purpose: "Approved issue", requested_minor: "500" },
    });
    await rpc(owner, "submit_approval", {
      p_project: pr,
      p_table: "advances",
      p_id: adv,
    });
    const steps = await rpc(member, "project_records", {
      p_project: pr,
      p_table: "approval_steps",
    });
    await rpc(member, "decide_approval", {
      p_step: steps.rows[0].id,
      p_decision: "approved",
    });
    const bank = (
      await rpc(owner, "project_records", {
        p_project: pr,
        p_table: "financial_accounts",
      })
    ).rows.find((r: { account_type: string }) => r.account_type === "BANK").id;
    await rpc(owner, "post_financial", {
      p_project: pr,
      p_command: {
        type: "ADVANCE",
        source_id: adv,
        account_id: bank,
        amount_minor: "500",
        idempotency_key: crypto.randomUUID(),
      },
    });
    expect(
      (
        await owner.rpc("post_financial", {
          p_project: pr,
          p_command: {
            type: "ADVANCE_TOPUP",
            source_id: adv,
            account_id: bank,
            amount_minor: "500",
            idempotency_key: crypto.randomUUID(),
          },
        })
      ).error?.message,
    ).toContain("APPROVAL_REQUIRED");
    await rpc(owner, "prepare_advance_topup", {
      p_project: pr,
      p_advance: adv,
      p_amount: "300",
      p_reason: "Additional equipment",
    });
    expect(
      (
        await owner.rpc("delete_draft", {
          p_project: pr,
          p_table: "advances",
          p_id: adv,
        })
      ).error?.message,
    ).toContain("DRAFT_NOT_EDITABLE");
  });
});
