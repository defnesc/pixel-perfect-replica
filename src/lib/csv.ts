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

/** Accept Turkish decimals and integer thousands separators without coercing bad cells to zero. */
export function parseNumber(value: string | undefined): number | null {
  const raw = (value ?? "").trim();
  if (!raw) return null;
  let text = raw.replace(/\s/g, "");
  if (/^-?\d{1,3}([.,]\d{3})+$/.test(text)) text = text.replace(/[.,]/g, "");
  else if (text.includes(",") && text.includes(".")) {
    const decimal = text.lastIndexOf(",") > text.lastIndexOf(".") ? "," : ".";
    text = text.replace(decimal === "," ? /\./g : /,/g, "").replace(",", ".");
  } else text = text.replace(",", ".");
  if (!/^-?\d+(\.\d+)?$/.test(text)) return null;
  const result = Number(text);
  return Number.isFinite(result) ? result : null;
}
