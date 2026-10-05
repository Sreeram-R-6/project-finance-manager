"use client";
import { operation } from "./entry-form";
import { parseMoney } from "@/lib/money";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { useState } from "react";
export function Recurring({ project }: { project: string }) {
  const [message, setMessage] = useState("");
  return (
    <section className="panel stack">
      <h2>Recurring expense reminders</h2>
      <p className="muted">
        Generate upcoming reminders for subscriptions. Money is posted only
        after review.
      </p>
      <form
        action={async (f) => {
          try {
            await operation(project, "recurring_expense_templates", {
              description: f.get("description"),
              amount_minor: parseMoney(String(f.get("amount"))).toString(),
              recurrence_rule: f.get("rule"),
              next_due_date: f.get("due"),
            });
            setMessage("Recurring template saved.");
          } catch (e) {
            setMessage(e instanceof Error ? e.message : "Unable to save.");
          }
        }}
      >
        <div className="formgrid">
          <label>
            Description
            <input name="description" required />
          </label>
          <label>
            Amount
            <input name="amount" inputMode="decimal" required />
          </label>
          <label>
            Recurrence
            <select name="rule">
              <option value="monthly">Monthly</option>
              <option value="weekly">Weekly</option>
              <option value="yearly">Yearly</option>
            </select>
          </label>
          <label>
            Next due date
            <input type="date" name="due" required />
          </label>
        </div>
        <button>Save recurring template</button>
      </form>
      <button
        onClick={async () => {
          const { data, error } = await supabaseBrowser().rpc(
            "generate_recurring_drafts",
            { p_project: project },
          );
          setMessage(
            error
              ? "Unable to generate reminders."
              : `${data} due reminders generated.`,
          );
        }}
      >
        Generate due reminders
      </button>
      {message && (
        <p role="status" className="notice">
          {message}
        </p>
      )}
    </section>
  );
}
