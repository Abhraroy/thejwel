"use client"
import ProductDisplay from '@/components/ProductUI/ProductDisplay';
import ProductReview from '@/components/ProductUI/ProductReview';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';

const ProductPageSkeleton = () => {
  return (
    <div className="min-h-screen bg-theme-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-pulse">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          <div className="space-y-4">
            <div className="w-full aspect-square bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl" />
            <div className="grid grid-cols-4 gap-3">
              {Array.from({ length: 4 }).map((_, idx) => (
                <div key={idx} className="h-20 bg-gray-100 rounded-xl" />
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="h-8 w-3/4 bg-gray-200 rounded" />
            <div className="h-5 w-1/2 bg-gray-200 rounded" />
            <div className="h-20 bg-gray-100 rounded-lg" />

            <div className="flex gap-3">
              <div className="h-10 w-28 bg-gray-200 rounded-full" />
              <div className="h-10 w-16 bg-gray-200 rounded-full" />
            </div>

            <div className="space-y-3 pt-2 border-t border-gray-100">
              <div className="h-4 w-24 bg-gray-200 rounded" />
              <div className="grid grid-cols-2 gap-3">
                {Array.from({ length: 4 }).map((_, idx) => (
                  <div key={idx} className="h-10 bg-gray-100 rounded-md" />
                ))}
              </div>
              <div className="h-12 bg-gray-200 rounded-lg" />
            </div>
          </div>
        </div>

        <div className="mt-12">
          <div className="h-6 w-40 bg-gray-200 rounded mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 2 }).map((_, idx) => (
              <div
                key={idx}
                className="space-y-3 bg-white rounded-xl border border-gray-100 p-4 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-200" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 w-1/2 bg-gray-200 rounded" />
                    <div className="h-3 w-1/3 bg-gray-200 rounded" />
                  </div>
                </div>
                <div className="h-3 w-full bg-gray-100 rounded" />
                <div className="h-3 w-3/4 bg-gray-100 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};


export default function ProductPage() {
  const params = useParams();
  const product_id = params?.product_id as string;
  const [productDetails, setProductDetails] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();
  
  useEffect(() => {
    if (!product_id) {
      setError("Product ID is missing");
      setLoading(false);
      return;
    }

    const getProductdetails = async () => {
      try {
        const { data, error: productError } = await supabase
          .from("products")
          .select(`
            *,
            product_images!product_images_product_id_fkey(*),
            reviews(*),
            categories(*)
          `)
          .eq("product_id", product_id)
          .eq("listed_status", true)
          .single();
        
        if (productError) {
          console.error("Error fetching product:", productError);
          setError("Failed to load product. Please try again.");
          setProductDetails(null);
        } else if (data) {
          console.log("product details", data);
          console.log("Available fields:", Object.keys(data));
          console.log("tags:", data.tags);
          console.log("collection:", data.collection);
          console.log("metal_type:", data.metal_type);
          
          // If no product images, use thumbnail_image as fallback
          if (!data.product_images || data.product_images.length === 0) {
            if (data.thumbnail_image) {
              data.product_images = [{
                image_url: data.thumbnail_image,
                product_id: data.product_id
              }];
            }
          }
          
          // Wrap in array since ProductDisplay expects an array
          setProductDetails([data]);
          setError(null);
        } else {
          setError("Product not found");
          setProductDetails(null);
        }
      } catch (err) {
        console.error("Error fetching product:", err);
        setError("An error occurred while loading the product");
        setProductDetails(null);
      } finally {
        setLoading(false);
      }
    };

    const reviewData = async () => {
      if (!product_id) return;
      
      try {
        const { data: reviewData, error: reviewError } = await supabase
          .from("reviews")
          .select(`
            *,
            review_images(*),
            users(*)  
          `)
          .eq("product_id", product_id);
        
        if (reviewError) {
          console.error("Error fetching reviews:", reviewError);
          setReviews([]);
        } else {
          console.log("reviews data", reviewData);
          setReviews(reviewData || []);
        }
      } catch (err) {
        console.error("Error fetching reviews:", err);
        setReviews([]);
      }
    };

    setLoading(true);
    getProductdetails();
    reviewData();
  }, [product_id]);



  if (loading) {
    return (
      <ProductPageSkeleton />
    );
  }

  if (error || !productDetails) {
    return (
      <div className="min-h-screen bg-theme-cream flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-16 h-16 text-gray-400 mx-auto mb-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
            />
          </svg>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h2>
          <p className="text-gray-600 mb-6">{error || "The product you're looking for doesn't exist."}</p>
          <a
            href="/"
            className="inline-block px-6 py-3 bg-theme-sage hover:bg-theme-olive text-white font-medium rounded-lg transition-colors duration-200"
          >
            Back to Home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-theme-cream flex flex-col">
      {productDetails && Array.isArray(productDetails) && productDetails.length > 0 && (
        <ProductDisplay productDetails={productDetails} />
      )}

      {reviews && Array.isArray(reviews) && product_id && (
        <ProductReview reviews={reviews} />
      )}
    </div>
  );
}
