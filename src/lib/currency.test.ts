import { describe, expect, it } from "vitest";
import { convertFromTry, convertToTry, formatForMessage } from "./currency";

const rates = { usd_try: 40, eur_try: 45 };

describe("currency", () => {
  it("TRY to EUR uses eur_try, whole euros", () => {
    expect(convertFromTry(5000, "EUR", rates)).toBe(111);
  });
  it("TRY to USD uses usd_try, whole dollars", () => {
    expect(convertFromTry(5000, "USD", rates)).toBe(125);
  });
  it("TRY stays TRY", () => {
    expect(convertFromTry(5000, "TRY", rates)).toBe(5000);
  });
  it("custom EUR amount converts back to TRY rounded to 10 TL", () => {
    expect(convertToTry(101, "EUR", rates)).toBe(4550);
  });
  it("message shows chosen currency plus TRY", () => {
    expect(formatForMessage(5000, "USD", "en", rates)).toBe("$125 (₺5,000)");
  });
});
