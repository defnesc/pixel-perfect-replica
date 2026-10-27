# Price sheet integration
- [x] Replace five backup CSVs and load catalog metadata.
- [x] Load public Google Sheet tabs with independent safe fallbacks and five-minute caching.
- [x] Use shared adjusted prices, safe live rates and selected currency throughout existing pages and orders.
- [x] Update FAQ wording and verify tests and order flow.
- [x] Preserve metadata, order-time CRM factor and estimator pricing helper for the next step.

# Cart and order flow
- [x] Implement shared per-product multi-piece and per-tooth pricing with concrete rule tests.
- [x] Add safe local cart, header count, product actions and linked add-on lines.
- [x] Add bilingual cart questions, validation and full-screen next steps.
- [x] Create WhatsApp/CRM order payloads and encoded bilingual noindex check pages.
- [x] Verify cart, teeth/bar prices, questions and check-link flow on mobile and desktop.
- [ ] Confirm saved CRM rows: endpoint responds “333 order log is running” and outgoing payload is verified; no read-back access to the private order log.

# Custom estimator and cart fixes
- [x] Link add-ons to configured main pieces, show counters and confirm cascading removal.
- [x] Clear cart after WhatsApp opens and show order-time/current price levels.
- [x] Add sheet-priced instant estimator, cart estimates and bilingual messages/check links.
- [x] Verify pricing tests and end-to-end flows (65 tests; mobile/desktop estimator, linked removal, order send and check read-back).

# Custom cart and gift cards
- [x] Make estimator cart-only with a green action and cart toast link.
- [x] Add reference-photo messaging and first next step for custom orders only.
- [x] Add gift amount types, delivery, sheet-controlled shipping, validity FAQ and purchase date.
- [x] Verify concrete pricing rules and gift/custom order flows (70 tests; mobile gift shipping/unknown amounts and estimator-to-cart order/check flow, desktop English gift page; CRM payloads verified without private log read-back).

# Order calendar
- [x] Sheet-driven batch, delivery and special-day box on Classics product pages, cart and Classics list (tests in calendar.test.ts).
- [ ] Add the five new Settings keys and the Occasions tab to the live Google Sheet (owner action; site uses backups until then).
