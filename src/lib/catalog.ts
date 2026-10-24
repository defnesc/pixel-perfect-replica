import productsCsv from "@/data/products.csv?raw";
import optionsCsv from "@/data/product_options.csv?raw";
import addonsCsv from "@/data/addons.csv?raw";
import { parseCsv } from "./sheet";

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
}

export interface CatalogOption {
  option: string;
  option_tr: string;
  price_add_tl: number;
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
  addon_id: string;
  name: string;
  name_tr: string;
  photo_folder: string;
  normal_price_tl: number;
  addon_price_tl: number;
  sort_order: number;
}

const num = (v: string | undefined) => (v && v.trim() !== "" ? Number(v) : null);

export const PRODUCTS: CatalogProduct[] = parseCsv(productsCsv).map((r) => ({
  folder: r.folder ?? "",
  name: r.name ?? "",
  name_tr: r.name_tr ?? "",
  section: r.section === "custom" ? "custom" : "classics",
  sort_order: Number(r.sort_order) || 0,
  photos: Number(r.photos) || 1,
  main_image: r.main_image ?? "",
  hover_image: r.hover_image ?? "",
  price: Number(r.price) || 0,
  compare_at_price: num(r.compare_at_price),
  price_type: r.price_type === "estimate" ? "estimate" : "fixed",
  price_note: r.price_note ?? "",
  price_note_tr: r.price_note_tr ?? "",
  badge: r.badge ?? "",
  badge_tr: r.badge_tr ?? "",
  option_groups: (r.option_groups ?? "").split(";").map((s) => s.trim()).filter(Boolean),
}));

export const OPTION_GROUPS: OptionGroup[] = (() => {
  const byId = new Map<string, OptionGroup>();
  for (const r of parseCsv(optionsCsv)) {
    const id = r.group_id ?? "";
    if (!byId.has(id)) byId.set(id, { group_id: id, label: r.group_label ?? "", label_tr: r.group_label_tr ?? "", options: [] });
    byId.get(id)!.options.push({
      option: r.option ?? "",
      option_tr: r.option_tr ?? "",
      price_add_tl: Number(r.price_add_tl) || 0,
      isDefault: r.default === "yes",
      sort_order: Number(r.sort_order) || 0,
      small_note: r.small_note ?? "",
      small_note_tr: r.small_note_tr ?? "",
    });
  }
  for (const g of byId.values()) g.options.sort((a, b) => a.sort_order - b.sort_order);
  return [...byId.values()];
})();

export const ADDONS: Addon[] = parseCsv(addonsCsv)
  .map((r) => ({
    addon_id: r.addon_id ?? "",
    name: r.name ?? "",
    name_tr: r.name_tr ?? "",
    photo_folder: r.photo_folder ?? "",
    normal_price_tl: Number(r.normal_price_tl) || 0,
    addon_price_tl: Number(r.addon_price_tl) || 0,
    sort_order: Number(r.sort_order) || 0,
  }))
  .sort((a, b) => a.sort_order - b.sort_order);

export const classics = () => PRODUCTS.filter((p) => p.section === "classics").sort((a, b) => a.sort_order - b.sort_order);
export const customDesigns = () => PRODUCTS.filter((p) => p.section === "custom").sort((a, b) => a.sort_order - b.sort_order);
export const findProduct = (folder: string) => PRODUCTS.find((p) => p.folder === folder);
export const groupOf = (p: CatalogProduct, id: string) => (p.option_groups.includes(id) ? OPTION_GROUPS.find((g) => g.group_id === id) : undefined);

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
export function piecePrice(p: CatalogProduct, adds: number[]) {
  return p.price + adds.reduce((s, a) => s + a, 0);
}

/**
 * The most expensive piece is full price; every other piece is 30% off.
 * Ties keep the main product at full price.
 */
export function orderTotals(mainPiece: number, addons: Addon[]) {
  const pieces = [
    { full: mainPiece, discounted: disc30(mainPiece) },
    ...addons.map((a) => ({ full: a.normal_price_tl, discounted: a.addon_price_tl })),
  ];
  let fullIdx = 0;
  pieces.forEach((p, i) => {
    if (p.full > pieces[fullIdx]!.full) fullIdx = i;
  });
  const total = pieces.reduce((s, p, i) => s + (i === fullIdx ? p.full : p.discounted), 0);
  const fullSum = pieces.reduce((s, p) => s + p.full, 0);
  return { total, savings: fullSum - total, fullIdx };
}
