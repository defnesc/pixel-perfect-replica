import { HOTSPOTS, LOWER, TEETH_IMAGE_RATIO, TEETH_IMAGE_URL, UPPER } from "@/config/teeth";
import { useT } from "@/i18n";

export function TeethPicker({ value, onChange, max }: { value: number[]; onChange: (v: number[]) => void; max: number | null }) {
  const t = useT();
  const toggle = (n: number) => {
    if (value.includes(n)) onChange(value.filter((x) => x !== n));
    else if (max === null || value.length < max) onChange([...value, n]);
    else if (max === 1) onChange([n]);
  };
  return (
    <div>
      <div className="relative mx-auto w-full max-w-sm border border-foreground" style={{ aspectRatio: String(TEETH_IMAGE_RATIO) }}>
        {TEETH_IMAGE_URL ? (
          <img src={TEETH_IMAGE_URL} alt="" className="absolute inset-0 h-full w-full object-contain" />
        ) : (
          <>
            <span className="absolute left-2 top-2 helper">{t("q3.upper")}</span>
            <span className="absolute bottom-2 left-2 helper">{t("q3.lower")}</span>
            <div className="absolute left-4 right-4 top-1/2 border-t border-dashed border-foreground/30" />
          </>
        )}
        {[...UPPER, ...LOWER].map((n) => {
          const p = HOTSPOTS[n];
          const on = value.includes(n);
          return (
            <button
              key={n}
              type="button"
              aria-pressed={on}
              onClick={() => toggle(n)}
              style={{ left: `${p.x}%`, top: `${p.y}%` }}
              className={`absolute flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border text-[11px] font-semibold ${
                on ? "border-primary bg-primary text-primary-foreground" : "border-foreground bg-background"
              }`}
            >
              {n}
            </button>
          );
        })}
      </div>
      {value.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {[...value].sort((a, b) => a - b).map((n) => (
            <button key={n} type="button" onClick={() => toggle(n)} aria-label={t("q3.remove", { n })} className="tap flex items-center gap-2 border border-primary px-3 text-sm text-primary">
              {n} <span aria-hidden>×</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
