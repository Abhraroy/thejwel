"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { deleteProduct, saveProductImageUrls, deleteProductImage } from "../../../app/(admin)/admin/actions/Product";
import axios from "axios";
import useAdminStore from "../../../zustandStore/AdminZustandStore";

// Icon Components
const EditIcon = ({ className = "w-4 h-4" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={2}
    stroke="currentColor"
    className={className}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M11 5H6a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-5m-1.414-9.414a2 2 0 1 1 2.828 2.828L11.828 15H9v-2.828l8.586-8.586Z"
    />
  </svg>
);

const DeleteIcon = ({ className = "w-4 h-4" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={2}
    stroke="currentColor"
    className={className}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
    />
  </svg>
);

const LeftArrowIcon = ({ className = "w-4 h-4" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={2}
    stroke="currentColor"
    className={className}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15.75 19.5L8.25 12l7.5-7.5"
    />
  </svg>
);

const RightArrowIcon = ({ className = "w-4 h-4" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={2}
    stroke="currentColor"
    className={className}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M8.25 4.5l7.5 7.5-7.5 7.5"
    />
  </svg>
);

interface ProductsListProps {
  products: any[];
  isDarkTheme: boolean;
}

export default function ProductsList({ products, isDarkTheme }: ProductsListProps) {
  const router = useRouter();
  const { setShowAddProduct, setSelectedProduct } = useAdminStore();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [skuQuery, setSkuQuery] = useState("");
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [viewerImages, setViewerImages] = useState<{ id: string; url: string }[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [uploadingProducts, setUploadingProducts] = useState<Set<string>>(new Set());
  const [deletingImageId, setDeletingImageId] = useState<string | null>(null);

  const normalizedSkuQuery = skuQuery.trim().toLowerCase();
  const filteredProducts = normalizedSkuQuery
    ? products.filter((p) =>
        String(p?.sku ?? "")
          .toLowerCase()
          .includes(normalizedSkuQuery)
      )
    : products;

  // When search changes, reset back to page 1 so results don't "disappear" on later pages
  useEffect(() => {
    setCurrentPage(1);
  }, [normalizedSkuQuery]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      }
    }
    return pages;
  };

  // Keyboard navigation for image viewer
  useEffect(() => {
    if (!showImageViewer) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        setCurrentImageIndex(
          currentImageIndex === 0
            ? viewerImages.length - 1
            : currentImageIndex - 1
        );
      } else if (e.key === "ArrowRight") {
        setCurrentImageIndex(
          currentImageIndex === viewerImages.length - 1
            ? 0
            : currentImageIndex + 1
        );
      } else if (e.key === "Escape") {
        setShowImageViewer(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showImageViewer, currentImageIndex, viewerImages.length]);

  const handleEditProduct = (product: any) => {
    // Open the same "Add Product" form in edit mode with prefilled data
    setSelectedProduct(product);
    setShowAddProduct(true);
  };

  const handleDeleteProduct = async (productId: string) => {
    if (confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      try {
        const result = await deleteProduct(productId);
        if (result && result.success) {
          router.refresh();
        } else {
          alert(`Failed to delete product: ${result?.error || 'Unknown error'}`);
        }
      } catch (error) {
        console.error('Delete error:', error);
        alert('An unexpected error occurred while deleting the product.');
      }
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    if (!imageId) {
      alert('Image ID is missing. Cannot delete image.');
      return;
    }

    if (!confirm('Are you sure you want to delete this image? This action cannot be undone.')) {
      return;
    }

    try {
      setDeletingImageId(imageId);
      const result = await deleteProductImage(imageId);
      
      if (result && result.success) {
        // Remove the deleted image from viewerImages
        const updatedImages = viewerImages.filter(img => img.id !== imageId);
        setViewerImages(updatedImages);
        
        // If we deleted the current image, adjust the index
        const deletedIndex = viewerImages.findIndex(img => img.id === imageId);
        if (deletedIndex !== -1) {
          if (updatedImages.length === 0) {
            // No images left, close the modal
            setShowImageViewer(false);
            setViewerImages([]);
            setCurrentImageIndex(0);
          } else if (currentImageIndex >= updatedImages.length) {
            // If we were at the last image, go to the new last image
            setCurrentImageIndex(updatedImages.length - 1);
          } else if (deletedIndex <= currentImageIndex) {
            // If we deleted an image before or at current position, stay at same index (which now points to next image)
            setCurrentImageIndex(Math.max(0, currentImageIndex - 1));
          }
        }
        
        // Refresh the page to update the product list
        router.refresh();
      } else {
        alert(`Failed to delete image: ${result?.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Delete image error:', error);
      alert('An unexpected error occurred while deleting the image.');
    } finally {
      setDeletingImageId(null);
    }
  };

  const handleUploadImages = async (productId: string, files: File[]) => {
    try {
      if (!files || files.length === 0) {
        alert("No files selected");
        return;
      }

      // Set loading state for this product
      setUploadingProducts((prev) => new Set(prev).add(productId));

      // Upload each file using the API route
      const uploadPromises = Array.from(files).map(async (file) => {
        const formDataToSend = new FormData();
        formDataToSend.append("file", file);
        formDataToSend.append("folder", "products/images");

        const response = await axios.post("/admin/api/uploadImage", formDataToSend, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        if (!response.data.success) {
          throw new Error(response.data.error || "Upload failed");
        }

        return response.data;
      });

      const uploadResults = await Promise.all(uploadPromises);
      const imageUrls = uploadResults.map((result) => result.url).filter(Boolean);
      
      if (imageUrls.length === 0) {
        throw new Error("No images were successfully uploaded");
      }

      // Save image URLs to product_images table
      const saveResult = await saveProductImageUrls(productId, imageUrls);
      
      if (!saveResult.success) {
        throw new Error(saveResult.error || "Failed to save image URLs to database");
      }

      alert(`Successfully uploaded ${imageUrls.length} image(s)`);
      router.refresh();
    } catch (error: any) {
      console.error("Error uploading images:", error);
      alert(`Failed to upload images: ${error.response?.data?.error || error.message}`);
    } finally {
      // Remove loading state for this product
      setUploadingProducts((prev) => {
        const next = new Set(prev);
        next.delete(productId);
        return next;
      });
    }
  };

  return (
    <>
      {/* SKU Search */}
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2 w-full sm:max-w-md">
          <input
            value={skuQuery}
            onChange={(e) => setSkuQuery(e.target.value)}
            placeholder="Search by SKU (e.g., NKL-GOLD-001)"
            className={`w-full px-4 py-2 rounded-lg border transition-colors ${
              isDarkTheme
                ? "bg-gray-900 border-gray-700 text-white placeholder-gray-500"
                : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"
            } focus:outline-none focus:ring-2 focus:ring-[#E94E8B]`}
          />
          {skuQuery.trim().length > 0 && (
            <button
              type="button"
              onClick={() => setSkuQuery("")}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isDarkTheme
                  ? "bg-gray-800 hover:bg-gray-700 text-gray-200"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-700"
              }`}
              title="Clear search"
            >
              Clear
            </button>
          )}
        </div>

        <div
          className={`text-sm ${
            isDarkTheme ? "text-gray-400" : "text-gray-600"
          }`}
        >
          Showing <span className="font-semibold">{filteredProducts.length}</span>{" "}
          of <span className="font-semibold">{products.length}</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse min-w-full">
          <thead>
            <tr>
              <th
                className={`text-center py-3 px-4 font-semibold text-sm border whitespace-nowrap ${
                  isDarkTheme
                    ? "border-gray-700 text-gray-300 bg-gray-800"
                    : "border-gray-300 text-gray-700 bg-gray-50"
                }`}
              >
                Product Name
              </th>
              <th
                className={`text-center py-3 px-4 font-semibold text-sm border whitespace-nowrap ${
                  isDarkTheme
                    ? "border-gray-700 text-gray-300 bg-gray-800"
                    : "border-gray-300 text-gray-700 bg-gray-50"
                }`}
              >
                SKU
              </th>
              <th
                className={`text-center py-3 px-4 font-semibold text-sm border whitespace-nowrap ${
                  isDarkTheme
                    ? "border-gray-700 text-gray-300 bg-gray-800"
                    : "border-gray-300 text-gray-700 bg-gray-50"
                }`}
              >
                Category
              </th>
              <th
                className={`text-center py-3 px-4 font-semibold text-sm border whitespace-nowrap ${
                  isDarkTheme
                    ? "border-gray-700 text-gray-300 bg-gray-800"
                    : "border-gray-300 text-gray-700 bg-gray-50"
                }`}
              >
                Sub Category
              </th>
              <th
                className={`text-center py-3 px-4 font-semibold text-sm border whitespace-nowrap ${
                  isDarkTheme
                    ? "border-gray-700 text-gray-300 bg-gray-800"
                    : "border-gray-300 text-gray-700 bg-gray-50"
                }`}
              >
                Base Price
              </th>
              <th
                className={`text-center py-3 px-4 font-semibold text-sm border whitespace-nowrap ${
                  isDarkTheme
                    ? "border-gray-700 text-gray-300 bg-gray-800"
                    : "border-gray-300 text-gray-700 bg-gray-50"
                }`}
              >
                Final Price
              </th>
              <th
                className={`text-center py-3 px-4 font-semibold text-sm border whitespace-nowrap ${
                  isDarkTheme
                    ? "border-gray-700 text-gray-300 bg-gray-800"
                    : "border-gray-300 text-gray-700 bg-gray-50"
                }`}
              >
                Stock Quantity
              </th>
              <th
                className={`text-center py-3 px-4 font-semibold text-sm border whitespace-nowrap ${
                  isDarkTheme
                    ? "border-gray-700 text-gray-300 bg-gray-800"
                    : "border-gray-300 text-gray-700 bg-gray-50"
                }`}
              >
                Description
              </th>
              <th
                className={`text-center py-3 px-4 font-semibold text-sm border whitespace-nowrap ${
                  isDarkTheme
                    ? "border-gray-700 text-gray-300 bg-gray-800"
                    : "border-gray-300 text-gray-700 bg-gray-50"
                }`}
              >
                Weight (grams)
              </th>
              <th
                className={`text-center py-3 px-4 font-semibold text-sm border whitespace-nowrap ${
                  isDarkTheme
                    ? "border-gray-700 text-gray-300 bg-gray-800"
                    : "border-gray-300 text-gray-700 bg-gray-50"
                }`}
              >
                Size
              </th>
              <th
                className={`text-center py-3 px-4 font-semibold text-sm border whitespace-nowrap ${
                  isDarkTheme
                    ? "border-gray-700 text-gray-300 bg-gray-800"
                    : "border-gray-300 text-gray-700 bg-gray-50"
                }`}
              >
                Tags
              </th>
              <th
                className={`text-center py-3 px-4 font-semibold text-sm border whitespace-nowrap ${
                  isDarkTheme
                    ? "border-gray-700 text-gray-300 bg-gray-800"
                    : "border-gray-300 text-gray-700 bg-gray-50"
                }`}
              >
                Occasion
              </th>
              <th
                className={`text-center py-3 px-4 font-semibold text-sm border whitespace-nowrap ${
                  isDarkTheme
                    ? "border-gray-700 text-gray-300 bg-gray-800"
                    : "border-gray-300 text-gray-700 bg-gray-50"
                }`}
              >
                Collection
              </th>
              <th
                className={`text-center py-3 px-4 font-semibold text-sm border whitespace-nowrap ${
                  isDarkTheme
                    ? "border-gray-700 text-gray-300 bg-gray-800"
                    : "border-gray-300 text-gray-700 bg-gray-50"
                }`}
              >
                Listed
              </th>
              <th
                className={`text-center py-3 px-4 font-semibold text-sm border whitespace-nowrap ${
                  isDarkTheme
                    ? "border-gray-700 text-gray-300 bg-gray-800"
                    : "border-gray-300 text-gray-700 bg-gray-50"
                }`}
              >
                Thumbnail Image
              </th>
              <th
                className={`text-center py-3 px-4 font-semibold text-sm border whitespace-nowrap ${
                  isDarkTheme
                    ? "border-gray-700 text-gray-300 bg-gray-800"
                    : "border-gray-300 text-gray-700 bg-gray-50"
                }`}
              >
                More Images
              </th>
              <th
                className={`text-center py-3 px-4 font-semibold text-sm border whitespace-nowrap ${
                  isDarkTheme
                    ? "border-gray-700 text-gray-300 bg-gray-800"
                    : "border-gray-300 text-gray-700 bg-gray-50"
                }`}
              >
                Upload Images
              </th>
              <th
                className={`text-center py-3 px-4 font-semibold text-sm border whitespace-nowrap ${
                  isDarkTheme
                    ? "border-gray-700 text-gray-300 bg-gray-800"
                    : "border-gray-300 text-gray-700 bg-gray-50"
                }`}
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedProducts.length === 0 ? (
              <tr
                className={`border-b ${
                  isDarkTheme ? "border-gray-700" : "border-gray-200"
                }`}
              >
                <td
                  colSpan={18}
                  className={`text-center py-10 px-4 ${
                    isDarkTheme ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  {normalizedSkuQuery
                    ? `No products found for SKU: "${skuQuery.trim()}"`
                    : "No products found."}
                </td>
              </tr>
            ) : (
              paginatedProducts.map((product) => (
                <tr
                  key={product.product_id}
                  className={`border-b ${
                    isDarkTheme
                      ? "border-gray-700 hover:bg-gray-800"
                      : "border-gray-200 hover:bg-gray-50"
                  } transition-colors`}
                >
                <td
                  className={`text-center py-3 px-4 border whitespace-nowrap ${
                    isDarkTheme
                      ? "border-gray-700 text-gray-300"
                      : "border-gray-300 text-gray-900"
                  }`}
                >
                  <Link
                    href={`/admin/${product.product_id}`}
                    className="text-theme-olive hover:text-theme-sage underline-offset-2 hover:underline font-semibold"
                  >
                    {product.product_name}
                  </Link>
                </td>
                <td
                  className={`text-center py-3 px-4 border whitespace-nowrap ${
                    isDarkTheme
                      ? "border-gray-700 text-gray-300"
                      : "border-gray-300 text-gray-900"
                  }`}
                >
                  {product.sku || "—"}
                </td>
                <td
                  className={`text-center py-3 px-4 border whitespace-nowrap ${
                    isDarkTheme
                      ? "border-gray-700 text-gray-300"
                      : "border-gray-300 text-gray-900"
                  }`}
                >
                  {product.categories?.category_name || "—"}
                </td>
                <td
                  className={`text-center py-3 px-4 border whitespace-nowrap ${
                    isDarkTheme
                      ? "border-gray-700 text-gray-300"
                      : "border-gray-300 text-gray-900"
                  }`}
                >
                  {product.sub_categories?.subcategory_name || "—"}
                </td>
                <td
                  className={`text-center py-3 px-4 border whitespace-nowrap ${
                    isDarkTheme
                      ? "border-gray-700 text-gray-300"
                      : "border-gray-300 text-gray-900"
                  }`}
                >
                  ₹{product.base_price}
                </td>
                <td
                  className={`text-center py-3 px-4 border whitespace-nowrap ${
                    isDarkTheme
                      ? "border-gray-700 text-gray-300"
                      : "border-gray-300 text-gray-900"
                  }`}
                >
                  ₹{product.final_price}
                </td>
                <td
                  className={`text-center py-3 px-4 border whitespace-nowrap ${
                    isDarkTheme
                      ? "border-gray-700 text-gray-300"
                      : "border-gray-300 text-gray-900"
                  }`}
                >
                  {product.stock_quantity}
                </td>
                <td
                  className={`text-center py-3 px-4 border ${
                    isDarkTheme
                      ? "border-gray-700 text-gray-300"
                      : "border-gray-300 text-gray-900"
                  }`}
                >
                  <div
                    className="max-w-xs mx-auto truncate"
                    title={product.description || ""}
                  >
                    {product.description || "—"}
                  </div>
                </td>
                <td
                  className={`text-center py-3 px-4 border whitespace-nowrap ${
                    isDarkTheme
                      ? "border-gray-700 text-gray-300"
                      : "border-gray-300 text-gray-900"
                  }`}
                >
                  {product.weight_grams ? `${product.weight_grams}g` : "—"}
                </td>
                <td
                  className={`text-center py-3 px-4 border whitespace-nowrap ${
                    isDarkTheme
                      ? "border-gray-700 text-gray-300"
                      : "border-gray-300 text-gray-900"
                  }`}
                >
                  {product.size && product.size.length > 0 ? (
                    <div className="flex flex-wrap gap-1 justify-center">
                      {product.size.map((size: string, index: number) => (
                        <span
                          key={index}
                          className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                            isDarkTheme
                              ? "bg-gray-700 text-gray-200"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {size}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span
                      className={`text-sm ${
                        isDarkTheme ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      —
                    </span>
                  )}
                </td>
                <td
                  className={`text-center py-3 px-4 border whitespace-nowrap ${
                    isDarkTheme
                      ? "border-gray-700 text-gray-300"
                      : "border-gray-300 text-gray-900"
                  }`}
                >
                  {product.tags && product.tags.length > 0 ? (
                    <div className="flex flex-wrap gap-1 justify-center">
                      {product.tags.map((tag: string, index: number) => (
                        <span
                          key={index}
                          className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                            isDarkTheme
                              ? "bg-gray-700 text-gray-200"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span
                      className={`text-sm ${
                        isDarkTheme ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      —
                    </span>
                  )}
                </td>
                <td
                  className={`text-center py-3 px-4 border whitespace-nowrap ${
                    isDarkTheme
                      ? "border-gray-700 text-gray-300"
                      : "border-gray-300 text-gray-900"
                  }`}
                >
                  {product.occasion ? (
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium capitalize ${
                        isDarkTheme
                          ? "bg-gray-700 text-gray-200"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {product.occasion}
                    </span>
                  ) : (
                    <span
                      className={`text-sm ${
                        isDarkTheme ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      —
                    </span>
                  )}
                </td>
                <td
                  className={`text-center py-3 px-4 border whitespace-nowrap ${
                    isDarkTheme
                      ? "border-gray-700 text-gray-300"
                      : "border-gray-300 text-gray-900"
                  }`}
                >
                  {product.collection ? (
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium capitalize ${
                        isDarkTheme
                          ? "bg-gray-700 text-gray-200"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {product.collection}
                    </span>
                  ) : (
                    <span
                      className={`text-sm ${
                        isDarkTheme ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      —
                    </span>
                  )}
                </td>
                <td
                  className={`text-center py-3 px-4 border whitespace-nowrap ${
                    isDarkTheme
                      ? "border-gray-700 text-gray-300"
                      : "border-gray-300 text-gray-900"
                  }`}
                >
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                      product.listed_status
                        ? isDarkTheme
                          ? "bg-green-900 text-green-200"
                          : "bg-green-100 text-green-700"
                        : isDarkTheme
                        ? "bg-red-900 text-red-200"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {product.listed_status ? "Listed" : "Unlisted"}
                  </span>
                </td>
                <td
                  className={`text-center py-3 px-4 border whitespace-nowrap ${
                    isDarkTheme
                      ? "border-gray-700 text-gray-300"
                      : "border-gray-300 text-gray-900"
                  }`}
                >
                  {product.thumbnail_image ? (
                    <a
                      href={product.thumbnail_image}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`text-blue-500 hover:text-blue-700 underline ${
                        isDarkTheme
                          ? "text-blue-400 hover:text-blue-300"
                          : ""
                      }`}
                    >
                      View Image
                    </a>
                  ) : (
                    <span
                      className={`text-sm ${
                        isDarkTheme ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      No image
                    </span>
                  )}
                </td>
                <td
                  className={`text-center py-3 px-4 border whitespace-nowrap ${
                    isDarkTheme
                      ? "border-gray-700 text-gray-300"
                      : "border-gray-300 text-gray-900"
                  }`}
                >
                  {product.product_images &&
                  product.product_images.length > 0 ? (
                    <button
                      onClick={() => {
                        const imageData = product.product_images.map(
                          (img: any) => ({
                            id: img.image_id || img.id || "",
                            url: img.image_url || img,
                          })
                        );
                        setViewerImages(imageData);
                        setCurrentImageIndex(0);
                        setShowImageViewer(true);
                      }}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        isDarkTheme
                          ? "bg-gray-700 hover:bg-gray-600 text-gray-200"
                          : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                      }`}
                      title={`View ${product.product_images.length} more image(s)`}
                    >
                      View ({product.product_images.length})
                    </button>
                  ) : (
                    <span
                      className={`text-sm ${
                        isDarkTheme ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      No images
                    </span>
                  )}
                </td>
                <td
                  className={`text-center py-3 px-4 border whitespace-nowrap ${
                    isDarkTheme
                      ? "border-gray-700 text-gray-300"
                      : "border-gray-300 text-gray-900"
                  }`}
                >
                  <label
                    htmlFor={`upload-images-${product.product_id}`}
                    className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      uploadingProducts.has(product.product_id)
                        ? "cursor-not-allowed opacity-60"
                        : "cursor-pointer"
                    } ${
                      isDarkTheme
                        ? "bg-[#E94E8B] hover:bg-[#d43d75] text-white"
                        : "bg-[#E94E8B] hover:bg-[#d43d75] text-white"
                    }`}
                  >
                    {uploadingProducts.has(product.product_id) ? (
                      <>
                        <svg
                          className="animate-spin w-4 h-4 mr-1.5"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        Uploading...
                      </>
                    ) : (
                      <>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={2}
                          stroke="currentColor"
                          className="w-4 h-4 mr-1.5"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5m0 0l-4.5-4.5m4.5 4.5l4.5-4.5"
                          />
                        </svg>
                        Upload
                      </>
                    )}
                  </label>
                  <input
                    type="file"
                    id={`upload-images-${product.product_id}`}
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const files = e.target.files;
                      if (files && files.length > 0) {
                        handleUploadImages(
                          product.product_id,
                          Array.from(files)
                        );
                      }
                    }}
                  />
                </td>
                <td
                  className={`text-center py-3 px-4 border whitespace-nowrap ${
                    isDarkTheme
                      ? "border-gray-700 text-gray-300"
                      : "border-gray-300 text-gray-900"
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => handleEditProduct(product)}
                      className={`p-2 rounded-lg transition-colors ${
                        isDarkTheme
                          ? "hover:bg-gray-700 text-gray-300 hover:text-white"
                          : "hover:bg-gray-100 text-gray-600 hover:text-gray-900"
                      }`}
                      title="Edit"
                    >
                      <EditIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(product.product_id)}
                      className={`p-2 rounded-lg transition-colors ${
                        isDarkTheme
                          ? "hover:bg-red-900 text-red-400 hover:text-red-300"
                          : "hover:bg-red-50 text-red-600 hover:text-red-700"
                      }`}
                      title="Delete"
                    >
                      <DeleteIcon className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-end items-center gap-2 mt-4">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`p-2 rounded-lg transition-colors ${
              currentPage === 1
                ? isDarkTheme
                  ? "bg-gray-800 text-gray-600 cursor-not-allowed"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
                : isDarkTheme
                ? "bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white"
                : "bg-gray-200 hover:bg-gray-300 text-gray-700 hover:text-gray-900"
            }`}
            title="Previous page"
          >
            <LeftArrowIcon className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-1">
            {getPageNumbers().map((page, index) => {
              if (page === "...") {
                return (
                  <span
                    key={`ellipsis-${index}`}
                    className={`px-2 py-1 ${
                      isDarkTheme ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    ...
                  </span>
                );
              }
              return (
                <button
                  key={page}
                  onClick={() => handlePageChange(page as number)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    currentPage === page
                      ? isDarkTheme
                        ? "bg-[#E94E8B] text-white"
                        : "bg-[#E94E8B] text-white"
                      : isDarkTheme
                      ? "bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white"
                      : "bg-gray-200 hover:bg-gray-300 text-gray-700 hover:text-gray-900"
                  }`}
                >
                  {page}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`p-2 rounded-lg transition-colors ${
              currentPage === totalPages
                ? isDarkTheme
                  ? "bg-gray-800 text-gray-600 cursor-not-allowed"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
                : isDarkTheme
                ? "bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white"
                : "bg-gray-200 hover:bg-gray-300 text-gray-700 hover:text-gray-900"
            }`}
            title="Next page"
          >
            <RightArrowIcon className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Image Viewer Modal */}
      {showImageViewer && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          onClick={() => setShowImageViewer(false)}
        >
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
          <div
            className={`relative z-10 max-w-7xl w-full mx-4 ${
              isDarkTheme ? "bg-gray-900" : "bg-white"
            } rounded-lg shadow-2xl overflow-hidden`}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className={`flex items-center justify-between p-4 border-b ${
                isDarkTheme ? "border-gray-700" : "border-gray-200"
              }`}
            >
              <h3
                className={`text-lg font-semibold ${
                  isDarkTheme ? "text-white" : "text-gray-900"
                }`}
              >
                Product Images ({currentImageIndex + 1} / {viewerImages.length})
              </h3>
              <button
                onClick={() => setShowImageViewer(false)}
                className={`p-2 rounded-lg transition-colors ${
                  isDarkTheme
                    ? "hover:bg-gray-700 text-gray-300 hover:text-white"
                    : "hover:bg-gray-100 text-gray-600 hover:text-gray-900"
                }`}
                title="Close"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="relative flex items-center justify-center p-8 min-h-[60vh]">
              {viewerImages.length > 1 && (
                <button
                  onClick={() =>
                    setCurrentImageIndex(
                      currentImageIndex === 0
                        ? viewerImages.length - 1
                        : currentImageIndex - 1
                    )
                  }
                  className={`absolute left-4 p-3 rounded-full transition-colors z-10 ${
                    isDarkTheme
                      ? "bg-gray-800 hover:bg-gray-700 text-white"
                      : "bg-white hover:bg-gray-100 text-gray-900 shadow-lg"
                  }`}
                  title="Previous image"
                >
                  <LeftArrowIcon className="w-6 h-6" />
                </button>
              )}

              <div className="relative">
                <img
                  src={viewerImages[currentImageIndex]?.url}
                  alt={`Product image ${currentImageIndex + 1}`}
                  className="max-w-full max-h-[70vh] object-contain rounded-lg"
                />
                {/* Delete Button Overlay */}
                <button
                  onClick={() => {
                    const currentImage = viewerImages[currentImageIndex];
                    if (currentImage?.id) {
                      handleDeleteImage(currentImage.id);
                    }
                  }}
                  disabled={deletingImageId === viewerImages[currentImageIndex]?.id}
                  className={`absolute top-4 right-4 p-2.5 rounded-lg transition-colors z-10 ${
                    deletingImageId === viewerImages[currentImageIndex]?.id
                      ? "cursor-not-allowed opacity-60"
                      : "cursor-pointer"
                  } ${
                    isDarkTheme
                      ? "bg-red-900 hover:bg-red-800 text-red-200 hover:text-red-100"
                      : "bg-red-600 hover:bg-red-700 text-white shadow-lg"
                  }`}
                  title="Delete this image"
                >
                  {deletingImageId === viewerImages[currentImageIndex]?.id ? (
                    <svg
                      className="animate-spin w-5 h-5"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                  ) : (
                    <DeleteIcon className="w-5 h-5" />
                  )}
                </button>
              </div>

              {viewerImages.length > 1 && (
                <button
                  onClick={() =>
                    setCurrentImageIndex(
                      currentImageIndex === viewerImages.length - 1
                        ? 0
                        : currentImageIndex + 1
                    )
                  }
                  className={`absolute right-4 p-3 rounded-full transition-colors z-10 ${
                    isDarkTheme
                      ? "bg-gray-800 hover:bg-gray-700 text-white"
                      : "bg-white hover:bg-gray-100 text-gray-900 shadow-lg"
                  }`}
                  title="Next image"
                >
                  <RightArrowIcon className="w-6 h-6" />
                </button>
              )}
            </div>

            {viewerImages.length > 1 && (
              <div
                className={`p-4 border-t ${
                  isDarkTheme ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-gray-50"
                }`}
              >
                <div className="flex items-center justify-center gap-2 overflow-x-auto">
                  {viewerImages.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`shrink-0 transition-all ${
                        currentImageIndex === index
                          ? "ring-2 ring-[#E94E8B]"
                          : "opacity-60 hover:opacity-100"
                      }`}
                    >
                      <img
                        src={image.url}
                        alt={`Thumbnail ${index + 1}`}
                        className="w-16 h-16 object-cover rounded-lg border-2 border-transparent"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {viewerImages.length > 1 && (
              <div
                className={`px-4 py-2 text-center text-xs ${
                  isDarkTheme ? "text-gray-400" : "text-gray-500"
                }`}
              >
                Use arrow keys to navigate • Click outside to close
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
