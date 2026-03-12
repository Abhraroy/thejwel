"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useStore } from "@/zustandStore/zustandStore";
import {
  createCart,
  getLocalCartItems,
} from "@/utilityFunctions/CartFunctions";
import type { LocalCart } from "@/types/CartTypes";

export default function CartBootstrapper() {
  const {
    setAuthenticatedState,
    setAuthUserId,
    setCartId,
    setCartItems,
  } = useStore();

  useEffect(() => {
    const supabase = createClient();

    // Hydrate cart from localStorage immediately (for unauthenticated users with local cart)
    // This shows the correct count on first paint; auth check will overwrite with DB cart if logged in
    setCartItems(getLocalCartItems());

    const mergeLocalCartItems = async (cartId: string): Promise<void> => {
      try {
        const localCartItems = localStorage.getItem("cartItems");
        if (!localCartItems) return;

        const localCartItemsArray: LocalCart = JSON.parse(localCartItems);
        if (
          !Array.isArray(localCartItemsArray) ||
          localCartItemsArray.length === 0
        ) {
          localStorage.removeItem("cartItems");
          return;
        }

        const { data: existingCartItems, error: fetchError } = await supabase
          .from("cart_items")
          .select("product_id, quantity")
          .eq("cart_id", cartId);

        if (fetchError) {
          console.error("Error fetching existing cart items:", fetchError);
          return;
        }

        const existingProductsMap = new Map(
          (existingCartItems || []).map((item) => [
            item.product_id,
            item.quantity,
          ])
        );

        const updatePromises = localCartItemsArray.map(async (item) => {
          const productId = item.products?.product_id;
          const localQuantity = item.quantity || 1;

          if (existingProductsMap.has(productId)) {
            const currentQuantity = existingProductsMap.get(productId) || 0;
            const { error: updateError } = await supabase
              .from("cart_items")
              .update({ quantity: currentQuantity + localQuantity })
              .eq("cart_id", cartId)
              .eq("product_id", productId);

            if (updateError) {
              console.error(
                `Error updating cart item ${productId}:`,
                updateError
              );
            }
          } else {
            const { error: insertError } = await supabase
              .from("cart_items")
              .insert({
                cart_id: cartId,
                product_id: productId,
                quantity: localQuantity,
              });

            if (insertError) {
              console.error(
                `Error inserting cart item ${productId}:`,
                insertError
              );
            }
          }
        });

        await Promise.allSettled(updatePromises);

        const { data: cartData, error } = await supabase
          .from("cart")
          .select(`*, cart_items(*)`)
          .eq("cart_id", cartId)
          .single();

        if (!error && cartData) {
          setCartItems(cartData.cart_items);
        }

        localStorage.removeItem("cartItems");
      } catch (error) {
        console.error("Local cart merge error:", error);
        localStorage.removeItem("cartItems");
      }
    };

    const checkAuthentication = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data?.user) {
        setAuthenticatedState(false);
        setCartItems(getLocalCartItems());
        return;
      }
      setAuthenticatedState(true);
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("phone_number", "+" + data?.user?.phone)
        .single();
      if (userError || !userData?.user_id) {
        setAuthenticatedState(false);
        return;
      }
      setAuthUserId(userData?.user_id);
      const { data: cartData, error: cartError } = await supabase
        .from("cart")
        .select(`*,cart_items(quantity)`)
        .eq("user_id", userData?.user_id)
        .maybeSingle();
      if (cartError || !cartData?.cart_id) {
        const {
          success,
          data: newCart,
          error: createError,
        } = await createCart(userData.user_id, supabase);

        if (success && newCart?.cart_id) {
          setCartId(newCart.cart_id);
          setCartItems([]);
          await mergeLocalCartItems(newCart.cart_id);
        } else {
          console.error("Failed to create recovery cart:", createError);
          setCartId("");
        }
        return;
      }
      setCartId(cartData?.cart_id);
      setCartItems(cartData?.cart_items ?? []);
      mergeLocalCartItems(cartData?.cart_id);
    };

    checkAuthentication();
  }, [setAuthenticatedState, setAuthUserId, setCartId, setCartItems]);

  return null;
}
