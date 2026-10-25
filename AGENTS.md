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
- Use sheetQuery as the sole runtime source for products, options, add-ons, settings and estimator rows; public gviz CSV reads have independent tab/row fallback to src/data CSVs and five-minute caching, with seed FAQ fallback. Keep parsing browser/Worker-safe in csv.ts to avoid circular imports; no backend by design.
- Price consumers use usePrices and catalog pricing helpers so whole-piece dollar adjustment and validated exchange rates remain consistent across pages and order records. Keep gift amounts unadjusted; store order-time price_factor in CRM for future check pages. Cart/check/estimator UI is a separate next step; metadata and helpers are ready.
- Product photos live in src/assets/products/ named `<folder>-01.jpg` etc. and are picked up automatically via import.meta.glob; missing photos render a placeholder.
- Only 925 sterling silver with gold coating is sold — never re-add 14K/18K gold options. Colour (White/Yellow) never changes price.
- Classics pricing: piece = product price + option surcharges; the most expensive piece in an order is full price, every other piece is 30% off (rounded down to nearest 100, then +90). All prices end in 90.
- Orders go to WhatsApp (wa.me/905053159186) and to a CRM webhook (VITE_CRM_WEBHOOK_URL); first message line is a ManyChat trigger and must not change.
