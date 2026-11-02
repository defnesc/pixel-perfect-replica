import { useT } from "@/i18n";

/**
 * privacy.body is plain text in the i18n files: blocks are separated by a blank line,
 * "## " starts a heading and lines starting with "- " form a list.
 */
export function PrivacyPage() {
  const t = useT();
  const blocks = t("privacy.body").split(/\n\s*\n/);
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="mb-6 text-5xl">{t("privacy.title")}</h1>
      <div className="space-y-4 text-sm leading-relaxed">
        {blocks.map((block, i) => {
          const lines = block.split("\n");
          return (
            <div key={i} className="space-y-2">
              {lines.map((line, j) => {
                if (line.startsWith("## "))
                  return (
                    <h2 key={j} className="pt-4 text-xl">
                      {line.slice(3)}
                    </h2>
                  );
                return null;
              })}
              {groupLines(lines.filter((l) => !l.startsWith("## "))).map((g, j) =>
                g.list ? (
                  <ul key={j} className="list-disc space-y-1 pl-5">
                    {g.lines.map((l, k) => (
                      <li key={k}>{l.slice(2)}</li>
                    ))}
                  </ul>
                ) : (
                  <p key={j}>{g.lines.join(" ")}</p>
                ),
              )}
            </div>
          );
        })}
      </div>
    </main>
  );
}

function groupLines(lines: string[]) {
  const groups: { list: boolean; lines: string[] }[] = [];
  for (const line of lines) {
    if (!line.trim()) continue;
    const list = line.startsWith("- ");
    const last = groups[groups.length - 1];
    if (last && last.list === list) last.lines.push(line);
    else groups.push({ list, lines: [line] });
  }
  return groups;
}
