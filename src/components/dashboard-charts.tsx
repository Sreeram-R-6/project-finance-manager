"use client";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { formatMoney } from "@/lib/money";
import { BudgetBar, Section, TextLink, MoneyAmount } from "./design-system";
import {
  Cpu,
  Wrench,
  Car,
  Printer,
  Code2,
  Layers,
  Utensils,
  type LucideIcon,
} from "lucide-react";
type Point = { month?: string; category?: string; amount_minor: string };
type Budget = {
  id: string;
  category: string;
  planned_minor: string;
  actual_minor: string;
};
const categoryIcons: Record<string, LucideIcon> = {
  electronics: Cpu,
  mechanical: Wrench,
  travel: Car,
  printing: Printer,
  software: Code2,
  food: Utensils,
};
export function CategoryIcon({ name }: { name: string }) {
  const Icon = categoryIcons[name.toLowerCase()] || Layers;
  return <Icon size={16} />;
}
export function DashboardCharts({
  project,
  currency,
  data,
}: {
  project: string;
  currency: string;
  data: {
    months: Point[];
    categories: Point[];
    budgets: Budget[];
    current_month_minor: string;
    issues: { id: string; section: string; title: string }[];
  };
}) {
  const chart = data.months.map((r) => ({
    label: r.month,
    amount: Number(BigInt(r.amount_minor)) / 100,
    exact: r.amount_minor,
  }));
  const categoryTotal = data.categories.reduce(
    (n, r) => n + BigInt(r.amount_minor),
    0n,
  );
  return (
    <div className="stack">
      <div className="dashboard-grid">
        <Section
          title="Spending over time"
          description="Project expenses, including bills and personal purchases."
        >
          <div className="panel">
            <div className="row between">
              <div>
                <span className="muted" style={{ fontSize: 11 }}>
                  This month
                </span>
                <div className="metric">
                  <MoneyAmount
                    value={data.current_month_minor}
                    currency={currency}
                  />
                </div>
              </div>
              <span className="badge">Monthly</span>
            </div>
            <div className="chart" style={{ marginTop: 18 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={chart}
                  margin={{ top: 15, right: 10, bottom: 0, left: 0 }}
                >
                  <defs>
                    <linearGradient id="spend-fill" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="0%"
                        stopColor="var(--accent)"
                        stopOpacity={0.18}
                      />
                      <stop
                        offset="100%"
                        stopColor="var(--accent)"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    vertical={false}
                    stroke="var(--border)"
                    strokeDasharray="3 5"
                  />
                  <XAxis
                    dataKey="label"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 10 }}
                    tickFormatter={(v) =>
                      new Date(String(v) + "-01T00:00:00").toLocaleDateString(
                        "en-IN",
                        { month: "short" },
                      )
                    }
                  />
                  <Tooltip
                    formatter={(_value, _name, item) =>
                      formatMoney(
                        String((item.payload as { exact: string }).exact),
                        currency,
                      )
                    }
                    cursor={{ stroke: "var(--border)" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="amount"
                    stroke="var(--accent)"
                    strokeWidth={2}
                    fill="url(#spend-fill)"
                    isAnimationActive={false}
                    dot={{
                      r: 3,
                      fill: "var(--accent)",
                      stroke: "var(--panel)",
                      strokeWidth: 2,
                    }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <details className="chart-alternative">
              <summary>View exact monthly amounts</summary>
              {data.months.map((r) => (
                <p key={r.month}>
                  {r.month}: {formatMoney(r.amount_minor, currency)}
                </p>
              ))}
            </details>
          </div>
        </Section>
        <Section
          title="Where the money goes"
          action={
            <TextLink href={`/app/projects/${project}/reports`}>
              Explore
            </TextLink>
          }
        >
          <div className="panel">
            {data.categories.map((r) => {
              const percent =
                categoryTotal > 0n
                  ? Number((BigInt(r.amount_minor) * 100n) / categoryTotal)
                  : 0;
              return (
                <div className="category-row" key={r.category}>
                  <span className="attention-icon">
                    <CategoryIcon name={r.category || ""} />
                  </span>
                  <div>
                    <div className="row between">
                      <strong>{r.category}</strong>
                      <MoneyAmount value={r.amount_minor} currency={currency} />
                    </div>
                    <div className="budget-track">
                      <span
                        style={{
                          width: `${Math.max(0, Math.min(100, percent))}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
            {!data.categories.length && (
              <p className="muted">
                Your spending categories will appear after your first completed
                expense.
              </p>
            )}
            <p className="muted" style={{ fontSize: 11, marginTop: 18 }}>
              Includes recorded bills; refunds and reversals reduce spending.
            </p>
          </div>
        </Section>
      </div>
      <Section
        title="A little room for the next idea"
        description="See how much of each budget you’ve used."
        action={
          <TextLink href={`/app/projects/${project}/budgets`}>
            Manage budgets
          </TextLink>
        }
      >
        <div className="panel budget-grid">
          {data.budgets.map((b) => (
            <BudgetBar
              key={b.id}
              name={b.category}
              actual={b.actual_minor}
              planned={b.planned_minor}
              currency={currency}
            />
          ))}
          {!data.budgets.length && (
            <p className="muted">
              Set category budgets to keep your project on track.
            </p>
          )}
        </div>
      </Section>
    </div>
  );
}
