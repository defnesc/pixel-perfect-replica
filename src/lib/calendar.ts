import { parseNumber } from "./csv";

/** Order calendar: pure date maths on Istanbul calendar days (days since 1970-01-01). */
export interface CalendarSettings { spots: number | null; cutoffWeekday: number; minDays: number; maxDays: number; showDays: number }
export interface Occasion { name_tr: string; phrase_tr: string; name_en: string; date: number; last: number }
export interface CalendarView {
  batch?: { spots: number; cutoff: number };
  delivery?: { from: number; to: number };
  occasion?: { occasion: Occasion; last: number };
}
type Row = Record<string, string>;
const DAY = 86400000;
export const CALENDAR_BACKUP: CalendarSettings = { spots: null, cutoffWeekday: 2, minDays: 14, maxDays: 21, showDays: 45 };

const int = (v: string | undefined, min: number, max = Infinity) => {
  const n = parseNumber(v);
  return n !== null && Number.isInteger(n) && n >= min && n <= max ? n : null;
};
export function parseCalendarSettings(row: Row): CalendarSettings {
  const b = CALENDAR_BACKUP;
  return {
    spots: int(row["batch_spots_left"], 0),
    cutoffWeekday: int(row["batch_cutoff_weekday"], 1, 7) ?? b.cutoffWeekday,
    minDays: int(row["delivery_min_days"], 0) ?? b.minDays,
    maxDays: int(row["delivery_max_days"], 0) ?? b.maxDays,
    showDays: int(row["occasion_show_days"], 0) ?? b.showDays,
  };
}

/** Weekday 1 = Monday … 7 = Sunday. */
export const weekday = (day: number) => ((new Date(day * DAY).getUTCDay() + 6) % 7) + 1;
const ymd = (y: number, m: number, d: number) => {
  const t = Date.UTC(y, m - 1, d);
  const x = new Date(t);
  return x.getUTCFullYear() === y && x.getUTCMonth() === m - 1 && x.getUTCDate() === d ? t / DAY : null;
};
export function istanbulDay(now: Date): number {
  const p = Object.fromEntries(new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Istanbul", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(now).map(x => [x.type, x.value]));
  return ymd(Number(p.year), Number(p.month), Number(p.day)) ?? Math.floor(now.getTime() / DAY);
}
/** Accepts 2027-02-14, 14.02.2027, Sheets M/D/YYYY, Date(2027,1,14) or a serial number. */
export function parseDay(value: string | undefined): number | null {
  const s = (value ?? "").trim();
  let m;
  if ((m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/))) return ymd(+m[1]!, +m[2]!, +m[3]!);
  if ((m = s.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/))) return ymd(+m[3]!, +m[2]!, +m[1]!);
  if ((m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/))) return ymd(+m[3]!, +m[1]!, +m[2]!);
  if ((m = s.match(/^Date\((\d{4}),(\d{1,2}),(\d{1,2})/))) return ymd(+m[1]!, +m[2]! + 1, +m[3]!);
  if (/^\d{5}$/.test(s)) return Number(s) - 25569;
  return null;
}
export const nextCutoff = (today: number, wd: number) => today + ((wd - weekday(today) + 7) % 7);
export const autoLastOrder = (date: number, wd: number, maxDays: number) => {
  const latest = date - maxDays;
  return latest - ((weekday(latest) - wd + 7) % 7);
};

export function parseOccasions(rows: Row[], s: CalendarSettings): Occasion[] {
  return rows.flatMap(r => {
    if ((r["active"] ?? "").trim().toLowerCase() !== "yes") return [];
    const date = parseDay(r["date"]);
    if (date === null || !r["name_tr"] || !r["name_en"]) return [];
    const given = r["last_order_date"]?.trim() ? parseDay(r["last_order_date"]) : null;
    if (r["last_order_date"]?.trim() && given === null) return [];
    return [{ name_tr: r["name_tr"], phrase_tr: r["phrase_tr"] ?? "", name_en: r["name_en"], date, last: given ?? autoLastOrder(date, s.cutoffWeekday, s.maxDays) }];
  }).sort((a, b) => a.last - b.last);
}

export function orderCalendar(today: number, s: CalendarSettings, occasions: Occasion[]): CalendarView {
  const thisWeek = nextCutoff(today, s.cutoffWeekday);
  const full = s.spots === 0;
  const base = full ? thisWeek + 7 : thisWeek;
  const view: CalendarView = {};
  if (s.spots !== null) view.batch = { spots: s.spots, cutoff: base };
  if (s.minDays <= s.maxDays) view.delivery = { from: base + s.minDays, to: base + s.maxDays };
  const earliest = full ? base - 6 : today;
  const o = occasions.find(x => x.last >= earliest && x.last >= today && x.last - today <= s.showDays);
  if (o) view.occasion = { occasion: o, last: o.last };
  return view;
}

const fmt = (day: number, lang: "en" | "tr", opts: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat(lang === "tr" ? "tr-TR" : "en-GB", { timeZone: "UTC", ...opts }).format(new Date(day * DAY));
/** "3 Kasım Salı" / "Tuesday, 3 November" */
export const formatWeekdayDate = (day: number, lang: "en" | "tr") =>
  lang === "tr" ? `${fmt(day, lang, { day: "numeric", month: "long" })} ${fmt(day, lang, { weekday: "long" })}` : `${fmt(day, lang, { weekday: "long" })}, ${fmt(day, lang, { day: "numeric", month: "long" })}`;
export const formatDate = (day: number, lang: "en" | "tr") => fmt(day, lang, { day: "numeric", month: "long" });
/** "17–24 Kasım" or "28 Kasım – 5 Aralık" */
export function formatRange(from: number, to: number, lang: "en" | "tr") {
  const a = new Date(from * DAY), b = new Date(to * DAY);
  if (a.getUTCMonth() === b.getUTCMonth() && a.getUTCFullYear() === b.getUTCFullYear()) return `${a.getUTCDate()}–${formatDate(to, lang)}`;
  return `${formatDate(from, lang)} – ${formatDate(to, lang)}`;
}
