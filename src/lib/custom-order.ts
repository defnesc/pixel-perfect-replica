import type { CartLine } from "./cart-pricing";
import type { CatalogProduct } from "./catalog";

export function needsReference(items: CartLine[], products: CatalogProduct[]) {
  return items.some(item => item.kind === "estimate" || products.some(product => product.folder === item.product && product.section === "custom"));
}