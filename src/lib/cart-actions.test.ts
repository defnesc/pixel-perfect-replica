import { describe, expect, it } from "vitest";
import { PRODUCTS, OPTION_GROUPS, estimateCustom } from "./catalog";
import { BUILTIN } from "./sheet";
import { cartSchema, configuredLine, encodeOrder, decodeOrder, priceCart, raisedSinceOrder, type CartLine, type OrderRecord } from "./cart-pricing";
import { configurationLines, linkedAddon, matchingMain, removeWithAddons, setAddonQuantity } from "./cart-actions";
function line(folder: string) {
  const p = PRODUCTS.find((p) => p.folder === folder);
  if (!p) throw new Error("Missing product");
  return configuredLine(p, OPTION_GROUPS);
}
const main = line("star"), addon = line("frame");
let next = 0;
const id = () => `line-${++next}`;
const estimate: CartLine = { id: "estimate", product: "custom-estimate", kind: "estimate", colour: "White", teeth: 3, quantity: 1, options: {}, estimate: { style: "Very detailed", stones: "No stones", engraving: "No engraving" } };
const calc = (items: CartLine[], factor = 1) => priceCart(items, PRODUCTS, OPTION_GROUPS, factor, BUILTIN.estimator);
describe("linked add-ons", () => {
  it("adds main and add-on together and records the parent", () => {
    const items = setAddonQuantity([], main, addon, 1, id);
    expect(items).toHaveLength(2);
    expect(items[1]?.addonOf).toBe(items[0]?.id);
  });
  it("current configured main is reused, not duplicated", () => {
    const items = setAddonQuantity([main], main, addon, 2, id);
    expect(items).toHaveLength(2);
    expect(linkedAddon(items, main, addon)?.quantity).toBe(2);
  });
  it("changed teeth/options/colour require their own main", () => {
    expect(matchingMain([main], { ...main, colour: "Yellow" })).toBeUndefined();
    expect(matchingMain([main], { ...main, teeth: 2 })).toBeUndefined();
    expect(matchingMain([main], { ...main, options: { stones: "With stones" } })).toBeUndefined();
  });
  it("zero removes only the add-on", () => {
    const items = setAddonQuantity([], main, addon, 1, id);
    expect(setAddonQuantity(items, main, addon, 0, id)).toEqual([items[0]]);
  });
  it("allows 10 but rejects 11", () => {
    const items = setAddonQuantity([], main, addon, 10, id);
    expect(items[1]?.quantity).toBe(10);
    expect(setAddonQuantity(items, main, addon, 11, id)).toBe(items);
  });
  it("removes parent and all its add-ons", () => {
    const items = setAddonQuantity([main], main, addon, 2, id);
    expect(removeWithAddons(items, main.id)).toEqual([]);
  });
  it("empty-cart preview includes main so Frame is 3490", () => {
    const priced = calc([main, addon]);
    expect(priced.lines[1]?.full).toBe(4990);
    expect(priced.lines[1]?.total).toBe(3490);
  });
  it("rejects orphan add-ons in cart/check snapshots", () => expect(cartSchema.safeParse([{ ...addon, addonOf: "missing" }]).success).toBe(false));
});
describe("custom estimates", () => {
  it("three very detailed teeth start at 10990", () => expect(calc([estimate]).estimated).toBe(10990));
  it("never discounts estimates with Classics", () => {
    const priced = calc([main, { ...estimate, quantity: 2 }]);
    expect(priced.estimated).toBe(21980);
    expect(priced.savings).toBe(0);
  });
  it("colour does not affect price", () => expect(calc([{ ...estimate, colour: "Yellow" }]).estimated).toBe(10990));
  it("old check links with a jaw stay readable", () => expect(cartSchema.safeParse([{ ...estimate, estimate: { ...estimate.estimate, jaw: "Upper" } }]).success).toBe(true));
  it("uses loaded rows and factor", () => {
    expect(calc([estimate], 1.03).estimated).toBe(11390);
    expect(priceCart([estimate], PRODUCTS, OPTION_GROUPS, 1, BUILTIN.estimator.map((r) => r.option === "First tooth" ? { ...r, price_add_tl: 7490 } : r)).estimated).toBe(11990);
  });
  it("fully iced is priced per tooth", () => expect(calc([{ ...estimate, estimate: { style: "Very detailed", stones: "Fully iced", engraving: "No engraving" } }]).estimated).toBe(37990));
  it("sheet limit controls estimate eligibility", () => expect(estimateCustom(BUILTIN.estimator.map((r) => r.group === "limit" ? { ...r, price_add_tl: 2 } : r), 3, ["Simple", "No stones", "No engraving"])).toBeNull());
  it("check link retains estimates and parent IDs", () => {
    const items = [...setAddonQuantity([], main, addon, 2, id), estimate];
    const priced = calc(items);
    const order: OrderRecord = { version: 1, id: "GZ-1234", date: "2026-10-25T11:00:00.000Z", lang: "tr", items, answers: { scan: "stl", delivery: "pickup", payment: true, adult: true, privacy: true }, factor: 1, total: priced.total, estimated: priced.estimated };
    expect(decodeOrder(encodeOrder(order))).toEqual(order);
  });
});
describe("price level warning", () => {
  const date = "2026-10-21T11:00:00.000Z", start = new Date(date).getTime();
  it("warns only for lower factor and more than three days", () => expect(raisedSinceOrder(date, 1, 1.03, start + 3 * 86400000 + 1)).toBe(true));
  it("does not warn at exactly three days", () => expect(raisedSinceOrder(date, 1, 1.03, start + 3 * 86400000)).toBe(false));
  it("does not warn when factors match", () => expect(raisedSinceOrder(date, 1.03, 1.03, start + 4 * 86400000)).toBe(false));
});describe("add-ons chosen before Add to cart", () => {
  const a1 = { ...line("frame"), quantity: 1 }, a2 = { ...line("classic-cap"), quantity: 1 };
  it("2 selected add-ons + Add to cart gives 3 lines linked to the new main", () => {
    const items = configurationLines(main, [a1, a2], id);
    expect(items).toHaveLength(3);
    expect(items[1]?.addonOf).toBe(items[0]?.id);
    expect(items[2]?.addonOf).toBe(items[0]?.id);
  });
  it("adding twice makes two mains, each with its own add-ons, not duplicated", () => {
    const first = configurationLines(main, [a1], id);
    const items = [...first, ...configurationLines(main, [], id)];
    expect(items.filter((l) => !l.addonOf)).toHaveLength(2);
    expect(items.filter((l) => l.addonOf)).toHaveLength(1);
  });
  it("page total equals the cart total difference", () => {
    const cart = configurationLines(addon, [], id);
    const added = configurationLines(main, [a1, a2], id);
    expect(calc([...cart, ...added]).total - calc(cart).total).toBe(calc([...cart, main, a1, a2]).total - calc(cart).total);
    expect(calc([...cart, ...added]).total).toBeGreaterThan(calc(cart).total);
  });
});
