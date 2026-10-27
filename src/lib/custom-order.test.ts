import { describe, expect, it } from "vitest";
import { needsReference } from "./custom-order";
import { BUILTIN } from "./sheet";
import type { CartLine } from "./cart-pricing";

describe("custom reference requirement", () => {
  const line: CartLine = { id: "test", product: "frame", colour: "White", options: {}, teeth: 1, quantity: 1 };
  it("leaves catalog-only orders unchanged", () => {
    expect(needsReference([line], BUILTIN.products)).toBe(false);
  });
  it("requires a reference for an estimate even with no catalog product", () => {
    expect(needsReference([{ ...line, product: "custom-estimate", kind: "estimate" }], BUILTIN.products)).toBe(true);
  });
  it("requires a reference for a signature custom piece in a mixed cart", () => {
    const product = BUILTIN.products.find(p => p.section === "custom");
    if (!product) throw new Error("Missing custom fixture");
    expect(needsReference([line, { ...line, id: "custom", product: product.folder }], BUILTIN.products)).toBe(true);
  });
});