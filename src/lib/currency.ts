import { useEffect, useSyncExternalStore } from "react";
import { formatTry } from "./pricing";

export type Currency = "TRY" | "EUR" | "USD";
export const CURRENCIES: Currency[] = ["TRY", "EUR", "USD"];
export const CURRENCY_SYMBOL: Record<Currency, string> = { TRY: "₺", EUR: "€", USD: "$" };
export interface Rates { usd_try: number; eur_try: number }

/** Show a TRY amount in another currency, rounded to whole units. TRY is the base. */
export function convertFromTry(tryAmount: number, cur: Currency, rates: Rates): number {
  if (cur === "USD") return Math.round(tryAmount / rates.usd_try);
  if (cur === "EUR") return Math.round(tryAmount / rates.eur_try);
  return Math.round(tryAmount);
}

/** Convert an amount typed in `cur` back to TRY (rounded to nearest 10 TL like the rest of the site). */
export function convertToTry(amount: number, cur: Currency, rates: Rates): number {
  if (cur === "TRY") return Math.round(amount);
  const rate = cur === "USD" ? rates.usd_try : rates.eur_try;
  return Math.round((amount * rate) / 10) * 10;
}

export function formatPrice(tryAmount: number, cur: Currency, lang: "en" | "tr", rates: Rates, tryText = "₺") {
  if (cur === "TRY") return formatTry(tryAmount, lang, tryText);
  return CURRENCY_SYMBOL[cur] + new Intl.NumberFormat(lang === "tr" ? "tr-TR" : "en-US").format(convertFromTry(tryAmount, cur, rates));
}

/** Price text for order messages: chosen currency plus the TRY amount. */
export function formatForMessage(tryAmount: number, cur: Currency, lang: "en" | "tr", rates: Rates) {
  const tl = formatTry(tryAmount, lang);
  return cur === "TRY" ? tl : `${formatPrice(tryAmount, cur, lang, rates)} (${tl})`;
}

// ---- chosen currency store (remembered in the browser, safe when storage is blocked) ----
const KEY = "333-currency";
let current: Currency = "TRY";
const subs = new Set<() => void>();
const isCur = (v: unknown): v is Currency => v === "TRY" || v === "EUR" || v === "USD";

export function setCurrency(c: Currency) {
  current = c;
  try { window.localStorage.setItem(KEY, c); } catch { /* ignore */ }
  subs.forEach((f) => f());
}

export function useCurrency(): Currency {
  const cur = useSyncExternalStore(
    (f) => { subs.add(f); return () => subs.delete(f); },
    () => current,
    () => "TRY" as Currency,
  );
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(KEY);
      if (isCur(saved) && saved !== current) { current = saved; subs.forEach((f) => f()); }
    } catch { /* ignore */ }
  }, []);
  return cur;
}
