import { useSuspenseQuery } from "@tanstack/react-query";
import { sheetQuery } from "./sheet";
import { adjustedAddons, adjustPrice, formatTl, priceFactor } from "./catalog";
import { useCurrency, useLiveRates, formatPrice } from "./currency";
import { useLang } from "@/i18n";

/** Every displayed/order price comes from the same loaded catalog and safe rates. */
export function usePrices() {
  const { data } = useSuspenseQuery(sheetQuery);
  const lang = useLang();
  const cur = useCurrency();
  const rates = useLiveRates(data.settings);
  const factor = priceFactor(rates.usd_try, data.settings);
  const fmt = (n: number) => cur === "TRY" ? formatTl(n) : formatPrice(n, cur, lang, rates, data.settings.currency_symbol);
  return { ...data, cur, rates, factor, fmt, adjusted: (n: number) => adjustPrice(n, factor), pricedAddons: adjustedAddons(data.addons, data.products, data.optionGroups, factor) };
}
