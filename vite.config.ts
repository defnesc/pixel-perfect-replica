// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// STATIC_SITE=1 (set only by the GitHub Pages workflow) builds plain HTML files for every page
// instead of a server bundle. Lovable's own builds don't set it, so they are unchanged.
const staticSite = process.env["STATIC_SITE"] === "1";

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
    ...(staticSite
      ? {
          // "/" only redirects by browser language, so start crawling from both language homes.
          pages: [{ path: "/en" }, { path: "/tr" }, { path: "/check" }, { path: "/en/check" }, { path: "/tr/check" }],
          prerender: { enabled: true, crawlLinks: true, autoSubfolderIndex: true, failOnError: true },
          // Fallback page for anything not prerendered (e.g. a product added to the sheet later).
          spa: { enabled: true },
        }
      : {}),
  },
  ...(staticSite ? { nitro: false as const } : {}),
});
