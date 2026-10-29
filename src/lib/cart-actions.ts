import { cartSchema, type CartLine } from "./cart-pricing";

export function sameConfiguration(a: CartLine, b: CartLine) {
  return a.kind !== "estimate" && b.kind !== "estimate" && a.product === b.product && a.colour === b.colour && a.teeth === b.teeth && JSON.stringify(Object.entries(a.options).sort()) === JSON.stringify(Object.entries(b.options).sort());
}
export function matchingMain(items: CartLine[], main: CartLine) {
  return items.find((l) => !l.addonOf && sameConfiguration(l, main));
}
export function linkedAddon(items: CartLine[], main: CartLine, addon: CartLine) {
  const parent = matchingMain(items, main);
  return parent ? items.find((l) => l.addonOf === parent.id && sameConfiguration(l, addon)) : undefined;
}
export function setAddonQuantity(items: CartLine[], main: CartLine, addon: CartLine, quantity: number, id: () => string): CartLine[] {
  if (!Number.isInteger(quantity) || quantity < 0 || quantity > 10) return items;
  const parent = matchingMain(items, main);
  const existing = linkedAddon(items, main, addon);
  if (quantity === 0) return existing ? items.filter((l) => l.id !== existing.id) : items;
  const parentId = parent?.id ?? id();
  const next = existing
    ? items.map((l) => l.id === existing.id ? { ...l, quantity } : l)
    : [...items, ...(!parent ? [{ ...main, id: parentId }] : []), { ...addon, id: id(), addonOf: parentId, quantity }];
  return cartSchema.safeParse(next).success ? next : items;
}
export function removeWithAddons(items: CartLine[], id: string) {
  return items.filter((l) => l.id !== id && l.addonOf !== id);
}
export function orderedCartItems(items: CartLine[]) {
  const mains = items.filter((l) => !l.addonOf || !items.some((p) => p.id === l.addonOf));
  return mains.flatMap((p) => [p, ...items.filter((l) => l.addonOf === p.id)]);
}/** Lines for one "Add to cart" click: a new main line plus selected add-ons linked to it (never merged). */
export function configurationLines(main: CartLine, selected: CartLine[], id: () => string): CartLine[] {
  const parentId = id();
  return [{ ...main, id: parentId, addonOf: undefined }, ...selected.filter((a) => a.quantity > 0).map((a) => ({ ...a, id: id(), addonOf: parentId, quantity: Math.min(10, a.quantity) }))];
}
