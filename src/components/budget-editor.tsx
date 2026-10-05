"use client";
import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { operation } from "./entry-form";
import { parseMoney, formatMoney, moneyInput } from "@/lib/money";
import type { Row } from "@/lib/domain";
export function BudgetEditor({
  project,
  budget,
  currency,
}: {
  project: string;
  budget: string;
  currency: string;
}) {
  const [lines, setLines] = useState<Row[]>([]);
  const [categories, setCategories] = useState<Row[]>([]);
  const [message, setMessage] = useState("");
  useEffect(() => {
    supabaseBrowser()
      .rpc("project_records", {
        p_project: project,
        p_table: "categories",
        p_limit: 200,
      })
      .then(({ data }) => setCategories(data?.rows || []));
    supabaseBrowser()
      .rpc("project_records", {
        p_project: project,
        p_table: "budget_lines",
        p_search: budget,
      })
      .then(({ data }) => setLines(data?.rows || []));
  }, [project, budget]);
  return (
    <section className="panel stack">
      <h2>Budget controls</h2>
      {lines.map((line) => (
        <form
          key={String(line.id)}
          action={async (f) => {
            try {
              await operation(project, "update", {
                table: "budget_lines",
                id: line.id,
                values: {
                  planned_minor: parseMoney(
                    String(f.get("planned")),
                  ).toString(),
                  warning_percent: Number(f.get("warning")),
                  hard_stop: f.get("stop") === "on",
                },
              });
              setMessage("Budget controls saved.");
            } catch (e) {
              setMessage(e instanceof Error ? e.message : "Unable to update.");
            }
          }}
        >
          <p>Planned: {formatMoney(String(line.planned_minor), currency)}</p>
          <div className="formgrid">
            <label>
              Planned amount
              <input
                name="planned"
                defaultValue={moneyInput(line.planned_minor)}
                inputMode="decimal"
              />
            </label>
            <label>
              Warning threshold (%)
              <input
                name="warning"
                type="number"
                min="0"
                max="100"
                defaultValue={String(line.warning_percent)}
              />
            </label>
          </div>
          <label className="row">
            <input
              type="checkbox"
              name="stop"
              style={{ width: "auto" }}
              defaultChecked={Boolean(line.hard_stop)}
            />
            Block posting above this budget
          </label>
          <button>Save budget controls</button>
        </form>
      ))}
      <form
        action={async (f) => {
          try {
            await operation(project, "budget_lines", {
              budget_id: budget,
              category_id: f.get("category"),
              planned_minor: parseMoney(String(f.get("amount"))).toString(),
            });
            const { data } = await supabaseBrowser().rpc("project_records", {
              p_project: project,
              p_table: "budget_lines",
              p_search: budget,
            });
            setLines(data?.rows || []);
            setMessage("Category budget added.");
          } catch (e) {
            setMessage(
              e instanceof Error ? e.message : "Unable to add category.",
            );
          }
        }}
      >
        <h3>Add category budget</h3>
        <label>
          Category
          <select name="category" required>
            {categories.map((c) => (
              <option key={String(c.id)} value={String(c.id)}>
                {String(c.name)}
              </option>
            ))}
          </select>
        </label>
        <label>
          Planned amount
          <input name="amount" required inputMode="decimal" />
        </label>
        <button>Add category</button>
      </form>
      {message && (
        <p role="status" className="notice">
          {message}
        </p>
      )}
    </section>
  );
}
