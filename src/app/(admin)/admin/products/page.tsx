import supabase from "@/lib/supabase/admin";
import ProductHeader from "@/components/AdminComponents/product/ProductHeader";
import ProductsList from "@/components/AdminComponents/product/ProductsList";
import ProductForm from "@/components/AdminComponents/product/Products";


export default async function ProductsPage() {
  const isDarkTheme = false;

  const { data: productsData, error } = await supabase
    .from('products')
    .select('*, categories(*), sub_categories(*), product_images(*)')
    // Use a stable deterministic order so items don't "jump pages" when many rows share the same created_at
    .order('created_at', { ascending: false })
    .order('product_id', { ascending: false });

  if (error) {
    console.error('Error fetching products:', error);
    return <div>Error fetching products: {error.message}</div>;
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
          Products ({productsData.length})
        </h2>
        <p className={`text-sm mb-4 ${isDarkTheme ? 'text-gray-400' : 'text-gray-600'}`}>
          Manage your jewelry products.
        </p>

        {productsData.length === 0 ? (
          <div className={`text-center py-12 ${isDarkTheme ? 'text-gray-400' : 'text-gray-500'}`}>
            No products added yet. Click &quot;Add Product&quot; to create your first product.
          </div>
        ) : (
          <ProductsList products={productsData} isDarkTheme={isDarkTheme} />
        )}
      </div>
    </div>
  );
}
