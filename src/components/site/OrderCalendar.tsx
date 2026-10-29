import { useEffect, useState } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useLang, useT } from "@/i18n";
import { sheetQuery } from "@/lib/sheet";
import { formatDate, formatRange, istanbulDay, orderCalendar } from "@/lib/calendar";

/** Renders "**x**" segments as pink key words. */
function Rich({ text }: { text: string }) {
  return <>{text.split("**").map((part, i) => (i % 2 ? <strong key={i} className="font-semibold text-primary">{part}</strong> : part))}</>;
}

/** Today in Istanbul, computed after hydration so server and browser agree. */
function useToday() {
  const [today, setToday] = useState<number | null>(null);
  useEffect(() => setToday(istanbulDay(new Date())), []);
  return today;
}

/** Order calendar lines with bold markers; message/log versions strip them. */
export function useCalendarLines(delivery: "show" | "hide" | "catalog" = "show") {
  const { data } = useSuspenseQuery(sheetQuery);
  const lang = useLang();
  const t = useT();
  const today = useToday();
  if (today === null) return { lines: [] as { icon: string; text: string }[], deliveryText: "" };
  const v = orderCalendar(today, data.calendar, data.occasions);
  const b = (s: string | number) => `**${s}**`;
  const lines: { icon: string; text: string }[] = [];
  const range = v.delivery ? formatRange(v.delivery.from, v.delivery.to, lang) : "";
  if (v.delivery && delivery !== "hide") lines.push({ icon: "🚚", text: `${t("cal.delivery", { range: b(range) })} __${t(delivery === "catalog" ? "cal.deliveryCatalog" : "cal.deliveryNote")}__` });
  if (v.occasion) {
    const o = v.occasion.occasion, date = b(formatDate(v.occasion.last, lang));
    lines.push({ icon: "🎁", text: lang === "tr"
      ? (o.phrase_tr ? t("cal.occasion", { name: b(o.phrase_tr), date }) : t("cal.occasionPlain", { name: b(o.name_tr), date }))
      : t("cal.occasion", { name: b(o.name_en), date }) });
  }
  return { lines, deliveryText: v.delivery && delivery !== "hide" ? range : "" };
}

export function OrderCalendar({ only, delivery = "show", className = "" }: { only?: "occasion"; delivery?: "show" | "hide" | "catalog"; className?: string }) {
  const { lines } = useCalendarLines(delivery);
  const shown = only ? lines.filter(l => l.icon === "🎁") : lines;
  if (!shown.length) return null;
  return (
    <div className={`rounded-[20px] bg-surface px-4 py-3 text-[15px] leading-relaxed ${className}`}>
      {shown.map(l => (
        <p key={l.icon} className="flex gap-2 py-0.5 [overflow-wrap:anywhere]">
          <span aria-hidden>{l.icon}</span>
          <span>{l.text.split("__").map((part, i) => (i % 2 ? <em key={i} className="text-helper">{part}</em> : <Rich key={i} text={part} />))}</span>
        </p>
      ))}
    </div>
  );
}
