import { useEffect, useSyncExternalStore } from "react";
import { formatTry } from "./pricing";

export type Currency = "TRY" | "EUR" | "USD";
export const CURRENCIES: Currency[] = ["TRY", "EUR", "USD"];
export const CURRENCY_SYMBOL: Record<Currency, string> = { TRY: "₺", EUR: "€", USD: "$" };
export interface Rates { usd_try: number; eur_try: number; foreign_round_up_to?: number; auto_rates?: boolean }

/** Show a TRY amount in another currency. USD/EUR round UP to the nearest 5; TRY stays exact. */
export function convertFromTry(tryAmount: number, cur: Currency, rates: Rates): number {
  const step = rates.foreign_round_up_to ?? 5;
  if (cur === "USD") return Math.ceil(tryAmount / rates.usd_try / step) * step;
  if (cur === "EUR") return Math.ceil(tryAmount / rates.eur_try / step) * step;
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

/** Price text for order messages: chosen currency plus the TRY amount. The TL amount is the real price. */
export function formatForMessage(tryAmount: number, cur: Currency, lang: "en" | "tr", rates: Rates) {
  const tl = formatTry(tryAmount, lang);
  return cur === "TRY" ? tl : `${formatPrice(tryAmount, cur, lang, rates)} (${tl})`;
}

// ---- live exchange rates (frankfurter → er-api → sheet/seed fallback), cached 12 h ----
const RATES_KEY = "333-rates";
const RATES_TTL = 12 * 60 * 60 * 1000;
let liveRates: Rates | null = null;
const rateSubs = new Set<() => void>();
let fetching = false;

function setLiveRates(r: Rates) {
  liveRates = r;
  rateSubs.forEach((f) => f());
}

async function fetchLiveRates() {
  try {
    const res = await fetch("https://api.frankfurter.app/latest?from=TRY&to=USD,EUR");
    if (!res.ok) throw new Error(String(res.status));
    const j = (await res.json()) as { rates?: { USD?: number; EUR?: number } };
    if (j.rates?.USD && j.rates?.EUR) return { usd_try: 1 / j.rates.USD, eur_try: 1 / j.rates.EUR };
    throw new Error("bad payload");
  } catch {
    const res = await fetch("https://open.er-api.com/v6/latest/TRY");
    if (!res.ok) throw new Error(String(res.status));
    const j = (await res.json()) as { rates?: { USD?: number; EUR?: number } };
    if (j.rates?.USD && j.rates?.EUR) return { usd_try: 1 / j.rates.USD, eur_try: 1 / j.rates.EUR };
    throw new Error("bad payload");
  }
}

function ensureLiveRates() {
  if (fetching || liveRates) return;
  try {
    const raw = window.localStorage.getItem(RATES_KEY);
    if (raw) {
      const saved = JSON.parse(raw) as { usd_try?: number; eur_try?: number; ts?: number };
      if (saved.usd_try && saved.eur_try && saved.ts && Date.now() - saved.ts < RATES_TTL) {
        setLiveRates({ usd_try: saved.usd_try, eur_try: saved.eur_try });
        return;
      }
    }
  } catch { /* ignore */ }
  fetching = true;
  fetchLiveRates()
    .then((r) => {
      try { window.localStorage.setItem(RATES_KEY, JSON.stringify({ ...r, ts: Date.now() })); } catch { /* ignore */ }
      setLiveRates(r);
    })
    .catch(() => { /* keep sheet/seed fallback */ })
    .finally(() => { fetching = false; });
}

/** Live rates when available, otherwise the sheet/seed fallback passed in. */
export function useLiveRates(fallback: Rates): Rates {
  const live = useSyncExternalStore(
    (f) => { rateSubs.add(f); return () => rateSubs.delete(f); },
    () => liveRates,
    () => null,
  );
  useEffect(() => { if (fallback.auto_rates !== false) ensureLiveRates(); }, [fallback.auto_rates]);
  return safeRates(live, fallback);
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

export function safeRates(live: Rates | null, backup: Rates): Rates {
  const accept = (value: number | undefined, base: number) => value !== undefined && Number.isFinite(value) && value >= base * 0.75 && value <= base * 1.25 ? value : base;
  if (backup.auto_rates === false) return backup;
  return { ...backup, usd_try: accept(live?.usd_try, backup.usd_try), eur_try: accept(live?.eur_try, backup.eur_try) };
}
