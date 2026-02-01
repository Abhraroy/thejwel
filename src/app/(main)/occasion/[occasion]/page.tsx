"use client";

import { useState, useEffect, useMemo } from "react";
import Navbar from "@/components/NavbarUI/Navbar";
import Footer from "@/components/Footer";
import ProductCard, {
  // Product as ProductCardProduct,
} from "@/components/ProductUI/ProductCard";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { createClient } from "@/app/utils/supabase/client";

// Product interface
interface Product {
  id: string;
  title: string;
  imageUrl: string;
  price: number;
  originalPrice: number;
  slug: string;
  category: string;
}

// Category filter interface
interface CategoryFilter {
  id: string;
  label: string;
  value: string;
  imageUrl: string;
}

export default function OccasionPage() {
  const supabase = createClient();
  const params = useParams();
  const occasion = params?.occasion as string;
  const decodedOccasion = decodeURIComponent(occasion || "");

  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedSort, setSelectedSort] = useState<string>("featured");
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [products, setProducts] = useState<any>([]);
  // Sample categories based on the collection
  const categories: CategoryFilter[] = [
    {
      id: "all",
      label: "All Products",
      value: "all",
      imageUrl:
        "https://www.onlinepng.com/cdn/shop/files/CH-928725-1.jpg?v=1719396928",
    },
    {
      id: "hallmark",
      label: "Hallmark",
      value: "hallmark",
      imageUrl:
        "https://www.onlinepng.com/cdn/shop/files/CH-928725-1.jpg?v=1719396928",
    },
    {
      id: "american",
      label: "American Diamond",
      value: "american",
      imageUrl:
        "https://www.onlinepng.com/cdn/shop/files/CH-928725-1.jpg?v=1719396928",
    },
    {
      id: "gold-plated",
      label: "Gold Plated",
      value: "gold-plated",
      imageUrl:
        "https://gurupujan.com/cdn/shop/files/Artificial_Gold_Chain_1_Gram_Gold_Plated_20_Inch_for_boys_and_men_offering_a_stylish_affordable_accessory_for_any_occasion.1.png?v=1756272428",
    },
    {
      id: "silver",
      label: "Silver",
      value: "silver",
      imageUrl:
        "https://www.onlinepng.com/cdn/shop/files/CH-928725-1.jpg?v=1719396928",
    },
    {
      id: "oxidized",
      label: "Oxidized",
      value: "oxidized",
      imageUrl:
        "https://www.onlinepng.com/cdn/shop/files/CH-928725-1.jpg?v=1719396928",
    },
  ];

  // Sort options
  const sortOptions = [
    { value: "featured", label: "Featured" },
    { value: "price-low", label: "Price: Low to High" },
    { value: "price-high", label: "Price: High to Low" },
    { value: "newest", label: "Newest First" },
  ];

  // Sample products - In real app, fetch based on collectionid
  const allProducts: Product[] = [
    {
      id: "1",
      title: "Hallmark Gold Plated Necklace with Earrings Set",
      imageUrl:
        "https://www.onlinepng.com/cdn/shop/files/CH-928725-1.jpg?v=1719396928",
      price: 549.0,
      originalPrice: 899.0,
      slug: "hallmark-gold-necklace-earrings",
      category: "hallmark",
    },
    {
      id: "2",
      title: "American Diamond Studded Earrings",
      imageUrl:
        "https://www.onlinepng.com/cdn/shop/files/CH-928725-1.jpg?v=1719396928",
      price: 699.0,
      originalPrice: 999.0,
      slug: "american-diamond-earrings",
      category: "american",
    },
    {
      id: "3",
      title: "Gold Plated Chain for Men 20 Inch",
      imageUrl:
        "https://gurupujan.com/cdn/shop/files/Artificial_Gold_Chain_1_Gram_Gold_Plated_20_Inch_for_boys_and_men_offering_a_stylish_affordable_accessory_for_any_occasion.1.png?v=1756272428",
      price: 299.0,
      originalPrice: 499.0,
      slug: "gold-plated-chain-20-inch",
      category: "gold-plated",
    },
    {
      id: "4",
      title: "Silver Plated Necklace Set with Stones",
      imageUrl:
        "https://www.onlinepng.com/cdn/shop/files/CH-928725-1.jpg?v=1719396928",
      price: 799.0,
      originalPrice: 1299.0,
      slug: "silver-necklace-set",
      category: "silver",
    },
    {
      id: "5",
      title: "Oxidized Jhumka Earrings Traditional",
      imageUrl:
        "https://www.onlinepng.com/cdn/shop/files/CH-928725-1.jpg?v=1719396928",
      price: 399.0,
      originalPrice: 699.0,
      slug: "oxidized-jhumka-earrings",
      category: "oxidized",
    },
    {
      id: "6",
      title: "Hallmark Pendant with Chain Set",
      imageUrl:
        "https://www.onlinepng.com/cdn/shop/files/CH-928725-1.jpg?v=1719396928",
      price: 649.0,
      originalPrice: 999.0,
      slug: "hallmark-pendant-chain",
      category: "hallmark",
    },
    {
      id: "7",
      title: "American Diamond Necklace Set",
      imageUrl:
        "https://www.onlinepng.com/cdn/shop/files/CH-928725-1.jpg?v=1719396928",
      price: 849.0,
      originalPrice: 1399.0,
      slug: "american-diamond-necklace",
      category: "american",
    },
    {
      id: "8",
      title: "Premium Gold Chain 22 Inch for Men",
      imageUrl:
        "https://gurupujan.com/cdn/shop/files/Artificial_Gold_Chain_1_Gram_Gold_Plated_20_Inch_for_boys_and_men_offering_a_stylish_affordable_accessory_for_any_occasion.1.png?v=1756272428",
      price: 399.0,
      originalPrice: 599.0,
      slug: "premium-gold-chain-22-inch",
      category: "gold-plated",
    },
    {
      id: "9",
      title: "Silver Stone Studded Ring Set",
      imageUrl:
        "https://www.onlinepng.com/cdn/shop/files/CH-928725-1.jpg?v=1719396928",
      price: 499.0,
      originalPrice: 799.0,
      slug: "silver-stone-ring-set",
      category: "silver",
    },
    {
      id: "10",
      title: "Oxidized Choker Necklace Traditional",
      imageUrl:
        "https://www.onlinepng.com/cdn/shop/files/CH-928725-1.jpg?v=1719396928",
      price: 549.0,
      originalPrice: 899.0,
      slug: "oxidized-choker-necklace",
      category: "oxidized",
    },
    {
      id: "11",
      title: "Hallmark Bangle Set for Women",
      imageUrl:
        "https://www.onlinepng.com/cdn/shop/files/CH-928725-1.jpg?v=1719396928",
      price: 749.0,
      originalPrice: 1199.0,
      slug: "hallmark-bangle-set",
      category: "hallmark",
    },
    {
      id: "12",
      title: "Classic Gold Chain 24 Inch",
      imageUrl:
        "https://gurupujan.com/cdn/shop/files/Artificial_Gold_Chain_1_Gram_Gold_Plated_20_Inch_for_boys_and_men_offering_a_stylish_affordable_accessory_for_any_occasion.1.png?v=1756272428",
      price: 449.0,
      originalPrice: 749.0,
      slug: "classic-gold-chain-24-inch",
      category: "gold-plated",
    },
  ];

  // Filter products
  const filteredProducts = allProducts.filter(
    (product) =>
      selectedCategory === "all" || product.category === selectedCategory
  );

  

  // Wishlist toggle
  const toggleWishlist = (productId: string) => {
    setWishlist((prev) => {
      const newWishlist = new Set(prev);
      if (newWishlist.has(productId)) {
        newWishlist.delete(productId);
      } else {
        newWishlist.add(productId);
      }
      return newWishlist;
    });
  };


  useEffect(()=>{
    console.log("decodedOccasion",decodedOccasion)
    const getProducts = async()=>{
      const {data,error}:any = await supabase.from("products")
      .select(`
      *,
      product_images(*)
      `)
      .filter("occasion", "eq", decodedOccasion)
      .eq("listed_status", true)
      .order("updated_at", { ascending: false })
      if(error){
        console.log("error",error)
      }
      else{
        console.log("products",data)
        setProducts(data);
      }
    }
    getProducts();
  },[decodedOccasion])

  const sortedProducts = useMemo(() => {
    // SORT
    let sorted = [...products];
  
    switch (selectedSort) {
      case "price-low":
        sorted.sort((a, b) => a.final_price - b.final_price);
        break;
  
      case "price-high":
        sorted.sort((a, b) => b.final_price - a.final_price);
        break;
  
      case "newest":
        sorted.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
        break;
      case "featured":
        break;
      default:
        break;
    }
  
    return sorted;
  }, [ selectedSort, products]);


  

  console.log("sortedProducts",sortedProducts)

  return (
    <div className="min-h-screen bg-theme-cream">
      {/* <Navbar cartCount={0} /> */}

      <main className="w-full">
        {/* Header with Title and Dropdown */}
        <div className="bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 md:pt-8 pb-4">
            <div className="flex items-center justify-between gap-4">
              {/* Heading */}
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900">
                  {decodedOccasion.charAt(0).toUpperCase() +
                    decodedOccasion.slice(1)}
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

        {/* Category Images Section - Below Heading */}
        <div className="bg-white border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-6">
            <div className="overflow-x-auto scrollbar-hide">
              <div className="flex gap-3 md:gap-4 pb-2 pt-2 min-w-max md:min-w-0 md:justify-center md:flex-wrap">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.value)}
                    className={`flex flex-col items-center group shrink-0 w-16 md:w-20 transition-all ${
                      selectedCategory === category.value
                        ? "opacity-100"
                        : "opacity-70 hover:opacity-100"
                    }`}
                  >
                    {/* Circular Image Container */}
                    <div
                      className={`relative w-14 h-14 md:w-16 md:h-16 rounded-full overflow-hidden bg-white transition-all duration-300 mb-1.5 md:mb-2 shadow-sm group-hover:shadow-md ${
                        selectedCategory === category.value
                          ? "ring-2 ring-theme-olive ring-offset-0"
                          : "ring-2 ring-theme-sage/30 group-hover:ring-theme-sage ring-offset-0"
                      }`}
                    >
                      <Image
                        src={category.imageUrl}
                        alt={category.label}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-300"
                        sizes="(max-width: 768px) 56px, 64px"
                      />
                    </div>

                    {/* Category Name */}
                    <span
                      className={`text-[10px] md:text-xs font-medium text-center transition-colors duration-200 leading-tight ${
                        selectedCategory === category.value
                          ? "text-theme-olive font-semibold"
                          : "text-theme-sage group-hover:text-theme-olive"
                      }`}
                    >
                      {category.label}
                    </span>
                  </button>
                ))}
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
            {sortedProducts.map((product:any,index:number) => {
              // Map to ProductCard format
             
              return (
                <ProductCard
                  key={index}
                  product={product}
                />
              );
            })}
          </div>

          {/* No Products Message */}
          {sortedProducts.length === 0 && (
            <div className="text-center py-16">
              <p className="text-gray-500 text-lg">
                No products found in this category.
              </p>
            </div>
          )}

          {/* Load More Button */}
          {sortedProducts.length > 0 && (
            <div className="mt-12 text-center">
              <button className="px-8 py-3 bg-white text-theme-olive font-semibold rounded-lg border-2 border-theme-sage/30 hover:border-theme-olive hover:text-theme-sage transition-all"
              >
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
