import { queryOptions } from "@tanstack/react-query";
import { METALS, type CustomBaseRow, type MetalType, type PriceRow } from "./pricing";
import { SEED } from "./seed";

export interface Product {
  product_id: string;
  product_name_en: string;
  product_name_tr: string;
  description_en: string;
  description_tr: string;
  image_urls: string[];
  teeth_count: number | "any";
  active: boolean;
  sort_order: number;
}
export interface FaqRow { question_en: string; question_tr: string; answer_en: string; answer_tr: string; sort_order: number }
export interface Settings { whatsapp_number: string; scan_email: string; metal_colors: string[]; currency_symbol: string; usd_try: number; eur_try: number }
export interface SheetData { products: Product[]; prices: PriceRow[]; customBase: CustomBaseRow[]; faq: FaqRow[]; settings: Settings }

/**
 * Set VITE_PRICE_SHEET_ID to the ID of the Price Sheet (File → Share → "Anyone with the link: Viewer").
 * Without it the site uses the built-in seed data.
 */
const SHEET_ID = import.meta.env["VITE_PRICE_SHEET_ID"] as string | undefined;

export function parseCsv(text: string): Record<string, string>[] {
  const rows: string[][] = [];
  let row: string[] = [], cell = "", q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"' && text[i + 1] === '"') { cell += '"'; i++; }
      else if (c === '"') q = false;
      else cell += c;
    } else if (c === '"') q = true;
    else if (c === ",") { row.push(cell); cell = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(cell); rows.push(row); row = []; cell = "";
    } else cell += c;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  const [head, ...body] = rows;
  if (!head) return [];
  const keys = head.map((h) => h.trim());
  return body.filter((r) => r.some((v) => v.trim())).map((r) => Object.fromEntries(keys.map((k, i) => [k, (r[i] ?? "").trim()])));
}

const num = (v: string | undefined) => (v === "" || v == null ? null : Number(v.replace(/[^\d.,-]/g, "").replace(",", ".")));

type Row = Record<"product_id"|"product_name_en"|"product_name_tr"|"description_en"|"description_tr"|"image_urls"|"teeth_count"|"active"|"sort_order"|"metal_type"|"price"|"currency"|"pricing_mode"|"first_tooth_price"|"extra_tooth_price"|"note_en"|"note_tr"|"question_en"|"question_tr"|"answer_en"|"answer_tr"|"whatsapp_number"|"scan_email"|"metal_colors"|"currency_symbol"|"usd_try"|"eur_try", string>;

async function tab(name: string): Promise<Row[]> {
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(name)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Sheet tab ${name} failed [${res.status}]`);
  return parseCsv(await res.text()) as Row[];
}

async function loadSheet(): Promise<SheetData> {
  if (!SHEET_ID) return SEED;
  try {
    const [p = [], pr = [], cb = [], f = [], s = []] = await Promise.all(["Products", "Prices", "Custom Base Prices", "FAQ", "Settings"].map(tab));
    const st: Partial<Row> = s?.[0] ?? {};
    return {
      products: p.map((r) => ({
        product_id: r.product_id,
        product_name_en: r.product_name_en,
        product_name_tr: r.product_name_tr || r.product_name_en,
        description_en: r.description_en,
        description_tr: r.description_tr || r.description_en,
        image_urls: r.image_urls.split(",").map((u) => u.trim()).filter(Boolean),
        teeth_count: r.teeth_count === "any" || !r.teeth_count ? "any" : Number(r.teeth_count),
        active: r.active?.toUpperCase() === "TRUE",
        sort_order: Number(r.sort_order) || 0,
      })),
      prices: pr
        .filter((r) => METALS.includes(r.metal_type as MetalType))
        .map((r) => ({
          product_id: r.product_id,
          metal_type: r.metal_type as MetalType,
          price: num(r.price),
          currency: r.currency === "USD" ? "USD" : "TRY",
          pricing_mode: r.pricing_mode === "per_tooth" ? "per_tooth" : "per_set",
        })),
      customBase: cb
        .filter((r) => METALS.includes(r.metal_type as MetalType))
        .map((r) => ({
          metal_type: r.metal_type as MetalType,
          first_tooth_price: num(r.first_tooth_price),
          extra_tooth_price: num(r.extra_tooth_price),
          currency: r.currency === "USD" ? "USD" : "TRY",
          note_en: r.note_en,
          note_tr: r.note_tr,
        })),
      faq: f.map((r) => ({ ...r, sort_order: Number(r.sort_order) || 0 })) as FaqRow[],
      settings: {
        whatsapp_number: (st.whatsapp_number || SEED.settings.whatsapp_number).replace(/\D/g, ""),
        scan_email: st.scan_email || SEED.settings.scan_email,
        metal_colors: (st.metal_colors || "Yellow, White, Rose").split(",").map((c) => c.trim()).filter(Boolean),
        currency_symbol: st.currency_symbol || "₺",
        usd_try: num(st.usd_try ?? "") || SEED.settings.usd_try,
        eur_try: num(st.eur_try ?? "") || SEED.settings.eur_try,
      },
    };
  } catch (e) {
    console.error("Price Sheet load failed, using seed data", e);
    return SEED;
  }
}

export const sheetQuery = queryOptions({
  queryKey: ["price-sheet"],
  queryFn: loadSheet,
  staleTime: 5 * 60 * 1000,
});
