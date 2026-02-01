"use client";

import { useStore } from "@/zustandStore/zustandStore";
import { useEffect, useState } from "react";
import { createClient } from "@/app/utils/supabase/client";
import { addToDbCart, addToLocalCart, decreaseQuantityFromDbCart, decreaseQuantityFromLocalCart, getCartData, removeFromDbCart, removeFromLocalCart, calculateCartCount, getLocalCartCount, getCartQuantityForProduct } from "@/utilityFunctions/CartFunctions";
import CartItem from "./CartItem";
import { toast } from "react-toastify";

interface CartProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Cart({ isOpen = false, onClose }: CartProps) {
  const { AuthenticatedState, cartItems, setCartItems ,CartId,setInitiatingCheckout,initiatingCheckout, setCartCount } = useStore();
  const [subtotal, setSubtotal] = useState(0);
  const [loading, setLoading] = useState(true);
  // Sample cart items for UI demonstration
  const supabase = createClient();
  console.log("Initializing supabase",supabase)

  const calculateSubTotal = (items: any) => {
    if (!Array.isArray(items) || items.length === 0) return 0;
    return items.reduce((sum: number, item: any) => {
      const product = item?.products ?? item?.product ?? item;
      const price = Number(product?.final_price ?? product?.price ?? 0);
      const quantity = Number(item?.quantity ?? 1);
      return sum + price * quantity;
    }, 0);
  };

  const handleDecreaseQuantity = async(product:any)=>{
    if(AuthenticatedState){
       const updatedItem = await decreaseQuantityFromDbCart(product,CartId,supabase)
       console.log("updatedItem",updatedItem)
        setCartItems(updatedItem);
        // Update cart count for authenticated users
        if (updatedItem && Array.isArray(updatedItem)) {
          setCartCount(calculateCartCount(updatedItem));
        }
    }
    else{
      const updatedItem = await decreaseQuantityFromLocalCart(product)
      setCartItems(updatedItem);
      // Update cart count for unauthenticated users
      setCartCount(getLocalCartCount());
    }
  }

  const handleRemoveItem = async(product:any)=>{
    if(AuthenticatedState){
      const updatedItem = await removeFromDbCart(product,CartId,supabase)
      setCartItems(updatedItem);
      // Update cart count for authenticated users
      if (updatedItem && Array.isArray(updatedItem)) {
        setCartCount(calculateCartCount(updatedItem));
      }
    }
    else{
      const updatedItem = await removeFromLocalCart(product)
      setCartItems(updatedItem);
      // Update cart count for unauthenticated users
      setCartCount(getLocalCartCount());
    }
  }
  
  const handleIncreaseQuantity = async(product:any)=>{
    // Stock guard for incrementing quantity inside cart
    const productObj = product?.products ?? product?.product ?? product;
    const productId = productObj?.product_id;
    const requiredNextQty = getCartQuantityForProduct(cartItems, productId) + 1;
    if (productId) {
      const latestStockRes = await supabase
        .from("products")
        .select("stock_quantity, product_name")
        .eq("product_id", productId)
        .single();
      if (!latestStockRes.error) {
        const availableStock = Number(latestStockRes.data?.stock_quantity);
        if (Number.isFinite(availableStock) && requiredNextQty > availableStock) {
          toast.error(
            `${latestStockRes.data?.product_name || "This product"} has only ${availableStock} item(s) in stock.`,
            { style: { backgroundColor: "#eec0c8", color: "#360000" }, position: "top-right" }
          );
          return;
        }
      }
    }

    if(AuthenticatedState){
      console.log("Adding to db cart")
      console.log("product",product.product_id)
      console.log("CartId",CartId)
      console.log("supabase",supabase)
      const updatedItem = await addToDbCart(product,CartId,supabase)
      setCartItems(updatedItem);
      // Update cart count for authenticated users
      if (updatedItem && Array.isArray(updatedItem)) {
        setCartCount(calculateCartCount(updatedItem));
      }
    }
    else{
      console.log("User is not authenticated adding to local cart")
      const updatedItem = addToLocalCart(product.products)
      setCartItems(updatedItem);
      // Update cart count for unauthenticated users
      setCartCount(getLocalCartCount());
    }
  }

  useEffect(() => {
    if(cartItems){
      setSubtotal(calculateSubTotal(cartItems));
    }
    else{
      setSubtotal(0);
    }
  }, [cartItems]);

  useEffect(() => {
    const getCartItems = async () => {
      setLoading(true);
      if (!AuthenticatedState) {
        const localCartItems = localStorage.getItem("cartItems");
        console.log("cart items from local storage", localCartItems);
        if (cartItems) {
          const tempCartItems = localCartItems
            ? JSON.parse(localCartItems)
            : [];
          console.log("tempCartItems", typeof tempCartItems);
          setCartItems(tempCartItems);
        }
        setLoading(false);
      } else if (AuthenticatedState) {
    
        if(CartId){
          console.log("cart found",CartId)
          const {success,data,message} = await getCartData(CartId,supabase)
          if(success){
            console.log("data from cart",data)
            setCartItems(data)
          }
          else{
            console.log("error",message)
          }
          setLoading(false);
      }else{
        console.log("No cart found")
        setLoading(false);
      }
    };
}
    getCartItems()
  }, [AuthenticatedState]);

  useEffect(() => {
    console.log("cart items from cart", cartItems);
  }, [cartItems]);

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] transition-opacity duration-300"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Cart Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-full sm:w-96 md:w-[420px] lg:w-[480px] bg-[#DECAF2] text-white shadow-2xl z-[70] transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Cart Header */}
          <div className="flex items-center justify-between p-3 sm:p-4 md:p-6 border-b border-white/20 bg-[#DECAF2] sticky top-0 z-10">
            <h2 className="text-2xl sm:text-xl md:text-2xl font-bold text-[#360000] font-josefin-sans tracking-wider">
              Shopping Cart
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-[#360000] hover:text-[#360000]/80 hover:scale-125 rounded-full transition-all duration-200 ease-in-out  cursor-pointer"
              aria-label="Close cart"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto py-3 sm:py-4 px-3 sm:px-4 md:px-6 scrollbar-hide
          ">
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 sm:gap-4 bg-white/10 rounded-lg p-3 sm:p-4 animate-pulse"
                  >
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/20 rounded" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-white/20 rounded w-3/4" />
                      <div className="h-3 bg-white/20 rounded w-1/2" />
                      <div className="h-3 bg-white/20 rounded w-1/3" />
                    </div>
                    <div className="w-12 h-10 bg-white/20 rounded" />
                  </div>
                ))}
              </div>
            ) : cartItems && cartItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-8 sm:py-12 px-4 text-white">
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-[#CAF2FF] rounded-full flex items-center justify-center mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="#7A1C1C"
                    className="w-10 h-10 sm:w-12 sm:h-12"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.4 2.924-6.375a48.567 48.567 0 0 0-8.563-4.137M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
                    />
                  </svg>
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-[#360000] font-open-sans tracking-wider mb-2">
                  Your cart is empty
                </h3>
                <p className="text-[#360000]/80 text-xs sm:text-sm mb-4 sm:mb-6 font-open-sans tracking-wider">
                  Looks like you haven't added anything to your cart yet.
                </p>
                <button
                  onClick={onClose}
                  className="px-5 sm:px-6 py-2 sm:py-2.5 bg-[#FFCDC9] text-[#7A1C1C] font-medium rounded-lg hover:bg-[#FD7979] transition-colors duration-200 text-sm sm:text-base"
                >
                  Continue Shopping
                </button>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4  ">
                {cartItems &&
                  cartItems.map((item: any) => {
                    // Use stable unique key - cart_item_id for DB items, product_id for local items
                    const product = item?.products ?? item?.product ?? item;
                    const uniqueKey =
                      item.cart_item_id ||
                      product?.product_id ||
                      item.product_id ||
                      `cart-item-${product?.product_id || "unknown"}`;

                    return (
                      <CartItem
                        key={uniqueKey}
                        item={item}
                        onDecrease={handleDecreaseQuantity}
                        onIncrease={handleIncreaseQuantity}
                        onRemove={handleRemoveItem}
                      />
                    );
                  })}
              </div>
            )}
          </div>

          {/* Cart Footer - Summary & Checkout */}
          {cartItems && cartItems.length > 0 && (
            <div className="border-t border-white/20 bg-[#DECAF2] text-[#7A1C1C] p-3 sm:p-4 md:p-6 space-y-3 sm:space-y-4 sticky bottom-0">
              {/* Price Summary */}
              <div className="space-y-2 sm:space-y-3">
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-[#360000] font-extrabold font-open-sans tracking-wider">Subtotal</span>
                  <span className="font-medium text-[#360000] font-open-sans tracking-wider">
                    ₹{subtotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-[#360000] font-extrabold font-open-sans tracking-wider">Shipping</span>
                  <span className=" text-base sm:text-lg text-[#360000] font-bold font-open-sans tracking-wider">
                    <span className="font-medium text-[#360000]/80 line-through text-xs sm:text-sm mr-2 font-open-sans tracking-wider">
                      ₹70
                    </span>
                    Free
                  </span>
                </div>
                <div className="border-t border-gray-200 pt-2 sm:pt-3">
                  <div className="flex justify-between">
                    <span className="text-sm sm:text-base font-semibold text-[#360000] font-open-sans tracking-wider">
                      Total
                    </span>
                    <span className="text-lg sm:text-xl font-bold text-[#360000] font-open-sans tracking-wider">
                      ₹{subtotal.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Checkout Button */}
              <button 
                className="w-full bg-[#CAF2FF] text-[#360000] font-bold py-2.5 sm:py-3 md:py-3.5 px-4 sm:px-6 rounded-xl hover:bg-[#CAF2FF]/70 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg text-sm sm:text-base font-open-sans tracking-wider"
                onClick={async ()=>{
                  // Before checkout, validate latest stock for all cart items.
                  try {
                    const items = Array.isArray(cartItems) ? cartItems : [];
                    const qtyByProductId = new Map<string, { qty: number; name?: string }>();
                    for (const item of items) {
                      const product = item?.products ?? item?.product ?? item;
                      const pid = product?.product_id ?? item?.product_id;
                      const qty = Number(item?.quantity ?? 1) || 0;
                      if (!pid || qty <= 0) continue;
                      const prev = qtyByProductId.get(pid);
                      qtyByProductId.set(pid, { qty: (prev?.qty || 0) + qty, name: product?.product_name });
                    }

                    const productIds = Array.from(qtyByProductId.keys());
                    if (productIds.length === 0) {
                      toast.error("Your cart is empty.", { style: { backgroundColor: "#eec0c8", color: "#360000" }, position: "top-right" });
                      return;
                    }

                    const stockRes = await supabase
                      .from("products")
                      .select("product_id, product_name, stock_quantity")
                      .in("product_id", productIds);

                    if (stockRes.error) {
                      toast.error("Could not validate stock. Please try again.", { style: { backgroundColor: "#eec0c8", color: "#360000" }, position: "top-right" });
                      return;
                    }

                    const stockMap = new Map<string, { stock: number; name: string }>();
                    for (const row of stockRes.data || []) {
                      stockMap.set(row.product_id, {
                        stock: Number(row.stock_quantity) || 0,
                        name: row.product_name || "Product",
                      });
                    }

                    const issues: string[] = [];
                    for (const [pid, info] of qtyByProductId.entries()) {
                      const db = stockMap.get(pid);
                      const name = db?.name || info.name || "Product";
                      const stock = db?.stock ?? 0;
                      if (stock <= 0) {
                        issues.push(`${name} is out of stock`);
                      } else if (info.qty > stock) {
                        issues.push(`${name} || has only ${stock} left (you have ${info.qty} in cart)`);
                      }
                    }

                    if (issues.length > 0) {
                      toast.error(issues.join(". "), { style: { backgroundColor: "#eec0c8", color: "#360000" }, position: "top-right" });
                      return;
                    }

                    setInitiatingCheckout(true);
                    onClose?.(); // Close the cart sidebar
                  } catch (e) {
                    console.error("Checkout stock validation failed:", e);
                    toast.error("Could not validate stock. Please try again.", { style: { backgroundColor: "#eec0c8", color: "#360000" }, position: "top-right" });
                  }
                }}
                disabled={initiatingCheckout}
              >
                {initiatingCheckout ? "Proceeding to checkout..." : "Proceed to Checkout"}
              </button>

              {/* Continue Shopping Link */}
              <button
                onClick={onClose}
                className="w-full text-center text-xs sm:text-sm text-[#360000] hover:text-[#360000] font-medium transition-colors duration-200 font-open-sans tracking-wider"
              >
                Continue Shopping
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
