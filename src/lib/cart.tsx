import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { cartSchema, type CartLine } from "./cart-pricing";
import { removeWithAddons, setAddonQuantity } from "./cart-actions";
const KEY = "333-cart";
type CartContextValue = {
  items: CartLine[];
  add: (line: CartLine) => void;
  remove: (id: string) => void;
  quantity: (id: string, n: number) => void;
  ready: boolean;
  addon: (main: CartLine, addon: CartLine, quantity: number) => void;
  clear: () => void;
};
const CartContext = createContext<CartContextValue | null>(null);
export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartLine[]>([]);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    try {
      const value = cartSchema.safeParse(JSON.parse(localStorage.getItem(KEY) ?? "[]"));
      if (value.success) setItems(value.data);
    } catch {}
    setReady(true);
  }, []);
  useEffect(() => {
    if (ready)
      try {
        localStorage.setItem(KEY, JSON.stringify(items));
      } catch {}
  }, [items, ready]);
  const add = (line: CartLine) => {
    const next = { ...line, id: crypto.randomUUID() };
    setItems((v) =>
      v.length < 100 && cartSchema.safeParse([...v, next]).success ? [...v, next] : v,
    );
  };
  return (
    <CartContext.Provider
      value={{
        items,
        add,
        ready,
        remove: (id) => setItems((v) => removeWithAddons(v, id)),
        addon: (main, addon, quantity) => setItems((v) => setAddonQuantity(v, main, addon, quantity, () => crypto.randomUUID())),
        clear: () => setItems([]),
        quantity: (id, n) => {
          if (Number.isInteger(n) && n >= 1 && n <= 10)
            setItems((v) => v.map((l) => (l.id === id ? { ...l, quantity: n } : l)));
        },
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
const EMPTY_CART: CartContextValue = {
  items: [],
  add: () => {},
  remove: () => {},
  quantity: () => {},
  ready: false,
  addon: () => {},
  clear: () => {},
};
/** Falls back to an empty cart (e.g. during hot reloads) instead of blanking the page. */
export function useCart() {
  return useContext(CartContext) ?? EMPTY_CART;
}
