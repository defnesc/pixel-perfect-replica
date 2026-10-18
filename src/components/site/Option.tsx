import type { ReactNode } from "react";

export function Option({ selected, onSelect, label, note, type = "radio" }: { selected: boolean; onSelect: () => void; label: ReactNode; note?: ReactNode; type?: "radio" | "check" }) {
  return (
    <button
      type="button"
      role={type === "radio" ? "radio" : "checkbox"}
      aria-checked={selected}
      onClick={onSelect}
      className={`tap flex w-full items-start gap-3 border px-4 py-3 text-left ${selected ? "border-primary" : "border-foreground/25"}`}
    >
      <span className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center border ${type === "radio" ? "rounded-full" : ""} ${selected ? "border-primary bg-primary" : "border-foreground"}`}>
        {selected && <span className={`h-1.5 w-1.5 bg-primary-foreground ${type === "radio" ? "rounded-full" : ""}`} />}
      </span>
      <span>
        <span className="block text-sm">{label}</span>
        {note && <span className="helper mt-1 block">{note}</span>}
      </span>
    </button>
  );
}

export function Question({ id, title, children, highlight }: { id: string; title: string; children: ReactNode; highlight?: boolean }) {
  return (
    <section id={id} className={`scroll-mt-20 border-t border-foreground py-6 ${highlight ? "outline outline-2 outline-offset-4 outline-primary" : ""}`}>
      <h2 className="mb-3 text-2xl">{title}</h2>
      {children}
    </section>
  );
}
