import { describe, it, expect } from "vitest";
import { parseMoney, formatMoney, lineTotal, csvCell } from "@/lib/money";
import { amountWords, renderDocument } from "@/lib/documents";
describe("exact monetary arithmetic", () => {
  it("preserves integers above the JavaScript safe range", () => {
    expect(parseMoney("90071992547409.93")).toBe(9007199254740993n);
    expect(formatMoney(9007199254740993n)).toContain(".93");
  });
  it("rejects excess precision and negative inputs", () => {
    expect(() => parseMoney("1.001")).toThrow();
    expect(() => parseMoney("-1")).toThrow();
  });
  it("rounds exact fractional quantity half up", () => {
    expect(lineTotal("0.5", 101n)).toBe(51n);
    expect(lineTotal("1.25", 100n, 10n, 5n)).toBe(130n);
  });
  it("rejects invalid quantity and negative total", () => {
    expect(() => lineTotal("0", 100n)).toThrow();
    expect(() => lineTotal("1", 100n, 0n, 200n)).toThrow();
  });
  it("escapes CSV and neutralizes formulas", () => {
    expect(csvCell("=IMPORTXML()")).toBe('"\'=IMPORTXML()"');
    expect(csvCell('a"b')).toBe('"a""b"');
  });
});
describe("safe documents", () => {
  it("renders INR words exactly", () => {
    expect(amountWords(620000n)).toBe("six thousand two hundred rupees only");
  });
  it("escapes substitutions and strips scripts", () => {
    const html = renderDocument(
      "<script>alert(1)</script><p>{{member.name}}</p>",
      { "member.name": "<img src=x onerror=alert(1)>" },
      [],
      "INR",
    );
    expect(html).not.toContain("<script");
    expect(html).not.toContain("<img");
    expect(html).toContain("&lt;img");
  });
});
