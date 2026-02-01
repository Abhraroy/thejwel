"use client";
import Navbar from "@/components/NavbarUI/Navbar";
import Carousel from "@/components/Carousel";
import CategorySection from "@/components/CategorySection";
import ProductCarousel from "@/components/ProductCarousel";
import BentoGrid from "@/components/BentoGrid";
import Image from "next/image";
import Footer from "@/components/Footer";
import { useStore } from "@/zustandStore/zustandStore";
import PhoneNumberInput from "@/components/AuthUI/PhoneNumberInput";
import OtpInput from "@/components/AuthUI/OtpInput";
import { useEffect, useState } from "react";
import { createClient } from "@/app/utils/supabase/client";
import Cart from "@/components/Cart";
import { addToDbCart, createCart } from "@/utilityFunctions/CartFunctions";
import { Product } from "@/utilityFunctions/TypeInterface";
import Collection from "@/components/Collection";
import Link from "next/link";
import ProductCard from "@/components/ProductUI/ProductCard";

export default function LandingPage() {
  const {
    MobnoInputState,
    OtpInputState,
    setMobnoInputState,
    setAuthenticatedState,
    AuthenticatedState,
    setAuthUserId,
    setCartId,
    setCartItems,
    CartId,
    setCategories,
    categories,
  } = useStore();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [loadingBestSellers, setLoadingBestSellers] = useState(true);
  const [loadingNewArrivals, setLoadingNewArrivals] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const supabase = createClient();

  // Create multiple slides with the same image
  const carouselItems = Array.from({ length: 3 }, (_, index) => (
    <div
      key={index}
      className="w-full h-[400px] md:h-[500px] lg:h-[600px] relative"
    >
      <Image
        src="https://battulaaljewels.com/website/images/product-banner.webp"
        alt={`Jewelry Banner ${index + 1}`}
        fill
        className="object-cover"
        priority={index === 0}
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

  useEffect(() => {
    const checkAuthentication = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      console.log("user", user);
      if (user) {
        setAuthenticatedState(true);

        const userData: any = await supabase
          .from("users")
          .select("*")
          .eq("phone_number", "+" + user.phone)
          .single();
        console.log("userData", userData);
        if (userData.data) {
          setAuthUserId(userData.data?.user_id);
          const { data, error } = await supabase
            .from("cart")
            .select("*")
            .eq("user_id", userData.data?.user_id)
            .maybeSingle();
          if (data) {
            console.log("Setting CartId", data?.cart_id);
            setCartId(data?.cart_id);
            const localCartItems = localStorage.getItem("cartItems");
            if (localCartItems) {
              let localCartItemsArray = localCartItems
                ? JSON.parse(localCartItems)
                : [];
              if (localCartItemsArray.length > 0) {
                console.log(
                  "After authentication cart items from local storage",
                  localCartItemsArray
                );
                for (const item of localCartItemsArray) {
                  console.log(
                    "Adding to db cart from local storage",
                    item.products
                  );
                  console.log("CartId", data?.cart_id);
                  console.log("supabase", supabase);
                  const updatedItem = await addToDbCart(
                    item.products,
                    data?.cart_id,
                    supabase
                  );
                  setCartItems(updatedItem);
                }
              } else {
                console.log("No cart items from local storage");
              }
            } else {
              console.log("No cart items from local storage");
            }
            localStorage.removeItem("cartItems");
          } else {
            const { success, data, error } = await createCart(
              userData.data?.user_id,
              supabase
            );
            if (success) {
              setCartId(data?.cart_id);
              const localCartItems = localStorage.getItem("cartItems");
              let localCartItemsArray = localCartItems
                ? JSON.parse(localCartItems)
                : [];
              if (localCartItemsArray.length > 0) {
                console.log(
                  "After authentication cart items from local storage",
                  localCartItemsArray
                );
                for (const item of localCartItemsArray) {
                  console.log(
                    "Adding to db cart from local storage",
                    item.products
                  );
                  console.log("CartId", data?.cart_id);
                  console.log("supabase", supabase);
                  const updatedItem = await addToDbCart(
                    item.products,
                    data?.cart_id,
                    supabase
                  );
                  setCartItems(updatedItem);
                }
              } else {
                console.log("No cart items from local storage");
              }
            } else {
              console.log("error", error);
            }
            localStorage.removeItem("cartItems");
          }
          console.log("User data", userData.data);
        }
        console.log("User is authenticated");
      } else {
        setAuthenticatedState(false);
        console.log("User is not authenticated");
      }
    };
    checkAuthentication();
  }, [AuthenticatedState]);

  useEffect(() => {
    const getBestSellers = async () => {
      setLoadingBestSellers(true);
      const { data, error }: any = await supabase
        .from("products")
        .select("*")
        .contains("tags", ["best-sellers"])
        .eq("listed_status", true);
      if (error) {
        console.log("error", error);
      } else {
        console.log("data", data);
        setBestSellers(data || []);
      }
      setLoadingBestSellers(false);
    };
    getBestSellers();
    const getNewArrivals = async () => {
      setLoadingNewArrivals(true);
      const { data, error }: any = await supabase
        .from("products")
        .select("*")
        .contains("tags", ["new-arrivals"])
        .eq("listed_status", true);
      if (error) {
        console.log("error", error);
      } else {
        console.log("data", data);
        setNewArrivals(data || []);
      }
      setLoadingNewArrivals(false);
    };
    getNewArrivals();
    
  }, []);

  useEffect(() => {
    const getAllCategories = async () => {
      setLoadingCategories(true);
      const { data, error } = await supabase.from("categories").select("*");
      if (error) {
        console.log("error", error);
      } else {
        console.log("data", data);
        setCategories(data || []);
      }
      setLoadingCategories(false);
    };
    getAllCategories();
  }, []);

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
      {/* Navbar with cart click handler */}
      {/* <Navbar cartCount={0} onCartClick={handleOpenCart} />
      {MobnoInputState && !OtpInputState && <PhoneNumberInput />}
      {OtpInputState && !MobnoInputState && <OtpInput />} */}

      {/* Cart Component - receives isOpen state and onClose handler */}
      {isCartOpen && <Cart isOpen={isCartOpen} onClose={handleCloseCart} />}
      <main className="w-full">
        <Carousel
          items={carouselItems}
          autoSlideInterval={3000}
          className="h-[400px] md:h-[500px] lg:h-[600px]"
        />
        {loadingCategories ? (
          <CategorySectionSkeleton />
        ) : categories.length > 0 ? (
          <CategorySection categories={categories} />
        ) : null}

        {/* New Arrival Products Section */}
        {loadingBestSellers ? (
          <ProductCarouselSkeleton title="Best Sellers" />
        ) : bestSellers.length > 0 ? (
          <ProductCarousel
            sectionHeading="Best Sellers"
            products={bestSellers}
            onAddToCart={handleAddToCart}
            onWishlistToggle={handleWishlistToggle}
          />
        ) : null}

        {/* Bento Grid Category Section */}
        <Collection />

        {/* You can add more ProductCarousel sections with different data */}
        {loadingNewArrivals ? (
          <ProductCarouselSkeleton title="New Arrivals" />
        ) : newArrivals.length > 0 ? (
          <ProductCarousel
            sectionHeading="New Arrivals"
            products={newArrivals}
            onAddToCart={handleAddToCart}
            onWishlistToggle={handleWishlistToggle}
          />
        ) : null}

        {/* Occasion Selection Section */}
        <section className="w-full py-12 md:py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-8 md:mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                Shop by Occasion
              </h2>
              <p className="text-gray-600 text-lg">
                Find the perfect jewelry for every special moment
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              {/* Everyday Wear Card */}
              <Link
                href="/occasion/everydaywear"
                className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-pink-50 to-rose-100 hover:from-pink-100 hover:to-rose-200 transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
              >
                <div className="p-8 md:p-10 h-full flex flex-col items-center text-center">
                  <div className="mb-6 w-20 h-20 md:w-24 md:h-24 bg-white/80 rounded-full flex items-center justify-center group-hover:bg-white transition-colors duration-300 group-hover:rotate-6">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-10 h-10 md:w-12 md:h-12 text-rose-500"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                    Everyday Wear
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Elegant pieces for your daily style
                  </p>
                  <span className="inline-flex items-center text-rose-600 font-semibold group-hover:text-rose-700 transition-colors">
                    Explore
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                      className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                      />
                    </svg>
                  </span>
                </div>
              </Link>

              {/* Party Wear Card */}
              <Link
                href="/occasion/partywear"
                className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-50 to-pink-100 hover:from-purple-100 hover:to-pink-200 transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
              >
                <div className="p-8 md:p-10 h-full flex flex-col items-center text-center">
                  <div className="mb-6 w-20 h-20 md:w-24 md:h-24 bg-white/80 rounded-full flex items-center justify-center group-hover:bg-white transition-colors duration-300 group-hover:rotate-6">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-10 h-10 md:w-12 md:h-12 text-purple-500"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                    Party Wear
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Stunning pieces to make you shine
                  </p>
                  <span className="inline-flex items-center text-purple-600 font-semibold group-hover:text-purple-700 transition-colors">
                    Explore
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                      className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                      />
                    </svg>
                  </span>
                </div>
              </Link>

              {/* Wedding Card */}
              <Link
                href="/occasion/wedding"
                className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-50 to-yellow-100 hover:from-amber-100 hover:to-yellow-200 transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
              >
                <div className="p-8 md:p-10 h-full flex flex-col items-center text-center">
                  <div className="mb-6 w-20 h-20 md:w-24 md:h-24 bg-white/80 rounded-full flex items-center justify-center group-hover:bg-white transition-colors duration-300 group-hover:rotate-6">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-10 h-10 md:w-12 md:h-12 text-amber-500"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                    Wedding
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Timeless elegance for your special day
                  </p>
                  <span className="inline-flex items-center text-amber-600 font-semibold group-hover:text-amber-700 transition-colors">
                    Explore
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                      className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                      />
                    </svg>
                  </span>
                </div>
              </Link>
            </div>
          </div>
        </section>

        {/* Model Carousel Section */}
        {/* <ModelCaraousel /> */}

        {/* Social Media Bento Section */}
        <section className="w-full py-12 md:py-16 px-0">
          <div className="w-full">
            {/* Heading row */}
            <div className="flex flex-col items-center justify-center gap-3 md:gap-4 mb-8 px-4 sm:px-6 lg:px-10 text-center">
              <p className="text-xs md:text-sm font-semibold uppercase tracking-[0.25em] text-lime-500">
                Social Gallery
              </p>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                See how our jewellery lives on social
              </h2>
              <button
                type="button"
                className="inline-flex items-center justify-center px-5 py-2.5 rounded-full bg-gray-900 text-white text-sm md:text-base font-semibold shadow-lg hover:shadow-xl hover:bg-lime-400 hover:text-black transition-all duration-200"
              >
                Follow our socials
                <span className="ml-2 text-lg leading-none">↗</span>
              </button>
            </div>

            {/* Bento grid inspired by reference image - now using images in each tile */}
            <div className="grid grid-cols-4 md:grid-cols-8 gap-3 md:gap-4 text-white px-2 sm:px-4 lg:px-6">
              {/* Left column cluster */}
              <div className="col-span-4 md:col-span-3 space-y-3 md:space-y-4">
                <div className="grid grid-cols-4 gap-3 md:gap-4">
                  {/* Reels card */}
                  <div className="col-span-2 relative rounded-2xl overflow-hidden">
                    <Image
                      src="https://battulaaljewels.com/website/images/product-banner.webp"
                      alt="Reels preview"
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    <div className="relative z-10 p-4 flex flex-col justify-between h-full">
                      <span className="text-[11px] uppercase tracking-[0.18em] text-lime-300">
                        Reels
                      </span>
                      <p className="text-lg md:text-xl font-extrabold leading-tight mt-2">
                        No filter,
                        <br />
                        just shine.
                      </p>
                    </div>
                  </div>
                  {/* Stories card */}
                  <div className="col-span-2 relative rounded-2xl overflow-hidden">
                    <Image
                      src="https://battulaaljewels.com/website/images/product-banner.webp"
                      alt="Stories preview"
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40" />
                    <div className="relative z-10 p-3 md:p-4 flex flex-col justify-between h-full text-black">
                      <span className="text-[11px] font-semibold uppercase tracking-[0.18em] bg-white/80 px-2 py-1 rounded-full w-fit">
                        Stories
                      </span>
                      <p className="mt-1 text-xs md:text-sm font-medium text-white">
                        Daily styling tips & drops.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-3 md:gap-4">
                  {/* Instagram card */}
                  <div className="col-span-3 relative rounded-2xl overflow-hidden">
                    <Image
                      src="https://battulaaljewels.com/website/images/product-banner.webp"
                      alt="Instagram grid"
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 via-blue-700/50 to-transparent" />
                    <div className="relative z-10 p-4 flex flex-col justify-between h-full">
                      <p className="text-xs uppercase tracking-[0.2em] text-blue-100">
                        Instagram
                      </p>
                      <p className="mt-2 text-lg md:text-xl font-bold leading-tight">
                        Plastic free,
                        <br />
                        planet friendly
                      </p>
                      <span className="mt-3 inline-flex items-center text-[11px] font-medium bg-black/60 px-2 py-1 rounded-full w-fit">
                        @yourbrand
                      </span>
                    </div>
                  </div>
                  {/* New drops small tile */}
                  <div className="col-span-1 relative rounded-2xl overflow-hidden">
                    <Image
                      src="https://battulaaljewels.com/website/images/product-banner.webp"
                      alt="New drops"
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40" />
                    <div className="relative z-10 p-2 flex items-center justify-center">
                      <span className="text-xs font-semibold text-white text-center bg-black/50 px-2 py-1 rounded-full">
                        New
                        <br />
                        drops
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Center tall tiles */}
              <div className="col-span-4 md:col-span-3 space-y-3 md:space-y-4">
                {/* More glow banner */}
                <div className="relative rounded-2xl overflow-hidden h-32 md:h-40">
                  <Image
                    src="https://battulaaljewels.com/website/images/product-banner.webp"
                    alt="More glow banner"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/20 to-transparent" />
                  <div className="relative z-10 p-4 flex items-center justify-center h-full">
                    <p className="text-xl md:text-2xl font-extrabold tracking-tight text-white text-center">
                      More glow,
                      <span className="text-black ml-1 px-2 py-1 rounded-full bg-yellow-300">
                        less noise
                      </span>
                    </p>
                  </div>
                </div>
                {/* TikTok / YouTube row */}
                <div className="grid grid-cols-4 gap-3 md:gap-4 h-40 md:h-48">
                  <div className="col-span-2 relative rounded-2xl overflow-hidden">
                    <Image
                      src="https://battulaaljewels.com/website/images/product-banner.webp"
                      alt="TikTok behind the scenes"
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    <div className="relative z-10 p-4 flex flex-col justify-between h-full">
                      <p className="text-xs uppercase tracking-[0.2em] text-purple-200">
                        TikTok
                      </p>
                      <p className="text-sm md:text-base font-medium mt-2">
                        Behind-the-scenes
                        <br />
                        from our studio.
                      </p>
                    </div>
                  </div>
                  <div className="col-span-2 relative rounded-2xl overflow-hidden">
                    <Image
                      src="https://battulaaljewels.com/website/images/product-banner.webp"
                      alt="YouTube stories"
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    <div className="relative z-10 p-4 flex flex-col justify-between h-full">
                      <p className="text-xs uppercase tracking-[0.2em] text-blue-50">
                        YouTube
                      </p>
                      <p className="text-lg md:text-xl font-bold leading-tight mt-2">
                        Craft stories
                        <br />
                        in motion.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right narrow column */}
              <div className="hidden md:flex md:flex-col md:col-span-2 space-y-4">
                <div className="relative rounded-2xl overflow-hidden h-32">
                  <Image
                    src="https://battulaaljewels.com/website/images/product-banner.webp"
                    alt="Choose positivity"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-white/80" />
                  <div className="relative z-10 p-4 text-black flex flex-col justify-between h-full">
                    <p className="text-[11px] uppercase tracking-[0.18em]">
                      Choose
                    </p>
                    <div className="flex items-center justify-between mt-2 text-xs font-semibold">
                      <span className="px-2 py-1 rounded-full bg-black text-white">
                        Love
                      </span>
                      <span className="px-2 py-1 rounded-full bg-pink-500 text-white">
                        Shine
                      </span>
                    </div>
                  </div>
                </div>
                <div className="relative rounded-2xl overflow-hidden h-40">
                  <Image
                    src="https://battulaaljewels.com/website/images/product-banner.webp"
                    alt="Community looks"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-emerald-700/80 via-emerald-400/40 to-transparent" />
                  <div className="relative z-10 p-4 flex flex-col justify-between h-full">
                    <p className="text-xs uppercase tracking-[0.2em] text-emerald-100">
                      Community
                    </p>
                    <p className="text-sm font-medium">
                      Tag us in your
                      <br />
                      favourite looks.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Second bento row to fill width more strongly, also image-based */}
            <div className="mt-6 grid grid-cols-4 md:grid-cols-8 gap-3 md:gap-4 text-white px-2 sm:px-4 lg:px-6">
              <div className="col-span-4 md:col-span-4 grid grid-cols-4 gap-3 md:gap-4">
                <div className="col-span-2 relative rounded-2xl overflow-hidden">
                  <Image
                    src="https://battulaaljewels.com/website/images/product-banner.webp"
                    alt="Live sparkle"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="relative z-10 p-4 flex flex-col justify-between h-full">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-emerald-100">
                      Live
                    </p>
                    <p className="text-lg md:text-xl font-extrabold leading-tight mt-2">
                      Sparkle in
                      <br />
                      real time.
                    </p>
                  </div>
                </div>
                <div className="col-span-2 relative rounded-2xl overflow-hidden">
                  <Image
                    src="https://battulaaljewels.com/website/images/product-banner.webp"
                    alt="Collab edits"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-pink-600/70" />
                  <div className="relative z-10 p-4 flex flex-col justify-between h-full">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-pink-100">
                      Collabs
                    </p>
                    <p className="text-xs md:text-sm font-medium mt-2">
                      Creator edits &
                      <br />
                      style challenges.
                    </p>
                  </div>
                </div>
              </div>

              <div className="col-span-4 md:col-span-4 grid grid-cols-4 gap-3 md:gap-4">
                <div className="col-span-2 relative rounded-2xl overflow-hidden">
                  <Image
                    src="https://battulaaljewels.com/website/images/product-banner.webp"
                    alt="Pinterest moodboard"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-indigo-900/70" />
                  <div className="relative z-10 p-4 flex flex-col justify-between h-full">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-indigo-200">
                      Pinterest
                    </p>
                    <p className="text-sm md:text-base font-medium mt-2">
                      Save dream looks
                      <br />
                      for later.
                    </p>
                  </div>
                </div>
                <div className="col-span-2 relative rounded-2xl overflow-hidden">
                  <Image
                    src="https://battulaaljewels.com/website/images/product-banner.webp"
                    alt="Highlights grid"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-yellow-300/90 via-orange-500/70 to-transparent" />
                  <div className="relative z-10 p-4 flex flex-col justify-between h-full">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-black">
                      Highlights
                    </p>
                    <p className="text-lg md:text-xl font-extrabold leading-tight text-black mt-2">
                      Let&apos;s
                      <br />
                      make it great.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function SkeletonPulseBlock({ className }: { className?: string }) {
  return <div className={`bg-gray-200 animate-pulse ${className}`} />;
}

function CategorySectionSkeleton() {
  return (
    <section className="w-full bg-theme-cream py-8 md:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-7 md:h-9 w-48 md:w-60 mx-auto bg-gray-200 animate-pulse rounded mb-6 md:mb-8" />
        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex gap-4 md:gap-6 pb-4 min-w-max md:justify-center md:flex-wrap pt-4">
            {Array.from({ length: 8 }).map((_, idx) => (
              <div
                key={idx}
                className="flex flex-col items-center flex-shrink-0 w-20 md:w-24 lg:w-28 gap-2"
              >
                <div className="w-20 h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 rounded-full bg-gray-200 animate-pulse" />
                <div className="h-3 md:h-4 w-16 md:w-20 bg-gray-200 animate-pulse rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function ProductCarouselSkeleton({ title }: { title: string }) {
  const placeholderCards = Array.from({ length: 4 });
  return (
    <section className="w-full bg-theme-cream py-6 md:py-12 lg:py-16">
      <div className="flex items-center justify-center mb-5 md:mb-8 px-4 sm:px-6 lg:px-8">
        <div className="h-6 md:h-8 w-40 md:w-56 bg-gray-200 animate-pulse rounded" aria-label={title} />
      </div>
      <div className="relative w-full">
        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex gap-6 pb-10 md:pb-12 pl-4 sm:pl-6 lg:pl-8 pr-4 sm:pr-6 lg:pr-8">
            {placeholderCards.map((_, idx) => (
              <div
                key={idx}
                className="product-card flex-shrink-0 w-[calc((100vw/1.3-3rem)*0.95)] sm:w-[calc((100vw/2-4rem)*0.95)] md:w-[calc((100vw/2.5-5rem)*0.95)] lg:w-[calc(100vw/3-6rem)] xl:w-[380px]"
              >
                <ProductCard product={{}} isLoading />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}



