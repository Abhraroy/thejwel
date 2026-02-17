import type { Cart, CartItem, Product } from "./TypeInterface";
import type { productWithImages } from "./RelationTypeInterface";

/**
 * Product shape we may store inside local cart.
 * (Local cart stores the whole product object under `products`.)
 */
export type CartProduct = Product | productWithImages;

/**
 * Local (logged-out) cart item shape stored in localStorage key `cartItems`.
 *
 * Example:
 * `{ products: { product_id: "...", ... }, quantity: 2 }`
 */
export type LocalCartItem<P extends CartProduct = CartProduct> = {
  products: P;
  quantity: number;
};

export type LocalCart = LocalCartItem[];

/**
 * DB cart item shape we usually work with in UI after joining `products(*)`.
 * (Some queries might not include `products`, so it stays optional.)
 */
export type DbCartItemWithProducts = CartItem & {
  products?: Product | null;
  cart?: Cart | null;
};

/**
 * Cart item used throughout the UI — either local cart item or DB cart item.
 */
export type CartLineItem = LocalCartItem | DbCartItemWithProducts;
export type CartLineItems = CartLineItem[];

