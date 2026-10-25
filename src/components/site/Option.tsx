import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";

export function Option({
  selected,
  onSelect,
  label,
  note,
  type = "radio",
}: {
  selected: boolean;
  onSelect: () => void;
  label: ReactNode;
  note?: ReactNode;
  type?: "radio" | "check";
}) {
  return (
    <Button
      variant="ghost"
      type="button"
      role={type === "radio" ? "radio" : "checkbox"}
      aria-checked={selected}
      onClick={onSelect}
      className={`tap flex h-auto w-full items-start justify-start gap-3 whitespace-normal rounded-[20px] border px-4 py-3 text-left ${selected ? "border-primary" : "border-foreground/20"}`}
    >
      <span
        className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center border ${type === "radio" ? "rounded-full" : ""} ${selected ? "border-primary bg-primary" : "border-foreground"}`}
      >
        {selected && (
          <span
            className={`h-1.5 w-1.5 bg-primary-foreground ${type === "radio" ? "rounded-full" : ""}`}
          />
        )}
      </span>
      <span>
        <span className="block text-[15px] leading-normal">{label}</span>
        {note && <span className="helper mt-1 block">{note}</span>}
      </span>
    </Button>
  );
}

export function Question({
  id,
  title,
  children,
  highlight,
}: {
  id: string;
  title: string;
  children: ReactNode;
  highlight?: boolean;
}) {
  return (
    <section
      id={id}
      className={`scroll-mt-20 py-8 ${highlight ? "outline outline-2 outline-offset-4 outline-primary" : ""}`}
    >
      <h2 className="mb-4 text-3xl">{title}</h2>
      {children}
    </section>
  );
}
