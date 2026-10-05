export function available(p: {
  cash: bigint;
  bills: bigint;
  members: bigint;
  requests: bigint;
}) {
  return p.cash - p.bills - p.members - p.requests;
}
export function remaining(total: bigint, payments: bigint[]) {
  const result = total - payments.reduce((sum, n) => sum + n, 0n);
  if (result < 0n) throw new Error("Payment exceeds outstanding.");
  return result;
}
export function assertAllocations(total: bigint, allocations: bigint[]) {
  if (
    allocations.some((n) => n <= 0n) ||
    allocations.reduce((sum, n) => sum + n, 0n) !== total
  )
    throw new Error("Funding splits must equal the purchase total.");
}
