import productsCsv from "@/data/products.csv?raw";
import optionsCsv from "@/data/product_options.csv?raw";
import addonsCsv from "@/data/addons.csv?raw";
import { parseCsv, parseNumber } from "./csv";

export interface CatalogProduct {
  folder: string;
  name: string;
  name_tr: string;
  section: "classics" | "custom";
  sort_order: number;
  photos: number;
  main_image: string;
  hover_image: string;
  price: number;
  compare_at_price: number | null;
  price_type: "fixed" | "estimate";
  price_note: string;
  price_note_tr: string;
  badge: string;
  badge_tr: string;
  option_groups: string[];
  teeth_covered: number;
  placement: "teeth" | "gap";
  extra_piece_discount: number;
  per_tooth: boolean;
}

export interface CatalogOption {
  option: string;
  option_tr: string;
  price_add_tl: number;
  extra_teeth: number;
  isDefault: boolean;
  sort_order: number;
  small_note: string;
  small_note_tr: string;
}

export interface OptionGroup {
  group_id: string;
  label: string;
  label_tr: string;
  options: CatalogOption[];
}

export interface Addon {
  product: string;
  option: string;
  addon_id: string;
  name: string;
  name_tr: string;
  photo_folder: string;
  normal_price_tl: number;
  addon_price_tl: number;
  sort_order: number;
}

const num = (v: string | undefined) => (v && v.trim() !== "" ? parseNumber(v) : null);
const cell = (r: Record<string, string>, k: string) => r[k] ?? "";

export const parseProducts = (rows: Record<string, string>[]): CatalogProduct[] => rows.map((r) => ({
  folder: cell(r, "folder"),
  name: cell(r, "name"),
  name_tr: cell(r, "name_tr"),
  section: cell(r, "section") === "custom" ? "custom" : "classics",
  sort_order: Number(cell(r, "sort_order")) || 0,
  photos: Number(cell(r, "photos")) || 1,
  main_image: cell(r, "main_image"),
  hover_image: cell(r, "hover_image"),
  price: parseNumber(r.price) ?? 0,
  compare_at_price: num(r["compare_at_price"]),
  price_type: cell(r, "price_type") === "estimate" ? "estimate" : "fixed",
  price_note: cell(r, "price_note"),
  price_note_tr: cell(r, "price_note_tr"),
  badge: cell(r, "badge"),
  badge_tr: cell(r, "badge_tr"),
  teeth_covered: parseNumber(r.teeth_covered) ?? 1,
  placement: r.placement === "gap" ? "gap" : "teeth",
  extra_piece_discount: parseNumber(r.extra_piece_discount) ?? 0,
  per_tooth: r.per_tooth === "yes",
  option_groups: cell(r, "option_groups").split(";").map((s) => s.trim()).filter(Boolean),
}));

export function parseOptions(rows: Record<string, string>[]): OptionGroup[] {
  const byId = new Map<string, OptionGroup>();
  for (const r of rows) {
    const id = cell(r, "group_id");
    if (!byId.has(id)) byId.set(id, { group_id: id, label: cell(r, "group_label"), label_tr: cell(r, "group_label_tr"), options: [] });
    const group = byId.get(id);
    if (!group) continue;
    group.options.push({
      option: cell(r, "option"),
      option_tr: cell(r, "option_tr"),
      price_add_tl: parseNumber(r.price_add_tl) ?? 0,
      extra_teeth: parseNumber(r.extra_teeth) ?? 0,
      isDefault: r["default"] === "yes",
      sort_order: Number(cell(r, "sort_order")) || 0,
      small_note: cell(r, "small_note"),
      small_note_tr: cell(r, "small_note_tr"),
    });
  }
  for (const g of byId.values()) g.options.sort((a, b) => a.sort_order - b.sort_order);
  return [...byId.values()];
}

export const parseAddons = (rows: Record<string, string>[]): Addon[] => rows
  .map((r) => ({
    product: cell(r, "product"),
    option: cell(r, "option"),
    addon_id: cell(r, "addon_id"),
    name: cell(r, "name"),
    name_tr: cell(r, "name_tr"),
    photo_folder: cell(r, "photo_folder"),
    normal_price_tl: parseNumber(r.normal_price_tl) ?? 0,
    addon_price_tl: parseNumber(r.addon_price_tl) ?? 0,
    sort_order: Number(cell(r, "sort_order")) || 0,
  }))
  .sort((a, b) => a.sort_order - b.sort_order);

export const PRODUCTS = parseProducts(parseCsv(productsCsv));
export const OPTION_GROUPS = parseOptions(parseCsv(optionsCsv));
export const ADDONS = parseAddons(parseCsv(addonsCsv));

export const classics = (products = PRODUCTS) => products.filter((p) => p.section === "classics").sort((a, b) => a.sort_order - b.sort_order);
export const customDesigns = (products = PRODUCTS) => products.filter((p) => p.section === "custom").sort((a, b) => a.sort_order - b.sort_order);
export const findProduct = (folder: string, products = PRODUCTS) => products.find((p) => p.folder === folder);
export const groupOf = (p: CatalogProduct, id: string, groups = OPTION_GROUPS) => (p.option_groups.includes(id) ? groups.find((g) => g.group_id === id) : undefined);

// ---- photos: drop files into src/assets/products/ named <folder>-01.jpg etc. and they appear automatically ----
const photoFiles = import.meta.glob("@/assets/products/*.{jpg,jpeg,png,webp}", { eager: true, query: "?url", import: "default" }) as Record<string, string>;

export function photoUrl(name: string): string | undefined {
  if (!name) return undefined;
  const hit = Object.keys(photoFiles).find((p) => p.endsWith("/" + name));
  return hit ? photoFiles[hit] : undefined;
}

export function productPhotos(p: CatalogProduct): string[] {
  const out: string[] = [];
  for (let i = 1; i <= p.photos; i++) {
    const u = photoUrl(`${p.folder}-${String(i).padStart(2, "0")}.jpg`);
    if (u) out.push(u);
  }
  return out;
}

// ---- pricing (all TRY, all end in 90; numbers come from the CSVs) ----
/** Turkish-style price text: 4.490 TL */
export function formatTl(n: number) {
  return `${new Intl.NumberFormat("tr-TR").format(n)} TL`;
}

/** 30% off, rounded down to the nearest 100, then +90 (4.490 → 3.190). */
export function disc30(n: number) {
  return Math.floor((n * 0.7) / 100) * 100 + 90;
}

/** Piece price = product price + price_add_tl of each chosen option. */
export function piecePrice(p: CatalogProduct, adds: number[], factor = 1) {
  return adjustPrice(p.price + adds.reduce((s, a) => s + a, 0), factor);
}

/**
 * The most expensive piece is full price; every other piece is 30% off.
 * Ties keep the main product at full price.
 */
export function orderTotals(mainPiece: number, addons: Addon[]) {
  const pieces = [
    { full: mainPiece, discounted: disc30(mainPiece) },
    ...addons.map((a) => ({ full: a.normal_price_tl, discounted: disc30(a.normal_price_tl) })),
  ];
  let fullIdx = 0;
  pieces.forEach((p, i) => {
    if (p.full > (pieces[fullIdx]?.full ?? 0)) fullIdx = i;
  });
  const total = pieces.reduce((s, p, i) => s + (i === fullIdx ? p.full : p.discounted), 0);
  const fullSum = pieces.reduce((s, p) => s + p.full, 0);
  return { total, savings: fullSum - total, fullIdx };
}

export function adjustPrice(amount: number, factor = 1) {
  return Math.ceil((amount * factor + 10 - 1e-8) / 100) * 100 - 10;
}
export function priceFactor(liveUsd: number, settings: { price_base_usd_try: number; auto_price_adjust: boolean; price_step_percent: number }) {
  if (!settings.auto_price_adjust || settings.price_base_usd_try <= 0 || settings.price_step_percent <= 0) return 1;
  const step = settings.price_step_percent / 100;
  const ratio = liveUsd / settings.price_base_usd_try;
  return 1 + step * Math.max(0, Math.floor((ratio - 1 + 1e-10) / step));
}
export function adjustedAddons(addons: Addon[], products: CatalogProduct[], groups: OptionGroup[], factor: number): Addon[] {
  return addons.flatMap(a => {
    const product = findProduct(a.product, products);
    if (!product) return [];
    const option = groups.filter(g => product.option_groups.includes(g.group_id)).flatMap(g => g.options).find(o => o.option === a.option);
    if (a.option && !option) return [];
    const full = piecePrice(product, [option?.price_add_tl ?? 0], factor);
    return [{ ...a, normal_price_tl: full, addon_price_tl: disc30(full) }];
  });
}
