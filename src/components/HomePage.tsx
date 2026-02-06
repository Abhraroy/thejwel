"use client";
import dynamic from "next/dynamic";
import Carousel from "@/components/Carousel";
import CategorySection from "@/components/CategorySection";
import ProductCarousel from "@/components/ProductUI/ProductCarousel";
import Image from "next/image";
import { useStore } from "@/zustandStore/zustandStore";
import { useEffect, useState, Suspense } from "react";
import { createClient } from "@/app/utils/supabase/client";

import {
  createCart,
  calculateCartCount,
  getLocalCartCount,
} from "@/utilityFunctions/CartFunctions";
import { Product } from "@/utilityFunctions/TypeInterface";
import ProductCarouselSkeleton from "@/components/ProductUI/ProductCaraouselSkeleton";

const OccasionSection = dynamic(
    () => import("./OccasionSection"),
    { ssr: false }
  );
  
  const SocialMediaBento = dynamic(
    () => import("./SocialMedia"),
    { ssr: false }
  );
  
  const ImageGalleryCarousel = dynamic(
    () => import("./ImageView/ImageGalleryCarousel"),
    { ssr: false }
  );
  
  const Collection = dynamic(
    () => import("./Collection"),
    { ssr: false }
  );

// Skeleton Components
const CarouselSkeleton = () => (
  <div className="w-full h-[300px] sm:h-[400px] md:h-[500px] lg:h-[600px] xl:h-[700px] bg-gray-200 animate-pulse" />
);

const CategorySectionSkeleton = () => (
  <section className="w-full py-8 md:py-12">
    <div className="max-w-7xl mx-auto px-4">
      <div className="h-7 w-48 mx-auto bg-gray-200 animate-pulse rounded mb-6" />
      <div className="flex gap-4 justify-center flex-wrap">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-2">
            <div className="w-20 h-20 rounded-full bg-gray-200 animate-pulse" />
            <div className="h-3 w-16 bg-gray-200 animate-pulse rounded" />
          </div>
        ))}
      </div>
    </div>
  </section>
);

const CollectionSkeleton = () => (
  <section className="py-8 md:py-12 lg:py-16">
    <div className="w-[95%] mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
        {Array.from({ length: 2 }).map((_, i) => (
          <div
            key={i}
            className="h-[400px] md:h-[500px] lg:h-[600px] bg-gray-200 animate-pulse rounded-xl"
          />
        ))}
      </div>
    </div>
  </section>
);

const OccasionSectionSkeleton = () => (
  <section className="w-full py-12 md:py-16 px-4 sm:px-6 lg:px-8">
    <div className="max-w-7xl mx-auto">
      <div className="text-center mb-8 md:mb-12">
        <div className="h-10 md:h-14 w-64 md:w-80 mx-auto bg-gray-200 animate-pulse rounded mb-3" />
        <div className="h-5 w-96 mx-auto bg-gray-200 animate-pulse rounded" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="h-64 md:h-80 bg-gray-200 animate-pulse rounded-2xl"
          />
        ))}
      </div>
    </div>
  </section>
);

const ImageGalleryCarouselSkeleton = () => (
  <section className="w-full py-12 md:py-20">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-10 md:mb-14">
        <div className="h-8 md:h-12 w-48 md:w-64 mx-auto bg-gray-200 animate-pulse rounded mb-3" />
        <div className="h-4 w-96 mx-auto bg-gray-200 animate-pulse rounded" />
      </div>
      <div className="relative">
        <div className="h-[300px] sm:h-[400px] md:h-[500px] lg:h-[550px] bg-gray-200 animate-pulse rounded-2xl" />
        <div className="flex items-center justify-center gap-2 mt-6 md:mt-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="w-2 h-2 bg-gray-300 animate-pulse rounded-full"
            />
          ))}
        </div>
      </div>
    </div>
  </section>
);

const SocialMediaBentoSkeleton = () => (
  <section className="w-full py-12 md:py-16 px-0">
    <div className="w-full">
      <div className="flex flex-col items-center justify-center gap-3 md:gap-4 mb-8 px-4 sm:px-6 lg:px-10">
        <div className="h-7 md:h-9 w-48 md:w-56 bg-gray-200 animate-pulse rounded" />
        <div className="h-6 md:h-7 w-64 md:w-80 bg-gray-200 animate-pulse rounded" />
        <div className="h-10 w-40 bg-gray-200 animate-pulse rounded-full" />
      </div>
      <div className="grid grid-cols-4 md:grid-cols-8 gap-3 md:gap-4 px-2 sm:px-4 lg:px-6">
        <div className="col-span-4 md:col-span-3 space-y-3 md:space-y-4">
          <div className="grid grid-cols-4 gap-3 md:gap-4">
            <div className="col-span-2 h-32 md:h-40 bg-gray-200 animate-pulse rounded-2xl" />
            <div className="col-span-2 h-32 md:h-40 bg-gray-200 animate-pulse rounded-2xl" />
          </div>
          <div className="grid grid-cols-4 gap-3 md:gap-4">
            <div className="col-span-3 h-32 md:h-40 bg-gray-200 animate-pulse rounded-2xl" />
            <div className="col-span-1 h-32 md:h-40 bg-gray-200 animate-pulse rounded-2xl" />
          </div>
        </div>
        <div className="col-span-4 md:col-span-3 space-y-3 md:space-y-4">
          <div className="h-32 md:h-40 bg-gray-200 animate-pulse rounded-2xl" />
          <div className="grid grid-cols-4 gap-3 md:gap-4 h-40 md:h-48">
            <div className="col-span-2 bg-gray-200 animate-pulse rounded-2xl" />
            <div className="col-span-2 bg-gray-200 animate-pulse rounded-2xl" />
          </div>
        </div>
        <div className="hidden md:flex md:flex-col md:col-span-2 space-y-4">
          <div className="h-32 bg-gray-200 animate-pulse rounded-2xl" />
          <div className="h-40 bg-gray-200 animate-pulse rounded-2xl" />
        </div>
      </div>
      <div className="mt-6 grid grid-cols-4 md:grid-cols-8 gap-3 md:gap-4 px-2 sm:px-4 lg:px-6">
        <div className="col-span-4 md:col-span-4 grid grid-cols-4 gap-3 md:gap-4">
          <div className="col-span-2 h-40 md:h-48 bg-gray-200 animate-pulse rounded-2xl" />
          <div className="col-span-2 h-40 md:h-48 bg-gray-200 animate-pulse rounded-2xl" />
        </div>
        <div className="col-span-4 md:col-span-4 grid grid-cols-4 gap-3 md:gap-4">
          <div className="col-span-2 h-40 md:h-48 bg-gray-200 animate-pulse rounded-2xl" />
          <div className="col-span-2 h-40 md:h-48 bg-gray-200 animate-pulse rounded-2xl" />
        </div>
      </div>
    </div>
  </section>
);
  




const BestSellersSection = dynamic(
    () => import("./HomePageComponents/BestSellerSection"),
    { ssr: false }
  );
  const NewArrivalSection = dynamic(
    () => import("./HomePageComponents/NewArrivalSection"),
    { ssr: false }
  );
  const FeaturedSection = dynamic(
    () => import("./HomePageComponents/FeaturedSection"),
    { ssr: false }
  );
  const Cart = dynamic(() => import("./CartUI/Cart"), {
    ssr: false,
  });

export default function HomePage(
    {
        categoriesProps,
        bestSellers,
        newArrivals,
        featuredProducts,
    }:{
        categoriesProps: any;
        bestSellers: Product[];
        newArrivals: Product[];
        featuredProducts: Product[];
    }
) {
  const {
    setAuthenticatedState,
    setAuthUserId,
    setCartId,
    setCartItems,
    setCategories,
    categories,
    setCartCount,
  } = useStore();
  const [isCartOpen, setIsCartOpen] = useState(false);
//   const [loadingBestSellers, setLoadingBestSellers] = useState(true);
//   const [loadingNewArrivals, setLoadingNewArrivals] = useState(true);
//   const [loadingCategories, setLoadingCategories] = useState(true);
  const supabase = createClient();
  const [carouselItems, setCarouselItems] = useState<string[]>([]);
  // Simple slides array for the carousel
  useEffect(() => {
    const fetchCarouselItems = async () => {
      const { data, error } = await supabase.from("image_resources").select("imagelink").eq("section_name", "homepage_hero");
      if (error) {
        console.error("Error fetching carousel items:", error);
      }
      if (data) {
        setCarouselItems(data.map((item) => item.imagelink));
      }
    };
    fetchCarouselItems();
  }, []);


  const carouselItemsArray = carouselItems.map((src, index) => (
    <div
      key={index}
      className="w-full h-full relative"
    >
      <Image
        src={src}
        alt="Where Tradition Meets Modern Sparkle

Welcome to TheJWEL, your trusted online jewellery destination from the heart of Kolkata. We specialize in exquisitely crafted American Diamond jewellery and timeless Temple jewellery, designed to complement both modern elegance and traditional grace.

From everyday sophistication to festive grandeur, TheJWEL brings you jewellery that feels luxurious, looks stunning, and fits beautifully into your lifestyle."
        fill={true}
        className="object-cover"
        priority={index === 0}
        fetchPriority={index === 0 ? "high" : "auto"}
        sizes="100vw"
      />
    </div>
  ));

  const handleAddToCart = (productId: string) => {
    console.log("Add to cart:", productId);
    // Implement your add to cart logic here
  };

  const handleWishlistToggle = (productId: string) => {
    console.log("Wishlist toggle:", productId);
    // Implement your wishlist logic here
  };

  // ✅ FIXED - Get full cart after merging with quantity handling
  const mergeLocalCartItems = async (cartId: string): Promise<void> => {
    try {
      const localCartItems = localStorage.getItem("cartItems");
      if (!localCartItems) return;

      const localCartItemsArray = JSON.parse(localCartItems);
      if (
        !Array.isArray(localCartItemsArray) ||
        localCartItemsArray.length === 0
      ) {
        localStorage.removeItem("cartItems");
        return;
      }

      // First, fetch current cart items from DB to check what already exists
      const { data: existingCartItems, error: fetchError } = await supabase
        .from("cart_items")
        .select("product_id, quantity")
        .eq("cart_id", cartId);

      if (fetchError) {
        console.error("Error fetching existing cart items:", fetchError);
        return;
      }

      // Create a map of existing products for quick lookup
      const existingProductsMap = new Map(
        (existingCartItems || []).map((item) => [
          item.product_id,
          item.quantity,
        ])
      );

      // Process each local cart item
      const updatePromises = localCartItemsArray.map(async (item) => {
        const productId = item.products?.product_id || item.product_id;
        const localQuantity = item.quantity || 1;

        if (existingProductsMap.has(productId)) {
          // Product exists - update quantity by adding local quantity
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
          // Product doesn't exist - add it with local quantity
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

      // Fetch the complete updated cart from DB
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

  useEffect(() => {
    const checkAuthentication = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data?.user) {
        console.log("User not authenticated");
        setAuthenticatedState(false);
        // Set cart count from local storage for unauthenticated users
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
          console.log("✅ Recovery cart created:", newCart.cart_id);
          setCartId(newCart.cart_id);
          setCartCount(0);
          await mergeLocalCartItems(newCart.cart_id);
        } else {
          console.error("❌ Failed to create recovery cart:", createError);
          // Optionally show error to user
          setCartId("");
        }
        return; // Exit early
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
  }, []);

  useEffect(() => {
    
  setCategories(categoriesProps);
}, [categoriesProps]);

  // Handler to open the cart
  const handleOpenCart = () => {
    setIsCartOpen(true);
  };

  // Handler to close the cart
  const handleCloseCart = () => {
    setIsCartOpen(false);
  };

  return (
    <div className="min-h-screen bg-theme-cream">
      {/* Cart Component - receives isOpen state and onClose handler */}
      {isCartOpen && <Cart isOpen={isCartOpen} onClose={handleCloseCart} />}
      <main className="w-full">
        {/* Carousel */}
        <Suspense fallback={<CarouselSkeleton />}>
          <Carousel
            items={carouselItemsArray}
            autoSlideInterval={3000}
            className="w-full h-[300px] sm:h-[400px] md:h-[500px] lg:h-[600px] xl:h-[700px]"
          />
        </Suspense>

        {/* Category Section */}
        {categoriesProps && categoriesProps.length > 0 ? (
          <CategorySection categories={categoriesProps} />
        ) : (
          <CategorySectionSkeleton />
        )}

        {/* Best Sellers Products Section */}
        {bestSellers && bestSellers.length > 0 ? (
          <BestSellersSection
            products={bestSellers}
            onAddToCart={handleAddToCart}
            onWishlistToggle={handleWishlistToggle}
          />
        ) : (
          <ProductCarouselSkeleton title="Best Sellers" />
        )}

        {/* Featured Products Section */}
        {featuredProducts && featuredProducts.length > 0 ? (
          <FeaturedSection
            products={featuredProducts}
            onAddToCart={handleAddToCart}
            onWishlistToggle={handleWishlistToggle}
          />
        ) : (
          <ProductCarouselSkeleton title="Featured Products" />
        )}

        {/* Collection Section */}
        <Suspense fallback={<CollectionSkeleton />}>
          <Collection />
        </Suspense>

        {/* New Arrivals Products Section */}
        {newArrivals && newArrivals.length > 0 ? (
          <NewArrivalSection
            products={newArrivals}
            onAddToCart={handleAddToCart}
            onWishlistToggle={handleWishlistToggle}
          />
        ) : (
          <ProductCarouselSkeleton title="New Arrivals" />
        )}

        {/* Occasion Selection Section */}
        <Suspense fallback={<OccasionSectionSkeleton />}>
          <OccasionSection />
        </Suspense>

        {/* Image Gallery Carousel */}
        <Suspense fallback={<ImageGalleryCarouselSkeleton />}>
          <ImageGalleryCarousel />
        </Suspense>

        {/* Social Media Bento Section */}
        <Suspense fallback={<SocialMediaBentoSkeleton />}>
          <SocialMediaBento />
        </Suspense>
      </main>
    </div>
  );
}




