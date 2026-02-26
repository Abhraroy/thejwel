"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useStore } from "@/zustandStore/zustandStore";
import {
  createCart,
  calculateCartCount,
  getLocalCartCount,
} from "@/utilityFunctions/CartFunctions";
import type { LocalCart } from "@/types/CartTypes";

export default function CartBootstrapper() {
  const {
    setAuthenticatedState,
    setAuthUserId,
    setCartId,
    setCartItems,
    setCartCount,
  } = useStore();

  useEffect(() => {
    const supabase = createClient();

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
          setCartCount(calculateCartCount(cartData.cart_items));
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
        console.log("User not authenticated");
        setAuthenticatedState(false);
        setCartCount(getLocalCartCount());
        return;
      }
      setAuthenticatedState(true);
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("phone_number", "+" + data?.user?.phone)
        .single();
      if (userError || !userData?.user_id) {
        console.log("User logged but no data found in db");
        setAuthenticatedState(false);
        return;
      }
      console.log("User data found in db", userData?.user_id);
      setAuthUserId(userData?.user_id);
      const { data: cartData, error: cartError } = await supabase
        .from("cart")
        .select(`*,cart_items(quantity)`)
        .eq("user_id", userData?.user_id)
        .maybeSingle();
      if (cartError || !cartData?.cart_id) {
        console.log("No cart found for user", userData?.user_id);
        const {
          success,
          data: newCart,
          error: createError,
        } = await createCart(userData.user_id, supabase);

        if (success && newCart?.cart_id) {
          console.log("Recovery cart created:", newCart.cart_id);
          setCartId(newCart.cart_id);
          setCartCount(0);
          await mergeLocalCartItems(newCart.cart_id);
        } else {
          console.error("Failed to create recovery cart:", createError);
          setCartId("");
        }
        return;
      }
      setCartId(cartData?.cart_id);
      setCartCount(calculateCartCount(cartData?.cart_items ?? []));
      console.log("calling mergeLocalCartItems");
      mergeLocalCartItems(cartData?.cart_id);
    };

    const run = () => checkAuthentication();
    if ("requestIdleCallback" in window) {
      requestIdleCallback(run);
    } else {
      setTimeout(run, 1500);
    }
  }, [setAuthenticatedState, setAuthUserId, setCartId, setCartItems, setCartCount]);

  return null;
}
