"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useStore } from "@/zustandStore/zustandStore";
import { createClient } from "@/app/utils/supabase/client";
import { addToLocalCart, addToDbCart } from "@/utilityFunctions/CartFunctions";
import { toast } from "react-toastify";
import { getCartQuantityForProduct } from "@/utilityFunctions/CartFunctions";

interface ProductData {
  name: string;
  price: number;
  originalPrice: number;
  discount: number;
  rating: number;
  reviews: number;
  inStock: boolean;
  stockCount: number;
  description: string;
  images: string[];
  sizes: string[];
  category: string;
  material: string;
  weight: string;
}

export default function ProductDisplay({
  productDetails,
}: {
  productDetails: any;
}) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [showZoom, setShowZoom] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [shouldTruncate, setShouldTruncate] = useState(false);
  const [truncatedDescription, setTruncatedDescription] = useState("");
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [cartSuccess, setCartSuccess] = useState(false);
  const [productImageView,setProductImageView] = useState(false);
  console.log(productDetails);

  const { cartItems, setCartItems, AuthenticatedState, CartId, setIsCartOpen } = useStore();
  const supabase = createClient();

  const product = productDetails?.[0];
  const productImages = product?.product_images ?? [];
  const carouselImages =
    Array.isArray(productImages) && productImages.length > 0
      ? productImages
      : [{ image_url: "/placeholder.png", image_id: "placeholder" }];
  const selectedImageUrl =
    productImages[selectedImage]?.image_url ??
    productImages[0]?.image_url ??
    "/placeholder.png";
  const reviewStats = product?.reviews?.[0];
  
  // Calculate average rating from reviews
  const reviews = product?.reviews ?? [];
  const averageRating = reviews.length > 0
    ? reviews.reduce((sum: number, review: any) => sum + (review.rating || 0), 0) / reviews.length
    : 0;
  const reviewCount = reviews.length;

  useEffect(() => {
    const description = productDetails?.[0]?.description ?? "";
    if (description.length > 150) {
      setShouldTruncate(true);
      setTruncatedDescription(description.substring(0, 150) + "...");
    } else {
      setShouldTruncate(false);
      setTruncatedDescription(description);
    }
  }, [productDetails]);

  // Keep selected image in-bounds if productImages changes
  useEffect(() => {
    if (!Array.isArray(productImages) || productImages.length === 0) {
      setSelectedImage(0);
      return;
    }
    if (selectedImage < 0 || selectedImage >= productImages.length) {
      setSelectedImage(0);
    }
  }, [productImages?.length]);

  const goPrevImage = () => {
    if (!Array.isArray(productImages) || productImages.length <= 1) return;
    setSelectedImage((prev) => (prev === 0 ? productImages.length - 1 : prev - 1));
  };

  const goNextImage = () => {
    if (!Array.isArray(productImages) || productImages.length <= 1) return;
    setSelectedImage((prev) => (prev === productImages.length - 1 ? 0 : prev + 1));
  };

  // Handle ESC key to close image viewer and prevent body scroll
  useEffect(() => {
    if (productImageView) {
      // Prevent body scroll when viewer is open
      document.body.style.overflow = "hidden";
      
      // Handle ESC key press
      const handleEsc = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          setProductImageView(false);
          return;
        }
        if (e.key === "ArrowLeft") {
          goPrevImage();
          return;
        }
        if (e.key === "ArrowRight") {
          goNextImage();
          return;
        }
      };
      
      window.addEventListener("keydown", handleEsc);
      
      return () => {
        document.body.style.overflow = "unset";
        window.removeEventListener("keydown", handleEsc);
      };
    } else {
      document.body.style.overflow = "unset";
    }
  }, [productImageView, productImages?.length]);

  // Touch swipe (mobile) for fullscreen viewer
  const touchStartXRef = useRef<number | null>(null);
  const touchEndXRef = useRef<number | null>(null);
  const SWIPE_THRESHOLD_PX = 50;

  // Smooth swipe carousel (mobile + tablet): native momentum scroll + snap + sync to selectedImage
  const mobileCarouselRef = useRef<HTMLDivElement>(null);
  const tabletCarouselRef = useRef<HTMLDivElement>(null);
  const viewerCarouselRef = useRef<HTMLDivElement>(null);
  const carouselScrollRafRef = useRef<number | null>(null);

  const syncSelectedFromCarousel = (el: HTMLDivElement | null) => {
    if (!el) return;
    const width = el.clientWidth || 1;
    const idx = Math.round(el.scrollLeft / width);
    const maxIdx = Math.max(0, (carouselImages?.length ?? 1) - 1);
    const clamped = Math.max(0, Math.min(idx, maxIdx));
    if (clamped !== selectedImage) setSelectedImage(clamped);
  };

  const onCarouselScroll =
    (ref: React.RefObject<HTMLDivElement | null>) =>
    (_e: React.UIEvent<HTMLDivElement>) => {
      if (carouselScrollRafRef.current) {
        cancelAnimationFrame(carouselScrollRafRef.current);
      }
      carouselScrollRafRef.current = requestAnimationFrame(() => {
        syncSelectedFromCarousel(ref.current);
      });
    };

  // When thumbnails / arrows / other UI changes selectedImage, smoothly scroll carousel to match.
  useEffect(() => {
    const refs = [mobileCarouselRef, tabletCarouselRef, viewerCarouselRef];
    refs.forEach((ref) => {
      const el = ref.current;
      if (!el) return;
      const width = el.clientWidth || 1;
      const targetLeft = width * selectedImage;
      if (Math.abs(el.scrollLeft - targetLeft) < 2) return;
      el.scrollTo({ left: targetLeft, behavior: "smooth" });
    });
  }, [selectedImage, carouselImages?.length]);

  // Keep snap alignment on resize (viewport width changes)
  useEffect(() => {
    const onResize = () => {
      [mobileCarouselRef.current, tabletCarouselRef.current, viewerCarouselRef.current].forEach((el) => {
        if (!el) return;
        const width = el.clientWidth || 1;
        el.scrollTo({ left: width * selectedImage, behavior: "auto" });
      });
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [selectedImage]);

  useEffect(() => {
    return () => {
      if (carouselScrollRafRef.current) cancelAnimationFrame(carouselScrollRafRef.current);
    };
  }, []);

  

  const handleAddToCart = async () => {
    if (!product) {
      toast.error("Product information is not available", {
        style: { backgroundColor: "#eec0c8", color: "#360000" },
        position: "top-right",
      });
      return;
    }

    const productId = product?.product_id;
    const availableStock = Number(product?.stock_quantity);
    const currentQtyInCart = getCartQuantityForProduct(cartItems, productId);
    const requestedQty = Number(quantity) || 1;

    if (Number.isFinite(availableStock)) {
      if (availableStock <= 0) {
        toast.error("This product is out of stock.", {
          style: { backgroundColor: "#eec0c8", color: "#360000" },
          position: "top-right",
        });
        return;
      }
      if (currentQtyInCart + requestedQty > availableStock) {
        toast.error(`Only ${availableStock} item(s) available in stock.`, {
          style: { backgroundColor: "#eec0c8", color: "#360000" },
          position: "top-right",
        });
        return;
      }
    }

    setIsAddingToCart(true);
    setCartSuccess(false);

    try {
      const productToAdd = {
        ...product,
        selectedSize: product.size?.[selectedSize] || null,
        quantity: quantity,
      };

      if (AuthenticatedState && CartId) {
        console.log("Adding to database cart");
        const updatedItems = await addToDbCart(productToAdd, CartId, supabase);
        if (updatedItems) {
          setCartItems(updatedItems);
          setCartSuccess(true);
          setIsCartOpen(true);
          setTimeout(() => setCartSuccess(false), 3000);
        } else {
          alert("Failed to add item to cart. Please try again.");
        }
      } else {
        console.log("Adding to local cart");
        const updatedItems = addToLocalCart(productToAdd);
        setCartItems(updatedItems);
        setCartSuccess(true);
        setIsCartOpen(true);
        setTimeout(() => setCartSuccess(false), 3000);
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("Failed to add item to cart. Please try again.", {
        style: { backgroundColor: "#eec0c8", color: "#360000" },
        position: "top-right",
      });
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const xPercent = (x / rect.width) * 100;
    const yPercent = (y / rect.height) * 100;

    // Calculate position relative to viewport for fixed positioning
    setMousePosition({ x: e.clientX, y: e.clientY });
    // Calculate background position for 2.5x zoom
    // The background needs to be positioned so the hovered area is centered in the zoom window
    setZoomPosition({
      x: xPercent,
      y: yPercent,
    });
  };

  const handleMouseEnter = () => {
    setShowZoom(true);
  };

  const handleMouseLeave = () => {
    setShowZoom(false);
  };

  // const descriptionLength = product.description.length;
  // const shouldTruncate = descriptionLength > 150;
  // const truncatedDescription = shouldTruncate
  //   ? product.description.substring(0, 150) + '...'
  //   : product.description;

  return (
    <>
      {/* Mobile Layout (0px - 767px) */}
      <>
        <div className="block md:hidden">
          <div className="flex min-h-screen w-full flex-col gap-4 bg-white p-4
          
          ">
            {/* Product Images Section */}
            <div className="flex w-full flex-col items-center justify-center gap-3
            ">
              {/* Main Image */}
              <div className="relative aspect-square w-full max-w-[90vw] overflow-hidden rounded-2xl bg-gray-100">
                <div
                  ref={mobileCarouselRef}
                  onScroll={onCarouselScroll(mobileCarouselRef)}
                  className="flex h-full w-full overflow-x-auto overflow-y-hidden scrollbar-hide snap-x snap-mandatory scroll-smooth touch-pan-x overscroll-x-contain"
                  style={{ WebkitOverflowScrolling: "touch" }}
                >
                  {carouselImages.map((img: any, idx: number) => (
                    <div
                      key={img?.image_id ?? idx}
                      className="relative h-full basis-full shrink-0 snap-center"
                    >
                      <Image
                        src={img?.image_url ?? "/placeholder.png"}
                        alt={`${productDetails?.[0]?.product_name ?? "Product"} ${idx + 1}`}
                        fill
                        className="object-cover cursor-pointer"
                        priority={idx === 0}
                        onClick={() => setProductImageView(true)}
                        sizes="100vw"
                      />
                    </div>
                  ))}
                </div>
              </div>
              {/* Thumbnail Images */}
              <div className="flex w-full flex-row justify-center gap-2">
                {productDetails[0]?.product_images?.map(
                  (img: any, index: number) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`h-16 w-16 overflow-hidden rounded-lg border-2 transition-all ${
                        selectedImage === index
                          ? "border-[#E94E8B] scale-105"
                          : "border-gray-200"
                      }`}
                    >
                      <Image
                        src={img.image_url}
                        alt={`${img.image_url} ${index + 1}`}
                        width={64}
                        height={64}
                        className="h-full w-full object-cover"
                      />
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Product Details Section */}
            <div className="flex w-full flex-col gap-4 pt-4">
              {/* Product Name */}
              <div className="space-y-2">
                <h1 className="text-2xl font-bold text-gray-900 leading-tight">
                  {productDetails[0]?.product_name}
                </h1>
                
                {/* Rating & Review Count */}
                {reviewCount > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`h-4 w-4 ${
                            i < Math.floor(averageRating)
                              ? "text-yellow-400 fill-yellow-400"
                              : "text-gray-300 fill-gray-300"
                          }`}
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-sm font-semibold text-gray-700">
                      {averageRating.toFixed(1)}
                    </span>
                    <span className="text-xs text-gray-500">
                      ({reviewCount} {reviewCount === 1 ? 'review' : 'reviews'})
                    </span>
                  </div>
                )}
                
                
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3 flex-wrap">
                <span className="text-3xl font-bold text-gray-900">
                  ₹{productDetails[0]?.final_price}
                </span>
                {productDetails[0]?.base_price && productDetails[0]?.base_price > productDetails[0]?.final_price && (
                  <>
                    <span className="text-lg text-gray-400 line-through">
                      ₹{productDetails[0]?.base_price}
                    </span>
                    {typeof productDetails[0]?.discount_percentage === "number" && productDetails[0]?.discount_percentage > 0 && (
                      <span className="inline-flex items-center rounded-full bg-gradient-to-r from-green-500 to-emerald-500 px-3 py-1 text-xs font-bold text-white shadow-md">
                        {productDetails[0]?.discount_percentage}% OFF
                      </span>
                    )}
                  </>
                )}
              </div>

              {/* Stock Status */}
              <div className="flex items-center gap-2.5 bg-gray-50 rounded-lg p-3 border border-gray-100">
                <div className="relative">
                  <div
                    className={`h-3 w-3 rounded-full ${
                      (productDetails[0]?.stock_quantity ?? 0) > 0
                        ? "bg-green-500"
                        : "bg-red-500"
                    }`}
                  ></div>
                  {(productDetails[0]?.stock_quantity ?? 0) > 0 && (
                    <div className="absolute inset-0 h-3 w-3 rounded-full bg-green-500 animate-ping opacity-75"></div>
                  )}
                </div>
                <span
                  className={`text-sm font-semibold ${
                    (productDetails[0]?.stock_quantity ?? 0) > 0
                      ? "text-green-700"
                      : "text-red-700"
                  }`}
                >
                  {(productDetails[0]?.stock_quantity ?? 0) > 0
                    ? `In Stock • ${productDetails[0]?.stock_quantity} available`
                    : "Out of Stock"}
                </span>
              </div>

              {/* Product Info Cards */}
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-lg bg-gradient-to-br from-pink-50 to-rose-50 p-2.5 border border-pink-100 shadow-sm hover:shadow-md transition-shadow">
                  <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wide mb-1">Collection</p>
                  <p className="text-xs font-bold text-gray-900">
                    {productDetails[0]?.collection ?? "--"}
                  </p>
                </div>
                <div className="rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 p-2.5 border border-blue-100 shadow-sm hover:shadow-md transition-shadow">
                  <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wide mb-1">Category</p>
                  <p className="text-xs font-bold text-gray-900">
                    {productDetails[0]?.categories?.category_name ?? "--"}
                  </p>
                </div>
                <div className="rounded-lg bg-gradient-to-br from-purple-50 to-violet-50 p-2.5 border border-purple-100 shadow-sm hover:shadow-md transition-shadow">
                  <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wide mb-1">Weight</p>
                  <p className="text-xs font-bold text-gray-900">
                    {productDetails[0]?.weight_grams ?? "--"} <span className="text-[10px] font-normal text-gray-600">grams</span>
                  </p>
                </div>
              </div>

              {/* Tags */}
              {productDetails[0]?.tags &&
                Array.isArray(productDetails[0]?.tags) &&
                productDetails[0]?.tags.length > 0 && (
                  <div className="flex flex-col gap-3">
                    <span className="text-sm font-bold text-gray-900 uppercase tracking-wide">
                      Tags
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {productDetails[0].tags.map((tag: string, index: number) => (
                        <span
                          key={index}
                          className="inline-flex items-center rounded-full bg-gradient-to-r from-pink-500 to-rose-500 px-3 py-1 text-[11px] font-semibold text-white shadow-md hover:shadow-lg transition-all duration-200"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

              {/* Size Selection */}
              {productDetails[0]?.size && productDetails[0]?.size.length > 0 && (
                <div className="flex flex-col gap-3">
                  <span className="text-sm font-bold text-gray-900 uppercase tracking-wide">
                    Select Size
                  </span>
                  <div className="flex flex-wrap gap-2.5">
                    {productDetails[0]?.size.map((size: any, index: number) => (
                      <button
                        type="button"
                        key={index}
                        onClick={() => setSelectedSize(index)}
                        className={`relative rounded-xl px-5 py-2.5 text-sm font-semibold transition-all duration-200 transform ${
                          selectedSize === index
                            ? "bg-gradient-to-r from-[#E94E8B] to-[#d43e7a] text-white shadow-lg scale-105 ring-2 ring-[#E94E8B] ring-offset-2"
                            : "bg-white text-gray-700 border-2 border-gray-200 hover:border-[#E94E8B] hover:shadow-md hover:scale-105"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Add to Cart Button */}
              <button
                onClick={handleAddToCart}
                disabled={isAddingToCart || (productDetails[0]?.stock_quantity ?? 0) === 0}
                className={`group relative h-14 w-full rounded-xl bg-gradient-to-r from-[#E94E8B] to-[#d43e7a] text-base font-bold text-white shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 overflow-hidden ${
                  isAddingToCart || (productDetails[0]?.stock_quantity ?? 0) === 0
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                } ${cartSuccess ? "bg-gradient-to-r from-green-500 to-emerald-500" : ""}`}
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {isAddingToCart ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Adding...
                    </>
                  ) : cartSuccess ? (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Added to Cart!
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      Add to Cart
                    </>
                  )}
                </span>
                <span className="absolute inset-0 bg-gradient-to-r from-[#d43e7a] to-[#E94E8B] opacity-0 group-hover:opacity-100 transition-opacity duration-200"></span>
              </button>

              {/* Description */}
              <div className="mt-4 border-t border-gray-200 pt-6">
                <h3 className="mb-3 text-lg font-bold text-gray-900 uppercase tracking-wide">
                  Description
                </h3>
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <p className="text-sm leading-relaxed text-gray-700">
                    {shouldTruncate && !isDescriptionExpanded
                      ? truncatedDescription
                      : productDetails[0]?.description}
                  </p>
                </div>
                {shouldTruncate && (
                  <button
                    onClick={() =>
                      setIsDescriptionExpanded(!isDescriptionExpanded)
                    }
                    className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-[#E94E8B] hover:text-[#d43e7a] transition-colors"
                  >
                    {isDescriptionExpanded ? (
                      <>
                        <span>Read Less</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                      </>
                    ) : (
                      <>
                        <span>Read More</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Additional Info */}
              <div className="space-y-3 border-t border-gray-200 pt-6">
                <h3 className="text-lg font-bold text-gray-900 uppercase tracking-wide">
                  Product Details
                </h3>
                <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100 overflow-hidden">
                  <div className="flex justify-between items-center p-3 hover:bg-gray-50 transition-colors">
                    <span className="text-sm font-medium text-gray-600">Category</span>
                    <span className="text-sm font-bold text-gray-900">
                      {productDetails[0]?.categories?.category_name ?? "--"}
                    </span>
                  </div>
                  {productDetails[0]?.collection && (
                    <div className="flex justify-between items-center p-3 hover:bg-gray-50 transition-colors">
                      <span className="text-sm font-medium text-gray-600">Collection</span>
                      <span className="text-sm font-bold text-gray-900">
                        {productDetails[0]?.collection ?? "--"}
                      </span>
                    </div>
                  )}
                  {productDetails[0]?.tags &&
                    Array.isArray(productDetails[0]?.tags) &&
                    productDetails[0]?.tags.length > 0 && (
                      <div className="flex flex-col gap-2 p-3 hover:bg-gray-50 transition-colors">
                        <span className="text-sm font-medium text-gray-600">Tags</span>
                        <div className="flex flex-wrap gap-2">
                          {productDetails[0].tags.map((tag: string, idx: number) => (
                            <span
                              key={idx}
                              className="inline-flex items-center rounded-full bg-gray-100 text-gray-800 px-3 py-1 text-xs font-semibold"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  <div className="flex justify-between items-center p-3 hover:bg-gray-50 transition-colors">
                    <span className="text-sm font-medium text-gray-600">Weight</span>
                    <span className="text-sm font-bold text-gray-900">
                      {productDetails[0]?.weight_grams ?? "--"} grams
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
      </>
      {/* Tablet Layout (768px - 1365px) */}
      <div className="hidden md:block xl:hidden">
        <div className="flex min-h-screen w-full flex-col gap-8 bg-white p-8">
          <div className="flex flex-col gap-8 lg:flex-row">
            {/* Product Images Section */}
            <div className="flex w-full flex-col gap-4 lg:w-1/2 lg:flex-row">
              {/* Thumbnail Images */}
              <div className="flex flex-row gap-3 overflow-x-auto pb-1 lg:flex-col lg:overflow-x-visible lg:pb-0">
                {productImages.map((img: any, index: number) => (
                  <button
                    key={img.review_image_id ?? index}
                    onClick={() => setSelectedImage(index)}
                    className={`h-20 w-20 overflow-hidden rounded-lg border-2 transition-all ${
                      selectedImage === index
                        ? "border-[#E94E8B] scale-105"
                        : "border-gray-200"
                    }`}
                  >
                    <Image
                      src={img.image_url}
                      alt={`${img.image_url} ${index + 1}`}
                      width={80}
                      height={80}
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
              {/* Main Image */}
              <div
                className="relative aspect-square flex-1 overflow-hidden rounded-2xl bg-gray-100"
                onMouseMove={handleMouseMove}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                <div
                  ref={tabletCarouselRef}
                  onScroll={onCarouselScroll(tabletCarouselRef)}
                  className="flex h-full w-full overflow-x-auto overflow-y-hidden scrollbar-hide snap-x snap-mandatory scroll-smooth touch-pan-x overscroll-x-contain"
                  style={{ WebkitOverflowScrolling: "touch" }}
                >
                  {carouselImages.map((img: any, idx: number) => (
                    <div
                      key={img?.image_id ?? idx}
                      className="relative h-full basis-full shrink-0 snap-center"
                    >
                      <Image
                        src={img?.image_url ?? "/placeholder.png"}
                        alt={`${product?.product_name ?? "Product"} ${idx + 1}`}
                        fill
                        className="object-cover"
                        priority={idx === 0}
                        onClick={() => setProductImageView(true)}
                        sizes="50vw"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {/* Zoom Layer - Outside container to avoid clipping */}
            {showZoom && (
              <div
                className="fixed h-48 w-48 rounded-xl border-2 border-white shadow-2xl overflow-hidden pointer-events-none"
                style={{
                  left: `${mousePosition.x}px`,
                  top: `${mousePosition.y}px`,
                  transform: "translate(-50%, -50%)",
                  zIndex: 9999,
                }}
              >
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundImage: `url(${productImages[selectedImage]?.image_url})`,
                    backgroundSize: "250%",
                    backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
                    backgroundRepeat: "no-repeat",
                  }}
                />
              </div>
            )}

            {/* Product Details Section */}
            <div className="flex w-full flex-col gap-4 lg:w-1/2">
              {/* Product Name */}
              <div className="space-y-2">
                <h1 className="text-3xl font-bold text-gray-900 leading-tight">
                  {product?.product_name}
                </h1>
                
                {/* Rating & Review Count */}
                {reviewCount > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`h-4 w-4 ${
                            i < Math.floor(averageRating)
                              ? "text-yellow-400 fill-yellow-400"
                              : "text-gray-300 fill-gray-300"
                          }`}
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-sm font-semibold text-gray-700">
                      {averageRating.toFixed(1)}
                    </span>
                    <span className="text-xs text-gray-500">
                      ({reviewCount} {reviewCount === 1 ? 'review' : 'reviews'})
                    </span>
                  </div>
                )}
                
              
                {product?.categories?.category_name && (
                  <p className="text-sm text-gray-500">
                    {product.categories.category_name}
                  </p>
                )}
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3 flex-wrap">
                <span className="text-4xl font-bold text-gray-900">
                  ₹{product?.final_price}
                </span>
                {product?.base_price && product?.base_price > product?.final_price && (
                  <>
                    <span className="text-xl text-gray-400 line-through">
                      ₹{product?.base_price}
                    </span>
                    {typeof product?.discount_percentage === "number" && product?.discount_percentage > 0 && (
                      <span className="inline-flex items-center rounded-full bg-gradient-to-r from-green-500 to-emerald-500 px-3 py-1 text-sm font-bold text-white shadow-md">
                        {product.discount_percentage}% OFF
                      </span>
                    )}
                  </>
                )}
              </div>

              {/* Stock Status */}
              <div className="flex items-center gap-2.5 bg-gray-50 rounded-lg p-3 border border-gray-100">
                <div className="relative">
                  <div
                    className={`h-3 w-3 rounded-full ${
                      (product?.stock_quantity ?? 0) > 0
                        ? "bg-green-500"
                        : "bg-red-500"
                    }`}
                  ></div>
                  {(product?.stock_quantity ?? 0) > 0 && (
                    <div className="absolute inset-0 h-3 w-3 rounded-full bg-green-500 animate-ping opacity-75"></div>
                  )}
                </div>
                <span
                  className={`text-sm font-semibold ${
                    (product?.stock_quantity ?? 0) > 0
                      ? "text-green-700"
                      : "text-red-700"
                  }`}
                >
                  {(product?.stock_quantity ?? 0) > 0
                    ? `In Stock • ${product?.stock_quantity} available`
                    : "Out of Stock"}
                </span>
              </div>

              {/* Product Info Cards */}
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-lg bg-gradient-to-br from-pink-50 to-rose-50 p-2.5 border border-pink-100 shadow-sm hover:shadow-md transition-shadow">
                  <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wide mb-1">Collection</p>
                  <p className="text-xs font-bold text-gray-900">
                    {product?.collection ?? "--"}
                  </p>
                </div>
                <div className="rounded-lg bg-gradient-to-br from-purple-50 to-violet-50 p-2.5 border border-purple-100 shadow-sm hover:shadow-md transition-shadow">
                  <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wide mb-1">Weight</p>
                  <p className="text-xs font-bold text-gray-900">
                    {product?.weight_grams ?? "--"} <span className="text-[10px] font-normal text-gray-600">grams</span>
                  </p>
                </div>
              </div>

              {/* Tags */}
              {product?.tags && Array.isArray(product?.tags) && product?.tags.length > 0 && (
                <div className="flex flex-col gap-3">
                  <span className="text-sm font-bold text-gray-900 uppercase tracking-wide">Tags</span>
                  <div className="flex flex-wrap gap-2">
                    {product.tags.map((tag: string, index: number) => (
                      <span
                        key={index}
                        className="inline-flex items-center rounded-full bg-gradient-to-r from-pink-500 to-rose-500 px-4 py-1.5 text-xs font-semibold text-white shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Size Selection */}
              {product?.size && product?.size.length > 0 && (
                <div className="flex flex-col gap-3">
                  <span className="text-sm font-bold text-gray-900 uppercase tracking-wide">
                    Select Size
                  </span>
                  <div className="flex flex-wrap gap-2.5">
                    {product?.size.map((size: any, index: number) => (
                      <button
                        key={index}
                        onClick={() => setSelectedSize(index)}
                        className={`relative rounded-xl px-5 py-2.5 text-sm font-semibold transition-all duration-200 transform ${
                          selectedSize === index
                            ? "bg-gradient-to-r from-[#E94E8B] to-[#d43e7a] text-white shadow-lg scale-105 ring-2 ring-[#E94E8B] ring-offset-2"
                            : "bg-white text-gray-700 border-2 border-gray-200 hover:border-[#E94E8B] hover:shadow-md hover:scale-105"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Add to Cart Button */}
              <button
                onClick={handleAddToCart}
                disabled={isAddingToCart || (product?.stock_quantity ?? 0) === 0}
                className={`group relative mt-2 h-14 w-full rounded-xl bg-gradient-to-r from-[#E94E8B] to-[#d43e7a] text-base font-bold text-white shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 overflow-hidden ${
                  isAddingToCart || (product?.stock_quantity ?? 0) === 0
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                } ${cartSuccess ? "bg-gradient-to-r from-green-500 to-emerald-500" : ""}`}
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {isAddingToCart ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Adding...
                    </>
                  ) : cartSuccess ? (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Added to Cart!
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      Add to Cart
                    </>
                  )}
                </span>
                <span className="absolute inset-0 bg-gradient-to-r from-[#d43e7a] to-[#E94E8B] opacity-0 group-hover:opacity-100 transition-opacity duration-200"></span>
              </button>

              {/* Description */}
              <div className="mt-2 border-t pt-4">
                <h3 className="mb-2 text-base font-semibold text-gray-900">
                  Description
                </h3>
                <p className="text-sm leading-relaxed text-gray-600">
                  {shouldTruncate && !isDescriptionExpanded
                    ? truncatedDescription
                    : product?.description}
                </p>
                {shouldTruncate && (
                  <button
                    onClick={() =>
                      setIsDescriptionExpanded(!isDescriptionExpanded)
                    }
                    className="mt-2 text-sm font-medium text-[#E94E8B] transition-colors hover:text-[#d43e7a]"
                  >
                    {isDescriptionExpanded ? "Read Less" : "Read More"}
                  </button>
                )}
              </div>

              {/* Additional Info */}
              <div className="space-y-2 border-t pt-4">
                <h3 className="text-base font-semibold text-gray-900">
                  Product Details
                </h3>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Category</span>
                    <span className="font-medium text-gray-900">
                      {product?.categories?.category_name ?? "--"}
                    </span>
                  </div>
                  {product?.collection && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Collection</span>
                      <span className="font-medium text-gray-900">
                        {product?.collection ?? "--"}
                      </span>
                    </div>
                  )}
                  {product?.tags && Array.isArray(product?.tags) && product?.tags.length > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tags</span>
                      <span className="font-medium text-gray-900">
                        {product.tags.join(", ")}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Weight</span>
                    <span className="font-medium text-gray-900">
                      {product?.weight_grams ?? "--"} grams
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Layout (1366px+) */}
      <div className="hidden xl:block">
        <div className="max-w-7xl mx-auto px-8 py-12">
          <div className="flex flex-row gap-12 relative ">
            {/* Product Images Section */}
            <div className="w-1/2 relative flex flex-row gap-6 h-fit ">
              {/* Thumbnail Images */}
              <div className="flex flex-col gap-4">
                {productDetails[0]?.product_images.map(
                  (img: any, index: any) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`w-24 h-24 rounded-lg overflow-hidden border-2 transition-all ${
                        selectedImage === index
                          ? "border-[#E94E8B] scale-105"
                          : "border-gray-200"
                      }`}
                    >
                      <Image
                        src={img.image_url}
                        alt={`${img.image_url} ${index + 1}`}
                        width={96}
                        height={96}
                        className="object-cover w-full h-full"
                      />
                    </button>
                  )
                )}
              </div>
              {/* Main Image */}
              <div
                className="flex-1 aspect-square bg-gray-100 rounded-2xl overflow-hidden relative cursor-crosshair"
                onMouseMove={handleMouseMove}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                <Image
                  src={productDetails[0]?.product_images[selectedImage]?.image_url}
                  alt={productDetails[0]?.product_images[selectedImage]?.image_url}
                  fill
                  className="object-cover cursor-pointer"
                  priority
                  onClick={() => setProductImageView(true)}
                />
              </div>
            </div>
            {/* Zoom Layer - Outside container to avoid clipping */}
            {showZoom && (
              <div
                className="fixed pointer-events-none w-64 h-64 border-2 border-white shadow-2xl rounded-xl overflow-hidden"
                style={{
                  left: `${mousePosition.x}px`,
                  top: `${mousePosition.y}px`,
                  transform: "translate(-50%, -50%)",
                  zIndex: 9999,
                }}
              >
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundImage: `url(${productDetails[0]?.product_images[selectedImage]?.image_url})`,
                    backgroundSize: "250%",
                    backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
                    backgroundRepeat: "no-repeat",
                  }}
                />
              </div>
            )}

            {/* Product Details Section */}
            <div className="w-1/2 flex flex-col gap-5">
              {/* Product Name */}
              <div className="space-y-2">
                <h1 className="text-4xl font-bold text-gray-900 leading-tight">
                  {productDetails[0]?.product_name}
                </h1>
                
                {/* Rating & Review Count */}
                {reviewCount > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`h-4 w-4 ${
                            i < Math.floor(averageRating)
                              ? "text-yellow-400 fill-yellow-400"
                              : "text-gray-300 fill-gray-300"
                          }`}
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-sm font-semibold text-gray-700">
                      {averageRating.toFixed(1)}
                    </span>
                    <span className="text-xs text-gray-500">
                      ({reviewCount} {reviewCount === 1 ? 'review' : 'reviews'})
                    </span>
                  </div>
                )}
                
                
                {productDetails[0]?.categories?.category_name && (
                  <p className="text-base text-gray-600">
                    {productDetails[0]?.categories?.category_name}
                  </p>
                )}
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-4 flex-wrap">
                <span className="text-5xl font-bold text-gray-900">
                  ₹{productDetails[0]?.final_price}
                </span>
                {productDetails[0]?.base_price && productDetails[0]?.base_price > productDetails[0]?.final_price && (
                  <>
                    <span className="text-2xl text-gray-400 line-through">
                      ₹{productDetails[0]?.base_price}
                    </span>
                    {typeof productDetails[0]?.discount_percentage === "number" && productDetails[0]?.discount_percentage > 0 && (
                      <span className="inline-flex items-center rounded-full bg-gradient-to-r from-green-500 to-emerald-500 px-4 py-2 text-sm font-bold text-white shadow-lg">
                        {productDetails[0]?.discount_percentage}% OFF
                      </span>
                    )}
                  </>
                )}
              </div>

              {/* Stock Status */}
              <div className="flex items-center gap-2.5 bg-gray-50 rounded-lg p-4 border border-gray-100">
                <div className="relative">
                  <div
                    className={`h-3 w-3 rounded-full ${
                      productDetails[0]?.stock_quantity > 0
                        ? "bg-green-500"
                        : "bg-red-500"
                    }`}
                  ></div>
                  {productDetails[0]?.stock_quantity > 0 && (
                    <div className="absolute inset-0 h-3 w-3 rounded-full bg-green-500 animate-ping opacity-75"></div>
                  )}
                </div>
                <span
                  className={`text-base font-semibold ${
                    productDetails[0]?.stock_quantity > 0
                      ? "text-green-700"
                      : "text-red-700"
                  }`}
                >
                  {productDetails[0]?.stock_quantity > 0
                    ? `In Stock • ${productDetails[0]?.stock_quantity} available`
                    : "Out of Stock"}
                </span>
              </div>

              {/* Product Info Cards */}
              <div className="grid grid-cols-3 gap-2.5">
                <div className="rounded-lg bg-gradient-to-br from-pink-50 to-rose-50 p-3 border border-pink-100 shadow-sm hover:shadow-md transition-shadow">
                  <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wide mb-1">Collection</p>
                  <p className="text-xs font-bold text-gray-900">
                    {productDetails[0]?.collection ?? "--"}
                  </p>
                </div>
                <div className="rounded-lg bg-gradient-to-br from-purple-50 to-violet-50 p-3 border border-purple-100 shadow-sm hover:shadow-md transition-shadow">
                  <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wide mb-1">Weight</p>
                  <p className="text-xs font-bold text-gray-900">
                    {productDetails[0]?.weight_grams ?? "--"} <span className="text-[10px] font-normal text-gray-600">grams</span>
                  </p>
                </div>
                <div className="rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 p-3 border border-blue-100 shadow-sm hover:shadow-md transition-shadow">
                  <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wide mb-1">Category</p>
                  <p className="text-xs font-bold text-gray-900">
                    {productDetails[0]?.categories?.category_name ?? "--"}
                  </p>
                </div>
              </div>

              {/* Tags */}
              {productDetails[0]?.tags && Array.isArray(productDetails[0]?.tags) && productDetails[0]?.tags.length > 0 && (
                <div className="flex flex-col gap-3">
                  <span className="text-base font-bold text-gray-900 uppercase tracking-wide">Tags</span>
                  <div className="flex flex-wrap gap-2.5">
                    {productDetails[0].tags.map((tag: string, index: number) => (
                      <span
                        key={index}
                        className="inline-flex items-center rounded-full bg-gradient-to-r from-pink-500 to-rose-500 px-5 py-2 text-sm font-semibold text-white shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Size Selection */}
              {productDetails[0]?.size && productDetails[0]?.size.length > 0 && (
                <div className="flex flex-col gap-3">
                  <span className="text-base font-bold text-gray-900 uppercase tracking-wide">
                    Select Size
                  </span>
                  <div className="flex flex-wrap gap-3">
                    {productDetails[0]?.size.map((size: any, index: any) => (
                      <button
                        key={index}
                        onClick={() => setSelectedSize(index)}
                        className={`relative rounded-xl px-6 py-3 font-semibold text-base transition-all duration-200 transform ${
                          selectedSize === index
                            ? "bg-gradient-to-r from-[#E94E8B] to-[#d43e7a] text-white shadow-lg scale-105 ring-2 ring-[#E94E8B] ring-offset-2"
                            : "bg-white text-gray-700 border-2 border-gray-200 hover:border-[#E94E8B] hover:shadow-md hover:scale-105"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Add to Cart Button */}
              <button
                onClick={handleAddToCart}
                disabled={isAddingToCart || (productDetails[0]?.stock_quantity ?? 0) === 0}
                className={`group relative w-full h-16 text-lg font-bold bg-gradient-to-r from-[#E94E8B] to-[#d43e7a] text-white rounded-xl hover:shadow-2xl transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 overflow-hidden shadow-xl ${
                  isAddingToCart || (productDetails[0]?.stock_quantity ?? 0) === 0
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                } ${cartSuccess ? "bg-gradient-to-r from-green-500 to-emerald-500" : ""}`}
              >
                <span className="relative z-10 flex items-center justify-center gap-3">
                  {isAddingToCart ? (
                    <>
                      <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Adding...
                    </>
                  ) : cartSuccess ? (
                    <>
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Added to Cart!
                    </>
                  ) : (
                    <>
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      Add to Cart
                    </>
                  )}
                </span>
                <span className="absolute inset-0 bg-gradient-to-r from-[#d43e7a] to-[#E94E8B] opacity-0 group-hover:opacity-100 transition-opacity duration-200"></span>
              </button>

              {/* Description */}
              <div className="border-t border-gray-200 pt-6 mt-4">
                <h3 className="text-xl font-bold text-gray-900 uppercase tracking-wide mb-4">
                  Description
                </h3>
                <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                  <p className="text-base leading-relaxed text-gray-700">
                    {shouldTruncate && !isDescriptionExpanded
                      ? truncatedDescription
                      : productDetails[0]?.description}
                  </p>
                </div>
                {shouldTruncate && (
                  <button
                    onClick={() =>
                      setIsDescriptionExpanded(!isDescriptionExpanded)
                    }
                    className="mt-4 inline-flex items-center gap-2 text-base font-semibold text-[#E94E8B] hover:text-[#d43e7a] transition-colors"
                  >
                    {isDescriptionExpanded ? (
                      <>
                        <span>Read Less</span>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                      </>
                    ) : (
                      <>
                        <span>Read More</span>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Full Screen Image Viewer */}
      {productImageView && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-white/70 backdrop-blur-2xl transition-opacity duration-300 ease-in-out supports-[backdrop-filter]:bg-white/40"
          onClick={() => setProductImageView(false)}
        >
          {/* Close Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setProductImageView(false);
            }}
            className="absolute top-4 left-4 sm:top-6 sm:left-2 md:top-8 md:left-8 z-[101] p-2 sm:p-3 hover:bg-gray-900/20 rounded-full transition-all duration-200 hover:scale-110 active:scale-95"
            aria-label="Close image viewer"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
              stroke="currentColor"
              className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-gray-900/50"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          

          {/* Product Image (swipeable on mobile) */}
          <div
            className="relative w-full h-full flex items-center justify-center p-0 sm:p-8 md:p-12 backdrop-blur-3xl bg-white/30 supports-[backdrop-filter]:bg-white/15"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              ref={viewerCarouselRef}
              onScroll={onCarouselScroll(viewerCarouselRef)}
              className="flex h-full w-full overflow-x-auto overflow-y-hidden scrollbar-hide snap-x snap-mandatory scroll-smooth touch-pan-x overscroll-x-contain"
              style={{ WebkitOverflowScrolling: "touch" }}
            >
              {carouselImages.map((img: any, idx: number) => (
                <div
                  key={img?.image_id ?? idx}
                  className="h-full basis-full shrink-0 snap-center flex items-center justify-center"
                >
                  <div className="relative w-full h-full max-w-7xl max-h-[90vh]">
                    <Image
                      src={img?.image_url ?? "/placeholder.png"}
                      alt={img?.image_url || "Product image"}
                      fill
                      className="object-contain"
                      priority={idx === 0}
                      sizes="100vw"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

        
          {/* Thumbnails strip */}
          {Array.isArray(productImages) && productImages.length > 1 && (
            <div
              className="absolute bottom-4 left-0 right-0 z-[101] px-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mx-auto max-w-5xl overflow-x-auto">
                <div className="flex items-center justify-center gap-2 min-w-max py-2">
                  {productImages.map((img: any, idx: number) => (
                    <button
                      key={img?.image_id ?? idx}
                      onClick={() => setSelectedImage(idx)}
                      className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden border-2 transition-all ${
                        idx === selectedImage ? "border-[#E94E8B] scale-105" : "border-gray-200"
                      }`}
                      aria-label={`View image ${idx + 1}`}
                    >
                      <Image
                        src={img.image_url}
                        alt={`Thumbnail ${idx + 1}`}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
