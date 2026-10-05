import sanitizeHtml from "sanitize-html";
import { formatMoney } from "./money";
export const escapeHtml = (v: unknown) =>
  String(v ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]!,
  );
export function amountWords(n: bigint): string {
  if (n < 0n) return "minus " + amountWords(-n);
  const ones = [
    "zero",
    "one",
    "two",
    "three",
    "four",
    "five",
    "six",
    "seven",
    "eight",
    "nine",
    "ten",
    "eleven",
    "twelve",
    "thirteen",
    "fourteen",
    "fifteen",
    "sixteen",
    "seventeen",
    "eighteen",
    "nineteen",
  ];
  const tens = [
    "",
    "",
    "twenty",
    "thirty",
    "forty",
    "fifty",
    "sixty",
    "seventy",
    "eighty",
    "ninety",
  ];
  function words(v: bigint): string {
    if (v < 20n) return ones[Number(v)];
    if (v < 100n)
      return tens[Number(v / 10n)] + (v % 10n ? " " + words(v % 10n) : "");
    if (v < 1000n)
      return (
        words(v / 100n) + " hundred" + (v % 100n ? " " + words(v % 100n) : "")
      );
    for (const [scale, label] of [
      [10000000n, "crore"],
      [100000n, "lakh"],
      [1000n, "thousand"],
    ] as const)
      if (v >= scale)
        return (
          words(v / scale) +
          " " +
          label +
          (v % scale ? " " + words(v % scale) : "")
        );
    return "";
  }
  return (
    words(n / 100n) +
    " rupees" +
    (n % 100n ? " and " + words(n % 100n) + " paise" : "") +
    " only"
  );
}
export function renderDocument(
  template: string,
  values: Record<string, string>,
  expenses: {
    date: string;
    item: string;
    vendor: string;
    invoice: string;
    amount: string;
  }[],
  currency: string,
) {
  const table =
    "<table><thead><tr><th>Sl</th><th>Date</th><th>Item</th><th>Vendor</th><th>Bill No.</th><th>Amount</th></tr></thead><tbody>" +
    expenses
      .map(
        (e, i) =>
          `<tr><td>${i + 1}</td><td>${escapeHtml(e.date)}</td><td>${escapeHtml(e.item)}</td><td>${escapeHtml(e.vendor)}</td><td>${escapeHtml(e.invoice)}</td><td>${escapeHtml(formatMoney(e.amount, currency))}</td></tr>`,
      )
      .join("") +
    "</tbody></table>";
  const html = template.replace(/{{\s*([\w.]+)\s*}}/g, (_, key: string) =>
    key === "expenses" ? table : escapeHtml(values[key] ?? ""),
  );
  return sanitizeHtml(html, {
    allowedTags: [
      "h1",
      "h2",
      "h3",
      "p",
      "br",
      "strong",
      "em",
      "table",
      "thead",
      "tbody",
      "tr",
      "td",
      "th",
      "ul",
      "ol",
      "li",
      "span",
    ],
    allowedAttributes: {},
    allowedSchemes: [],
  });
}
export function printHtml(body: string) {
  const safe = sanitizeHtml(body, {
    allowedTags: [
      "h1",
      "h2",
      "h3",
      "p",
      "br",
      "strong",
      "em",
      "table",
      "thead",
      "tbody",
      "tr",
      "td",
      "th",
      "ul",
      "ol",
      "li",
      "span",
    ],
    allowedAttributes: {},
  });
  return `<!doctype html><html><head><meta charset="utf-8"><style>@page{size:A4;margin:18mm}body{font:12px Arial,sans-serif;color:#172033;line-height:1.65}h1{font-size:23px}table{width:100%;border-collapse:collapse;margin:20px 0}td,th{border:1px solid #ddd;padding:5px;text-align:left;overflow-wrap:anywhere}table{table-layout:fixed;font-size:10px}h2{break-after:avoid}thead{display:table-header-group}tr{break-inside:avoid}</style></head><body>${safe}</body></html>`;
}
