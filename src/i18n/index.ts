import { useParams } from "@tanstack/react-router";
import en from "./en.json";
import tr from "./tr.json";

export type Lang = "en" | "tr";
export const LANGS: Lang[] = ["en", "tr"];
const dicts: Record<Lang, Record<string, string>> = { en, tr };

export function isLang(v: unknown): v is Lang {
  return v === "en" || v === "tr";
}

export function translate(lang: Lang, key: string, vars?: Record<string, string | number>) {
  let s = dicts[lang][key] ?? dicts.en[key] ?? key;
  if (vars) for (const [k, v] of Object.entries(vars)) s = s.split(`{${k}}`).join(String(v));
  return s;
}

export function useLang(): Lang {
  const p = useParams({ strict: false }) as { lang?: string };
  return isLang(p.lang) ? p.lang : "en";
}

export function useT() {
  const lang = useLang();
  return (key: string, vars?: Record<string, string | number>) => translate(lang, key, vars);
}

export const LANG_STORAGE_KEY = "333-lang";

// Storage can throw (blocked in embedded frames / private modes) — never let it break the page.
export function readSavedLang(): Lang | null {
  try {
    const v = window.localStorage.getItem(LANG_STORAGE_KEY);
    return isLang(v) ? v : null;
  } catch {
    return null;
  }
}

export function saveLang(lang: Lang) {
  try {
    window.localStorage.setItem(LANG_STORAGE_KEY, lang);
  } catch {
    /* ignore */
  }
}
