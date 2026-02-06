"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useStore } from "@/zustandStore/zustandStore";
import { addToDbCart, addToLocalCart, calculateCartCount, getLocalCartCount } from "@/utilityFunctions/CartFunctions";
import { createClient } from "@/lib/supabase/client";
import { Product } from "@/utilityFunctions/TypeInterface";
import { 
  addToLocalWishList, 
  removeFromLocalWishList,
  addToDbWishlist,
  removeFromDbWishlist,
  checkIfWishlisted
} from "@/utilityFunctions/WishListFunctions";
import { toast } from "react-toastify";
import { getCartQuantityForProduct } from "@/utilityFunctions/CartFunctions";


// export interface Product {
//   id: string;
//   title: string;
//   imageUrl: string;
//   price: number;
//   originalPrice?: number;
//   discount?: number;
//   slug?: string;
// }


// export interface 






interface ProductCardProps {
  product: any;
  onAddToCart?: (productId: string) => void;
  onWishlistToggle?: (productId: string) => void;
  isWishlisted?: boolean;
  size?: 'small' | 'default';
  isLoading?: boolean;
}

export default function ProductCard({
  product,
  onAddToCart,
  onWishlistToggle,
  isWishlisted = false,
  size = 'default',
  isLoading = false,
}: ProductCardProps) {
  const [isWishlistActive, setIsWishlistActive] = useState(isWishlisted);
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isCartClicked, setIsCartClicked] = useState(false);
  const { cartItems, setCartItems, AuthenticatedState, AuthUserId, CartId, setWishListItems, setCartCount } = useStore();
  const supabase = createClient();

  // Check if product is wishlisted when component mounts (for authenticated users)
  useEffect(() => {
    const checkWishlistStatus = async () => {
      if (AuthenticatedState && AuthUserId && product.product_id) {
        const wishlisted = await checkIfWishlisted(product.product_id, AuthUserId, supabase);
        setIsWishlistActive(wishlisted);
      }
    };
    checkWishlistStatus();
  }, [AuthenticatedState, AuthUserId, product.product_id]);

  const handleWishlistClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const newWishlistState = !isWishlistActive;
    setIsWishlistActive(newWishlistState);
    onWishlistToggle?.(product.product_id);

    if (AuthenticatedState && AuthUserId) {
      // Use database functions for authenticated users
      if (newWishlistState) {
        // Add to wishlist
        const result = await addToDbWishlist(product, AuthUserId, supabase);
        if (!result.success) {
          // Revert state if failed
          setIsWishlistActive(!newWishlistState);
          console.error("Failed to add to wishlist:", result.error);
        }
      } else {
        // Remove from wishlist
        const result = await removeFromDbWishlist(product, AuthUserId, supabase);
        if (!result.success) {
          // Revert state if failed
          setIsWishlistActive(!newWishlistState);
          console.error("Failed to remove from wishlist:", result.error);
        }
      }
    } else {
      // Use localStorage for unauthenticated users
      if (newWishlistState) {
        const updatedWishList = addToLocalWishList(product);
        setWishListItems(updatedWishList);
        console.log("updatedWishList", updatedWishList);
      } else {
        const updatedWishList = removeFromLocalWishList(product);
        setWishListItems(updatedWishList);
        console.log("removed from wishList", updatedWishList);
      }
    }
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const productId = product?.product_id;
    const availableStock = Number(product?.stock_quantity);
    const currentQtyInCart = getCartQuantityForProduct(cartItems, productId);

    if (Number.isFinite(availableStock)) {
      if (availableStock <= 0) {
        toast.error("This product is out of stock.", {
          style: { backgroundColor: "#eec0c8", color: "#360000" },
          position: "top-right",
        });
        return;
      }
      if (currentQtyInCart >= availableStock) {
        toast.error(`Only ${availableStock} item(s) available in stock.`, {
          style: { backgroundColor: "#eec0c8", color: "#360000" },
          position: "top-right",
        });
        return;
      }
    }

    setIsCartClicked(true);
    onAddToCart?.(product.product_id);
    if(AuthenticatedState){
      console.log("AuthenticatedState",AuthenticatedState)
      console.log("AuthUserId",AuthUserId)
      console.log("CartId",CartId)
      const updatedItem = await addToDbCart(product,CartId,supabase)
      setCartItems(updatedItem);
      // Update cart count for authenticated users
      if (updatedItem && Array.isArray(updatedItem)) {
        setCartCount(calculateCartCount(updatedItem));
      }
    }
    else{
      const updatedItem = addToLocalCart(product)
      setCartItems(updatedItem);
      // Update cart count for unauthenticated users
      setCartCount(getLocalCartCount());
    }
    
    // Show success toast
    toast.success(`Item added to cart!`,{
      style:{
        backgroundColor:"#eec0c8",
        color:"#360000",
      },
      position:"top-right"
    });
    
    // Reset animation after it completes
    setTimeout(() => {
      setIsCartClicked(false);
    }, 500);
  };

  // Normalize price values to numbers to avoid string issues
  const basePrice = Number(product?.base_price) || 0;
  const finalPrice = Number(product?.final_price) || 0;
  const computedDiscount =
    basePrice > 0 && finalPrice >= 0
      ? Math.round(((basePrice - finalPrice) / basePrice) * 100)
      : 0;
  const discountPercentage =
    typeof product?.discount_percentage === "number"
      ? product.discount_percentage
      : computedDiscount;
  const showBasePrice =
    basePrice > 0 && finalPrice >= 0 && basePrice !== finalPrice;

  const CardContent = (
    <div
      className="group relative bg-white rounded-xl md:rounded-2xl border border-gray-100 hover:border-gray-200 shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden flex flex-col h-full transform hover:-translate-y-1 "
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container with Gradient Overlay */}
      <div className="relative w-full aspect-[2/3] bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
        {!imageError ? (
          <>
            <Image
              src={product.thumbnail_image}
              alt={product.product_name}
              fill
              className={`object-contain transition-all duration-700 ${
                isHovered ? " brightness-105" : "brightness-100"
              }`}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              onError={() => setImageError(true)}
            />
            {/* Gradient Overlay on Hover */}
            <div
              className={`absolute inset-0 bg-gradient-to-t from-black/0 via-black/0 to-black/0 transition-all duration-500 ${
                isHovered ? "via-black/5 to-black/10" : ""
              }`}
            />
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
            <svg
              className="w-20 h-20 text-gray-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}

        {/* Discount Badge - Redesigned */}
        {discountPercentage > 0 && (
          <div className="absolute top-2 left-2 md:top-3 md:left-3 bg-gradient-to-r from-theme-sage to-theme-olive text-white text-[10px] md:text-xs font-bold px-2 py-1 md:px-3 md:py-1.5 rounded-full shadow-lg transform transition-all duration-300 hover:scale-110">
            <span className="flex items-center gap-0.5 md:gap-1">
              <svg className="w-2.5 h-2.5 md:w-3 md:h-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              {discountPercentage}% OFF
            </span>
          </div>
        )}

        {/* Wishlist Button - Enhanced */}
        <button
          onClick={handleWishlistClick}
          className="absolute top-2 right-2 md:top-3 md:right-3 p-2 md:p-2.5 bg-white/95 backdrop-blur-sm hover:bg-white rounded-full shadow-lg z-10"
          aria-label={
            isWishlistActive ? "Remove from wishlist" : "Add to wishlist"
          }

        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill={isWishlistActive ? "currentColor" : "none"}
            viewBox="0 0 24 24"
            strokeWidth={2.5}
            stroke="currentColor"
            className={`w-4 h-4 md:w-5 md:h-5 ${
              isWishlistActive ? "text-theme-olive fill-theme-olive" : "text-theme-sage"
            }`}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
            />
          </svg>
        </button>
      </div>

      {/* Product Info */}
      <div className="p-3 md:p-5 flex flex-col flex-grow">
        {/* Title */}
        <h3 className="text-sm md:text-lg font-semibold text-gray-900 truncate mb-2 md:mb-3 leading-tight group-hover:text-gray-700 transition-colors duration-300">
          {product.product_name}
        </h3>

        {/* Price Section - Enhanced */}
        <div className="border-t border-gray-100  ">
          <div className={`flex gap-2 ${size === 'small' ? 'mb-2 md:mb-3 flex-wrap md:flex-nowrap items-baseline md:items-baseline' : 'mb-3 md:mb-4 items-baseline'}`}>
            <div className="flex items-baseline gap-1.5 md:gap-2 flex-wrap md:flex-nowrap">
              <span className={`font-bold text-gray-900 tracking-tight ${
                size === 'small' 
                  ? 'text-sm md:text-lg' 
                  : 'text-lg md:text-2xl'
              }`}>
                ₹{finalPrice.toFixed(2)}
              </span>
              {showBasePrice && (
                <span className={`text-gray-400 line-through font-medium whitespace-nowrap ${
                  size === 'small' 
                    ? 'text-[10px] md:text-sm' 
                    : 'text-xs md:text-base'
                }`}>
                  ₹{basePrice.toFixed(2)}
                </span>
              )}
            </div>
            {showBasePrice && (
              <span className={`font-semibold text-theme-olive bg-theme-sage/20 rounded whitespace-nowrap ${
                size === 'small' 
                  ? 'text-[9px] md:text-xs px-1.5 py-0.5' 
                  : 'text-[10px] md:text-sm px-1.5 md:px-2 py-0.5'
              }`}>
                Save ₹{(basePrice - finalPrice).toFixed(2)}
              </span>
            )}
          </div>

          {/* Action Button - Redesigned */}
          <button
            onClick={handleAddToCart}
            className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold py-2.5 md:py-3 px-3 md:px-4 rounded-lg md:rounded-xl transition-all duration-300 shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] hover:bg-theme-olive hover:shadow-[0_1px_3px_0_rgba(0,0,0,0.08)] transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-1.5 md:gap-2 group/btn text-sm md:text-base"
          >
            <span className="transition-transform duration-300 group-hover/btn:translate-x-0.5">
              Add to Cart 
            </span>
            <svg
              className={`w-4 h-4 md:w-5 md:h-5 transition-transform duration-300 origin-center ${
                isCartClicked ? "rotate-90" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="group relative bg-white rounded-xl md:rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-full animate-pulse">
        <div className="relative w-full aspect-[4/5] bg-gradient-to-br from-gray-50 to-gray-100" />
        <div className="p-3 md:p-5 flex flex-col flex-grow gap-3 md:gap-4">
          <div className="space-y-2">
            <div className="h-4 md:h-5 bg-gray-200 rounded w-3/4" />
            <div className="h-3 md:h-4 bg-gray-200 rounded w-1/2" />
          </div>
          <div className="mt-auto pt-2 md:pt-3 border-t border-gray-100 space-y-3">
            <div className="flex gap-2 items-center">
              <div className="h-6 md:h-8 bg-gray-200 rounded w-24" />
              <div className="h-4 md:h-5 bg-gray-200 rounded w-16" />
              <div className="h-4 md:h-5 bg-gray-200 rounded w-14" />
            </div>
            <div className="h-10 md:h-12 bg-gray-200 rounded-lg md:rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (product.product_id) {
    return (
      <Link href={`/product/${product.product_id}`} className="block h-full">
        {CardContent}
      </Link>
    );
  }

  return CardContent;
}
