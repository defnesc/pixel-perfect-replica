export function formatTry(n: number, lang: "en" | "tr", symbol = "₺") {
  return symbol + new Intl.NumberFormat(lang === "tr" ? "tr-TR" : "en-US").format(n);
}
