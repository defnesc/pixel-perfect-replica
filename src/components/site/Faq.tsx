import { useSuspenseQuery } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { sheetQuery } from "@/lib/sheet";
import { useLang } from "@/i18n";

function bold(text: string): ReactNode[] {
  return text.split(/\*\*(.+?)\*\*/g).map((part, i) => (i % 2 ? <strong key={i}>{part}</strong> : part));
}

export function Faq() {
  const lang = useLang();
  const { data } = useSuspenseQuery(sheetQuery);
  const [open, setOpen] = useState<number | null>(null);
  const items = [...data.faq].sort((a, b) => a.sort_order - b.sort_order);
  return (
    <ul>
      {items.map((f, i) => {
        const isOpen = open === i;
        return (
          <li key={i} className="border-t border-border">
            <button
              type="button"
              aria-expanded={isOpen}
              onClick={() => setOpen(isOpen ? null : i)}
              className="tap flex w-full items-center justify-between gap-4 py-4 text-left text-base font-semibold leading-snug"
            >
              <span>{lang === "tr" ? f.question_tr : f.question_en}</span>
              <span className={`text-lg leading-none transition-transform ${isOpen ? "rotate-45 text-primary" : ""}`}>+</span>
            </button>
            {isOpen && <p className="pb-5 pr-6 text-helper">{bold(lang === "tr" ? f.answer_tr : f.answer_en)}</p>}
          </li>
        );
      })}
    </ul>
  );
}
