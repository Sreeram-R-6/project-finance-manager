// A transaction's face amount is the debit side of its balanced posted entries.
// This is a display projection, not a cash balance or a second expense total.
// Callers load entries only for the visible page and keep the database's currency.
export function transactionAmounts(
  entries: { financial_event_id: string; amount_minor: string }[],
) {
  const amounts = new Map<string, bigint>();
  for (const entry of entries)
    amounts.set(
      entry.financial_event_id,
      (amounts.get(entry.financial_event_id) || 0n) +
        BigInt(entry.amount_minor),
    );
  return amounts;
}
