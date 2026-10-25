import { z } from "zod";
import {
  adjustPrice,
  discountedPrice,
  findProduct,
  type CatalogProduct,
  type OptionGroup,
  type Addon,
} from "./catalog";

export const cartLineSchema = z.object({
  id: z.string().min(1).max(100),
  product: z.string().min(1).max(100),
  colour: z.enum(["White", "Yellow"]),
  options: z.record(z.string().max(100)).refine((v) => Object.keys(v).length <= 8),
  quantity: z.number().int().min(1).max(10),
  teeth: z.number().int().min(1).max(8),
});
export type CartLine = z.infer<typeof cartLineSchema>;
export const cartSchema = z.array(cartLineSchema).max(100);
export const answersSchema = z.object({
  scan: z.enum(["istanbul", "city", "stl"]),
  delivery: z.enum(["pickup", "shipping"]),
  payment: z.literal(true),
  adult: z.literal(true),
  privacy: z.literal(true),
});
export type Answers = z.infer<typeof answersSchema>;
export type DraftAnswers = Partial<Answers>;
export function firstUnanswered(a: DraftAnswers) {
  return (["scan", "delivery", "payment", "adult", "privacy"] as const).find((k) => !a[k]);
}
export const orderSchema = z.object({
  version: z.literal(1),
  id: z.string().regex(/^GZ-\d{4}$/),
  date: z.string().datetime(),
  lang: z.enum(["en", "tr"]),
  items: cartSchema.min(1),
  answers: answersSchema,
  factor: z.number().finite().min(1).max(100),
  total: z.number().finite().nonnegative(),
  estimated: z.number().finite().nonnegative(),
});
export type OrderRecord = z.infer<typeof orderSchema>;
export function encodeOrder(order: OrderRecord) {
  const bytes = new TextEncoder().encode(JSON.stringify(orderSchema.parse(order)));
  return btoa(Array.from(bytes, (b) => String.fromCharCode(b)).join(""))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}
export function decodeOrder(value: string): OrderRecord | null {
  try {
    if (!value || value.length > 60000) return null;
    const raw = atob(value.replace(/-/g, "+").replace(/_/g, "/"));
    return orderSchema.parse(
      JSON.parse(
        new TextDecoder("utf-8", { fatal: true }).decode(
          Uint8Array.from(raw, (c) => c.charCodeAt(0)),
        ),
      ),
    );
  } catch {
    return null;
  }
}
export function configuredLine(
  product: CatalogProduct,
  groups: OptionGroup[],
  colour: "White" | "Yellow" = "White",
  options: Record<string, string> = {},
  teeth = 1,
): CartLine {
  return {
    id: product.folder,
    product: product.folder,
    colour,
    options: Object.fromEntries(
      groups
        .filter((g) => product.option_groups.includes(g.group_id) && g.group_id !== "colour")
        .map((g) => [
          g.group_id,
          options[g.group_id] ??
            g.options.find((o) => o.isDefault)?.option ??
            g.options[0]?.option ??
            "",
        ]),
    ),
    quantity: 1,
    teeth: product.per_tooth ? teeth : 1,
  };
}
export function addonLine(
  addon: Addon,
  products: CatalogProduct[],
  groups: OptionGroup[],
  colour: "White" | "Yellow",
) {
  const p = findProduct(addon.product, products);
  if (!p) return null;
  const g = groups.find(
    (g) => p.option_groups.includes(g.group_id) && g.options.some((o) => o.option === addon.option),
  );
  return configuredLine(p, groups, colour, g ? { [g.group_id]: addon.option } : {});
}
export function priceCart(
  items: CartLine[],
  products: CatalogProduct[],
  groups: OptionGroup[],
  factor: number,
) {
  const lines = items.map((item) => {
    const product = findProduct(item.product, products);
    if (!product)
      return {
        item,
        product,
        invalid: true,
        full: 0,
        total: 0,
        savings: 0,
        charges: [] as number[],
      };
    const selected = Object.entries(item.options).map(([id, choice]) =>
      groups
        .find((g) => g.group_id === id && product.option_groups.includes(id) && id !== "colour")
        ?.options.find((o) => o.option === choice),
    );
    const invalid =
      !cartLineSchema.safeParse(item).success ||
      selected.some((o) => !o) ||
      (!product.per_tooth && item.teeth !== 1);
    if (invalid)
      return {
        item,
        product,
        invalid: true,
        full: 0,
        total: 0,
        savings: 0,
        charges: [] as number[],
      };
    const once = Object.entries(item.options).reduce(
      (sum, [id, choice]) =>
        sum +
        (id.startsWith("bar")
          ? (groups
              .find((g) => g.group_id === id && product.option_groups.includes(id))
              ?.options.find((o) => o.option === choice)?.price_add_tl ?? 0)
          : 0),
      0,
    );
    const each = selected.reduce((sum, o) => sum + (o?.price_add_tl ?? 0), 0) - once;
    const teeth = product.per_tooth ? item.teeth : 1;
    const charges = Array.from({ length: item.quantity }, () =>
      Array.from({ length: teeth }, (_, t) =>
        adjustPrice(product.price + each + (t === 0 ? once : 0), factor),
      ),
    ).flat();
    return {
      item,
      product,
      invalid,
      full: charges.reduce((s, n) => s + n, 0),
      total: 0,
      savings: 0,
      charges,
    };
  });
  let highest = -1,
    fullLine = -1,
    fullPiece = -1;
  lines.forEach((l, i) => {
    if (l.product?.section === "classics" && !l.invalid)
      l.charges.forEach((n, j) => {
        if (n > highest) {
          highest = n;
          fullLine = i;
          fullPiece = j;
        }
      });
  });
  lines.forEach((l, i) => {
    if (l.invalid) return;
    l.charges = l.charges.map((n, j) =>
      l.product?.section === "custom" || (i === fullLine && j === fullPiece)
        ? n
        : discountedPrice(n, l.product?.extra_piece_discount ?? 0),
    );
    l.total = l.charges.reduce((s, n) => s + n, 0);
    l.savings = l.full - l.total;
  });
  return {
    lines,
    total: lines.filter((l) => l.product?.section === "classics").reduce((s, l) => s + l.total, 0),
    estimated: lines
      .filter((l) => l.product?.section === "custom")
      .reduce((s, l) => s + l.total, 0),
    savings: lines.reduce((s, l) => s + l.savings, 0),
    invalid: lines.some((l) => l.invalid),
  };
}
