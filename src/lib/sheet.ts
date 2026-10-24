import { queryOptions } from "@tanstack/react-query";
import { SEED } from "./seed";

export interface FaqRow { question_en: string; question_tr: string; answer_en: string; answer_tr: string; sort_order: number }
export interface Settings { whatsapp_number: string; scan_email: string; currency_symbol: string; usd_try: number; eur_try: number }
export interface SheetData { faq: FaqRow[]; settings: Settings }

/**
 * Set VITE_PRICE_SHEET_ID to the ID of the Price Sheet (File → Share → "Anyone with the link: Viewer").
 * Only the FAQ and Settings tabs are read; the product catalog lives in src/data/*.csv.
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

type Row = Record<"question_en" | "question_tr" | "answer_en" | "answer_tr" | "sort_order" | "whatsapp_number" | "scan_email" | "currency_symbol" | "usd_try" | "eur_try", string>;

async function tab(name: string): Promise<Row[]> {
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(name)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Sheet tab ${name} failed [${res.status}]`);
  return parseCsv(await res.text()) as Row[];
}

async function loadSheet(): Promise<SheetData> {
  if (!SHEET_ID) return SEED;
  try {
    const [f = [], s = []] = await Promise.all(["FAQ", "Settings"].map(tab));
    const st: Partial<Row> = s?.[0] ?? {};
    return {
      faq: f.map((r) => ({ ...r, sort_order: Number(r.sort_order) || 0 })) as FaqRow[],
      settings: {
        whatsapp_number: (st.whatsapp_number || SEED.settings.whatsapp_number).replace(/\D/g, ""),
        scan_email: st.scan_email || SEED.settings.scan_email,
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
