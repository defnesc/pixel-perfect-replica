import { describe, expect, it } from "vitest";
import { autoLastOrder, formatRange, istanbulDay, nextCutoff, orderCalendar, parseCalendarSettings, parseDay, parseOccasions, CALENDAR_BACKUP, formatDate } from "./calendar";
import { parseCsv } from "./csv";
import { readFileSync } from "node:fs";

const d = (s: string) => parseDay(s)!;
const rows = parseCsv(readFileSync("src/data/occasions.csv", "utf8"));
const s = { ...CALENDAR_BACKUP, spots: 4 };

describe("order calendar", () => {
  it("finds the next Tuesday cutoff from every weekday", () => {
    // 2026-11-02 is Monday
    const expected = ["2026-11-03", "2026-11-03", "2026-11-10", "2026-11-10", "2026-11-10", "2026-11-10", "2026-11-10"];
    expected.forEach((e, i) => expect(nextCutoff(d("2026-11-02") + i, 2)).toBe(d(e)));
  });
  it("uses Istanbul time around 23:59 on the cutoff day", () => {
    expect(nextCutoff(istanbulDay(new Date("2026-11-03T20:58:00Z")), 2)).toBe(d("2026-11-03"));
    expect(nextCutoff(istanbulDay(new Date("2026-11-03T21:00:00Z")), 2)).toBe(d("2026-11-10"));
  });
  it("moves to next week when no spots are left", () => {
    const v = orderCalendar(d("2026-11-02"), { ...s, spots: 0 }, []);
    expect(v).not.toHaveProperty("batch");
    expect(v.delivery).toEqual({ from: d("2026-11-24"), to: d("2026-12-01") });
  });
  it("formats delivery ranges within and across months", () => {
    expect(formatRange(d("2026-11-17"), d("2026-11-24"), "tr")).toBe("17–24 Kasım");
    expect(formatRange(d("2026-11-28"), d("2026-12-05"), "tr")).toBe("28 Kasım – 5 Aralık");
    expect(formatRange(d("2026-11-17"), d("2026-11-24"), "en")).toBe("17–24 November");
  });
  it("calculates automatic last order dates", () => {
    const got = parseOccasions(rows, s).map(o => formatDate(o.last, "tr"));
    expect(got).toEqual(["8 Aralık", "19 Ocak", "9 Şubat", "13 Nisan", "25 Mayıs"]);
    expect(autoLastOrder(d("2027-02-14"), 2, 21)).toBe(d("2027-01-19"));
  });
  it("shows only the nearest special day within the show window", () => {
    const o = parseOccasions(rows, s);
    expect(orderCalendar(d("2026-10-20"), s, o).occasion).toBeUndefined(); // 49 days before 8 Dec
    expect(orderCalendar(d("2026-10-27"), s, o).occasion?.occasion.name_en).toBe("New Year");
    expect(orderCalendar(d("2026-12-09"), s, o).occasion?.occasion.name_en).toBe("Valentine's Day");
  });
  it("hides lines for empty or invalid values", () => {
    const c = parseCalendarSettings({ batch_spots_left: "", batch_cutoff_weekday: "9" });
    expect(c.spots).toBeNull();
    expect(c.cutoffWeekday).toBe(2);
    expect(parseCalendarSettings({ batch_spots_left: "abc" }).spots).toBeNull();
    expect(parseOccasions([{ name_tr: "X", name_en: "X", date: "bad", active: "yes" }, { name_tr: "Y", name_en: "Y", date: "2027-01-01", active: "no" }], s)).toEqual([]);
    expect(parseDay("14.02.2027")).toBe(d("2027-02-14"));
  });
  it("shows no box when every line is hidden", () => {
    expect(orderCalendar(d("2026-10-20"), { ...CALENDAR_BACKUP, minDays: 30, maxDays: 10 }, [])).toEqual({});
  });
});
