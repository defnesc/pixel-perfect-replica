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
- Price consumers use usePrices and catalog pricing helpers so whole-piece dollar adjustment and validated exchange rates remain consistent across pages and order records. Keep gift amounts unadjusted; cart/check estimate lines use estimateCustom with loaded estimator rows to avoid price drift.
- Product photos live in src/assets/products/ named `<folder>-01.jpg` etc. and are picked up automatically via import.meta.glob; missing photos render a placeholder.
- Only 925 sterling silver with gold coating is sold — never re-add 14K/18K gold options. Colour (White/Yellow) never changes price.
- Cart pricing expands Classics quantities and per-tooth lines into individual pieces, allocates one global full-price piece, and applies each product’s sheet discount to the others; bar options apply once per unit line, other options per tooth. Customs stay separate undiscounted estimates. Use the shared pure allocator everywhere to prevent price drift.
- Orders go to WhatsApp and the public CRM endpoint configured in order.ts (environment fallback); preserve ManyChat first lines and send no customer personal data.

- Keep cart state in the localized CartProvider with validated, failure-safe localStorage. Check URLs contain validated, URL-safe order snapshots and preserve the order-time factor for current-sheet comparison; they are not authenticated order records. /check redirects to the localized noindex check route.
- Use pure cart-actions helpers for configuration matching and linked add-on operations; addonOf is preserved in snapshots so counters and cascading removal share one source of truth.
