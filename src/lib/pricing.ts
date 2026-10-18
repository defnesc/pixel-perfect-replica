export type MetalType = "Silver" | "14K Gold" | "18K Gold";
export const METALS: MetalType[] = ["Silver", "14K Gold", "18K Gold"];

export interface PriceRow {
  product_id: string;
  metal_type: MetalType;
  price: number | null;
  currency: "TRY" | "USD";
  pricing_mode: "per_set" | "per_tooth";
}

export interface CustomBaseRow {
  metal_type: MetalType;
  first_tooth_price: number | null;
  extra_tooth_price: number | null;
  currency: "TRY" | "USD";
  note_en: string;
  note_tr: string;
}

/** Convert to TRY. USD → TRY with usd_try, rounded to nearest 10 TL. Null stays null. */
export function toTry(amount: number | null, currency: string, usdTry: number): number | null {
  if (amount === null || !Number.isFinite(amount)) return null;
  if (currency === "USD") return Math.round((amount * usdTry) / 10) * 10;
  return Math.round(amount);
}

/** Price for a product given metal + number of selected teeth. */
export function computePrice(row: PriceRow | undefined, teethCount: number, usdTry: number): number | null {
  if (!row) return null;
  const unit = toTry(row.price, row.currency, usdTry);
  if (unit === null) return null;
  if (row.pricing_mode === "per_tooth") return unit * Math.max(1, teethCount);
  return unit;
}

/** Lowest "from" price across a product's metals (per_tooth counted as one tooth). */
export function lowestPrice(rows: PriceRow[], usdTry: number): number | null {
  const vals = rows.map((r) => computePrice(r, 1, usdTry)).filter((v): v is number => v !== null);
  return vals.length ? Math.min(...vals) : null;
}

export function formatTry(n: number, lang: "en" | "tr", symbol = "₺") {
  return symbol + new Intl.NumberFormat(lang === "tr" ? "tr-TR" : "en-US").format(n);
}
