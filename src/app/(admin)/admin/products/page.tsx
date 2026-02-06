
import ProductHeader from "@/components/AdminComponents/product/ProductHeader";
import ProductsList from "@/components/AdminComponents/product/ProductsList";
import ProductForm from "@/components/AdminComponents/product/Products";
import { getProducts } from "./action";


export default async function ProductsPage() {
  const isDarkTheme = false;

  const { success, data: productsData, message } = await getProducts();

  if (!success) {
    return <div>Error fetching products: {message}</div>;
  }

  return (
    <div className="p-6">
      <ProductHeader isDarkTheme={isDarkTheme} />
      <ProductForm isDarkTheme={isDarkTheme} />
      <div
        className={`${
          isDarkTheme ? 'bg-black border border-gray-700' : 'bg-white'
        } rounded-lg shadow p-6`}
      >
        <h2 className={`text-xl font-semibold mb-2 ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>
          Products ({productsData?.length || 0})
        </h2>
        <p className={`text-sm mb-4 ${isDarkTheme ? 'text-gray-400' : 'text-gray-600'}`}>
          Manage your jewelry products.
        </p>

        {productsData?.length === 0 ? (
          <div className={`text-center py-12 ${isDarkTheme ? 'text-gray-400' : 'text-gray-500'}`}>
            No products added yet. Click &quot;Add Product&quot; to create your first product.
          </div>
        ) : (
          <ProductsList products={productsData || []} isDarkTheme={isDarkTheme} />
        )}
      </div>
    </div>
  );
}
