import { queryOptions } from "@tanstack/react-query";
import { SEED } from "./seed";
import { parseCsv, parseNumber } from "./csv";
import { PRODUCTS, OPTION_GROUPS, ADDONS, parseProducts, parseOptions, parseAddons, type CatalogProduct, type OptionGroup, type Addon } from "./catalog";
import settingsCsv from "@/data/settings.csv?raw";
import estimatorCsv from "@/data/custom_estimator.csv?raw";
import occasionsCsv from "@/data/occasions.csv?raw";
import { parseCalendarSettings, parseOccasions, type CalendarSettings, type Occasion } from "./calendar";
export { parseCsv } from "./csv";

export interface FaqRow { question_en: string; question_tr: string; answer_en: string; answer_tr: string; sort_order: number }
export interface Settings { whatsapp_number: string; scan_email: string; currency_symbol: string; usd_try: number; eur_try: number; auto_rates: boolean; foreign_round_up_to: number; price_base_usd_try: number; auto_price_adjust: boolean; price_step_percent: number; gift_card_shipping_tl: number; gift_card_free_shipping_from: number }
export interface EstimatorRow { group: string; option: string; option_tr: string; price_add_tl: number; note: string }
export interface SheetData { faq: FaqRow[]; settings: Settings; products: CatalogProduct[]; optionGroups: OptionGroup[]; addons: Addon[]; estimator: EstimatorRow[]; calendar: CalendarSettings; occasions: Occasion[] }
export const SHEET_ID = "13aChzrGNnNUg2qpmoz6qEQJjQpfcbz9VblsaRyRIkjI";
type Row = Record<string, string>;

export function parseSettings(row: Row, backup = SEED.settings): Settings {
  const positive = (key: keyof Settings) => {
    const n = parseNumber(row[key]);
    return n !== null && n > 0 ? n : Number(backup[key]);
  };
  const flag = (key: "auto_rates" | "auto_price_adjust") => row[key] === "yes" ? true : row[key] === "no" ? false : backup[key];
  return {
    whatsapp_number: row["whatsapp_number"]?.replace(/\D/g, "") || backup.whatsapp_number,
    scan_email: row["scan_email"] || backup.scan_email,
    currency_symbol: row["currency_symbol"] || backup.currency_symbol,
    usd_try: positive("usd_try"), eur_try: positive("eur_try"),
    auto_rates: flag("auto_rates"), foreign_round_up_to: positive("foreign_round_up_to"),
    price_base_usd_try: positive("price_base_usd_try"), auto_price_adjust: flag("auto_price_adjust"), price_step_percent: positive("price_step_percent"),
    gift_card_shipping_tl: parseNumber(row["gift_card_shipping_tl"]) === 0 ? 0 : positive("gift_card_shipping_tl"), gift_card_free_shipping_from: positive("gift_card_free_shipping_from"),
  };
}
const parseEstimator = (rows: Row[]): EstimatorRow[] => rows.map(r => ({ group: r["group"] ?? "", option: r["option"] ?? "", option_tr: r["option_tr"] ?? "", price_add_tl: parseNumber(r["price_add_tl"]) ?? 0, note: r["note"] ?? "" }));
export const BUILTIN: SheetData = { products: PRODUCTS, optionGroups: OPTION_GROUPS, addons: ADDONS, estimator: parseEstimator(parseCsv(estimatorCsv)), settings: parseSettings(parseCsv(settingsCsv)[0] ?? {}), faq: SEED.faq, ...calendarFrom(parseCsv(settingsCsv)[0] ?? {}, parseCsv(occasionsCsv)) };
function calendarFrom(settingsRow: Row, occasionRows: Row[]) {
  const calendar = parseCalendarSettings(settingsRow);
  return { calendar, occasions: parseOccasions(occasionRows, calendar) };
}

/** Restore invalid rows by identity; valid omissions in the sheet remain omissions. */
export function safeRows(rows: Row[], backup: Row[], identity: (r: Row) => string, valid: (r: Row) => boolean, tabName: string): Row[] {
  if (!rows.length || rows.every(r => !identity(r) || identity(r) === "undefined/undefined")) return backup;
  return rows.flatMap(row => {
    if (valid(row)) return [row];
    console.warn(`Invalid price in ${tabName}: ${identity(row)}; using backup row`);
    const fallback = backup.find(r => identity(r) === identity(row));
    return fallback ? [fallback] : [];
  });
}
const productBackup: Row[] = PRODUCTS.map(p => ({ ...Object.fromEntries(Object.entries(p).map(([k,v]) => [k, String(v ?? "")])), option_groups: p.option_groups.join(";"), per_tooth: p.per_tooth ? "yes" : "" }));
const optionBackup: Row[] = OPTION_GROUPS.flatMap(g => g.options.map(o => ({ group_id: g.group_id, group_label: g.label, group_label_tr: g.label_tr, ...Object.fromEntries(Object.entries(o).map(([k,v]) => [k, String(v)])), default: o.isDefault ? "yes" : "" })));
const addonBackup: Row[] = ADDONS.map(a => Object.fromEntries(Object.entries(a).map(([k,v]) => [k,String(v)])));
const estimatorBackup = parseCsv(estimatorCsv);
const validNumber = (r: Row, key: string, minimum: number) => { const n = parseNumber(r[key]); return n !== null && n >= minimum; };

async function tab(name: string): Promise<Row[]> {
  try {
    const response = await fetch(`https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&headers=1&sheet=${name}`, { signal: AbortSignal.timeout(10000) });
    if (!response.ok) throw new Error(`Sheet ${name} failed [${response.status}]`);
    const text = await response.text();
    if (text.trimStart().startsWith("<")) throw new Error(`Sheet ${name} is not public CSV`);
    return parseCsv(text);
  } catch (error) {
    console.warn(`Sheet ${name}: using built-in backup`, error);
    return [];
  }
}
export async function loadSheet(): Promise<SheetData> {
  const [products = [], options = [], addons = [], settings = [], estimator = [], faq = [], occasions = []] = await Promise.all(["Products", "Options", "Addons", "Settings", "Custom_Estimator", "FAQ", "Occasions"].map(tab));
  return {
    ...calendarFrom(settings[0] ?? parseCsv(settingsCsv)[0] ?? {}, occasions.length && "name_en" in occasions[0]! ? occasions : parseCsv(occasionsCsv)),
    products: parseProducts(safeRows(products, productBackup, r => r["folder"] ?? "", r => Boolean(r["folder"] && r["name"]) && validNumber(r, "price", 1000) && (!r["compare_at_price"] || validNumber(r, "compare_at_price", 1000)), "Products")),
    optionGroups: parseOptions(safeRows(options, optionBackup, r => `${r["group_id"]}/${r["option"]}`, r => Boolean(r["group_id"] && r["option"]) && validNumber(r, "price_add_tl", 0), "Options")),
    addons: parseAddons(safeRows(addons, addonBackup, r => r["addon_id"] ?? "", r => Boolean(r["addon_id"] && r["product"]) && validNumber(r, "normal_price_tl", 1000) && validNumber(r, "addon_price_tl", 1000), "Addons")),
    settings: parseSettings(settings[0] ?? {}, BUILTIN.settings),
    estimator: parseEstimator(safeRows(estimator, estimatorBackup, r => `${r["group"]}/${r["option"]}`, r => Boolean(r["group"] && r["option"]) && validNumber(r, "price_add_tl", -1), "Custom_Estimator")),
    faq: faq.length && faq.every(r => r["question_en"] && r["question_tr"] && r["answer_en"] && r["answer_tr"]) ? faq.map(r => ({ question_en: r["question_en"] ?? "", question_tr: r["question_tr"] ?? "", answer_en: r["answer_en"] ?? "", answer_tr: r["answer_tr"] ?? "", sort_order: parseNumber(r["sort_order"]) ?? 0 })) : SEED.faq,
  };
}
export const sheetQuery = queryOptions({ queryKey: ["price-sheet", SHEET_ID], queryFn: loadSheet, staleTime: 5 * 60 * 1000, retry: false, refetchOnWindowFocus: false, refetchOnReconnect: false });
