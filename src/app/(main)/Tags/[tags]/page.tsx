"use client";

import { useState, useEffect, useMemo } from "react";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductUI/ProductCard";
import { useParams } from "next/navigation";
import { createClient } from "@/app/utils/supabase/client";

// Tag display names mapping
const tagDisplayNames: Record<string, string> = {
  "new-arrivals": "New Arrivals",
  "best-sellers": "Best Sellers",
  "featured": "Featured",
  "trending": "Trending",
  "sale": "On Sale",
  "limited-edition": "Limited Edition",
};

export default function TagsPage() {
  const supabase = createClient();
  const params = useParams();
  const tag = params?.tags as string;
  const decodedTag = decodeURIComponent(tag || "");

  const [selectedSort, setSelectedSort] = useState<string>("featured");
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [products, setProducts] = useState<any>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Sort options
  const sortOptions = [
    { value: "featured", label: "Featured" },
    { value: "price-low", label: "Price: Low to High" },
    { value: "price-high", label: "Price: High to Low" },
    { value: "newest", label: "Newest First" },
  ];

  // Get display name for the tag
  const displayName = tagDisplayNames[decodedTag] || 
    decodedTag.split("-").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");

  useEffect(() => {
    console.log("decodedTag", decodedTag);
    const getProducts = async () => {
      setLoading(true);

      try {
        const { data, error }: any = await supabase
          .from("products")
          .select(`
            *,
            product_images(*)
          `)
          .contains("tags", [decodedTag])
          .eq("listed_status", true)
          .order("updated_at", { ascending: false });

        if (error) {
          console.log("error", error);
          setProducts([]);
        } else {
          console.log("products", data);
          setProducts(data);
        }
      } catch (err) {
        console.log("error", err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    getProducts();
  }, [decodedTag]);

  const sortedProducts = useMemo(() => {
    let sorted = [...products];

    switch (selectedSort) {
      case "price-low":
        sorted.sort((a, b) => a.final_price - b.final_price);
        break;
      case "price-high":
        sorted.sort((a, b) => b.final_price - a.final_price);
        break;
      case "newest":
        sorted.sort(
          (a, b) =>
            new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        );
        break;
      case "featured":
      default:
        break;
    }

    return sorted;
  }, [selectedSort, products]);

  if (loading) {
    return (
      <div className="min-h-screen bg-theme-cream">
        <div className="bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 md:pt-8 pb-4">
            <div className="flex items-center justify-between gap-4 animate-pulse">
              <div className="flex-1 min-w-0 space-y-2">
                <div className="h-8 w-1/3 bg-gray-200 rounded" />
                <div className="h-4 w-1/4 bg-gray-200 rounded" />
              </div>
              <div className="h-10 w-28 bg-gray-200 rounded-lg" />
            </div>
          </div>
        </div>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {Array.from({ length: 8 }).map((_, idx) => (
              <ProductCard key={idx} product={{}} isLoading />
            ))}
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-theme-cream">
      <main className="w-full">
        {/* Header with Title and Dropdown */}
        <div className="bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 md:pt-8 pb-4">
            <div className="flex items-center justify-between gap-4">
              {/* Heading */}
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900">
                  {displayName}
                </h1>
                <p className="text-gray-500 text-sm mt-1">
                  {sortedProducts.length} products available
                </p>
              </div>

              {/* Dropdown - Right Corner */}
              <div className="shrink-0 relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 px-3 md:px-4 py-2 text-sm font-medium text-theme-olive bg-white border border-theme-sage/30 rounded-lg hover:border-theme-olive hover:text-theme-sage transition-all"
                >
                  <span className="hidden md:inline">
                    {sortOptions.find((opt) => opt.value === selectedSort)
                      ?.label || "Sort"}
                  </span>
                  <span className="md:hidden">Sort</span>
                  <svg
                    className={`w-4 h-4 transition-transform ${
                      isDropdownOpen ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setIsDropdownOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                      <div className="py-1">
                        {sortOptions.map((option) => (
                          <button
                            key={option.value}
                            onClick={() => {
                              setSelectedSort(option.value);
                              setIsDropdownOpen(false);
                            }}
                            className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                              selectedSort === option.value
                                ? "bg-theme-sage text-white"
                                : "text-theme-olive hover:bg-theme-cream"
                            }`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          {/* Product Count */}
          <div className="mb-6">
            <p className="text-gray-600 text-sm">
              Showing{" "}
              <span className="font-semibold text-gray-900">
                {sortedProducts.length}
              </span>{" "}
              products
            </p>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {sortedProducts.map((product: any, index: number) => {
              return <ProductCard key={index} product={product} />;
            })}
          </div>

          {/* No Products Message */}
          {sortedProducts.length === 0 && (
            <div className="text-center py-16">
              <p className="text-gray-500 text-lg">
                No products found with this tag.
              </p>
            </div>
          )}

          {/* Load More Button */}
          {sortedProducts.length > 0 && (
            <div className="mt-12 text-center">
              <button className="px-8 py-3 bg-white text-theme-olive font-semibold rounded-lg border-2 border-theme-sage/30 hover:border-theme-olive hover:text-theme-sage transition-all">
                Load More Products
              </button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

