<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Project rules
- All UI text lives in src/i18n/en.json + tr.json; routes are /$lang/... (en|tr) so each language has its own URL for SEO.
- Catalog, prices, FAQ and settings come from the Google Price Sheet (VITE_PRICE_SHEET_ID, gviz CSV, 5 min cache) with src/lib/seed.ts as fallback — no backend by design.
- Orders go to WhatsApp via wa.me and to a CRM webhook (VITE_CRM_WEBHOOK_URL); first message line is a ManyChat trigger and must not change.
- Teeth hotspot positions are in src/config/teeth.ts so the template image can be swapped.
