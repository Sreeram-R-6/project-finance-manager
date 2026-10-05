import { describe, it, expect } from "vitest";
import { available, remaining, assertAllocations } from "@/lib/settlements";
describe("settlement projections", () => {
  it("does not deduct an issued advance from cash twice", () =>
    expect(
      available({
        cash: 9840000n,
        bills: 1240000n,
        members: 220000n,
        requests: 0n,
      }),
    ).toBe(8380000n));
  it("rejects partial allocations and overpayments", () => {
    expect(() =>
      assertAllocations(2000000n, [1200000n, 500000n, 300000n]),
    ).not.toThrow();
    expect(() => assertAllocations(10n, [9n])).toThrow();
    expect(() => remaining(10n, [11n])).toThrow();
  });
  it("keeps negative availability visible", () =>
    expect(
      available({ cash: 100n, bills: 200n, members: 0n, requests: 0n }),
    ).toBe(-100n));
});
