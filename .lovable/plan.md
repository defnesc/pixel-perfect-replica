# Gift Card page, Jewelry page, currency switcher

## 1. Gift Card page (copy of 7evenacegrillz.fr gift card)
- New page in both languages: /en/gift-card and /tr/hediye-karti, with a menu link "GIFT CARD" / "HEDİYE KARTI".
- Same layout as the reference: big gift card image on the left (on top on phones), title "Gift card", price, an amount picker, quantity, and the main button.
- Amounts: the same list as the reference (20 up to 6,000), shown as a dropdown, set in euros and converted to the chosen currency.
- No checkout, as on the rest of the site: the button is "CREATE AN ORDER" and sends the gift card order to WhatsApp and to the CRM sheet, with a new order ID. The ManyChat first line stays exactly the same.
- A gift card image in the site's pink/lime style will be generated.

## 2. Jewelry page
- New page /en/jewelry and /tr/taki with a menu link "JEWELRY" / "TAKI".
- Shows only a large "COMING SOON!" heading ("ÇOK YAKINDA!" in Turkish) in the site style.

## 3. Currency switcher (TRY, EUR, USD)
- Small pill switch in the header next to EN/TR: ₺ / € / $.
- All prices on the site (catalog, product page, order panel, gift card) show in the chosen currency; the choice is remembered.
- TRY stays the default and the base currency. EUR and USD prices use exchange rates from the price sheet settings (usd_try already exists; a new eur_try is added, sample value 45 until you give the real one).
- The WhatsApp/CRM order message includes the amount in the chosen currency plus the TRY amount.

## Technical details
- Routes: `$lang.gift-card.tsx`, `$lang.hediye-karti.tsx` (TR alias, like privacy/gizlilik), `$lang.jewelry.tsx`, `$lang.taki.tsx`; each with its own head() metadata; language switch maps aliases.
- Currency: small React context + safe localStorage helper (same pattern as saveLang); `formatPrice(tryAmount, currency, settings)` in pricing.ts, with a unit test for the conversion and rounding.
- Settings: add `eur_try` to seed.ts and sheet parsing; update the Price Sheet xlsx in Files with the new row.
- All new text in en.json + tr.json.
- Header may get tight on phones with 5 menu items + 2 switches; menu will scroll horizontally or wrap into a second row if needed.
