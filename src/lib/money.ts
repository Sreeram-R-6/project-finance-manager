export function parseMoney(value: string, decimals = 2): bigint {
  const match = /^(\d+)(?:\.(\d+))?$/.exec(value.trim());
  if (!match || (match[2]?.length ?? 0) > decimals)
    throw new Error("Enter a positive amount with at most two decimal places.");
  const result =
    BigInt(match[1]) * 10n ** BigInt(decimals) +
    BigInt((match[2] ?? "").padEnd(decimals, "0") || "0");
  if (result > 9223372036854775807n) throw new Error("Amount is too large.");
  return result;
}
export function formatMoney(value: string | bigint, currency = "INR"): string {
  const n = BigInt(value);
  const abs = n < 0n ? -n : n;
  return `${n < 0n ? "−" : ""}${currency === "INR" ? "₹" : currency + " "}${(abs / 100n).toLocaleString("en-IN")}.${(abs % 100n).toString().padStart(2, "0")}`;
}
export function lineTotal(
  quantity: string,
  unitPrice: bigint,
  tax = 0n,
  discount = 0n,
): bigint {
  if (!/^\d+(\.\d{1,6})?$/.test(quantity))
    throw new Error("Quantity must have at most six decimal places.");
  const [whole, fraction = ""] = quantity.split(".");
  const scale = 10n ** BigInt(fraction.length);
  const q = BigInt(whole) * scale + BigInt(fraction || "0");
  if (q <= 0n || unitPrice < 0n || tax < 0n || discount < 0n)
    throw new Error("Invalid line.");
  const total = (q * unitPrice + scale / 2n) / scale + tax - discount;
  if (total < 0n) throw new Error("Discount exceeds line amount.");
  return total;
}
export function csvCell(value: unknown): string {
  let text = String(value ?? "");
  if (/^[=+@\-\t\r]/.test(text)) text = "'" + text;
  return '"' + text.replaceAll('"', '""') + '"';
}

export function moneyInput(value: unknown): string {
  const n = BigInt(String(value || "0"));
  return (n / 100n).toString() + "." + (n % 100n).toString().padStart(2, "0");
}
