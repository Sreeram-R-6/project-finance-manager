import { supabaseServer } from "@/lib/supabase/server";
import { commandSchema, purchaseSchema, friendlyError } from "@/lib/domain";
export async function mutate(
  project: string,
  action: string,
  data: Record<string, unknown>,
) {
  const checkMoney = (value: unknown): void => {
    if (Array.isArray(value)) {
      value.forEach(checkMoney);
      return;
    }
    if (value && typeof value === "object")
      for (const [key, item] of Object.entries(value)) {
        if (
          key.endsWith("_minor") &&
          item !== undefined &&
          item !== null &&
          (typeof item !== "string" || !/^\d+$/.test(item))
        )
          throw new Error("Enter money as exact whole minor-unit strings.");
        checkMoney(item);
      }
  };
  checkMoney(data);
  const client = await supabaseServer();
  const { data: identity, error: authError } = await client.auth.getClaims();
  if (authError || !identity?.claims) throw new Error("Sign in to continue.");
  let rpc: string;
  let args: Record<string, unknown>;
  switch (action) {
    case "purchase":
      rpc = "save_purchase";
      args = { p_project: project, p_data: purchaseSchema.parse(data) };
      break;
    case "post":
      rpc = "post_financial";
      args = { p_project: project, p_command: commandSchema.parse(data) };
      break;
    case "submit":
      rpc = "submit_approval";
      args = { p_project: project, p_table: data.table, p_id: data.id };
      break;
    case "decide":
      rpc = "decide_approval";
      args = {
        p_step: data.id,
        p_decision: data.decision,
        p_comment: data.comment ?? "",
      };
      break;
    case "invite":
      rpc = "invite_member";
      args = { p_project: project, p_email: data.email, p_role: data.role };
      break;
    case "member":
      rpc = "change_member";
      args = {
        p_project: project,
        p_user: data.user_id,
        p_role: data.role,
        p_active: data.active,
      };
      break;
    case "owner":
      rpc = "transfer_owner";
      args = { p_project: project, p_user: data.user_id };
      break;
    case "update":
      rpc = "update_record";
      args = {
        p_project: project,
        p_table: data.table,
        p_id: data.id,
        p_data: data.values,
      };
      break;
    case "delete":
      rpc = "delete_draft";
      args = { p_project: project, p_table: data.table, p_id: data.id };
      break;
    case "revoke":
      rpc = "revoke_invite";
      args = { p_project: project, p_id: data.id };
      break;
    case "close":
      rpc = "close_project";
      args = { p_project: project, p_reason: data.reason };
      break;
    case "topup_request":
      rpc = "prepare_advance_topup";
      args = {
        p_project: project,
        p_advance: data.id,
        p_amount: data.amount_minor,
        p_reason: data.reason,
      };
      break;
    case "status":
      rpc = "set_project_status";
      args = {
        p_project: project,
        p_status: data.status,
        p_reason: data.reason || "",
      };
      break;
    default:
      rpc = "save_record";
      args = { p_project: project, p_table: action, p_data: data };
  }
  const result = await client.rpc(rpc, args);
  if (result.error) {
    console.error("Domain operation failed", action, result.error.code);
    throw new Error(friendlyError(result.error.message));
  }
  return result.data;
}
